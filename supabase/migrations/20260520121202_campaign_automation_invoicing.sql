-- Add new columns to publicity_campaigns
DO $$
BEGIN
  ALTER TABLE public.publicity_campaigns
    ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS impressions_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0;
END $$;

-- Create function to auto-generate invoice on new campaign
CREATE OR REPLACE FUNCTION public.handle_campaign_invoice()
RETURNS trigger AS $$
DECLARE
  adv_name text;
  inv_number text;
BEGIN
  -- Get advertiser name
  SELECT name INTO adv_name FROM public.advertisers WHERE id = NEW.advertiser_id;
  
  -- Generate invoice number
  inv_number := 'PUB-' || to_char(NEW.created_at, 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  -- Insert invoice
  INSERT INTO public.invoices (
    invoice_number,
    description,
    amount,
    status,
    date,
    to_name,
    type,
    from_name
  ) VALUES (
    inv_number,
    'Publicity Campaign: ' || NEW.title,
    NEW.total_amount,
    'pending',
    NEW.created_at,
    adv_name,
    'publicity_sale',
    'Platform Admin'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trg_create_campaign_invoice ON public.publicity_campaigns;
CREATE TRIGGER trg_create_campaign_invoice
  AFTER INSERT ON public.publicity_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_campaign_invoice();

-- Seed user adailtong@gmail.com
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
