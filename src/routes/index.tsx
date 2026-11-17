import { createFileRoute, Link } from "@tanstack/react-router";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Acesso Liberado — ${STORE.name}` },
      { name: "description", content: "Siga os passos para liberar seu acesso no navegador." },
      { property: "og:title", content: `Acesso Liberado — ${STORE.name}` },
      { property: "og:description", content: "Siga os passos para liberar seu acesso no navegador." },
      { property: "og:type", content: "website" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
    ],
  }),
  component: TutorialLanding,
});

function TutorialLanding() {
  return (
    <main className="relative min-h-screen bg-[#071322] text-white px-4 pt-5 pb-10 selection:bg-[#0284c7] selection:text-white">
      {/* Background ambient light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0284c7]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-md flex-col gap-4">
        {/* Header with Title and Arrow pointing to TikTok's 3 dots */}
        <header className="flex items-start justify-between gap-3 pt-2">
          <h1 className="text-2xl font-black uppercase tracking-tight leading-tight text-white max-w-[240px]">
            Siga os passos <br />
            <span className="text-sky-400">para liberar</span>
          </h1>

          {/* Indicator pointing to top-right corner */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-bounce">
              <svg
                className="h-8 w-8 text-white drop-shadow-md"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
            <span className="mt-1 text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              Clique Aqui
            </span>
          </div>
        </header>

        {/* Steps Cards */}
        <section className="flex flex-col gap-2.5">
          {/* Step 1 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-sky-900/60 bg-[#0d223a]/90 backdrop-blur-sm p-3.5 shadow-sm transition hover:border-sky-700/80">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0284c7] text-sm font-black text-white shadow-md shadow-sky-900/50">
              1
            </span>
            <p className="text-sm font-medium leading-snug text-slate-200">
              Toque nos <span className="font-bold text-sky-400">3 pontos</span> ou no ícone de{" "}
              <span className="font-bold text-sky-400">Seta</span> no canto superior direito.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-sky-900/60 bg-[#0d223a]/90 backdrop-blur-sm p-3.5 shadow-sm transition hover:border-sky-700/80">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0284c7] text-sm font-black text-white shadow-md shadow-sky-900/50">
              2
            </span>
            <p className="text-sm font-medium leading-snug text-slate-200">
              Procure e clique na opção escrita:{" "}
              <span className="font-bold text-sky-400">"Abrir no Navegador"</span>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-sky-900/60 bg-[#0d223a]/90 backdrop-blur-sm p-3.5 shadow-sm transition hover:border-sky-700/80">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0284c7] text-sm font-black text-white shadow-md shadow-sky-900/50">
              3
            </span>
            <p className="text-sm font-medium leading-snug text-slate-200">
              Após abrir fora do TikTok, clique no{" "}
              <span className="font-bold text-white underline decoration-sky-400 decoration-2">
                Botão Branco
              </span>{" "}
              abaixo.
            </p>
          </div>
        </section>

        {/* Video demonstration container */}
        <section className="rounded-3xl border border-sky-900/60 bg-[#0b1c30]/80 p-3 shadow-lg shadow-sky-950/60 backdrop-blur-sm">
          <div className="overflow-hidden rounded-2xl bg-black/40 border border-sky-950">
            <video
              src="/tutorial.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="mx-auto aspect-square w-full max-w-[320px] object-cover"
            />
          </div>
        </section>

        {/* Action Button */}
        <section className="space-y-3 pt-1">
          <Link
            to="/pix"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 px-6 text-base font-black tracking-wide text-[#071322] shadow-[0_8px_25px_rgba(255,255,255,0.15)] transition active:scale-[0.98] hover:bg-slate-100"
          >
            <span>JÁ FIZ OS 3 PASSOS</span>
            <svg
              className="h-5 w-5 text-[#071322]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <p className="text-center text-[11px] font-medium uppercase tracking-wider text-sky-400/70">
            🔒 Sistema Seguro · 100% Reembolsável
          </p>
        </section>
      </div>
    </main>
  );
}
