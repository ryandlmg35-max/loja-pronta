/**
 * Chave PIX do recebedor. Fica em arquivo .server para nunca entrar no bundle do browser:
 * a chave e montada no servidor e so volta mascarada para a tela.
 */
export const PIX_KEY = "ryansikvaryans@gmail.com";

export const PIX_KEY_MASK = "••••••••@•••••.com";

/** Versao segura para exibir: a chave some do texto, o copia-e-cola continua valido. */
export function maskPixKey(payload: string): string {
  return payload.split(PIX_KEY).join(PIX_KEY_MASK);
}
