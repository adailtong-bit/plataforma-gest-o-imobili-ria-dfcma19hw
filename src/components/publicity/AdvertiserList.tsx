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
import { Plus, Edit, Trash2 } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { Advertiser } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { PhoneInput } from '@/components/ui/phone-input'

export function AdvertiserList() {
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser } =
    usePublicityStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Advertiser>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Name and Email are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      const existing = advertisers.find((a) => a.id === editingId)
      if (existing) {
        updateAdvertiser({ ...existing, ...formData } as Advertiser)
        toast({ title: 'Advertiser updated' })
      }
    } else {
      addAdvertiser({
        id: `adv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...formData,
      } as Advertiser)
      toast({ title: 'Advertiser created' })
    }
    setOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this advertiser?')) {
      deleteAdvertiser(id)
      toast({ title: 'Advertiser deleted' })
    }
  }

  const handleEdit = (advertiser: Advertiser) => {
    setEditingId(advertiser.id)
    setFormData(advertiser)
    setOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    })
  }

  const handleAddressSelect = (addr: AddressData) => {
    setFormData((prev) => ({
      ...prev,
      address: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`,
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Advertisers</h2>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> New Advertiser
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Advertiser' : 'New Advertiser'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Company or Contact Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <PhoneInput
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Search Address</Label>
                <AddressInput onAddressSelect={handleAddressSelect} />
              </div>
              <div className="grid gap-2">
                <Label>Full Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No advertisers found.
                </TableCell>
              </TableRow>
            ) : (
              advertisers.map((adv) => (
                <TableRow key={adv.id}>
                  <TableCell className="font-medium">{adv.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{adv.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {adv.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {adv.address}
                  </TableCell>
                  <TableCell>
                    {format(new Date(adv.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(adv)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(adv.id)}
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
    </div>
  )
}
