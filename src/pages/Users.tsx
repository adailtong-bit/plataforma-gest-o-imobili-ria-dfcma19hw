import { useState, useEffect } from 'react'
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
import usePartnerStore from '@/stores/usePartnerStore'
import { hasPermission } from '@/lib/permissions'
import { User, Resource, Action, UserRole, Permission } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { isValidEmail } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  const { partners } = usePartnerStore()
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
    parentPartnerId?: string
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
    parentPartnerId: '',
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isEditing, setIsEditing] = useState(false)

  // Default Permission Sets
  const getDefaultPermissions = (role: UserRole): Permission[] => {
    switch (role) {
      case 'partner_employee':
        return [
          { resource: 'tasks', actions: ['view', 'edit'] },
          { resource: 'portal', actions: ['view'] },
          { resource: 'messages', actions: ['view'] },
        ]
      case 'partner':
        return [
          { resource: 'tasks', actions: ['view', 'edit'] },
          { resource: 'financial', actions: ['view'] },
          { resource: 'portal', actions: ['view'] },
          { resource: 'messages', actions: ['view'] },
        ]
      case 'property_owner':
        return [
          { resource: 'properties', actions: ['view'] },
          { resource: 'financial', actions: ['view'] },
          { resource: 'portal', actions: ['view'] },
        ]
      default:
        return []
    }
  }

  useEffect(() => {
    // When role changes in creation mode, set default permissions
    if (!isEditing && formData.role) {
      const defaults = getDefaultPermissions(formData.role)
      if (defaults.length > 0) {
        setFormData((prev) => ({ ...prev, permissions: defaults }))
      }
    }
  }, [formData.role, isEditing])

  const canCreateRole = (role: UserRole) => {
    // Platform Owner can create Tenants and Internal Users
    if (currentUser.role === 'platform_owner')
      return [
        'software_tenant',
        'internal_user',
        'partner',
        'partner_employee',
      ].includes(role)
    // Tenants (PMs) can create Internal Users, Partners, Owners, Team Members
    if (currentUser.role === 'software_tenant')
      return [
        'internal_user',
        'partner',
        'property_owner',
        'partner_employee',
        'tenant',
      ].includes(role)
    // Partners can create Partner Employees
    if (currentUser.role === 'partner') return role === 'partner_employee'
    return false
  }

  const filteredUsers = users.filter((u) => {
    if (u.isDemo) return true // Always show demo users for visibility in this suite
    if (currentUser.role === 'platform_owner') return true
    if (currentUser.role === 'software_tenant')
      return u.parentId === currentUser.id || u.role === 'partner_employee' // PMs see their staff and partner teams
    if (currentUser.role === 'partner') return u.parentId === currentUser.id
    return false
  })

  // Sort: Demo users first, then by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isDemo && !b.isDemo) return -1
    if (!a.isDemo && b.isDemo) return 1
    return a.name.localeCompare(b.name)
  })

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({
        title: t('common.error'),
        description: 'Name is required.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.email?.trim() || !isValidEmail(formData.email)) {
      toast({
        title: t('common.error'),
        description: 'Invalid email.',
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
        title: t('common.error'),
        description: 'This email is already in use.',
        variant: 'destructive',
      })
      return
    }

    if (!isEditing && !formData.password) {
      toast({
        title: t('common.error'),
        description: 'Password is required for new users',
        variant: 'destructive',
      })
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password,
      confirmPassword,
      mirrorAdmin,
      parentPartnerId,
      ...userData
    } = formData

    // Handle Mirror Admin Logic
    let finalPermissions = userData.permissions
    if (mirrorAdmin) {
      finalPermissions = RESOURCES.map((res) => ({
        resource: res,
        actions: [...ACTIONS],
      }))
    }

    // Determine Parent ID
    let finalParentId = currentUser.id
    if (userData.role === 'partner_employee' && parentPartnerId) {
      finalParentId = parentPartnerId
    }

    const finalUserData = {
      ...userData,
      parentId: isEditing ? userData.parentId : finalParentId,
      permissions: finalPermissions,
    }

    if (isEditing && formData.id) {
      updateUser(finalUserData as User)
      toast({ title: t('common.save'), description: 'User updated.' })
    } else {
      addUser({
        ...finalUserData,
        id: `user-${Date.now()}`,
        status:
          currentUser.role === 'platform_owner' ? 'active' : 'pending_approval',
        isFirstLogin: true,
      } as User)
      toast({ title: t('common.save'), description: 'User created.' })
    }
    setOpen(false)
    setFormData(initialFormState)
    setIsEditing(false)
  }

  const handleDelete = (id: string) => {
    deleteUser(id)
    toast({ title: t('common.delete'), description: 'User deleted.' })
  }

  const handleApprove = (id: string) => {
    approveUser(id)
    toast({
      title: t('users.status_active'),
      description: t('users.approve_success'),
    })
  }

  const initiateBlock = (id: string) => {
    setUserToBlock(id)
    setBlockDialogOpen(true)
  }

  const confirmBlock = () => {
    if (userToBlock) {
      blockUser(userToBlock)
      toast({
        title: t('users.status_blocked'),
        description: t('users.block_success'),
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
        resourcePerm = { resource, actions: [] }
        perms.push(resourcePerm)
      } else {
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

      return { ...prev, permissions: [...perms], mirrorAdmin: false }
    })
  }

  const toggleMirrorAdmin = (checked: boolean) => {
    if (checked) {
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
      setFormData((prev) => ({ ...prev, mirrorAdmin: false, permissions: [] }))
    }
  }

  const openEdit = (user: User) => {
    setFormData({
      ...user,
      password: '',
      confirmPassword: '',
      mirrorAdmin: !!user.mirrorAdmin,
      parentPartnerId: user.parentId, // For display purposes if editing a partner employee
    })
    setIsEditing(true)
    setOpen(true)
  }

  const copyInviteLink = () => {
    const url = window.location.origin
    navigator.clipboard.writeText(url)
    toast({
      title: t('users.link_copied'),
      description: t('users.copy_success'),
    })
    setInviteOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            {t('users.status_active')}
          </Badge>
        )
      case 'pending_approval':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            {t('users.status_pending')}
          </Badge>
        )
      case 'blocked':
        return <Badge variant="destructive">{t('users.status_blocked')}</Badge>
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

  if (
    !hasPermission(currentUser as User, 'users', 'view') &&
    currentUser.role !== 'partner'
  ) {
    return <div className="p-8 text-center">Access denied.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('users.title')}
          </h1>
          <p className="text-muted-foreground">{t('users.subtitle')}</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" /> {t('users.invite')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('users.share_access')}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('users.share_desc')}
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
                  <Plus className="mr-2 h-4 w-4" /> {t('common.new')} User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? t('common.edit') : t('common.new')} User
                  </DialogTitle>
                  <DialogDescription>
                    Fill in user details and define access permissions.
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
                        placeholder={t('common.full_name')}
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
                        placeholder="email@example.com"
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
                        {t('users.role_label')}{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(val: UserRole) =>
                          setFormData({ ...formData, role: val })
                        }
                        disabled={isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {canCreateRole('software_tenant') && (
                            <SelectItem value="software_tenant">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" /> Landlord
                                (Manager)
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('internal_user') && (
                            <SelectItem value="internal_user">
                              <div className="flex items-center gap-2">
                                <UserCog className="h-4 w-4" /> Internal (Staff)
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('property_owner') && (
                            <SelectItem value="property_owner">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" /> Owner
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('partner') && (
                            <SelectItem value="partner">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Partner
                                (Company)
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('partner_employee') && (
                            <SelectItem value="partner_employee">
                              <div className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4" /> Team
                                (Technician)
                              </div>
                            </SelectItem>
                          )}
                          {canCreateRole('tenant') && (
                            <SelectItem value="tenant">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" /> Tenant
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Partner Link for Employees */}
                  {formData.role === 'partner_employee' &&
                    !isEditing &&
                    (currentUser.role === 'software_tenant' ||
                      currentUser.role === 'platform_owner') && (
                      <div className="grid gap-2">
                        <Label>Partner Company (Employer)</Label>
                        <Select
                          value={formData.parentPartnerId}
                          onValueChange={(val) =>
                            setFormData({ ...formData, parentPartnerId: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {partners.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.companyName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* Additional Info */}
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
                          placeholder="Tax ID"
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
                          placeholder="Full Address"
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

                  {/* Permissions Section - Granular Skills */}
                  {[
                    'internal_user',
                    'partner',
                    'partner_employee',
                    'software_tenant',
                    'property_owner',
                    'tenant',
                  ].includes(formData.role || '') && (
                    <div className="border rounded-md mt-2">
                      <div className="p-4 bg-muted/20 border-b flex justify-between items-center">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4" />{' '}
                          {t('users.permissions')}
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
                              {t('users.mirror_admin')}
                            </Label>
                          </div>
                        )}
                      </div>
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Module / Resource</TableHead>
                              <TableHead className="text-center w-[80px]">
                                {t('common.view')}
                              </TableHead>
                              <TableHead className="text-center w-[80px]">
                                {t('common.new')}
                              </TableHead>
                              <TableHead className="text-center w-[80px]">
                                {t('common.edit')}
                              </TableHead>
                              <TableHead className="text-center w-[80px]">
                                {t('common.delete')}
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
                                        disabled={formData.mirrorAdmin}
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
          <CardTitle>{t('users.registered')}</CardTitle>
          <CardDescription>
            {sortedUsers.length} {t('users.registered_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('common.name')} / {t('common.email')}
                </TableHead>
                <TableHead>{t('users.role_label')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={
                      user.isDemo ? 'bg-blue-50/50 hover:bg-blue-50/80' : ''
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.isDemo && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] h-5 px-1.5"
                            >
                              DEMO
                            </Badge>
                          )}
                        </div>
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
                                ? 'Reactivate User'
                                : t('common.approve')
                            }
                          >
                            {user.status === 'blocked' ? (
                              <Unlock className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {user.status === 'blocked'
                              ? 'Reactivate'
                              : 'Approve'}
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
                          currentUser.id !== user.id &&
                          !user.isDemo && (
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
              <Ban className="h-5 w-5" /> {t('users.block_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.block_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlockDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlock}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.block')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
