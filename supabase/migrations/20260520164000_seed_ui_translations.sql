-- 1. Create or ensure user adailtong@gmail.com
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
      '{"name": "Adailton", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'master')
    ON CONFLICT (id) DO UPDATE SET role = 'master';
  ELSE
    -- Ensure role is master
    UPDATE public.profiles SET role = 'master' WHERE email = 'adailtong@gmail.com';
  END IF;
END $$;

-- 2. Ensure public_read_translations policy exists and is active
DROP POLICY IF EXISTS "public_read_translations" ON public.ui_translations;
CREATE POLICY "public_read_translations" ON public.ui_translations
  FOR SELECT USING (true);

-- 3. Seed translations
INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('menu.dashboard', 'en', 'Dashboard'),
  ('menu.dashboard', 'pt', 'Painel'),
  ('menu.properties', 'en', 'Properties'),
  ('menu.properties', 'pt', 'Propriedades'),
  ('menu.messages', 'en', 'Messages'),
  ('menu.messages', 'pt', 'Mensagens'),
  ('menu.tasks', 'en', 'Tasks'),
  ('menu.tasks', 'pt', 'Tarefas'),
  ('menu.invoices', 'en', 'Invoices'),
  ('menu.invoices', 'pt', 'Faturas'),
  ('menu.ledger', 'en', 'Ledger'),
  ('menu.ledger', 'pt', 'Livro Razão'),
  
  ('dashboard.welcome', 'en', 'Welcome to Dashboard'),
  ('dashboard.welcome', 'pt', 'Bem-vindo ao Painel'),
  ('dashboard.summary', 'en', 'Summary'),
  ('dashboard.summary', 'pt', 'Resumo'),
  ('dashboard.recent_activity', 'en', 'Recent Activity'),
  ('dashboard.recent_activity', 'pt', 'Atividade Recente'),
  
  ('messages.start_conversation', 'en', 'Start New Conversation'),
  ('messages.start_conversation', 'pt', 'Iniciar Nova Conversa'),
  ('messages.no_conversations', 'en', 'No conversations yet.'),
  ('messages.no_conversations', 'pt', 'Nenhuma conversa ainda.'),
  ('messages.type_message', 'en', 'Type a message...'),
  ('messages.type_message', 'pt', 'Digite uma mensagem...'),

  ('invoices.invoice_no', 'en', 'Invoice No.'),
  ('invoices.invoice_no', 'pt', 'Nº da Fatura'),
  ('invoices.billed_to', 'en', 'Billed To'),
  ('invoices.billed_to', 'pt', 'Faturado Para'),
  ('invoices.issue_date', 'en', 'Issue Date'),
  ('invoices.issue_date', 'pt', 'Data de Emissão'),

  ('properties.photo', 'en', 'Photo'),
  ('properties.photo', 'pt', 'Foto'),
  ('properties.name_id', 'en', 'Name / ID'),
  ('properties.name_id', 'pt', 'Nome / Identificação'),
  ('properties.hotel_condo', 'en', 'Hotel / Condominium'),
  ('properties.hotel_condo', 'pt', 'Hotel / Condomínio'),
  ('properties.tower_floor_room', 'en', 'Tower / Floor / Room'),
  ('properties.tower_floor_room', 'pt', 'Torre / Andar / Quarto'),
  ('properties.profile', 'en', 'Profile'),
  ('properties.profile', 'pt', 'Perfil'),

  ('common.reference', 'en', 'Reference'),
  ('common.reference', 'pt', 'Referência'),
  ('common.status', 'en', 'Status'),
  ('common.status', 'pt', 'Status'),
  ('common.total_amount', 'en', 'Total Amount'),
  ('common.total_amount', 'pt', 'Valor Total'),
  ('common.actions', 'en', 'Actions'),
  ('common.actions', 'pt', 'Ações'),
  ('common.history', 'en', 'History'),
  ('common.history', 'pt', 'Histórico')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
