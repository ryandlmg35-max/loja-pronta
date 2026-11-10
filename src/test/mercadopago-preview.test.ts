import { describe, expect, it } from "vitest";
import { previewPaymentBody, previewPaymentInput } from "@/lib/mercadopago-preview";

describe("Mercado Pago preview probe", () => {
  it("sends email without CPF or name", () => {
    expect(previewPaymentBody("comprador@example.com").payer).toEqual({ email: "comprador@example.com" });
  });
  it("uses the R$ 19,90 store price", () => {
    expect(previewPaymentBody("comprador@example.com").transaction_amount).toBe(19.9);
  });
  it("requires a valid email", () => {
    expect(previewPaymentInput.safeParse({ email: "" }).success).toBe(false);
    expect(previewPaymentInput.safeParse({ email: "comprador@example.com" }).success).toBe(true);
  });
});