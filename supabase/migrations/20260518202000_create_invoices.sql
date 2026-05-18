CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  date TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  from_name TEXT,
  from_email TEXT,
  from_phone TEXT,
  from_address TEXT,
  to_name TEXT,
  to_email TEXT,
  to_phone TEXT,
  to_address TEXT,
  from_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  type TEXT,
  booking_id TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_all" ON public.invoices;
CREATE POLICY "invoices_all" ON public.invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
