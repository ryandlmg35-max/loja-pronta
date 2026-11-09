import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

type StatusResponse =
  | { ok: true; status: "pendente" | "pago" | "cancelado"; message: string }
  | { ok: false; error: string };

export const Route = createFileRoute("/api/orders/status")({
  server: {
    handlers: {
      GET: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const admin = await getAdminClient();
        if (!admin) {
          return json({ ok: false, error: "service_role_unavailable" }, 503);
        }

        const url = new URL(request.url);
        const txid = url.searchParams.get("txid");
        if (!txid) return json({ ok: false, error: "missing_txid" }, 400);

        const { data: order, error } = await admin
          .from("pedidos")
          .select("status")
          .eq("id", txid)
          .single();

        if (error || !order) {
          return json({ ok: false, error: "order_not_found" }, 404);
        }

        const messages: Record<string, string> = {
          pendente: "⏳ Pagamento pendente. Se já pagou, aguarde alguns instantes e tente novamente.",
          pago: "✅ Pagamento confirmado! O acesso será enviado no seu Telegram.",
          cancelado: "❌ Pedido cancelado.",
        };

        return json({ ok: true, status: order.status as "pendente" | "pago" | "cancelado", message: messages[order.status] ?? "" });
      },
    },
  },
});