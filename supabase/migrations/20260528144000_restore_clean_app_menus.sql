DO $$
BEGIN
  -- 1. Ensure RLS policy for app_menus allows authenticated read
  DROP POLICY IF EXISTS "authenticated_select_app_menus" ON public.app_menus;
  CREATE POLICY "authenticated_select_app_menus" ON public.app_menus
    FOR SELECT TO authenticated USING (true);

  -- 2. Clear out all existing corrupted/duplicated menus
  DELETE FROM public.app_menus;

  -- 3. Insert the clean, unified navigation menu
  -- Main Menu (section = 'main')
  INSERT INTO public.app_menus (id, label, icon, route, section, resource, order_index) VALUES
  ('11111111-1111-1111-1111-100000000000', 'menu.dashboard', 'Home', '/', 'main', 'dashboard', 10),
  ('11111111-1111-1111-1111-200000000000', 'menu.properties', 'Building2', '/properties', 'main', 'properties', 20),
  ('11111111-1111-1111-1111-300000000000', 'menu.bookings', 'Calendar', '/bookings', 'main', 'calendar', 30),
  ('11111111-1111-1111-1111-400000000000', 'sidebar.guests', 'Users', '/guests', 'main', 'tenants', 40),
  ('11111111-1111-1111-1111-500000000000', 'hotels.title', 'Hotel', '/hotels', 'main', 'hotels', 50),
  ('11111111-1111-1111-1111-600000000000', 'sidebar.condominiums', 'MapPin', '/condominiums', 'main', 'condominiums', 60),
  ('11111111-1111-1111-1111-700000000000', 'sidebar.owners', 'Briefcase', '/owners', 'main', 'owners', 70),
  ('11111111-1111-1111-1111-800000000000', 'menu.finances', 'DollarSign', '/ledger', 'main', 'financial', 80),
  ('11111111-1111-1111-1111-900000000000', 'menu.invoices', 'FileText', '/invoices', 'main', 'financial', 90),
  ('11111111-1111-1111-1111-a00000000000', 'common.short_term', 'Building2', '/short-term', 'main', 'short_term', 100),
  ('11111111-1111-1111-1111-b00000000000', 'common.visits', 'MapPin', '/visits', 'main', 'visits', 110),
  ('11111111-1111-1111-1111-c00000000000', 'common.renewals', 'Repeat', '/renewals', 'main', 'renewals', 120),
  ('11111111-1111-1111-1111-d00000000000', 'sidebar.reports', 'FileText', '/reports', 'main', 'reports', 130),
  ('11111111-1111-1111-1111-e00000000000', 'common.market_analysis', 'PieChart', '/market-analysis', 'main', 'market_analysis', 140)
  ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label, icon = EXCLUDED.icon, route = EXCLUDED.route, section = EXCLUDED.section, resource = EXCLUDED.resource, order_index = EXCLUDED.order_index;

  -- Operations section (section = 'operations')
  INSERT INTO public.app_menus (id, label, icon, route, section, resource, order_index) VALUES
  ('22222222-2222-2222-2222-100000000000', 'sidebar.performance', 'Activity', '/performance', 'operations', 'performance', 10),
  ('22222222-2222-2222-2222-200000000000', 'menu.tasks', 'Wrench', '/tasks', 'operations', 'tasks', 20),
  ('22222222-2222-2222-2222-300000000000', 'sidebar.guest_services', 'HeartHandshake', '/guest-services', 'operations', 'guest_services', 30),
  ('22222222-2222-2222-2222-400000000000', 'sidebar.pos', 'ShoppingCart', '/pos', 'operations', 'pos', 40),
  ('22222222-2222-2222-2222-500000000000', 'sidebar.front_desk', 'ConciergeBell', '/front-desk', 'operations', 'properties', 50),
  ('22222222-2222-2222-2222-600000000000', 'sidebar.housekeeping', 'HardHat', '/housekeeping', 'operations', 'tasks', 60),
  ('22222222-2222-2222-2222-700000000000', 'sidebar.night_audit', 'MoonStar', '/night-audit', 'operations', 'financial', 70),
  ('22222222-2222-2222-2222-800000000000', 'sidebar.marketing', 'Zap', '/campaigns', 'operations', 'marketing', 80),
  ('22222222-2222-2222-2222-900000000000', 'sidebar.partners', 'HardHat', '/partners', 'operations', 'partners', 90),
  ('22222222-2222-2222-2222-a00000000000', 'menu.messages', 'MessageSquare', '/messages', 'operations', 'messages', 100),
  ('22222222-2222-2222-2222-b00000000000', 'common.workflows', 'Repeat', '/workflows', 'operations', 'workflows', 110)
  ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label, icon = EXCLUDED.icon, route = EXCLUDED.route, section = EXCLUDED.section, resource = EXCLUDED.resource, order_index = EXCLUDED.order_index;

  -- System section (section = 'system')
  INSERT INTO public.app_menus (id, label, icon, route, section, resource, order_index) VALUES
  ('33333333-3333-3333-3333-100000000000', 'menu.settings', 'Settings', '/settings', 'system', 'settings', 10),
  ('33333333-3333-3333-3333-200000000000', 'menu.system.pricing', 'DollarSign', '/pricing', 'system', 'settings', 20),
  ('33333333-3333-3333-3333-300000000000', 'common.service_pricing', 'DollarSign', '/service-pricing', 'system', 'service_pricing', 30),
  ('33333333-3333-3333-3333-400000000000', 'menu.system.users', 'Users', '/users', 'system', 'users', 40),
  ('33333333-3333-3333-3333-500000000000', 'menu.system.ad_admin', 'Megaphone', '/admin/publicity', 'system', 'publicity', 50),
  ('33333333-3333-3333-3333-600000000000', 'menu.system.migration_hub', 'Database', '/admin/migration', 'system', 'migration', 60),
  ('33333333-3333-3333-3333-700000000000', 'menu.system.advanced_analytics', 'PieChart', '/admin/analytics', 'system', 'analytics', 70),
  ('33333333-3333-3333-3333-800000000000', 'menu.system.automation_rules', 'Zap', '/admin/automation', 'system', 'automation', 80)
  ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label, icon = EXCLUDED.icon, route = EXCLUDED.route, section = EXCLUDED.section, resource = EXCLUDED.resource, order_index = EXCLUDED.order_index;
    
  -- System section restricted roles
  INSERT INTO public.app_menus (id, label, icon, route, section, resource, role_required, order_index) VALUES
  ('33333333-3333-3333-3333-900000000000', 'sidebar.audit_panel', 'ShieldCheck', '/admin/audit', 'system', 'audit_logs', 'platform_owner', 90),
  ('33333333-3333-3333-3333-a00000000000', 'sidebar.environment', 'MonitorPlay', '/admin/environment', 'system', 'settings', 'platform_owner', 100),
  ('33333333-3333-3333-3333-b00000000000', 'sidebar.translations', 'Languages', '/admin/translations', 'system', 'settings', 'platform_owner', 110)
  ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label, icon = EXCLUDED.icon, route = EXCLUDED.route, section = EXCLUDED.section, resource = EXCLUDED.resource, role_required = EXCLUDED.role_required, order_index = EXCLUDED.order_index;

  -- Portal section (section = 'portal')
  INSERT INTO public.app_menus (id, label, icon, route, section, resource, role_required, order_index) VALUES
  ('44444444-4444-4444-4444-100000000000', 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 'tenant', 10),
  ('44444444-4444-4444-4444-200000000000', 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 'property_owner', 20),
  ('44444444-4444-4444-4444-300000000000', 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 'partner', 30),
  ('44444444-4444-4444-4444-400000000000', 'menu.main_dashboard', 'Home', '/', 'portal', 'dashboard', 'partner_employee', 40)
  ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label, icon = EXCLUDED.icon, route = EXCLUDED.route, section = EXCLUDED.section, resource = EXCLUDED.resource, role_required = EXCLUDED.role_required, order_index = EXCLUDED.order_index;

END $$;
