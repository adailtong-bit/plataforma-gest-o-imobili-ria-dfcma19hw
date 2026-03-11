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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { UserRole, Resource } from '@/lib/types'

const MODULES: { id: Resource; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'properties', label: 'Properties & Units' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'condominiums', label: 'Condominiums' },
  { id: 'owners', label: 'Owners' },
  { id: 'tenants', label: 'Tenants' },
  { id: 'partners', label: 'Partners' },
  { id: 'tasks', label: 'Tasks & Maintenance' },
  { id: 'financial', label: 'Financial' },
  { id: 'reports', label: 'Reports' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'short_term', label: 'Short Term' },
  { id: 'messages', label: 'Messages' },
  { id: 'performance', label: 'Performance' },
  { id: 'guest_services', label: 'Guest Services' },
  { id: 'pos', label: 'POS' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'renewals', label: 'Renewals' },
]

export default function Users() {
  const { users, addUser, updateUser, deleteUser, currentUser } =
    useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', role: '' })
  const [selectedModules, setSelectedModules] = useState<string[]>([])

  const availableRoles =
    currentUser?.role === 'platform_owner'
      ? ['platform_owner', 'software_tenant', 'internal_user']
      : ['internal_user']

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      role: currentUser?.role === 'platform_owner' ? '' : 'internal_user',
    })
    setSelectedModules([])
    setEditingRecord(null)
  }

  const handleAdd = () => {
    if (!form.name || !form.email || !form.role) {
      toast({ title: 'Validation Error', variant: 'destructive' })
      return
    }

    const permissions =
      form.role === 'internal_user'
        ? selectedModules.map((m) => ({
            resource: m as Resource,
            actions: ['view', 'create', 'edit', 'delete'] as any[],
          }))
        : undefined

    // Assign organization ID. If platform owner creates a PM, generate a new one. Otherwise, inherit.
    const newOrgId =
      form.role === 'software_tenant'
        ? `org_${Date.now()}`
        : currentUser?.role !== 'platform_owner'
          ? (currentUser as any).organizationId
          : undefined

    addUser({
      id: `user-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role as UserRole,
      status: 'active',
      isFirstLogin: false,
      permissions,
      organizationId: newOrgId,
    })
    setIsAddOpen(false)
    resetForm()
    toast({ title: 'Usuário incluído com sucesso' })
  }

  const handleEdit = () => {
    if (editingRecord) {
      const permissions =
        form.role === 'internal_user'
          ? selectedModules.map((m) => ({
              resource: m as Resource,
              actions: ['view', 'create', 'edit', 'delete'] as any[],
            }))
          : editingRecord.permissions

      updateUser({
        ...editingRecord,
        name: form.name,
        email: form.email,
        role: form.role || editingRecord.role,
        permissions,
      })
    }
    setEditingRecord(null)
    setIsAddOpen(false)
    toast({ title: 'Usuário alterado com sucesso' })
  }

  const handleDelete = (id: string) => {
    deleteUser(id)
    toast({ title: 'Usuário excluído com sucesso' })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.users') || 'Usuários'}
          </h1>
          <p className="text-muted-foreground">
            Manage your team members and their access permissions.
          </p>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(v) => {
            setIsAddOpen(v)
            if (!v) resetForm()
            else if (currentUser?.role !== 'platform_owner') {
              setForm({ ...form, role: 'internal_user' })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> Incluir
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Alterar Usuário' : 'Incluir Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Nome</Label>
                <Input
                  placeholder="Nome do usuário"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Função (Role)</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`roles.${r}`) || r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.role === 'internal_user' && (
                <div className="space-y-2 col-span-2 mt-4">
                  <Label className="text-base font-bold">
                    Permissões de Acesso (Módulos)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecione quais abas este membro da equipe poderá acessar e
                    gerenciar.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 border rounded-md p-4 bg-slate-50 shadow-inner">
                    {MODULES.map((mod) => (
                      <div key={mod.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mod-${mod.id}`}
                          checked={selectedModules.includes(mod.id)}
                          onCheckedChange={(checked) => {
                            if (checked)
                              setSelectedModules([...selectedModules, mod.id])
                            else
                              setSelectedModules(
                                selectedModules.filter((id) => id !== mod.id),
                              )
                          }}
                        />
                        <Label
                          htmlFor={`mod-${mod.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {mod.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={editingRecord ? handleEdit : handleAdd}>
                Salvar
              </Button>
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>{t('common.status') || 'Status'}</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{user.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{user.email}</DataMask>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`roles.${user.role}`) || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRecord(user)
                          setForm({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                          })
                          setSelectedModules(
                            user.permissions?.map((p) => p.resource) || [],
                          )
                          setIsAddOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Alterar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
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
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
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
