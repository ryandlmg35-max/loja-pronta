export const ORDER_STORAGE_KEY = "contedinhos_order";
export type OrderCredentials = { orderId: string; accessToken: string };
export type OrderStatus = { status: "pendente" | "pago" | "cancelado"; link: string | null; message: string };

export async function fetchOrderStatus(order: OrderCredentials, signal?: AbortSignal, timeoutMs = 15000): Promise<OrderStatus> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch(`/api/orders/status?${new URLSearchParams({ orderId: order.orderId, token: order.accessToken })}`, {
      signal: controller.signal, cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error ?? "Não foi possível confirmar agora. Tente novamente.");
    if (!["pendente", "pago", "cancelado"].includes(data.status)) throw new Error("Confirmação indisponível. Tente novamente.");
    if (data.status === "pago" && !data.link) throw new Error("Pagamento confirmado, mas o acesso está indisponível. Tente novamente ou me chame na DM.");
    return { status: data.status, link: data.status === "pago" ? data.link : null, message: data.message ?? "" };
  } catch (error) {
    if (controller.signal.aborted) throw new Error("A consulta demorou mais que o esperado. Tentaremos novamente; seu pedido foi mantido.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}