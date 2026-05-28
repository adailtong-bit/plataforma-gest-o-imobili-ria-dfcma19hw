DO $$
BEGIN
  -- Insert dynamic translations for Pricing and System Menus ensuring idempotency
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
    ('menu.system.automation_rules', 'pt', 'Regras de Automação'),
    ('pricing.select_property', 'en', 'Select Property'),
    ('pricing.select_property', 'pt', 'Selecionar Propriedade'),
    ('pricing.room_types', 'en', 'Room Types'),
    ('pricing.room_types', 'pt', 'Tipos de Quarto'),
    ('pricing.capacity', 'en', 'Capacity'),
    ('pricing.capacity', 'pt', 'Capacidade'),
    ('pricing.base_rate', 'en', 'Base Rate'),
    ('pricing.base_rate', 'pt', 'Taxa Base'),
    ('pricing.bulk_pricing', 'en', 'Bulk Pricing Engine'),
    ('pricing.bulk_pricing', 'pt', 'Precificação em Massa'),
    ('pricing.add_category', 'en', 'Add Category'),
    ('pricing.add_category', 'pt', 'Adicionar Categoria'),
    ('pricing.save_changes', 'en', 'Save Changes'),
    ('pricing.save_changes', 'pt', 'Salvar Alterações')
  ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
END $$;

-- Ensure administrative RLS policies exist and are correctly scoped
DROP POLICY IF EXISTS "admin_all_advertisers" ON public.advertisers;
CREATE POLICY "admin_all_advertisers" ON public.advertisers
  FOR ALL TO authenticated USING (public.is_admin_or_pm());

DROP POLICY IF EXISTS "admin_all_campaigns" ON public.publicity_campaigns;
CREATE POLICY "admin_all_campaigns" ON public.publicity_campaigns
  FOR ALL TO authenticated USING (public.is_admin_or_pm());

DROP POLICY IF EXISTS "admin_all_pricing" ON public.publicity_pricing_matrix;
CREATE POLICY "admin_all_pricing" ON public.publicity_pricing_matrix
  FOR ALL TO authenticated USING (public.is_admin_or_pm());
