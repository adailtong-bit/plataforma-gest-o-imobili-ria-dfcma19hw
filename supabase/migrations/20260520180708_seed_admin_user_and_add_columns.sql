-- Add columns to profiles if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Seed Admin User
DO $BLOCK$
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
      crypt('123456', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Master Admin', 'master', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'master';
  END IF;
END $BLOCK$;

-- RLS Policies to ensure master role access
DO $BLOCK$
BEGIN
  DROP POLICY IF EXISTS "master_all_properties" ON public.properties;
  CREATE POLICY "master_all_properties" ON public.properties
    FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());

  DROP POLICY IF EXISTS "master_all_hotels" ON public.hotels;
  CREATE POLICY "master_all_hotels" ON public.hotels
    FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());

  DROP POLICY IF EXISTS "master_all_profiles" ON public.profiles;
  CREATE POLICY "master_all_profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());
END $BLOCK$;

-- RPC for securely creating a profile with linked auth.users
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_phone TEXT DEFAULT NULL,
  p_document TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'active'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $FUNC$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT public.is_admin_or_pm() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;
  
  IF new_user_id IS NULL THEN
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
      p_email,
      crypt(p_password, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      json_build_object('name', p_name, 'role', p_role),
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, name, role, phone, document, city, state, status)
  VALUES (new_user_id, p_email, p_name, p_role, p_phone, p_document, p_city, p_state, p_status)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    document = EXCLUDED.document,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    status = EXCLUDED.status;

  RETURN new_user_id;
END;
$FUNC$;
