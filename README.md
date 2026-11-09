# Loja Pronta

Quero criar a base de um e-commerce. Por enquanto só preciso da infraestrutura de backend funcionando — não precisa caprichar no visual, pode ser uma página inicial bem simples e genérica.

1. Conecte o projeto ao Supabase (crie um novo projeto Supabase se necessário).

2. Configure autenticação de usuários (Supabase Auth):

   - Cadastro e login com email/senha

   - Tabela de perfis (profiles) vinculada ao usuário autenticado, com: nome, email, criado_em

3. Crie as tabelas no banco de dados:

   - produtos: id, nome, descricao, preco, imagem_url, estoque, criado_em

   - pedidos: id, usuario_id (referência a auth.users), status (pendente, pago, cancelado), valor_total, criado_em

   - pedido_itens: id, pedido_id, produto_id, quantidade, preco_unitario

4. Configure Row Level Security (RLS) nas tabelas:

   - produtos: leitura pública, escrita só por admin

   - pedidos e pedido_itens: cada usuário só vê e edita os próprios registros

5. Crie uma página inicial bem básica só pra confirmar que a conexão está funcionando: um formulário de login/cadastro e uma listagem simples dos produtos da tabela (pode ser só texto, sem estilização).

Não precisa criar páginas de produto individuais, carrinho ou checkout — isso eu vou construir depois, por fora do Lovable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/26458f32-49d0-40f4-8261-e7f51d8b434d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
