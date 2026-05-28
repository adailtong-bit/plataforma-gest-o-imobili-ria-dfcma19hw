DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Seed user adailtong@gmail.com
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
      '00000000-0000-0000-0000-000000000000'::uuid,
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Adailton G"}'::jsonb,
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton G', 'platform_owner')
    ON CONFLICT (id) DO UPDATE SET role = 'platform_owner';
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
    UPDATE public.profiles SET role = 'platform_owner' WHERE id = new_user_id;
  END IF;

  -- 2. Clean up app_menus table to avoid duplicates (Financeiro vs finances)
  DELETE FROM public.app_menus 
  WHERE route IN ('/financial', '/finance', '/finances', '/ledger', '/financeiro')
     OR label ILIKE '%finance%' OR label ILIKE '%ledger%';

  -- 3. Insert standard app_menus with explicit ::uuid casting and ON CONFLICT DO NOTHING
  INSERT INTO public.app_menus (id, label, icon, route, order_index, section) VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'menu.dashboard', 'LayoutDashboard', '/', 1, 'main'),
  ('22222222-2222-2222-2222-222222222221'::uuid, 'menu.properties', 'Building2', '/properties', 2, 'operations'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'menu.hotels', 'Hotel', '/hotels', 3, 'operations'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'menu.condominiums', 'Building', '/condominiums', 4, 'operations'),
  ('22222222-2222-2222-2222-222222222224'::uuid, 'menu.calendar', 'Calendar', '/calendar', 5, 'operations'),
  ('22222222-2222-2222-2222-222222222225'::uuid, 'menu.tenants', 'Users', '/tenants', 6, 'operations'),
  ('22222222-2222-2222-2222-222222222226'::uuid, 'menu.owners', 'UserCheck', '/owners', 7, 'operations'),
  ('22222222-2222-2222-2222-222222222227'::uuid, 'menu.partners', 'Handshake', '/partners', 8, 'operations'),
  ('22222222-2222-2222-2222-222222222228'::uuid, 'menu.tasks', 'CheckSquare', '/tasks', 9, 'operations'),
  ('33333333-3333-3333-3333-333333333331'::uuid, 'menu.finances', 'DollarSign', '/financial', 10, 'operations'),
  ('44444444-4444-4444-4444-444444444441'::uuid, 'menu.users', 'UsersRound', '/users', 11, 'system'),
  ('44444444-4444-4444-4444-444444444442'::uuid, 'menu.settings', 'Settings', '/settings', 12, 'system')
  ON CONFLICT (id) DO NOTHING;

END $$;
