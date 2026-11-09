import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { STORE } from "@/data/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — ${STORE.handle}` },
      { name: "description", content: STORE.warningText },
      { property: "og:title", content: `${STORE.name} — ${STORE.handle}` },
      { property: "og:description", content: STORE.warningText },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: STORE.coverImage },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
    ],
  }),
  component: Index,
});

type PixState = {
  stage: "idle" | "loading" | "ready" | "error";
  payload?: string;
  qrSvg?: string;
  txid?: string;
  valor?: number;
  error?: string;
};

type OrderStatus = "unknown" | "checking" | "pendente" | "pago" | "cancelado";

function Index() {
  const [pix, setPix] = useState<PixState>({ stage: "idle" });
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("unknown");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedTxid = sessionStorage.getItem("pix_txid");
    if (storedTxid) {
      setPix((s) => ({ ...s, txid: storedTxid }));
      checkStatus(storedTxid);
    }
  }, []);

  async function generatePix() {
    setPix({ stage: "loading" });
    try {
      const res = await fetch("/api/pix/checkout", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Erro ao gerar PIX");
      sessionStorage.setItem("pix_txid", data.txid);
      setPix({ stage: "ready", payload: data.payload, qrSvg: data.qrSvg, txid: data.txid, valor: data.valor });
      setOrderStatus("pendente");
      setStatusMessage("⏳ PIX gerado. Escaneie o QR Code ou copie o código.");
    } catch (e) {
      setPix({ stage: "error", error: e instanceof Error ? e.message : "Erro desconhecido" });
    }
  }

  async function checkStatus(txid: string) {
    setOrderStatus("checking");
    try {
      const res = await fetch(`/api/orders/status?txid=${txid}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Erro ao consultar");
      setOrderStatus(data.status);
      setStatusMessage(data.message);
    } catch (e) {
      setOrderStatus("unknown");
      setStatusMessage("⚠️ Não foi possível consultar. Tente novamente.");
    }
  }

  async function copyPayload() {
    if (!pix.payload) return;
    await navigator.clipboard.writeText(pix.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6 px-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <img
            src={STORE.coverImage}
            alt={STORE.name}
            className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg object-cover"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{STORE.name}</h1>
            <p className="text-sm text-gray-500">{STORE.handle}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">{STORE.warningTitle}</p>
          <p>{STORE.warningText}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{STORE.name}</p>
              <p className="text-sm text-gray-500">Conteúdo digital exclusivo</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">R$ {STORE.price.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">{STORE.paymentInstruction}</p>

          {pix.stage === "idle" && (
            <button
              onClick={generatePix}
              disabled={pix.stage === "loading"}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 active:scale-[0.98] transition"
            >
              {pix.stage === "loading" ? "Gerando PIX..." : "Gerar PIX"}
            </button>
          )}

          {pix.stage === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {pix.error}
              <button
                onClick={generatePix}
                className="ml-2 underline text-sm"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {pix.stage === "ready" && pix.payload && pix.qrSvg && (
            <div className="space-y-3 border-t pt-3">
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-white p-2 rounded border" dangerouslySetInnerHTML={{ __html: pix.qrSvg }} />
                <p className="text-xs text-gray-500">Escaneie com o app do seu banco</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Código PIX (copia e cola)</span>
                  <button
                    onClick={() => setShowPayload(!showPayload)}
                    className="text-xs text-blue-600 underline"
                  >
                    {showPayload ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {showPayload && (
                  <div className="flex gap-2">
                    <textarea
                      readOnly
                      value={pix.payload}
                      className="flex-1 bg-white border border-gray-300 rounded text-xs p-2 font-mono min-h-[60px]"
                    />
                    <button
                      onClick={copyPayload}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                )}
              </div>

              <div className={`p-3 rounded-lg text-sm text-center ${
                orderStatus === "pago" ? "bg-green-50 text-green-800" :
                orderStatus === "cancelado" ? "bg-red-50 text-red-800" :
                "bg-yellow-50 text-yellow-800"
              }`}>
                {statusMessage}
              </div>

              <button
                onClick={() => pix.txid && checkStatus(pix.txid)}
                disabled={orderStatus === "checking" || orderStatus === "pago"}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg disabled:opacity-50"
              >
                {orderStatus === "checking" ? "Consultando..." : "Consultar pagamento"}
              </button>

              <a
                href={STORE.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.55 0-.27-.01-1.01-.01-1.98-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1.01.07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.85 0 1.34-.01 2.41-.01 2.74 0 .32.16.64.67.55A10 10 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>
                Acessar pelo Telegram
              </a>

              <p className="text-xs text-center text-gray-500">
                Se não abrir, me chame no DM: {STORE.handle}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400">
          Escolha uma das opções acima para continuar.
        </p>
      </div>
    </main>
  );
}