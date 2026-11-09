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

/** Mesmo txid que aparece no extrato do banco: OD + 23 chars do id sem hifen. */
export function txidFromOrderId(id: string): string {
  return `OD${id.replace(/-/g, "").slice(0, 23)}`;
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