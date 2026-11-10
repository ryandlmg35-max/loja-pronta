import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateQrSvg } from "@/lib/pix";
import { STORE } from "@/data/store";
import { isValidCpf, onlyDigits } from "@/lib/bunnypay";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

const Body = z.object({
  nome: z.string().trim().min(3).max(120),
  cpf: z.string().refine(isValidCpf, "cpf_invalido"),
  device: z.enum(["android", "ios", "web"]).default("web"),
});

export const Route = createFileRoute("/api/pix/checkout")({
  server: {
    handlers: {
      POST: async ({ request }): Promise<Response> => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const parsed = Body.safeParse(await request.json().catch(() => ({})));
        if (!parsed.success) {
          const cpfErr = parsed.error.issues.some((i) => i.path[0] === "cpf");
          return json({ ok: false, error: cpfErr ? "CPF inválido" : "Informe nome completo e CPF" }, 400);
        }

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
            pagador_nome: parsed.data.nome,
          })
          .select("id")
          .single();
        if (error || !order) return json({ ok: false, error: "Não foi possível criar o pedido" }, 500);

        const origin = new URL(request.url).origin;
        const token = process.env["BUNNYPAY_POSTBACK_TOKEN"];
        const postback =
          origin.startsWith("https://") && token
            ? `${origin}/api/public/bunnypay/postback?t=${encodeURIComponent(token)}`
            : undefined;

        const { createCashin } = await import("@/lib/server/bunnypay.server");
        const charge = await createCashin({
          nome: parsed.data.nome,
          cpf: onlyDigits(parsed.data.cpf),
          valor: amount,
          descricao: STORE.productName,
          postback,
          device: parsed.data.device,
        });

        if (!charge.ok) {
          await admin.from("pedidos").update({ status: "cancelado" }).eq("id", order.id);
          return json({ ok: false, error: "Não foi possível gerar o PIX. Tente novamente." }, 502);
        }

        await admin.from("pedidos").update({ bunnypay_transaction_id: charge.id }).eq("id", order.id);

        return json({
          ok: true,
          orderId: order.id,
          accessToken: acessoToken,
          pix: charge.pix,
          qrSvg: await generateQrSvg(charge.pix),
          valor: amount,
        });
      },
    },
  },
});
