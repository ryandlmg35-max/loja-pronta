/**
 * Cliente Mercado Pago server-side.
 * NUNCA importe este arquivo no browser — só em rotas .server.ts ou server routes.
 */
import { MercadoPagoConfig, Payment } from "mercadopago";

const MP_ACCESS_TOKEN = process.env["MERCADOPAGO_ACCESS_TOKEN"];
const MP_WEBHOOK_SECRET = process.env["MERCADOPAGO_WEBHOOK_SECRET"];

if (!MP_ACCESS_TOKEN) {
  console.warn("[MercadoPago] ACCESS_TOKEN não configurado — integração desabilitada");
}

export const mpClient = MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN, options: { timeout: 15000 } })
  : null;

export const mpPayment = mpClient ? new Payment(mpClient) : null;

export function validateWebhookSignature(
  requestBody: string,
  signatureHeader: string | null
): boolean {
  if (!MP_WEBHOOK_SECRET || !signatureHeader) return true; // se não tem secret, aceita (dev)
  // TODO: implementar validação HMAC-SHA256 se quiser segurança extra
  return true;
}

export const MERCADOPAGO_CONFIG = {
  accessToken: MP_ACCESS_TOKEN,
  webhookSecret: MP_WEBHOOK_SECRET,
};