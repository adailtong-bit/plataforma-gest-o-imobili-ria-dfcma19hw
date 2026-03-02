import { useState, useEffect, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useMessageStore from '@/stores/useMessageStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, User, Building, Users, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { CloseNegotiationDialog } from './CloseNegotiationDialog'
import { OwnerNegotiationTab } from './OwnerNegotiationTab'
import { TenantNegotiationTab } from './TenantNegotiationTab'
import { format, parseISO, isValid } from 'date-fns'

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
  const {
    tenants,
    updateTenant,
    updateTenantNegotiation,
    renewTenantContract,
  } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { messages, sendMessage, startChat } = useMessageStore()
  const { currentUser } = useAuthStore()
  const { toast } = useToast()

  const tenant = tenants.find((t) => t.id === tenantId)
  const property = tenant
    ? properties.find((p) => p.id === tenant.propertyId)
    : null
  const owner = property ? owners.find((o) => o.id === property.ownerId) : null

  const [newLogNote, setNewLogNote] = useState('')
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  useEffect(() => {
    if (open && tenant) {
      startChat(tenant.id)
      if (owner) startChat(owner.id)
    }
  }, [open, tenant, owner, startChat])

  const tenantMessages = useMemo(
    () => messages.find((m) => m.contactId === tenant?.id),
    [messages, tenant?.id],
  )
  const ownerMessages = useMemo(
    () => messages.find((m) => m.contactId === owner?.id),
    [messages, owner?.id],
  )

  const aggregatedHistory = useMemo(() => {
    if (!tenant && !owner) return []
    const tHistory =
      tenantMessages?.history.map((msg) => ({
        ...msg,
        role: msg.senderId === 'me' ? 'manager' : 'tenant',
        senderName: msg.senderId === 'me' ? 'Me' : tenant?.name || 'Tenant',
        origin: 'tenant_chat',
      })) || []
    const oHistory =
      ownerMessages?.history.map((msg) => ({
        ...msg,
        role: msg.senderId === 'me' ? 'manager' : 'owner',
        senderName: msg.senderId === 'me' ? 'Me' : owner?.name || 'Owner',
        origin: 'owner_chat',
      })) || []
    return [...tHistory, ...oHistory].sort(
      (a, b) =>
        (isValid(parseISO(a.timestamp)) ? parseISO(a.timestamp).getTime() : 0) -
        (isValid(parseISO(b.timestamp)) ? parseISO(b.timestamp).getTime() : 0),
    )
  }, [tenantMessages, ownerMessages, tenant, owner])

  if (!tenant) return null

  const handleSaveNotes = () => {
    if (newLogNote.trim()) {
      const log = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        action: 'Note',
        note: newLogNote,
        user: currentUser.name,
      }
      updateTenantNegotiation(tenant.id, { log })
      setNewLogNote('')
      toast({ title: 'Note added' })
    }
  }

  const initiateClose = () => {
    if (
      tenant.ownerDecision !== 'accepted' ||
      tenant.tenantDecision !== 'accepted'
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Both Owner and Tenant must accept the terms before closing.',
        variant: 'destructive',
      })
      return
    }
    setCloseDialogOpen(true)
  }

  const handleCloseConfirm = (data: any) => {
    renewTenantContract(tenant.id, data.newEnd, data.newValue, data.newStart, {
      id: `doc-${Date.now()}`,
      name: 'Renewal_Contract.pdf',
      url: data.contractUrl,
      date: new Date().toISOString(),
      category: 'Contract',
      linkedEntityId: tenant.id,
    })
    toast({
      title: 'Renewal Finalized',
      description: 'Contract renewed successfully.',
    })
    setCloseDialogOpen(false)
    onOpenChange(false)
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
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto pb-24">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Negotiation Hub
            </SheetTitle>
            <SheetDescription>
              Manage multi-party lease renewals efficiently.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Tenant
                </Label>
                <div className="font-medium text-sm truncate flex items-center gap-2">
                  {tenant.name}
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Owner
                </Label>
                <div className="font-medium text-sm truncate flex items-center gap-2">
                  {owner?.name || 'N/A'}
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" /> Property
                </Label>
                <div className="font-medium text-sm truncate">
                  {property?.name}
                </div>
              </div>
            </div>

            <Tabs defaultValue="owner" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="owner" className="text-xs">
                  Owner
                </TabsTrigger>
                <TabsTrigger value="tenant" className="text-xs">
                  Tenant
                </TabsTrigger>
                <TabsTrigger value="aggregated" className="text-xs">
                  Unified
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs">
                  Docs
                </TabsTrigger>
                <TabsTrigger value="internal" className="text-xs">
                  Notes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="owner">
                <OwnerNegotiationTab
                  tenant={tenant}
                  owner={owner}
                  history={ownerMessages?.history || []}
                  onSend={(text) => owner && sendMessage(owner.id, text)}
                  onUpdateTenant={(data) =>
                    updateTenant({ ...tenant, ...data })
                  }
                />
              </TabsContent>
              <TabsContent value="tenant">
                <TenantNegotiationTab
                  tenant={tenant}
                  history={tenantMessages?.history || []}
                  onSend={(text) => sendMessage(tenant.id, text)}
                  onUpdateTenant={(data) =>
                    updateTenant({ ...tenant, ...data })
                  }
                />
              </TabsContent>
              <TabsContent value="aggregated" className="mt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                  <Lock className="h-4 w-4" />
                  <span>Confidential: Visible only to Property Managers.</span>
                </div>
                <ScrollArea className="h-[300px] border rounded-md p-4 bg-slate-50">
                  {aggregatedHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm pt-8">
                      No messages yet.
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
                              <ShieldCheck className="h-3 w-3 text-purple-500" />
                            )}
                            {msg.senderName}
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
              <TabsContent value="documents" className="mt-4">
                <DocumentVault
                  documents={tenant.documents || []}
                  onUpdate={(docs) =>
                    updateTenant({ ...tenant, documents: docs })
                  }
                  canEdit={true}
                  title="Lease Documents"
                />
              </TabsContent>
              <TabsContent value="internal" className="mt-4 space-y-4">
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  {tenant.negotiationLogs?.map((log) => (
                    <div
                      key={log.id}
                      className="text-sm flex flex-col gap-1 bg-muted/30 p-2 rounded mb-2"
                    >
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">{log.user}</span>
                        <span>{formatTime(log.date)}</span>
                      </div>
                      <p>{log.note}</p>
                    </div>
                  ))}
                </ScrollArea>
                <div className="gap-2 flex flex-col">
                  <Label>Add Internal Note</Label>
                  <Textarea
                    value={newLogNote}
                    onChange={(e) => setNewLogNote(e.target.value)}
                  />
                  <Button size="sm" onClick={handleSaveNotes} className="w-fit">
                    Save Note
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t flex justify-between gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                updateTenant({ ...tenant, negotiationStatus: 'vacating' })
              }
            >
              Mark as Vacating
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={initiateClose}
            >
              Close Negotiation
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <CloseNegotiationDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onConfirm={handleCloseConfirm}
        currentValue={tenant.suggestedRenewalPrice || tenant.rentValue}
      />
    </>
  )
}
