import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";
import { validateWebhookSignature } from "@/lib/server/bunnypay";

export const Route = createFileRoute("/api/pix/webhook")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        // Webhook do BunnyPay - valida assinatura se configurado
        const rawBody = await request.text();
        const signature = request.headers.get("x-signature") ?? request.headers.get("x-webhook-signature") ?? "";

        if (!validateWebhookSignature(rawBody, signature)) {
          return json({ ok: false, error: "invalid_signature" }, 401);
        }

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        // Estrutura do webhook BunnyPay (baseado no padrão NexusPag):
        // { event: "charge.paid", data: { id, external_id, status, amount, paid_at, txid } }
        const event = (payload as { event?: string })?.event;
        const data = (payload as { data?: Record<string, unknown> })?.data;

        if (!event || !data) {
          return json({ ok: true, ignored: true });
        }

        const bunnyPayId = (data as { id?: string })?.id;
        const externalReference = (data as { external_id?: string })?.external_id;
        const status = (data as { status?: string })?.status; // pending, paid, expired, failed

        if (!bunnyPayId || !externalReference) {
          console.warn("[Webhook BunnyPay] Payload sem id/external_id:", data);
          return json({ ok: true, ignored: true });
        }

        // Mapeia status do BunnyPay pro nosso banco
        const newStatus = status === "paid" ? "pago" : status === "expired" || status === "failed" ? "cancelado" : "pendente";

        // Atualiza pedido no banco via external_reference (que é o orderId)
        const admin = await getAdminClient();
        if (!admin) {
          return json({ ok: false, error: "service_role_unavailable" }, 503);
        }

        const { error } = await admin
          .from("pedidos")
          .update({ status: newStatus, mp_payment_id: bunnyPayId })
          .eq("id", externalReference);

        if (error) {
          console.error("Erro ao atualizar pedido:", error);
          return json({ ok: false, error: "db_update_failed" }, 500);
        }

        console.log(`[Webhook BunnyPay] Pedido ${externalReference} -> ${newStatus} (BunnyPay: ${bunnyPayId})`);
        return json({ ok: true, status: newStatus, orderId: externalReference });
      },
    },
  },
});