DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
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
      '{"name": "Adailton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'adailtong@gmail.com', 'Adailton', 'platform_owner')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert Translations for PT and ES
INSERT INTO public.ui_translations (key, locale, value) VALUES
-- Portuguese (pt)
('sidebar.pricing', 'pt', 'Precificações'),
('pricing.desc', 'pt', 'Gerencie categorias de quartos, preços base e aplique-os em suas propriedades.'),
('pricing.bulk_pricing', 'pt', 'Motor de Preços em Massa'),
('hotels.select_property', 'pt', 'Selecionar Propriedade'),
('pricing.select_desc', 'pt', 'Escolha um hotel para gerenciar suas categorias e tarifas de quartos.'),
('pricing.loading_hotels', 'pt', 'Carregando hotéis...'),
('pricing.no_hotels', 'pt', 'Nenhum hotel encontrado. Crie um hotel primeiro.'),
('pricing.hotel_property', 'pt', 'Hotel / Propriedade'),
('pricing.select_hotel', 'pt', 'Selecione um hotel'),
('night_audit.title', 'pt', 'Auditoria Noturna'),
('night_audit.subtitle', 'pt', 'Execute fechamentos financeiros diários e lance cobranças de quartos.'),
('night_audit.run_title', 'pt', 'Executar Auditoria Noturna'),
('night_audit.run_desc', 'pt', 'Este processo lançará todas as cobranças de quarto pendentes, impostos e finalizará as transações do dia.'),
('night_audit.checkins_complete', 'pt', 'Todos os check-ins concluídos'),
('night_audit.pos_closed', 'pt', 'Lotes do POS fechados'),
('night_audit.no_pending', 'pt', 'Sem saldos pendentes'),
('night_audit.start_button', 'pt', 'Iniciar Processo de Auditoria Noturna'),
('workflows.subtitle', 'pt', 'Gerencie fluxos de trabalho automatizados.'),
('workflows.trigger', 'pt', 'Gatilho'),
('workflows.steps_count', 'pt', 'Contagem de Etapas'),
('guest_services.subtitle', 'pt', 'Catálogo de serviços, preços temporários e faturamento para hóspedes.'),
('guest_services.current_price', 'pt', 'Preço Atual'),
('guest_services.prices_scheduled', 'pt', 'preço(s) programado(s)'),
('guest_services.category.dining', 'pt', 'Alimentação'),
('guest_services.category.transport', 'pt', 'Transporte'),
('guest_services.category.other', 'pt', 'Outro'),
('guest_services.bill_to_invoice', 'pt', 'Cobrar na Fatura'),
('guest_services.consume_title', 'pt', 'Faturar Serviço para o Hóspede'),
('guest_services.service_label', 'pt', 'Serviço'),
('guest_services.value_label', 'pt', 'Valor:'),
('guest_services.booking_label', 'pt', 'Reserva / Hóspede *'),
('guest_services.select_booking', 'pt', 'Selecionar reserva'),
('guest_services.no_active_bookings', 'pt', 'Sem reservas ativas'),
('guest_services.bill_cost_btn', 'pt', 'Faturar Custo'),
('guest_services.consume_prefix', 'pt', 'Consumo:'),
('guest_services.invoice_added', 'pt', 'Serviço faturado com sucesso.'),
('housekeeping.title', 'pt', 'Governança'),
('housekeeping.subtitle', 'pt', 'Gerencie tarefas de limpeza e equipe.'),
('housekeeping.task_title', 'pt', 'Título da Tarefa'),
('housekeeping.assignee', 'pt', 'Atribuído a'),
('housekeeping.date', 'pt', 'Data'),
('workflows.trigger.manual', 'pt', 'Manual'),
('common.workflows', 'pt', 'Fluxo de Trabalho'),
('guest_services.validation_error_desc', 'pt', 'Por favor, selecione uma reserva.'),
('guest_services.category', 'pt', 'Categoria'),
('common.error', 'pt', 'Erro'),

-- Spanish (es)
('sidebar.pricing', 'es', 'Fijación de Precios'),
('pricing.desc', 'es', 'Gestione categorías de habitaciones, precios base y aplíquelos en sus propiedades.'),
('pricing.bulk_pricing', 'es', 'Motor de Precios Masivos'),
('hotels.select_property', 'es', 'Seleccionar Propiedad'),
('pricing.select_desc', 'es', 'Elija un hotel para gestionar sus categorías y tarifas de habitaciones.'),
('pricing.loading_hotels', 'es', 'Cargando hoteles...'),
('pricing.no_hotels', 'es', 'No se encontraron hoteles. Cree un hotel primero.'),
('pricing.hotel_property', 'es', 'Hotel / Propiedad'),
('pricing.select_hotel', 'es', 'Seleccione un hotel'),
('night_audit.title', 'es', 'Auditoría Nocturna'),
('night_audit.subtitle', 'es', 'Ejecute cierres financieros diarios y publique cargos de habitaciones.'),
('night_audit.run_title', 'es', 'Ejecutar Auditoría Nocturna'),
('night_audit.run_desc', 'es', 'Este proceso publicará todos los cargos de habitaciones pendientes, impuestos y finalizará las transacciones del día.'),
('night_audit.checkins_complete', 'es', 'Todos los check-ins completados'),
('night_audit.pos_closed', 'es', 'Lotes de POS cerrados'),
('night_audit.no_pending', 'es', 'Sin saldos pendientes'),
('night_audit.start_button', 'es', 'Iniciar Proceso de Auditoría Nocturna'),
('workflows.subtitle', 'es', 'Gestione flujos de trabajo de tareas automatizadas.'),
('workflows.trigger', 'es', 'Desencadenador'),
('workflows.steps_count', 'es', 'Conteo de Pasos'),
('guest_services.subtitle', 'es', 'Catálogo de servicios, precios temporales y facturación para huéspedes.'),
('guest_services.current_price', 'es', 'Precio Actual'),
('guest_services.prices_scheduled', 'es', 'precio(s) programado(s)'),
('guest_services.category.dining', 'es', 'Alimentación'),
('guest_services.category.transport', 'es', 'Transporte'),
('guest_services.category.other', 'es', 'Otro'),
('guest_services.bill_to_invoice', 'es', 'Facturar a Cuenta'),
('guest_services.consume_title', 'es', 'Facturar Servicio a Cuenta'),
('guest_services.service_label', 'es', 'Servicio'),
('guest_services.value_label', 'es', 'Valor:'),
('guest_services.booking_label', 'es', 'Reserva / Huésped *'),
('guest_services.select_booking', 'es', 'Seleccionar reserva'),
('guest_services.no_active_bookings', 'es', 'Sin reservas activas'),
('guest_services.bill_cost_btn', 'es', 'Facturar Costo'),
('guest_services.consume_prefix', 'es', 'Consumo:'),
('guest_services.invoice_added', 'es', 'Servicio facturado con éxito.'),
('housekeeping.title', 'es', 'Gobernanza'),
('housekeeping.subtitle', 'es', 'Gestione tareas de limpieza y personal.'),
('housekeeping.task_title', 'es', 'Título de la Tarea'),
('housekeeping.assignee', 'es', 'Asignado a'),
('housekeeping.date', 'es', 'Fecha'),
('workflows.trigger.manual', 'es', 'Manual'),
('common.workflows', 'es', 'Flujo de Trabajo'),
('guest_services.validation_error_desc', 'es', 'Por favor, seleccione una reserva.'),
('guest_services.category', 'es', 'Categoría'),
('common.error', 'es', 'Error')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
