import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — ${STORE.handle}` },
      { name: "description", content: `${STORE.name}. Pagamento via PIX. ${STORE.paymentInstruction}` },
      { property: "og:title", content: `${STORE.name} — ${STORE.handle}` },
      { property: "og:description", content: STORE.paymentInstruction },
      { property: "og:type", content: "website" },
      { property: "og:image", content: STORE.coverImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
    ],
  }),
  component: Storefront,
});

type PixStage = "idle" | "loading" | "ready" | "error";
type OrderState = "idle" | "checking" | "pendente" | "pago" | "cancelado";

type PixData = {
  orderId: string | null;
  txid: string;
  payload: string;
  qrSvg: string;
  valor: number;
  tracked: boolean;
};

const STORAGE_KEY = "loja_pronta_order";

/** A chave PIX fica dentro do payload EMV em texto claro: na tela ela é mascarada. */
function maskPixKey(payload: string): string {
  return payload.replace(STORE.pixKey, "••••••••@•••••.com");
}

function Storefront() {
  const [stage, setStage] = useState<PixStage>("idle");
  const [pix, setPix] = useState<PixData | null>(null);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderState>("idle");
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as PixData;
      setPix(parsed);
      setStage("ready");
      void checkStatus(parsed.orderId);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setOrder("pendente");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de rede ao gerar o PIX");
      setStage("error");
    }
  }

  async function checkStatus(orderId: string | null) {
    if (!orderId) {
      setOrder("pendente");
      return;
    }
    setOrder("checking");
    try {
      const res = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "erro");
      setOrder(data.status);
    } catch {
      setOrder("idle");
    }
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
        <header className="flex flex-col items-center gap-3">
          <img
            src={STORE.avatarImage}
            alt={STORE.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md"
          />
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f3d5c]">{STORE.handle}</h1>
        </header>

        <section className="rounded-xl border border-[#b9dcf2] bg-white p-4 text-[#12405f] shadow-sm">
          <p className="text-sm font-bold leading-snug">
            <span aria-hidden>⚠️</span> {STORE.warningTitle}
          </p>
          <p className="mt-1 text-sm leading-snug">{STORE.warningText}</p>
        </section>

        <section className="rounded-2xl border border-[#b9dcf2] bg-white p-3 shadow-sm">
          <h2 className="px-1 pb-3 text-center text-lg font-extrabold text-[#0f3d5c]">
            {STORE.name} — conteúdo digital
          </h2>

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
                <div
                  className="rounded-xl border border-[#e3edf5] bg-white p-2"
                  dangerouslySetInnerHTML={{ __html: pix.qrSvg }}
                />
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
                      value={maskPixKey(pix.payload)}
                      aria-label="Código PIX copia e cola (chave mascarada)"
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

              {order === "pago" && (
                <p className="rounded-xl bg-green-50 p-3 text-center text-sm font-semibold text-green-800">
                  ✅ {STORE.successMessage}
                </p>
              )}
              {order === "pendente" && (
                <p className="rounded-xl bg-amber-50 p-3 text-center text-sm font-semibold text-amber-800">
                  ⏳ {pix.tracked ? STORE.pendingMessage : STORE.pendingMessageNoTracking}
                </p>
              )}
              {order === "cancelado" && (
                <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
                  ❌ Pedido cancelado.
                </p>
              )}

              <button
                type="button"
                onClick={() => void checkStatus(pix.orderId)}
                disabled={order === "checking" || order === "pago" || !pix.tracked}
                className="w-full rounded-xl border border-[#1e88c7] py-2.5 text-sm font-bold text-[#1e88c7] transition disabled:opacity-50"
              >
                {order === "checking" ? "Consultando…" : "Consultar pagamento"}
              </button>

              <a
                href={STORE.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e88c7] py-2.5 text-sm font-bold text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.55 0-.27-.01-1.01-.01-1.98-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1.01.07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.85 0 1.34-.01 2.41-.01 2.74 0 .32.16.64.67.55A10 10 0 0022 12c0-5.52-4.48-10-10-10z" />
                </svg>
                Acessar pelo Telegram
              </a>

              <p className="text-center text-xs text-[#4a7893]">
                Não conseguiu abrir? Fale comigo no DM: {STORE.handle}
              </p>
            </div>
          )}
        </section>

        <p className="px-4 text-center text-xs text-[#5b87a0]">
          Escolha uma das opções acima para continuar.
        </p>
      </div>
    </main>
  );
}
