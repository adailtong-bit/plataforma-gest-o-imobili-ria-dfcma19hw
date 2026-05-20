DO $DO$
BEGIN
  INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('service_pricing_title', 'en', 'N-Tier Billing & Agreements'),
  ('service_pricing_title', 'pt', 'Faturamento e Acordos em N-Camadas'),
  
  ('service_pricing_desc', 'en', 'Configure automated hierarchy rules (Admin ➔ PM ➔ Owner & Partner ➔ PM).'),
  ('service_pricing_desc', 'pt', 'Configure regras de hierarquia automatizadas (Admin ➔ PM ➔ Proprietário e Parceiro ➔ PM).'),

  ('search_rules_placeholder', 'en', 'Search rules...'),
  ('search_rules_placeholder', 'pt', 'Buscar regras...'),

  ('btn_new_rule', 'en', 'New Billing Rule'),
  ('btn_new_rule', 'pt', 'Nova Regra de Faturamento'),

  ('btn_edit_rule', 'en', 'Edit Billing Rule'),
  ('btn_edit_rule', 'pt', 'Editar Regra de Faturamento'),

  ('btn_delete_rule', 'en', 'Delete Rule'),
  ('btn_delete_rule', 'pt', 'Excluir Regra'),

  ('btn_create_rule', 'en', 'Create rule'),
  ('btn_create_rule', 'pt', 'Criar regra'),

  ('btn_cancel', 'en', 'Cancel'),
  ('btn_cancel', 'pt', 'Cancelar'),

  ('btn_save_rule', 'en', 'Save Rule'),
  ('btn_save_rule', 'pt', 'Salvar Regra'),

  ('column_name', 'en', 'Rule Name'),
  ('column_name', 'pt', 'Nome da Regra'),

  ('column_hierarchy', 'en', 'Hierarchy (By ➔ To)'),
  ('column_hierarchy', 'pt', 'Hierarquia (De ➔ Para)'),

  ('column_scope', 'en', 'Target Scope'),
  ('column_scope', 'pt', 'Escopo Alvo'),

  ('column_logic', 'en', 'Logic Type'),
  ('column_logic', 'pt', 'Tipo de Lógica'),

  ('column_rate', 'en', 'Rate'),
  ('column_rate', 'pt', 'Taxa'),

  ('column_status', 'en', 'Status'),
  ('column_status', 'pt', 'Status'),

  ('column_actions', 'en', 'Actions'),
  ('column_actions', 'pt', 'Ações'),

  ('status_active', 'en', 'Active'),
  ('status_active', 'pt', 'Ativo'),

  ('status_inactive', 'en', 'Inactive'),
  ('status_inactive', 'pt', 'Inativo'),

  ('role_label_pm', 'en', 'Property Manager'),
  ('role_label_pm', 'pt', 'Gerente de Propriedades'),

  ('role_label_adv', 'en', 'Advertiser'),
  ('role_label_adv', 'pt', 'Anunciante'),

  ('role_label_owner', 'en', 'Property Owner'),
  ('role_label_owner', 'pt', 'Proprietário'),

  ('role_label_partner_boss', 'en', 'Service Partner (Your Boss)'),
  ('role_label_partner_boss', 'pt', 'Parceiro de Serviço (Seu Chefe)'),

  ('role_master', 'en', 'Admin'),
  ('role_master', 'pt', 'Admin'),

  ('role_software_tenant', 'en', 'PM'),
  ('role_software_tenant', 'pt', 'PM'),

  ('role_property_owner', 'en', 'Owner'),
  ('role_property_owner', 'pt', 'Proprietário'),

  ('role_partner', 'en', 'Partner'),
  ('role_partner', 'pt', 'Parceiro'),

  ('role_partner_employee', 'en', 'Team'),
  ('role_partner_employee', 'pt', 'Equipe'),

  ('role_advertiser', 'en', 'Advertiser'),
  ('role_advertiser', 'pt', 'Anunciante'),

  ('role_system', 'en', 'System'),
  ('role_system', 'pt', 'Sistema'),

  ('role_user', 'en', 'User'),
  ('role_user', 'pt', 'Usuário'),

  ('type_software_fee_per_house', 'en', 'Software Fee (Per House)'),
  ('type_software_fee_per_house', 'pt', 'Taxa de Software (Por Casa)'),

  ('type_fixed_admin_fee', 'en', 'Platform Fixed Fee'),
  ('type_fixed_admin_fee', 'pt', 'Taxa Fixa da Plataforma'),

  ('type_ad_placement_fee', 'en', 'Ad Placement Fee'),
  ('type_ad_placement_fee', 'pt', 'Taxa de Posicionamento de Anúncio'),

  ('type_booking_percentage', 'en', 'Booking Revenue Share (%)'),
  ('type_booking_percentage', 'pt', 'Participação de Receita de Reserva (%)'),

  ('type_markup_cleaning', 'en', 'Cleaning Markup'),
  ('type_markup_cleaning', 'pt', 'Markup de Limpeza'),

  ('type_markup_maintenance', 'en', 'Maintenance Markup'),
  ('type_markup_maintenance', 'pt', 'Markup de Manutenção'),

  ('type_markup_purchases', 'en', 'Purchases/Parts Markup'),
  ('type_markup_purchases', 'pt', 'Markup de Compras/Peças'),

  ('type_partner_cleaning_fee', 'en', 'Cleaning Fee'),
  ('type_partner_cleaning_fee', 'pt', 'Taxa de Limpeza'),

  ('type_partner_maintenance_fee', 'en', 'Maintenance Fee'),
  ('type_partner_maintenance_fee', 'pt', 'Taxa de Manutenção'),

  ('type_partner_parts_fee', 'en', 'Parts & Materials Fee'),
  ('type_partner_parts_fee', 'pt', 'Taxa de Peças e Materiais'),

  ('type_team_cleaning_fee', 'en', 'Cleaning Payout'),
  ('type_team_cleaning_fee', 'pt', 'Pagamento de Limpeza'),

  ('type_team_maintenance_fee', 'en', 'Maintenance Payout'),
  ('type_team_maintenance_fee', 'pt', 'Pagamento de Manutenção'),

  ('type_team_parts_fee', 'en', 'Parts Reimbursement'),
  ('type_team_parts_fee', 'pt', 'Reembolso de Peças'),

  ('type_custom', 'en', 'Custom Rule'),
  ('type_custom', 'pt', 'Regra Personalizada'),

  ('toast_error_title', 'en', 'Error'),
  ('toast_error_title', 'pt', 'Erro'),

  ('toast_name_required', 'en', 'Name is required'),
  ('toast_name_required', 'pt', 'O nome é obrigatório'),

  ('toast_success_title', 'en', 'Success'),
  ('toast_success_title', 'pt', 'Sucesso'),

  ('toast_agreement_updated', 'en', 'Agreement updated successfully.'),
  ('toast_agreement_updated', 'pt', 'Acordo atualizado com sucesso.'),

  ('toast_agreement_created', 'en', 'Agreement created successfully.'),
  ('toast_agreement_created', 'pt', 'Acordo criado com sucesso.'),

  ('toast_agreement_deleted', 'en', 'Agreement deleted successfully.'),
  ('toast_agreement_deleted', 'pt', 'Acordo excluído com sucesso.'),

  ('target_global', 'en', 'Global'),
  ('target_global', 'pt', 'Global'),

  ('dialog_financial_hierarchy', 'en', 'Financial Hierarchy'),
  ('dialog_financial_hierarchy', 'pt', 'Hierarquia Financeira'),

  ('dialog_hierarchy_desc', 'en', 'Only valid relationships for your role ('),
  ('dialog_hierarchy_desc', 'pt', 'Apenas relacionamentos válidos para a sua função ('),

  ('dialog_hierarchy_desc_suffix', 'en', ') are shown.'),
  ('dialog_hierarchy_desc_suffix', 'pt', ') são mostrados.'),

  ('label_source_role', 'en', 'Billed By (Source Role)'),
  ('label_source_role', 'pt', 'Faturado Por (Função de Origem)'),

  ('label_target_role', 'en', 'Billed To (Target Role)'),
  ('label_target_role', 'pt', 'Faturado Para (Função de Destino)'),

  ('placeholder_who_pays', 'en', 'Who pays?'),
  ('placeholder_who_pays', 'pt', 'Quem paga?'),

  ('label_rule_name', 'en', 'Rule Name'),
  ('label_rule_name', 'pt', 'Nome da Regra'),

  ('placeholder_rule_name', 'en', 'e.g. Monthly PM Admin Fee'),
  ('placeholder_rule_name', 'pt', 'ex. Taxa de Administração Mensal do PM'),

  ('label_target_scope', 'en', 'Target Player Scope'),
  ('label_target_scope', 'pt', 'Escopo de Jogador Alvo'),

  ('target_users', 'en', 'Users'),
  ('target_users', 'pt', 'Usuários'),

  ('label_calculation_logic', 'en', 'Calculation Logic (Rule Type)'),
  ('label_calculation_logic', 'pt', 'Lógica de Cálculo (Tipo de Regra)'),

  ('placeholder_select_type', 'en', 'Select type...'),
  ('placeholder_select_type', 'pt', 'Selecione o tipo...'),

  ('label_value_type', 'en', 'Value Type'),
  ('label_value_type', 'pt', 'Tipo de Valor'),

  ('placeholder_value_type', 'en', 'Value type'),
  ('placeholder_value_type', 'pt', 'Tipo de valor'),

  ('option_percentage', 'en', 'Percentage (%)'),
  ('option_percentage', 'pt', 'Porcentagem (%)'),

  ('option_fixed', 'en', 'Fixed Amount ($)'),
  ('option_fixed', 'pt', 'Valor Fixo ($)'),

  ('label_amount_rate', 'en', 'Amount / Rate'),
  ('label_amount_rate', 'pt', 'Valor / Taxa'),

  ('label_frequency', 'en', 'Frequency'),
  ('label_frequency', 'pt', 'Frequência'),

  ('placeholder_frequency', 'en', 'Frequency'),
  ('placeholder_frequency', 'pt', 'Frequência'),

  ('option_per_booking', 'en', 'Per Booking (Auto)'),
  ('option_per_booking', 'pt', 'Por Reserva (Auto)'),

  ('option_per_task', 'en', 'Per Task (Auto)'),
  ('option_per_task', 'pt', 'Por Tarefa (Auto)'),

  ('option_monthly', 'en', 'Monthly Fixed'),
  ('option_monthly', 'pt', 'Fixo Mensal'),

  ('option_yearly', 'en', 'Yearly Fixed'),
  ('option_yearly', 'pt', 'Fixo Anual'),

  ('label_valid_from', 'en', 'Valid From'),
  ('label_valid_from', 'pt', 'Válido Desde'),

  ('msg_no_rules', 'en', 'No billing hierarchy rules configured.'),
  ('msg_no_rules', 'pt', 'Nenhuma regra de hierarquia de faturamento configurada.'),

  ('msg_delete_confirm_title', 'en', 'Confirm Deletion'),
  ('msg_delete_confirm_title', 'pt', 'Confirmar Exclusão'),

  ('msg_delete_confirm_desc', 'en', 'Are you sure you want to delete this billing rule? It will no longer be applied to future automated invoices.'),
  ('msg_delete_confirm_desc', 'pt', 'Tem certeza de que deseja excluir esta regra de faturamento? Ela não será mais aplicada a faturas automáticas futuras.'),

  ('Platform License per House', 'en', 'Platform License per House'),
  ('Platform License per House', 'pt', 'Licença da Plataforma por Casa'),

  ('Booking', 'en', 'Booking'),
  ('Booking', 'pt', 'Reserva')
  ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
END $DO$;
