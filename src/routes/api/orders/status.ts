import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

type StatusResponse =
  | { ok: true; status: "pendente" | "pago" | "cancelado"; message: string }
  | { ok: false; error: string };

const MESSAGES: Record<string, string> = {
  pendente: "⏳ Pagamento pendente. Se já pagou, aguarde alguns instantes e clique novamente em \"Consultar pagamento\".",
  pago: "✅ Pagamento confirmado! O acesso será enviado no seu Telegram.",
  cancelado: "❌ Pedido cancelado.",
};

export const Route = createFileRoute("/api/orders/status")({
  server: {
    handlers: {
      GET: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const admin = await getAdminClient();
        if (!admin) return json({ ok: false, error: "service_role_unavailable" }, 503);

        const url = new URL(request.url);
        const orderId = url.searchParams.get("orderId");
        if (!orderId) return json({ ok: false, error: "missing_order_id" }, 400);

        const { data: order, error } = await admin
          .from("pedidos")
          .select("id, status, valor_total")
          .eq("id", orderId)
          .maybeSingle();

        if (error) return json({ ok: false, error: error.message }, 500);
        if (!order) return json({ ok: false, error: "pedido_nao_encontrado" }, 404);

        const status = order.status as "pendente" | "pago" | "cancelado";
        return json({ ok: true, status, message: MESSAGES[status] ?? "" });
      },
    },
  },
});