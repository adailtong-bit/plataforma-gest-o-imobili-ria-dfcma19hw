DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed core user adailtong@gmail.com with role master
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
      v_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Ensure core menus exist idempotently to prevent them from "disappearing"
  IF NOT EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/') THEN
    INSERT INTO public.app_menus (label, icon, route, section, order_index, resource) VALUES ('menu.dashboard', 'Home', '/', 'main', 1, 'dashboard');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/properties') THEN
    INSERT INTO public.app_menus (label, icon, route, section, order_index, resource) VALUES ('menu.properties', 'Building2', '/properties', 'main', 2, 'properties');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/calendar') THEN
    INSERT INTO public.app_menus (label, icon, route, section, order_index, resource) VALUES ('menu.bookings', 'Calendar', '/calendar', 'main', 3, 'calendar');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/guests') THEN
    INSERT INTO public.app_menus (label, icon, route, section, order_index, resource) VALUES ('menu.guests', 'Users', '/guests', 'main', 4, 'tenants');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/admin/analytics') THEN
    INSERT INTO public.app_menus (label, icon, route, section, order_index, resource) VALUES ('menu.analytics', 'PieChart', '/admin/analytics', 'system', 5, 'analytics');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/settings') THEN
    INSERT INTO public.app_menus (label, icon, route, section, order_index, resource) VALUES ('menu.settings', 'Settings', '/settings', 'system', 6, 'settings');
  END IF;
END $$;

-- Fix RLS on app_menus and ui_translations to guarantee authenticated users can view menus and translations
DROP POLICY IF EXISTS "authenticated_select_app_menus" ON public.app_menus;
CREATE POLICY "authenticated_select_app_menus" ON public.app_menus
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_translations" ON public.ui_translations;
CREATE POLICY "authenticated_select_translations" ON public.ui_translations
  FOR SELECT TO authenticated USING (true);
