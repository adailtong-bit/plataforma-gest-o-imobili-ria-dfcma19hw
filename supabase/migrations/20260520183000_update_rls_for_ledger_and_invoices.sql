DO $$
BEGIN
  DROP POLICY IF EXISTS "admin_all_ledger" ON public.ledger_entries;
  CREATE POLICY "admin_all_ledger" ON public.ledger_entries
    FOR ALL TO authenticated
    USING (public.is_admin_or_pm())
    WITH CHECK (public.is_admin_or_pm());
END $$;
