import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOrderStatus } from "@/lib/order-status";
import { useOrderStatus } from "@/hooks/use-order-status";

const order = { orderId: "order-123", accessToken: "test-token" };
const reply = (status: string, link: string | null = null) => Response.json({ ok: true, status, link });

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("Payment access recovery", () => {
  it("ends a stalled request instead of loading indefinitely", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    })));
    const check = fetchOrderStatus(order);
    const assertion = expect(check).rejects.toThrow("A consulta demorou mais que o esperado");
    await vi.advanceTimersByTimeAsync(15000);
    await assertion;
  });

  it("never exposes a link for a pending payment", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply("pendente", "https://example.com/private")));
    expect(await fetchOrderStatus(order)).toMatchObject({ status: "pendente", link: null });
  });

  it("reports missing access for a paid order rather than silently redirecting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply("pago")));
    await expect(fetchOrderStatus(order)).rejects.toThrow("Pagamento confirmado, mas o acesso está indisponível");
  });

  it("rechecks a pending order when the customer returns from their bank", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(reply("pendente")).mockResolvedValueOnce(reply("pago", "https://example.com/private"));
    vi.stubGlobal("fetch", fetch);
    const hook = renderHook(() => useOrderStatus(order));
    await waitFor(() => expect(hook.result.current.result?.status).toBe("pendente"));
    act(() => window.dispatchEvent(new Event("focus")));
    await waitFor(() => expect(hook.result.current.result).toMatchObject({ status: "pago", link: "https://example.com/private" }));
    expect(fetch).toHaveBeenCalledTimes(2);
    hook.unmount();
  });

  it("recovers from a failed consultation without deleting the order", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(reply("pago", "https://example.com/private"));
    vi.stubGlobal("fetch", fetch);
    const hook = renderHook(() => useOrderStatus(order));
    await waitFor(() => expect(hook.result.current.error).toBe("offline"));
    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(hook.result.current.result?.status).toBe("pago"));
    hook.unmount();
  });
});