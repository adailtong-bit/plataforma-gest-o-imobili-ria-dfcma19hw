import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import useTenantStore from '@/stores/useTenantStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

export function NegotiationSheet({
  open,
  onOpenChange,
  tenantId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string | null
}) {
  const { tenants, updateTenantNegotiation } = useTenantStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const tenant = tenants.find((t) => t.id === tenantId)
  const [status, setStatus] = useState<any>('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (tenant) {
      setStatus(tenant.negotiationStatus || 'negotiating')
      setPrice(tenant.suggestedRenewalPrice?.toString() || '')
      setNote('')
    }
  }, [tenant, open])

  const handleSave = () => {
    if (!tenantId) return
    updateTenantNegotiation(tenantId, {
      status,
      suggestedPrice: price ? Number(price) : undefined,
      log: note
        ? {
            id: `log-${Date.now()}`,
            date: new Date().toISOString(),
            action: 'Note added',
            note,
            user: 'Admin',
          }
        : undefined,
    })
    toast({ title: 'Updated Successfully' })
    onOpenChange(false)
  }

  if (!tenant) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Manage Renewal</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="font-semibold">{tenant.name}</p>
            <p className="text-sm text-slate-500">
              Current Rent: ${tenant.rentValue}
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
                  <SelectItem value="closed">Closed / Renewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Suggested Price</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Add Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Internal negotiation note..."
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>

          {tenant.negotiationLogs && tenant.negotiationLogs.length > 0 && (
            <div className="mt-8 space-y-4">
              <h4 className="font-semibold text-sm">History</h4>
              <div className="space-y-3">
                {tenant.negotiationLogs.map((log) => (
                  <div
                    key={log.id}
                    className="text-sm border-l-2 border-blue-500 pl-3"
                  >
                    <p className="text-xs text-slate-500">
                      {new Date(log.date).toLocaleDateString()} - {log.user}
                    </p>
                    <p className="mt-1">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
