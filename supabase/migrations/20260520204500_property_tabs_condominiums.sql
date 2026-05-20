-- 1. Create Condominiums table
CREATE TABLE IF NOT EXISTS public.condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "condominiums_all" ON public.condominiums;
CREATE POLICY "condominiums_all" ON public.condominiums
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Update properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS internet_link TEXT;

-- 3. Property Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for property-images
DROP POLICY IF EXISTS "public_read_property_images" ON storage.objects;
CREATE POLICY "public_read_property_images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "auth_insert_property_images" ON storage.objects;
CREATE POLICY "auth_insert_property_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "auth_update_property_images" ON storage.objects;
CREATE POLICY "auth_update_property_images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "auth_delete_property_images" ON storage.objects;
CREATE POLICY "auth_delete_property_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images');

-- 4. Auth seed user
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
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
