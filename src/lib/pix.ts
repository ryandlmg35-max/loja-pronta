const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TXID_LEN = 25;

/**
 * txid do Pix = base36 do uuid do pedido (128 bits cabem em 25 chars alfanumericos).
 * Reversivel: o mesmo txid que aparece no extrato do banco devolve o pedido.
 */
export function txidFromOrderId(id: string): string {
  const hex = id.replace(/-/g, "");
  let n = BigInt(`0x${hex}`);
  let out = "";
  while (n > 0n) {
    out = BASE36[Number(n % 36n)] + out;
    n /= 36n;
  }
  return out.padStart(TXID_LEN, "0");
}

/** Converte o txid de volta para o uuid do pedido; null quando nao e um txid nosso. */
export function orderIdFromTxid(txid: string): string | null {
  const t = txid.trim().toUpperCase();
  if (!new RegExp(`^[0-9A-Z]{${TXID_LEN}}$`).test(t)) return null;
  let n = 0n;
  for (const ch of t) {
    const v = BASE36.indexOf(ch);
    if (v < 0) return null;
    n = n * 36n + BigInt(v);
  }
  const hex = n.toString(16).toUpperCase().padStart(32, "0");
  if (hex.length !== 32) return null;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function generateQrSvg(payload: string): Promise<string> {
  const { renderSVG } = await import('uqr');
  return renderSVG(payload, {
    ecc: 'M',
    border: 2,
    pixelSize: 4,
    blackColor: '#000000',
    whiteColor: '#ffffff',
  });
}