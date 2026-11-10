import { createFileRoute } from "@tanstack/react-router";
import { txidFromOrderId } from "@/lib/pix";
import { STORE } from "@/data/store";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";
import { mpPayment } from "@/lib/server/mercadopago";

type CheckoutResponse =
  | {
      ok: true;
      orderId: string | null;
      mpPaymentId: string | null;
      qrCodeBase64: string;
      qrCode: string; // copia e cola
      valor: number;
      expiraEm: number;
      tracked: boolean;
    }
  | { ok: false; error: string; hint?: string };

export const Route = createFileRoute("/api/pix/checkout")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const amount = STORE.price;
        const admin = await getAdminClient();

        let orderId: string | null = null;

        if (admin) {
          const { data: existing } = await admin
            .from("produtos")
            .select("id")
            .eq("nome", STORE.productName)
            .maybeSingle();

          let productId = existing?.id as string | undefined;
          if (!productId) {
            const { data: created } = await admin
              .from("produtos")
              .insert({
                nome: STORE.productName,
                descricao: STORE.productDescription,
                preco: amount,
                imagem_url: STORE.coverImage,
                estoque: 999,
              })
              .select("id")
              .single();
            productId = created?.id as string | undefined;
          }

          const { data: order, error: orderError } = await admin
            .from("pedidos")
            .insert({
              usuario_id: crypto.randomUUID(),
              status: "pendente",
              valor_total: amount,
            })
            .select("id")
            .single();

          if (orderError || !order) {
            console.error("pedidos insert failed:", orderError?.message);
          } else {
            orderId = order.id as string;

            if (productId) {
              const { error: itemError } = await admin.from("pedido_itens").insert({
                pedido_id: orderId,
                produto_id: productId,
                quantidade: 1,
                preco_unitario: amount,
              });

              if (itemError) {
                await admin.from("pedidos").delete().eq("id", orderId);
                orderId = null;
              }
            }
          }
        } else {
          console.warn("SUPABASE_SERVICE_ROLE_KEY ausente: criando PIX sem rastreamento.");
        }

        // Se não tem Mercado Pago configurado, fallback pro PIX estático (dev)
        if (!mpPayment) {
          console.warn("Mercado Pago não configurado — fallback PIX estático");
          const { generatePixPayload, generateQrSvg } = await import("@/lib/pix");
          const { PIX_KEY } = await import("@/lib/server/pix-key.server");
          const txid = orderId
            ? txidFromOrderId(orderId)
            : `OD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`.slice(0, 25);
          const { payload, valor, expiraEm } = generatePixPayload(PIX_KEY, STORE.name, STORE.merchantCity, amount, txid);
          const qrSvg = await generateQrSvg(payload);
          return json({
            ok: true,
            orderId,
            mpPaymentId: null,
            qrCodeBase64: "",
            qrCode: payload,
            valor,
            expiraEm,
            tracked: orderId !== null,
          });
        }

        // Cria cobrança PIX no Mercado Pago
        const externalReference = orderId ?? `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const payerEmail = "cliente@exemplo.com"; // MP exige, mas não usamos para nada

        try {
          const payment = await mpPayment.create({
            body: {
              transaction_amount: amount,
              description: STORE.productName,
              payment_method_id: "pix",
              payer: { email: payerEmail },
              external_reference: externalReference,
              notification_url: `${new URL(request.url).origin}/api/pix/webhook`,
            },
          });

          const mpPaymentId = payment.id?.toString() ?? null;
          const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64 ?? "";
          const qrCode = payment.point_of_interaction?.transaction_data?.qr_code ?? "";
          const expiresAt = payment.date_of_expiration ? new Date(payment.date_of_expiration).getTime() : Date.now() + 3600_000;

          // Salva mp_payment_id no pedido se tiver orderId
          if (orderId && mpPaymentId && admin) {
            await admin.from("pedidos").update({ mp_payment_id: mpPaymentId }).eq("id", orderId);
          }

          return json({
            ok: true,
            orderId,
            mpPaymentId,
            qrCodeBase64,
            qrCode,
            valor: amount,
            expiraEm: Math.ceil((expiresAt - Date.now()) / 1000),
            tracked: orderId !== null,
          });
        } catch (e) {
          console.error("Erro ao criar PIX no Mercado Pago:", e);
          return json(
            { ok: false, error: "mp_create_failed", hint: e instanceof Error ? e.message : "Erro desconhecido" },
            500,
          );
        }
      },
    },
  },
});