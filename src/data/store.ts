/**
 * Config publica da loja. A chave PIX NAO fica aqui: este arquivo entra no bundle
 * do browser. Pagamentos via Mercado Pago (servidor).
 */
export const STORE = {
  name: "Meus contendinhos",
  handle: "sofia",
  price: 19.9,
  telegramUrl: "https://t.me/sofia",
  telegramGroupUrl: "https://t.me/+u4qIkKllmME1ZmM5",
  whatsappNumber: "5562981906908",
  coverImage: "/cover.jpg",
  avatarImage: "/avatar.jpg",
  productName: "Meus contendinhos",
  productDescription: "Conteúdo digital exclusivo enviado no Telegram.",
  merchantCity: "BRASILIA",
  warningTitle: "Se não abrir, toque nos 3 pontinhos (⋯) e escolha \"Abrir no navegador\"",
  warningText: "",
  steps: [
    "Informe seu e-mail e toque em \"Gerar PIX com Mercado Pago\".",
    "Pague R$ 19,90 pelo QR Code ou pelo código copia e cola.",
    "Assim que o pagamento for confirmado, seu link de acesso aparece aqui.",
  ],
  paymentInstruction:
    "A confirmação é automática: depois de pagar, toque em \"Consultar pagamento\".",
  successMessage: "Pagamento confirmado. O acesso será enviado no seu Telegram.",
  pendingMessage:
    "Pagamento pendente. Se já pagou, toque em \"Enviar comprovante\" e mande o print.",
  pendingMessageNoTracking:
    "PIX gerado. Faça o pagamento e toque em \"Enviar comprovante\" pra mandar o print.",
};