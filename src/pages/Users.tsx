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
import { Badge } from '@/components/ui/badge'
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
import {
  Plus,
  Trash2,
  Edit,
  Shield,
  Share2,
  Copy,
  CheckCircle2,
  Ban,
} from 'lucide-react'
import useUserStore from '@/stores/useUserStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User, Resource, Action, UserRole } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { isValidEmail } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'

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
  const { users, addUser, updateUser, deleteUser, approveUser, blockUser } =
    useUserStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const initialFormState: Partial<User> & {
    password?: string
    confirmPassword?: string
  } = {
    name: '',
    email: '',
    phone: '',
    role: 'internal_user',
    permissions: [],
    allowedProfileTypes: ['long_term', 'short_term'],
    password: '',
    confirmPassword: '',
    status: 'pending_approval',
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isEditing, setIsEditing] = useState(false)

  const canCreateRole = (role: UserRole) => {
    if (currentUser.role === 'platform_owner')
      return ['software_tenant', 'internal_user'].includes(role)
    if (currentUser.role === 'software_tenant') return role === 'internal_user'
    return false
  }

  const filteredUsers = users.filter((u) => {
    if (currentUser.role === 'platform_owner') return true
    if (currentUser.role === 'software_tenant')
      return u.parentId === currentUser.id
    return false
  })

  const handleSave = () => {
    // Strict Validation
    if (!formData.name?.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.email?.trim() || !isValidEmail(formData.email)) {
      toast({
        title: 'Erro',
        description: 'Email inválido.',
        variant: 'destructive',
      })
      return
    }

    // Check for duplicate email (except self)
    const duplicate = users.find(
      (u) =>
        u.email.toLowerCase() === formData.email?.toLowerCase() &&
        u.id !== formData.id,
    )
    if (duplicate) {
      toast({
        title: 'Erro',
        description: 'Este email já está em uso.',
        variant: 'destructive',
      })
      return
    }

    if (!isEditing && !formData.password) {
      toast({
        title: t('common.error'),
        description: 'Senha é obrigatória para novos usuários',
        variant: 'destructive',
      })
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: 'As senhas não coincidem',
        variant: 'destructive',
      })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, confirmPassword, ...userData } = formData

    if (isEditing && formData.id) {
      updateUser(userData as User)
      toast({ title: 'Sucesso', description: 'Usuário atualizado.' })
    } else {
      addUser({
        ...userData,
        id: `user-${Date.now()}`,
        parentId: currentUser.id,
        status:
          currentUser.role === 'platform_owner' ? 'active' : 'pending_approval',
        isFirstLogin: true,
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

  const handleApprove = (id: string) => {
    approveUser(id)
    toast({ title: 'Aprovado', description: 'Acesso concedido ao usuário.' })
  }

  const handleBlock = (id: string) => {
    blockUser(id)
    toast({
      title: 'Bloqueado',
      description: 'Acesso do usuário foi revogado.',
      variant: 'destructive',
    })
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
    setFormData({ ...user, password: '', confirmPassword: '' })
    setIsEditing(true)
    setOpen(true)
  }

  const copyInviteLink = () => {
    const url = window.location.origin
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link Copiado',
      description: 'O link de acesso foi copiado para a área de transferência.',
    })
    setInviteOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            {t('common.active')}
          </Badge>
        )
      case 'pending_approval':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            {t('common.pending_approval')}
          </Badge>
        )
      case 'pending_activation':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            {t('common.pending_activation')}
          </Badge>
        )
      case 'blocked':
        return <Badge variant="destructive">{t('common.blocked')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

        <div className="flex gap-2">
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" /> Convidar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartilhar Acesso</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Compartilhe o link abaixo para permitir que testadores
                  externos acessem a plataforma.
                </p>
                <div className="flex gap-2">
                  <Input readOnly value={window.location.origin} />
                  <Button size="icon" onClick={copyInviteLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                  <Plus className="mr-2 h-4 w-4" /> {t('common.new')} Usuário
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
                      <Label>
                        {t('common.name')}{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>
                        {t('common.email')}{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        type="email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('common.phone')}</Label>
                      <PhoneInput
                        value={formData.phone || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>
                        Função (Role) <span className="text-red-500">*</span>
                      </Label>
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
                              Locador (Cliente)
                            </SelectItem>
                          )}
                          <SelectItem value="internal_user">
                            Usuário Interno
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="grid gap-2">
                      <Label>
                        {t('common.password')}{' '}
                        {!isEditing && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder={isEditing ? '••••••' : ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>
                        {t('common.confirm_password')}{' '}
                        {!isEditing && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {formData.role === 'internal_user' && (
                    <>
                      <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Permissões (Skills)
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Recurso</TableHead>
                              <TableHead className="text-center">Ver</TableHead>
                              <TableHead className="text-center">
                                Criar
                              </TableHead>
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
                                  {t(`common.${res}`) !== `common.${res}`
                                    ? t(`common.${res}`)
                                    : res}
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
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button onClick={handleSave}>{t('common.save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tenants.list_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {t(`roles.${user.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {currentUser.role === 'platform_owner' && (
                          <>
                            {user.status === 'pending_approval' && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(user.id)}
                                title={t('common.approve')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {user.status !== 'blocked' && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                onClick={() => handleBlock(user.id)}
                                title={t('common.block')}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}

                        {hasPermission(
                          currentUser as User,
                          'users',
                          'edit',
                        ) && (
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
                                  onClick={() => handleDelete(user.id)}
                                >
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
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
