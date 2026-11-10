import { createFileRoute } from "@tanstack/react-router";
import { paymentBody, paymentInput, mpPaymentSchema } from "@/lib/mercadopago";
import { generateQrSvg } from "@/lib/pix";
import { STORE } from "@/data/store";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

export const Route = createFileRoute("/api/pix/checkout")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const parsed = paymentInput.safeParse(await request.json().catch(() => ({})));
        if (!parsed.success) {
          return json({ ok: false, error: "Informe um e-mail válido" }, 400);
        }

        const key = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!key) return json({ ok: false, error: "Mercado Pago indisponível" }, 503);

        const admin = await getAdminClient();
        if (!admin) return json({ ok: false, error: "Servidor indisponível" }, 503);

        const amount = STORE.price;
        const acessoToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

        const { data: order, error } = await admin
          .from("pedidos")
          .insert({
            usuario_id: crypto.randomUUID(),
            status: "pendente",
            valor_total: amount,
            acesso_token: acessoToken,
          })
          .select("id")
          .single();
        if (error || !order) return json({ ok: false, error: "Não foi possível criar o pedido" }, 500);

        try {
          const origin = new URL(request.url).origin;
          const response = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Idempotency-Key": order.id },
            body: JSON.stringify(paymentBody(parsed.data.email, order.id,
              origin.startsWith("https://") ? `${origin}/api/public/mercadopago/webhook` : undefined)),
            signal: AbortSignal.timeout(25000),
          });
          const raw = await response.json();
          const charge = mpPaymentSchema.safeParse(raw);
          if (!response.ok || !charge.success) {
            await admin.from("pedidos").update({ status: "cancelado" }).eq("id", order.id);
            console.warn("[MercadoPago] criação recusada", { status: response.status });
            return json({ ok: false, error: "O Mercado Pago não conseguiu gerar este PIX. Confira o e-mail e tente novamente." }, 502);
          }
          const payment = charge.data;
          const pix = payment.point_of_interaction?.transaction_data?.qr_code;
          const qrSvg = pix ? await generateQrSvg(pix) : null;
          const { error: saveError } = await admin.from("pedidos").update({ mp_payment_id: String(payment.id) }).eq("id", order.id);
          if (saveError || !pix || !qrSvg) {
            await fetch(`https://api.mercadopago.com/v1/payments/${payment.id}`, {
              method: "PUT", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({ status: "cancelled" }), signal: AbortSignal.timeout(10000),
            });
            await admin.from("pedidos").update({ status: "cancelado" }).eq("id", order.id);
            return json({ ok: false, error: "Não foi possível concluir a cobrança. Tente novamente." }, 502);
          }
          return json({ ok: true, orderId: order.id, accessToken: acessoToken, pix, qrSvg, valor: amount, provider: "mercadopago" });
        } catch {
          // A timed-out create may have succeeded remotely; never expose an unlinked charge.
          return json({ ok: false, error: "Não foi possível gerar o PIX. Tente novamente." }, 502);
        }
      },
    },
  },
});
