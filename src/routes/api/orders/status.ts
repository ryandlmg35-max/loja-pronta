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
          .select("status, acesso_token")
          .eq("id", orderId)
          .maybeSingle();
        if (!order?.acesso_token || !safeEqual(order.acesso_token, token)) {
          return json({ ok: false, error: "pedido_nao_encontrado" }, 404);
        }

        const link = order.status === "pago" ? (process.env["PRIVATE_ACCESS_LINK"] ?? null) : null;
        return json({ ok: true, status: order.status, message: MESSAGES[order.status] ?? "", link });
      },
    },
  },
});
