import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { ServiceRate } from '@/lib/types'
import { DataMask } from '@/components/DataMask'

export default function ServicePricing() {
  const {
    genericServiceRates,
    addGenericServiceRate,
    updateGenericServiceRate,
    deleteGenericServiceRate,
    formatAppCurrency,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ServiceRate | null>(null)
  const [form, setForm] = useState<Partial<ServiceRate>>({
    serviceName: '',
    servicePrice: 0,
    productPrice: 0,
    pmValue: 0,
    partnerPayment: 0,
    validFrom: new Date().toISOString().split('T')[0],
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredRates = genericServiceRates.filter((r) =>
    r.serviceName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.serviceName) {
      toast({ title: t('common.error'), variant: 'destructive' })
      return
    }

    if (editingRecord) {
      updateGenericServiceRate({ ...editingRecord, ...form } as ServiceRate)
      toast({ title: t('common.success') })
    } else {
      addGenericServiceRate({
        id: `sr-${Date.now()}`,
        serviceName: form.serviceName,
        servicePrice: Number(form.servicePrice) || 0,
        productPrice: Number(form.productPrice) || 0,
        pmValue: Number(form.pmValue) || 0,
        partnerPayment: Number(form.partnerPayment) || 0,
        validFrom: form.validFrom || new Date().toISOString().split('T')[0],
      } as ServiceRate)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({
      serviceName: '',
      servicePrice: 0,
      productPrice: 0,
      pmValue: 0,
      partnerPayment: 0,
      validFrom: '',
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteGenericServiceRate(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.service_pricing')}
          </h1>
          <p className="text-muted-foreground">
            Price catalog for generic services and products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm({
                  serviceName: '',
                  servicePrice: 0,
                  productPrice: 0,
                  pmValue: 0,
                  partnerPayment: 0,
                  validFrom: '',
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white">
                <Plus className="h-4 w-4" /> {t('common.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? t('common.edit') : t('common.add')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    value={form.serviceName}
                    onChange={(e) =>
                      setForm({ ...form, serviceName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cost Price</Label>
                    <Input
                      type="number"
                      value={form.servicePrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          servicePrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input
                      type="number"
                      value={form.productPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>{t('common.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((service) => (
                <TableRow key={service.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{service.serviceName}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>
                      {formatAppCurrency(service.servicePrice)}
                    </DataMask>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <DataMask>
                      {formatAppCurrency(service.productPrice)}
                    </DataMask>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingRecord(service)
                            setForm(service)
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(service.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />{' '}
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
