DO $$
BEGIN
  -- Drop existing policies that might have restrictive or incorrect checks
  DROP POLICY IF EXISTS "platform_owner_all_advertisers" ON public.advertisers;
  DROP POLICY IF EXISTS "admin_all_advertisers" ON public.advertisers;
  
  -- Create new policy for advertisers using the is_admin_or_pm function for full CRUD
  CREATE POLICY "admin_all_advertisers" ON public.advertisers
    FOR ALL TO authenticated
    USING (public.is_admin_or_pm())
    WITH CHECK (public.is_admin_or_pm());

  -- Drop existing policies for campaigns
  DROP POLICY IF EXISTS "platform_owner_all_campaigns" ON public.publicity_campaigns;
  DROP POLICY IF EXISTS "admin_all_campaigns" ON public.publicity_campaigns;

  -- Create new policy for campaigns
  CREATE POLICY "admin_all_campaigns" ON public.publicity_campaigns
    FOR ALL TO authenticated
    USING (public.is_admin_or_pm())
    WITH CHECK (public.is_admin_or_pm());

  -- Drop existing policies for pricing matrix
  DROP POLICY IF EXISTS "platform_owner_all_pricing" ON public.publicity_pricing_matrix;
  DROP POLICY IF EXISTS "admin_all_pricing" ON public.publicity_pricing_matrix;

  -- Create new policy for pricing matrix
  CREATE POLICY "admin_all_pricing" ON public.publicity_pricing_matrix
    FOR ALL TO authenticated
    USING (public.is_admin_or_pm())
    WITH CHECK (public.is_admin_or_pm());
END $$;
