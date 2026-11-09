import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";
import { txidFromOrderId } from "@/lib/pix";

type OrderRow = {
  id: string;
  status: string;
  valor_total: number;
  criado_em: string;
  txid: string;
};

function adminToken(): string | undefined {
  return process.env["ADMIN_TOKEN"];
}

function isAuthorized(request: Request): boolean {
  const expected = adminToken();
  if (!expected) return false;
  const token = request.headers.get("x-admin-token");
  return token !== null && token === expected;
}

export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      GET: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);
        if (!adminToken()) {
          return json(
            { ok: false, error: "admin_token_missing", hint: "Defina ADMIN_TOKEN nos Secrets do Lovable." },
            503,
          );
        }
        if (!isAuthorized(request)) return json({ ok: false, error: "unauthorized" }, 401);

        const admin = await getAdminClient();
        if (!admin) return json({ ok: false, error: "service_role_unavailable" }, 503);

        const { data, error } = await admin
          .from("pedidos")
          .select("id, status, valor_total, criado_em")
          .order("criado_em", { ascending: false })
          .limit(50);

        if (error) return json({ ok: false, error: error.message }, 500);

        const orders: OrderRow[] = (data ?? []).map((row) => ({
          id: row.id as string,
          status: row.status as string,
          valor_total: Number(row.valor_total),
          criado_em: row.criado_em as string,
          txid: txidFromOrderId(row.id as string),
        }));

        return json({ ok: true, orders });
      },

      POST: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);
        if (!adminToken()) {
          return json(
            { ok: false, error: "admin_token_missing", hint: "Defina ADMIN_TOKEN nos Secrets do Lovable." },
            503,
          );
        }
        if (!isAuthorized(request)) return json({ ok: false, error: "unauthorized" }, 401);

        const admin = await getAdminClient();
        if (!admin) return json({ ok: false, error: "service_role_unavailable" }, 503);

        let body: { orderId?: string; status?: string };
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const orderId = body.orderId?.trim();
        const status = body.status?.trim();
        if (!orderId) return json({ ok: false, error: "missing_order_id" }, 400);
        if (status !== "pago" && status !== "pendente" && status !== "cancelado") {
          return json({ ok: false, error: "invalid_status" }, 400);
        }

        const { error } = await admin.from("pedidos").update({ status }).eq("id", orderId);
        if (error) return json({ ok: false, error: error.message }, 500);

        return json({ ok: true, message: `Pedido ${txidFromOrderId(orderId)} -> ${status}` });
      },
    },
  },
});