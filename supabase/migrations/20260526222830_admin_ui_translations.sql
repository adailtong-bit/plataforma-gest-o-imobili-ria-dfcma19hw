DO $$
BEGIN
  INSERT INTO public.ui_translations (id, key, locale, value) VALUES
    (gen_random_uuid(), 'menu.system.migration_hub', 'en', 'Migration Hub'),
    (gen_random_uuid(), 'menu.system.migration_hub', 'pt', 'Hub de Migração'),
    (gen_random_uuid(), 'menu.system.advanced_analytics', 'en', 'Advanced Analytics'),
    (gen_random_uuid(), 'menu.system.advanced_analytics', 'pt', 'Analytics Avançado'),
    (gen_random_uuid(), 'menu.system.publicity_admin', 'en', 'Publicity Admin'),
    (gen_random_uuid(), 'menu.system.publicity_admin', 'pt', 'Administração de Publicidade')
  ON CONFLICT ON CONSTRAINT ui_translations_key_locale_key DO NOTHING;
END $$;
