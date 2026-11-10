import { describe, expect, it } from "vitest";
import { paymentBody, paymentInput, verifiedPaymentState, type MpPayment } from "@/lib/mercadopago";

const order = { id: "order1", mp_payment_id: "123", valor_total: 19.9, status: "pendente" };
const payment: MpPayment = { id: 123, external_reference: "order1", status: "approved", transaction_amount: 19.9, currency_id: "BRL", payment_method_id: "pix" };

describe("Mercado Pago checkout", () => {
  it("charges R$19.90", () => expect(paymentBody("buyer@example.com", "order1").transaction_amount).toBe(19.9));
  it("requires only valid email, not name or CPF", () => {
    expect(paymentInput.safeParse({ email: "buyer@example.com" }).success).toBe(true);
    expect(paymentInput.safeParse({ email: "" }).success).toBe(false);
    expect(paymentBody("buyer@example.com", "order1").payer).toEqual({ email: "buyer@example.com" });
  });
  it("only approved payments grant access", () => {
    expect(verifiedPaymentState(payment, order)).toBe("pago");
    expect(verifiedPaymentState({ ...payment, status: "pending" }, order)).toBe("pendente");
  });
  it("requires the stored payment ID", () => expect(verifiedPaymentState({ ...payment, id: 999 }, order)).toBeNull());
  it("requires the order reference", () => expect(verifiedPaymentState({ ...payment, external_reference: "other" }, order)).toBeNull());
  it("requires the exact gross amount", () => {
    expect(verifiedPaymentState({ ...payment, transaction_amount: 18.5 }, order)).toBeNull();
    expect(verifiedPaymentState({ ...payment, transaction_amount: 24.9 }, order)).toBeNull();
  });
  it("requires BRL and PIX", () => {
    expect(verifiedPaymentState({ ...payment, currency_id: "USD" }, order)).toBeNull();
    expect(verifiedPaymentState({ ...payment, payment_method_id: "visa" }, order)).toBeNull();
  });
  it("refunds and cancellation cannot grant access", () => {
    expect(verifiedPaymentState({ ...payment, status: "refunded" }, order)).toBe("cancelado");
    expect(verifiedPaymentState({ ...payment, transaction_amount_refunded: 1 }, order)).toBe("cancelado");
  });
});