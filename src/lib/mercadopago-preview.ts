import { z } from "zod";
import { STORE } from "@/data/store";

export const previewPaymentInput = z.object({ email: z.string().trim().email() });

export function previewPaymentBody(email: string) {
  return {
    transaction_amount: STORE.price,
    payment_method_id: "pix",
    description: `${STORE.productName} — teste de geração, não pagar`,
    payer: { email },
  };
}