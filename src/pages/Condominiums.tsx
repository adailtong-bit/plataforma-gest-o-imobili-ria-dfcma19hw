import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
} from 'lucide-react'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useNavigate } from 'react-router-dom'
import { PhoneInput } from '@/components/ui/phone-input'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { isValidEmail } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'

export default function Condominiums() {
  const { condominiums, addCondominium, deleteCondominium } =
    useCondominiumStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    state: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
  })

  const filteredCondos = condominiums.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.address.toLowerCase().includes(filter.toLowerCase()) ||
      c.managerName?.toLowerCase().includes(filter.toLowerCase()) ||
      c.managerEmail?.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAddressSelect = (addr: AddressData) => {
    setFormData((prev) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
    }))
  }

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.address?.trim()) {
      toast({
        title: t('common.error'),
        description: 'Nome e Endereço são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    if (formData.managerEmail && !isValidEmail(formData.managerEmail)) {
      toast({
        title: t('common.error'),
        description: 'Email do gerente inválido',
        variant: 'destructive',
      })
      return
    }

    addCondominium({
      id: `condo-${Date.now()}`,
      ...formData,
      description: '',
    })
    toast({ title: 'Condomínio adicionado com sucesso' })
    setOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    try {
      deleteCondominium(id)
      toast({ title: 'Condomínio excluído' })
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description:
          error.message === 'error_linked_condo'
            ? t('common.delete_linked_error')
            : 'Erro ao excluir.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      zipCode: '',
      city: '',
      state: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('condominiums.title')}
          </h1>
          <p className="text-muted-foreground">{t('condominiums.subtitle')}</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('condominiums.new_condo')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('condominiums.add_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('common.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Sunny Isles HOA"
                />
              </div>
              <div className="grid gap-2">
                <Label>Buscar Endereço</Label>
                <AddressInput onAddressSelect={handleAddressSelect} />
              </div>
              <div className="grid gap-2">
                <Label>{t('common.address')}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>CEP / ZIP</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('condominiums.manager')}</Label>
                <Input
                  value={formData.managerName}
                  onChange={(e) =>
                    setFormData({ ...formData, managerName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('common.phone')}</Label>
                  <PhoneInput
                    value={formData.managerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, managerPhone: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.email')}</Label>
                  <Input
                    value={formData.managerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, managerEmail: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full bg-trust-blue">
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>{t('condominiums.title')}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, endereço, gerente..."
                className="pl-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.address')}</TableHead>
                <TableHead>{t('tasks.location')}</TableHead>
                <TableHead>{t('condominiums.manager')}</TableHead>
                <TableHead>{t('condominiums.contact')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCondos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t('condominiums.no_condos')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCondos.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <DataMask>{condo.name}</DataMask>
                    </TableCell>
                    <TableCell>
                      <DataMask>{condo.address}</DataMask>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span>
                          {condo.city || '-'}, {condo.state} {condo.zipCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DataMask>{condo.managerName || '-'}</DataMask>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>
                          <DataMask>{condo.managerEmail}</DataMask>
                        </span>
                        <span className="text-muted-foreground">
                          <DataMask>{condo.managerPhone}</DataMask>
                        </span>
                      </div>
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
                            onClick={() =>
                              navigate(`/condominiums/${condo.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" /> {t('common.view')}
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />{' '}
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('common.delete_title')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('common.delete_desc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(condo.id)}
                                >
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
