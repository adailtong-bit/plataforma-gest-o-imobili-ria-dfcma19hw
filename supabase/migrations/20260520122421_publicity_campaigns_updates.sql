DO $$
BEGIN
  -- Add payment_link to invoices for checkout integrations
  ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_link TEXT;

  -- Ensure adailtong@gmail.com exists with proper role
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    DECLARE
      new_user_id uuid := gen_random_uuid();
    BEGIN
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
        '{"name": "Adailton Admin", "role": "master"}',
        false, 'authenticated', 'authenticated',
        '', '', '', '', '', NULL, '', '', ''
      );

      INSERT INTO public.profiles (id, email, name, role)
      VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton Admin', 'master')
      ON CONFLICT (id) DO NOTHING;
    END;
  END IF;
END $$;

-- RLS for invoices
DROP POLICY IF EXISTS "invoices_advertiser_select" ON public.invoices;
CREATE POLICY "invoices_advertiser_select" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    is_admin_or_pm() OR 
    (from_id = auth.uid()) OR 
    (to_id = auth.uid()) OR 
    (property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid() OR agent_id = auth.uid())) OR
    (to_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- RLS for publicity_campaigns
DROP POLICY IF EXISTS "campaigns_advertiser_select" ON public.publicity_campaigns;
CREATE POLICY "campaigns_advertiser_select" ON public.publicity_campaigns
  FOR SELECT TO authenticated
  USING (
    is_admin_or_pm() OR 
    advertiser_id IN (
      SELECT id FROM advertisers WHERE billing_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Idempotent Trigger for Automated Invoicing on Campaign Creation and Renewal
CREATE OR REPLACE FUNCTION public.handle_campaign_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  adv_name text;
  inv_number text;
  invoice_exists boolean;
BEGIN
  -- Get advertiser name
  SELECT name INTO adv_name FROM public.advertisers WHERE id = NEW.advertiser_id;
  
  -- Generate invoice number base
  inv_number := 'PUB-' || to_char(NEW.created_at, 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.invoices (
      invoice_number, description, amount, status, date, to_name, type, from_name
    ) VALUES (
      inv_number, 'Publicity Campaign: ' || NEW.title, NEW.total_amount, 'pending', NEW.created_at, adv_name, 'publicity_sale', 'Platform Admin'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if it's a renewal: end_date changed and increased
    IF NEW.end_date IS DISTINCT FROM OLD.end_date AND NEW.end_date > OLD.end_date THEN
      -- Create renewal invoice
      inv_number := 'PUB-REN-' || to_char(NOW(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
      
      -- Check idempotency: avoid creating duplicate invoice for the same campaign renewal on the same day
      SELECT EXISTS (
        SELECT 1 FROM public.invoices 
        WHERE description = 'Publicity Campaign Renewal: ' || NEW.title 
          AND date::date = NOW()::date
      ) INTO invoice_exists;

      IF NOT invoice_exists THEN
        INSERT INTO public.invoices (
          invoice_number, description, amount, status, date, to_name, type, from_name
        ) VALUES (
          inv_number, 'Publicity Campaign Renewal: ' || NEW.title, NEW.total_amount, 'pending', NOW(), adv_name, 'publicity_sale', 'Platform Admin'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_create_campaign_invoice ON public.publicity_campaigns;
CREATE TRIGGER trg_create_campaign_invoice
  AFTER INSERT OR UPDATE ON public.publicity_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_campaign_invoice();
