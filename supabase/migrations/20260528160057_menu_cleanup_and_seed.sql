DO $DO_BLOCK$
DECLARE
  new_user_id uuid;
BEGIN
  -- Clean up duplicate menus by route to prevent overlapping items
  DELETE FROM public.app_menus a
  WHERE a.id IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY route ORDER BY order_index ASC, created_at ASC) as rnum
      FROM public.app_menus
      WHERE route IS NOT NULL AND route != '' AND route != '#'
    ) t
    WHERE t.rnum > 1
  );

  -- Explicitly remove '/dashboard' if '/' already exists to avoid the double Dashboard bug
  IF EXISTS (SELECT 1 FROM public.app_menus WHERE route = '/') THEN
    DELETE FROM public.app_menus WHERE route = '/dashboard';
  END IF;

  -- Remove duplicate labels where route is the same (or empty/null)
  DELETE FROM public.app_menus a
  WHERE a.id IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY label, parent_id ORDER BY order_index ASC) as rnum
      FROM public.app_menus
    ) t
    WHERE t.rnum > 1
  );

  -- Idempotent Seed for Admin User
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
      '{"name": "Adailton Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $DO_BLOCK$;
