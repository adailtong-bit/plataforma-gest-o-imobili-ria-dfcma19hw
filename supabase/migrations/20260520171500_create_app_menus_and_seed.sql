CREATE TABLE IF NOT EXISTS public.app_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  path TEXT,
  parent_id UUID REFERENCES public.app_menus(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  required_role JSONB,
  section TEXT NOT NULL DEFAULT 'main',
  resource TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_menus ADD CONSTRAINT app_menus_label_path_key UNIQUE (label, path);

ALTER TABLE public.app_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON public.app_menus;
CREATE POLICY "authenticated_select" ON public.app_menus
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.app_menus (id, label, icon, path, section, resource, order_index, required_role) VALUES
  (gen_random_uuid(), 'menu.dashboard', 'Home', '/', 'main', 'dashboard', 10, NULL),
  (gen_random_uuid(), 'menu.properties', 'Building2', '/properties', 'main', 'properties', 20, NULL),
  (gen_random_uuid(), 'hotels.title', 'Hotel', '/hotels', 'main', 'hotels', 30, NULL),
  (gen_random_uuid(), 'sidebar.condominiums', 'MapPin', '/condominiums', 'main', 'condominiums', 40, NULL),
  (gen_random_uuid(), 'sidebar.owners', 'Briefcase', '/owners', 'main', 'owners', 50, NULL),
  (gen_random_uuid(), 'sidebar.tenants', 'Users', '/tenants', 'main', 'tenants', 60, NULL),
  (gen_random_uuid(), 'sidebar.calendar', 'Calendar', '/calendar', 'main', 'calendar', 70, NULL),
  (gen_random_uuid(), 'menu.finances', 'DollarSign', '/financial', 'main', 'financial', 80, NULL),
  (gen_random_uuid(), 'menu.invoices', 'FileText', '/invoices', 'main', 'financial', 90, NULL),
  (gen_random_uuid(), 'common.short_term', 'Building2', '/short-term', 'main', 'short_term', 100, NULL),
  (gen_random_uuid(), 'common.visits', 'MapPin', '/visits', 'main', 'visits', 110, NULL),
  (gen_random_uuid(), 'common.renewals', 'Repeat', '/renewals', 'main', 'renewals', 120, NULL),
  (gen_random_uuid(), 'sidebar.reports', 'FileText', '/reports', 'main', 'reports', 130, NULL),
  (gen_random_uuid(), 'common.market_analysis', 'PieChart', '/market-analysis', 'main', 'market_analysis', 140, NULL),

  (gen_random_uuid(), 'sidebar.performance', 'Activity', '/performance', 'operations', 'performance', 10, NULL),
  (gen_random_uuid(), 'sidebar.guest_services', 'HeartHandshake', '/guest-services', 'operations', 'guest_services', 20, NULL),
  (gen_random_uuid(), 'sidebar.pos', 'ShoppingCart', '/pos', 'operations', 'pos', 30, NULL),
  (gen_random_uuid(), 'sidebar.marketing', 'Zap', '/marketing', 'operations', 'marketing', 40, NULL),
  (gen_random_uuid(), 'menu.tasks', 'Wrench', '/tasks', 'operations', 'tasks', 50, NULL),
  (gen_random_uuid(), 'sidebar.front_desk', 'ConciergeBell', '/front-desk', 'operations', 'properties', 60, NULL),
  (gen_random_uuid(), 'sidebar.housekeeping', 'HardHat', '/housekeeping', 'operations', 'tasks', 70, NULL),
  (gen_random_uuid(), 'sidebar.night_audit', 'MoonStar', '/night-audit', 'operations', 'financial', 80, NULL),
  (gen_random_uuid(), 'sidebar.partners', 'HardHat', '/partners', 'operations', 'partners', 90, NULL),
  (gen_random_uuid(), 'menu.messages', 'MessageSquare', '/messages', 'operations', 'messages', 100, NULL),
  (gen_random_uuid(), 'common.workflows', 'Repeat', '/workflows', 'operations', 'workflows', 110, NULL),

  (gen_random_uuid(), 'menu.settings', 'Settings', '/settings', 'system', 'settings', 10, NULL),
  (gen_random_uuid(), 'sidebar.pricing', 'DollarSign', '/pricing', 'system', 'settings', 20, NULL),
  (gen_random_uuid(), 'common.service_pricing', 'DollarSign', '/service-pricing', 'system', 'service_pricing', 30, NULL),
  (gen_random_uuid(), 'sidebar.users', 'Users', '/users', 'system', 'users', 40, NULL),
  (gen_random_uuid(), 'sidebar.publicity_admin', 'Megaphone', '/admin/publicity', 'system', 'publicity', 50, NULL),
  (gen_random_uuid(), 'sidebar.migration_hub', 'Database', '/admin/migration', 'system', 'migration', 60, NULL),
  (gen_random_uuid(), 'common.advanced_analytics', 'PieChart', '/admin/analytics', 'system', 'analytics', 70, NULL),
  (gen_random_uuid(), 'common.automation_rules', 'Zap', '/admin/automation', 'system', 'automation', 80, NULL),
  (gen_random_uuid(), 'sidebar.audit_panel', 'ShieldCheck', '/admin/audit', 'system', 'audit_logs', 90, '["platform_owner"]'::jsonb),
  (gen_random_uuid(), 'sidebar.environment', 'MonitorPlay', '/admin/environment', 'system', 'settings', 100, '["platform_owner"]'::jsonb),
  (gen_random_uuid(), 'sidebar.translations', 'Languages', '/admin/translations', 'system', 'settings', 110, '["platform_owner", "master", "internal_user", "software_tenant"]'::jsonb),

  (gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 10, '["tenant"]'::jsonb),
  (gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 20, '["property_owner"]'::jsonb),
  (gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 30, '["partner"]'::jsonb),
  (gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 40, '["partner_employee"]'::jsonb)
ON CONFLICT (label, path) DO NOTHING;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;
