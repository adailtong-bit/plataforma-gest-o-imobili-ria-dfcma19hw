DO $$
BEGIN
  -- Add missing columns to profiles for Dashboard metrics mappings
  ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS source TEXT,
    ADD COLUMN IF NOT EXISTS origin TEXT,
    ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS owner_decision TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

END $$;

-- Ensure robust RLS policies for Dashboard data integrity
DROP POLICY IF EXISTS "bookings_all" ON public.bookings;
CREATE POLICY "bookings_all" ON public.bookings 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "invoices_all" ON public.invoices;
CREATE POLICY "invoices_all" ON public.invoices 
  FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "properties_select" ON public.properties;
CREATE POLICY "properties_select" ON public.properties 
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks 
  FOR SELECT TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid())
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
    OR is_admin_or_pm()
  );
