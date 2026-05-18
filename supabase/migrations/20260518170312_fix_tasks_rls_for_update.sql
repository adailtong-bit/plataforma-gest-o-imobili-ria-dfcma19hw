DO $do$
BEGIN
  -- Drop existing update policy
  DROP POLICY IF EXISTS "tasks_update" ON public.tasks;

  -- Recreate tasks_update to explicitly allow partners and employees to update tasks
  -- to ensure the "Accept" and "Decline" buttons work properly.
  CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    partner_employee_id = auth.uid()::text OR
    created_by = auth.uid() OR
    public.is_admin_or_pm() OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('partner', 'partner_employee'))
  )
  WITH CHECK (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    partner_employee_id = auth.uid()::text OR
    created_by = auth.uid() OR
    public.is_admin_or_pm() OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('partner', 'partner_employee'))
  );
END $do$;
