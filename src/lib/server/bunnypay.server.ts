export type CashinResult =
  | { ok: true; id: string; pix: string; value: number }
  | { ok: false; status: number; error: string };

export async function createCashin(input: {
  nome: string;
  cpf: string;
  valor: number;
  descricao: string;
  postback?: string;
  device: "android" | "ios" | "web";
}): Promise<CashinResult> {
  const apiKey = process.env["BUNNYPAY_API_KEY"];
  if (!apiKey) return { ok: false, status: 503, error: "BUNNYPAY_API_KEY não configurada" };

  const res = await fetch("https://app.bunnypaybr.com/api/v1/cashin", {
    method: "POST",
    headers: { "Content-Type": "application/json", Apikey: apiKey },
    body: JSON.stringify(input),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* resposta não-JSON */
  }
  if (!res.ok || typeof data["id"] !== "string" || typeof data["pix"] !== "string") {
    console.error("[BunnyPay] cashin falhou", res.status, text.slice(0, 300));
    return { ok: false, status: res.status, error: `BunnyPay respondeu ${res.status}` };
  }
  return { ok: true, id: data["id"] as string, pix: data["pix"] as string, value: Number(data["value"]) };
}
