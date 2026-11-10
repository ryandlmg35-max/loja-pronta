import { describe, expect, it } from "vitest";
import { generateQrSvg } from "@/lib/pix";
import { evaluatePostback, isValidCpf, safeEqual } from "@/lib/bunnypay";

const order = { status: "pendente", valor_total: 24.9 };
const paid = { event: "transaction.paid", status: "PAID", transaction_id: "tx1", amount: 18.5 };

describe("BunnyPay checkout", () => {
  it("aceita CPF válido e recusa inválido", () => {
    expect(isValidCpf("111.444.777-35")).toBe(true);
    expect(isValidCpf("11144477736")).toBe(false);
    expect(isValidCpf("11111111111")).toBe(false);
  });
  it("marca pago com valor líquido até o total do pedido", () => {
    expect(evaluatePostback(paid, order)).toEqual({ action: "mark_paid" });
    expect(evaluatePostback({ ...paid, amount: 24.9 }, order)).toEqual({ action: "mark_paid" });
  });
  it("recusa valor acima do pedido ou zero", () => {
    expect(evaluatePostback({ ...paid, amount: 50 }, order).action).toBe("ignore");
    expect(evaluatePostback({ ...paid, amount: 0 }, order).action).toBe("ignore");
  });
  it("recusa evento/status errado e pedido desconhecido", () => {
    expect(evaluatePostback({ ...paid, status: "PENDING" }, order).action).toBe("ignore");
    expect(evaluatePostback({ ...paid, event: "x" }, order).action).toBe("ignore");
    expect(evaluatePostback(paid, null).action).toBe("ignore");
  });
  it("postback repetido não reprocessa pedido já pago", () => {
    expect(evaluatePostback(paid, { status: "pago", valor_total: 24.9 })).toEqual({ action: "ignore", reason: "ja_processado" });
  });
  it("token do postback precisa ser idêntico", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
  });
  it("gera QR Code SVG a partir do copia e cola", async () => {
    expect((await generateQrSvg("00020126test")).startsWith("<svg")).toBe(true);
  });
});
