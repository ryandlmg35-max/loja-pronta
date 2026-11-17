import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Flame, MessageCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Perfil Oficial` },
      { name: "description", content: `Acesse o conteúdo exclusivo de ${STORE.name}.` },
      { property: "og:title", content: `${STORE.name} — Perfil Oficial` },
      { property: "og:description", content: "Acesse o conteúdo free e o canal VIP oficial." },
      { property: "og:type", content: "website" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
    ],
  }),
  component: LinkBioPage,
});

function LinkBioPage() {
  const whatsappUrl = `https://wa.me/${STORE.whatsappNumber}?text=Oi%20Sofia,%20vim%20pelo%20seu%20link!`;

  return (
    <main className="relative min-h-screen bg-[#071322] text-white px-4 pt-8 pb-12 selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-6">
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <img
              src={STORE.avatarImage}
              alt={STORE.name}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-sky-500/30 shadow-xl"
            />
            <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-[#071322]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>{STORE.name}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white">
                ✓
              </span>
            </h1>
            <p className="text-xs font-semibold text-sky-400">@{STORE.handle}</p>
            <p className="text-xs text-slate-300 max-w-xs mx-auto pt-1 leading-relaxed">
              Bem-vindos ao meu cantinho oficial ✨ Fotos e conteúdos exclusivos todos os dias para vocês.
            </p>
          </div>
        </header>

        {/* Links Section (Linktree Style) */}
        <section className="flex flex-col gap-3.5">
          {/* Link 1: Conteúdo Free */}
          <Link
            to="/free"
            className="group relative flex items-center justify-between rounded-2xl border border-sky-900/60 bg-[#0d223a]/90 backdrop-blur-md p-4 shadow-lg transition duration-200 hover:border-sky-500/70 hover:bg-[#122e4e] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Conteúdo Free</span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                    Liberado
                  </span>
                </div>
                <p className="text-xs text-slate-300">Acesse 25 fotos liberadas gratuitamente</p>
              </div>
            </div>

            <svg
              className="h-5 w-5 text-sky-400 transition transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          {/* Link 2: VIP Completo (Featured CTA) */}
          <Link
            to="/pix"
            className="group relative flex items-center justify-between rounded-2xl border-2 border-sky-400/80 bg-gradient-to-r from-[#0f2d50] to-[#123660] p-4 shadow-xl shadow-sky-950/60 transition duration-200 hover:border-sky-300 hover:brightness-110 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md">
                <Flame className="h-6 w-6 text-white fill-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Canal VIP Completo</span>
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[9px] font-black uppercase text-rose-300">
                    Acesso Total
                  </span>
                </div>
                <p className="text-xs text-slate-300">Todas as fotos e vídeos · R$ {STORE.price.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>

            <svg
              className="h-5 w-5 text-rose-400 transition transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          {/* Link 3: Contato / WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between rounded-2xl border border-sky-900/60 bg-[#0d223a]/90 backdrop-blur-md p-4 shadow-lg transition duration-200 hover:border-emerald-500/70 hover:bg-[#122e4e] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Falar Comigo</span>
                </div>
                <p className="text-xs text-slate-300">Dúvidas ou suporte no WhatsApp</p>
              </div>
            </div>

            <svg
              className="h-5 w-5 text-emerald-400 transition transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </section>

        {/* Security badge */}
        <section className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 pt-2">
          <ShieldCheck className="h-4 w-4 text-sky-400" />
          <span>Perfil Oficial Verificado · Acesso Seguro</span>
        </section>
      </div>

      {/* Subtle Footer */}
      <footer className="mt-8 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} {STORE.name}. Todos os direitos reservados.
      </footer>
    </main>
  );
}
