DO $$
BEGIN
  -- Create table if it doesn't exist to prevent PGRST205 entirely
  CREATE TABLE IF NOT EXISTS public.app_menus (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      label text NOT NULL,
      icon text,
      route text NOT NULL,
      parent_id uuid REFERENCES public.app_menus(id) ON DELETE CASCADE,
      order_index integer DEFAULT 0,
      role_required text,
      section text,
      resource text,
      created_at timestamp with time zone DEFAULT now()
  );

  -- Fix RLS Policies for safe querying
  ALTER TABLE public.app_menus ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "authenticated_select_app_menus" ON public.app_menus;
  CREATE POLICY "authenticated_select_app_menus" ON public.app_menus
    FOR SELECT TO authenticated USING (true);

  -- Insert Main section
  INSERT INTO public.app_menus (id, label, icon, route, order_index, section, resource) VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'menu.dashboard', 'Home', '/', 10, 'main', 'dashboard'),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'menu.properties', 'Building2', '/properties', 20, 'main', 'properties'),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'hotels.title', 'Hotel', '/hotels', 30, 'main', 'hotels'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'menu.bookings', 'Calendar', '/bookings', 40, 'main', 'calendar'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'sidebar.guests', 'Users', '/guests', 50, 'main', 'tenants')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Operations section
  INSERT INTO public.app_menus (id, label, icon, route, order_index, section, resource) VALUES
    ('00000000-0000-0000-0000-000000000006'::uuid, 'menu.tasks', 'Wrench', '/tasks', 10, 'operations', 'tasks'),
    ('00000000-0000-0000-0000-000000000007'::uuid, 'menu.invoices', 'FileText', '/invoices', 20, 'operations', 'financial'),
    ('00000000-0000-0000-0000-000000000008'::uuid, 'sidebar.ledger', 'DollarSign', '/ledger', 30, 'operations', 'financial'),
    ('00000000-0000-0000-0000-000000000009'::uuid, 'sidebar.campaigns', 'Megaphone', '/campaigns', 40, 'operations', 'marketing'),
    ('00000000-0000-0000-0000-000000000010'::uuid, 'menu.messages', 'MessageSquare', '/messages', 50, 'operations', 'messages')
  ON CONFLICT (id) DO NOTHING;

  -- Insert System section
  INSERT INTO public.app_menus (id, label, icon, route, order_index, section, resource) VALUES
    ('00000000-0000-0000-0000-000000000011'::uuid, 'menu.settings', 'Settings', '/settings', 10, 'system', 'settings'),
    ('00000000-0000-0000-0000-000000000012'::uuid, 'menu.system.users', 'Users', '/users', 20, 'system', 'users'),
    ('00000000-0000-0000-0000-000000000013'::uuid, 'sidebar.environment', 'MonitorPlay', '/admin/environment', 30, 'system', 'settings')
  ON CONFLICT (id) DO NOTHING;

END $$;
