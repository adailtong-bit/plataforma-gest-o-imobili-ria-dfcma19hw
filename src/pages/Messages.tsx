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
  Lock,
  Users,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useMessageStore from '@/stores/useMessageStore'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Messages() {
  const { messages, sendMessage, markAsRead } = useMessageStore()
  const [filter, setFilter] = useState('all')
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [inputText, setInputText] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize selected contact
  useEffect(() => {
    if (!selectedContactId && messages.length > 0) {
      setSelectedContactId(messages[0].id)
    }
  }, [messages])

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true
    return msg.type === filter
  })

  const selectedConversation = messages.find((m) => m.id === selectedContactId)

  useEffect(() => {
    if (selectedContactId) {
      markAsRead(selectedContactId)
    }
  }, [selectedContactId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedConversation?.history, selectedContactId])

  const handleSend = () => {
    if ((inputText.trim() || attachments.length > 0) && selectedContactId) {
      sendMessage(selectedContactId, inputText, attachments)
      setInputText('')
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar List */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg">Mensagens</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." className="pl-8" />
          </div>
          <Tabs
            defaultValue="all"
            value={filter}
            onValueChange={setFilter}
            className="w-full mt-2"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="partner">Parceiros</TabsTrigger>
              <TabsTrigger value="owner">Owners</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Nenhuma conversa encontrada.
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedContactId(msg.id)}
                    className={cn(
                      'flex gap-3 p-4 border-b cursor-pointer hover:bg-accent transition-colors relative',
                      msg.id === selectedContactId ? 'bg-accent/50' : '',
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
                    {msg.type === 'partner' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3 w-3 text-amber-500 absolute top-2 right-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Restrito: Apenas Gestão</p>
                        </TooltipContent>
                      </Tooltip>
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
                    ● Online
                  </span>
                  {selectedConversation.type === 'partner' && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1 bg-amber-50 text-amber-600 border-amber-200"
                    >
                      <Lock className="h-3 w-3 mr-1" /> Interno
                    </Badge>
                  )}
                  {selectedConversation.type === 'owner' && (
                    <Badge variant="outline" className="text-[10px] h-5 px-1">
                      <Users className="h-3 w-3 mr-1" /> Proprietário
                    </Badge>
                  )}
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
                onClick={handleFileClick}
                title="Anexar arquivo"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder={
                  selectedConversation.type === 'partner'
                    ? 'Mensagem interna para parceiro...'
                    : 'Digite sua mensagem...'
                }
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
        <Card className="flex-1 flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground">
            Selecione uma conversa para começar.
          </p>
        </Card>
      )}
    </div>
  )
}
