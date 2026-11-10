import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — ${STORE.handle}` },
      { name: "description", content: `${STORE.name}. Acesse pelo botão abaixo.` },
      { property: "og:title", content: `${STORE.name} — ${STORE.handle}` },
      { property: "og:description", content: STORE.warningTitle },
      { property: "og:type", content: "website" },
      { property: "og:image", content: STORE.coverImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-[#e8f4fc] pb-12">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-6">
        <header className="flex flex-col items-center gap-3">
          <img
            src={STORE.avatarImage}
            alt={STORE.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md"
          />
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f3d5c]">{STORE.handle}</h1>
        </header>

        <section className="rounded-xl border border-[#b9dcf2] bg-white p-4 text-[#12405f] shadow-sm">
          <p className="text-sm font-semibold leading-snug flex items-center gap-2 text-[#1e88c7]">
            <span aria-hidden>ℹ️</span> {STORE.warningTitle}
          </p>
          {STORE.warningText && (
            <p className="mt-1 text-sm leading-relaxed">{STORE.warningText}</p>
          )}
        </section>

        <section className="space-y-3">
          <Link
            to="/pix"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1e88c7] py-3.5 text-base font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </span>
            ACESSAR MINHA PÁGINA
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>

          <p className="text-center text-xs text-[#4a7893]">
            💬 Caso não consiga acessar, me chame na DM do TikTok: {STORE.handle}
          </p>
        </section>

        <p className="px-4 text-center text-xs text-[#5b87a0]">
          Escolha uma das opções acima para continuar.
        </p>
      </div>
    </main>
  );
}