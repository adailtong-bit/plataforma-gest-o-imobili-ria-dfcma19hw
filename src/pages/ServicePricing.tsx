import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MoreHorizontal, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useBillingStore from '@/stores/useBillingStore'
import useAuthStore from '@/stores/useAuthStore'
import { BillingAgreement } from '@/lib/types'

export default function ServicePricing() {
  const { agreements, addAgreement, updateAgreement, deleteAgreement } =
    useBillingStore()
  const { allUsers } = useAuthStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<BillingAgreement | null>(
    null,
  )

  const defaultForm: Partial<BillingAgreement> = {
    name: '',
    targetId: 'global',
    targetRole: 'all',
    type: 'booking_percentage',
    valueType: 'percentage',
    value: 0,
    frequency: 'per_booking',
    validFrom: new Date().toISOString().split('T')[0],
    status: 'active',
  }

  const [form, setForm] = useState<Partial<BillingAgreement>>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredRates = agreements.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.name) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord) {
      updateAgreement({ ...editingRecord, ...form } as BillingAgreement)
      toast({
        title: 'Success',
        description: 'Agreement updated successfully.',
      })
    } else {
      addAgreement({
        id: `ba-${Date.now()}`,
        name: form.name,
        targetId: form.targetId || 'global',
        targetRole: form.targetRole || 'all',
        type: form.type || 'fixed_admin_fee',
        valueType: form.valueType || 'fixed',
        value: Number(form.value) || 0,
        frequency: form.frequency || 'monthly',
        validFrom: form.validFrom || new Date().toISOString().split('T')[0],
        status: form.status || 'active',
      } as BillingAgreement)
      toast({
        title: 'Success',
        description: 'Agreement created successfully.',
      })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm(defaultForm)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteAgreement(deleteId)
      toast({
        title: 'Success',
        description: 'Agreement deleted successfully.',
      })
      setDeleteId(null)
    }
  }

  const getTargetName = (id: string) => {
    if (id === 'global') return 'Global (All Users)'
    const u = allUsers.find((user) => user.id === id)
    return u ? `${u.name} (${u.role})` : id
  }

  const formatValue = (val: number, type: string) => {
    return type === 'percentage' ? `${val}%` : `$${val.toFixed(2)}`
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Billing Rules & Agreements
          </h1>
          <p className="text-muted-foreground">
            Configure the logic for automated calculation of management fees,
            revenue shares, and markups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm(defaultForm)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white hover:bg-blue-700">
                <Settings className="h-4 w-4" /> New Billing Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? 'Edit Billing Rule' : 'New Billing Rule'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input
                      placeholder="e.g. Monthly Admin Fee"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Player (Owner/PM)</Label>
                    <Select
                      value={form.targetId}
                      onValueChange={(val: any) => {
                        const user = allUsers.find((u) => u.id === val)
                        setForm({
                          ...form,
                          targetId: val,
                          targetRole: user ? user.role : 'all',
                        })
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select target..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">
                          Global (All Users)
                        </SelectItem>
                        {allUsers
                          .filter((u) => u.role !== 'tenant')
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
                  <div className="space-y-2 col-span-2">
                    <Label>Calculation Source (Rule Type)</Label>
                    <Select
                      value={form.type}
                      onValueChange={(val: any) =>
                        setForm({ ...form, type: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking_percentage">
                          Booking Revenue Share (from Bookings)
                        </SelectItem>
                        <SelectItem value="fixed_admin_fee">
                          Fixed Administrative Fee (Flat Rate)
                        </SelectItem>
                        <SelectItem value="maintenance_markup">
                          Maintenance Markup (from Tasks)
                        </SelectItem>
                        <SelectItem value="cleaning_markup">
                          Cleaning Markup (from Tasks)
                        </SelectItem>
                        <SelectItem value="purchase_markup">
                          Purchase Markup (from Inventory)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value Type</Label>
                    <Select
                      value={form.valueType}
                      onValueChange={(val: any) =>
                        setForm({ ...form, valueType: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select value type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount / Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.value}
                      onChange={(e) =>
                        setForm({ ...form, value: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={form.frequency}
                      onValueChange={(val: any) =>
                        setForm({ ...form, frequency: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select frequency..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_booking">
                          Per Booking (Auto)
                        </SelectItem>
                        <SelectItem value="per_task">
                          Per Task (Auto)
                        </SelectItem>
                        <SelectItem value="monthly">Monthly Fixed</SelectItem>
                        <SelectItem value="yearly">Yearly Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                    <Input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) =>
                        setForm({ ...form, validFrom: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue text-white"
                >
                  Save Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Target Player</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>Rate / Value</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((agreement) => (
                <TableRow key={agreement.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {agreement.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700"
                    >
                      {getTargetName(agreement.targetId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 capitalize">
                      {agreement.type.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {formatValue(agreement.value, agreement.valueType)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 capitalize">
                    {agreement.frequency.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        agreement.status === 'active'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {agreement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingRecord(agreement)
                            setForm(agreement)
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2 text-slate-600" />{' '}
                          Edit Rule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => setDeleteId(agreement.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Settings className="h-10 w-10 text-slate-300" />
                      <p>No billing rules configured.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                      >
                        Create your first rule
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this billing rule? Existing
              invoices won't be affected, but future automatic calculations will
              ignore this rule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
