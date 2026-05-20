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
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create Storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('property_documents', 'property_documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('hotel_photos', 'hotel_photos', true) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access property_documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert property_documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete property_documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Access hotel_photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert hotel_photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete hotel_photos" ON storage.objects;

-- Create Policies for buckets
CREATE POLICY "Public Access property_documents" ON storage.objects FOR SELECT USING (bucket_id = 'property_documents');
CREATE POLICY "Auth Insert property_documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property_documents' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete property_documents" ON storage.objects FOR DELETE USING (bucket_id = 'property_documents' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access hotel_photos" ON storage.objects FOR SELECT USING (bucket_id = 'hotel_photos');
CREATE POLICY "Auth Insert hotel_photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hotel_photos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete hotel_photos" ON storage.objects FOR DELETE USING (bucket_id = 'hotel_photos' AND auth.role() = 'authenticated');

-- Ensure payment_data exists on hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}'::jsonb;
