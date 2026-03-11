import { useState } from 'react'
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
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { Advertiser } from '@/lib/types'

export function AdvertiserList() {
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser } =
    usePublicityStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const initialFormState: Partial<Advertiser> = {
    name: '',
    legalName: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    billingContactName: '',
    billingContactEmail: '',
    billingContactPhone: '',
  }
  const [formData, setFormData] =
    useState<Partial<Advertiser>>(initialFormState)

  const filteredAdvertisers = advertisers.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.taxId?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpen = (advertiser?: Advertiser) => {
    if (advertiser) {
      setEditingId(advertiser.id)
      setFormData({ ...advertiser })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: t('common.validation_error') || 'Validation Error',
        description:
          t('publicity.advertiser_list.validation_error') ||
          'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      updateAdvertiser({ ...formData, id: editingId } as Advertiser)
      toast({
        title:
          t('publicity.advertiser_list.update_success') ||
          'Advertiser updated successfully.',
      })
    } else {
      addAdvertiser({
        ...formData,
        id: `adv-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Advertiser)
      toast({
        title:
          t('publicity.advertiser_list.add_success') ||
          'Advertiser created successfully.',
      })
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    if (
      confirm(
        t('publicity.advertiser_list.delete_confirm') ||
          'Are you sure you want to delete this advertiser?',
      )
    ) {
      deleteAdvertiser(id)
      toast({
        title:
          t('publicity.advertiser_list.delete_success') ||
          'Advertiser deleted.',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>
          {t('publicity.advertiser_list.title') || 'Advertisers'}
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                t('publicity.advertiser_list.search_placeholder') ||
                'Search advertisers...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2 bg-trust-blue">
            <Plus className="h-4 w-4" />{' '}
            {t('publicity.advertiser_list.add_btn') || 'Add Advertiser'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('publicity.advertiser_list.table_company') || 'Company'}
              </TableHead>
              <TableHead>
                {t('publicity.advertiser_list.table_contact') || 'Contact'}
              </TableHead>
              <TableHead>
                {t('publicity.advertiser_list.table_address') || 'Address'}
              </TableHead>
              <TableHead>Billing Contact</TableHead>
              <TableHead className="text-right">
                {t('common.actions') || 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdvertisers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  {t('publicity.advertiser_list.empty_state') ||
                    'No advertisers found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdvertisers.map((adv) => (
                <TableRow key={adv.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{adv.name}</span>
                      {adv.legalName && (
                        <span className="text-xs text-muted-foreground">
                          {adv.legalName}
                        </span>
                      )}
                      {adv.taxId && (
                        <span className="text-xs text-muted-foreground">
                          ID: {adv.taxId}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{adv.email}</span>
                      <span className="text-muted-foreground">{adv.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {adv.address || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {adv.billingContactName ? (
                        <>
                          <span className="font-medium">
                            {adv.billingContactName}
                          </span>
                          <span className="text-muted-foreground">
                            {adv.billingContactEmail}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Same as primary
                        </span>
                      )}
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? t('publicity.advertiser_list.modal_edit') ||
                    'Edit Advertiser'
                  : t('publicity.advertiser_list.modal_new') ||
                    'New Advertiser'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.advertiser_list.label_company') ||
                      'Company/Brand Name'}
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Legal Name</Label>
                  <Input
                    value={formData.legalName}
                    onChange={(e) =>
                      setFormData({ ...formData, legalName: e.target.value })
                    }
                    placeholder="Official Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tax ID / CNPJ / EIN</Label>
                  <Input
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.advertiser_list.label_address') || 'Address'}
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.advertiser_list.label_email') ||
                      'General Email'}
                  </Label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.advertiser_list.label_phone') ||
                      'General Phone'}
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-semibold mb-3">Billing Contact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.billingContactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingContactName: e.target.value,
                        })
                      }
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.billingContactEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingContactEmail: e.target.value,
                        })
                      }
                      placeholder="billing@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.billingContactPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingContactPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue">
                {t('common.save') || 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
