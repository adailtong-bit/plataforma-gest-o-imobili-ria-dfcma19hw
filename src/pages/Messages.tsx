import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { messages } from '@/lib/mockData'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Send, Paperclip, Mic, Phone } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

export default function Messages() {
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
                  className={`flex gap-3 p-4 border-b cursor-pointer hover:bg-accent ${msg.id === 'msg1' ? 'bg-accent/50' : ''}`}
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
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-card rounded-t-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Maria Silva (Cleaner)</h3>
              <span className="text-xs text-green-500 flex items-center gap-1">
                ● Online
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 bg-slate-50">
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-trust-blue text-white p-3 rounded-l-lg rounded-tr-lg max-w-[70%] text-sm">
                Olá Maria, a Villa Sunshine já está liberada para limpeza?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white border p-3 rounded-r-lg rounded-tl-lg max-w-[70%] text-sm shadow-sm">
                Sim, cheguei aqui agora. Está um pouco bagunçado, vou precisar
                de mais tempo.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white border p-3 rounded-r-lg rounded-tl-lg max-w-[70%] text-sm shadow-sm">
                Terminei a limpeza na Villa Sunshine. Seguem as fotos.
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <img
                    src="https://img.usecurling.com/p/200/150?q=clean%20room"
                    className="rounded-md"
                  />
                  <img
                    src="https://img.usecurling.com/p/200/150?q=clean%20kitchen"
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card rounded-b-lg">
          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input placeholder="Digite sua mensagem..." className="flex-1" />
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5" />
            </Button>
            <Button size="icon" className="bg-trust-blue">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
