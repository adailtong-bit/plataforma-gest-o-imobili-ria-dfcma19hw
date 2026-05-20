-- Seed translations for Service Pricing page
DO $$
BEGIN
  INSERT INTO public.ui_translations (id, key, locale, value) VALUES
  (gen_random_uuid(), 'role_label_pm', 'en', 'Property Manager'),
  (gen_random_uuid(), 'role_label_pm', 'pt', 'Property Manager'),
  (gen_random_uuid(), 'role_label_pm', 'es', 'Property Manager'),
  
  (gen_random_uuid(), 'role_label_adv', 'en', 'Advertiser'),
  (gen_random_uuid(), 'role_label_adv', 'pt', 'Anunciante'),
  (gen_random_uuid(), 'role_label_adv', 'es', 'Anunciante'),
  
  (gen_random_uuid(), 'role_label_owner', 'en', 'Property Owner'),
  (gen_random_uuid(), 'role_label_owner', 'pt', 'Proprietário'),
  (gen_random_uuid(), 'role_label_owner', 'es', 'Propietario'),
  
  (gen_random_uuid(), 'role_label_partner_boss', 'en', 'Service Partner (Your Boss)'),
  (gen_random_uuid(), 'role_label_partner_boss', 'pt', 'Parceiro de Serviço (Seu Chefe)'),
  (gen_random_uuid(), 'role_label_partner_boss', 'es', 'Socio de Servicio (Tu Jefe)'),

  (gen_random_uuid(), 'type_software_fee_per_house', 'en', 'Software Fee (Per House)'),
  (gen_random_uuid(), 'type_software_fee_per_house', 'pt', 'Taxa de Software (Por Casa)'),
  (gen_random_uuid(), 'type_software_fee_per_house', 'es', 'Tarifa de Software (Por Casa)'),
  
  (gen_random_uuid(), 'type_fixed_admin_fee', 'en', 'Platform Fixed Fee'),
  (gen_random_uuid(), 'type_fixed_admin_fee', 'pt', 'Taxa Administrativa Fixa'),
  (gen_random_uuid(), 'type_fixed_admin_fee', 'es', 'Tarifa Administrativa Fija'),
  
  (gen_random_uuid(), 'type_ad_placement_fee', 'en', 'Ad Placement Fee'),
  (gen_random_uuid(), 'type_ad_placement_fee', 'pt', 'Taxa de Posicionamento de Anúncio'),
  (gen_random_uuid(), 'type_ad_placement_fee', 'es', 'Tarifa de Colocación de Anuncio'),
  
  (gen_random_uuid(), 'type_booking_percentage', 'en', 'Booking Revenue Share (%)'),
  (gen_random_uuid(), 'type_booking_percentage', 'pt', 'Participação na Receita de Reserva (%)'),
  (gen_random_uuid(), 'type_booking_percentage', 'es', 'Participación en Ingresos de Reserva (%)'),
  
  (gen_random_uuid(), 'type_markup_cleaning', 'en', 'Cleaning Markup'),
  (gen_random_uuid(), 'type_markup_cleaning', 'pt', 'Margem de Limpeza'),
  (gen_random_uuid(), 'type_markup_cleaning', 'es', 'Margen de Limpieza'),
  
  (gen_random_uuid(), 'type_markup_maintenance', 'en', 'Maintenance Markup'),
  (gen_random_uuid(), 'type_markup_maintenance', 'pt', 'Margem de Manutenção'),
  (gen_random_uuid(), 'type_markup_maintenance', 'es', 'Margen de Mantenimiento'),
  
  (gen_random_uuid(), 'type_markup_purchases', 'en', 'Purchases/Parts Markup'),
  (gen_random_uuid(), 'type_markup_purchases', 'pt', 'Margem de Compras/Peças'),
  (gen_random_uuid(), 'type_markup_purchases', 'es', 'Margen de Compras/Piezas'),
  
  (gen_random_uuid(), 'type_partner_cleaning_fee', 'en', 'Cleaning Fee'),
  (gen_random_uuid(), 'type_partner_cleaning_fee', 'pt', 'Taxa de Limpeza'),
  (gen_random_uuid(), 'type_partner_cleaning_fee', 'es', 'Tarifa de Limpieza'),
  
  (gen_random_uuid(), 'type_partner_maintenance_fee', 'en', 'Maintenance Fee'),
  (gen_random_uuid(), 'type_partner_maintenance_fee', 'pt', 'Taxa de Manutenção'),
  (gen_random_uuid(), 'type_partner_maintenance_fee', 'es', 'Tarifa de Mantenimiento'),
  
  (gen_random_uuid(), 'type_partner_parts_fee', 'en', 'Parts & Materials Fee'),
  (gen_random_uuid(), 'type_partner_parts_fee', 'pt', 'Taxa de Peças e Materiais'),
  (gen_random_uuid(), 'type_partner_parts_fee', 'es', 'Tarifa de Piezas y Materiales'),
  
  (gen_random_uuid(), 'type_team_cleaning_fee', 'en', 'Cleaning Payout'),
  (gen_random_uuid(), 'type_team_cleaning_fee', 'pt', 'Pagamento de Limpeza'),
  (gen_random_uuid(), 'type_team_cleaning_fee', 'es', 'Pago de Limpieza'),
  
  (gen_random_uuid(), 'type_team_maintenance_fee', 'en', 'Maintenance Payout'),
  (gen_random_uuid(), 'type_team_maintenance_fee', 'pt', 'Pagamento de Manutenção'),
  (gen_random_uuid(), 'type_team_maintenance_fee', 'es', 'Pago de Mantenimiento'),
  
  (gen_random_uuid(), 'type_team_parts_fee', 'en', 'Parts Reimbursement'),
  (gen_random_uuid(), 'type_team_parts_fee', 'pt', 'Reembolso de Peças'),
  (gen_random_uuid(), 'type_team_parts_fee', 'es', 'Reembolso de Piezas'),
  
  (gen_random_uuid(), 'type_custom', 'en', 'Custom Rule'),
  (gen_random_uuid(), 'type_custom', 'pt', 'Regra Personalizada'),
  (gen_random_uuid(), 'type_custom', 'es', 'Regla Personalizada'),
  
  (gen_random_uuid(), 'service_pricing_title', 'en', 'N-Tier Billing & Agreements'),
  (gen_random_uuid(), 'service_pricing_title', 'pt', 'Faturamento e Acordos N-Tier'),
  (gen_random_uuid(), 'service_pricing_title', 'es', 'Facturación y Acuerdos N-Tier'),
  
  (gen_random_uuid(), 'service_pricing_desc', 'en', 'Configure automated hierarchy rules (Admin ➔ PM ➔ Owner & Partner ➔ PM).'),
  (gen_random_uuid(), 'service_pricing_desc', 'pt', 'Configure regras de hierarquia automatizadas (Admin ➔ PM ➔ Proprietário e Parceiro ➔ PM).'),
  (gen_random_uuid(), 'service_pricing_desc', 'es', 'Configure reglas de jerarquía automatizadas (Admin ➔ PM ➔ Propietario y Socio ➔ PM).'),
  
  (gen_random_uuid(), 'search_rules_placeholder', 'en', 'Search rules...'),
  (gen_random_uuid(), 'search_rules_placeholder', 'pt', 'Buscar regras...'),
  (gen_random_uuid(), 'search_rules_placeholder', 'es', 'Buscar reglas...'),
  
  (gen_random_uuid(), 'btn_new_rule', 'en', 'New Billing Rule'),
  (gen_random_uuid(), 'btn_new_rule', 'pt', 'Nova Regra de Faturamento'),
  (gen_random_uuid(), 'btn_new_rule', 'es', 'Nueva Regla de Facturación'),
  
  (gen_random_uuid(), 'btn_edit_rule', 'en', 'Edit Billing Rule'),
  (gen_random_uuid(), 'btn_edit_rule', 'pt', 'Editar Regra'),
  (gen_random_uuid(), 'btn_edit_rule', 'es', 'Editar Regla'),
  
  (gen_random_uuid(), 'btn_delete_rule', 'en', 'Delete Rule'),
  (gen_random_uuid(), 'btn_delete_rule', 'pt', 'Excluir Regra'),
  (gen_random_uuid(), 'btn_delete_rule', 'es', 'Eliminar Regla'),
  
  (gen_random_uuid(), 'btn_create_rule', 'en', 'Create rule'),
  (gen_random_uuid(), 'btn_create_rule', 'pt', 'Criar regra'),
  (gen_random_uuid(), 'btn_create_rule', 'es', 'Crear regla'),
  
  (gen_random_uuid(), 'btn_save_rule', 'en', 'Save Rule'),
  (gen_random_uuid(), 'btn_save_rule', 'pt', 'Salvar Regra'),
  (gen_random_uuid(), 'btn_save_rule', 'es', 'Guardar Regla'),
  
  (gen_random_uuid(), 'btn_cancel', 'en', 'Cancel'),
  (gen_random_uuid(), 'btn_cancel', 'pt', 'Cancelar'),
  (gen_random_uuid(), 'btn_cancel', 'es', 'Cancelar'),
  
  (gen_random_uuid(), 'dialog_financial_hierarchy', 'en', 'Financial Hierarchy'),
  (gen_random_uuid(), 'dialog_financial_hierarchy', 'pt', 'Hierarquia Financeira'),
  (gen_random_uuid(), 'dialog_financial_hierarchy', 'es', 'Jerarquía Financiera'),
  
  (gen_random_uuid(), 'dialog_hierarchy_desc', 'en', 'Only valid relationships for your role ('),
  (gen_random_uuid(), 'dialog_hierarchy_desc', 'pt', 'Apenas relações válidas para o seu cargo ('),
  (gen_random_uuid(), 'dialog_hierarchy_desc', 'es', 'Solo relaciones válidas para tu rol ('),
  
  (gen_random_uuid(), 'dialog_hierarchy_desc_suffix', 'en', ') are shown.'),
  (gen_random_uuid(), 'dialog_hierarchy_desc_suffix', 'pt', ') são exibidas.'),
  (gen_random_uuid(), 'dialog_hierarchy_desc_suffix', 'es', ') son mostradas.'),
  
  (gen_random_uuid(), 'label_source_role', 'en', 'Billed By (Source Role)'),
  (gen_random_uuid(), 'label_source_role', 'pt', 'Faturado Por (Papel de Origem)'),
  (gen_random_uuid(), 'label_source_role', 'es', 'Facturado Por (Rol de Origen)'),
  
  (gen_random_uuid(), 'label_target_role', 'en', 'Billed To (Target Role)'),
  (gen_random_uuid(), 'label_target_role', 'pt', 'Faturado Para (Papel de Destino)'),
  (gen_random_uuid(), 'label_target_role', 'es', 'Facturado A (Rol de Destino)'),
  
  (gen_random_uuid(), 'placeholder_who_pays', 'en', 'Who pays?'),
  (gen_random_uuid(), 'placeholder_who_pays', 'pt', 'Quem paga?'),
  (gen_random_uuid(), 'placeholder_who_pays', 'es', '¿Quién paga?'),
  
  (gen_random_uuid(), 'label_rule_name', 'en', 'Rule Name'),
  (gen_random_uuid(), 'label_rule_name', 'pt', 'Nome da Regra'),
  (gen_random_uuid(), 'label_rule_name', 'es', 'Nombre de la Regla'),
  
  (gen_random_uuid(), 'placeholder_rule_name', 'en', 'e.g. Monthly PM Admin Fee'),
  (gen_random_uuid(), 'placeholder_rule_name', 'pt', 'ex. Taxa Administrativa Mensal'),
  (gen_random_uuid(), 'placeholder_rule_name', 'es', 'ej. Tarifa Administrativa Mensual'),
  
  (gen_random_uuid(), 'label_target_scope', 'en', 'Target Player Scope'),
  (gen_random_uuid(), 'label_target_scope', 'pt', 'Escopo do Alvo'),
  (gen_random_uuid(), 'label_target_scope', 'es', 'Alcance del Objetivo'),
  
  (gen_random_uuid(), 'target_global', 'en', 'Global'),
  (gen_random_uuid(), 'target_global', 'pt', 'Global'),
  (gen_random_uuid(), 'target_global', 'es', 'Global'),
  
  (gen_random_uuid(), 'text_all', 'en', 'All'),
  (gen_random_uuid(), 'text_all', 'pt', 'Todos'),
  (gen_random_uuid(), 'text_all', 'es', 'Todos'),
  
  (gen_random_uuid(), 'target_users', 'en', 'Users'),
  (gen_random_uuid(), 'target_users', 'pt', 'Usuários'),
  (gen_random_uuid(), 'target_users', 'es', 'Usuarios'),
  
  (gen_random_uuid(), 'label_calculation_logic', 'en', 'Calculation Logic (Rule Type)'),
  (gen_random_uuid(), 'label_calculation_logic', 'pt', 'Lógica de Cálculo (Tipo de Regra)'),
  (gen_random_uuid(), 'label_calculation_logic', 'es', 'Lógica de Cálculo (Tipo de Regla)'),
  
  (gen_random_uuid(), 'placeholder_select_type', 'en', 'Select type...'),
  (gen_random_uuid(), 'placeholder_select_type', 'pt', 'Selecione o tipo...'),
  (gen_random_uuid(), 'placeholder_select_type', 'es', 'Seleccione el tipo...'),
  
  (gen_random_uuid(), 'label_value_type', 'en', 'Value Type'),
  (gen_random_uuid(), 'label_value_type', 'pt', 'Tipo de Valor'),
  (gen_random_uuid(), 'label_value_type', 'es', 'Tipo de Valor'),
  
  (gen_random_uuid(), 'placeholder_value_type', 'en', 'Value type'),
  (gen_random_uuid(), 'placeholder_value_type', 'pt', 'Tipo de valor'),
  (gen_random_uuid(), 'placeholder_value_type', 'es', 'Tipo de valor'),
  
  (gen_random_uuid(), 'option_percentage', 'en', 'Percentage (%)'),
  (gen_random_uuid(), 'option_percentage', 'pt', 'Porcentagem (%)'),
  (gen_random_uuid(), 'option_percentage', 'es', 'Porcentaje (%)'),
  
  (gen_random_uuid(), 'option_fixed', 'en', 'Fixed Amount ($)'),
  (gen_random_uuid(), 'option_fixed', 'pt', 'Valor Fixo ($)'),
  (gen_random_uuid(), 'option_fixed', 'es', 'Monto Fijo ($)'),
  
  (gen_random_uuid(), 'label_amount_rate', 'en', 'Amount / Rate'),
  (gen_random_uuid(), 'label_amount_rate', 'pt', 'Valor / Taxa'),
  (gen_random_uuid(), 'label_amount_rate', 'es', 'Monto / Tarifa'),
  
  (gen_random_uuid(), 'label_frequency', 'en', 'Frequency'),
  (gen_random_uuid(), 'label_frequency', 'pt', 'Frequência'),
  (gen_random_uuid(), 'label_frequency', 'es', 'Frecuencia'),
  
  (gen_random_uuid(), 'placeholder_frequency', 'en', 'Frequency'),
  (gen_random_uuid(), 'placeholder_frequency', 'pt', 'Frequência'),
  (gen_random_uuid(), 'placeholder_frequency', 'es', 'Frecuencia'),
  
  (gen_random_uuid(), 'option_per_booking', 'en', 'Per Booking (Auto)'),
  (gen_random_uuid(), 'option_per_booking', 'pt', 'Por Reserva (Auto)'),
  (gen_random_uuid(), 'option_per_booking', 'es', 'Por Reserva (Auto)'),
  
  (gen_random_uuid(), 'option_per_task', 'en', 'Per Task (Auto)'),
  (gen_random_uuid(), 'option_per_task', 'pt', 'Por Tarefa (Auto)'),
  (gen_random_uuid(), 'option_per_task', 'es', 'Por Tarea (Auto)'),
  
  (gen_random_uuid(), 'option_monthly', 'en', 'Monthly Fixed'),
  (gen_random_uuid(), 'option_monthly', 'pt', 'Mensal Fixo'),
  (gen_random_uuid(), 'option_monthly', 'es', 'Mensual Fijo'),
  
  (gen_random_uuid(), 'option_yearly', 'en', 'Yearly Fixed'),
  (gen_random_uuid(), 'option_yearly', 'pt', 'Anual Fixo'),
  (gen_random_uuid(), 'option_yearly', 'es', 'Anual Fijo'),
  
  (gen_random_uuid(), 'label_valid_from', 'en', 'Valid From'),
  (gen_random_uuid(), 'label_valid_from', 'pt', 'Válido a partir de'),
  (gen_random_uuid(), 'label_valid_from', 'es', 'Válido desde'),
  
  (gen_random_uuid(), 'column_name', 'en', 'Rule Name'),
  (gen_random_uuid(), 'column_name', 'pt', 'Nome da Regra'),
  (gen_random_uuid(), 'column_name', 'es', 'Nombre de la Regla'),
  
  (gen_random_uuid(), 'column_hierarchy', 'en', 'Hierarchy (By ➔ To)'),
  (gen_random_uuid(), 'column_hierarchy', 'pt', 'Hierarquia (Por ➔ Para)'),
  (gen_random_uuid(), 'column_hierarchy', 'es', 'Jerarquía (Por ➔ Para)'),
  
  (gen_random_uuid(), 'column_scope', 'en', 'Target Scope'),
  (gen_random_uuid(), 'column_scope', 'pt', 'Escopo Alvo'),
  (gen_random_uuid(), 'column_scope', 'es', 'Alcance Objetivo'),
  
  (gen_random_uuid(), 'column_logic', 'en', 'Logic Type'),
  (gen_random_uuid(), 'column_logic', 'pt', 'Tipo de Lógica'),
  (gen_random_uuid(), 'column_logic', 'es', 'Tipo de Lógica'),
  
  (gen_random_uuid(), 'column_rate', 'en', 'Rate'),
  (gen_random_uuid(), 'column_rate', 'pt', 'Taxa'),
  (gen_random_uuid(), 'column_rate', 'es', 'Tarifa'),
  
  (gen_random_uuid(), 'column_status', 'en', 'Status'),
  (gen_random_uuid(), 'column_status', 'pt', 'Status'),
  (gen_random_uuid(), 'column_status', 'es', 'Estado'),
  
  (gen_random_uuid(), 'column_actions', 'en', 'Actions'),
  (gen_random_uuid(), 'column_actions', 'pt', 'Ações'),
  (gen_random_uuid(), 'column_actions', 'es', 'Acciones'),
  
  (gen_random_uuid(), 'role_master', 'en', 'Admin'),
  (gen_random_uuid(), 'role_master', 'pt', 'Admin'),
  (gen_random_uuid(), 'role_master', 'es', 'Admin'),
  
  (gen_random_uuid(), 'role_software_tenant', 'en', 'PM'),
  (gen_random_uuid(), 'role_software_tenant', 'pt', 'PM'),
  (gen_random_uuid(), 'role_software_tenant', 'es', 'PM'),
  
  (gen_random_uuid(), 'role_property_owner', 'en', 'Owner'),
  (gen_random_uuid(), 'role_property_owner', 'pt', 'Proprietário'),
  (gen_random_uuid(), 'role_property_owner', 'es', 'Propietario'),
  
  (gen_random_uuid(), 'role_partner', 'en', 'Partner'),
  (gen_random_uuid(), 'role_partner', 'pt', 'Parceiro'),
  (gen_random_uuid(), 'role_partner', 'es', 'Socio'),
  
  (gen_random_uuid(), 'role_partner_employee', 'en', 'Team'),
  (gen_random_uuid(), 'role_partner_employee', 'pt', 'Equipe'),
  (gen_random_uuid(), 'role_partner_employee', 'es', 'Equipo'),
  
  (gen_random_uuid(), 'role_advertiser', 'en', 'Advertiser'),
  (gen_random_uuid(), 'role_advertiser', 'pt', 'Anunciante'),
  (gen_random_uuid(), 'role_advertiser', 'es', 'Anunciante'),
  
  (gen_random_uuid(), 'role_system', 'en', 'System'),
  (gen_random_uuid(), 'role_system', 'pt', 'Sistema'),
  (gen_random_uuid(), 'role_system', 'es', 'Sistema'),
  
  (gen_random_uuid(), 'role_user', 'en', 'User'),
  (gen_random_uuid(), 'role_user', 'pt', 'Usuário'),
  (gen_random_uuid(), 'role_user', 'es', 'Usuario'),
  
  (gen_random_uuid(), 'status_active', 'en', 'Active'),
  (gen_random_uuid(), 'status_active', 'pt', 'Ativo'),
  (gen_random_uuid(), 'status_active', 'es', 'Activo'),
  
  (gen_random_uuid(), 'status_inactive', 'en', 'Inactive'),
  (gen_random_uuid(), 'status_inactive', 'pt', 'Inativo'),
  (gen_random_uuid(), 'status_inactive', 'es', 'Inactivo'),
  
  (gen_random_uuid(), 'msg_no_rules', 'en', 'No billing hierarchy rules configured.'),
  (gen_random_uuid(), 'msg_no_rules', 'pt', 'Nenhuma regra de hierarquia configurada.'),
  (gen_random_uuid(), 'msg_no_rules', 'es', 'No hay reglas de jerarquía configuradas.'),
  
  (gen_random_uuid(), 'msg_delete_confirm_title', 'en', 'Confirm Deletion'),
  (gen_random_uuid(), 'msg_delete_confirm_title', 'pt', 'Confirmar Exclusão'),
  (gen_random_uuid(), 'msg_delete_confirm_title', 'es', 'Confirmar Eliminación'),
  
  (gen_random_uuid(), 'msg_delete_confirm_desc', 'en', 'Are you sure you want to delete this billing rule? It will no longer be applied to future automated invoices.'),
  (gen_random_uuid(), 'msg_delete_confirm_desc', 'pt', 'Tem certeza de que deseja excluir esta regra de faturamento? Ela não será mais aplicada a faturas futuras.'),
  (gen_random_uuid(), 'msg_delete_confirm_desc', 'es', '¿Está seguro de que desea eliminar esta regla de facturación? Ya no se aplicará a futuras facturas automatizadas.'),
  
  (gen_random_uuid(), 'loading_translations', 'en', 'Loading translations...'),
  (gen_random_uuid(), 'loading_translations', 'pt', 'Carregando traduções...'),
  (gen_random_uuid(), 'loading_translations', 'es', 'Cargando traducciones...'),
  
  (gen_random_uuid(), 'toast_error_title', 'en', 'Error'),
  (gen_random_uuid(), 'toast_error_title', 'pt', 'Erro'),
  (gen_random_uuid(), 'toast_error_title', 'es', 'Error'),
  
  (gen_random_uuid(), 'toast_name_required', 'en', 'Name is required'),
  (gen_random_uuid(), 'toast_name_required', 'pt', 'O nome é obrigatório'),
  (gen_random_uuid(), 'toast_name_required', 'es', 'El nombre es obligatorio'),
  
  (gen_random_uuid(), 'toast_success_title', 'en', 'Success'),
  (gen_random_uuid(), 'toast_success_title', 'pt', 'Sucesso'),
  (gen_random_uuid(), 'toast_success_title', 'es', 'Éxito'),
  
  (gen_random_uuid(), 'toast_agreement_updated', 'en', 'Agreement updated successfully.'),
  (gen_random_uuid(), 'toast_agreement_updated', 'pt', 'Acordo atualizado com sucesso.'),
  (gen_random_uuid(), 'toast_agreement_updated', 'es', 'Acuerdo actualizado con éxito.'),
  
  (gen_random_uuid(), 'toast_agreement_created', 'en', 'Agreement created successfully.'),
  (gen_random_uuid(), 'toast_agreement_created', 'pt', 'Acordo criado com sucesso.'),
  (gen_random_uuid(), 'toast_agreement_created', 'es', 'Acuerdo creado con éxito.'),
  
  (gen_random_uuid(), 'toast_agreement_deleted', 'en', 'Agreement deleted successfully.'),
  (gen_random_uuid(), 'toast_agreement_deleted', 'pt', 'Acordo excluído com sucesso.'),
  (gen_random_uuid(), 'toast_agreement_deleted', 'es', 'Acuerdo eliminado con éxito.')
  
  ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
END $$;
