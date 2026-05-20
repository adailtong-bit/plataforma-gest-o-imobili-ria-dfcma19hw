import { useState } from 'react'
import { BillingAgreement, BillingPeriod, UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, CheckCircle, Lock, Calendar } from 'lucide-react'
import useBillingStore from '@/stores/useBillingStore'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BillingManager({
  targetId,
  targetRole,
}: {
  targetId: string
  targetRole: UserRole
}) {
  const {
    agreements,
    periods,
    addAgreement,
    updateAgreement,
    deleteAgreement,
    updatePeriod,
  } = useBillingStore()
  const { toast } = useToast()

  const targetAgreements = agreements.filter((a) => a.targetId === targetId)
  const targetPeriods = periods.filter((p) => p.targetId === targetId)

  const [isAgreementOpen, setIsAgreementOpen] = useState(false)
  const [editingAgreement, setEditingAgreement] =
    useState<BillingAgreement | null>(null)

  const [agreementForm, setAgreementForm] = useState<Partial<BillingAgreement>>(
    {
      name: '',
      type: 'fixed_admin_fee',
      valueType: 'fixed',
      value: 0,
      frequency: 'monthly',
      validFrom: new Date().toISOString().split('T')[0],
      status: 'active',
    },
  )

  const handleSaveAgreement = () => {
    if (!agreementForm.name || agreementForm.value === undefined) {
      toast({
        title: 'Validation Error',
        description: 'Name and Value are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingAgreement) {
      updateAgreement({
        ...editingAgreement,
        ...agreementForm,
      } as BillingAgreement)
      toast({ title: 'Agreement Updated' })
    } else {
      addAgreement({
        ...agreementForm,
        id: `ba-${Date.now()}`,
        targetId,
        targetRole,
        sourceRole:
          targetRole === 'property_owner'
            ? 'software_tenant'
            : targetRole === 'software_tenant'
              ? 'master'
              : 'software_tenant',
      } as BillingAgreement)
      toast({ title: 'Agreement Created' })
    }
    setIsAgreementOpen(false)
  }

  const openNewAgreement = () => {
    setEditingAgreement(null)
    setAgreementForm({
      name: '',
      type: 'fixed_admin_fee',
      valueType: 'fixed',
      value: 0,
      frequency: 'monthly',
      validFrom: new Date().toISOString().split('T')[0],
      status: 'active',
    })
    setIsAgreementOpen(true)
  }

  const handleClosePeriod = (period: BillingPeriod) => {
    updatePeriod({ ...period, status: 'closed' })
    toast({
      title: 'Period Closed',
      description: 'Invoices can now be generated securely.',
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="agreements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agreements">Service Agreements</TabsTrigger>
          <TabsTrigger value="periods">Billing Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="agreements" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Agreements</h3>
            <Button
              onClick={openNewAgreement}
              size="sm"
              className="bg-trust-blue text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Rule
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targetAgreements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {a.type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.valueType === 'fixed' ? `$${a.value}` : `${a.value}%`}
                    </TableCell>
                    <TableCell className="capitalize">
                      {a.frequency.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(a.validFrom), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          a.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAgreement(a)
                          setAgreementForm(a)
                          setIsAgreementOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAgreement(a.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {targetAgreements.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No agreements defined for this player.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="periods" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Periods</h3>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" /> Generate New Period
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targetPeriods.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      Period {p.id.split('-')[1]}
                    </TableCell>
                    <TableCell>
                      {format(new Date(p.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(p.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${p.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === 'open'
                            ? 'default'
                            : p.status === 'closed'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={
                          p.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === 'open' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClosePeriod(p)}
                          className="text-amber-600"
                        >
                          <Lock className="h-4 w-4 mr-2" /> Close
                        </Button>
                      )}
                      {p.status === 'closed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Invoice
                          Generated
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {targetPeriods.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No billing periods found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAgreementOpen} onOpenChange={setIsAgreementOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAgreement ? 'Edit Agreement Rule' : 'New Agreement Rule'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={agreementForm.name || ''}
                onChange={(e) =>
                  setAgreementForm({ ...agreementForm, name: e.target.value })
                }
                placeholder="e.g. Monthly Admin Fee"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={agreementForm.type}
                  onValueChange={(v: BillingAgreement['type']) =>
                    setAgreementForm({ ...agreementForm, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_admin_fee">
                      Fixed Admin Fee
                    </SelectItem>
                    <SelectItem value="booking_percentage">
                      Booking Percentage
                    </SelectItem>
                    <SelectItem value="markup_maintenance">
                      Maintenance Markup
                    </SelectItem>
                    <SelectItem value="markup_cleaning">
                      Cleaning Markup
                    </SelectItem>
                    <SelectItem value="markup_purchases">
                      Purchases Markup
                    </SelectItem>
                    <SelectItem value="software_fee_per_house">
                      Software Fee (Per House)
                    </SelectItem>
                    <SelectItem value="partner_cleaning_fee">
                      Partner Cleaning Fee
                    </SelectItem>
                    <SelectItem value="partner_maintenance_fee">
                      Partner Maintenance Fee
                    </SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value Type</Label>
                <Select
                  value={agreementForm.valueType}
                  onValueChange={(v: 'fixed' | 'percentage') =>
                    setAgreementForm({ ...agreementForm, valueType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Value{' '}
                  {agreementForm.valueType === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  type="number"
                  value={agreementForm.value || ''}
                  onChange={(e) =>
                    setAgreementForm({
                      ...agreementForm,
                      value: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={agreementForm.frequency}
                  onValueChange={(v: BillingAgreement['frequency']) =>
                    setAgreementForm({ ...agreementForm, frequency: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="per_booking">Per Booking</SelectItem>
                    <SelectItem value="per_task">Per Task</SelectItem>
                    <SelectItem value="per_item">Per Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={agreementForm.validFrom || ''}
                  onChange={(e) =>
                    setAgreementForm({
                      ...agreementForm,
                      validFrom: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={agreementForm.status}
                  onValueChange={(v: 'active' | 'historical') =>
                    setAgreementForm({ ...agreementForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAgreementOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAgreement}
              className="bg-trust-blue text-white"
            >
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
