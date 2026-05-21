-- Add documents column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('hotel-images', 'hotel-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('owner-documents', 'owner-documents', true) ON CONFLICT (id) DO NOTHING;

-- Policies for hotel-images
DROP POLICY IF EXISTS "Public Select hotel-images" ON storage.objects;
CREATE POLICY "Public Select hotel-images" ON storage.objects FOR SELECT USING (bucket_id = 'hotel-images');

DROP POLICY IF EXISTS "Auth Insert hotel-images" ON storage.objects;
CREATE POLICY "Auth Insert hotel-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hotel-images');

DROP POLICY IF EXISTS "Auth Update hotel-images" ON storage.objects;
CREATE POLICY "Auth Update hotel-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'hotel-images');

DROP POLICY IF EXISTS "Auth Delete hotel-images" ON storage.objects;
CREATE POLICY "Auth Delete hotel-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hotel-images');

-- Policies for owner-documents
DROP POLICY IF EXISTS "Public Select owner-documents" ON storage.objects;
CREATE POLICY "Public Select owner-documents" ON storage.objects FOR SELECT USING (bucket_id = 'owner-documents');

DROP POLICY IF EXISTS "Auth Insert owner-documents" ON storage.objects;
CREATE POLICY "Auth Insert owner-documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'owner-documents');

DROP POLICY IF EXISTS "Auth Update owner-documents" ON storage.objects;
CREATE POLICY "Auth Update owner-documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'owner-documents');

DROP POLICY IF EXISTS "Auth Delete owner-documents" ON storage.objects;
CREATE POLICY "Auth Delete owner-documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'owner-documents');
