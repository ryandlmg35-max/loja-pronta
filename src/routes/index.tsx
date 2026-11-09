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

          <a
            href={STORE.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1e88c7] bg-white py-3.5 text-base font-bold text-[#1e88c7] transition active:bg-[#f0f7fc]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e88c7]">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.55 0-.27-.01-1.01-.01-1.98-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1.01.07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.85 0 1.34-.01 2.41-.01 2.74 0 .32.16.64.67.55A10 10 0 0022 12c0-5.52-4.48-10-10-10z" />
              </svg>
            </span>
            Acessar pelo Telegram
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </a>

          <p className="text-center text-xs text-[#4a7893]">
            💬 Caso não consiga acessar, me chame na DM do TikTok.
          </p>
        </section>

        <p className="px-4 text-center text-xs text-[#5b87a0]">
          Escolha uma das opções acima para continuar.
        </p>
      </div>
    </main>
  );
}