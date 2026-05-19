import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
import { CurrencyInput } from '@/components/ui/currency-input'
import { Edit, Trash2 } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { useToast } from '@/hooks/use-toast'
import useFinancialStore from '@/stores/useFinancialStore'
import { formatCurrency } from '@/lib/utils'

export function PricingConfig() {
  const {
    pricingMatrix,
    addPricingMatrix,
    updatePricingMatrix,
    deletePricingMatrix,
  } = usePublicityStore()
  const { currency } = useFinancialStore()
  const { toast } = useToast()

  const [form, setForm] = useState({
    id: '',
    location_key: '',
    duration_days: 0,
    price: 0,
  })
  const [isEditing, setIsEditing] = useState(false)

  const locations = [
    { value: 'dashboard_sidebar', label: 'Dashboard Sidebar' },
    { value: 'login_banner', label: 'Login Banner' },
    { value: 'home_top', label: 'Home Top' },
    { value: 'home_bottom', label: 'Home Bottom' },
    { value: 'tenant_page', label: 'Tenant Page' },
    { value: 'partner_page', label: 'Partner Page' },
    { value: 'performance', label: 'Performance' },
  ]

  const handleSave = async () => {
    if (!form.location_key || form.duration_days <= 0 || form.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields with valid data.',
        variant: 'destructive',
      })
      return
    }

    if (isEditing) {
      await updatePricingMatrix(form)
      toast({ title: 'Pricing Matrix updated' })
    } else {
      await addPricingMatrix(form)
      toast({ title: 'Pricing Matrix created' })
    }
    setForm({ id: '', location_key: '', duration_days: 0, price: 0 })
    setIsEditing(false)
  }

  const handleEdit = (p: any) => {
    setForm({
      id: p.id,
      location_key: p.location_key,
      duration_days: p.duration_days,
      price: p.price,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Delete this pricing configuration? It will not affect active campaigns.',
      )
    ) {
      await deletePricingMatrix(id)
      toast({ title: 'Deleted successfully' })
    }
  }

  const getLocationLabel = (key: string) => {
    const loc = locations.find((l) => l.value === key)
    return loc ? loc.label : key.replace(/_/g, ' ')
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Tier' : 'New Pricing Tier'}</CardTitle>
          <CardDescription>
            Configure price based on location and exposure time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Location</Label>
            <Select
              value={form.location_key}
              onValueChange={(v) => setForm({ ...form, location_key: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Duration (Days)</Label>
            <Input
              type="number"
              min="1"
              value={form.duration_days || ''}
              onChange={(e) =>
                setForm({ ...form, duration_days: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Price</Label>
            <CurrencyInput
              value={form.price}
              onChange={(v) => setForm({ ...form, price: v })}
              currency={currency}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="w-full bg-trust-blue">
              {isEditing ? 'Update Tier' : 'Add Tier'}
            </Button>
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setForm({
                    id: '',
                    location_key: '',
                    duration_days: 0,
                    price: 0,
                  })
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Pricing Matrix Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingMatrix.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No rules defined.
                  </TableCell>
                </TableRow>
              ) : (
                pricingMatrix.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium capitalize">
                      {getLocationLabel(p.location_key)}
                    </TableCell>
                    <TableCell>{p.duration_days} Days</TableCell>
                    <TableCell>{formatCurrency(p.price, currency)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(p)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
