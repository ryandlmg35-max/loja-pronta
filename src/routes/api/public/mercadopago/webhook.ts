import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdminClient, json } from "@/lib/server/admin-client";

const Notification = z.object({
  type: z.string().max(60).optional(),
  data: z.object({ id: z.union([z.string().regex(/^\d{1,30}$/), z.number().int().positive()]) }).optional(),
});

export const Route = createFileRoute("/api/public/mercadopago/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Notification.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ ok: false }, 400);
        if (parsed.data.type !== "payment" || !parsed.data.data) return json({ ok: true });
        const id = String(parsed.data.data.id);
        const key = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!key) return json({ ok: false }, 503);
        // Treat notifications only as hints. Authenticate by fetching the payment
        // from Mercado Pago using the merchant token; never trust payload status/amount.
        const admin = await getAdminClient();
        if (!admin) return json({ ok: false }, 503);
        const { data: order, error } = await admin.from("pedidos")
          .select("id, status, valor_total, mp_payment_id").eq("mp_payment_id", id).maybeSingle();
        if (error) return json({ ok: false }, 503);
        if (!order) return json({ ok: true });
        try {
          const { synchronizeMpOrder } = await import("@/lib/server/mercadopago.server");
          await synchronizeMpOrder(admin, order, key);
          return json({ ok: true });
        } catch {
          return json({ ok: false }, 503);
        }
      },
    },
  },
});