DO $$
BEGIN
  INSERT INTO public.ui_translations (key, locale, value) VALUES
    ('menu.system.pricing', 'en', 'Pricing'),
    ('menu.system.pricing', 'pt', 'Precificação'),
    ('menu.system.users', 'en', 'Users'),
    ('menu.system.users', 'pt', 'Usuários'),
    ('menu.system.publicity_admin', 'en', 'Publicity Admin'),
    ('menu.system.publicity_admin', 'pt', 'Admin de Publicidade'),
    ('menu.system.migration_hub', 'en', 'Migration Hub'),
    ('menu.system.migration_hub', 'pt', 'Hub de Migração'),
    ('menu.system.advanced_analytics', 'en', 'Advanced Analytics'),
    ('menu.system.advanced_analytics', 'pt', 'Analytics Avançado'),
    ('menu.system.automation_rules', 'en', 'Automation Rules'),
    ('menu.system.automation_rules', 'pt', 'Regras de Automação')
  ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
END $$;

DROP POLICY IF EXISTS "admin_all_campaigns" ON public.publicity_campaigns;
CREATE POLICY "admin_all_campaigns" ON public.publicity_campaigns
  FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());

DROP POLICY IF EXISTS "campaigns_advertiser_select" ON public.publicity_campaigns;
CREATE POLICY "campaigns_advertiser_select" ON public.publicity_campaigns
  FOR SELECT TO authenticated USING (
    public.is_admin_or_pm() OR 
    advertiser_id IN (SELECT id FROM public.advertisers WHERE billing_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "admin_all_advertisers" ON public.advertisers;
CREATE POLICY "admin_all_advertisers" ON public.advertisers
  FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());

DROP POLICY IF EXISTS "admin_all_pricing" ON public.publicity_pricing_matrix;
CREATE POLICY "admin_all_pricing" ON public.publicity_pricing_matrix
  FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());

DROP POLICY IF EXISTS "admin_manage_translations" ON public.ui_translations;
CREATE POLICY "admin_manage_translations" ON public.ui_translations
  FOR ALL TO authenticated USING (public.is_admin_or_pm()) WITH CHECK (public.is_admin_or_pm());

DROP POLICY IF EXISTS "authenticated_select_translations" ON public.ui_translations;
CREATE POLICY "authenticated_select_translations" ON public.ui_translations
  FOR SELECT TO authenticated USING (true);
