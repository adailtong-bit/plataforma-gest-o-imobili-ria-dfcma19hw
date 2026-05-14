-- Set up auth schema modifications and core business tables

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tenant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manager_name TEXT,
  manager_phone TEXT,
  manager_email TEXT,
  address TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.towers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  type TEXT,
  profile_type TEXT,
  community TEXT,
  condominium_id UUID,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  tower_id UUID REFERENCES public.towers(id) ON DELETE SET NULL,
  floor TEXT,
  room_number TEXT,
  status TEXT DEFAULT 'available',
  image TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  guests INT DEFAULT 0,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_price NUMERIC DEFAULT 0,
  hoa_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  category TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  cost_type TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  property_name TEXT,
  property_address TEXT,
  type TEXT,
  priority TEXT,
  status TEXT DEFAULT 'pending',
  approval_status TEXT,
  date TEXT,
  assignee_id UUID REFERENCES public.profiles(id),
  partner_employee_id TEXT,
  assignee TEXT,
  pricing_model TEXT,
  price NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  team_member_payout NUMERIC DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Enable
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- RLS Policies for properties
DROP POLICY IF EXISTS "properties_select" ON public.properties;
CREATE POLICY "properties_select" ON public.properties FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "properties_insert" ON public.properties;
CREATE POLICY "properties_insert" ON public.properties FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "properties_update" ON public.properties;
CREATE POLICY "properties_update" ON public.properties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "properties_delete" ON public.properties;
CREATE POLICY "properties_delete" ON public.properties FOR DELETE TO authenticated USING (true);

-- RLS Policies for hotels
DROP POLICY IF EXISTS "hotels_select" ON public.hotels;
CREATE POLICY "hotels_select" ON public.hotels FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "hotels_insert" ON public.hotels;
CREATE POLICY "hotels_insert" ON public.hotels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "hotels_update" ON public.hotels;
CREATE POLICY "hotels_update" ON public.hotels FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "hotels_delete" ON public.hotels;
CREATE POLICY "hotels_delete" ON public.hotels FOR DELETE TO authenticated USING (true);

-- RLS Policies for towers
DROP POLICY IF EXISTS "towers_select" ON public.towers;
CREATE POLICY "towers_select" ON public.towers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "towers_insert" ON public.towers;
CREATE POLICY "towers_insert" ON public.towers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "towers_update" ON public.towers;
CREATE POLICY "towers_update" ON public.towers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "towers_delete" ON public.towers;
CREATE POLICY "towers_delete" ON public.towers FOR DELETE TO authenticated USING (true);

-- RLS Policies for ledger_entries
DROP POLICY IF EXISTS "ledger_select" ON public.ledger_entries;
CREATE POLICY "ledger_select" ON public.ledger_entries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ledger_insert" ON public.ledger_entries;
CREATE POLICY "ledger_insert" ON public.ledger_entries FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ledger_update" ON public.ledger_entries;
CREATE POLICY "ledger_update" ON public.ledger_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ledger_delete" ON public.ledger_entries;
CREATE POLICY "ledger_delete" ON public.ledger_entries FOR DELETE TO authenticated USING (true);

-- RLS Policies for tasks
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (true);

-- Trigger for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'role', 'master'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Master User
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'master@plataforma.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'master@plataforma.com',
      crypt('master123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Master", "role": "master"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;
