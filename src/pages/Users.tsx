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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
  Unlock,
  ShieldCheck,
  UserCog,
  Briefcase,
  Users as UsersIcon,
  User as UserIcon,
  Building,
} from 'lucide-react'
import useUserStore from '@/stores/useUserStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User, Resource, Action, UserRole, Permission } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { isValidEmail } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const RESOURCES: Resource[] = [
  'dashboard',
  'properties',
  'short_term',
  'renewals',
  'market_analysis',
  'condominiums',
  'tenants',
  'owners',
  'partners',
  'calendar',
  'tasks',
  'workflows',
  'financial',
  'messages',
  'users',
  'settings',
]
const ACTIONS: Action[] = ['view', 'create', 'edit', 'delete']

export default function Users() {
  const { users, addUser, updateUser, deleteUser, approveUser, blockUser } =
    useUserStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  // Dialog States
  const [open, setOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [userToBlock, setUserToBlock] = useState<string | null>(null)

  const initialFormState: Partial<User> & {
    password?: string
    confirmPassword?: string
    mirrorAdmin?: boolean
  } = {
    name: '',
    email: '',
    phone: '',
    role: 'internal_user',
    permissions: [],
    allowedProfileTypes: ['long_term', 'short_term'],
    password: '',
    confirmPassword: '',
    status: 'active',
    mirrorAdmin: false,
    companyName: '',
    taxId: '',
    address: '',
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isEditing, setIsEditing] = useState(false)

  const canCreateRole = (role: UserRole) => {
    // Platform Owner can create Tenants and Internal Users
    if (currentUser.role === 'platform_owner')
      return ['software_tenant', 'internal_user'].includes(role)
    // Tenants (PMs) can create Internal Users, Partners and Owners
    if (currentUser.role === 'software_tenant')
      return ['internal_user', 'partner', 'property_owner'].includes(role)
    // Partners can create Partner Employees
    if (currentUser.role === 'partner') return role === 'partner_employee'
    return false
  }

  const filteredUsers = users.filter((u) => {
    if (currentUser.role === 'platform_owner') return true
    if (currentUser.role === 'software_tenant')
      return u.parentId === currentUser.id
    if (currentUser.role === 'partner') return u.parentId === currentUser.id
    return false
  })

  const handleSave = () => {
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
    const { password, confirmPassword, mirrorAdmin, ...userData } = formData

    // Handle Mirror Admin Logic
    let finalPermissions = userData.permissions
    if (mirrorAdmin) {
      finalPermissions = RESOURCES.map((res) => ({
        resource: res,
        actions: [...ACTIONS],
      }))
    }

    const finalUserData = {
      ...userData,
      permissions: finalPermissions,
    }

    if (isEditing && formData.id) {
      updateUser(finalUserData as User)
      toast({ title: 'Sucesso', description: 'Usuário atualizado.' })
    } else {
      addUser({
        ...finalUserData,
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
    toast({ title: 'Ativado', description: 'Acesso concedido ao usuário.' })
  }

  const initiateBlock = (id: string) => {
    setUserToBlock(id)
    setBlockDialogOpen(true)
  }

  const confirmBlock = () => {
    if (userToBlock) {
      blockUser(userToBlock)
      toast({
        title: 'Bloqueado',
        description: 'Acesso do usuário foi revogado.',
        variant: 'destructive',
      })
    }
    setBlockDialogOpen(false)
    setUserToBlock(null)
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
        // Create new permission entry if it doesn't exist
        resourcePerm = { resource, actions: [] }
        perms.push(resourcePerm)
      } else {
        // Create a copy to avoid mutation
        const index = perms.indexOf(resourcePerm)
        resourcePerm = { ...resourcePerm, actions: [...resourcePerm.actions] }
        perms[index] = resourcePerm
      }

      if (checked) {
        if (!resourcePerm.actions.includes(action))
          resourcePerm.actions.push(action)
      } else {
        resourcePerm.actions = resourcePerm.actions.filter((a) => a !== action)
      }

      // If no actions left, we can remove the permission object or keep it empty
      // Keeping it empty is fine

      // Disable Mirror Admin if custom changes are made
      return { ...prev, permissions: [...perms], mirrorAdmin: false }
    })
  }

  const toggleMirrorAdmin = (checked: boolean) => {
    if (checked) {
      // Set all permissions
      const allPerms: Permission[] = RESOURCES.map((res) => ({
        resource: res,
        actions: [...ACTIONS],
      }))
      setFormData((prev) => ({
        ...prev,
        mirrorAdmin: true,
        permissions: allPerms,
      }))
    } else {
      // Clear or keep? Better to clear to allow custom
      setFormData((prev) => ({ ...prev, mirrorAdmin: false, permissions: [] }))
    }
  }

  const openEdit = (user: User) => {
    setFormData({
      ...user,
      password: '',
      confirmPassword: '',
      mirrorAdmin: false,
    }) // Reset password fields and mirror flag on edit
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
      case 'blocked':
        return <Badge variant="destructive">{t('common.blocked')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'software_tenant':
        return <Building className="h-4 w-4" />
      case 'internal_user':
        return <UserCog className="h-4 w-4" />
      case 'partner':
        return <Briefcase className="h-4 w-4" />
      case 'property_owner':
        return <UserIcon className="h-4 w-4" />
      case 'partner_employee':
        return <UsersIcon className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  // Permission Check
  if (
    !hasPermission(currentUser as User, 'users', 'view') &&
    currentUser.role !== 'partner' // Allow partners to view their employees
  ) {
    return <div className="p-8 text-center">Acesso negado.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie acesso, funções e permissões do sistema.
          </p>
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
                  Compartilhe o link abaixo para permitir que novos usuários se
                  cadastrem.
                </p>
                <div className="flex gap-2">
                  <Input readOnly value={`${window.location.origin}/signup`} />
                  <Button size="icon" onClick={copyInviteLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {(hasPermission(currentUser as User, 'users', 'create') ||
            currentUser.role === 'partner') && (
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do usuário e defina suas permissões de
                    acesso.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {/* Basic Info */}
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
                        placeholder="Nome completo"
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
                        placeholder="email@exemplo.com"
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
                        disabled={isEditing} // Prevent role change on edit to avoid permission mismatch issues for now
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {canCreateRole('software_tenant') && (
                            <SelectItem value="software_tenant">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" /> Locador
                                (Cliente)
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('internal_user') && (
                            <SelectItem value="internal_user">
                              <div className="flex items-center gap-2">
                                <UserCog className="h-4 w-4" /> Internal / Staff
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('property_owner') && (
                            <SelectItem value="property_owner">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" /> Proprietário
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('partner') && (
                            <SelectItem value="partner">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Parceiro
                                (Fornecedor)
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('partner_employee') && (
                            <SelectItem value="partner_employee">
                              <div className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4" /> Equipe (Staff)
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Info for Owners/Partners */}
                  {(formData.role === 'partner' ||
                    formData.role === 'property_owner') && (
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div className="grid gap-2">
                        <Label>{t('common.tax_id')}</Label>
                        <Input
                          value={formData.taxId || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, taxId: e.target.value })
                          }
                          placeholder="CPF/CNPJ/SSN"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('common.address')}</Label>
                        <Input
                          value={formData.address || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          placeholder="Endereço completo"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Section */}
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

                  {/* Permissions Section - Only for Staff roles */}
                  {(formData.role === 'internal_user' ||
                    formData.role === 'partner_employee') && (
                    <div className="border rounded-md mt-2">
                      <div className="p-4 bg-muted/20 border-b flex justify-between items-center">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Permissões de Acesso
                          (Skills)
                        </h4>
                        {formData.role === 'internal_user' && (
                          <div className="flex items-center gap-2">
                            <Switch
                              id="mirror-admin"
                              checked={formData.mirrorAdmin}
                              onCheckedChange={toggleMirrorAdmin}
                            />
                            <Label
                              htmlFor="mirror-admin"
                              className="flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="h-4 w-4 text-trust-blue" />
                              Admin Total (Mirror PM)
                            </Label>
                          </div>
                        )}
                      </div>
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Módulo / Recurso</TableHead>
                              <TableHead className="text-center w-[80px]">
                                Ver
                              </TableHead>
                              <TableHead className="text-center w-[80px]">
                                Criar
                              </TableHead>
                              <TableHead className="text-center w-[80px]">
                                Editar
                              </TableHead>
                              <TableHead className="text-center w-[80px]">
                                Excluir
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {RESOURCES.map((res) => (
                              <TableRow key={res}>
                                <TableCell className="capitalize font-medium">
                                  {t(`common.${res}`) !== `common.${res}`
                                    ? t(`common.${res}`)
                                    : res.replace('_', ' ')}
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
                                        disabled={formData.mirrorAdmin} // Disable explicit selection if Mirror Admin is on
                                      />
                                    </TableCell>
                                  )
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleSave}
                    className="bg-trust-blue w-full sm:w-auto"
                  >
                    {t('common.save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tenants.list_title')}</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuários cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">
                          {t(`roles.${user.role}`)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Approval / Reactivation */}
                        {(user.status === 'pending_approval' ||
                          user.status === 'blocked') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8"
                            onClick={() => handleApprove(user.id)}
                            title={
                              user.status === 'blocked'
                                ? 'Reativar Usuário'
                                : t('common.approve')
                            }
                          >
                            {user.status === 'blocked' ? (
                              <Unlock className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {user.status === 'blocked' ? 'Reativar' : 'Aprovar'}
                          </Button>
                        )}

                        {/* Blocking */}
                        {user.status === 'active' &&
                          currentUser.id !== user.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => initiateBlock(user.id)}
                              title={t('common.block')}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}

                        {/* Editing */}
                        {(hasPermission(currentUser as User, 'users', 'edit') ||
                          currentUser.role === 'partner') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Deleting */}
                        {(hasPermission(
                          currentUser as User,
                          'users',
                          'delete',
                        ) ||
                          currentUser.role === 'partner') &&
                          currentUser.id !== user.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
                                    className="bg-red-600 hover:bg-red-700"
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

      {/* Block Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" /> Bloquear Acesso
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja bloquear este usuário? Ele perderá acesso
              imediato ao sistema. Você poderá reativá-lo posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlockDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlock}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Bloqueio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
