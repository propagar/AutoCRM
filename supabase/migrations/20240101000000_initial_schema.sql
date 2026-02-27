-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- For MVP purposes, normally handled by Supabase Auth
  role TEXT NOT NULL CHECK (role IN ('gerente', 'vendedor')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  city TEXT,
  address TEXT,
  birth_date DATE,
  salesperson TEXT, -- Storing name for simplicity in MVP, could be UUID
  stage TEXT NOT NULL,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create interactions table
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Ligação', 'WhatsApp', 'Visita', 'Email')),
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create funnel_stages table
CREATE TABLE public.funnel_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  daily_prospects INTEGER DEFAULT 10,
  monthly_sales INTEGER DEFAULT 5,
  current_prospects INTEGER DEFAULT 0,
  current_sales INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default funnel stages
INSERT INTO public.funnel_stages (name, order_index) VALUES
  ('Lead Novo', 1),
  ('Em Negociação', 2),
  ('Ficha Aprovada', 3),
  ('Vendido', 4),
  ('Perdido', 5);



-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create policies (For MVP, allowing all authenticated users to read/write)
-- In a real app, you'd restrict this based on role and user_id
CREATE POLICY "Allow all actions for authenticated users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.interactions FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.funnel_stages FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.goals FOR ALL USING (true);
