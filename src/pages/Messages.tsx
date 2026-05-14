import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Send,
  MessageSquarePlus,
  User as UserIcon,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { canChat } from '@/lib/permissions'
import { User } from '@/lib/types'

interface Profile {
  id: string
  name: string
  email: string
  role: string
  pm_id?: string
}

interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: Profile[]
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function Messages() {
  const { profile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const convIdParam = searchParams.get('chat')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([])

  const [activeConvId, setActiveConvId] = useState<string | null>(convIdParam)
  const [newMessage, setNewMessage] = useState('')

  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeConvId && activeConvId !== convIdParam) {
      setSearchParams({ chat: activeConvId }, { replace: true })
    }
  }, [activeConvId, convIdParam, setSearchParams])

  useEffect(() => {
    if (convIdParam && convIdParam !== activeConvId) {
      setActiveConvId(convIdParam)
    }
  }, [convIdParam])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
  }

  useEffect(() => {
    if (authLoading || !profile) return
    loadConversations()
    loadAvailableUsers()
  }, [profile, authLoading])

  useEffect(() => {
    if (!profile) return

    const convSub = supabase
      .channel('conversations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `profile_id=eq.${profile.id}`,
        },
        () => loadConversations(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => loadConversations(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(convSub)
    }
  }, [profile])

  useEffect(() => {
    if (!activeConvId) return
    loadMessages(activeConvId)

    const msgSub = supabase
      .channel(`messages_${activeConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          scrollToBottom()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(msgSub)
    }
  }, [activeConvId])

  const loadConversations = async () => {
    if (!profile) return
    try {
      const { data: myParts, error: myPartsErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id)

      if (myPartsErr) throw myPartsErr

      if (!myParts || myParts.length === 0) {
        setConversations([])
        setLoadingConvs(false)
        return
      }

      const convIds = myParts.map((p) => p.conversation_id)

      const { data: convData, error: convErr } = await supabase
        .from('conversations')
        .select(
          `
          id, created_at, updated_at,
          conversation_participants!inner(
            profile_id,
            profiles(id, name, email, role, pm_id)
          )
        `,
        )
        .in('id', convIds)
        .order('updated_at', { ascending: false })

      if (convErr) throw convErr

      const formattedConvs: Conversation[] = (convData || []).map((c: any) => {
        const participants = c.conversation_participants
          .map((cp: any) => cp.profiles)
          .filter(Boolean)
        return {
          id: c.id,
          created_at: c.created_at,
          updated_at: c.updated_at,
          participants,
        }
      })

      setConversations(formattedConvs)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConvs(false)
    }
  }

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      scrollToBottom()
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error

      const filteredUsers = (data as Profile[]).filter((u) => {
        if (u.id === profile?.id) return false
        if (profile) {
          const initiator = {
            id: profile.id,
            role: profile.role,
            parentPartnerId: (profile as any).pm_id,
          } as User
          const target = {
            id: u.id,
            role: u.role,
            parentPartnerId: u.pm_id,
          } as User
          return canChat(initiator, target)
        }
        return false
      })

      setAvailableUsers(filteredUsers)
    } catch (error) {
      console.error('Error loading available users:', error)
    }
  }

  const startConversation = async (targetUserId: string) => {
    if (!profile) return

    try {
      const existingConv = conversations.find((c) =>
        c.participants.some((p) => p.id === targetUserId),
      )

      if (existingConv) {
        setActiveConvId(existingConv.id)
        setIsDialogOpen(false)
        return
      }

      const { data: newConv, error: convErr } = await supabase
        .from('conversations')
        .insert({ updated_at: new Date().toISOString() })
        .select()
        .single()

      if (convErr) throw convErr

      const { error: partErr } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, profile_id: profile.id },
          { conversation_id: newConv.id, profile_id: targetUserId },
        ])

      if (partErr) throw partErr

      const targetUser = availableUsers.find((u) => u.id === targetUserId)
      if (targetUser) {
        const newConversationObj: Conversation = {
          id: newConv.id,
          created_at: newConv.created_at,
          updated_at: newConv.updated_at,
          participants: [profile, targetUser],
        }
        setConversations((prev) => [newConversationObj, ...prev])
      }

      setActiveConvId(newConv.id)
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error('Error starting conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConvId || !profile || !newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: activeConvId,
        sender_id: profile.id,
        content: content,
      })

      if (error) throw error

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConvId)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Message failed',
        description: 'Could not send message. Try again.',
        variant: 'destructive',
      })
      setNewMessage(content)
    }
  }

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.id !== profile?.id)
  }

  const activeConversation = conversations.find((c) => c.id === activeConvId)
  const activeOtherUser = activeConversation
    ? getOtherParticipant(activeConversation)
    : null

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h2 className="font-semibold text-lg text-slate-800">Messages</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-1 max-h-[60vh] overflow-y-auto pr-2">
                {availableUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <UserIcon className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No available contacts</p>
                  </div>
                ) : (
                  availableUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        startConversation(u.id)
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10 border">
                        <img
                          src={`https://img.usecurling.com/ppl/thumbnail?seed=${u.id}`}
                          className="aspect-square h-full w-full object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize truncate">
                          {u.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          {loadingConvs ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
              <MessageSquarePlus className="w-8 h-8 mb-3 opacity-20" />
              <p>No conversations yet.</p>
              <p className="text-xs mt-1">Click the + button to start one.</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv)
                const isActive = activeConvId === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all text-left ${
                      isActive
                        ? 'bg-primary/10 hover:bg-primary/15'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <Avatar
                      className={`h-10 w-10 border ${isActive ? 'border-primary/20' : 'border-slate-200'}`}
                    >
                      <img
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${other?.id}`}
                        className="aspect-square h-full w-full object-cover"
                      />
                      <AvatarFallback
                        className={
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-slate-100'
                        }
                      >
                        {other?.name?.substring(0, 2).toUpperCase() || (
                          <UserIcon className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-medium text-sm truncate ${isActive ? 'text-primary' : 'text-slate-900'}`}
                      >
                        {other?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate capitalize">
                        {other?.role?.replace('_', ' ') || ''}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {activeConvId && activeConversation ? (
          <>
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white/95 backdrop-blur z-10 sticky top-0">
              <Avatar className="h-10 w-10 border shadow-sm">
                <img
                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${activeOtherUser?.id}`}
                  className="aspect-square h-full w-full object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activeOtherUser?.name?.substring(0, 2).toUpperCase() || (
                    <UserIcon />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {activeOtherUser?.name || 'Unknown User'}
                </h3>
                <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {activeOtherUser?.role?.replace('_', ' ') || ''}
                </p>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
              ref={scrollRef}
            >
              {loadingMessages ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="text-sm">
                    This is the beginning of your conversation.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === profile?.id
                  const showTime =
                    index === 0 ||
                    new Date(msg.created_at).getTime() -
                      new Date(messages[index - 1].created_at).getTime() >
                      5 * 60 * 1000

                  return (
                    <div key={msg.id} className="flex flex-col">
                      {showTime && (
                        <div className="flex justify-center my-3">
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-full">
                            {format(new Date(msg.created_at), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 opacity-0 hover:opacity-100 transition-opacity">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={sendMessage} className="flex gap-2 items-end">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 focus-visible:ring-1 focus-visible:bg-white"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className="shrink-0 rounded-full h-10 w-10"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100 mb-4">
              <MessageSquarePlus className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">
              Your Messages
            </h3>
            <p className="text-sm">Select a conversation or start a new one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
