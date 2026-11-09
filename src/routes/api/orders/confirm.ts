import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

type ConfirmResponse = { ok: boolean; error?: string; message?: string };

export const Route = createFileRoute("/api/orders/confirm")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const admin = await getAdminClient();
        if (!admin) return json({ ok: false, error: "service_role_unavailable" }, 503);

        const token = request.headers.get("x-admin-token");
        const expected = process.env.ADMIN_TOKEN;
        if (!expected || token !== expected) return json({ ok: false, error: "unauthorized" }, 401);

        let body: { orderId: string };
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const { error } = await admin
          .from("pedidos")
          .update({ status: "pago" })
          .eq("id", body.orderId);

        if (error) return json({ ok: false, error: error.message }, 400);

        return json({ ok: true, message: "Pedido marcado como pago" });
      },
    },
  },
});