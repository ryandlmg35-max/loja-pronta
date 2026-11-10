import { mpPaymentSchema, verifiedPaymentState, type MpOrder } from "@/lib/mercadopago";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function requestMpPayment(key: string, id: string) {
  if (!/^\d{1,30}$/.test(id)) throw new Error("invalid_payment_id");
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("payment_lookup_failed");
  return mpPaymentSchema.parse(await response.json());
}

// Neither browser state nor notification payloads prove payment. Read the provider directly.
export async function synchronizeMpOrder(admin: SupabaseClient<Database>, order: MpOrder, key: string) {
  if (!order.mp_payment_id) throw new Error("missing_payment_id");
  const payment = await requestMpPayment(key, order.mp_payment_id);
  const status = verifiedPaymentState(payment, order);
  if (!status) throw new Error("payment_order_mismatch");
  if (status === "pago" && order.status === "cancelado") return "cancelado";
  if (status !== order.status) {
    if (order.status !== "pendente" && order.status !== "pago" && order.status !== "cancelado") throw new Error("invalid_order_status");
    const { error } = await admin.from("pedidos").update({
      status,
      ...(status === "pago" ? { pago_em: payment.date_approved ?? new Date().toISOString() } : {}),
    }).eq("id", order.id).eq("mp_payment_id", order.mp_payment_id).eq("status", order.status);
    if (error) throw new Error("order_update_failed");
  }
  return status;
}