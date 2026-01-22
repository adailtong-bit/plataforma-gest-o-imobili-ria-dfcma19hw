import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Send,
  User,
  Paperclip,
  MessageCircle,
  Users,
  Building,
  Plus,
} from 'lucide-react'
import useMessageStore from '@/stores/useMessageStore'
import useAuthStore from '@/stores/useAuthStore'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import { cn } from '@/lib/utils'
import { useLocation } from 'react-router-dom'
import useLanguageStore from '@/stores/useLanguageStore'
import { format, parseISO, isValid } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Messages() {
  const { messages, sendMessage, markAsRead, startChat } = useMessageStore()
  const { currentUser, allUsers } = useAuthStore()
  const { tenants } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()

  const location = useLocation()
  const { t } = useLanguageStore()
  const searchParams = new URLSearchParams(location.search)
  const initialContactId = searchParams.get('contactId')
  const context = searchParams.get('context')

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    () => {
      if (initialContactId) {
        const found = messages.find((m) => m.contactId === initialContactId)
        return found ? found.id : null
      }
      return null
    },
  )
  const [inputText, setInputText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [newChatOpen, setNewChatOpen] = useState(false)

  // Resolve Context Data (Renewal)
  const contextTenant =
    context === 'renewal' && initialContactId
      ? tenants.find((t) => t.id === initialContactId)
      : null
  const contextProperty = contextTenant
    ? properties.find((p) => p.id === contextTenant.propertyId)
    : null
  const contextOwner = contextProperty
    ? owners.find((o) => o.id === contextProperty.ownerId)
    : null

  // Ensure chats exist and are selected
  useEffect(() => {
    if (initialContactId) {
      const found = messages.find((m) => m.contactId === initialContactId)

      if (found) {
        if (!selectedMessageId) {
          setSelectedMessageId(found.id)
        }
      } else {
        // Create chat if it doesn't exist
        startChat(initialContactId)
      }
    }
  }, [initialContactId, messages, selectedMessageId, startChat])

  // Ensure Owner chat exists for renewal context
  useEffect(() => {
    if (context === 'renewal' && contextOwner) {
      const found = messages.find((m) => m.contactId === contextOwner.id)
      if (!found) {
        startChat(contextOwner.id)
      }
    }
  }, [context, contextOwner, messages, startChat])

  const selectedMessage = messages.find((m) => m.id === selectedMessageId)

  const handleSend = () => {
    if (inputText.trim() && selectedMessage) {
      sendMessage(selectedMessage.contactId, inputText)
      setInputText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id)
    markAsRead(id)
  }

  const formatMessageTime = (timestamp: string) => {
    try {
      if (!timestamp) return ''
      // Attempt to parse ISO
      const date = parseISO(timestamp)
      if (isValid(date)) {
        return format(date, 'HH:mm')
      }
      // Fallback for old data or just time string
      return timestamp
    } catch (e) {
      return timestamp
    }
  }

  // Users Grouping for New Chat
  const groupedUsers = useMemo(() => {
    return {
      tenants: allUsers.filter((u) => u.role === 'tenant'),
      owners: allUsers.filter((u) => u.role === 'property_owner'),
      partners: allUsers.filter((u) => u.role === 'partner'),
      team: allUsers.filter((u) => u.role === 'partner_employee'),
      internal: allUsers.filter((u) => u.role === 'internal_user'),
    }
  }, [allUsers])

  const handleStartNewChat = (userId: string) => {
    startChat(userId)
    setNewChatOpen(false)
    // Select the new chat
    const newChat = messages.find((m) => m.contactId === userId)
    if (newChat) {
      setSelectedMessageId(newChat.id)
    }
  }

  const UserList = ({ list }: { list: typeof allUsers }) => (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum usuário encontrado.
        </p>
      ) : (
        list.map((u) => (
          <button
            key={u.id}
            className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-md text-left transition-colors"
            onClick={() => handleStartNewChat(u.id)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={u.avatar} />
              <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {u.email}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('messages.title')}
          </h1>
          <p className="text-muted-foreground">{t('messages.subtitle')}</p>
        </div>
        <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('messages.new_message')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('messages.select_user')}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="team" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-transparent p-0 mb-4">
                <TabsTrigger
                  value="team"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  {t('messages.group_team')}
                </TabsTrigger>
                <TabsTrigger
                  value="tenants"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  {t('messages.group_tenants')}
                </TabsTrigger>
                <TabsTrigger
                  value="owners"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  {t('messages.group_owners')}
                </TabsTrigger>
                <TabsTrigger
                  value="partners"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
                >
                  {t('messages.group_partners')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="team">
                <UserList list={groupedUsers.team} />
              </TabsContent>
              <TabsContent value="tenants">
                <UserList list={groupedUsers.tenants} />
              </TabsContent>
              <TabsContent value="owners">
                <UserList list={groupedUsers.owners} />
              </TabsContent>
              <TabsContent value="partners">
                <UserList list={groupedUsers.partners} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Contact List */}
        <Card className="col-span-1 h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('messages.search_contact')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {filteredMessages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t('messages.no_conv')}
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    className={cn(
                      'flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b last:border-0',
                      selectedMessageId === msg.id && 'bg-muted',
                    )}
                    onClick={() => handleSelectMessage(msg.id)}
                  >
                    <Avatar>
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold truncate">
                          {msg.contact}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {msg.lastMessage}
                        </span>
                        {msg.unread > 0 && (
                          <span className="bg-trust-blue text-white text-xs px-2 py-0.5 rounded-full">
                            {msg.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-1 md:col-span-2 h-full flex flex-col">
          {selectedMessage ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-card rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedMessage.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedMessage.contact}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-muted-foreground">
                        {t('messages.online')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Context Header (If Active) */}
              {context === 'renewal' && contextTenant && contextProperty && (
                <div className="bg-muted/30 border-b p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-trust-blue">
                    <Users className="h-3 w-3" />
                    Renewal Negotiation Context
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Property Manager (Me) */}
                    <div
                      className="flex items-center gap-2"
                      title="Property Manager (You)"
                    >
                      <Avatar className="h-6 w-6 border-2 border-trust-blue">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>PM</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold">Me (PM)</span>
                    </div>
                    <span className="text-muted-foreground">/</span>

                    {/* Tenant */}
                    <div className="flex items-center gap-2" title="Tenant">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={contextTenant.avatar} />
                        <AvatarFallback>T</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{contextTenant.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        Tenant
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">/</span>

                    {/* Owner */}
                    <div className="flex items-center gap-2" title="Owner">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={contextOwner?.avatar} />
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">
                        {contextOwner?.name || 'Owner'}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        Owner
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Building className="h-3 w-3" />
                    <span>Property: {contextProperty.name}</span>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                <div className="flex flex-col gap-4">
                  {selectedMessage.history.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={cn(
                        'flex flex-col max-w-[80%]',
                        msg.sender === 'me'
                          ? 'self-end items-end'
                          : 'self-start items-start',
                      )}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-lg text-sm shadow-sm',
                          msg.sender === 'me'
                            ? 'bg-trust-blue text-white rounded-br-none'
                            : 'bg-white border rounded-bl-none',
                        )}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-card rounded-b-lg">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    placeholder={t('messages.type_message')}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="bg-trust-blue shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">
                {t('messages.new_chat_prompt')}
              </h3>
              <p>{t('messages.select_prompt')}</p>
              <Button
                className="mt-4 gap-2"
                variant="outline"
                onClick={() => setNewChatOpen(true)}
              >
                <Plus className="h-4 w-4" /> {t('messages.start_chat_desc')}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
