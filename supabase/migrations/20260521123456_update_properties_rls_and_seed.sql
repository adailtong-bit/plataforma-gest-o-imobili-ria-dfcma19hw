DO $$
DECLARE
  v_new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '',
      '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties_select_all" ON public.properties;
CREATE POLICY "properties_select_all" ON public.properties
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "properties_insert_auth" ON public.properties;
CREATE POLICY "properties_insert_auth" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "properties_update_auth" ON public.properties;
CREATE POLICY "properties_update_auth" ON public.properties
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "properties_delete_auth" ON public.properties;
CREATE POLICY "properties_delete_auth" ON public.properties
  FOR DELETE TO authenticated USING (true);
