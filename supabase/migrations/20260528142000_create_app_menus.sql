CREATE TABLE IF NOT EXISTS public.app_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    icon TEXT,
    route TEXT NOT NULL,
    parent_id UUID REFERENCES public.app_menus(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    role_required TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    section TEXT,
    resource TEXT
);

ALTER TABLE public.app_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_app_menus" ON public.app_menus;
CREATE POLICY "authenticated_select_app_menus" ON public.app_menus
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.app_menus (id, label, icon, route, section, resource, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'menu.dashboard', 'Home', '/', 'main', 'dashboard', 10),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'menu.properties', 'Building2', '/properties', 'main', 'properties', 20),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'menu.bookings', 'Calendar', '/bookings', 'main', 'calendar', 30),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'menu.tasks', 'Wrench', '/tasks', 'operations', 'tasks', 40),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'menu.profiles', 'Users', '/profiles', 'system', 'users', 50)
ON CONFLICT (id) DO NOTHING;
