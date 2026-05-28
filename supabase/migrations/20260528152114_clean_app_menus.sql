-- 1. Ensure the user adailtong@gmail.com is master
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert adailtong@gmail.com into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Admin Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET role = 'master' WHERE id = v_user_id;
  END IF;
END $$;

-- 2. Clear out duplicate or dirty app_menus and seed fresh
TRUNCATE TABLE public.app_menus CASCADE;

-- Insert clean unified menus
INSERT INTO public.app_menus (id, label, icon, route, section, order_index, parent_id, resource, role_required) VALUES
('dashboard', 'menu.dashboard', 'Home', '/', 'main', 1, NULL, 'dashboard', NULL),
('properties', 'menu.properties', 'Building2', '/properties', 'main', 2, NULL, 'properties', NULL),
('hotels', 'hotels.title', 'Hotel', '/hotels', 'main', 3, NULL, 'hotels', NULL),
('condominiums', 'sidebar.condominiums', 'MapPin', '/condominiums', 'main', 4, NULL, 'condominiums', NULL),
('owners', 'sidebar.owners', 'Briefcase', '/owners', 'main', 5, NULL, 'owners', NULL),
('guests', 'sidebar.tenants', 'Users', '/guests', 'main', 6, NULL, 'tenants', NULL),
('bookings', 'sidebar.calendar', 'Calendar', '/bookings', 'main', 7, NULL, 'calendar', NULL),
('finance', 'menu.finances', 'DollarSign', '/finance', 'main', 8, NULL, 'financial', NULL),
('invoices', 'menu.invoices', 'FileText', '/invoices', 'main', 9, NULL, 'financial', NULL),
('short-term', 'common.short_term', 'Building2', '/short-term', 'main', 10, NULL, 'short_term', NULL),
('visits', 'common.visits', 'MapPin', '/visits', 'main', 11, NULL, 'visits', NULL),
('renewals', 'common.renewals', 'Repeat', '/renewals', 'main', 12, NULL, 'renewals', NULL),
('reports', 'sidebar.reports', 'FileText', '/reports', 'main', 13, NULL, 'reports', NULL),
('market-analysis', 'common.market_analysis', 'PieChart', '/market-analysis', 'main', 14, NULL, 'market_analysis', NULL),

('performance', 'sidebar.performance', 'Activity', '/performance', 'operations', 1, NULL, 'performance', NULL),
('guest-services', 'sidebar.guest_services', 'HeartHandshake', '/guest-services', 'operations', 2, NULL, 'guest_services', NULL),
('pos', 'sidebar.pos', 'ShoppingCart', '/pos', 'operations', 3, NULL, 'pos', NULL),
('marketing', 'sidebar.marketing', 'Zap', '/marketing', 'operations', 4, NULL, 'marketing', NULL),
('tasks', 'menu.tasks', 'Wrench', '/tasks', 'operations', 5, NULL, 'tasks', NULL),
('front-desk', 'sidebar.front_desk', 'ConciergeBell', '/front-desk', 'operations', 6, NULL, 'properties', NULL),
('housekeeping', 'sidebar.housekeeping', 'HardHat', '/housekeeping', 'operations', 7, NULL, 'tasks', NULL),
('night-audit', 'sidebar.night_audit', 'MoonStar', '/night-audit', 'operations', 8, NULL, 'financial', NULL),
('partners', 'sidebar.partners', 'HardHat', '/partners', 'operations', 9, NULL, 'partners', NULL),
('messages', 'menu.messages', 'MessageSquare', '/messages', 'operations', 10, NULL, 'messages', NULL),
('workflows', 'common.workflows', 'Repeat', '/workflows', 'operations', 11, NULL, 'workflows', NULL),

('settings', 'menu.settings', 'Settings', '/settings', 'system', 1, NULL, 'settings', NULL),
('pricing', 'menu.system.pricing', 'DollarSign', '/pricing', 'system', 2, NULL, 'settings', NULL),
('service-pricing', 'common.service_pricing', 'DollarSign', '/service-pricing', 'system', 3, NULL, 'service_pricing', NULL),
('users', 'menu.system.users', 'Users', '/users', 'system', 4, NULL, 'users', NULL),
('publicity-admin', 'menu.system.ad_admin', 'Megaphone', '/admin/publicity', 'system', 5, NULL, 'publicity', NULL),
('migration-hub', 'menu.system.migration_hub', 'Database', '/admin/migration', 'system', 6, NULL, 'migration', NULL),
('analytics', 'menu.system.advanced_analytics', 'PieChart', '/admin/analytics', 'system', 7, NULL, 'analytics', NULL),
('automation', 'menu.system.automation_rules', 'Zap', '/admin/automation', 'system', 8, NULL, 'automation', NULL),
('audit', 'sidebar.audit_panel', 'ShieldCheck', '/admin/audit', 'system', 9, NULL, 'audit_logs', 'platform_owner'),
('environment', 'sidebar.environment', 'MonitorPlay', '/admin/environment', 'system', 10, NULL, 'settings', 'platform_owner'),
('translations', 'sidebar.translations', 'Languages', '/admin/translations', 'system', 11, NULL, 'settings', 'platform_owner'),

('portal-tenant', 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'tenant'),
('portal-owner', 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'property_owner'),
('portal-partner', 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'partner'),
('portal-partner-employee', 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'partner_employee'),
('portal-owner-msg', 'menu.messages_pm_sync', 'MessageSquare', '/messages', 'portal', 2, NULL, 'messages', 'property_owner'),
('portal-tenant-msg', 'menu.messages', 'MessageSquare', '/messages', 'portal', 2, NULL, 'messages', 'tenant'),
('portal-partner-tasks', 'menu.tasks', 'Wrench', '/tasks', 'portal', 2, NULL, 'tasks', 'partner'),
('portal-partner-msg', 'menu.messages', 'MessageSquare', '/messages', 'portal', 3, NULL, 'messages', 'partner'),
('portal-pe-tasks', 'menu.tasks', 'Wrench', '/tasks', 'portal', 2, NULL, 'tasks', 'partner_employee'),
('portal-pe-msg', 'menu.messages', 'MessageSquare', '/messages', 'portal', 3, NULL, 'messages', 'partner_employee');
