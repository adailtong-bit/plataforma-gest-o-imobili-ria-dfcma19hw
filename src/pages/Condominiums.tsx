import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
  Pencil,
  Trash2,
} from 'lucide-react'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Condominiums() {
  const { condominiums, addCondominium, updateCondominium, deleteCondominium } =
    useCondominiumStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
  })

  const filteredCondos = condominiums.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.address.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleSave = () => {
    if (!formData.name || !formData.address) {
      toast({
        title: t('common.error'),
        description: 'Nome e Endereço são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      updateCondominium({
        id: editingId,
        ...formData,
      })
      toast({ title: 'Condomínio atualizado com sucesso' })
    } else {
      addCondominium({
        id: `condo-${Date.now()}`,
        ...formData,
      })
      toast({ title: 'Condomínio adicionado com sucesso' })
    }
    setOpen(false)
    resetForm()
  }

  const handleEdit = (condo: any) => {
    setEditingId(condo.id)
    setFormData({
      name: condo.name,
      address: condo.address,
      managerName: condo.managerName || '',
      managerPhone: condo.managerPhone || '',
      managerEmail: condo.managerEmail || '',
    })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('common.delete_desc'))) {
      deleteCondominium(id)
      toast({ title: 'Condomínio excluído' })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      address: '',
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
              <DialogTitle>
                {editingId
                  ? t('condominiums.edit_title')
                  : t('condominiums.add_title')}
              </DialogTitle>
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
                <Label>{t('common.address')}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
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
                  <Input
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
              <Button onClick={handleSave} className="w-full">
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
                placeholder={t('common.search')}
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
                  <TableCell colSpan={5} className="text-center py-8">
                    {t('condominiums.no_condos')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCondos.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {condo.name}
                    </TableCell>
                    <TableCell>{condo.address}</TableCell>
                    <TableCell>{condo.managerName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>{condo.managerEmail}</span>
                        <span className="text-muted-foreground">
                          {condo.managerPhone}
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
                          <DropdownMenuItem onClick={() => handleEdit(condo)}>
                            <Pencil className="mr-2 h-4 w-4" />{' '}
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(condo.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />{' '}
                            {t('common.delete')}
                          </DropdownMenuItem>
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
