import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";
import { validateWebhookSignature } from "@/lib/server/mercadopago";
import { mpPayment } from "@/lib/server/mercadopago";

export const Route = createFileRoute("/api/pix/webhook")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        // Webhook do MP não tem origin — valida pela assinatura (se configurado)
        const rawBody = await request.text();
        const signature = request.headers.get("x-signature") ?? request.headers.get("x-mp-signature") ?? "";

        if (!validateWebhookSignature(rawBody, signature)) {
          return json({ ok: false, error: "invalid_signature" }, 401);
        }

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        // Estrutura do webhook MP: { type: "payment", data: { id: "12345" } }
        const type = (payload as { type?: string })?.type;
        const mpPaymentId = (payload as { data?: { id?: string } })?.data?.id;

        if (type !== "payment" || !mpPaymentId) {
          return json({ ok: true, ignored: true });
        }

        // Busca detalhes do pagamento no MP para confirmar status
        if (!mpPayment) {
          return json({ ok: false, error: "mp_not_configured" }, 500);
        }

        let paymentDetail;
        try {
          paymentDetail = await mpPayment.get({ id: mpPaymentId });
        } catch (e) {
          console.error("Erro ao buscar pagamento MP:", e);
          return json({ ok: false, error: "mp_get_failed" }, 500);
        }

        const status = paymentDetail.status; // approved, pending, rejected, cancelled, refunded
        const externalReference = paymentDetail.external_reference;
        const mpId = paymentDetail.id?.toString() ?? mpPaymentId.toString();

        if (!externalReference) {
          console.warn("Webhook MP sem external_reference:", mpId);
          return json({ ok: true, ignored: true });
        }

        // Atualiza pedido no banco via external_reference (que é o orderId)
        const admin = await getAdminClient();
        if (!admin) {
          return json({ ok: false, error: "service_role_unavailable" }, 503);
        }

        const newStatus = status === "approved" ? "pago" : status === "rejected" || status === "cancelled" ? "cancelado" : "pendente";

        const { error } = await admin
          .from("pedidos")
          .update({ status: newStatus, mp_payment_id: mpId })
          .eq("id", externalReference);

        if (error) {
          console.error("Erro ao atualizar pedido:", error);
          return json({ ok: false, error: "db_update_failed" }, 500);
        }

        console.log(`[Webhook MP] Pedido ${externalReference} -> ${newStatus} (MP: ${mpId})`);
        return json({ ok: true, status: newStatus, orderId: externalReference });
      },
    },
  },
});