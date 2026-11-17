import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Pin,
  MoreVertical,
  Eye,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCheck,
} from "lucide-react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/free")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Canal Free Oficial` },
      { name: "description", content: `Canal oficial com prévias e fotos liberadas de ${STORE.name}.` },
      { property: "og:title", content: `${STORE.name} — Canal Free Oficial` },
      { property: "og:description", content: "Acesse o canal com fotos liberadas e desbloqueie o VIP completo." },
      { property: "og:type", content: "website" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
    ],
  }),
  component: TelegramFreeChannel,
});

// Todas as 25 fotos com legendas naturais e espontâneas
const TELEGRAM_POSTS = [
  {
    id: 1,
    file: "14bpmxv.jpg",
    caption: "Oie amores! Criei esse canal pra postar algumas fotinhas pra vocês 💕",
    time: "10:14",
    views: "5.8K",
    reactions: { fire: 412, heart: 689, eyes: 230 },
  },
  {
    id: 2,
    file: "1ah04oa.jpg",
    caption: "Gostaram desse look? 👀",
    time: "11:05",
    views: "6.2K",
    reactions: { fire: 590, heart: 742, eyes: 310 },
  },
  {
    id: 3,
    file: "1dv81h0.jpg",
    caption: "Se bater bastante foguinho aqui embaixo solto mais uma hoje ainda 🔥👇",
    time: "11:42",
    views: "5.4K",
    reactions: { fire: 720, heart: 512, eyes: 198 },
  },
  {
    id: 4,
    file: "1m8o3jl.jpg",
    caption: "Mais fotos desse dia tão lá no VIP... quem já viu amou!",
    time: "12:18",
    views: "6.7K",
    reactions: { fire: 814, heart: 923, eyes: 415 },
  },
  {
    id: 5,
    file: "1mj2u99.jpg",
    caption: "Tirei essa agorinha, gostaram? 🙈 O vídeo tá lá no botão azul",
    time: "13:00",
    views: "5.9K",
    reactions: { fire: 630, heart: 780, eyes: 245 },
  },
  {
    id: 6,
    file: "1o5gc6r.jpg",
    caption: "Um pouquinho do que rolou essa semana com vocês 🥰",
    time: "13:35",
    views: "7.1K",
    reactions: { fire: 940, heart: 855, eyes: 510 },
  },
  {
    id: 7,
    file: "1o8h0qj.jpg",
    caption: "Boa tarde vidas! Antes de entrar no banho ✨",
    time: "14:12",
    views: "6.4K",
    reactions: { fire: 670, heart: 910, eyes: 320 },
  },
  {
    id: 8,
    file: "1tu92xy.jpg",
    caption: "Uma das minhas fotos favoritas... Tem mais lá no canal VIP 💕",
    time: "14:50",
    views: "8.3K",
    reactions: { fire: 1120, heart: 1040, eyes: 640 },
  },
  {
    id: 9,
    file: "1yaohqa.jpg",
    caption: "O que acharam desse ângulo? 👀",
    time: "15:25",
    views: "5.6K",
    reactions: { fire: 510, heart: 640, eyes: 280 },
  },
  {
    id: 10,
    file: "6vb6wh.jpg",
    caption: "Mais uma pra animar a tarde de vocês 😋",
    time: "16:02",
    views: "6.9K",
    reactions: { fire: 780, heart: 830, eyes: 390 },
  },
  {
    id: 11,
    file: "84czez.jpg",
    caption: "No VIP tem a continuação dessa... ficou muito boa!",
    time: "16:40",
    views: "7.5K",
    reactions: { fire: 890, heart: 940, eyes: 470 },
  },
  {
    id: 12,
    file: "8ytfgy.jpg",
    caption: "No espelho antes de sair... 💋",
    time: "17:15",
    views: "6.1K",
    reactions: { fire: 720, heart: 860, eyes: 315 },
  },
  {
    id: 13,
    file: "dxh6th.jpg",
    caption: "Aquecendo pro fim de semana 🔥",
    time: "17:50",
    views: "8.0K",
    reactions: { fire: 1050, heart: 980, eyes: 590 },
  },
  {
    id: 14,
    file: "hnn2oo.jpg",
    caption: "Quem aí prefere fotos assim ou de biquíni? Reage aí! 👇",
    time: "18:22",
    views: "7.3K",
    reactions: { fire: 840, heart: 915, eyes: 420 },
  },
  {
    id: 15,
    file: "ifp98s.jpg",
    caption: "O que não mostro no TikTok eu posto aqui e no VIP... 👀",
    time: "18:55",
    views: "6.8K",
    reactions: { fire: 760, heart: 870, eyes: 380 },
  },
  {
    id: 16,
    file: "izhlou.jpg",
    caption: "Bem naturalzinha do jeito que vocês gostam ✨",
    time: "19:30",
    views: "7.9K",
    reactions: { fire: 930, heart: 1100, eyes: 460 },
  },
  {
    id: 17,
    file: "j5nnod.jpg",
    caption: "Mais uma que bateu recorde de elogios de vocês!",
    time: "20:05",
    views: "8.5K",
    reactions: { fire: 1200, heart: 1050, eyes: 670 },
  },
  {
    id: 18,
    file: "ku8j6g.jpg",
    caption: "Boa noite pra quem vai dormir pensando em mim... 🌙",
    time: "20:45",
    views: "7.2K",
    reactions: { fire: 870, heart: 940, eyes: 410 },
  },
  {
    id: 19,
    file: "lsmiht.jpg",
    caption: "Frequência da noite pra quem tá online agora! 😈",
    time: "21:18",
    views: "9.1K",
    reactions: { fire: 1340, heart: 1180, eyes: 750 },
  },
  {
    id: 20,
    file: "m8x7zl.jpg",
    caption: "Tudo liberado no VIP com acesso vitalício por R$ 19,90... Aproveitem! ⏳",
    time: "21:50",
    views: "10.4K",
    reactions: { fire: 1560, heart: 1320, eyes: 890 },
  },
  {
    id: 21,
    file: "q00feo.jpg",
    caption: "Mais um pouquinho do que tem lá dentro... 🤫",
    time: "22:15",
    views: "8.7K",
    reactions: { fire: 1080, heart: 990, eyes: 530 },
  },
  {
    id: 22,
    file: "qjj5it.jpg",
    caption: "Amei muito essa foto... o vídeo tá imperdível lá no VIP! 🔥",
    time: "22:40",
    views: "9.6K",
    reactions: { fire: 1410, heart: 1250, eyes: 810 },
  },
  {
    id: 23,
    file: "s8652f.jpg",
    caption: "Quem tá acordado a essa hora? 👀",
    time: "23:10",
    views: "7.8K",
    reactions: { fire: 920, heart: 870, eyes: 460 },
  },
  {
    id: 24,
    file: "vrqgda.jpg",
    caption: "Mais uma fotinha de hoje pra vocês... Não perde o canal VIP! 💕",
    time: "23:35",
    views: "8.9K",
    reactions: { fire: 1150, heart: 1020, eyes: 620 },
  },
  {
    id: 25,
    file: "yja85k.jpg",
    caption: "Fechando por hoje! Tem muito mais esperando por vocês no botão aqui embaixo 👇✨",
    time: "23:58",
    views: "12.1K",
    reactions: { fire: 1890, heart: 1640, eyes: 1050 },
  },
];

function TelegramFreeChannel() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [userReactions, setUserReactions] = useState<Record<number, string>>({});

  const toggleReaction = (postId: number, emoji: string) => {
    setUserReactions((prev) => ({
      ...prev,
      [postId]: prev[postId] === emoji ? "" : emoji,
    }));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowLeft" && selectedPhoto !== null) {
        setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : TELEGRAM_POSTS.length - 1);
      }
      if (e.key === "ArrowRight" && selectedPhoto !== null) {
        setSelectedPhoto(selectedPhoto < TELEGRAM_POSTS.length - 1 ? selectedPhoto + 1 : 0);
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
    <div className="min-h-screen bg-[#0e1621] text-white flex flex-col font-sans selection:bg-[#2481cc] selection:text-white pb-20">
      {/* Telegram Channel Header */}
      <header className="sticky top-0 z-40 bg-[#17212b] border-b border-[#101921] px-3 py-2.5 shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              to="/pix"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition text-[#708499]"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>

            <img
              src={STORE.avatarImage}
              alt={STORE.name}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-sky-500/40"
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight leading-tight">
                  {STORE.handle} ✨ Canal Free
                </span>
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2481cc] text-[9px] font-black text-white">
                  ✓
                </span>
              </div>
              <span className="text-[11px] text-[#708499] leading-tight">
                18.420 inscritos · 1.480 online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#708499]">
            <Link
              to="/pix"
              className="text-[11px] font-bold text-[#2481cc] bg-[#2481cc]/15 px-2.5 py-1 rounded-full border border-[#2481cc]/30"
            >
              VIP
            </Link>
            <button type="button" className="p-1 hover:text-white" aria-label="Mais opções">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Pinned Message Banner */}
        <Link
          to="/pix"
          className="mx-auto mt-2 flex max-w-md items-center gap-2 rounded-lg bg-[#182533] px-3 py-1.5 text-xs text-white border-l-2 border-[#2481cc] shadow-sm hover:bg-[#1d2c3d] transition"
        >
          <Pin className="h-3.5 w-3.5 text-[#2481cc] shrink-0" />
          <div className="flex-1 truncate">
            <span className="font-bold text-[#2481cc] mr-1.5 text-[11px]">Mensagem Fixada:</span>
            <span className="text-slate-300 text-[11px]">
              Como entrar no canal VIP por R$ {STORE.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <span className="text-[10px] font-black text-[#2481cc] uppercase shrink-0">Ver</span>
        </Link>
      </header>

      {/* Date badge */}
      <div className="my-3 flex justify-center">
        <span className="rounded-full bg-[#182533]/90 px-3 py-0.5 text-[11px] font-medium text-[#708499] shadow-sm">
          Hoje
        </span>
      </div>

      {/* Telegram Channel Posts Feed */}
      <main className="mx-auto flex max-w-md flex-col gap-3.5 px-3">
        {/* Welcome message bubble */}
        <div className="rounded-2xl rounded-tl-sm bg-[#182533] border border-[#202f3f] p-3.5 shadow-sm text-sm text-slate-200 space-y-2">
          <p className="font-bold text-sky-400 text-xs">📢 Mensagem do Canal</p>
          <p className="leading-relaxed text-xs text-slate-300">
            Oie vidas! Criei esse canal pra postar algumas fotinhas pra vocês 💕
          </p>
          <p className="leading-relaxed text-xs text-slate-300">
            👉 Quem quiser ver todas as outras fotos e vídeos completos, clica no botão azul aqui embaixo pra entrar no VIP!
          </p>
          <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-[#708499]">
            <span>10:00</span>
            <CheckCheck className="h-3 w-3 text-[#2481cc]" />
          </div>
        </div>

        {/* Media Posts */}
        {TELEGRAM_POSTS.map((post, idx) => {
          const userReaction = userReactions[post.id];

          return (
            <article
              key={post.id}
              className="rounded-2xl rounded-tl-sm bg-[#182533] border border-[#202f3f] overflow-hidden shadow-md flex flex-col"
            >
              {/* Photo Media Container */}
              <div
                className="relative cursor-pointer bg-black/60 overflow-hidden group"
                onClick={() => setSelectedPhoto(idx)}
              >
                <img
                  src={`/free/${post.file}`}
                  alt={`Foto ${idx + 1}`}
                  className="w-full max-h-[480px] object-cover transition duration-200 group-hover:scale-[1.01]"
                  loading={idx < 3 ? "eager" : "lazy"}
                />

                {/* Telegram Photo Expand Hint */}
                <div className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white opacity-80 group-hover:opacity-100 transition shadow">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Caption and Meta */}
              <div className="p-3 space-y-2.5">
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {post.caption}
                </p>

                {/* Interactive Telegram Reaction Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <button
                    type="button"
                    onClick={() => toggleReaction(post.id, "fire")}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-90 border ${
                      userReaction === "fire"
                        ? "bg-rose-500/25 border-rose-500/50 text-rose-300"
                        : "bg-[#242f3d]/70 border-[#2f3d4e] text-slate-300 hover:bg-[#2b3746]"
                    }`}
                  >
                    <span>🔥</span>
                    <span>{post.reactions.fire + (userReaction === "fire" ? 1 : 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleReaction(post.id, "heart")}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-90 border ${
                      userReaction === "heart"
                        ? "bg-red-500/25 border-red-500/50 text-red-300"
                        : "bg-[#242f3d]/70 border-[#2f3d4e] text-slate-300 hover:bg-[#2b3746]"
                    }`}
                  >
                    <span>❤️</span>
                    <span>{post.reactions.heart + (userReaction === "heart" ? 1 : 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleReaction(post.id, "eyes")}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-90 border ${
                      userReaction === "eyes"
                        ? "bg-sky-500/25 border-sky-500/50 text-sky-300"
                        : "bg-[#242f3d]/70 border-[#2f3d4e] text-slate-300 hover:bg-[#2b3746]"
                    }`}
                  >
                    <span>👀</span>
                    <span>{post.reactions.eyes + (userReaction === "eyes" ? 1 : 0)}</span>
                  </button>
                </div>

                {/* Footer with Views and Time */}
                <div className="flex items-center justify-between border-t border-[#202f3f]/80 pt-2 text-[10px] text-[#708499]">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.views}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>{post.time}</span>
                    <CheckCheck className="h-3 w-3 text-[#2481cc]" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* Classic Telegram Channel Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#17212b] border-t border-[#101921] px-3 py-2.5 shadow-[0_-8px_20px_rgba(0,0,0,0.4)]">
        <div className="mx-auto max-w-md flex items-center justify-between gap-3">
          <Link
            to="/pix"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2481cc] hover:bg-[#2072b4] active:scale-[0.98] py-3.5 px-4 text-sm font-black uppercase tracking-wider text-white shadow-md shadow-[#2481cc]/25 transition"
          >
            <Lock className="h-4 w-4" />
            <span>Entrar no Canal VIP · R$ {STORE.price.toFixed(2).replace(".", ",")}</span>
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
            <span className="text-xs font-bold text-sky-400 bg-[#182533] border border-[#2b3d52] px-3 py-1 rounded-full">
              Foto {selectedPhoto + 1} de {TELEGRAM_POSTS.length}
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
                setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : TELEGRAM_POSTS.length - 1)
              }
              className="absolute left-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white shadow-lg backdrop-blur-md transition hover:bg-black/90 active:scale-90"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Expanded Image */}
            <img
              src={`/free/${TELEGRAM_POSTS[selectedPhoto].file}`}
              alt={`Foto ${selectedPhoto + 1}`}
              className="max-h-[68vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-sky-950"
            />

            {/* Next Button */}
            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(selectedPhoto < TELEGRAM_POSTS.length - 1 ? selectedPhoto + 1 : 0)
              }
              className="absolute right-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white shadow-lg backdrop-blur-md transition hover:bg-black/90 active:scale-90"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2481cc] hover:bg-[#2072b4] py-3.5 px-5 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-[#2481cc]/30 transition active:scale-[0.98]"
            >
              <span>Ver Mais Fotos e Vídeos no VIP</span>
              <Lock className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-slate-400">
              Acesso vitalício por R$ {STORE.price.toFixed(2).replace(".", ",")} via PIX com confirmação automática.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
