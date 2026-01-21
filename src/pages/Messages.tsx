import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Send, User, Paperclip, MessageCircle } from 'lucide-react'
import useMessageStore from '@/stores/useMessageStore'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { useLocation } from 'react-router-dom'
import useLanguageStore from '@/stores/useLanguageStore'
import { format, parseISO, isValid } from 'date-fns'

export default function Messages() {
  const { messages, sendMessage, markAsRead } = useMessageStore()
  const { currentUser } = useAuthStore()
  const location = useLocation()
  const { t } = useLanguageStore()
  const searchParams = new URLSearchParams(location.search)
  const initialContactId = searchParams.get('contactId')

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

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('messages.title')}
        </h1>
        <p className="text-muted-foreground">{t('messages.subtitle')}</p>
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
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
