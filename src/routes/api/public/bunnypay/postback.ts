import { createFileRoute } from "@tanstack/react-router";
import { evaluatePostback, safeEqual, type PostbackBody } from "@/lib/bunnypay";
import { getAdminClient, json } from "@/lib/server/admin-client";

// BunnyPay não documenta assinatura; a autenticidade vem do token secreto
// que só nosso servidor coloca na URL de postback de cada cobrança.
export const Route = createFileRoute("/api/public/bunnypay/postback")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        const expected = process.env["BUNNYPAY_POSTBACK_TOKEN"];
        const got = new URL(request.url).searchParams.get("t") ?? "";
        if (!expected || !safeEqual(got, expected)) return json({ ok: false }, 401);

        const body = (await request.json().catch(() => ({}))) as PostbackBody;
        const admin = await getAdminClient();
        if (!admin) return json({ ok: false }, 503);

        const txId = typeof body.transaction_id === "string" ? body.transaction_id : null;
        const { data: order } = txId
          ? await admin
              .from("pedidos")
              .select("id, status, valor_total")
              .eq("bunnypay_transaction_id", txId)
              .maybeSingle()
          : { data: null };

        const decision = evaluatePostback(body, order);
        let resultado = decision.action === "mark_paid" ? "pago" : decision.reason;

        if (decision.action === "mark_paid" && order) {
          // Idempotente: só muda se ainda estiver pendente.
          const { data: updated } = await admin
            .from("pedidos")
            .update({ status: "pago", pago_em: new Date().toISOString() })
            .eq("id", order.id)
            .eq("status", "pendente")
            .select("id");
          if (!updated?.length) resultado = "ja_processado";
        }

        await admin.from("bunnypay_postbacks").insert({
          transaction_id: txId,
          payload: JSON.parse(JSON.stringify(body ?? {})),
          resultado,
        });

        return json({ ok: true });
      },
    },
  },
});
