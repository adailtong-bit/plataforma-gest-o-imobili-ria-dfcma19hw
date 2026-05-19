DO $$
BEGIN
  -- Create advertisers table
  CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_id TEXT,
    billing_email TEXT NOT NULL,
    billing_phone TEXT,
    billing_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Create pricing matrix table
  CREATE TABLE IF NOT EXISTS public.publicity_pricing_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_key TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Create campaigns table
  CREATE TABLE IF NOT EXISTS public.publicity_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Campaign',
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
    pricing_id UUID REFERENCES public.publicity_pricing_matrix(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    total_amount NUMERIC,
    image_url TEXT,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

-- Setup Row Level Security for Platform Owner / Master
DO $$
BEGIN
  -- Advertisers RLS
  ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "platform_owner_all_advertisers" ON public.advertisers;
  CREATE POLICY "platform_owner_all_advertisers" ON public.advertisers
    FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_owner', 'master'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_owner', 'master'))
    );

  -- Pricing Matrix RLS
  ALTER TABLE public.publicity_pricing_matrix ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "platform_owner_all_pricing" ON public.publicity_pricing_matrix;
  CREATE POLICY "platform_owner_all_pricing" ON public.publicity_pricing_matrix
    FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_owner', 'master'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_owner', 'master'))
    );

  -- Campaigns RLS
  ALTER TABLE public.publicity_campaigns ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "platform_owner_all_campaigns" ON public.publicity_campaigns;
  CREATE POLICY "platform_owner_all_campaigns" ON public.publicity_campaigns
    FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_owner', 'master'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_owner', 'master'))
    );
END $$;
