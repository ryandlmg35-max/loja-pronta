# Checkout PIX com BunnyPay + link privado liberado pelo servidor

## O que a documentação oficial realmente diz (app.bunnypaybr.com/docs)

**Criar cobrança** — `POST https://app.bunnypaybr.com/api/v1/cashin`
- Header: `Apikey: <chave>` (Integrações → API Key)
- Body: `nome` (obrigatório), `cpf` (obrigatório, só dígitos, CPF ou CNPJ válido), `valor` (obrigatório, número > 0), `descricao` (opcional), `postback` (opcional, URL HTTPS pública), `device` (opcional: `android` | `ios` | `web`; a doc pede para detectar no navegador e enviar explicitamente em chamadas servidor-a-servidor), `split` (opcional, não usaremos)
- Resposta 200: `id`, `pix` (copia e cola), `value`, `status` (sempre `PENDING`), `acquirer_used`
- Não retorna imagem do QR Code: geramos o QR a partir de `pix` (já temos gerador de SVG).
- Erros: 400 parâmetro inválido, 403 chave inválida/sem permissão, 404 usuário não encontrado, 405 método, 500, 503.

**Postback** — `POST application/json` para a URL enviada em `postback`
- Payload: `event` = `transaction.paid`, `transaction_id` (= `id` da criação), `status` = `PAID`, `amount` (valor **líquido**, já sem taxas), `acquirer`
- Deve responder HTTP 200.
- **A documentação NÃO descreve assinatura, header de segurança, segredo de webhook nem endpoint de consulta de transação.** Status possíveis: PENDING, PAID, CANCELLED, REVERSED.

**Consequência para segurança:** sem assinatura e sem endpoint de consulta documentado, não há como provar pela API que um postback veio da BunnyPay. A mitigação disponível é um token secreto nosso embutido na URL do postback (ex.: `/api/public/bunnypay/postback?t=<segredo>`), já que a URL só é conhecida pelo nosso servidor e pela BunnyPay. Isso não é recurso da BunnyPay; é uma proteção nossa. Recomendo perguntar ao suporte BunnyPay se existe consulta de status por ID (ex.: GET de transação) ou IP fixo de envio; se existir, adicionamos depois.

## Situação atual do projeto (verificada)
- `/api/pix/checkout` gera **PIX estático** com chave própria (`pix-key.server.ts` + `lib/pix.ts`), sem gateway. Os arquivos do Mercado Pago não existem mais.
- `/pix` guarda o pedido no `localStorage` e `/sucesso` lê esse `localStorage` para decidir o acesso.
- **O link privado está fixo no código de `/sucesso.tsx`** (`https://t.me/+RvKv5VyYQfs1ZjQx`), então já vai no pacote do site e qualquer pessoa pode achá-lo. Precisa ser trocado (gerar novo link no Telegram) depois da mudança.
- Pedidos têm coluna `mp_payment_id` (Mercado Pago), status `pendente/pago/cancelado`, `valor_total`.

## Dados que a tela vai pedir
- **Nome completo** e **CPF** (obrigatórios pela BunnyPay). CPF validado (dígitos verificadores) antes de enviar.
- `device` detectado automaticamente no navegador, sem pedir ao cliente.

## Implementação

1. **Banco**: adicionar em pedidos `bunnypay_transaction_id` (texto, único, opcional), `pago_em`, `acesso_token` (texto aleatório, único), e um registro dos postbacks recebidos (id da transação, payload, recebido_em) para auditoria. Marcar `mp_payment_id` como descontinuado. Não guardar CPF em texto livre além do necessário (guardar só nome; CPF não fica salvo).
2. **Criar cobrança** (`/api/pix/checkout`, POST, mesma origem): recebe nome, CPF, device; valida com Zod; preço vem do servidor (`STORE.price`), nunca do cliente; cria pedido `pendente` com `acesso_token`; chama BunnyPay com `postback` = URL pública com token secreto; salva `id` retornado; devolve ao cliente apenas `orderId`, `acesso_token`, código `pix`, QR SVG e valor. Se a BunnyPay falhar, pedido vira `cancelado` e mostra erro — **sem fallback estático**.
3. **Postback** (`/api/public/bunnypay/postback`, POST):
   - confere token secreto da URL (comparação em tempo constante); senão 401
   - valida corpo: `event === "transaction.paid"`, `status === "PAID"`, `transaction_id` texto
   - localiza pedido pelo `bunnypay_transaction_id`; se não existir, registra e responde 200 sem efeito
   - valida valor: `amount` é líquido, então aceita se `0 < amount <= valor_total` (e opcionalmente acima de um piso configurável); fora disso, registra e não libera
   - idempotente: atualização condicional `status = 'pago' WHERE status = 'pendente'`; repetições respondem 200 sem efeito
   - responde 200 rapidamente
4. **Status** (`/api/orders/status`): exige `orderId` + `acesso_token` (sem o token, nada é revelado); retorna `pendente/pago/cancelado` e, **somente se pago**, o link privado lido do Secret no servidor.
5. **Telas**: `/pix` com formulário nome/CPF → mostra QR + copia e cola + botão "Consultar pagamento" (e checagem automática a cada poucos segundos). `/sucesso` pergunta ao servidor e mostra o link vindo da resposta. O `localStorage` passa a guardar só `orderId`/token para retomar a tela, nunca como prova de pagamento.
6. **Limpeza**: remover `pix-key.server.ts`, gerador de payload EMV estático e o link fixo em `/sucesso`; manter só o gerador de QR SVG. Botão "Enviar comprovante" pelo WhatsApp removido (confirmação passa a ser automática) — confirme se quer manter.
7. **Testes**: valor aceito/recusado no postback, token inválido → 401, postback repetido não muda nada, status não revela link sem pagamento, CPF inválido recusado.

## Secrets a cadastrar
- `BUNNYPAY_API_KEY` — chave da BunnyPay (Integrações → API Key). Pode ser chave de instância (só recebimento).
- `BUNNYPAY_POSTBACK_TOKEN` — valor aleatório nosso para proteger a URL do postback (eu gero automaticamente; você não precisa colar na BunnyPay, vai junto em cada cobrança).
- `PRIVATE_ACCESS_LINK` — o link privado (gere um **novo** link do grupo, pois o atual está exposto).
- Os secrets do Mercado Pago podem ser apagados depois.

## Pontos em aberto
- Confirmar com a BunnyPay se há consulta de transação por ID ou assinatura; a doc pública não tem.
- Valor mínimo aceitável do `amount` líquido (taxa da BunnyPay) — sem isso, aceito qualquer valor positivo até o total.
