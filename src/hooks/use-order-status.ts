import { useEffect, useState } from "react";
import { fetchOrderStatus, type OrderCredentials, type OrderStatus } from "@/lib/order-status";

export function useOrderStatus(order: OrderCredentials | null) {
  const [result, setResult] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const orderId = order?.orderId;
  const accessToken = order?.accessToken;

  useEffect(() => {
    setResult(null); setError("");
    if (!orderId || !accessToken) { setChecking(false); return; }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let done = false;
    async function check() {
      if (running || done || controller.signal.aborted || !orderId || !accessToken) return;
      clearTimeout(timer); running = true; setChecking(true);
      try {
        const next = await fetchOrderStatus({ orderId, accessToken }, controller.signal);
        if (controller.signal.aborted) return;
        setResult(next); setError("");
        done = next.status === "pago" || next.status === "cancelado";
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Não foi possível consultar. Tentaremos novamente.");
      } finally {
        running = false;
        if (!controller.signal.aborted) {
          setChecking(false);
          if (!done) timer = setTimeout(() => void check(), 5000);
        }
      }
    }
    const resume = () => { if (document.visibilityState === "visible") void check(); };
    void check();
    window.addEventListener("focus", resume);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      controller.abort(); clearTimeout(timer);
      window.removeEventListener("focus", resume);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [orderId, accessToken, attempt]);

  return { result, error, checking, retry: () => setAttempt(value => value + 1) };
}