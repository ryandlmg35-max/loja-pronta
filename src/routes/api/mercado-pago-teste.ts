import { createFileRoute } from "@tanstack/react-router";
import { previewPaymentBody, previewPaymentInput } from "@/lib/mercadopago-preview";
import { generateQrSvg } from "@/lib/pix";

export const Route = createFileRoute("/api/mercado-pago-teste")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
        if (!import.meta.env.DEV) return reply({ error: "Teste indisponível fora da prévia." }, 404);
        if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Acesso recusado." }, 403);
        const input = previewPaymentInput.safeParse(await request.json().catch(() => null));
        if (!input.success) return reply({ error: "Informe um e-mail válido." }, 400);
        const key = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!key) return reply({ error: "A chave do Mercado Pago não está disponível." }, 503);
        try {
          const response = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Idempotency-Key": crypto.randomUUID() },
            body: JSON.stringify(previewPaymentBody(input.data.email)),
            signal: AbortSignal.timeout(25000),
          });
          const data = await response.json() as { id?: number; message?: string; point_of_interaction?: { transaction_data?: { qr_code?: string } } };
          if (!response.ok) {
            const message = data.message?.toLowerCase() ?? "";
            const error = /identification|cpf|document/.test(message)
              ? "O Mercado Pago exigiu um documento para esta cobrança."
              : /email/.test(message)
                ? "O Mercado Pago recusou o e-mail informado."
                : "O Mercado Pago recusou gerar o PIX apenas com e-mail nesta tentativa.";
            return reply({ error }, 422);
          }
          const pix = data.point_of_interaction?.transaction_data?.qr_code;
          // This is a generation probe, not an order: cancel immediately so it cannot be paid accidentally.
          let cancelled = false;
          if (data.id) {
            const cancel = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
              method: "PUT", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({ status: "cancelled" }), signal: AbortSignal.timeout(10000),
            });
            cancelled = cancel.ok;
          }
          if (!pix) return reply({ error: "O Mercado Pago não retornou um código PIX." }, 502);
          return reply({ ok: true, qrSvg: await generateQrSvg(pix), cancelled });
        } catch {
          return reply({ error: "Não foi possível concluir o teste. Tente novamente." }, 502);
        }
      },
    },
  },
});