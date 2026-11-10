import { z } from "zod";
import { STORE } from "@/data/store";

export const paymentInput = z.object({ email: z.string().trim().email().max(254) });

export function paymentBody(email: string, orderId: string, notificationUrl?: string) {
  return {
    transaction_amount: STORE.price,
    currency_id: "BRL",
    payment_method_id: "pix",
    description: STORE.productName,
    payer: { email },
    external_reference: orderId,
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  };
}

export const mpPaymentSchema = z.object({
  id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  status: z.string(),
  transaction_amount: z.number().finite(),
  currency_id: z.string(),
  payment_method_id: z.string(),
  external_reference: z.string().nullable().optional(),
  date_approved: z.string().nullable().optional(),
  transaction_amount_refunded: z.number().optional(),
  point_of_interaction: z.object({
    transaction_data: z.object({ qr_code: z.string().optional() }).optional(),
  }).optional(),
});
export type MpPayment = z.infer<typeof mpPaymentSchema>;
export type MpOrder = { id: string; mp_payment_id: string | null; valor_total: number; status: string };

export function verifiedPaymentState(payment: MpPayment, order: MpOrder): "pago" | "pendente" | "cancelado" | null {
  if (String(payment.id) !== order.mp_payment_id || payment.external_reference !== order.id ||
    payment.currency_id !== "BRL" || payment.payment_method_id !== "pix" ||
    Math.round(payment.transaction_amount * 100) !== Math.round(order.valor_total * 100)) return null;
  if ((payment.transaction_amount_refunded ?? 0) > 0) return "cancelado";
  if (payment.status === "approved") return "pago";
  if (["cancelled", "rejected", "refunded", "charged_back"].includes(payment.status)) return "cancelado";
  return "pendente";
}