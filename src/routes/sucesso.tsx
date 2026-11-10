import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORAGE_KEY = "contedinhos_order";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [
      { title: "Acesso liberado — Meus contendinhos" },
      { name: "description", content: "Pagamento confirmado. Acesso ao conteúdo privado liberado." },
      { property: "og:title", content: "Acesso liberado — Meus contendinhos" },
      { property: "og:description", content: "Seu pagamento foi confirmado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const [state, setState] = useState<"checking" | "invalid" | "ok">("checking");
  const [link, setLink] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as
          | { orderId: string; accessToken: string }
          | null;
        if (!saved?.orderId) return setState("invalid");
        const res = await fetch(
          `/api/orders/status?orderId=${encodeURIComponent(saved.orderId)}&token=${encodeURIComponent(saved.accessToken)}`,
        );
        const data = await res.json();
        if (data.ok && data.status === "pago" && data.link) {
          setLink(data.link);
          setState("ok");
        } else setState("invalid");
      } catch {
        setState("invalid");
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#e8f4fc] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-[#b9dcf2] bg-white p-6 text-center shadow-sm">
        {state === "checking" && <p className="text-[#12405f]">Verificando pagamento...</p>}
        {state === "invalid" && (
          <>
            <h1 className="text-xl font-extrabold text-[#0f3d5c] mb-2">Pagamento não confirmado</h1>
            <p className="text-[#12405f] mb-4">Volte e toque em "Consultar pagamento".</p>
            <a href="/pix" className="block rounded-xl bg-[#1e88c7] py-3 font-bold text-white">Voltar para o PIX</a>
          </>
        )}
        {state === "ok" && (
          <>
            <h1 className="text-2xl font-extrabold text-[#0f3d5c] mb-2">Pagamento confirmado!</h1>
            <p className="text-[#12405f] mb-6">Seu acesso foi liberado.</p>
            <a href={link} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-[#1e88c7] py-3.5 font-bold text-white">
              Acessar conteúdo
            </a>
            <p className="mt-3 text-xs font-mono text-[#1e88c7] break-all">{link}</p>
          </>
        )}
      </div>
    </main>
  );
}
