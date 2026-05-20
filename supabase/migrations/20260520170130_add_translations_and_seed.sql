-- Ensure RLS on ui_translations allows authenticated users to SELECT
DROP POLICY IF EXISTS "public_read_translations" ON public.ui_translations;
DROP POLICY IF EXISTS "authenticated_select_translations" ON public.ui_translations;

CREATE POLICY "authenticated_select_translations" ON public.ui_translations
  FOR SELECT TO authenticated USING (true);

-- Seed master user: adailtong@gmail.com with Skip@Pass
DO $DO$
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
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $DO$;

-- Seed translations
INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('menu.dashboard', 'en', 'Dashboard'),
  ('menu.dashboard', 'pt', 'Painel de Controle'),
  ('menu.properties', 'en', 'Properties'),
  ('menu.properties', 'pt', 'Propriedades'),
  ('menu.bookings', 'en', 'Bookings'),
  ('menu.bookings', 'pt', 'Reservas'),
  ('menu.tasks', 'en', 'Tasks'),
  ('menu.tasks', 'pt', 'Tarefas'),
  ('menu.finances', 'en', 'Finances'),
  ('menu.finances', 'pt', 'Finanças'),
  ('menu.invoices', 'en', 'Invoices'),
  ('menu.invoices', 'pt', 'Faturas'),
  ('menu.advertisers', 'en', 'Advertisers'),
  ('menu.advertisers', 'pt', 'Anunciantes'),
  ('menu.settings', 'en', 'Settings'),
  ('menu.settings', 'pt', 'Configurações')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
