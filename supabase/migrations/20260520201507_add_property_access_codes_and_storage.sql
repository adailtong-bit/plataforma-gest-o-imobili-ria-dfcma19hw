-- Add new columns to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS access_code text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS locker_code text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS complement text;

-- Create storage bucket for properties if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('properties', 'properties', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for the properties bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'properties');

DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
CREATE POLICY "Authenticated Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'properties');

DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'properties');

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'properties');
