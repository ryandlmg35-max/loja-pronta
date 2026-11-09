import { generatePixPayload, generateQrSvg } from "../src/lib/pix";

const r = generatePixPayload("ryansikvaryans@gmail.com", "Meus contendinhos", "BRASILIA", 19.9);
console.log("payload:", r.payload);
console.log("len:", r.payload.length);
const svg = await generateQrSvg(r.payload);
console.log("svg len:", svg.length, "starts:", svg.slice(0, 80));

// CRC16-CCITT validation against the well-known check value.
const crc = (str: string) => {
  let c = 0xffff;
  for (let i = 0; i < str.length; i++) {
    c ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
  }
  return c.toString(16).toUpperCase().padStart(4, "0");
};
console.log("crc check 123456789 =", crc("123456789"), "(esperado 29B1)");

// TLV parse check: every field must have a 2-digit length matching its content.
const payload = r.payload;
let i = 0;
const fields: Record<string, string> = {};
while (i < payload.length) {
  const id = payload.slice(i, i + 2);
  const len = Number(payload.slice(i + 2, i + 4));
  const value = payload.slice(i + 4, i + 4 + len);
  if (value.length !== len) throw new Error(`TLV quebrado no campo ${id}`);
  fields[id] = value;
  i += 4 + len;
}
console.log("campos:", Object.keys(fields).join(","));
console.log("amount(54):", fields["54"], "country(58):", fields["58"], "crc(63):", fields["63"]);
const recomputed = crc(payload.slice(0, payload.length - 4));
console.log("crc payload:", recomputed, "match:", recomputed === fields["63"]);
