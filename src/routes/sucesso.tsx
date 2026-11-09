import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { STORE } from "@/data/store";

const VIP_GROUP_LINK = "https://t.me/+RvKv5VyYQfs1ZjQx";
const STORAGE_KEY = "loja_pronta_order";

type OrderState = "checking" | "pago" | "invalid" | "redirecting";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [
      { title: "Acesso liberado — Meus contendinhos" },
      { name: "description", content: "Pagamento confirmado. Acesso ao grupo VIP liberado." },
      { property: "og:title", content: "Acesso liberado — Meus contendinhos" },
      { property: "og:description", content: "Seu pagamento foi confirmado. Bem-vindo ao grupo VIP!" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: STORE.coverImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const [state, setState] = useState<OrderState>("checking");

  useEffect(() => {
    verifyPayment();
  }, []);

  async function verifyPayment() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setState("invalid");
        return;
      }
      const parsed = JSON.parse(saved) as { orderId: string | null; tracked: boolean };
      if (!parsed.orderId || !parsed.tracked) {
        setState("invalid");
        return;
      }

      const res = await fetch(`/api/orders/status?orderId=${encodeURIComponent(parsed.orderId)}`);
      const data = await res.json();
      if (data.ok && data.status === "pago") {
        setState("pago");
      } else {
        setState("invalid");
      }
    } catch {
      setState("invalid");
    }
  }

  if (state === "checking") {
    return (
      <main className="min-h-screen bg-[#e8f4fc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#1e88c7] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#12405f]">Verificando pagamento...</p>
        </div>
      </main>
    );
  }

  if (state === "invalid") {
    return (
      <main className="min-h-screen bg-[#e8f4fc] flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-[#f0b9c8] bg-white p-6 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-[#0f3d5c] mb-2">Acesso não autorizado</h1>
            <p className="text-[#12405f] mb-4">Pagamento não confirmado. Volte e clique em \"Consultar pagamento\".</p>
            <a
              href="/pix"
              className="inline-flex items-center gap-2 w-full px-6 py-3 rounded-xl bg-[#1e88c7] text-white font-bold text-base shadow-sm transition active:scale-[0.98]"
            >
              Voltar para o PIX
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e8f4fc] pb-12 flex items-center justify-center">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="rounded-2xl border border-[#b9dcf2] bg-white p-6 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0f3d5c] mb-2">Pagamento confirmado!</h1>
          <p className="text-[#12405f] mb-6">Seu acesso ao grupo VIP foi liberado.</p>

          <a
            href={VIP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 w-full px-6 py-3.5 rounded-xl bg-[#1e88c7] text-white font-bold text-base shadow-sm transition active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.55 0-.27-.01-1.01-.01-1.98-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1.01.07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.85 0 1.34-.01 2.41-.01 2.74 0 .32.16.64.67.55A10 10 0 0022 12c0-5.52-4.48-10-10-10z" />
            </svg>
            Entrar no Grupo VIP
          </a>

          <p className="mt-4 text-xs text-[#4a7893]">
            O link abre direto no Telegram. Se não abrir, copie e cole no navegador:
          </p>
          <p className="mt-1 text-xs font-mono text-[#1e88c7] break-all">{VIP_GROUP_LINK}</p>

          <p className="mt-6 text-xs text-[#5b87a0]">
            Guarde este link. Ele é seu acesso exclusivo ao conteúdo.
          </p>
        </div>
      </div>
    </main>
  );
}