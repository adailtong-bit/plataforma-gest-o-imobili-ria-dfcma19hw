DO $$
BEGIN
  INSERT INTO public.ui_translations (key, locale, value) VALUES
    -- Analytics PT
    ('analytics.title', 'pt', 'Título'),
    ('analytics.subtitle', 'pt', 'Subtítulo'),
    ('analytics.total_users', 'pt', 'Total de Usuários'),
    ('analytics.active_properties', 'pt', 'Propriedades Ativas'),
    ('analytics.total_revenue', 'pt', 'Receita Total'),
    ('analytics.growth_rate', 'pt', 'Taxa de Crescimento'),
    ('analytics.of_last_month', 'pt', 'do último mês'),
    ('analytics.yoy', 'pt', 'Ano após Ano'),
    ('analytics.revenue_chart', 'pt', 'Gráfico de Receita'),
    ('analytics.revenue_desc', 'pt', 'Descrição da Receita'),
    ('analytics.chart_placeholder', 'pt', 'Área do Gráfico'),
    
    -- Analytics ES
    ('analytics.title', 'es', 'Título'),
    ('analytics.subtitle', 'es', 'Subtítulo'),
    ('analytics.total_users', 'es', 'Total de Usuarios'),
    ('analytics.active_properties', 'es', 'Propiedades Activas'),
    ('analytics.total_revenue', 'es', 'Ingresos Totales'),
    ('analytics.growth_rate', 'es', 'Tasa de Crecimiento'),
    ('analytics.of_last_month', 'es', 'del último mes'),
    ('analytics.yoy', 'es', 'Año tras Año'),
    ('analytics.revenue_chart', 'es', 'Gráfico de Ingresos'),
    ('analytics.revenue_desc', 'es', 'Descripción de Ingresos'),
    ('analytics.chart_placeholder', 'es', 'Área del Gráfico'),
    
    -- Night Audit
    ('night_audit.title', 'pt', 'Auditoria Noturna'),
    ('night_audit.subtitle', 'pt', 'Execute fechamentos financeiros diários e lance cobranças de quartos.'),
    ('night_audit.run_title', 'pt', 'Executar Auditoria Noturna'),
    ('night_audit.run_desc', 'pt', 'Este processo lançará todas as cobranças pendentes, impostos e finalizará as transações do dia.'),
    ('night_audit.checkins_complete', 'pt', 'Todos os check-ins concluídos'),
    ('night_audit.pos_closed', 'pt', 'Lotes de PDV fechados'),
    ('night_audit.no_pending', 'pt', 'Sem saldos pendentes'),
    ('night_audit.start_button', 'pt', 'Iniciar Processo de Auditoria Noturna'),

    ('night_audit.title', 'es', 'Auditoría Nocturna'),
    ('night_audit.subtitle', 'es', 'Ejecute cierres financieros diarios y publique cargos de habitaciones.'),
    ('night_audit.run_title', 'es', 'Ejecutar Auditoría Nocturna'),
    ('night_audit.run_desc', 'es', 'Este proceso publicará todos los cargos pendientes, impuestos y finalizará las transacciones del día.'),
    ('night_audit.checkins_complete', 'es', 'Todos los check-ins completados'),
    ('night_audit.pos_closed', 'es', 'Lotes de TPV cerrados'),
    ('night_audit.no_pending', 'es', 'Sin saldos pendientes'),
    ('night_audit.start_button', 'es', 'Iniciar Proceso de Auditoría Nocturna'),

    -- Workflows
    ('common.workflows', 'pt', 'Fluxos de Trabalho'),
    ('common.workflows', 'es', 'Flujos de Trabajo'),
    ('workflows.subtitle', 'pt', 'Gerencie fluxos de trabalho de tarefas automatizadas.'),
    ('workflows.subtitle', 'es', 'Gestione flujos de trabajo de tareas automatizadas.'),
    ('workflows.trigger', 'pt', 'Gatilho'),
    ('workflows.trigger', 'es', 'Desencadenador'),
    ('workflows.steps_count', 'pt', 'Contagem de Passos'),
    ('workflows.steps_count', 'es', 'Recuento de Pasos'),

    -- Publicity Admin
    ('publicity.title', 'pt', 'Administração de Publicidade'),
    ('publicity.title', 'es', 'Administración de Publicidad'),
    ('publicity.subtitle', 'pt', 'Gerencie campanhas de publicidade e posicionamentos.'),
    ('publicity.subtitle', 'es', 'Gestione campañas de publicidad y ubicaciones.'),
    ('publicity.campaigns', 'pt', 'Campanhas'),
    ('publicity.campaigns', 'es', 'Campañas'),
    ('publicity.campaigns_desc', 'pt', 'Campanhas ativas e pendentes'),
    ('publicity.campaigns_desc', 'es', 'Campañas activas y pendientes'),

    -- Automation
    ('automation.title', 'pt', 'Regras de Automação'),
    ('automation.title', 'es', 'Reglas de Automatización'),
    ('automation.subtitle', 'pt', 'Configure gatilhos e ações de automação do sistema.'),
    ('automation.subtitle', 'es', 'Configure desencadenadores y acciones de automatización del sistema.'),
    ('automation.rules', 'pt', 'Regras'),
    ('automation.rules', 'es', 'Reglas'),
    ('automation.rules_desc', 'pt', 'Regras de automação ativas'),
    ('automation.rules_desc', 'es', 'Reglas de automatización activas'),

    -- Common
    ('common.empty', 'pt', 'Nenhum dado disponível.'),
    ('common.empty', 'es', 'No hay datos disponibles.')
  ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
END $$;
