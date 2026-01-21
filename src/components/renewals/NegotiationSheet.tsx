import { useState, useEffect } from 'react'
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
import { NegotiationStatus } from '@/lib/types'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, MessageCircle, User } from 'lucide-react'

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
  const { toast } = useToast()

  const tenant = tenants.find((t) => t.id === tenantId)

  const [status, setStatus] = useState<NegotiationStatus>('negotiating')
  const [suggestedPrice, setSuggestedPrice] = useState<string>('')
  const [newLogNote, setNewLogNote] = useState('')

  useEffect(() => {
    if (tenant) {
      setStatus(tenant.negotiationStatus || 'negotiating')
      setSuggestedPrice(tenant.suggestedRenewalPrice?.toString() || '')
      setNewLogNote('')
    }
  }, [tenant, open])

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
        user: 'User',
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

  // Mock chat messages for demonstration of the unified environment
  const mockChat = [
    {
      id: 1,
      sender: 'Tenant',
      msg: 'Can we lower the rent?',
      time: '10:00 AM',
      role: 'tenant',
    },
    {
      id: 2,
      sender: 'Me (PM)',
      msg: 'I will ask the owner.',
      time: '10:05 AM',
      role: 'software_tenant',
    },
    {
      id: 3,
      sender: 'Owner',
      msg: 'No, market rate is higher.',
      time: '11:00 AM',
      role: 'property_owner',
    },
    {
      id: 4,
      sender: 'Me (PM)',
      msg: 'Understood.',
      time: '11:05 AM',
      role: 'software_tenant',
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Unified Negotiation Environment</SheetTitle>
          <SheetDescription>
            Manage communication with all parties in one place.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="flex gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Tenant</Label>
              <div className="font-medium">{tenant.name}</div>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">
                Current Rent
              </Label>
              <div className="font-medium">${tenant.rentValue}</div>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <BadgeStatus status={status} />
            </div>
          </div>

          <Tabs defaultValue="aggregated" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="aggregated" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="tenant" className="text-xs">
                Tenant
              </TabsTrigger>
              <TabsTrigger value="owner" className="text-xs">
                Owner
              </TabsTrigger>
              <TabsTrigger value="internal" className="text-xs">
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Aggregated View (Supervisor Only Concept) */}
            <TabsContent value="aggregated" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                <Lock className="h-4 w-4" />
                <span>Confidential: Visible only to Property Managers.</span>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-4 bg-background">
                {mockChat.map((msg) => (
                  <div key={msg.id} className="mb-4 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold flex items-center gap-1">
                        {msg.role === 'tenant' && (
                          <User className="h-3 w-3 text-blue-500" />
                        )}
                        {msg.role === 'property_owner' && (
                          <User className="h-3 w-3 text-green-500" />
                        )}
                        {msg.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.time}
                      </span>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        msg.role === 'software_tenant'
                          ? 'bg-blue-100 ml-8'
                          : 'bg-gray-100 mr-8'
                      }`}
                    >
                      {msg.msg}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            {/* Tenant Chat */}
            <TabsContent value="tenant" className="mt-4 space-y-4">
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {mockChat
                  .filter(
                    (m) => m.role === 'tenant' || m.role === 'software_tenant',
                  )
                  .map((msg) => (
                    <div key={msg.id} className="mb-4 text-sm">
                      <div className="font-bold mb-1">{msg.sender}</div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {msg.msg}
                      </div>
                    </div>
                  ))}
              </ScrollArea>
              <div className="flex gap-2">
                <Input placeholder="Message to tenant..." />
                <Button size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Owner Chat */}
            <TabsContent value="owner" className="mt-4 space-y-4">
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {mockChat
                  .filter(
                    (m) =>
                      m.role === 'property_owner' ||
                      m.role === 'software_tenant',
                  )
                  .map((msg) => (
                    <div key={msg.id} className="mb-4 text-sm">
                      <div className="font-bold mb-1">{msg.sender}</div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {msg.msg}
                      </div>
                    </div>
                  ))}
              </ScrollArea>
              <div className="flex gap-2">
                <Input placeholder="Message to owner..." />
                <Button size="icon">
                  <MessageCircle className="h-4 w-4" />
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
  }
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}
