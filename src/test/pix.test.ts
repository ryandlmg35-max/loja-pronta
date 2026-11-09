import { describe, expect, it } from "vitest";
import jsQR from "jsqr";
import { encode } from "uqr";
import { generatePixPayload, generateQrSvg } from "@/lib/pix";

const KEY = "ryansikvaryans@gmail.com";

function parseTlv(payload: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    const value = payload.slice(i + 4, i + 4 + len);
    expect(value.length).toBe(len);
    fields[id] = value;
    i += 4 + len;
  }
  return fields;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

describe("PIX BR Code", () => {
  it("monta payload EMV com a chave, o valor e o txid", () => {
    const { payload, txid } = generatePixPayload(KEY, "Meus contendinhos", "BRASILIA", 19.9, "ODTESTE123");
    const fields = parseTlv(payload);

    expect(fields["00"]).toBe("01");
    expect(fields["26"]).toContain("br.gov.bcb.pix");
    expect(fields["26"]).toContain(KEY);
    expect(fields["53"]).toBe("986");
    expect(fields["54"]).toBe("19.90");
    expect(fields["58"]).toBe("BR");
    expect(fields["59"]).toBe("Meus contendinhos");
    expect(fields["60"]).toBe("BRASILIA");
    expect(fields["62"]).toContain(txid);
    expect(fields["63"]).toHaveLength(4);
  });

  it("assina o payload com CRC16-CCITT válido", () => {
    const { payload } = generatePixPayload(KEY, "Meus contendinhos", "BRASILIA", 19.9);
    const fields = parseTlv(payload);

    expect(crc16("123456789")).toBe("29B1");
    expect(crc16(payload.slice(0, payload.length - 4))).toBe(fields["63"]);
  });

  it("trunca nome e cidade nos limites do padrão", () => {
    const { payload } = generatePixPayload(
      KEY,
      "Nome de loja muito comprido para o campo",
      "Cidade muito comprida",
      19.9,
    );
    const fields = parseTlv(payload);

    expect((fields["59"] ?? "").length).toBeLessThanOrEqual(25);
    expect((fields["60"] ?? "").length).toBeLessThanOrEqual(15);
  });

  it("gera QR Code em SVG com o payload do PIX", async () => {
    const { payload } = generatePixPayload(KEY, "Meus contendinhos", "BRASILIA", 19.9);
    const svg = await generateQrSvg(payload);

    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain("<rect");
  });

  it("QR Code decodifica de volta para o payload PIX", () => {
    const { payload } = generatePixPayload(KEY, "Meus contendinhos", "BRASILIA", 19.9, "ODTESTE123");
    const qr = encode(payload, { ecc: "M", border: 2 });
    const size = qr.size;
    const scale = 4;

    const width = size * scale;
    const data = new Uint8ClampedArray(width * width * 4).fill(255);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!qr.data[y]?.[x]) continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const px = x * scale + dx;
            const py = y * scale + dy;
            const idx = (py * width + px) * 4;
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
          }
        }
      }
    }

    const decoded = jsQR(data, width, width);
    expect(decoded).not.toBeNull();
    expect(decoded?.data).toBe(payload);
  });
});
