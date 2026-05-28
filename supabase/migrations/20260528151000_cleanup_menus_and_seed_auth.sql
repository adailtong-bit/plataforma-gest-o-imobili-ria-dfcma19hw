DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Create adailtong@gmail.com user
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
      '{"name": "Admin Master", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Admin Master', 'master', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'master';
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Admin Master", "role": "master"}' WHERE id = new_user_id;
    UPDATE public.profiles SET role = 'master' WHERE id = new_user_id;
  END IF;

  -- 2. Clean up duplicates (keep oldest)
  DELETE FROM public.app_menus a
  USING (
    SELECT min(id) as id, route
    FROM public.app_menus
    GROUP BY route
    HAVING count(*) > 1
  ) b
  WHERE a.route = b.route AND a.id <> b.id;

  -- Remove legacy routes that are being renamed
  DELETE FROM public.app_menus WHERE route IN ('/calendar', '/tenants', '/financial');

  -- 3. Upsert specific menus
  -- /
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/') THEN
    UPDATE public.app_menus SET label = 'Painel de Controle', icon = 'Home', section = 'main', order_index = 1 WHERE route = '/';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Painel de Controle', '/', 'Home', 'main', 1, 'dashboard');
  END IF;

  -- /properties
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/properties') THEN
    UPDATE public.app_menus SET label = 'Propriedades', icon = 'Building2', section = 'main', order_index = 2 WHERE route = '/properties';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Propriedades', '/properties', 'Building2', 'main', 2, 'properties');
  END IF;

  -- /hotels
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/hotels') THEN
    UPDATE public.app_menus SET label = 'Hotéis', icon = 'Hotel', section = 'main', order_index = 3 WHERE route = '/hotels';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Hotéis', '/hotels', 'Hotel', 'main', 3, 'hotels');
  END IF;

  -- /condominiums
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/condominiums') THEN
    UPDATE public.app_menus SET label = 'Condomínios', icon = 'MapPin', section = 'main', order_index = 4 WHERE route = '/condominiums';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Condomínios', '/condominiums', 'MapPin', 'main', 4, 'condominiums');
  END IF;

  -- /owners
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/owners') THEN
    UPDATE public.app_menus SET label = 'Proprietários', icon = 'Briefcase', section = 'main', order_index = 5 WHERE route = '/owners';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Proprietários', '/owners', 'Briefcase', 'main', 5, 'owners');
  END IF;

  -- /guests
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/guests') THEN
    UPDATE public.app_menus SET label = 'Inquilinos', icon = 'Users', section = 'main', order_index = 6 WHERE route = '/guests';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Inquilinos', '/guests', 'Users', 'main', 6, 'tenants');
  END IF;

  -- /bookings
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/bookings') THEN
    UPDATE public.app_menus SET label = 'Reservas', icon = 'Calendar', section = 'main', order_index = 7 WHERE route = '/bookings';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Reservas', '/bookings', 'Calendar', 'main', 7, 'calendar');
  END IF;

  -- /finance
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/finance') THEN
    UPDATE public.app_menus SET label = 'Financeiro', icon = 'DollarSign', section = 'main', order_index = 8 WHERE route = '/finance';
  ELSE
    INSERT INTO public.app_menus (id, label, route, icon, section, order_index, resource) VALUES (gen_random_uuid(), 'Financeiro', '/finance', 'DollarSign', 'main', 8, 'financial');
  END IF;

END $$;
