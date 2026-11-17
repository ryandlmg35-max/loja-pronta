import { createFileRoute } from "@tanstack/react-router";
import { safeEqual } from "@/lib/bunnypay";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

const MESSAGES: Record<string, string> = {
  pendente: "⏳ Pagamento ainda não confirmado. Se já pagou, aguarde alguns instantes.",
  pago: "✅ Pagamento confirmado!",
  cancelado: "❌ Pedido cancelado.",
};

export const Route = createFileRoute("/api/orders/status")({
  server: {
    handlers: {
      GET: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);
        const url = new URL(request.url);
        const orderId = url.searchParams.get("orderId") ?? "";
        const token = url.searchParams.get("token") ?? "";
        if (!/^[0-9a-f-]{36}$/i.test(orderId) || !token) return json({ ok: false, error: "invalid" }, 400);

        const admin = await getAdminClient();
        if (!admin) return json({ ok: false, error: "unavailable" }, 503);

        const { data: order } = await admin
          .from("pedidos")
          .select("id, status, acesso_token, mp_payment_id, valor_total")
          .eq("id", orderId)
          .maybeSingle();
        if (!order?.acesso_token || !safeEqual(order.acesso_token, token)) {
          return json({ ok: false, error: "pedido_nao_encontrado" }, 404);
        }

        let status = order.status;
        if (order.mp_payment_id) {
          const key = process.env["MERCADOPAGO_ACCESS_TOKEN"];
          if (!key) return json({ ok: false, error: "Confirmação indisponível. Tente novamente." }, 503);
          try {
            const { synchronizeMpOrder } = await import("@/lib/server/mercadopago.server");
            status = await synchronizeMpOrder(admin, order, key);
          } catch {
            return json({ ok: false, error: "Não foi possível confirmar agora. Tente novamente." }, 503);
          }
        }
        const defaultLink = "https://precious-trifle-63d82d.netlify.app/";
        const link = status === "pago" ? (process.env["PRIVATE_ACCESS_LINK"] || defaultLink) : null;
        return Response.json({ ok: true, status, message: MESSAGES[status] ?? "", link }, { headers: { "Cache-Control": "no-store, private" } });
      },
    },
  },
});
