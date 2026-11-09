export interface PixPayload {
  payload: string;
  txid: string;
  qrSvg: string;
  valor: number;
  expiraEm: number;
}

function crc16Ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function buildPixPayload(
  key: string,
  merchantName: string,
  merchantCity: string,
  amount: number,
  txid: string
): string {
  const payloadFormat = buildField('00', '01');
  const merchantAccountInfo = buildField(
    '26',
    buildField('00', 'br.gov.bcb.pix') + buildField('01', key)
  );
  const mcc = buildField('52', '0000');
  const currency = buildField('53', '986');
  const transactionAmount = buildField('54', amount.toFixed(2));
  const countryCode = buildField('58', 'BR');
  const name = buildField('59', merchantName.slice(0, 25));
  const city = buildField('60', merchantCity.slice(0, 15));
  const additionalData = buildField('62', buildField('05', txid.slice(0, 25)));
  const withoutCrc = `${payloadFormat}${merchantAccountInfo}${mcc}${currency}${transactionAmount}${countryCode}${name}${city}${additionalData}6304`;
  const crc = crc16Ccitt(withoutCrc);
  return `${withoutCrc}${crc}`;
}

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

export function generatePixPayload(
  key: string,
  merchantName: string,
  merchantCity: string,
  amount: number,
  txid?: string
): PixPayload {
  const resolvedTxid = txid ?? `OD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const payload = buildPixPayload(key, merchantName, merchantCity, amount, resolvedTxid);
  return {
    payload,
    txid: resolvedTxid,
    qrSvg: '',
    valor: amount,
    expiraEm: 3600,
  };
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