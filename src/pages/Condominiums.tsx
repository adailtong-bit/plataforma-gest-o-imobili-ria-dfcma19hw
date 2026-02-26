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
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Condominiums() {
  const {
    condominiums,
    addCondominium,
    updateCondominium,
    deleteCondominium,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    managerEmail: '',
  })

  const handleAdd = () => {
    addCondominium({
      id: `condo-${Date.now()}`,
      name: form.name || 'Novo Condomínio',
      address: form.address,
      city: form.city,
      managerEmail: form.managerEmail,
    })
    setIsAddOpen(false)
    setForm({ name: '', address: '', city: '', managerEmail: '' })
    toast({ title: 'Condomínio incluído com sucesso' })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateCondominium({ ...editingRecord, ...form })
    }
    setEditingRecord(null)
    toast({ title: 'Condomínio alterado com sucesso' })
  }

  const handleDelete = (id: string) => {
    deleteCondominium(id)
    toast({ title: 'Condomínio excluído com sucesso' })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.condominiums') || 'Condomínios'}
          </h1>
          <p className="text-muted-foreground">
            Manage your properties' condominiums.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> Incluir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incluir Condomínio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Endereço"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name') || 'Nome'}</TableHead>
                <TableHead>{t('common.address') || 'Endereço'}</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Manager Email</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condominiums.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {condo.name}
                  </TableCell>
                  <TableCell>{condo.address}</TableCell>
                  <TableCell>{condo.city}</TableCell>
                  <TableCell>{condo.managerEmail}</TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={editingRecord?.id === condo.id}
                      onOpenChange={(open) => !open && setEditingRecord(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRecord(condo)
                            setForm({
                              name: condo.name,
                              address: condo.address,
                              city: condo.city || '',
                              managerEmail: condo.managerEmail || '',
                            })
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alterar Condomínio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Input
                            placeholder="Nome"
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                          />
                          <Input
                            placeholder="Endereço"
                            value={form.address}
                            onChange={(e) =>
                              setForm({ ...form, address: e.target.value })
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleEdit}>Salvar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir Condomínio
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(condo.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {condominiums.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
    </div>
  )
}

