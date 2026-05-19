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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Location Keys adjusted to match the application's core navigation as required
  const locations = [
    { value: 'properties', label: 'Properties Menu' },
    { value: 'hotels', label: 'Hotels Menu' },
    { value: 'financial', label: 'Financial Menu' },
    { value: 'condominiums', label: 'Condominiums Menu' },
    { value: 'dashboard', label: 'Dashboard' },
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

    setIsSubmitting(true)
    try {
      // Ensure date is properly formatted as timestamptz for Supabase
      const validFromDate = new Date(form.valid_from)
      const payload = {
        ...form,
        valid_from: validFromDate.toISOString(),
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
    } catch (error: any) {
      const isRlsError =
        error.message?.includes('row-level security') || error.code === '42501'
      toast({
        title: 'Error saving pricing',
        description: isRlsError
          ? 'Error saving: You do not have permission to perform this action. Please check your administrative role.'
          : error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (p: any) => {
    setForm({
      id: p.id,
      location_key: p.location_key,
      duration_days: p.duration_days,
      price: p.price,
      // Handle potential timezone formatting issues for input type="date"
      valid_from: p.valid_from
        ? new Date(p.valid_from).toISOString().split('T')[0]
        : '',
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Delete this pricing configuration? It will not affect active campaigns.',
      )
    ) {
      try {
        await deletePricingMatrix(id)
        toast({ title: 'Deleted successfully' })
      } catch (error: any) {
        toast({
          title: 'Error deleting',
          description: error.message || 'Could not delete pricing.',
          variant: 'destructive',
        })
      }
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

    // To determine if it's the CURRENT active one, find all rules for this location/duration
    // that are valid as of now, and pick the latest valid_from date.
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
      <Card className="h-fit sticky top-6">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Tier' : 'New Pricing Tier'}</CardTitle>
          <CardDescription>
            Configure temporal pricing based on location and duration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Location Map *</Label>
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
            <Label>Duration (Days) *</Label>
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
            <Label>Price *</Label>
            <CurrencyInput
              value={form.price}
              onChange={(v) => setForm({ ...form, price: v })}
              currency={currency}
            />
          </div>
          <div className="grid gap-2">
            <Label>Valid From Date *</Label>
            <Input
              type="date"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="w-full bg-trust-blue"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Tier'
                  : 'Add Tier'}
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
          <CardDescription>
            Historical and future scheduled pricing for campaign placements.
          </CardDescription>
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
                    No rules defined. Create your first pricing tier.
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
                            <Badge className="bg-green-600">
                              Current Active
                            </Badge>
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
