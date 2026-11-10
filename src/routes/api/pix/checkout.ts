import { createFileRoute } from "@tanstack/react-router";
import { generatePixPayload, generateQrSvg, txidFromOrderId } from "@/lib/pix";
import { STORE } from "@/data/store";
import { PIX_KEY } from "@/lib/server/pix-key.server";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

type CheckoutResponse =
  | {
      ok: true;
      orderId: string | null;
      txid: string;
      payload: string;
      qrSvg: string;
      valor: number;
      expiraEm: number;
      tracked: boolean;
    }
  | { ok: false; error: string };

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
          console.warn("SUPABASE_SERVICE_ROLE_KEY ausente: PIX gerado sem rastreamento de pedido.");
        }

        const txid = orderId
          ? txidFromOrderId(orderId)
          : `OD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`.slice(0, 25);

        const { payload, valor, expiraEm } = generatePixPayload(
          PIX_KEY,
          STORE.name,
          STORE.merchantCity,
          amount,
          txid,
        );
        const qrSvg = await generateQrSvg(payload);

        return json({
          ok: true,
          orderId,
          txid,
          payload,
          qrSvg,
          valor,
          expiraEm,
          tracked: orderId !== null,
        });
      },
    },
  },
});