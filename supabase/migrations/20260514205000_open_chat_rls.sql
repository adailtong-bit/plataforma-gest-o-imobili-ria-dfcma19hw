-- Open conversations to avoid any chat creation friction
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_select_all" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_all" ON public.conversations;
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

CREATE POLICY "conversations_all" ON public.conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Open conversation_participants
DROP POLICY IF EXISTS "Participants can view their participations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;

CREATE POLICY "conversation_participants_all" ON public.conversation_participants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Open messages
DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;

CREATE POLICY "messages_all" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
