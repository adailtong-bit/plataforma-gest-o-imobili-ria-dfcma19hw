import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  FileText,
} from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { Advertisement } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { FileUpload } from '@/components/ui/file-upload'
import { InvoiceGenerator } from './InvoiceGenerator'
import { addWeeks, addMonths, format } from 'date-fns'

export function AdsManager() {
  const {
    advertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    advertisers,
    adPricing,
  } = usePublicityStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [selectedAdForInvoice, setSelectedAdForInvoice] =
    useState<Advertisement | null>(null)

  const [formData, setFormData] = useState<Partial<Advertisement>>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    active: true,
    placement: 'footer',
    advertiserId: '',
    validity: 'monthly',
    renewable: false,
    price: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
  })

  // Auto-calculate price and dates when validity changes
  const updatePricingAndDates = (validity: string) => {
    let price = 0
    let endDate = new Date(formData.startDate || new Date())

    switch (validity) {
      case 'weekly':
        price = adPricing.weekly
        endDate = addWeeks(endDate, 1)
        break
      case 'bi-weekly':
        price = adPricing.biWeekly
        endDate = addWeeks(endDate, 2)
        break
      case 'monthly':
        price = adPricing.monthly
        endDate = addMonths(endDate, 1)
        break
    }

    setFormData((prev) => ({
      ...prev,
      validity: validity as any,
      price,
      endDate: format(endDate, 'yyyy-MM-dd'),
    }))
  }

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl || !formData.advertiserId) {
      toast({
        title: 'Validation Error',
        description: 'Title, Image, and Advertiser are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      const ad = advertisements.find((a) => a.id === editingId)
      if (ad) {
        updateAdvertisement({ ...ad, ...formData } as Advertisement)
        toast({ title: 'Ad updated' })
      }
    } else {
      addAdvertisement({
        id: `ad-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...formData,
      } as Advertisement)
      toast({ title: 'Ad created' })
    }
    setOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteAdvertisement(id)
      toast({ title: 'Ad deleted' })
    }
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id)
    setFormData(ad)
    setOpen(true)
  }

  const handleGenerateInvoice = (ad: Advertisement) => {
    setSelectedAdForInvoice(ad)
    setInvoiceOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      active: true,
      placement: 'footer',
      advertiserId: '',
      validity: 'monthly',
      renewable: false,
      price: adPricing.monthly,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    })
  }

  const getAdvertiserName = (id?: string) => {
    return advertisers.find((a) => a.id === id)?.name || 'Unknown'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Advertisements</h2>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Ad' : 'Create Ad'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Advertiser</Label>
                <Select
                  value={formData.advertiserId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, advertiserId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Advertiser" />
                  </SelectTrigger>
                  <SelectContent>
                    {advertisers.map((adv) => (
                      <SelectItem key={adv.id} value={adv.id}>
                        {adv.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Validity Period</Label>
                  <Select
                    value={formData.validity}
                    onValueChange={updatePricingAndDates}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <Switch
                  checked={formData.renewable}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, renewable: c })
                  }
                />
                <Label>Renewable (Auto-notify)</Label>
              </div>

              <div className="grid gap-2">
                <Label>Link URL</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Banner Image</Label>
                <FileUpload
                  value={formData.imageUrl}
                  onChange={(url) =>
                    setFormData({ ...formData, imageUrl: url })
                  }
                  label="Upload Banner"
                />
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, active: c })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save Ad</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banner</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No advertisements found.
                </TableCell>
              </TableRow>
            ) : (
              advertisements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="h-10 w-16 bg-muted rounded overflow-hidden relative">
                      {ad.imageUrl ? (
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 absolute top-3 left-6 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{ad.title}</span>
                      <a
                        href={ad.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAdvertiserName(ad.advertiserId)}
                    {ad.renewable && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px] h-4 px-1"
                      >
                        Renewable
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="capitalize">{ad.validity}</span>
                      <span className="text-muted-foreground">
                        {ad.endDate
                          ? format(new Date(ad.endDate), 'MMM dd')
                          : '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>${ad.price?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ad.active ? 'default' : 'secondary'}
                      className={ad.active ? 'bg-green-600' : ''}
                    >
                      {ad.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Generate Invoice"
                        onClick={() => handleGenerateInvoice(ad)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Modal */}
      {selectedAdForInvoice && (
        <InvoiceGenerator
          open={invoiceOpen}
          onOpenChange={setInvoiceOpen}
          ad={selectedAdForInvoice}
          advertiser={
            advertisers.find(
              (a) => a.id === selectedAdForInvoice.advertiserId,
            ) || {
              id: 'unknown',
              name: 'Unknown',
              email: '',
              phone: '',
              address: '',
              createdAt: '',
            }
          }
        />
      )}
    </div>
  )
}
