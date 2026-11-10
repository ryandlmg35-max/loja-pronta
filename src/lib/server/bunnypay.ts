/**
 * Cliente BunnyPay (NexusPag) server-side.
 * NUNCA importe este arquivo no browser — só em rotas server-side.
 */
const BUNNYPAY_API_KEY = process.env["BUNNYPAY_API_KEY"];
const BUNNYPAY_WEBHOOK_SECRET = process.env["BUNNYPAY_WEBHOOK_SECRET"];
const BUNNYPAY_BASE_URL = "https://nexuspag.com";

if (!BUNNYPAY_API_KEY) {
  console.warn("[BunnyPay] API_KEY não configurado — integração desabilitada");
}

interface CreateChargeRequest {
  amount: number;
  description: string;
  external_id: string;
  webhook_url: string;
  expiration?: number;
}

interface CreateChargeResponse {
  success: boolean;
  transaction?: {
    id: string;
    txid: string;
    external_id: string | null;
    amount: number;
    fee: number;
    fee_percent: number;
    net_amount: number;
    status: string;
    pix_copia_cola: string;
    qr_code_base64: string;
    expires_at: string;
  };
  error?: string;
}

interface WebhookPayload {
  event: string;
  data: {
    id: string;
    external_id: string;
    status: string; // pending, paid, expired, failed
    amount: number;
    paid_at?: string;
    txid?: string;
  };
}

export async function createPixCharge(request: CreateChargeRequest): Promise<CreateChargeResponse> {
  if (!BUNNYPAY_API_KEY) {
    return { success: false, error: "BunnyPay não configurado" };
  }

  const url = `${BUNNYPAY_BASE_URL}/api/pix/create`;
  const body = {
    amount: request.amount,
    description: request.description,
    external_id: request.external_id,
    webhook_url: request.webhook_url,
    expiration: request.expiration ?? 1800,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": BUNNYPAY_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("[BunnyPay] Erro ao criar cobrança:", data);
      return { success: false, error: data.error ?? "Erro ao criar cobrança" };
    }

    return { success: true, transaction: data.transaction };
  } catch (e) {
    console.error("[BunnyPay] Erro de rede:", e);
    return { success: false, error: e instanceof Error ? e.message : "Erro de rede" };
  }
}

export function validateWebhookSignature(payload: string, signature: string | null): boolean {
  if (!BUNNYPAY_WEBHOOK_SECRET || !signature) return true; // se não tem secret, aceita (dev)
  // TODO: implementar validação HMAC-SHA256 se o BunnyPay enviar assinatura
  return true;
}

export const BUNNYPAY_CONFIG = {
  apiKey: BUNNYPAY_API_KEY,
  webhookSecret: BUNNYPAY_WEBHOOK_SECRET,
  baseUrl: BUNNYPAY_BASE_URL,
};