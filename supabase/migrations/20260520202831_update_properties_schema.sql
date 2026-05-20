DO $$
BEGIN
  ALTER TABLE public.properties 
    ADD COLUMN IF NOT EXISTS internet_link text,
    ADD COLUMN IF NOT EXISTS locker_code text,
    ADD COLUMN IF NOT EXISTS access_code text,
    ADD COLUMN IF NOT EXISTS complement text;
END $$;

DROP POLICY IF EXISTS "master_all_properties" ON public.properties;
DROP POLICY IF EXISTS "properties_delete" ON public.properties;
DROP POLICY IF EXISTS "properties_insert" ON public.properties;
DROP POLICY IF EXISTS "properties_select" ON public.properties;
DROP POLICY IF EXISTS "properties_update" ON public.properties;

CREATE POLICY "properties_select" ON public.properties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "properties_insert" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "properties_update" ON public.properties
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "properties_delete" ON public.properties
  FOR DELETE TO authenticated USING (true);

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
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
