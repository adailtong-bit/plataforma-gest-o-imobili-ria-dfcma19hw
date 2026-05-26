DO $$
BEGIN
  INSERT INTO public.ui_translations (key, locale, value) VALUES
    ('menu.system.pricing', 'pt', 'Precificação'),
    ('menu.system.users', 'pt', 'Usuários'),
    ('menu.system.publicity_admin', 'pt', 'Admin de Publicidade'),
    ('menu.system.migration_hub', 'pt', 'Hub de Migração'),
    ('menu.system.advanced_analytics', 'pt', 'Analytics Avançado'),
    ('menu.system.automation_rules', 'pt', 'Regras de Automação'),
    ('sidebar.translations', 'pt', 'Traduções'),
    
    ('publicity.title', 'pt', 'Admin de Publicidade'),
    ('publicity.subtitle', 'pt', 'Gerencie anunciantes, campanhas e matriz de preços.'),
    ('publicity.tabs.advertisers', 'pt', 'Anunciantes'),
    ('publicity.tabs.campaigns', 'pt', 'Campanhas'),
    ('publicity.tabs.pricing', 'pt', 'Preços'),
    ('publicity.advertisers.add', 'pt', 'Novo Anunciante'),
    ('publicity.campaigns.add', 'pt', 'Nova Campanha'),
    ('publicity.pricing.add', 'pt', 'Novo Preço'),
    
    ('analytics.title', 'pt', 'Analytics Avançado'),
    ('analytics.subtitle', 'pt', 'Métricas de receita, ocupação e performance de campanhas.'),
    
    ('migration.title', 'pt', 'Hub de Migração'),
    ('migration.subtitle', 'pt', 'Monitore e gerencie a importação de dados.')
  ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
END $$;
