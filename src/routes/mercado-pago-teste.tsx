import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/mercado-pago-teste")({
  head: () => ({ meta: [
    { title: `${STORE.name} — Teste Mercado Pago` },
    { name: "description", content: "Teste separado de geração PIX pelo Mercado Pago." },
    { property: "og:title", content: `${STORE.name} — Teste Mercado Pago` },
    { property: "og:description", content: "Geração de PIX com e-mail, sem CPF." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: PreviewPayment,
});

function PreviewPayment() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ qrSvg: string; cancelled: boolean } | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/mercado-pago-teste", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Não foi possível gerar o PIX.");
      else setResult(data);
    } catch { setError("Não foi possível conectar. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-background text-foreground px-4 py-6">
    <div className="mx-auto max-w-md space-y-5">
      <Button asChild variant="ghost"><Link to="/pix"><ArrowLeft /> Voltar</Link></Button>
      <img src={STORE.coverImage} alt={STORE.name} className="w-full rounded-lg object-cover" />
      <header className="space-y-2"><h1 className="text-2xl font-bold">Mercado Pago</h1><p className="text-muted-foreground">Teste de geração · Não pagar</p><p className="text-xl font-bold">R$ {STORE.price.toFixed(2).replace(".", ",")}</p></header>
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="mp-email" className="block text-sm font-medium">E-mail</label>
        <input id="mp-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background p-3" />
        <Button type="submit" disabled={loading} className="w-full h-12"><QrCode />{loading ? "Testando…" : "Testar geração de PIX"}</Button>
      </form>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {result && <section className="space-y-3 border-t border-border pt-4"><p role="status" className="font-semibold">PIX gerado usando apenas e-mail, sem CPF.</p><div className="mx-auto w-56 h-56" dangerouslySetInnerHTML={{ __html: result.qrSvg }} /><p className="text-sm text-muted-foreground">{result.cancelled ? "Cobrança de teste cancelada. Não pague este QR Code." : "Não pague este QR Code. O cancelamento não foi confirmado."}</p></section>}
    </div>
  </main>;
}