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
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Edit, Trash2 } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { useToast } from '@/hooks/use-toast'
import useFinancialStore from '@/stores/useFinancialStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'

export function PricingConfig() {
  const {
    pricingMatrix,
    addPricingMatrix,
    updatePricingMatrix,
    deletePricingMatrix,
  } = usePublicityStore()
  const { currency } = useFinancialStore()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  const [form, setForm] = useState({
    id: '',
    location_key: '',
    duration_days: 0,
    price: 0,
    valid_from: new Date().toISOString().split('T')[0],
  })
  const [isEditing, setIsEditing] = useState(false)

  const locations = [
    { value: 'menu_properties', label: 'Properties Menu' },
    { value: 'menu_financial', label: 'Financial Menu' },
    { value: 'menu_hotels', label: 'Hotels Menu' },
    { value: 'dashboard_sidebar', label: 'Dashboard Sidebar' },
    { value: 'login_banner', label: 'Login Banner' },
    { value: 'home_top', label: 'Home Top' },
    { value: 'home_bottom', label: 'Home Bottom' },
    { value: 'tenant_page', label: 'Tenant Page' },
    { value: 'partner_page', label: 'Partner Page' },
    { value: 'performance', label: 'Performance' },
  ]

  const handleSave = async () => {
    if (
      !form.location_key ||
      form.duration_days <= 0 ||
      form.price <= 0 ||
      !form.valid_from
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields with valid data.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      ...form,
      valid_from: new Date(form.valid_from).toISOString(),
    }

    if (isEditing) {
      await updatePricingMatrix(payload)
      toast({ title: 'Pricing Matrix updated' })
    } else {
      await addPricingMatrix(payload)
      toast({ title: 'Pricing Matrix created' })
    }
    setForm({
      id: '',
      location_key: '',
      duration_days: 0,
      price: 0,
      valid_from: new Date().toISOString().split('T')[0],
    })
    setIsEditing(false)
  }

  const handleEdit = (p: any) => {
    setForm({
      id: p.id,
      location_key: p.location_key,
      duration_days: p.duration_days,
      price: p.price,
      valid_from: new Date(p.valid_from).toISOString().split('T')[0],
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

  const getStatus = (p: any) => {
    const now = new Date()
    const validFrom = new Date(p.valid_from)
    if (validFrom > now) return 'Scheduled'

    const relevant = pricingMatrix.filter(
      (x) =>
        x.location_key === p.location_key &&
        x.duration_days === p.duration_days &&
        new Date(x.valid_from) <= now,
    )
    relevant.sort(
      (a, b) =>
        new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime(),
    )

    if (relevant[0]?.id === p.id) return 'Current'
    return 'Expired'
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Tier' : 'New Pricing Tier'}</CardTitle>
          <CardDescription>
            Configure price based on location, duration and effective date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Location Map</Label>
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
          <div className="grid gap-2">
            <Label>Valid From Date</Label>
            <Input
              type="date"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
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
                    valid_from: new Date().toISOString().split('T')[0],
                  })
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Matrix Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingMatrix.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No rules defined.
                  </TableCell>
                </TableRow>
              ) : (
                [...pricingMatrix]
                  .sort(
                    (a, b) =>
                      new Date(b.valid_from).getTime() -
                      new Date(a.valid_from).getTime(),
                  )
                  .map((p) => {
                    const status = getStatus(p)
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          {status === 'Current' && (
                            <Badge className="bg-green-600">Current</Badge>
                          )}
                          {status === 'Scheduled' && (
                            <Badge className="bg-blue-500">Scheduled</Badge>
                          )}
                          {status === 'Expired' && (
                            <Badge variant="secondary">Expired</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium capitalize">
                          {getLocationLabel(p.location_key)}
                        </TableCell>
                        <TableCell>{p.duration_days} Days</TableCell>
                        <TableCell>
                          {formatDate(p.valid_from, language)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {formatCurrency(p.price, currency)}
                        </TableCell>
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
                    )
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
