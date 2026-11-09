/**
 * Config publica da loja. A chave PIX NAO fica aqui: este arquivo entra no bundle
 * do browser. A chave vive em src/lib/server/pix-key.server.ts.
 */
export const STORE = {
  name: "Meus contendinhos",
  handle: "@laulusilvaa1201",
  price: 19.9,
  telegramUrl: "https://t.me/laulusilvaa1201",
  coverImage: "/cover.jpg",
  avatarImage: "/avatar.jpg",
  productName: "Meus contendinhos",
  productDescription: "Conteúdo digital exclusivo enviado no Telegram.",
  merchantCity: "BRASILIA",
  warningTitle: "Se a página não abrir, abra no navegador",
  warningText:
    "O TikTok e Instagram às vezes abrem num navegador interno que bloqueia o PIX. Se clicar em \"ACESSAR MINHA PÁGINA\" e não carregar, toque nos 3 pontinhos (⋯) no canto superior direito e escolha \"Abrir no navegador\".",
  steps: [
    "Toque em \"Gerar PIX\" e faça o pagamento de R$ 19,90 pelo QR Code ou pelo código copia e cola.",
    "Volte para esta página e toque em \"Consultar pagamento\" para liberar o acesso.",
    "O conteúdo é enviado no Telegram em poucos minutos.",
  ],
  paymentInstruction:
    "Após realizar o pagamento, volte para esta página e clique em \"Consultar pagamento\".",
  successMessage: "Pagamento confirmado. O acesso será enviado no seu Telegram.",
  pendingMessage:
    "Pagamento pendente. Se já pagou, aguarde alguns instantes e clique novamente em \"Consultar pagamento\".",
  pendingMessageNoTracking:
    "PIX gerado. Faça o pagamento e envie o comprovante no Telegram para liberar o acesso.",
};