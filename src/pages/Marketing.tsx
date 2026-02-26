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

export default function Marketing() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } =
    useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    targetAudience: '',
    startDate: '',
  })

  const handleAdd = () => {
    addCampaign({
      id: `camp-${Date.now()}`,
      name: form.name || 'Nova Campanha',
      targetAudience: (form.targetAudience as any) || 'all',
      startDate: form.startDate || new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'active',
      promotions: [],
    })
    setIsAddOpen(false)
    setForm({ name: '', targetAudience: '', startDate: '' })
    toast({ title: 'Campanha incluída com sucesso' })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateCampaign({
        ...editingRecord,
        name: form.name,
        targetAudience: form.targetAudience || editingRecord.targetAudience,
        startDate: form.startDate,
      })
    }
    setEditingRecord(null)
    toast({ title: 'Campanha alterada com sucesso' })
  }

  const handleDelete = (id: string) => {
    deleteCampaign(id)
    toast({ title: 'Campanha excluída com sucesso' })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.marketing')}
          </h1>
          <p className="text-muted-foreground">Manage marketing campaigns.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> Incluir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incluir Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome da Campanha"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Público Alvo"
                value={form.targetAudience}
                onChange={(e) =>
                  setForm({ ...form, targetAudience: e.target.value })
                }
              />
              <Input
                type="date"
                placeholder="Data de Início"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
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
                <TableHead>Campaign Name</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((camp) => (
                <TableRow key={camp.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {camp.name}
                  </TableCell>
                  <TableCell className="capitalize">
                    {camp.targetAudience}
                  </TableCell>
                  <TableCell>{camp.startDate}</TableCell>
                  <TableCell>{camp.endDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        camp.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {camp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingRecord?.id === camp.id}
                        onOpenChange={(open) => !open && setEditingRecord(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRecord(camp)
                              setForm({
                                name: camp.name,
                                targetAudience: camp.targetAudience || '',
                                startDate: camp.startDate,
                              })
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Alterar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Alterar Campanha</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              placeholder="Nome da Campanha"
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                            />
                            <Input
                              placeholder="Público Alvo"
                              value={form.targetAudience}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  targetAudience: e.target.value,
                                })
                              }
                            />
                            <Input
                              type="date"
                              placeholder="Data de Início"
                              value={form.startDate}
                              onChange={(e) =>
                                setForm({ ...form, startDate: e.target.value })
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
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir Campanha
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(camp.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
