-- Update the trigger function to populate booking_id and set the correct types for invoice mapping
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
      invoice_number, description, amount, status, date, to_name, to_email, type, from_name, booking_id
    ) VALUES (
      inv_number, 'Publicity Campaign: ' || NEW.title, NEW.total_amount, 'pending', NEW.created_at, adv_name, adv_email, 'publicity_sale', 'Platform Admin', NEW.id::text
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
          AND booking_id = NEW.id::text
      ) INTO invoice_exists;

      IF NOT invoice_exists THEN
        INSERT INTO public.invoices (
          invoice_number, description, amount, status, date, to_name, to_email, type, from_name, booking_id
        ) VALUES (
          inv_number, 'Publicity Campaign Renewal: ' || NEW.title, NEW.total_amount, 'pending', NOW(), adv_name, adv_email, 'publicity_renewal', 'Platform Admin', NEW.id::text
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$

-- Safely backfill existing invoices with the correct campaign references
DO $$
BEGIN
  UPDATE public.invoices i
  SET booking_id = pc.id::text
  FROM public.publicity_campaigns pc
  WHERE i.description LIKE 'Publicity Campaign%' 
    AND i.description LIKE '%' || pc.title 
    AND i.booking_id IS NULL;
END $$;
