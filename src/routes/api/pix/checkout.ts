import { createFileRoute } from "@tanstack/react-router";
import { generatePixPayload, generateQrSvg } from "@/lib/pix";
import { STORE } from "@/data/store";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

type CheckoutResponse =
  | { ok: true; txid: string; payload: string; qrSvg: string; valor: number; expiraEm: number }
  | { ok: false; error: string };

export const Route = createFileRoute("/api/pix/checkout")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const admin = await getAdminClient();
        if (!admin) {
          return json({ ok: false, error: "service_role_unavailable" }, 503);
        }

        const merchantName = STORE.name.slice(0, 25);
        const merchantCity = "BRASILIA";
        const amount = STORE.price;
        const key = STORE.pixKey;

        const { payload, txid, valor, expiraEm } = generatePixPayload(key, merchantName, merchantCity, amount);
        const qrSvg = await generateQrSvg(payload);

        const { error: orderError } = await admin
          .from("pedidos")
          .insert({
            usuario_id: crypto.randomUUID(),
            valor_total: valor,
            status: "pendente",
          })
          .select("id")
          .single();

        if (orderError) {
          console.error("Order insert failed:", orderError);
        }

        return json({ ok: true, txid, payload, qrSvg, valor, expiraEm });
      },
    },
  },
});