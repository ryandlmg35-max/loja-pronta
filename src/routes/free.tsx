import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Lock, ShieldCheck, Flame } from "lucide-react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/free")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Conteúdo Free` },
      { name: "description", content: `Confira o conteúdo free exclusivo de ${STORE.name}. Liberação VIP via PIX.` },
      { property: "og:title", content: `${STORE.name} — Conteúdo Free` },
      { property: "og:description", content: "Confira as fotos gratuitas e desbloqueie o VIP completo." },
      { property: "og:type", content: "website" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
    ],
  }),
  component: FreeContentPage,
});

const FREE_PHOTOS = [
  "14bpmxv.jpg",
  "1ah04oa.jpg",
  "1dv81h0.jpg",
  "1m8o3jl.jpg",
  "1mj2u99.jpg",
  "1o5gc6r.jpg",
  "1o8h0qj.jpg",
  "1tu92xy.jpg",
  "1yaohqa.jpg",
  "6vb6wh.jpg",
  "84czez.jpg",
  "8ytfgy.jpg",
  "dxh6th.jpg",
  "hnn2oo.jpg",
  "ifp98s.jpg",
  "izhlou.jpg",
  "j5nnod.jpg",
  "ku8j6g.jpg",
  "lsmiht.jpg",
  "m8x7zl.jpg",
  "q00feo.jpg",
  "qjj5it.jpg",
  "s8652f.jpg",
  "vrqgda.jpg",
  "yja85k.jpg",
];

function FreeContentPage() {
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
            <span>Voltar ao PIX</span>
          </Link>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Conteúdo Free</span>
          </div>
        </header>

        {/* Headline */}
        <section className="space-y-1.5 text-center pt-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2">
            <span>Conteúdo Free</span>
            <Flame className="h-5 w-5 text-rose-500 fill-rose-500" />
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Abaixo estão algumas fotos liberadas gratuitamente. Para ter acesso a todo o material VIP completo e sem censura, libere seu acesso pelo PIX.
          </p>
        </section>

        {/* Feed of Free Photos */}
        <section className="grid grid-cols-2 gap-3 pt-2">
          {FREE_PHOTOS.map((file, idx) => (
            <div
              key={file}
              className="group relative overflow-hidden rounded-2xl border border-sky-900/60 bg-[#0b1c30] p-1.5 shadow-md transition hover:border-sky-500/60"
            >
              <div className="relative overflow-hidden rounded-xl bg-black aspect-[3/4] w-full">
                <img
                  src={`/free/${file}`}
                  alt={`Conteúdo Free ${idx + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading={idx < 4 ? "eager" : "lazy"}
                />

                <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Free #{idx + 1}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Reassurance banner */}
        <section className="mt-2 rounded-2xl border border-sky-900/60 bg-[#0d223a]/80 p-3.5 text-center text-xs text-slate-300 space-y-2 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1.5 font-bold text-sky-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Garantia de 7 Dias · 100% Reembolsável</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Acesso imediato enviado após a confirmação do PIX de R$ {STORE.price.toFixed(2).replace(".", ",")}.
          </p>
        </section>
      </div>

      {/* Floating Bottom Bar (CTA) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-900/60 bg-[#071322]/95 backdrop-blur-lg px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slate-400">Acesso VIP</span>
            <span className="text-lg font-black text-emerald-400">
              R$ {STORE.price.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <Link
            to="/pix"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 px-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-sky-600/30 transition active:scale-[0.98] hover:from-sky-400 hover:to-blue-500"
          >
            <span>Liberar VIP Completo</span>
            <Lock className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
