ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS bunnypay_transaction_id text UNIQUE;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS acesso_token text UNIQUE;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS pago_em timestamptz;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS pagador_nome text;
COMMENT ON COLUMN public.pedidos.mp_payment_id IS 'DEPRECATED: replaced by bunnypay_transaction_id';
CREATE TABLE public.bunnypay_postbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text,
  payload jsonb NOT NULL,
  resultado text NOT NULL,
  recebido_em timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bunnypay_postbacks TO service_role;
ALTER TABLE public.bunnypay_postbacks ENABLE ROW LEVEL SECURITY;