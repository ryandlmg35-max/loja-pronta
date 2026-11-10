import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { STORE } from "@/data/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Painel de pedidos` },
      { name: "description", content: `Gerenciamento de pedidos de ${STORE.name}.` },
      { property: "og:title", content: `${STORE.name} — Painel de pedidos` },
      { property: "og:description", content: `Gerenciamento de pedidos de ${STORE.name}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPanel,
});

type AdminOrder = {
  id: string;
  status: string;
  valor_total: number;
  criado_em: string;
  txid: string;
};

const TOKEN_KEY = "loja_pronta_admin_token";

function AdminPanel() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      void load(saved);
    }
  }, []);

  async function load(useToken: string) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/orders", { headers: { "x-admin-token": useToken } });
      const data = await res.json();
      if (!data.ok) {
        setOrders([]);
        setMsg(
          data.error === "unauthorized"
            ? "Token inválido."
            : data.error === "service_role_unavailable"
              ? "SUPABASE_SERVICE_ROLE_KEY ausente neste runtime."
              : data.error === "admin_token_missing"
                ? "ADMIN_TOKEN não configurado nos Secrets do Lovable."
                : `Erro: ${data.error}`,
        );
        return;
      }
      setOrders(data.orders as AdminOrder[]);
    } catch {
      setMsg("Erro de rede.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(orderId: string, status: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      setMsg(data.ok ? data.message : `Erro: ${data.error}`);
      if (data.ok) void load(token);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#e8f4fc] p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-extrabold text-[#0f3d5c]">Pedidos — {STORE.handle}</h1>

        <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm sm:flex-row">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="flex-1 rounded-lg border border-[#c9dced] px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              localStorage.setItem(TOKEN_KEY, token);
              void load(token);
            }}
            className="rounded-lg bg-[#1e88c7] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            Carregar
          </button>
        </div>

        {msg && <p className="rounded-xl bg-white p-3 text-sm text-[#12405f] shadow-sm">{msg}</p>}

        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-bold text-[#12405f]">{o.txid}</p>
                  <p className="text-xs text-[#5b87a0]">{new Date(o.criado_em).toLocaleString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0f8a4f]">
                    R$ {o.valor_total.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs font-semibold uppercase text-[#5b87a0]">{o.status}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy || o.status === "pago"}
                  onClick={() => void setStatus(o.id, "pago")}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                >
                  Confirmar pagamento
                </button>
                <button
                  type="button"
                  disabled={busy || o.status === "cancelado"}
                  onClick={() => void setStatus(o.id, "cancelado")}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                >
                  Cancelar
                </button>
              </div>
            </li>
          ))}
        </ul>

        {orders.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-[#5b87a0] shadow-sm">
            Nenhum pedido ainda.
          </p>
        )}
      </div>
    </main>
  );
}
