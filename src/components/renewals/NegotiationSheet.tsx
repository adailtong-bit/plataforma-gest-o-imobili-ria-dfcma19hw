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
import useLanguageStore from '@/stores/useLanguageStore'
import { NegotiationStatus } from '@/lib/types'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

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
  const { t } = useLanguageStore()
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
        user: 'User', // In a real app, this would be current user name
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

  const handleAddLog = () => {
    if (!newLogNote.trim()) return
    const log = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action: 'Note',
      note: newLogNote,
      user: 'User',
    }
    updateTenantNegotiation(tenant.id, { log })
    setNewLogNote('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Negociação: {tenant.name}</SheetTitle>
          <SheetDescription>
            Gerencie o processo de renovação e histórico.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label>Status da Negociação</Label>
            <Select
              value={status}
              onValueChange={(v: NegotiationStatus) => setStatus(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negotiating">Em negociação</SelectItem>
                <SelectItem value="owner_contacted">
                  Proprietário contatado
                </SelectItem>
                <SelectItem value="tenant_contacted">
                  Inquilino contatado
                </SelectItem>
                <SelectItem value="vacating">
                  Inquilino vai desocupar
                </SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Preço Sugerido de Renovação ($)</Label>
            <Input
              type="number"
              value={suggestedPrice}
              onChange={(e) => setSuggestedPrice(e.target.value)}
              placeholder="Ex: 2500.00"
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label>Histórico de Negociação</Label>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {tenant.negotiationLogs?.length ? (
                <div className="flex flex-col gap-4">
                  {tenant.negotiationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="text-sm flex flex-col gap-1 bg-muted/30 p-2 rounded"
                    >
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">{log.user}</span>
                        <span>
                          {format(new Date(log.date), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p>{log.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum registro.
                </p>
              )}
            </ScrollArea>
          </div>

          <div className="grid gap-2">
            <Label>Adicionar Nota</Label>
            <div className="flex flex-col gap-2">
              <Textarea
                value={newLogNote}
                onChange={(e) => setNewLogNote(e.target.value)}
                placeholder="Descreva a interação..."
                className="min-h-[80px]"
              />
              <Button
                variant="secondary"
                onClick={handleAddLog}
                disabled={!newLogNote.trim()}
                size="sm"
                className="w-full"
              >
                Adicionar ao Histórico
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue">
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
