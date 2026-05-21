ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Create storage bucket for hotels
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hotels', 'hotels', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for hotels storage bucket
DROP POLICY IF EXISTS "hotels_public_select" ON storage.objects;
CREATE POLICY "hotels_public_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'hotels');

DROP POLICY IF EXISTS "hotels_auth_insert" ON storage.objects;
CREATE POLICY "hotels_auth_insert" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hotels');

DROP POLICY IF EXISTS "hotels_auth_update" ON storage.objects;
CREATE POLICY "hotels_auth_update" ON storage.objects 
FOR UPDATE TO authenticated USING (bucket_id = 'hotels');

DROP POLICY IF EXISTS "hotels_auth_delete" ON storage.objects;
CREATE POLICY "hotels_auth_delete" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id = 'hotels');
