-- Drop existing trigger and function to ensure idempotency and clean replacement
DROP TRIGGER IF EXISTS trg_create_campaign_invoice ON public.publicity_campaigns;
DROP FUNCTION IF EXISTS public.handle_campaign_invoice();

-- Create updated handle_campaign_invoice to include to_email for better billing link
CREATE OR REPLACE FUNCTION public.handle_campaign_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  adv_name text;
  adv_email text;
  inv_number text;
  invoice_exists boolean;
BEGIN
  -- Get advertiser name and email
  SELECT name, billing_email INTO adv_name, adv_email FROM public.advertisers WHERE id = NEW.advertiser_id;
  
  -- Generate invoice number base
  inv_number := 'PUB-' || to_char(NEW.created_at, 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.invoices (
      invoice_number, description, amount, status, date, to_name, to_email, type, from_name
    ) VALUES (
      inv_number, 'Publicity Campaign: ' || NEW.title, NEW.total_amount, 'pending', NEW.created_at, adv_name, adv_email, 'publicity_sale', 'Platform Admin'
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
          invoice_number, description, amount, status, date, to_name, to_email, type, from_name
        ) VALUES (
          inv_number, 'Publicity Campaign Renewal: ' || NEW.title, NEW.total_amount, 'pending', NOW(), adv_name, adv_email, 'publicity_sale', 'Platform Admin'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Recreate trigger
CREATE TRIGGER trg_create_campaign_invoice
  AFTER INSERT OR UPDATE ON public.publicity_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_campaign_invoice();

-- Create RPC function to update expired campaigns automatically
CREATE OR REPLACE FUNCTION public.update_expired_campaigns()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.publicity_campaigns
  SET status = 'concluded'
  WHERE status = 'active' AND end_date < NOW();
END;
$function$;

-- Verify/Recreate Policies to ensure admin access on publicity data
DROP POLICY IF EXISTS "admin_all_campaigns" ON public.publicity_campaigns;
CREATE POLICY "admin_all_campaigns" ON public.publicity_campaigns
  FOR ALL TO authenticated
  USING (public.is_admin_or_pm())
  WITH CHECK (public.is_admin_or_pm());

DROP POLICY IF EXISTS "admin_all_invoices" ON public.invoices;
CREATE POLICY "admin_all_invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_admin_or_pm())
  WITH CHECK (public.is_admin_or_pm());
