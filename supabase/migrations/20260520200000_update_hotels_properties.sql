-- Add image and billing columns to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}'::jsonb;

-- Add documents column to properties if not exists
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Seed data for hotels and properties
DO $$
DECLARE
  seed_hotel_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  seed_prop_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  seed_owner_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
BEGIN
  -- Ensure test owner exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@example.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      seed_owner_id,
      '00000000-0000-0000-0000-000000000000',
      'owner@example.com',
      crypt('OwnerPassword123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Test Owner", "role": "owner"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, phone)
    VALUES (seed_owner_id, 'owner@example.com', 'Test Owner', 'owner', '+1 555 123 4567')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert Hotel
  INSERT INTO public.hotels (
    id, name, manager_name, manager_phone, manager_email,
    address, number, neighborhood, city, state, zip_code, country,
    image, tax_id, billing_address, billing_email, payment_data
  ) VALUES (
    seed_hotel_id, 'Grand Summer Resort', 'John Manager', '+1 555 987 6543', 'manager@grandsummer.com',
    '123 Resort Blvd', 'Suite 1', 'Beachside', 'Miami', 'FL', '33101', 'US',
    'https://img.usecurling.com/p/800/400?q=luxury%20hotel', 'TAX-123456789', '123 Resort Blvd, Miami, FL 33101', 'billing@grandsummer.com', '{"method": "Bank Transfer", "bank": "Chase"}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Property
  INSERT INTO public.properties (
    id, name, address, number, neighborhood, city, state, zip_code, country,
    hotel_id, owner_id, listing_price, status, documents
  ) VALUES (
    seed_prop_id, 'Villa Ocean View', '456 Ocean Drive', 'Apt 10', 'Beachside', 'Miami', 'FL', '33101', 'US',
    seed_hotel_id, seed_owner_id, 500000, 'available', '[]'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

END $$;
