import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/previas")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Prévias Exclusivas` },
      { name: "description", content: `Confira as prévias de ${STORE.name}. Liberação imediata via PIX.` },
      { property: "og:title", content: `${STORE.name} — Prévias Exclusivas` },
      { property: "og:description", content: "Confira as prévias e desbloqueie o acesso completo." },
      { property: "og:type", content: "website" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
    ],
  }),
  component: PreviewsPage,
});

// Espaço para você colocar os arquivos das prévias (coloque na pasta public/previas/ ou URLs diretas)
const PREVIEWS_DATA = [
  {
    id: 1,
    title: "Ensaio Exclusivo #1",
    tag: "Foto",
    // Substitua pelo arquivo real em public/previas/ ou deixe a capa
    url: "/cover.jpg",
    isVideo: false,
  },
  {
    id: 2,
    title: "Vídeo Teaser VIP",
    tag: "Vídeo",
    url: "/tutorial.gif",
    isVideo: true,
  },
  {
    id: 3,
    title: "Bastidores do Dia",
    tag: "Foto",
    url: "/avatar.jpg",
    isVideo: false,
  },
];

function PreviewsPage() {
  return (
    <main className="relative min-h-screen bg-[#071322] text-white px-4 pt-4 pb-28 selection:bg-sky-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-md flex-col gap-4">
        {/* Top bar with back button */}
        <header className="flex items-center justify-between gap-2 border-b border-sky-900/40 pb-3">
          <Link
            to="/pix"
            className="flex items-center gap-1.5 rounded-xl border border-sky-800/60 bg-[#0d223a] px-3 py-1.5 text-xs font-bold text-sky-300 transition hover:bg-sky-900/40"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>

          <div className="flex items-center gap-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-rose-300">
            <Sparkles className="h-3 w-3 text-rose-400" />
            <span>Prévias Liberadas</span>
          </div>
        </header>

        {/* Headline */}
        <section className="space-y-1 text-center pt-1">
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Degustação do Conteúdo
          </h1>
          <p className="text-xs text-slate-300">
            Abaixo estão algumas amostras. Para ver todo o acervo completo e sem censura, desbloqueie seu acesso.
          </p>
        </section>

        {/* Gallery Grid */}
        <section className="grid grid-cols-1 gap-4 pt-1">
          {PREVIEWS_DATA.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-sky-900/60 bg-[#0b1c30] p-2.5 shadow-md transition hover:border-sky-600/70"
            >
              <div className="relative overflow-hidden rounded-xl bg-black aspect-square w-full">
                {item.isVideo ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}

                {/* Badge on media */}
                <span className="absolute top-2.5 left-2.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {item.tag}
                </span>

                {/* Lock watermark overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] p-4 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/20 mb-2">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-white drop-shadow">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-sky-200 drop-shadow">
                    Versão completa no VIP
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Reassurance banner */}
        <section className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-center text-xs text-emerald-200 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Garantia de 7 dias · Devolução total caso não goste</span>
        </section>
      </div>

      {/* Floating Bottom Bar (CTA) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-900/60 bg-[#071322]/95 backdrop-blur-lg px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slate-300">Acesso Total</span>
            <span className="text-lg font-black text-emerald-400">R$ {STORE.price.toFixed(2).replace(".", ",")}</span>
          </div>

          <Link
            to="/pix"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-sky-600/30 transition active:scale-[0.98] hover:from-sky-400 hover:to-blue-500"
          >
            <span>Desbloquear Tudo</span>
            <Lock className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
