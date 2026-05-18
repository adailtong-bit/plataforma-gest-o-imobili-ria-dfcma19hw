-- Add created_by column to track task creators and fix RLS policies preventing insert visibility
-- When a user inserts a row and Supabase tries to return it via .select(), if the user doesn't have 
-- SELECT access, PostgreSQL throws an RLS violation. Adding created_by fixes this for task creators.

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

DO $do$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
  DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
  DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
  DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;

  -- Recreate tasks_select
  CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    created_by = auth.uid() OR
    public.is_admin_or_pm()
  );

  -- Recreate tasks_insert
  CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated 
  WITH CHECK (true);

  -- Recreate tasks_update
  CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    created_by = auth.uid() OR
    public.is_admin_or_pm()
  )
  WITH CHECK (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    created_by = auth.uid() OR
    public.is_admin_or_pm()
  );

  -- Recreate tasks_delete
  CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated 
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid() OR agent_id = auth.uid()) OR
    assignee_id = auth.uid() OR
    created_by = auth.uid() OR
    public.is_admin_or_pm()
  );
END $do$;
