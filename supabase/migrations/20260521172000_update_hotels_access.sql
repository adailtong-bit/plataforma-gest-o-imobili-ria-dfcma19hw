DO $$
BEGIN
  -- Add new columns for access control
  ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS general_access_code TEXT;
  ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS pool_access_code TEXT;
  ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS game_room_access_code TEXT;
END $$;

-- Ensure hotel-media bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hotel-media', 'hotel-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hotel-media (using idempotent drop/create)
DROP POLICY IF EXISTS "Public Access to hotel-media" ON storage.objects;
CREATE POLICY "Public Access to hotel-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'hotel-media');

DROP POLICY IF EXISTS "Authenticated users can upload to hotel-media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to hotel-media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hotel-media');

DROP POLICY IF EXISTS "Authenticated users can update hotel-media" ON storage.objects;
CREATE POLICY "Authenticated users can update hotel-media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'hotel-media');

DROP POLICY IF EXISTS "Authenticated users can delete hotel-media" ON storage.objects;
CREATE POLICY "Authenticated users can delete hotel-media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'hotel-media');
