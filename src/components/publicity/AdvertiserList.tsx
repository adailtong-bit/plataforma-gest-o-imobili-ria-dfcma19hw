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
import { formatDate } from '@/lib/utils'

export function AdvertiserList() {
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser } =
    usePublicityStore()
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Advertiser>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const filteredAdvertisers = advertisers.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpen = (advertiser?: Advertiser) => {
    if (advertiser) {
      setEditingId(advertiser.id)
      setFormData({ ...advertiser })
    } else {
      setEditingId(null)
      setFormData({ name: '', email: '', phone: '', address: '' })
    }
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: t('common.validation_error'),
        description: t('publicity.advertiser_list.validation_error'),
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      updateAdvertiser({ ...formData, id: editingId } as Advertiser)
      toast({ title: t('publicity.advertiser_list.update_success') })
    } else {
      addAdvertiser({
        ...formData,
        id: `adv-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Advertiser)
      toast({ title: t('publicity.advertiser_list.add_success') })
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('publicity.advertiser_list.delete_confirm'))) {
      deleteAdvertiser(id)
      toast({ title: t('publicity.advertiser_list.delete_success') })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>{t('publicity.advertiser_list.title')}</CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('publicity.advertiser_list.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2">
            <Plus className="h-4 w-4" />{' '}
            {t('publicity.advertiser_list.add_btn')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('publicity.advertiser_list.table_company')}
              </TableHead>
              <TableHead>
                {t('publicity.advertiser_list.table_contact')}
              </TableHead>
              <TableHead>
                {t('publicity.advertiser_list.table_address')}
              </TableHead>
              <TableHead>
                {t('publicity.advertiser_list.table_registered')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
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
                  {t('publicity.advertiser_list.empty_state')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdvertisers.map((adv) => (
                <TableRow key={adv.id}>
                  <TableCell className="font-medium">{adv.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{adv.email}</span>
                      <span className="text-muted-foreground">{adv.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{adv.address || '-'}</TableCell>
                  <TableCell>{formatDate(adv.createdAt, language)}</TableCell>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? t('publicity.advertiser_list.modal_edit')
                  : t('publicity.advertiser_list.modal_new')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('publicity.advertiser_list.label_company')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('publicity.advertiser_list.label_email')}</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('publicity.advertiser_list.label_phone')}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('publicity.advertiser_list.label_address')}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
