import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export type ChatMessage = {
  id: string
  text: string
  timestamp: string
  senderId: string
}

export type ChatThread = {
  id: string
  contact: string
  contactId: string
  avatar: string
  lastMessage: string
  time: string
  history: ChatMessage[]
}

export function useChatSystem(currentUser: any) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadUsers = async () => {
      const { data } = await supabase.from('profiles').select('*')
      if (data) setAllUsers(data)
    }
    loadUsers()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return

    const loadConversations = async () => {
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', currentUser.id)

      if (!participantData || participantData.length === 0) {
        setThreads([])
        setLoading(false)
        return
      }

      const convIds = participantData.map((p) => p.conversation_id)

      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, profile_id, profiles(name)')
        .in('conversation_id', convIds)

      const { data: allMessages } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true })

      const newThreads: ChatThread[] = convIds.map((convId) => {
        const otherP = allParticipants?.find(
          (p) =>
            p.conversation_id === convId && p.profile_id !== currentUser.id,
        )
        const contactId = otherP ? otherP.profile_id : 'unknown'
        const profilesData = otherP?.profiles as any
        const contactName = profilesData
          ? Array.isArray(profilesData)
            ? profilesData[0]?.name
            : profilesData?.name
          : 'Unknown'

        const convMessages = (allMessages || []).filter(
          (m) => m.conversation_id === convId,
        )
        const lastMsg =
          convMessages.length > 0 ? convMessages[convMessages.length - 1] : null

        return {
          id: convId,
          contact: contactName,
          contactId: contactId,
          avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${contactId}`,
          lastMessage: lastMsg ? lastMsg.content : '',
          time: lastMsg ? lastMsg.created_at : new Date().toISOString(),
          history: convMessages.map((m) => ({
            id: m.id,
            text: m.content,
            timestamp: m.created_at,
            senderId: m.sender_id,
          })),
        }
      })

      newThreads.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      )
      setThreads(newThreads)
      setLoading(false)
    }

    loadConversations()

    const subscription = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => loadConversations(),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
        },
        () => loadConversations(),
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentUser])

  const sendMessage = async (contactId: string, text: string) => {
    if (!currentUser) return
    let thread = threads.find((t) => t.contactId === contactId)
    let convId = thread?.id

    if (!convId) {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single()
      if (!convData || convError) {
        console.error('Error creating conversation:', convError)
        return
      }
      convId = convData.id
      await supabase.from('conversation_participants').insert([
        { conversation_id: convId, profile_id: currentUser.id },
        { conversation_id: convId, profile_id: contactId },
      ])
    }
    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: currentUser.id,
      content: text,
    })
  }

  const startChat = async (contactId: string) => {
    if (!currentUser) return null
    let thread = threads.find((t) => t.contactId === contactId)
    if (thread) return thread.id

    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single()
    if (!convData || convError) {
      console.error('Error starting conversation:', convError)
      return null
    }
    const convId = convData.id

    await supabase.from('conversation_participants').insert([
      { conversation_id: convId, profile_id: currentUser.id },
      { conversation_id: convId, profile_id: contactId },
    ])

    // Optimistic UI update immediately returns thread ID
    const contactProfile = allUsers.find((u) => u.id === contactId)
    setThreads((prev) => [
      {
        id: convId,
        contact: contactProfile?.name || 'Unknown',
        contactId: contactId,
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${contactId}`,
        lastMessage: '',
        time: new Date().toISOString(),
        history: [],
      },
      ...prev,
    ])

    return convId
  }

  return { threads, allUsers, sendMessage, startChat, loading }
}
