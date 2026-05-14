-- Tighten RLS policies to enforce isolation and prevent cross-tenant data leaks

CREATE OR REPLACE FUNCTION public.is_admin_or_pm()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $func$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('master', 'software_tenant', 'internal_user', 'platform_owner')
  );
$func$;

DO $do$
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
  CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated 
  USING (
    id = auth.uid() OR public.is_admin_or_pm()
  );

  -- Properties policies
  DROP POLICY IF EXISTS "properties_select" ON public.properties;
  CREATE POLICY "properties_select" ON public.properties FOR SELECT TO authenticated 
  USING (
    owner_id = auth.uid() OR 
    agent_id = auth.uid() OR 
    public.is_admin_or_pm()
  );

  DROP POLICY IF EXISTS "properties_insert" ON public.properties;
  CREATE POLICY "properties_insert" ON public.properties FOR INSERT TO authenticated 
  WITH CHECK (
    public.is_admin_or_pm()
  );

  DROP POLICY IF EXISTS "properties_update" ON public.properties;
  CREATE POLICY "properties_update" ON public.properties FOR UPDATE TO authenticated 
  USING (
    owner_id = auth.uid() OR 
    agent_id = auth.uid() OR 
    public.is_admin_or_pm()
  );

  -- Ledger entries policies
  DROP POLICY IF EXISTS "ledger_select" ON public.ledger_entries;
  CREATE POLICY "ledger_select" ON public.ledger_entries FOR SELECT TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    public.is_admin_or_pm()
  );

  -- Tasks policies
  DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
  CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    public.is_admin_or_pm()
  );

  -- Hotels policies
  DROP POLICY IF EXISTS "hotels_select" ON public.hotels;
  CREATE POLICY "hotels_select" ON public.hotels FOR SELECT TO authenticated 
  USING (
    public.is_admin_or_pm()
  );

  -- Towers policies
  DROP POLICY IF EXISTS "towers_select" ON public.towers;
  CREATE POLICY "towers_select" ON public.towers FOR SELECT TO authenticated 
  USING (
    public.is_admin_or_pm()
  );

END $do$;
