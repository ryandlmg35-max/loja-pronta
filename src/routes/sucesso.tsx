import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrderStatus } from "@/hooks/use-order-status";
import { ORDER_STORAGE_KEY, type OrderCredentials } from "@/lib/order-status";

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
  const [order, setOrder] = useState<OrderCredentials | null>(null);
  const [ready, setReady] = useState(false);
  const { result, error, checking, retry } = useOrderStatus(order);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) ?? "null");
      if (typeof saved?.orderId === "string" && typeof saved?.accessToken === "string") setOrder(saved);
    } catch { /* Keep the missing-order state; never use browser storage as payment proof. */ }
    finally { setReady(true); }
  }, []);

  return (
    <main className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 text-center text-card-foreground shadow-sm">
        {!ready && <p role="status">Verificando pagamento…</p>}
        {ready && !order && (
          <>
            <h1 className="text-xl font-extrabold mb-2">Pedido não encontrado neste navegador</h1>
            <p className="mb-4">Abra esta página no mesmo navegador em que gerou o PIX. Se já pagou, não pague novamente.</p>
            <Button asChild className="w-full h-12"><Link to="/pix">Voltar para o PIX</Link></Button>
          </>
        )}
        {ready && order && result?.status !== "pago" && (
          <>
            <h1 className="text-xl font-extrabold mb-2">{result?.status === "cancelado" ? "Pedido cancelado" : "Confirmando pagamento"}</h1>
            <p role={error ? "alert" : "status"} className="mb-4">{error || result?.message || "Consultando a confirmação do seu PIX…"}</p>
            <Button onClick={retry} disabled={checking} className="w-full h-12">{checking ? "Consultando pagamento…" : "Consultar novamente"}</Button>
            <Button asChild variant="link" className="mt-2"><Link to="/pix">Voltar para o PIX</Link></Button>
          </>
        )}
        {result?.status === "pago" && result.link && (
          <>
            <h1 className="text-2xl font-extrabold mb-2">Pagamento confirmado!</h1>
            <p className="mb-6">Seu acesso foi liberado.</p>
            <Button asChild className="w-full h-12"><a href={result.link} target="_blank" rel="noopener noreferrer">
              Acessar conteúdo
            </a></Button>
            <p className="mt-3 text-xs font-mono text-muted-foreground break-all">{result.link}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              🛡️ Compra protegida com garantia de satisfação e reembolso.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
