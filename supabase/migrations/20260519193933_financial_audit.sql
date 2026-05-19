-- Auth Seed
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

-- Add invoice_id column to ledger_entries
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;

-- Constraint for different entities (Immutability Layer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_different_entities'
  ) THEN
    ALTER TABLE public.invoices ADD CONSTRAINT check_different_entities CHECK (from_id IS NULL OR to_id IS NULL OR from_id != to_id);
  END IF;
END $$;

-- Immutability Layer Trigger (Backend Guard)
CREATE OR REPLACE FUNCTION prevent_locked_invoice_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('finalized', 'issued', 'paid') THEN
    -- If something other than status changed, block it to enforce immutability
    IF (NEW.amount IS DISTINCT FROM OLD.amount) OR 
       (NEW.items::text IS DISTINCT FROM OLD.items::text) OR 
       (NEW.from_id IS DISTINCT FROM OLD.from_id) OR 
       (NEW.to_id IS DISTINCT FROM OLD.to_id) OR
       (NEW.due_date IS DISTINCT FROM OLD.due_date)
    THEN
      RAISE EXCEPTION 'Cannot modify locked invoice data (Traceability & Immutability policy).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_locked_invoice_update ON public.invoices;
CREATE TRIGGER trg_prevent_locked_invoice_update
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION prevent_locked_invoice_update();

-- RLS Policies Update
-- Enable RLS on invoices and ledger_entries
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;

CREATE POLICY "invoices_select" ON public.invoices
FOR SELECT TO authenticated
USING (
  is_admin_or_pm() OR 
  from_id = auth.uid() OR 
  to_id = auth.uid() OR
  property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid() OR agent_id = auth.uid())
);

CREATE POLICY "invoices_insert" ON public.invoices
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "invoices_update" ON public.invoices
FOR UPDATE TO authenticated
USING (
  is_admin_or_pm() OR 
  from_id = auth.uid() OR 
  to_id = auth.uid() OR
  property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid() OR agent_id = auth.uid())
);

CREATE POLICY "invoices_delete" ON public.invoices
FOR DELETE TO authenticated
USING (is_admin_or_pm());

DROP POLICY IF EXISTS "ledger_select" ON public.ledger_entries;
DROP POLICY IF EXISTS "ledger_insert" ON public.ledger_entries;
DROP POLICY IF EXISTS "ledger_update" ON public.ledger_entries;
DROP POLICY IF EXISTS "ledger_delete" ON public.ledger_entries;

CREATE POLICY "ledger_select" ON public.ledger_entries
FOR SELECT TO authenticated
USING (
  is_admin_or_pm() OR
  property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid() OR agent_id = auth.uid())
);

CREATE POLICY "ledger_insert" ON public.ledger_entries
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "ledger_update" ON public.ledger_entries
FOR UPDATE TO authenticated
USING (
  is_admin_or_pm() OR
  property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid() OR agent_id = auth.uid())
);

CREATE POLICY "ledger_delete" ON public.ledger_entries
FOR DELETE TO authenticated
USING (is_admin_or_pm());
