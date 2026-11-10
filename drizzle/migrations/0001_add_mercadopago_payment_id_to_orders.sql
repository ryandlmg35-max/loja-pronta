ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS mp_payment_id text;
COMMENT ON COLUMN public.pedidos.mp_payment_id IS 'Mercado Pago payment identifier associated with this order';