CREATE TABLE IF NOT EXISTS public.ui_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(key, locale)
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';

ALTER TABLE public.ui_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_translations" ON public.ui_translations;
CREATE POLICY "public_read_translations" ON public.ui_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_manage_translations" ON public.ui_translations;
CREATE POLICY "admin_manage_translations" ON public.ui_translations USING (is_admin_or_pm());

INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('service_pricing_title', 'en', 'N-Tier Billing & Agreements'),
  ('service_pricing_title', 'pt', 'Acordos e Faturamento N-Tier'),
  ('service_pricing_desc', 'en', 'Configure automated hierarchy rules (Admin ➔ PM ➔ Owner & Partner ➔ PM).'),
  ('service_pricing_desc', 'pt', 'Configure regras hierárquicas automatizadas (Admin ➔ PM ➔ Proprietário & Parceiro ➔ PM).'),
  ('column_name', 'en', 'Rule Name'),
  ('column_name', 'pt', 'Nome da Regra'),
  ('column_hierarchy', 'en', 'Hierarchy (By ➔ To)'),
  ('column_hierarchy', 'pt', 'Hierarquia (De ➔ Para)'),
  ('column_scope', 'en', 'Target Scope'),
  ('column_scope', 'pt', 'Escopo Alvo'),
  ('column_logic', 'en', 'Logic Type'),
  ('column_logic', 'pt', 'Tipo de Lógica'),
  ('column_rate', 'en', 'Rate'),
  ('column_rate', 'pt', 'Taxa / Valor'),
  ('column_status', 'en', 'Status'),
  ('column_status', 'pt', 'Estado'),
  ('column_actions', 'en', 'Actions'),
  ('column_actions', 'pt', 'Ações'),
  ('btn_new_rule', 'en', 'New Billing Rule'),
  ('btn_new_rule', 'pt', 'Nova Regra de Cobrança'),
  ('btn_edit_rule', 'en', 'Edit Rule'),
  ('btn_edit_rule', 'pt', 'Editar Regra'),
  ('btn_delete_rule', 'en', 'Delete Rule'),
  ('btn_delete_rule', 'pt', 'Excluir Regra'),
  ('btn_cancel', 'en', 'Cancel'),
  ('btn_cancel', 'pt', 'Cancelar'),
  ('btn_save_rule', 'en', 'Save Rule'),
  ('btn_save_rule', 'pt', 'Salvar Regra'),
  ('msg_no_rules', 'en', 'No billing hierarchy rules configured.'),
  ('msg_no_rules', 'pt', 'Nenhuma regra de hierarquia configurada.'),
  ('btn_create_rule', 'en', 'Create rule'),
  ('btn_create_rule', 'pt', 'Criar regra'),
  ('role_master', 'en', 'Admin'),
  ('role_master', 'pt', 'Admin'),
  ('role_software_tenant', 'en', 'PM'),
  ('role_software_tenant', 'pt', 'Gerente (PM)'),
  ('role_property_owner', 'en', 'Owner'),
  ('role_property_owner', 'pt', 'Proprietário'),
  ('role_partner', 'en', 'Partner'),
  ('role_partner', 'pt', 'Parceiro'),
  ('role_partner_employee', 'en', 'Team'),
  ('role_partner_employee', 'pt', 'Equipe'),
  ('role_advertiser', 'en', 'Advertiser'),
  ('role_advertiser', 'pt', 'Anunciante'),
  ('placement_home_top', 'en', 'Home Top Banner'),
  ('placement_home_top', 'pt', 'Banner Superior Início'),
  ('placement_home_bottom', 'en', 'Home Bottom Banner'),
  ('placement_home_bottom', 'pt', 'Banner Inferior Início'),
  ('placement_sidebar', 'en', 'Sidebar'),
  ('placement_sidebar', 'pt', 'Barra Lateral')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
