/**
 * Config publica da loja. A chave PIX NAO fica aqui: este arquivo entra no bundle
 * do browser. A chave vive em src/lib/server/pix-key.server.ts.
 */
export const STORE = {
  name: "Meus contendinhos",
  handle: "sofia",
  price: 19.9,
  telegramUrl: "https://t.me/sofia",
  whatsappNumber: "5562981906908",
  coverImage: "/cover.jpg",
  avatarImage: "/avatar.jpg",
  productName: "Meus contendinhos",
  productDescription: "Conteúdo digital exclusivo enviado no Telegram.",
  merchantCity: "BRASILIA",
  warningTitle: "Se não abrir, toque nos 3 pontinhos (⋯) e escolha \"Abrir no navegador\"",
  warningText: "",
  steps: [
    "Toque em \"Gerar PIX\" e faça o pagamento de R$ 19,90 pelo QR Code ou pelo código copia e cola.",
    "Toque em \"Enviar comprovante\" e mande o print do pagamento no WhatsApp.",
    "O acesso é liberado assim que o pagamento for confirmado.",
  ],
  paymentInstruction:
    "Após realizar o pagamento, toque em \"Enviar comprovante\" e mande o print no WhatsApp.",
  successMessage: "Pagamento confirmado. O acesso será enviado no seu Telegram.",
  pendingMessage:
    "Pagamento pendente. Se já pagou, toque em \"Enviar comprovante\" e mande o print.",
  pendingMessageNoTracking:
    "PIX gerado. Faça o pagamento e toque em \"Enviar comprovante\" pra mandar o print.",
};