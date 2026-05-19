import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { useToast } from '@/hooks/use-toast'

export function AdvertiserList() {
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser } =
    usePublicityStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const initialFormState = {
    name: '',
    taxId: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    contacts: [] as {
      name: string
      role: string
      phone: string
      email: string
    }[],
  }
  const [formData, setFormData] = useState(initialFormState)

  const filteredAdvertisers = advertisers.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpen = (adv?: any) => {
    if (adv) {
      setEditingId(adv.id)
      setFormData({
        name: adv.name,
        taxId: adv.taxId || '',
        email: adv.email || '',
        phone: adv.phone || '',
        street: adv.street || '',
        number: adv.number || '',
        complement: adv.complement || '',
        neighborhood: adv.neighborhood || '',
        city: adv.city || '',
        state: adv.state || '',
        zipCode: adv.zipCode || '',
        country: adv.country || '',
        contacts: adv.contacts || [],
      })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.street ||
      !formData.city
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Company Name, Email, Street and City are required fields.',
        variant: 'destructive',
      })
      return
    }

    if (formData.contacts.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one contact person is required.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      ...formData,
      address: `${formData.street}, ${formData.number} - ${formData.city}/${formData.state}`,
    }

    if (editingId) {
      await updateAdvertiser({ ...payload, id: editingId })
      toast({ title: 'Advertiser updated successfully.' })
    } else {
      await addAdvertiser(payload)
      toast({ title: 'Advertiser registered successfully.' })
    }
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to delete this advertiser? All their campaigns might be affected.',
      )
    ) {
      await deleteAdvertiser(id)
      toast({ title: 'Advertiser deleted.' })
    }
  }

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [
        ...formData.contacts,
        { name: '', role: '', phone: '', email: '' },
      ],
    })
  }

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...formData.contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setFormData({ ...formData, contacts: newContacts })
  }

  const removeContact = (index: number) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index)
    setFormData({ ...formData, contacts: newContacts })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Advertisers CRM</CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search advertisers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2 bg-trust-blue">
            <Plus className="h-4 w-4" /> Add Advertiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Tax ID</TableHead>
              <TableHead>Billing Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdvertisers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No advertisers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAdvertisers.map((adv) => (
                <TableRow key={adv.id}>
                  <TableCell className="font-medium">{adv.name}</TableCell>
                  <TableCell>{adv.taxId || '-'}</TableCell>
                  <TableCell>{adv.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground max-w-[200px] truncate">
                      <span>
                        {adv.street} {adv.number}
                      </span>
                      <span>
                        {adv.city}, {adv.state}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Users className="h-4 w-4" /> {adv.contacts?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(adv)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                {editingId ? 'Edit Advertiser' : 'New Advertiser'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-6 pt-4">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Company Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Company Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tax ID (CNPJ/EIN)</Label>
                      <Input
                        value={formData.taxId}
                        onChange={(e) =>
                          setFormData({ ...formData, taxId: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Billing Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Billing Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Structured Address
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2 col-span-2">
                      <Label>Street *</Label>
                      <Input
                        value={formData.street}
                        onChange={(e) =>
                          setFormData({ ...formData, street: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Number</Label>
                      <Input
                        value={formData.number}
                        onChange={(e) =>
                          setFormData({ ...formData, number: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Complement</Label>
                      <Input
                        value={formData.complement}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            complement: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Neighborhood</Label>
                      <Input
                        value={formData.neighborhood}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            neighborhood: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>State / Province</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Zip Code</Label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label>Country</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Contact Persons *</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addContact}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Contact
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.contacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border"
                      >
                        <div className="grid grid-cols-4 gap-2 flex-1">
                          <Input
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) =>
                              updateContact(idx, 'name', e.target.value)
                            }
                          />
                          <Input
                            placeholder="Role (e.g. Marketing)"
                            value={contact.role}
                            onChange={(e) =>
                              updateContact(idx, 'role', e.target.value)
                            }
                          />
                          <Input
                            placeholder="Email"
                            value={contact.email}
                            onChange={(e) =>
                              updateContact(idx, 'email', e.target.value)
                            }
                          />
                          <Input
                            placeholder="Phone"
                            value={contact.phone}
                            onChange={(e) =>
                              updateContact(idx, 'phone', e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 mt-0.5"
                          onClick={() => removeContact(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.contacts.length === 0 && (
                      <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                        Please add at least one contact person.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t bg-slate-50">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue">
                Save Advertiser
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
