DO $$
BEGIN
  -- Add booking_id to ledger_entries if missing
  ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL;
  
  -- Add gallery to hotels if missing
  ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}'::text[];
  
  -- Add billing_phone to hotels if missing
  ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS billing_phone text;
END $$;

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('property_documents', 'property_documents', true),
  ('property_photos', 'property_photos', true),
  ('hotel_photos', 'hotel_photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for buckets
DO $$
BEGIN
  -- We assume standard public read access for these specific buckets
  DROP POLICY IF EXISTS "public_read_property_documents" ON storage.objects;
  CREATE POLICY "public_read_property_documents" ON storage.objects FOR SELECT USING (bucket_id = 'property_documents');
  
  DROP POLICY IF EXISTS "auth_insert_property_documents" ON storage.objects;
  CREATE POLICY "auth_insert_property_documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property_documents');
  
  DROP POLICY IF EXISTS "auth_delete_property_documents" ON storage.objects;
  CREATE POLICY "auth_delete_property_documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property_documents');

  DROP POLICY IF EXISTS "public_read_property_photos" ON storage.objects;
  CREATE POLICY "public_read_property_photos" ON storage.objects FOR SELECT USING (bucket_id = 'property_photos');
  
  DROP POLICY IF EXISTS "auth_insert_property_photos" ON storage.objects;
  CREATE POLICY "auth_insert_property_photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property_photos');

  DROP POLICY IF EXISTS "public_read_hotel_photos" ON storage.objects;
  CREATE POLICY "public_read_hotel_photos" ON storage.objects FOR SELECT USING (bucket_id = 'hotel_photos');
  
  DROP POLICY IF EXISTS "auth_insert_hotel_photos" ON storage.objects;
  CREATE POLICY "auth_insert_hotel_photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hotel_photos');
  
  DROP POLICY IF EXISTS "auth_delete_hotel_photos" ON storage.objects;
  CREATE POLICY "auth_delete_hotel_photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hotel_photos');
END $$;
