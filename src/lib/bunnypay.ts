/** Regras puras do checkout BunnyPay (sem segredos; testáveis). */

export function onlyDigits(v: string): string {
  return v.replace(/\D/g, "");
}

export function isValidCpf(input: string): boolean {
  const cpf = onlyDigits(input);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export type PostbackBody = {
  event?: unknown;
  transaction_id?: unknown;
  status?: unknown;
  amount?: unknown;
};

export type PostbackDecision =
  | { action: "mark_paid" }
  | { action: "ignore"; reason: string };

/**
 * Decide se um postback pode marcar o pedido como pago.
 * `amount` é o valor LÍQUIDO (após taxas), então precisa ser > 0 e <= valor do pedido.
 */
export function evaluatePostback(
  body: PostbackBody,
  order: { status: string; valor_total: number } | null,
): PostbackDecision {
  if (body.event !== "transaction.paid") return { action: "ignore", reason: "evento_nao_suportado" };
  if (body.status !== "PAID") return { action: "ignore", reason: "status_nao_pago" };
  if (typeof body.transaction_id !== "string" || !body.transaction_id) {
    return { action: "ignore", reason: "transaction_id_invalido" };
  }
  if (!order) return { action: "ignore", reason: "pedido_nao_encontrado" };
  if (order.status !== "pendente") return { action: "ignore", reason: "ja_processado" };
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > Number(order.valor_total) + 0.001) {
    return { action: "ignore", reason: "valor_invalido" };
  }
  return { action: "mark_paid" };
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
