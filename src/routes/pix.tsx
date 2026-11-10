import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/pix")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — PIX` },
      { name: "description", content: `${STORE.name}. Pagamento via PIX. ${STORE.paymentInstruction}` },
      { property: "og:title", content: `${STORE.name} — PIX` },
      { property: "og:description", content: STORE.paymentInstruction },
      { property: "og:type", content: "website" },
      { property: "og:image", content: STORE.coverImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
    ],
  }),
  component: PixPage,
});

type PixStage = "idle" | "loading" | "ready" | "error";

type PixData = {
  orderId: string | null;
  txid: string;
  payload: string;
  qrSvg: string;
  valor: number;
  tracked: boolean;
};

const STORAGE_KEY = "loja_pronta_order";

function PixPage() {
  const [stage, setStage] = useState<PixStage>("idle");
  const [pix, setPix] = useState<PixData | null>(null);
  const [error, setError] = useState("");
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as PixData;
      setPix(parsed);
      setStage("ready");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  async function generatePix() {
    setStage("loading");
    setError("");
    try {
      const res = await fetch("/api/pix/checkout", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setError(data.hint ? `${data.error} — ${data.hint}` : (data.error ?? "Erro ao gerar o PIX"));
        setStage("error");
        return;
      }
      const next: PixData = {
        orderId: data.orderId ?? null,
        txid: data.txid,
        payload: data.payload,
        qrSvg: data.qrSvg,
        valor: data.valor,
        tracked: Boolean(data.tracked),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPix(next);
      setStage("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de rede ao gerar o PIX");
      setStage("error");
    }
  }

  function openWhatsApp() {
    const phone = STORE.whatsappNumber;
    const text = encodeURIComponent(
      `Olá, acabei de fazer o pagamento de R$ ${STORE.price.toFixed(2).replace(".", ",")} ` +
      `pelo produto "${STORE.productName}". ` +
      `Segue o comprovante em anexo. Meu pedido: ${pix?.orderId ?? "não gerado"}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  async function copyPayload() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowPayload(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#e8f4fc] pb-12">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-6">
        <section className="rounded-2xl border border-[#b9dcf2] bg-white p-3 shadow-sm">
          <img
            src={STORE.coverImage}
            alt={`${STORE.name} — capa`}
            className="w-full rounded-xl object-cover"
          />

          <div className="mt-3 rounded-xl border border-[#f0b9c8] bg-[#fff2f6] p-3">
            <p className="text-sm font-semibold leading-snug text-[#7d1f3a]">
              {STORE.paymentInstruction}
            </p>
          </div>

          <ol className="mt-3 space-y-1.5 px-1 text-sm leading-snug text-[#12405f]">
            {STORE.steps.map((step, i) => (
              <li key={step} className="flex gap-2">
                <span className="font-bold text-[#1e88c7]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-3 rounded-xl bg-[#f4f8fb] p-3 text-center">
            <p className="text-sm font-semibold text-[#12405f]">Valor</p>
            <p className="text-2xl font-extrabold text-[#0f8a4f]">
              R$ {STORE.price.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {stage === "idle" && (
            <button
              type="button"
              onClick={generatePix}
              className="mt-3 w-full rounded-xl bg-[#e0245e] py-3.5 text-base font-bold text-white shadow-sm transition active:scale-[0.98]"
            >
              Gerar PIX
            </button>
          )}

          {stage === "loading" && (
            <button
              type="button"
              disabled
              className="mt-3 w-full rounded-xl bg-[#e0245e] py-3.5 text-base font-bold text-white opacity-60"
            >
              Gerando PIX…
            </button>
          )}

          {stage === "error" && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-semibold">Não foi possível gerar o PIX.</p>
              <p className="mt-1 break-words">{error}</p>
              <button type="button" onClick={generatePix} className="mt-2 underline">
                Tentar novamente
              </button>
            </div>
          )}

          {stage === "ready" && pix && (
            <div className="mt-3 space-y-3 border-t border-[#e3edf5] pt-3">
              <div className="flex flex-col items-center gap-2">
                <div className="w-56 h-56 rounded-xl border border-[#e3edf5] bg-white p-2 flex items-center justify-center">
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: pix.qrSvg }}
                  />
                </div>
                <p className="text-xs text-[#4a7893]">
                  Escaneie com o app do seu banco ou use o código copia e cola
                </p>
              </div>

              <div className="rounded-xl bg-[#f4f8fb] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#12405f]">Código PIX (copia e cola)</span>
                  <button
                    type="button"
                    onClick={() => setShowPayload((v) => !v)}
                    className="text-xs font-semibold text-[#1e88c7] underline"
                  >
                    {showPayload ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {showPayload && (
                  <div className="mt-2 flex gap-2">
                    <textarea
                      readOnly
                      value={pix.payload}
                      aria-label="Código PIX copia e cola"
                      className="min-h-[64px] flex-1 rounded-lg border border-[#c9dced] bg-white p-2 font-mono text-[10px] leading-tight text-[#12405f]"
                    />
                    <button
                      type="button"
                      onClick={copyPayload}
                      className="h-fit rounded-lg bg-[#1e88c7] px-3 py-2 text-sm font-semibold text-white"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                )}
                {!showPayload && (
                  <button
                    type="button"
                    onClick={copyPayload}
                    className="mt-2 w-full rounded-lg bg-[#1e88c7] py-2 text-sm font-semibold text-white"
                  >
                    {copied ? "Código copiado!" : "Copiar código PIX"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={openWhatsApp}
                className="w-full rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98]"
              >
                Enviar comprovante
              </button>

              <p className="text-center text-xs text-[#4a7893]">
                Não conseguiu abrir? Fale comigo na DM do TikTok: {STORE.handle}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}