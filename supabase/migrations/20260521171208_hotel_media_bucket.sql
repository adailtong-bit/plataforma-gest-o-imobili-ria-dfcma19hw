-- Create hotel-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hotel-media', 'hotel-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Configure storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'hotel-media');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hotel-media');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'hotel-media');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'hotel-media');

-- Seed initial data for testing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.hotels WHERE name = 'Grande Hotel Teste') THEN
    INSERT INTO public.hotels (name, city, country, manager_name, manager_email) 
    VALUES ('Grande Hotel Teste', 'Orlando', 'US', 'Test Manager', 'test@example.com');
  END IF;
END $$;
