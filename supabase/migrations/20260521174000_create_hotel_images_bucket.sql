-- Create the hotel-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-images', 'hotel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow public read access to hotel images
DROP POLICY IF EXISTS "Public Access to hotel images" ON storage.objects;
CREATE POLICY "Public Access to hotel images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hotel-images');

-- Allow authenticated users to upload/update/delete hotel images
DROP POLICY IF EXISTS "Authenticated users can upload hotel images" ON storage.objects;
CREATE POLICY "Authenticated users can upload hotel images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hotel-images');

DROP POLICY IF EXISTS "Authenticated users can update hotel images" ON storage.objects;
CREATE POLICY "Authenticated users can update hotel images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'hotel-images');

DROP POLICY IF EXISTS "Authenticated users can delete hotel images" ON storage.objects;
CREATE POLICY "Authenticated users can delete hotel images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'hotel-images');
