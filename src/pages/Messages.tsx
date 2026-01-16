import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Send, Paperclip, Mic, Phone } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import useMessageStore from '@/stores/useMessageStore'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Messages() {
  const { messages, sendMessage, markAsRead } = useMessageStore()
  const [selectedContactId, setSelectedContactId] = useState<string>(
    messages[0]?.id || '',
  )
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

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
  }, [selectedConversation?.history])

  const handleSend = () => {
    if (inputText.trim() && selectedContactId) {
      sendMessage(selectedContactId, inputText)
      setInputText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
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
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedContactId(msg.id)}
                  className={cn(
                    'flex gap-3 p-4 border-b cursor-pointer hover:bg-accent transition-colors',
                    msg.id === selectedContactId ? 'bg-accent/50' : '',
                  )}
                >
                  <Avatar>
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.contact.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm truncate">
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
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-trust-blue">
                      {msg.unread}
                    </Badge>
                  )}
                </div>
              ))}
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
                <span className="text-xs text-green-500 flex items-center gap-1">
                  ● Online
                </span>
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
                          <img key={i} src={att} className="rounded-md" />
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

          <div className="p-4 border-t bg-card rounded-b-lg">
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Digite sua mensagem..."
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
