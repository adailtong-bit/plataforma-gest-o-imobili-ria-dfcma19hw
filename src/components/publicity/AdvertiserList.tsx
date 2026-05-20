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
import { Plus, Edit, Trash2, Search, Users, AlertCircle } from 'lucide-react'
import usePublicityStore, { AdvFormData } from '@/stores/usePublicityStore'
import { useToast } from '@/hooks/use-toast'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidZip = (zip: string, country: string) => {
  if (!zip) return true
  if (country === 'US') return /^\d{5}(-\d{4})?$/.test(zip)
  if (country === 'BR') return /^\d{5}-?\d{3}$/.test(zip)
  return true // Generic fallback for other countries
}

export function AdvertiserList() {
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser } =
    usePublicityStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    country: 'US' as 'US' | 'BR' | 'ES',
    contacts: [
      { name: '', role: '', phone: '', email: '' },
      { name: '', role: '', phone: '', email: '' },
    ] as {
      name: string
      role: string
      phone: string
      email: string
    }[],
  }
  const [formData, setFormData] = useState(initialFormState)

  const isFormValid = !!(
    formData.name &&
    formData.country &&
    formData.city &&
    formData.state
  )

  const filteredAdvertisers = advertisers.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpen = (adv?: AdvFormData) => {
    if (adv) {
      setEditingId(adv.id!)

      const mappedContacts =
        adv.contacts?.map((c: any) => ({
          name: c.name || '',
          role: c.role || '',
          phone: c.phone || '',
          email: c.email || '',
        })) || []

      setFormData({
        name: adv.name || '',
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
        country: (adv.country as 'US' | 'BR' | 'ES') || 'US',
        contacts:
          mappedContacts.length >= 2
            ? mappedContacts
            : [
                ...mappedContacts,
                ...Array.from({
                  length: Math.max(0, 2 - mappedContacts.length),
                }).map(() => ({
                  name: '',
                  role: '',
                  phone: '',
                  email: '',
                })),
              ],
      })
    } else {
      setEditingId(null)
      setFormData({
        ...initialFormState,
        contacts: [
          { name: '', role: '', phone: '', email: '' },
          { name: '', role: '', phone: '', email: '' },
        ],
      })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!formData.country || !formData.state || !formData.city) {
      toast({
        title: 'Validation Error',
        description: 'Country, State, and City are mandatory.',
        variant: 'destructive',
      })
      return
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }

    // Validation
    if (
      !formData.name ||
      !formData.taxId ||
      formData.contacts.length < 2 ||
      !formData.contacts.every((c) => c.name && c.role && c.phone && c.email)
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Please complete all required fiscal fields, Tax ID, and provide at least 2 complete contacts.',
        variant: 'destructive',
      })
      return
    }

    if (formData.zipCode && !isValidZip(formData.zipCode, formData.country)) {
      toast({
        title: 'Invalid Zip Code',
        description: `Please enter a valid zip code for ${formData.country}.`,
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
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
    } catch (error: unknown) {
      const err = error as Error & { code?: string }
      const isRlsError =
        err.message?.includes('row-level security') || err.code === '42501'
      toast({
        title: 'Error saving advertiser',
        description: isRlsError
          ? 'Error saving: You do not have permission to perform this action. Please check your administrative role.'
          : err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this advertiser? All their campaigns might be affected.',
      )
    ) {
      try {
        await deleteAdvertiser(id)
        toast({ title: 'Advertiser deleted.' })
      } catch (error: unknown) {
        const err = error as Error
        toast({
          title: 'Error deleting',
          description: err.message || 'Could not delete the advertiser.',
          variant: 'destructive',
        })
      }
    }
  }

  const addContact = () => {
    if (formData.contacts.length >= 3) {
      toast({
        title: 'Limit Reached',
        description: 'You can only add up to 3 contact persons.',
        variant: 'default',
      })
      return
    }
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
    if (formData.contacts.length <= 2) {
      toast({
        title: 'Action Prevented',
        description: 'You must maintain at least 2 contact persons.',
        variant: 'destructive',
      })
      return
    }
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
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
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
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tax ID (CNPJ/EIN) *</Label>
                      <Input
                        value={formData.taxId}
                        onChange={(e) =>
                          setFormData({ ...formData, taxId: e.target.value })
                        }
                        placeholder="Required"
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
                        placeholder="billing@company.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Billing Phone</Label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        country={formData.country}
                        onCountryChange={(c) =>
                          setFormData({ ...formData, country: c })
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
                      <Label>Number *</Label>
                      <Input
                        value={formData.number}
                        onChange={(e) =>
                          setFormData({ ...formData, number: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Complement *</Label>
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
                      <Label>Neighborhood *</Label>
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
                      <Label>State / Province *</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Zip Code *</Label>
                      <Input
                        value={formData.zipCode}
                        onChange={async (e) => {
                          const val = e.target.value
                          setFormData({ ...formData, zipCode: val })
                          if (
                            formData.country === 'BR' &&
                            val.replace(/\D/g, '').length === 8
                          ) {
                            try {
                              const res = await fetch(
                                `https://viacep.com.br/ws/${val.replace(/\D/g, '')}/json/`,
                              )
                              const data = await res.json()
                              if (!data.erro) {
                                setFormData((prev) => ({
                                  ...prev,
                                  street: data.logradouro || prev.street,
                                  neighborhood:
                                    data.bairro || prev.neighborhood,
                                  city: data.localidade || prev.city,
                                  state: data.uf || prev.state,
                                }))
                              }
                            } catch (err) {
                              console.error('ViaCEP error', err)
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label>Country Setting (Affects Formatting)</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(v: 'US' | 'BR' | 'ES') =>
                          setFormData({ ...formData, country: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="ES">Spain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">
                      Contact Persons * (Min 2, Max 3)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addContact}
                      disabled={formData.contacts.length >= 3}
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
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
                          <Input
                            placeholder="Name *"
                            value={contact.name}
                            onChange={(e) =>
                              updateContact(idx, 'name', e.target.value)
                            }
                          />
                          <Input
                            placeholder="Role * (e.g. Marketing)"
                            value={contact.role}
                            onChange={(e) =>
                              updateContact(idx, 'role', e.target.value)
                            }
                          />
                          <Input
                            type="email"
                            placeholder="Email *"
                            value={contact.email}
                            onChange={(e) =>
                              updateContact(idx, 'email', e.target.value)
                            }
                          />
                          <PhoneInput
                            placeholder="Phone"
                            value={contact.phone}
                            country={formData.country}
                            onChange={(e) =>
                              updateContact(idx, 'phone', e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 mt-0.5 shrink-0"
                          onClick={() => removeContact(idx)}
                          disabled={formData.contacts.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.contacts.length < 2 && (
                      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                        <AlertCircle className="h-4 w-4" />
                        <span>Please add at least two contact persons.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t bg-slate-50">
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
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? 'Saving...' : 'Save Advertiser'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
