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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
  ON CONFLICT (id) DO UPDATE SET role = 'master';

  -- Add base translations for pt if they don't exist
  INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('menu.system.publicity_admin', 'pt', 'Admin de Publicidade'),
  ('menu.system.advanced_analytics', 'pt', 'Análise Avançada'),
  ('menu.system.migration_hub', 'pt', 'Central de Migração'),
  ('publicity.subtitle', 'pt', 'Gerencie anunciantes, preços e campanhas.'),
  ('publicity.advertisers', 'pt', 'Anunciantes'),
  ('publicity.pricing', 'pt', 'Preços'),
  ('publicity.campaigns', 'pt', 'Campanhas'),
  ('publicity.add_advertiser', 'pt', 'Adicionar Anunciante'),
  ('publicity.advertiser', 'pt', 'Anunciante'),
  ('publicity.location', 'pt', 'Localização'),
  ('publicity.days', 'pt', 'Dias'),
  ('publicity.price', 'pt', 'Preço'),
  ('publicity.image', 'pt', 'Imagem'),
  ('publicity.link', 'pt', 'Link'),
  ('publicity.campaign_perf', 'pt', 'Performance da Campanha'),
  ('publicity.impressions', 'pt', 'Impressões'),
  ('publicity.clicks', 'pt', 'Cliques'),
  ('migration.wizard_title', 'pt', 'Assistente de Migração')
  ON CONFLICT (key, locale) DO NOTHING;
END $$;
