-- Create conversations and messages tables safely

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
    -- Conversations RLS
    DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
    CREATE POLICY "Participants can view conversations" ON public.conversations
        FOR SELECT TO authenticated
        USING (
            id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()) OR
            public.is_admin_or_pm()
        );

    DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
    CREATE POLICY "Users can insert conversations" ON public.conversations
        FOR INSERT TO authenticated
        WITH CHECK (true);

    -- Conversation Participants RLS
    DROP POLICY IF EXISTS "Participants can view their participations" ON public.conversation_participants;
    CREATE POLICY "Participants can view their participations" ON public.conversation_participants
        FOR SELECT TO authenticated
        USING (
            profile_id = auth.uid() OR
            conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()) OR
            public.is_admin_or_pm()
        );

    DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
    CREATE POLICY "Users can add participants" ON public.conversation_participants
        FOR INSERT TO authenticated
        WITH CHECK (true);

    -- Messages RLS
    DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
    CREATE POLICY "Participants can view messages" ON public.messages
        FOR SELECT TO authenticated
        USING (
            conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()) OR
            public.is_admin_or_pm()
        );

    DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
    CREATE POLICY "Participants can insert messages" ON public.messages
        FOR INSERT TO authenticated
        WITH CHECK (
            sender_id = auth.uid() AND
            (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()) OR public.is_admin_or_pm())
        );
END $do$;
