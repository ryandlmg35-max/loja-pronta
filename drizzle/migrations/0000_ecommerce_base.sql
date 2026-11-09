-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  email text,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Produtos
CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco numeric(10,2) NOT NULL DEFAULT 0 CHECK (preco >= 0),
  imagem_url text,
  estoque integer NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.produtos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produtos TO authenticated;
GRANT ALL ON public.produtos TO service_role;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos leitura publica" ON public.produtos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Produtos insert admin" ON public.produtos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Produtos update admin" ON public.produtos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Produtos delete admin" ON public.produtos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Pedidos
CREATE TYPE public.pedido_status AS ENUM ('pendente', 'pago', 'cancelado');
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  status public.pedido_status NOT NULL DEFAULT 'pendente',
  valor_total numeric(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.pedidos (usuario_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pedidos select own" ON public.pedidos FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Pedidos insert own" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Pedidos update own" ON public.pedidos FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Pedidos delete own" ON public.pedidos FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Pedido itens
CREATE TABLE public.pedido_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric(10,2) NOT NULL CHECK (preco_unitario >= 0)
);
CREATE INDEX ON public.pedido_itens (pedido_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_itens TO authenticated;
GRANT ALL ON public.pedido_itens TO service_role;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itens select own" ON public.pedido_itens FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.usuario_id = auth.uid()));
CREATE POLICY "Itens insert own" ON public.pedido_itens FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.usuario_id = auth.uid()));
CREATE POLICY "Itens update own" ON public.pedido_itens FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.usuario_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.usuario_id = auth.uid()));
CREATE POLICY "Itens delete own" ON public.pedido_itens FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND p.usuario_id = auth.uid()));

INSERT INTO public.produtos (nome, descricao, preco, estoque) VALUES
  ('Camiseta Básica', 'Camiseta 100% algodão', 49.90, 100),
  ('Caneca Cerâmica', 'Caneca 300ml', 29.90, 50),
  ('Boné Preto', 'Boné ajustável', 59.90, 30);