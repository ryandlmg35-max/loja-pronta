import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/data/store";
import { paymentInput } from "@/lib/mercadopago";
import { useOrderStatus } from "@/hooks/use-order-status";

export const Route = createFileRoute("/pix")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — PIX` },
      { name: "description", content: `${STORE.name}. Pagamento via PIX com confirmação automática.` },
      { property: "og:title", content: `${STORE.name} — PIX` },
      { property: "og:description", content: STORE.paymentInstruction },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PixPage,
});

type PixData = { orderId: string; accessToken: string; pix: string; qrSvg: string; valor: number };
const STORAGE_KEY = "contedinhos_order";

function PixPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pix, setPix] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const { result, error: statusError, checking, retry } = useOrderStatus(pix);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as PixData | null;
      if (saved?.orderId && saved.pix) setPix(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (result?.status === "pago") void navigate({ to: "/sucesso" });
    if (result?.status === "cancelado") {
      localStorage.removeItem(STORAGE_KEY);
      setPix(null);
      setError("Pedido cancelado. Você pode gerar um novo PIX.");
    }
  }, [result, navigate]);

  async function generatePix(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!paymentInput.safeParse({ email }).success) return setError("Informe um e-mail válido.");
    setLoading(true);
    try {
      const res = await fetch("/api/pix/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) return setError(data.error ?? "Erro ao gerar o PIX");
      const next: PixData = {
        orderId: data.orderId,
        accessToken: data.accessToken,
        pix: data.pix,
        qrSvg: data.qrSvg,
        valor: data.valor,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPix(next);
    } catch {
      setError("Erro de rede ao gerar o PIX");
    } finally {
      setLoading(false);
    }
  }

  function newOrder() {
    localStorage.removeItem(STORAGE_KEY);
    setPix(null);
  }

  const input = "w-full rounded-lg border border-input bg-background p-2.5 text-foreground";

  return (
    <main className="min-h-screen bg-[#e8f4fc] pb-12">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-6">
        <section className="rounded-2xl border border-[#b9dcf2] bg-white p-3 shadow-sm">
          <img src={STORE.coverImage} alt={`${STORE.name} — capa`} className="w-full rounded-xl object-cover" />

          <a
            href={STORE.telegramGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e88c7] py-3.5 text-base font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
            Previas
          </a>

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
            <p className="text-2xl font-extrabold text-[#0f8a4f]">R$ {STORE.price.toFixed(2).replace(".", ",")}</p>
          </div>

          {!pix && (
            <form onSubmit={generatePix} className="mt-3 space-y-2">
              <input className={input} type="email" aria-label="E-mail" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full py-6 text-base font-bold">
                {loading ? "Gerando PIX…" : "Gerar PIX com Mercado Pago"}
              </Button>
            </form>
          )}


          {pix && (
            <div className="mt-3 space-y-3 border-t border-[#e3edf5] pt-3">
              <div className="mx-auto h-56 w-56 rounded-xl border border-[#e3edf5] bg-white p-2">
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: pix.qrSvg }} />
              </div>
              <textarea readOnly value={pix.pix} aria-label="Código PIX copia e cola" className="min-h-[64px] w-full rounded-lg border border-[#c9dced] p-2 font-mono text-[10px] text-[#12405f]" />
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pix.pix).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full rounded-lg bg-[#1e88c7] py-2 text-sm font-semibold text-white"
              >
                {copied ? "Código copiado!" : "Copiar código PIX"}
              </button>
              <Button type="button" onClick={retry} disabled={checking} className="h-12 w-full font-bold">
                {checking ? "Consultando pagamento…" : "Consultar pagamento"}
              </Button>
              {(statusError || result?.message) && <p role={statusError ? "alert" : "status"} className="text-center text-sm text-foreground">{statusError || result?.message}</p>}
              <button type="button" onClick={newOrder} className="w-full text-xs text-[#4a7893] underline">
                Gerar um novo PIX
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
