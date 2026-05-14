-- Drop restrictive SELECT policy that blocks creation flow
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;

-- Allow authenticated users to read conversations table
-- Conversations only hold id and timestamps, no sensitive data.
-- Read access to the actual messages is still protected by messages policies.
CREATE POLICY "conversations_select_all" ON public.conversations
  FOR SELECT TO authenticated USING (true);
