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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'platform_owner')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS "number" TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS complement TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.publicity_pricing_matrix ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ DEFAULT NOW();

DROP POLICY IF EXISTS "platform_owner_all_advertisers" ON public.advertisers;
CREATE POLICY "platform_owner_all_advertisers" ON public.advertisers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('platform_owner', 'master')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('platform_owner', 'master')
    )
  );

DROP POLICY IF EXISTS "platform_owner_all_pricing" ON public.publicity_pricing_matrix;
CREATE POLICY "platform_owner_all_pricing" ON public.publicity_pricing_matrix
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('platform_owner', 'master')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('platform_owner', 'master')
    )
  );

DROP POLICY IF EXISTS "platform_owner_all_campaigns" ON public.publicity_campaigns;
CREATE POLICY "platform_owner_all_campaigns" ON public.publicity_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('platform_owner', 'master')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('platform_owner', 'master')
    )
  );
