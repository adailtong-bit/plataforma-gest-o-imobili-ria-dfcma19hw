import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Link as LinkIcon,
  Play,
  Calculator,
} from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import useLanguageStore from '@/stores/useLanguageStore'

export function AdsManager() {
  const {
    campaigns,
    advertisers,
    pricingMatrix,
    addCampaign,
    updateCampaign,
    deleteCampaign,
  } = usePublicityStore()
  const { addInvoice, addLedgerEntry, currency } = useFinancialStore()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialFormState = {
    title: '',
    advertiser_id: '',
    location_key: '',
    duration_days: '',
    start_date: new Date().toISOString().split('T')[0],
    image_url: '',
    link_url: '',
  }
  const [formData, setFormData] = useState<any>(initialFormState)

  const filteredCampaigns = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Extract unique locations and durations from pricing matrix
  const availableLocations = useMemo(() => {
    return Array.from(new Set(pricingMatrix.map((p) => p.location_key)))
  }, [pricingMatrix])

  const availableDurations = useMemo(() => {
    if (!formData.location_key) return []
    const matching = pricingMatrix.filter(
      (p) => p.location_key === formData.location_key,
    )
    return Array.from(new Set(matching.map((p) => p.duration_days))).sort(
      (a, b) => a - b,
    )
  }, [pricingMatrix, formData.location_key])

  // Core Logic: Get applicable price based on location, duration and start date (Time-Based Validity)
  const applicablePricing = useMemo(() => {
    if (
      !formData.location_key ||
      !formData.duration_days ||
      !formData.start_date
    )
      return null

    const targetDate = new Date(formData.start_date)
    // Find prices valid ON or BEFORE the target campaign start date
    const validPrices = pricingMatrix.filter(
      (p) =>
        p.location_key === formData.location_key &&
        p.duration_days === Number(formData.duration_days) &&
        new Date(p.valid_from) <= targetDate,
    )

    // Sort descending to get the most recent valid price
    validPrices.sort(
      (a, b) =>
        new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime(),
    )

    return validPrices.length > 0 ? validPrices[0] : null
  }, [
    pricingMatrix,
    formData.location_key,
    formData.duration_days,
    formData.start_date,
  ])

  const handleOpen = (camp?: any) => {
    if (camp) {
      const pm = pricingMatrix.find((p) => p.id === camp.pricing_id)
      setEditingId(camp.id)
      setFormData({
        title: camp.title || '',
        advertiser_id: camp.advertiser_id || '',
        location_key: pm?.location_key || '',
        duration_days: pm?.duration_days?.toString() || '',
        start_date: camp.start_date ? camp.start_date.split('T')[0] : '',
        image_url: camp.image_url || '',
        link_url: camp.link_url || '',
      })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.advertiser_id ||
      !formData.location_key ||
      !formData.duration_days ||
      !formData.start_date
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill in all required fields (Advertiser, Location, Duration, Start Date).',
        variant: 'destructive',
      })
      return
    }

    if (!applicablePricing) {
      toast({
        title: 'Pricing Error',
        description:
          'No valid pricing found for the selected parameters. Please configure pricing first.',
        variant: 'destructive',
      })
      return
    }

    const selectedAdv = advertisers.find((a) => a.id === formData.advertiser_id)
    if (selectedAdv) {
      const isComplete =
        selectedAdv.street &&
        selectedAdv.city &&
        selectedAdv.country &&
        selectedAdv.zipCode &&
        selectedAdv.contacts?.length > 0
      if (!isComplete) {
        toast({
          title: 'Incomplete Advertiser Profile',
          description:
            'The selected advertiser does not have a complete address and at least one contact registered. Please update their profile first.',
          variant: 'destructive',
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + applicablePricing.duration_days)

      const payload = {
        title: formData.title,
        advertiser_id: formData.advertiser_id,
        pricing_id: applicablePricing.id, // Mandatory Association
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_amount: applicablePricing.price,
        image_url: formData.image_url,
        link_url: formData.link_url,
      }

      if (editingId) {
        await updateCampaign({ ...payload, id: editingId })
        toast({ title: 'Campaign updated successfully.' })
      } else {
        await addCampaign({ ...payload, status: 'pending' })
        toast({ title: 'Campaign created successfully.' })
      }
      setIsOpen(false)
    } catch (error: any) {
      const isRlsError =
        error.message?.includes('row-level security') || error.code === '42501'
      toast({
        title: 'Error saving campaign',
        description: isRlsError
          ? 'Error saving: You do not have permission to perform this action. Please check your administrative role.'
          : error.message || 'Could not save the campaign.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id)
        toast({ title: 'Campaign deleted.' })
      } catch (error: any) {
        toast({
          title: 'Error deleting',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

  const handleActivate = async (camp: any) => {
    if (
      !confirm(
        'Activate campaign? This will generate an invoice billed directly to the Advertiser and allocate 100% revenue to the platform.',
      )
    )
      return

    try {
      // Find platform owner for 100% revenue attribution
      const { data: owners } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('role', ['platform_owner', 'master'])
        .limit(1)
      const owner = owners?.[0]
      const adv = advertisers.find((a) => a.id === camp.advertiser_id)

      if (owner && adv) {
        const fullAddress =
          `${adv.street || ''} ${adv.number || ''} ${adv.complement || ''}, ${adv.neighborhood || ''}, ${adv.city || ''} - ${adv.state || ''} ${adv.zipCode || ''} ${adv.country || ''}`.trim()

        const invId = `inv-pub-${Date.now()}`

        // Invoice FROM platform TO advertiser
        await addInvoice({
          id: invId,
          description: `Publicity Campaign: ${camp.title}`,
          amount: camp.total_amount,
          status: 'issued',
          date: new Date().toISOString(),
          toId: adv.id,
          toName: adv.name,
          toEmail: adv.email,
          toPhone: adv.phone,
          toAddress: fullAddress,
          fromId: owner.id,
          fromName: owner.name,
          fromEmail: owner.email,
          type: 'publicity',
        })

        // Revenue directly to platform (100% attribution as per requirements)
        await addLedgerEntry({
          id: `ldg-${Date.now()}`,
          propertyId: undefined, // Not property specific
          date: new Date().toISOString(),
          type: 'income',
          category: 'Publicity Revenue',
          amount: camp.total_amount,
          description: `Revenue from Campaign: ${camp.title}`,
          status: 'cleared',
          costType: 'fixed',
        })
      }

      await updateCampaign({ ...camp, status: 'active' })
      toast({ title: 'Campaign activated and invoiced.' })
    } catch (error: any) {
      toast({
        title: 'Activation Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Campaigns & Ads</CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2 bg-trust-blue">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Placement & Duration</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((camp) => {
                const adv = advertisers.find((a) => a.id === camp.advertiser_id)
                const pm = pricingMatrix.find((p) => p.id === camp.pricing_id)
                return (
                  <TableRow key={camp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {camp.image_url ? (
                          <div className="h-10 w-16 bg-muted rounded overflow-hidden flex-shrink-0 border">
                            <img
                              src={camp.image_url}
                              alt={camp.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-16 bg-slate-100 rounded border flex items-center justify-center text-xs text-slate-400">
                            No Img
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold">{camp.title}</span>
                          {camp.link_url && (
                            <a
                              href={camp.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                            >
                              <LinkIcon className="h-3 w-3" /> Link
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-slate-900">
                          {adv?.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="capitalize">
                          {pm?.location_key?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pm?.duration_days} Days
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>
                          {camp.start_date
                            ? formatDate(camp.start_date, language)
                            : 'N/A'}
                        </span>
                        <span className="text-muted-foreground">
                          to{' '}
                          {camp.end_date
                            ? formatDate(camp.end_date, language)
                            : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(camp.total_amount || 0, currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {camp.status === 'active' ? (
                        <Badge className="bg-green-600 text-white border-transparent">
                          Active
                        </Badge>
                      ) : camp.status === 'expired' ? (
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-700"
                        >
                          Expired
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 border-transparent"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {camp.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleActivate(camp)}
                          title="Activate & Bill"
                        >
                          <Play className="h-4 w-4 text-emerald-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpen(camp)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(camp.id)}
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

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Campaign' : 'New Campaign'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Summer Promo 2026"
                />
              </div>

              <div className="grid gap-2">
                <Label>Advertiser *</Label>
                <Select
                  value={formData.advertiser_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, advertiser_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Advertiser" />
                  </SelectTrigger>
                  <SelectContent>
                    {advertisers.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}{' '}
                        {a.contacts?.[0] ? `(${a.contacts[0].name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border">
                <div className="grid gap-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Placement Location *</Label>
                  <Select
                    value={formData.location_key}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        location_key: v,
                        duration_days: '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                      {availableLocations.length === 0 && (
                        <SelectItem value="empty" disabled>
                          No pricing configured
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Duration *</Label>
                  <Select
                    value={formData.duration_days}
                    onValueChange={(v) =>
                      setFormData({ ...formData, duration_days: v })
                    }
                    disabled={!formData.location_key}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDurations.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                <Calculator className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-semibold">Calculated Total Amount</p>
                  <p className="text-blue-600">
                    Based on location, duration and exact temporal pricing rule
                    active on the selected start date.
                  </p>
                </div>
                <div className="text-xl font-bold">
                  {applicablePricing
                    ? formatCurrency(applicablePricing.price, currency)
                    : '-'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Image/Banner URL
                  </Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://img.usecurling.com/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Target Link URL
                  </Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) =>
                      setFormData({ ...formData, link_url: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-trust-blue"
                disabled={!applicablePricing || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
