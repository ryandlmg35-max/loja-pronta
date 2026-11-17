import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Lock, Flame, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
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
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowLeft" && selectedPhoto !== null) {
        setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : FREE_PHOTOS.length - 1);
      }
      if (e.key === "ArrowRight" && selectedPhoto !== null) {
        setSelectedPhoto(selectedPhoto < FREE_PHOTOS.length - 1 ? selectedPhoto + 1 : 0);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPhoto !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

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
            Toque na foto para ampliar. Para desbloquear todo o acervo completo e sem censura, libere seu acesso VIP.
          </p>
        </section>

        {/* Feed of Free Photos */}
        <section className="grid grid-cols-2 gap-3 pt-2">
          {FREE_PHOTOS.map((file, idx) => (
            <button
              type="button"
              key={file}
              onClick={() => setSelectedPhoto(idx)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-sky-900/60 bg-[#0b1c30] p-1.5 text-left shadow-md transition hover:border-sky-500/60 active:scale-[0.98]"
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

                <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-80 group-hover:opacity-100">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>

      {/* Floating Bottom Bar (CTA) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-sky-900/60 bg-[#071322]/95 backdrop-blur-lg px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
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

      {/* Lightbox / Expanded Modal Viewer */}
      {selectedPhoto !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Header of Modal */}
          <div
            className="flex items-center justify-between text-white pb-2 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800/50 px-2.5 py-1 rounded-full">
              Foto {selectedPhoto + 1} de {FREE_PHOTOS.length}
            </span>

            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Fechar foto"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image Display Area with Navigation Arrows */}
          <div
            className="relative flex flex-1 items-center justify-center my-auto overflow-hidden max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : FREE_PHOTOS.length - 1)
              }
              className="absolute left-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white shadow-lg backdrop-blur-md transition hover:bg-black/90 active:scale-90"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Expanded Image */}
            <img
              src={`/free/${FREE_PHOTOS[selectedPhoto]}`}
              alt={`Conteúdo Free ${selectedPhoto + 1}`}
              className="max-h-[68vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-sky-950"
            />

            {/* Next Button */}
            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(selectedPhoto < FREE_PHOTOS.length - 1 ? selectedPhoto + 1 : 0)
              }
              className="absolute right-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white shadow-lg backdrop-blur-md transition hover:bg-black/90 active:scale-90"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Footer of Modal with Direct VIP CTA */}
          <div
            className="pt-3 max-w-md w-full mx-auto space-y-2 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to="/pix"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 px-5 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-sky-600/30 transition active:scale-[0.98] hover:from-sky-400 hover:to-blue-500"
            >
              <span>Ver Fotos Sem Censura no VIP</span>
              <Lock className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-slate-400">
              Pagamento único de R$ {STORE.price.toFixed(2).replace(".", ",")} via PIX com acesso imediato.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
