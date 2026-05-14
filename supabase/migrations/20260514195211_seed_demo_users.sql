-- Seed the missing test users requested by the client
DO $$
DECLARE
  master_id uuid;
  admin_id uuid;
  partner_id uuid;
  owner_id uuid;
  tenant_id uuid;
  prop_id uuid;
BEGIN
  -- get master id
  SELECT id INTO master_id FROM auth.users WHERE email = 'master@plataforma.com';

  -- Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@plataforma.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'admin@plataforma.com',
      crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Admin User", "role": "admin"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@plataforma.com';
  END IF;

  -- Partner User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'parceiro@plataforma.com') THEN
    partner_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      partner_id, '00000000-0000-0000-0000-000000000000', 'parceiro@plataforma.com',
      crypt('parceiro123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Partner User", "role": "partner"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO partner_id FROM auth.users WHERE email = 'parceiro@plataforma.com';
  END IF;

  -- Owner User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'proprietario@plataforma.com') THEN
    owner_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      owner_id, '00000000-0000-0000-0000-000000000000', 'proprietario@plataforma.com',
      crypt('proprietario123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Owner User", "role": "property_owner"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO owner_id FROM auth.users WHERE email = 'proprietario@plataforma.com';
  END IF;

  -- Tenant User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'locatario@plataforma.com') THEN
    tenant_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      tenant_id, '00000000-0000-0000-0000-000000000000', 'locatario@plataforma.com',
      crypt('locatario123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Tenant User", "role": "tenant"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO tenant_id FROM auth.users WHERE email = 'locatario@plataforma.com';
  END IF;

  -- Give triggers time to create the corresponding profiles
  PERFORM pg_sleep(0.5);

  -- Link demo users to the Master PM user so that chat and routing works correctly
  IF master_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET pm_id = master_id 
    WHERE id IN (owner_id, tenant_id, partner_id);

    -- Create a test property linking Owner and PM to guarantee feature functionality (Chat, Maintenance)
    IF owner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.properties WHERE owner_id = owner_id) THEN
      prop_id := gen_random_uuid();
      INSERT INTO public.properties (
        id, name, address, owner_id, pm_id, status, city, state, type, profile_type, listing_price
      ) VALUES (
        prop_id, 'Test Property', '123 Test St', owner_id, master_id, 'available', 'Test City', 'TS', 'House', 'long_term', 1500
      );
    END IF;
  END IF;
END $$;
