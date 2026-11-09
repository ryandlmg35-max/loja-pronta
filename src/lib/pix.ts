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

export function generatePixPayload(
  key: string,
  merchantName: string,
  merchantCity: string,
  amount: number
): PixPayload {
  const txid = `txid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const payload = buildPixPayload(key, merchantName, merchantCity, amount, txid);
  return {
    payload,
    txid,
    qrSvg: '',
    valor: amount,
    expiraEm: 3600,
  };
}

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function generateQrSvg(payload: string): Promise<string> {
  const uqr = await import('uqr');
  const qr = uqr.encode(encodeUtf8(payload), { ecc: 'M' });
  const size = qr.size;
  const moduleSize = 4;
  const margin = 4;
  const imgSize = size * moduleSize + margin * 2;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgSize}" height="${imgSize}" viewBox="0 0 ${imgSize} ${imgSize}"><rect width="${imgSize}" height="${imgSize}" fill="white"/>`;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr.data[y * size + x]) {
        const px = margin + x * moduleSize;
        const py = margin + y * moduleSize;
        svg += `<rect x="${px}" y="${py}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    }
  }
  svg += '</svg>';
  return svg;
}