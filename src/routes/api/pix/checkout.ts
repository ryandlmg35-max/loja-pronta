import { createFileRoute } from "@tanstack/react-router";
import { STORE } from "@/data/store";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";
import { createPixCharge } from "@/lib/server/bunnypay";

type CheckoutResponse =
  | {
      ok: true;
      orderId: string | null;
      bunnyPayId: string | null;
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

        // Cria cobrança PIX no BunnyPay
        const externalReference = orderId ?? `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const origin = new URL(request.url).origin;

        const chargeResult = await createPixCharge({
          amount: amount,
          description: STORE.productName,
          external_id: externalReference,
          webhook_url: `${origin}/api/pix/webhook`,
          expiration: 1800, // 30 min
        });

        if (!chargeResult.success || !chargeResult.transaction) {
          console.error("[BunnyPay] Falha ao criar cobrança:", chargeResult.error);
          return json({ ok: false, error: "bunnypay_create_failed", hint: chargeResult.error }, 500);
        }

        const transaction = chargeResult.transaction;
        const bunnyPayId = transaction.id;
        const qrCodeBase64 = transaction.qr_code_base64;
        const qrCode = transaction.pix_copia_cola;
        const expiresAt = transaction.expires_at ? new Date(transaction.expires_at).getTime() : Date.now() + 1800_000;

        // Salva bunnyPayId no pedido se tiver orderId
        if (orderId && bunnyPayId && admin) {
          await admin.from("pedidos").update({ mp_payment_id: bunnyPayId }).eq("id", orderId);
        }

        return json({
          ok: true,
          orderId,
          bunnyPayId,
          qrCodeBase64,
          qrCode,
          valor: amount,
          expiraEm: Math.ceil((expiresAt - Date.now()) / 1000),
          tracked: orderId !== null,
        });
      },
    },
  },
});