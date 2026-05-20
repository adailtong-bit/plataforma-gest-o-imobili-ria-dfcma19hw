-- Ensure authenticated users can view ledger entries and invoices
DROP POLICY IF EXISTS "authenticated_select_ledger" ON public.ledger_entries;
CREATE POLICY "authenticated_select_ledger" ON public.ledger_entries
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_invoices" ON public.invoices;
CREATE POLICY "authenticated_select_invoices" ON public.invoices
  FOR SELECT TO authenticated USING (true);
