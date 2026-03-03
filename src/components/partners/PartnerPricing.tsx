import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Partner, ServiceRate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { CurrencyInput } from '@/components/ui/currency-input'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

export function PartnerPricing({
  partner,
  onUpdate,
  canEdit,
}: {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}) {
  const { toast } = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceRate | null>(null)
  const [form, setForm] = useState<{
    name: string
    description: string
    partnerValue: number
    pmValue: number
  }>({
    name: '',
    description: '',
    partnerValue: 0,
    pmValue: 0,
  })

  const services = partner.serviceRates || []

  const handleAddService = () => {
    if (!form.name) return

    const newService: ServiceRate = {
      id: `srv-${Date.now()}`,
      serviceName: form.name,
      description: form.description,
      partnerPayment: form.partnerValue,
      pmValue: form.pmValue,
      servicePrice: form.partnerValue + form.pmValue,
      productPrice: 0,
      validFrom: new Date().toISOString(),
      type: 'specific',
    }

    onUpdate({
      ...partner,
      serviceRates: [...services, newService],
    })

    setIsAddOpen(false)
    setForm({ name: '', description: '', partnerValue: 0, pmValue: 0 })
    toast({ title: 'Success', description: 'Activity added.' })
  }

  const handleEditService = () => {
    if (!editingService || !form.name) return

    const updatedServices = services.map((s) => {
      if (s.id === editingService.id) {
        return {
          ...s,
          serviceName: form.name,
          description: form.description,
          partnerPayment: form.partnerValue,
          pmValue: form.pmValue,
          servicePrice: form.partnerValue + form.pmValue,
        }
      }
      return s
    })

    onUpdate({
      ...partner,
      serviceRates: updatedServices,
    })

    setIsAddOpen(false)
    setEditingService(null)
    toast({ title: 'Success', description: 'Activity updated.' })
  }

  const handleDeleteService = (id: string) => {
    onUpdate({
      ...partner,
      serviceRates: services.filter((s) => s.id !== id),
    })
    toast({ title: 'Success', description: 'Activity removed.' })
  }

  const openEdit = (service: ServiceRate) => {
    setEditingService(service)
    setForm({
      name: service.serviceName,
      description: service.description || '',
      partnerValue: service.partnerPayment,
      pmValue: service.pmValue,
    })
    setIsAddOpen(true)
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div>
          <CardTitle>Activities & Pricing</CardTitle>
          <CardDescription>
            Register specific activities and their associated costs.
          </CardDescription>
        </div>
        {canEdit && (
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingService(null)
                setForm({
                  name: '',
                  description: '',
                  partnerValue: 0,
                  pmValue: 0,
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue text-white gap-2">
                <Plus className="h-4 w-4" /> Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Edit Activity' : 'Add Activity'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>
                    Activity Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., General Cleaning, AC Repair"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description of the activity"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Partner Cost (Payout)</Label>
                    <CurrencyInput
                      value={form.partnerValue}
                      onChange={(v) => setForm({ ...form, partnerValue: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PM Markup/Fee</Label>
                    <CurrencyInput
                      value={form.pmValue}
                      onChange={(v) => setForm({ ...form, pmValue: v })}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-slate-700">
                    Total Charged to Owner/Guest:{' '}
                    {formatCurrency(form.partnerValue + form.pmValue)}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={
                    editingService ? handleEditService : handleAddService
                  }
                  className="bg-trust-blue text-white"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Partner Cost</TableHead>
              <TableHead className="text-right">PM Markup</TableHead>
              <TableHead className="text-right">Total Price</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  {service.serviceName}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {service.description || '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-amber-600">
                  {formatCurrency(service.partnerPayment)}
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(service.pmValue)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(service.servicePrice)}
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No activities registered for this partner.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
