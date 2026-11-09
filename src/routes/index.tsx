import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loja — Base do e-commerce" },
      { name: "description", content: "Página de teste da conexão: login, cadastro e lista de produtos." },
      { property: "og:title", content: "Loja — Base do e-commerce" },
      { property: "og:description", content: "Página de teste da conexão: login, cadastro e lista de produtos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Produto = { id: string; nome: string; preco: number; estoque: number };

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase
      .from("produtos")
      .select("id, nome, preco, estoque")
      .order("criado_em")
      .then(({ data, error }) => {
        if (error) setErroProdutos(error.message);
        else setProdutos(data ?? []);
      });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setMsg(error ? `Erro: ${error.message}` : "Login feito.");
  }

  async function cadastrar() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: window.location.origin, data: { nome } },
    });
    if (error) setMsg(`Erro: ${error.message}`);
    else if (!data.session) setMsg("Cadastro feito. Confirme pelo link enviado ao seu email.");
    else setMsg("Cadastro feito.");
  }

  return (
    <main className="mx-auto max-w-xl p-6 font-sans">
      <h1 className="mb-4 text-2xl font-bold">Loja (teste de conexão)</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Conta</h2>
        {user ? (
          <div>
            <p>Logado como {user.email}</p>
            <button className="mt-2 border px-3 py-1" onClick={() => supabase.auth.signOut()}>
              Sair
            </button>
          </div>
        ) : (
          <form onSubmit={entrar} className="flex flex-col gap-2">
            <input className="border p-2" placeholder="Nome (só no cadastro)" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input className="border p-2" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border p-2" type="password" placeholder="Senha" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} />
            <div className="flex gap-2">
              <button type="submit" className="border px-3 py-1">Entrar</button>
              <button type="button" className="border px-3 py-1" onClick={cadastrar}>Cadastrar</button>
            </div>
          </form>
        )}
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Produtos</h2>
        {erroProdutos && <p>Erro: {erroProdutos}</p>}
        <ul className="list-disc pl-5">
          {produtos.map((p) => (
            <li key={p.id}>
              {p.nome} — R$ {Number(p.preco).toFixed(2)} (estoque: {p.estoque})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
