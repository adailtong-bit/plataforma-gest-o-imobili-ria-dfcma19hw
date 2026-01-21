import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useMessageStore from '@/stores/useMessageStore'
import useAuthStore from '@/stores/useAuthStore'
import { NegotiationStatus } from '@/lib/types'
import { format, parseISO, isValid } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, MessageCircle, User, Building, Users, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NegotiationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string | null
}

export function NegotiationSheet({
  open,
  onOpenChange,
  tenantId,
}: NegotiationSheetProps) {
  const { tenants, updateTenantNegotiation } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { messages, sendMessage, startChat } = useMessageStore()
  const { currentUser } = useAuthStore()
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  const tenant = tenants.find((t) => t.id === tenantId)
  const property = tenant
    ? properties.find((p) => p.id === tenant.propertyId)
    : null
  const owner = property ? owners.find((o) => o.id === property.ownerId) : null

  const [status, setStatus] = useState<NegotiationStatus>('negotiating')
  const [suggestedPrice, setSuggestedPrice] = useState<string>('')
  const [newLogNote, setNewLogNote] = useState('')
  const [inputText, setInputText] = useState('')

  // Auto-Initialize Chats when sheet opens
  useEffect(() => {
    if (open && tenant) {
      startChat(tenant.id)
      if (owner) {
        startChat(owner.id)
      }
    }
  }, [open, tenant, owner, startChat])

  useEffect(() => {
    if (tenant) {
      setStatus(tenant.negotiationStatus || 'negotiating')
      setSuggestedPrice(tenant.suggestedRenewalPrice?.toString() || '')
      setNewLogNote('')
    }
  }, [tenant, open])

  // Get Messages
  const tenantMessages = useMemo(
    () => messages.find((m) => m.contactId === tenant?.id),
    [messages, tenant?.id],
  )

  const ownerMessages = useMemo(
    () => messages.find((m) => m.contactId === owner?.id),
    [messages, owner?.id],
  )

  // Aggregate Messages
  const aggregatedHistory = useMemo(() => {
    if (!tenant && !owner) return []

    const tHistory =
      tenantMessages?.history.map((msg) => ({
        ...msg,
        role: msg.sender === 'me' ? 'manager' : 'tenant',
        senderName: msg.sender === 'me' ? 'Me' : tenant?.name || 'Tenant',
        origin: 'tenant_chat',
      })) || []

    const oHistory =
      ownerMessages?.history.map((msg) => ({
        ...msg,
        role: msg.sender === 'me' ? 'manager' : 'owner',
        senderName: msg.sender === 'me' ? 'Me' : owner?.name || 'Owner',
        origin: 'owner_chat',
      })) || []

    const combined = [...tHistory, ...oHistory]

    return combined.sort((a, b) => {
      const da = isValid(parseISO(a.timestamp))
        ? parseISO(a.timestamp).getTime()
        : 0
      const db = isValid(parseISO(b.timestamp))
        ? parseISO(b.timestamp).getTime()
        : 0
      return da - db
    })
  }, [tenantMessages, ownerMessages, tenant, owner])

  if (!tenant) return null

  const handleSave = () => {
    updateTenantNegotiation(tenant.id, {
      status,
      suggestedPrice: suggestedPrice ? parseFloat(suggestedPrice) : undefined,
    })

    if (newLogNote.trim()) {
      const log = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        action: 'Update',
        note: newLogNote,
        user: currentUser.name,
      }
      updateTenantNegotiation(tenant.id, { log })
      setNewLogNote('')
    }

    toast({
      title: 'Atualizado',
      description: 'Dados da negociação salvos com sucesso.',
    })
    onOpenChange(false)
  }

  const handleSend = (target: 'tenant' | 'owner') => {
    if (!inputText.trim()) return

    if (target === 'tenant' && tenant) {
      sendMessage(tenant.id, inputText)
    } else if (target === 'owner' && owner) {
      sendMessage(owner.id, inputText)
    }
    setInputText('')
  }

  const formatTime = (iso: string) => {
    try {
      if (!iso) return ''
      const date = parseISO(iso)
      if (isValid(date)) return format(date, 'dd/MM HH:mm')
      return iso
    } catch {
      return iso
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Unified Negotiation Environment
          </SheetTitle>
          <SheetDescription>
            Manage communication between Tenant, Owner, and PM in one place.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Tenant
              </Label>
              <div
                className="font-medium text-sm truncate flex items-center gap-2"
                title={tenant.name}
              >
                {tenant.name}
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Owner
              </Label>
              <div
                className="font-medium text-sm truncate flex items-center gap-2"
                title={owner?.name}
              >
                {owner?.name || 'Unknown'}
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" /> Property
              </Label>
              <div
                className="font-medium text-sm truncate"
                title={property?.name}
              >
                {property?.name}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <BadgeStatus status={status} />
            </div>
          </div>

          <Tabs defaultValue="aggregated" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="aggregated" className="text-xs">
                Unified View
              </TabsTrigger>
              <TabsTrigger value="tenant" className="text-xs">
                Tenant Chat
              </TabsTrigger>
              <TabsTrigger value="owner" className="text-xs">
                Owner Chat
              </TabsTrigger>
              <TabsTrigger value="internal" className="text-xs">
                Internal
              </TabsTrigger>
            </TabsList>

            {/* Aggregated View */}
            <TabsContent value="aggregated" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                <Lock className="h-4 w-4" />
                <span>Confidential: Visible only to Property Managers.</span>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-4 bg-slate-50">
                {aggregatedHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm pt-8">
                    No messages yet. Start a conversation in the tabs above.
                  </div>
                ) : (
                  aggregatedHistory.map((msg, idx) => (
                    <div key={`${msg.id}-${idx}`} className="mb-4 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold flex items-center gap-1 text-xs">
                          {msg.role === 'tenant' && (
                            <User className="h-3 w-3 text-blue-500" />
                          )}
                          {msg.role === 'owner' && (
                            <User className="h-3 w-3 text-green-500" />
                          )}
                          {msg.role === 'manager' && (
                            <User className="h-3 w-3 text-purple-500" />
                          )}
                          {msg.senderName}
                          {msg.role === 'manager' && (
                            <span className="text-[10px] font-normal text-muted-foreground ml-1">
                              (to{' '}
                              {msg.origin === 'tenant_chat'
                                ? 'Tenant'
                                : 'Owner'}
                              )
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'p-2 rounded-lg border text-sm',
                          msg.role === 'manager' &&
                            'bg-purple-50 border-purple-100 ml-8',
                          msg.role === 'tenant' &&
                            'bg-blue-50 border-blue-100 mr-8',
                          msg.role === 'owner' &&
                            'bg-green-50 border-green-100 mr-8',
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            {/* Tenant Chat */}
            <TabsContent value="tenant" className="mt-4 space-y-4">
              <ScrollArea className="h-[300px] border rounded-md p-4 bg-white">
                <div className="flex flex-col gap-4">
                  {tenantMessages?.history.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-col max-w-[85%]',
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
                            : 'bg-gray-100 border rounded-bl-none',
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Message to tenant..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && handleSend('tenant')
                  }
                />
                <Button size="icon" onClick={() => handleSend('tenant')}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Owner Chat */}
            <TabsContent value="owner" className="mt-4 space-y-4">
              <ScrollArea className="h-[300px] border rounded-md p-4 bg-white">
                <div className="flex flex-col gap-4">
                  {ownerMessages?.history.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-col max-w-[85%]',
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
                            : 'bg-gray-100 border rounded-bl-none',
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Message to owner..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && handleSend('owner')
                  }
                />
                <Button size="icon" onClick={() => handleSend('owner')}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Internal Notes */}
            <TabsContent value="internal" className="mt-4 space-y-4">
              <ScrollArea className="h-[200px] border rounded-md p-4">
                {tenant.negotiationLogs?.length ? (
                  tenant.negotiationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="text-sm flex flex-col gap-1 bg-muted/30 p-2 rounded mb-2"
                    >
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">{log.user}</span>
                        <span>
                          {format(new Date(log.date), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p>{log.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No notes.
                  </p>
                )}
              </ScrollArea>
              <div className="gap-2 flex flex-col">
                <Label>Internal Note</Label>
                <Textarea
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  placeholder="Private internal note..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Update Status</Label>
              <Select
                value={status}
                onValueChange={(v: NegotiationStatus) => setStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="owner_contacted">
                    Owner Contacted
                  </SelectItem>
                  <SelectItem value="tenant_contacted">
                    Tenant Contacted
                  </SelectItem>
                  <SelectItem value="vacating">Vacating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Suggested Price</Label>
              <Input
                type="number"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue">
            Save Updates
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function BadgeStatus({ status }: { status: string }) {
  const colors: Record<string, string> = {
    negotiating: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-green-100 text-green-800',
    vacating: 'bg-red-100 text-red-800',
    owner_contacted: 'bg-blue-100 text-blue-800',
    tenant_contacted: 'bg-purple-100 text-purple-800',
  }
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}
