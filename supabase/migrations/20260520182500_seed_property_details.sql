DO $$
DECLARE
  v_admin_id uuid;
  v_property_id uuid;
  v_invoice_id uuid;
  v_ledger_id uuid;
BEGIN
  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'master', 'active')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com' LIMIT 1;
  END IF;

  -- Seed a property for demonstration
  v_property_id := 'f54460f3-8b77-4c31-97b5-0210e75a5e31'::uuid;
  INSERT INTO public.properties (
    id, name, address, number, neighborhood, city, state, zip_code, country,
    type, profile_type, status, bedrooms, bathrooms, guests, area,
    listing_price, hoa_value, owner_id, image
  ) VALUES (
    v_property_id,
    'Villa Sunshine',
    'Ocean Drive',
    '123',
    'South Beach',
    'Miami',
    'FL',
    '33139',
    'US',
    'house',
    'short_term',
    'available',
    4, 3, 8, 3200,
    1500000, 500,
    v_admin_id,
    'https://img.usecurling.com/p/800/600?q=luxury%20villa'
  ) ON CONFLICT (id) DO NOTHING;

  -- Seed some ledger entries
  v_ledger_id := 'c6d2c41d-9e0a-4f51-b847-cf47bc0a5d21'::uuid;
  INSERT INTO public.ledger_entries (
    id, description, amount, type, date, status, category, property_id, cost_type
  ) VALUES (
    v_ledger_id,
    'Monthly HOA Fee',
    500.00,
    'expense',
    NOW() - INTERVAL '5 days',
    'cleared',
    'hoa',
    v_property_id,
    'fixed'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.ledger_entries (
    id, description, amount, type, date, status, category, property_id, cost_type
  ) VALUES (
    gen_random_uuid(),
    'Rental Income',
    4500.00,
    'income',
    NOW() - INTERVAL '2 days',
    'cleared',
    'rental',
    v_property_id,
    'variable'
  ) ON CONFLICT (id) DO NOTHING;

  -- Seed some invoices
  v_invoice_id := 'e5421d0a-115f-4a39-813c-af4f45a9d201'::uuid;
  INSERT INTO public.invoices (
    id, invoice_number, description, amount, status, date, to_name, to_email, property_id, type
  ) VALUES (
    v_invoice_id,
    'INV-2026-001',
    'Plumbing Repair Services',
    250.00,
    'paid',
    NOW() - INTERVAL '10 days',
    'Adailton',
    'adailtong@gmail.com',
    v_property_id,
    'maintenance'
  ) ON CONFLICT (id) DO NOTHING;

END $$;
