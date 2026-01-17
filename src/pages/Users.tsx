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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Plus, Trash2, Edit } from 'lucide-react'
import useUserStore from '@/stores/useUserStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User, Resource, Action, UserRole } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

const RESOURCES: Resource[] = [
  'dashboard',
  'properties',
  'condominiums',
  'financial',
  'users',
  'settings',
  'tasks',
  'calendar',
]
const ACTIONS: Action[] = ['view', 'create', 'edit', 'delete']

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useUserStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const initialFormState: Partial<User> = {
    name: '',
    email: '',
    role: 'internal_user',
    permissions: [],
    allowedProfileTypes: ['long_term', 'short_term'],
  }

  const [formData, setFormData] = useState<Partial<User>>(initialFormState)
  const [isEditing, setIsEditing] = useState(false)

  // Determine allowed roles to create based on hierarchy
  const canCreateRole = (role: UserRole) => {
    if (currentUser.role === 'platform_owner') return true
    if (currentUser.role === 'software_tenant') return role === 'internal_user'
    return false
  }

  // Filter users based on hierarchy
  const filteredUsers = users.filter((u) => {
    if (currentUser.role === 'platform_owner') return true
    if (currentUser.role === 'software_tenant')
      return u.parentId === currentUser.id
    return false
  })

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Erro',
        description: 'Nome e Email são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    if (isEditing && formData.id) {
      updateUser(formData as User)
      toast({ title: 'Sucesso', description: 'Usuário atualizado.' })
    } else {
      addUser({
        ...formData,
        id: `user-${Date.now()}`,
        parentId: currentUser.id,
      } as User)
      toast({ title: 'Sucesso', description: 'Usuário criado.' })
    }
    setOpen(false)
    setFormData(initialFormState)
    setIsEditing(false)
  }

  const handleDelete = (id: string) => {
    deleteUser(id)
    toast({ title: 'Sucesso', description: 'Usuário excluído.' })
  }

  const handlePermissionChange = (
    resource: Resource,
    action: Action,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const perms = prev.permissions || []
      let resourcePerm = perms.find((p) => p.resource === resource)

      if (!resourcePerm) {
        resourcePerm = { resource, actions: [] }
        perms.push(resourcePerm)
      }

      if (checked) {
        if (!resourcePerm.actions.includes(action))
          resourcePerm.actions.push(action)
      } else {
        resourcePerm.actions = resourcePerm.actions.filter((a) => a !== action)
      }

      return { ...prev, permissions: [...perms] }
    })
  }

  const openEdit = (user: User) => {
    setFormData({ ...user })
    setIsEditing(true)
    setOpen(true)
  }

  if (!hasPermission(currentUser as User, 'users', 'view')) {
    return <div className="p-8 text-center">Acesso negado.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground">Gerencie acesso e permissões.</p>
        </div>

        {hasPermission(currentUser as User, 'users', 'create') && (
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val)
              if (!val) {
                setFormData(initialFormState)
                setIsEditing(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue">
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nome</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Função (Role)</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val: UserRole) =>
                      setFormData({ ...formData, role: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {canCreateRole('software_tenant') && (
                        <SelectItem value="software_tenant">
                          Locador (Tenant)
                        </SelectItem>
                      )}
                      <SelectItem value="internal_user">
                        Usuário Interno
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'internal_user' && (
                  <>
                    <div className="border rounded-md p-4 bg-muted/20">
                      <h4 className="font-medium mb-3">Permissões (Skills)</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Recurso</TableHead>
                            <TableHead className="text-center">Ver</TableHead>
                            <TableHead className="text-center">Criar</TableHead>
                            <TableHead className="text-center">
                              Editar
                            </TableHead>
                            <TableHead className="text-center">
                              Excluir
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {RESOURCES.map((res) => (
                            <TableRow key={res}>
                              <TableCell className="capitalize">
                                {res}
                              </TableCell>
                              {ACTIONS.map((action) => {
                                const checked =
                                  formData.permissions
                                    ?.find((p) => p.resource === res)
                                    ?.actions.includes(action) || false
                                return (
                                  <TableCell
                                    key={action}
                                    className="text-center"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(c) =>
                                        handlePermissionChange(
                                          res,
                                          action,
                                          c as boolean,
                                        )
                                      }
                                    />
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="border rounded-md p-4 bg-muted/20">
                      <h4 className="font-medium mb-2">
                        Acesso a Propriedades
                      </h4>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="long_term"
                            checked={formData.allowedProfileTypes?.includes(
                              'long_term',
                            )}
                            onCheckedChange={(c) => {
                              const types = formData.allowedProfileTypes || []
                              if (c) {
                                if (!types.includes('long_term'))
                                  setFormData({
                                    ...formData,
                                    allowedProfileTypes: [
                                      ...types,
                                      'long_term',
                                    ],
                                  })
                              } else {
                                setFormData({
                                  ...formData,
                                  allowedProfileTypes: types.filter(
                                    (t) => t !== 'long_term',
                                  ),
                                })
                              }
                            }}
                          />
                          <Label htmlFor="long_term">Long Term</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="short_term"
                            checked={formData.allowedProfileTypes?.includes(
                              'short_term',
                            )}
                            onCheckedChange={(c) => {
                              const types = formData.allowedProfileTypes || []
                              if (c) {
                                if (!types.includes('short_term'))
                                  setFormData({
                                    ...formData,
                                    allowedProfileTypes: [
                                      ...types,
                                      'short_term',
                                    ],
                                  })
                              } else {
                                setFormData({
                                  ...formData,
                                  allowedProfileTypes: types.filter(
                                    (t) => t !== 'short_term',
                                  ),
                                })
                              }
                            }}
                          />
                          <Label htmlFor="short_term">Short Term</Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">
                    {t(`roles.${user.role}`)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission(currentUser as User, 'users', 'edit') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission(
                        currentUser as User,
                        'users',
                        'delete',
                      ) && (
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
                                Confirmação de Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário{' '}
                                {user.name}? Esta ação não pode ser desfeita.
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
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
