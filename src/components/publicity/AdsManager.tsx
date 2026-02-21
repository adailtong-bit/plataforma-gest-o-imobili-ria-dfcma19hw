import { useState, useContext } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { AppContext } from '@/stores/AppContext'
import { useToast } from '@/hooks/use-toast'
import { Advertisement } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CurrencyInput } from '@/components/ui/currency-input'

export function AdsManager() {
  const {
    advertisements,
    advertisers,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
  } = usePublicityStore()
  const appContext = useContext(AppContext)
  const currency = appContext?.currency || 'USD'
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const initialFormState: Partial<Advertisement> = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    active: true,
    placement: 'home_top',
    advertiserId: '',
    price: 0,
    startDate: '',
    endDate: '',
  }
  const [formData, setFormData] =
    useState<Partial<Advertisement>>(initialFormState)

  const filteredAds = advertisements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpen = (ad?: Advertisement) => {
    if (ad) {
      setEditingId(ad.id)
      setFormData({ ...ad })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl || !formData.advertiserId) {
      toast({
        title: 'Validation Error',
        description: 'Title, Image URL, and Advertiser are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      updateAdvertisement({ ...formData, id: editingId } as Advertisement)
      toast({ title: 'Advertisement updated successfully.' })
    } else {
      addAdvertisement({
        ...formData,
        id: `ad-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Advertisement)
      toast({ title: 'Advertisement created successfully.' })
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAdvertisement(id)
      toast({ title: 'Advertisement deleted.' })
    }
  }

  const getAdvertiserName = (id?: string) => {
    if (!id) return 'Unknown'
    const adv = advertisers.find((a) => a.id === id)
    return adv ? adv.name : 'Unknown'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Advertisements Manager</CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2 bg-trust-blue">
            <Plus className="h-4 w-4" /> New Advertisement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Info</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No advertisements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-muted rounded overflow-hidden flex-shrink-0 border">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{ad.title}</span>
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" /> Link
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getAdvertiserName(ad.advertiserId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ad.placement?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        {ad.startDate ? formatDate(ad.startDate) : 'N/A'}
                      </span>
                      <span className="text-muted-foreground">
                        to {ad.endDate ? formatDate(ad.endDate) : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-700">
                    {formatCurrency(ad.price || 0, currency)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ad.active ? 'default' : 'secondary'}
                      className={ad.active ? 'bg-green-600' : ''}
                    >
                      {ad.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(ad)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Advertisement' : 'New Advertisement'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Advertiser *</Label>
                  <Select
                    value={formData.advertiserId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, advertiserId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select advertiser" />
                    </SelectTrigger>
                    <SelectContent>
                      {advertisers.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Placement Location</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, placement: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home_top">Home Top Banner</SelectItem>
                      <SelectItem value="home_bottom">
                        Home Bottom Banner
                      </SelectItem>
                      <SelectItem value="partner_page">Partner Page</SelectItem>
                      <SelectItem value="tenant_page">Tenant Portal</SelectItem>
                      <SelectItem value="pm_login">PM Login Screen</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Price</Label>
                  <CurrencyInput
                    value={formData.price}
                    onChange={(v) => setFormData({ ...formData, price: v })}
                    currency={currency}
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

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image URL *
                </Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://img.usecurling.com/p/800/200?q=ad"
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Target Link URL
                </Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between border rounded-md p-4 mt-2">
                <div>
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle ad visibility across the platform.
                  </p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, active: c })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue">
                Save Advertisement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
