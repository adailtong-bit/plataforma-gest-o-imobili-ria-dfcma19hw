import { useState, useContext, useMemo, useRef, useEffect } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Send, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { canChat } from '@/lib/permissions'
import { User } from '@/lib/types'

export default function Messages() {
  const { messages, sendMessage, startChat, currentUser, allUsers } =
    useContext(AppContext)!
  const { t } = useLanguageStore()
  const [activeThread, setActiveThread] = useState(messages[0]?.id)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredMessages = messages.filter((m) =>
    m.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeChat = useMemo(
    () => messages.find((m) => m.id === activeThread),
    [messages, activeThread],
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.history])

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return
    sendMessage(activeChat.contactId, newMessage)
    setNewMessage('')
  }

  const availableContacts = allUsers.filter(
    (u) => u.id !== currentUser?.id && canChat(currentUser as User, u as User),
  )

  const handleStartChat = (contact: User) => {
    const existing = messages.find((m) => m.contactId === contact.id)
    if (existing) {
      setActiveThread(existing.id)
    } else {
      startChat(contact.id)
      setTimeout(() => {
        const newThread = messages.find((m) => m.contactId === contact.id)
        if (newThread) setActiveThread(newThread.id)
      }, 100)
    }
    setIsNewChatOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)] min-h-0">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.messages')}
        </h1>
        <p className="text-muted-foreground">
          Communicate with tenants, owners, and partners.
        </p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <Card className="w-80 flex-col hidden md:flex border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="p-4 border-b border-slate-100 bg-white shrink-0">
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full mb-3 bg-trust-blue text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                  {availableContacts.map((c) => (
                    <Button
                      key={c.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleStartChat(c as User)}
                    >
                      {c.name} ({c.role.replace('_', ' ')})
                    </Button>
                  ))}
                  {availableContacts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No available contacts.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 custom-scrollbar">
            {filteredMessages.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveThread(m.id)}
                className={`w-full flex items-start gap-3 p-4 text-left border-b border-slate-100 transition-colors hover:bg-slate-50 ${activeThread === m.id ? 'bg-slate-50' : ''}`}
              >
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback className="bg-slate-100 text-black">
                    {m.contact.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm truncate text-slate-900">
                      <DataMask>{m.contact}</DataMask>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {format(new Date(m.time), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    <DataMask>{m.lastMessage}</DataMask>
                  </p>
                </div>
              </button>
            ))}
            {filteredMessages.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations found.
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="flex-1 flex flex-col border-slate-200 overflow-hidden shadow-sm bg-slate-50/30">
          {activeChat ? (
            <>
              <CardHeader className="border-b py-4 px-6 bg-white shrink-0 shadow-sm z-10">
                <CardTitle className="text-lg flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activeChat.avatar} />
                    <AvatarFallback>
                      {activeChat.contact.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <DataMask>{activeChat.contact}</DataMask>
                </CardTitle>
              </CardHeader>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar"
              >
                {activeChat.history.map((h) => {
                  const isMe = h.senderId === currentUser?.id
                  return (
                    <div
                      key={h.id}
                      className={`flex max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm font-medium leading-relaxed">
                          <DataMask>{h.text}</DataMask>
                        </p>
                        <span
                          className={`text-[10px] block mt-1.5 font-medium ${
                            isMe ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          {format(new Date(h.timestamp), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium bg-white">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
