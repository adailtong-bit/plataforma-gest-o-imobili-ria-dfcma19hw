-- Make sure advertiser structured fields exist
ALTER TABLE public.advertisers 
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS number TEXT,
  ADD COLUMN IF NOT EXISTS complement TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS policies are solid
DROP POLICY IF EXISTS "admin_all_campaigns" ON public.publicity_campaigns;
CREATE POLICY "admin_all_campaigns" ON public.publicity_campaigns
  FOR ALL TO authenticated USING (is_admin_or_pm()) WITH CHECK (is_admin_or_pm());

DROP POLICY IF EXISTS "admin_all_advertisers" ON public.advertisers;
CREATE POLICY "admin_all_advertisers" ON public.advertisers
  FOR ALL TO authenticated USING (is_admin_or_pm()) WITH CHECK (is_admin_or_pm());

DROP POLICY IF EXISTS "admin_all_pricing" ON public.publicity_pricing_matrix;
CREATE POLICY "admin_all_pricing" ON public.publicity_pricing_matrix
  FOR ALL TO authenticated USING (is_admin_or_pm()) WITH CHECK (is_admin_or_pm());

-- Trigger for overlapping campaigns limit
CREATE OR REPLACE FUNCTION public.check_campaign_slot_limit()
RETURNS trigger AS $$
DECLARE
  loc_key TEXT;
  overlapping_count INT;
BEGIN
  -- Get location_key
  SELECT location_key INTO loc_key FROM public.publicity_pricing_matrix WHERE id = NEW.pricing_id;
  
  IF loc_key IS NOT NULL THEN
    SELECT COUNT(*) INTO overlapping_count
    FROM public.publicity_campaigns pc
    JOIN public.publicity_pricing_matrix pm ON pc.pricing_id = pm.id
    WHERE pm.location_key = loc_key
      AND (NEW.id IS NULL OR pc.id != NEW.id)
      AND pc.status IN ('active', 'pending')
      AND pc.start_date <= NEW.end_date
      AND pc.end_date >= NEW.start_date;
      
    IF overlapping_count >= 10 THEN
      RAISE EXCEPTION 'No available slots for this location in the selected period.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_campaign_slot_limit ON public.publicity_campaigns;
CREATE TRIGGER trg_check_campaign_slot_limit
BEFORE INSERT OR UPDATE ON public.publicity_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.check_campaign_slot_limit();

-- Seed User
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
