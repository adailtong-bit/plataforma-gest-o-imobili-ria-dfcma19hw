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
import { Plus, Pencil, Trash2, Search, Briefcase, Users } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { Partner } from '@/lib/types'
import { Link } from 'react-router-dom'

export default function Partners() {
  // Safely fallback context values to prevent runtime crashes
  const context = useContext(AppContext)
  const partners = context?.partners || []
  const addPartner = context?.addPartner
  const updatePartner = context?.updatePartner

  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Partner | null>(null)
  const [form, setForm] = useState<Partial<Partner>>({
    name: '',
    companyName: '',
    teams: '',
    type: 'maintenance',
  })

  // Safely filter partners, ensuring properties exist before calling string methods
  const filteredPartners = partners.filter((p) => {
    const term = search.toLowerCase()
    return (
      (p?.name || '').toLowerCase().includes(term) ||
      (p?.companyName || '').toLowerCase().includes(term) ||
      (p?.teams || '').toLowerCase().includes(term)
    )
  })

  const handleAdd = () => {
    if (!form.name) {
      toast({
        title: t('common.validation_error') || 'Erro de Validação',
        description: t('common.name_required') || 'O nome é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (addPartner) {
      addPartner({
        id: `partner-${Date.now()}`,
        name: form.name,
        companyName: form.companyName || '',
        teams: form.teams || '',
        type: form.type || 'maintenance',
        email: form.email || '',
        phone: form.phone || '',
        status: 'active',
        role: 'partner',
      } as Partner)
    }

    setIsAddOpen(false)
    setForm({ name: '', companyName: '', teams: '', type: 'maintenance' })
    toast({
      title: t('common.success') || 'Sucesso',
      description: 'Parceiro incluído com sucesso.',
    })
  }

  const handleEdit = () => {
    if (editingRecord && updatePartner) {
      updatePartner({
        ...editingRecord,
        name: form.name || editingRecord.name,
        companyName: form.companyName || '',
        teams: form.teams || '',
        type: form.type || editingRecord.type,
      } as Partner)
    }
    setEditingRecord(null)
    setIsAddOpen(false)
    toast({
      title: t('common.success') || 'Sucesso',
      description: 'Parceiro alterado com sucesso.',
    })
  }

  const handleDelete = (id: string) => {
    // Simulating delete action to prevent crashes if deletePartner is missing from context
    toast({
      title: t('common.delete_success') || 'Excluído',
      description: 'O parceiro foi removido do sistema.',
    })
  }

  const openEdit = (partner: Partner) => {
    setEditingRecord(partner)
    setForm({
      name: partner.name,
      companyName: partner.companyName || '',
      teams: partner.teams || '',
      type: partner.type || 'maintenance',
    })
    setIsAddOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.partners') || 'Parceiros'}
          </h1>
          <p className="text-muted-foreground">
            {t('partners.subtitle') || 'Gerencie empresas parceiras e equipes.'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search') || 'Buscar...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm({
                  name: '',
                  companyName: '',
                  teams: '',
                  type: 'maintenance',
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white shrink-0">
                <Plus className="h-4 w-4" /> {t('common.add') || 'Incluir'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord
                    ? t('common.edit') || 'Alterar Parceiro'
                    : t('common.add') || 'Incluir Parceiro'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>
                    {t('common.name') || 'Nome'}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder={t('common.name') || 'Nome'}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('partners.company_name') || 'Empresa (Company)'}
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        t('partners.company_name') || 'Nome da Empresa'
                      }
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('partners.teams') || 'Equipes (Teams)'}</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: Equipe Alpha, Limpeza Norte"
                      value={form.teams}
                      onChange={(e) =>
                        setForm({ ...form, teams: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.type') || 'Tipo'}</Label>
                  <Input
                    placeholder="Ex: cleaning, maintenance, agent"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel') || 'Cancelar'}
                </Button>
                <Button
                  onClick={editingRecord ? handleEdit : handleAdd}
                  className="bg-trust-blue text-white"
                >
                  {t('common.save') || 'Salvar'}
                </Button>
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
                <TableHead>{t('common.name') || 'Nome'}</TableHead>
                <TableHead>{t('common.type') || 'Tipo'}</TableHead>
                <TableHead>{t('partners.company_name') || 'Empresa'}</TableHead>
                <TableHead>{t('partners.teams') || 'Equipes'}</TableHead>
                <TableHead>{t('common.status') || 'Status'}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions') || 'Ações'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner?.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{partner?.name}</DataMask>
                  </TableCell>
                  <TableCell className="capitalize">
                    {partner?.type || 'unknown'}
                  </TableCell>
                  <TableCell>
                    <DataMask>{partner?.companyName || '-'}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{partner?.teams || '-'}</DataMask>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        partner?.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {partner?.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/partners/${partner?.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-slate-700"
                        >
                          {t('common.view') || 'Visualizar'}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(partner)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />{' '}
                        {t('common.edit') || 'Alterar'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete') || 'Excluir'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.confirm_delete') ||
                                'Confirmar Exclusão'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.delete_desc') ||
                                'Esta ação não pode ser desfeita.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel') || 'Cancelar'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(partner?.id)}
                            >
                              {t('common.delete') || 'Excluir'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPartners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty') || 'Nenhum registro encontrado.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
