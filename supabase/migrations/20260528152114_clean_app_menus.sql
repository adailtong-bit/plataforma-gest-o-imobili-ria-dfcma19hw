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
(gen_random_uuid(), 'menu.dashboard', 'Home', '/', 'main', 1, NULL, 'dashboard', NULL),
(gen_random_uuid(), 'menu.properties', 'Building2', '/properties', 'main', 2, NULL, 'properties', NULL),
(gen_random_uuid(), 'hotels.title', 'Hotel', '/hotels', 'main', 3, NULL, 'hotels', NULL),
(gen_random_uuid(), 'sidebar.condominiums', 'MapPin', '/condominiums', 'main', 4, NULL, 'condominiums', NULL),
(gen_random_uuid(), 'sidebar.owners', 'Briefcase', '/owners', 'main', 5, NULL, 'owners', NULL),
(gen_random_uuid(), 'sidebar.tenants', 'Users', '/guests', 'main', 6, NULL, 'tenants', NULL),
(gen_random_uuid(), 'sidebar.calendar', 'Calendar', '/bookings', 'main', 7, NULL, 'calendar', NULL),
(gen_random_uuid(), 'menu.finances', 'DollarSign', '/finance', 'main', 8, NULL, 'financial', NULL),
(gen_random_uuid(), 'menu.invoices', 'FileText', '/invoices', 'main', 9, NULL, 'financial', NULL),
(gen_random_uuid(), 'common.short_term', 'Building2', '/short-term', 'main', 10, NULL, 'short_term', NULL),
(gen_random_uuid(), 'common.visits', 'MapPin', '/visits', 'main', 11, NULL, 'visits', NULL),
(gen_random_uuid(), 'common.renewals', 'Repeat', '/renewals', 'main', 12, NULL, 'renewals', NULL),
(gen_random_uuid(), 'sidebar.reports', 'FileText', '/reports', 'main', 13, NULL, 'reports', NULL),
(gen_random_uuid(), 'common.market_analysis', 'PieChart', '/market-analysis', 'main', 14, NULL, 'market_analysis', NULL),

(gen_random_uuid(), 'sidebar.performance', 'Activity', '/performance', 'operations', 1, NULL, 'performance', NULL),
(gen_random_uuid(), 'sidebar.guest_services', 'HeartHandshake', '/guest-services', 'operations', 2, NULL, 'guest_services', NULL),
(gen_random_uuid(), 'sidebar.pos', 'ShoppingCart', '/pos', 'operations', 3, NULL, 'pos', NULL),
(gen_random_uuid(), 'sidebar.marketing', 'Zap', '/marketing', 'operations', 4, NULL, 'marketing', NULL),
(gen_random_uuid(), 'menu.tasks', 'Wrench', '/tasks', 'operations', 5, NULL, 'tasks', NULL),
(gen_random_uuid(), 'sidebar.front_desk', 'ConciergeBell', '/front-desk', 'operations', 6, NULL, 'properties', NULL),
(gen_random_uuid(), 'sidebar.housekeeping', 'HardHat', '/housekeeping', 'operations', 7, NULL, 'tasks', NULL),
(gen_random_uuid(), 'sidebar.night_audit', 'MoonStar', '/night-audit', 'operations', 8, NULL, 'financial', NULL),
(gen_random_uuid(), 'sidebar.partners', 'HardHat', '/partners', 'operations', 9, NULL, 'partners', NULL),
(gen_random_uuid(), 'menu.messages', 'MessageSquare', '/messages', 'operations', 10, NULL, 'messages', NULL),
(gen_random_uuid(), 'common.workflows', 'Repeat', '/workflows', 'operations', 11, NULL, 'workflows', NULL),

(gen_random_uuid(), 'menu.settings', 'Settings', '/settings', 'system', 1, NULL, 'settings', NULL),
(gen_random_uuid(), 'menu.system.pricing', 'DollarSign', '/pricing', 'system', 2, NULL, 'settings', NULL),
(gen_random_uuid(), 'common.service_pricing', 'DollarSign', '/service-pricing', 'system', 3, NULL, 'service_pricing', NULL),
(gen_random_uuid(), 'menu.system.users', 'Users', '/users', 'system', 4, NULL, 'users', NULL),
(gen_random_uuid(), 'menu.system.ad_admin', 'Megaphone', '/admin/publicity', 'system', 5, NULL, 'publicity', NULL),
(gen_random_uuid(), 'menu.system.migration_hub', 'Database', '/admin/migration', 'system', 6, NULL, 'migration', NULL),
(gen_random_uuid(), 'menu.system.advanced_analytics', 'PieChart', '/admin/analytics', 'system', 7, NULL, 'analytics', NULL),
(gen_random_uuid(), 'menu.system.automation_rules', 'Zap', '/admin/automation', 'system', 8, NULL, 'automation', NULL),
(gen_random_uuid(), 'sidebar.audit_panel', 'ShieldCheck', '/admin/audit', 'system', 9, NULL, 'audit_logs', 'platform_owner'),
(gen_random_uuid(), 'sidebar.environment', 'MonitorPlay', '/admin/environment', 'system', 10, NULL, 'settings', 'platform_owner'),
(gen_random_uuid(), 'sidebar.translations', 'Languages', '/admin/translations', 'system', 11, NULL, 'settings', 'platform_owner'),

(gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'tenant'),
(gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'property_owner'),
(gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'partner'),
(gen_random_uuid(), 'menu.main_dashboard', 'Home', '/', 'portal', 1, NULL, 'dashboard', 'partner_employee'),
(gen_random_uuid(), 'menu.messages_pm_sync', 'MessageSquare', '/messages', 'portal', 2, NULL, 'messages', 'property_owner'),
(gen_random_uuid(), 'menu.messages', 'MessageSquare', '/messages', 'portal', 2, NULL, 'messages', 'tenant'),
(gen_random_uuid(), 'menu.tasks', 'Wrench', '/tasks', 'portal', 2, NULL, 'tasks', 'partner'),
(gen_random_uuid(), 'menu.messages', 'MessageSquare', '/messages', 'portal', 3, NULL, 'messages', 'partner'),
(gen_random_uuid(), 'menu.tasks', 'Wrench', '/tasks', 'portal', 2, NULL, 'tasks', 'partner_employee'),
(gen_random_uuid(), 'menu.messages', 'MessageSquare', '/messages', 'portal', 3, NULL, 'messages', 'partner_employee');
