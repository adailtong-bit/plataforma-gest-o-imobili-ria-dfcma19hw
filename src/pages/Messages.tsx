import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
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
  participants: { profile: Profile }[]
  lastMessage?: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function Messages() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const convIdParam = searchParams.get('chat')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (convIdParam && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === convIdParam)
      if (conv && conv.id !== activeConv?.id) {
        setActiveConv(conv)
      }
    }
  }, [convIdParam, conversations])

  useEffect(() => {
    if (!profile) return
    loadConversations()
    loadAvailableUsers()

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
        () => {
          loadConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(convSub)
    }
  }, [profile])

  useEffect(() => {
    if (!activeConv) return
    loadMessages(activeConv.id)

    const msgSub = supabase
      .channel(`messages_${activeConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new as Message]
          })
          scrollToBottom()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(msgSub)
    }
  }, [activeConv])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
  }

  const loadConversations = async () => {
    if (!profile) return
    try {
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id)

      if (partError) throw partError

      if (!participations?.length) {
        setConversations([])
        setLoading(false)
        return
      }

      const convIds = participations.map((p) => p.conversation_id)

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(
          `
          id,
          created_at,
          updated_at,
          conversation_participants (
            profiles (
              id,
              name,
              email,
              role,
              pm_id
            )
          )
        `,
        )
        .in('id', convIds)
        .order('updated_at', { ascending: false })

      if (convError) throw convError

      const formattedConvs = (convData as any[]).map((c) => ({
        id: c.id,
        created_at: c.created_at,
        participants: c.conversation_participants
          .map((cp: any) => ({ profile: cp.profiles }))
          .filter((p: any) => p.profile !== null),
      }))

      setConversations(formattedConvs)

      if (convIdParam) {
        const urlConv = formattedConvs.find((c) => c.id === convIdParam)
        if (urlConv) setActiveConv(urlConv)
      } else if (activeConv) {
        const updatedActive = formattedConvs.find((c) => c.id === activeConv.id)
        if (updatedActive) setActiveConv(updatedActive)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
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
      const myParticipations = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', profile.id)

      const myIds = myParticipations.data?.map((p) => p.conversation_id) || []

      let commonConvId = null
      if (myIds.length > 0) {
        const { data: commonParts } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', myIds)
          .eq('profile_id', targetUserId)

        commonConvId = commonParts?.[0]?.conversation_id
      }

      if (commonConvId) {
        setIsDialogOpen(false)
        setSearchParams({ chat: commonConvId })
        return
      }

      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ updated_at: new Date().toISOString() })
        .select()
        .single()

      if (convError) throw convError

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, profile_id: profile.id },
          { conversation_id: newConv.id, profile_id: targetUserId },
        ])

      if (partError) throw partError

      await loadConversations()
      setIsDialogOpen(false)
      setSearchParams({ chat: newConv.id })
    } catch (error: any) {
      console.error('Error starting conversation:', error)
      toast({
        title: 'Error starting conversation',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConv || !profile || !newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: activeConv.id,
        sender_id: profile.id,
        content: content,
      })

      if (error) throw error

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConv.id)
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(content)
    }
  }

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.profile.id !== profile?.id)?.profile
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg border shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="w-80 border-r flex flex-col bg-slate-50">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h2 className="font-semibold text-lg">Messages</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <MessageSquarePlus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-2">
                {availableUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available users to chat with.
                  </p>
                ) : (
                  availableUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        startConversation(u.id)
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-100 transition-colors text-left"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {u.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
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
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations yet. Click the + button to start one.
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv)
                const isActive =
                  activeConv?.id === conv.id || convIdParam === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConv(conv)
                      setSearchParams({ chat: conv.id })
                    }}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-100 transition-colors text-left ${
                      isActive ? 'bg-slate-200' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {other?.name?.substring(0, 2).toUpperCase() || (
                          <UserIcon className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-sm truncate">
                        {other?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate capitalize">
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
        {activeConv ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
              <Avatar>
                <AvatarFallback>
                  {getOtherParticipant(activeConv)
                    ?.name?.substring(0, 2)
                    .toUpperCase() || <UserIcon />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {getOtherParticipant(activeConv)?.name || 'Unknown User'}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {getOtherParticipant(activeConv)?.role?.replace('_', ' ') ||
                    ''}
                </p>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              ref={scrollRef}
            >
              {messages.map((msg) => {
                const isMe = msg.sender_id === profile?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-slate-100 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {msg.created_at
                        ? format(new Date(msg.created_at), 'HH:mm')
                        : ''}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="p-4 bg-white border-t">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquarePlus className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
