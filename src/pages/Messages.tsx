import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  Send,
  Paperclip,
  Mic,
  Phone,
  X,
  Plus,
  LayoutTemplate,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useMessageStore from '@/stores/useMessageStore'
import useAuthStore from '@/stores/useAuthStore'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { canChat } from '@/lib/permissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useLanguageStore from '@/stores/useLanguageStore'
import { useSearchParams } from 'react-router-dom'

export default function Messages() {
  const { messages, sendMessage, markAsRead, startChat } = useMessageStore()
  const { currentUser, allUsers } = useAuthStore()
  const { t } = useLanguageStore()
  const [searchParams] = useSearchParams()

  const [filter, setFilter] = useState('all')
  const [selectedMessageId, setSelectedMessageId] = useState<string>('')
  const [inputText, setInputText] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [searchContact, setSearchContact] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle Deep Linking
  useEffect(() => {
    const contactId = searchParams.get('contactId')
    if (contactId) {
      // Find existing chat or start new
      const existing = messages.find(
        (m) => m.contactId === contactId && m.ownerId === currentUser.id,
      )
      if (existing) {
        setSelectedMessageId(existing.id)
      } else {
        startChat(contactId)
        // Need to wait for store update to select it, or optimistic
        // For now rely on user finding it or auto-select logic below if it becomes first
        // Or force selection if we know the ID structure or if startChat returns it
        // A simple trick: set filter to show it
      }
    } else if (!selectedMessageId && messages.length > 0) {
      setSelectedMessageId(messages[0].id)
    }
  }, [messages, searchParams, currentUser.id, startChat])

  // Deselect if messages become empty
  useEffect(() => {
    if (messages.length === 0) {
      setSelectedMessageId('')
    }
  }, [messages])

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread' && msg.unread === 0) return false
    return true
  })

  const selectedConversation = messages.find((m) => m.id === selectedMessageId)

  useEffect(() => {
    if (selectedMessageId) {
      markAsRead(selectedMessageId)
    }
  }, [selectedMessageId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedConversation?.history, selectedMessageId])

  const handleSend = () => {
    if (
      (inputText.trim() || attachments.length > 0) &&
      selectedConversation?.contactId
    ) {
      sendMessage(selectedConversation.contactId, inputText, attachments)
      setInputText('')
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAttachments((prev) => [...prev, url])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const availableContacts = allUsers.filter((user) => {
    if (user.id === currentUser.id) return false
    if (!canChat(currentUser.role, user.role)) return false
    if (
      searchContact &&
      !user.name.toLowerCase().includes(searchContact.toLowerCase())
    )
      return false
    return true
  })

  const handleStartChat = (contactId: string) => {
    startChat(contactId)
    setIsNewChatOpen(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar List */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="p-4 border-b space-y-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{t('messages.title')}</CardTitle>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('messages.new_message')}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder={t('messages.search_contact')}
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                    className="mb-4"
                  />
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {availableContacts.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm py-4">
                          {t('messages.no_contacts')}
                        </p>
                      ) : (
                        availableContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleStartChat(contact.id)}
                          >
                            <Avatar>
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback>
                                {contact.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {contact.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t(`roles.${contact.role}`)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('messages.search_conv')} className="pl-8" />
          </div>
          <Tabs
            defaultValue="all"
            value={filter}
            onValueChange={setFilter}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="unread">{t('messages.unread')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t('messages.no_conv')}
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={cn(
                      'flex gap-3 p-4 border-b cursor-pointer hover:bg-accent transition-colors relative',
                      msg.id === selectedMessageId ? 'bg-accent/50' : '',
                    )}
                  >
                    <Avatar>
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>{msg.contact.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm truncate max-w-[120px]">
                          {msg.contact}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {msg.lastMessage}
                      </p>
                    </div>
                    {msg.unread > 0 && (
                      <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-trust-blue absolute right-2 bottom-4">
                        {msg.unread}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      {selectedConversation ? (
        <Card className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-card rounded-t-lg">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>
                  {selectedConversation.contact.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.contact}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    ● {t('messages.online')}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {t(`roles.${selectedConversation.type}`)}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
          </div>

          <div
            className="flex-1 p-4 bg-slate-50 overflow-y-auto"
            ref={scrollRef}
          >
            <div className="space-y-4">
              {selectedConversation.history.length === 0 && (
                <div className="text-center text-muted-foreground text-sm mt-10">
                  {t('messages.new_chat_prompt')}
                </div>
              )}
              {selectedConversation.history.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.sender === 'me' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-[70%] text-sm shadow-sm',
                      msg.sender === 'me'
                        ? 'bg-trust-blue text-white rounded-tr-none'
                        : 'bg-white border rounded-tl-none',
                    )}
                  >
                    {msg.text}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {msg.attachments.map((att, i) => (
                          <img
                            key={i}
                            src={att}
                            className="rounded-md object-cover w-full h-auto max-h-40"
                          />
                        ))}
                      </div>
                    )}
                    <span
                      className={cn(
                        'text-[10px] block mt-1 text-right',
                        msg.sender === 'me'
                          ? 'text-blue-100'
                          : 'text-muted-foreground',
                      )}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t bg-card rounded-b-lg flex flex-col gap-2">
            {attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attachments.map((url, i) => (
                  <div key={i} className="relative group shrink-0">
                    <img
                      src={url}
                      className="h-16 w-16 object-cover rounded-md border"
                    />
                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title={t('messages.attach')}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder={t('messages.type_message')}
                className="flex-1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="bg-trust-blue"
                onClick={handleSend}
                disabled={!inputText.trim() && attachments.length === 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center bg-muted/20 gap-4">
          <div className="bg-background p-4 rounded-full shadow-sm">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">{t('messages.select_prompt')}</p>
        </Card>
      )}
    </div>
  )
}
