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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Share2,
  Copy,
  CheckCircle2,
  Ban,
  Unlock,
  Briefcase,
  Users as UsersIcon,
  User as UserIcon,
  Building,
  UserCog,
  Shield,
} from 'lucide-react'
import useUserStore from '@/stores/useUserStore'
import useAuthStore from '@/stores/useAuthStore'
import usePartnerStore from '@/stores/usePartnerStore'
import { hasPermission } from '@/lib/permissions'
import { User, UserRole, Permission } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { isValidEmail } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'
import { PermissionsMatrix } from '@/components/users/PermissionsMatrix'
import { PermissionSelector } from '@/components/users/PermissionSelector'
import { DataMask } from '@/components/DataMask'

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
    country: 'US',
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isEditing, setIsEditing] = useState(false)

  // Filter users based on hierarchy visibility rules
  const filteredUsers = users.filter((u) => {
    if (u.isDemo) return true

    if (currentUser.role === 'platform_owner') return true // Admin sees all

    if (currentUser.role === 'software_tenant') {
      // PM sees all users they created or related to them
      return u.parentId === currentUser.id || u.role === 'partner_employee'
    }

    if (currentUser.role === 'partner') {
      // Partner only sees their own team
      return (
        u.role === 'partner_employee' && u.parentPartnerId === currentUser.id
      )
    }

    return false
  })

  // Define allowed roles for creation based on hierarchy rules
  const getAllowedRoles = () => {
    if (currentUser.role === 'platform_owner') {
      return ['software_tenant']
    }
    if (currentUser.role === 'software_tenant') {
      return [
        'property_owner',
        'partner',
        'internal_user',
        'tenant',
        'partner_employee',
      ]
    }
    if (currentUser.role === 'partner') {
      return ['partner_employee']
    }
    return []
  }

  const allowedRoles = getAllowedRoles()

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isDemo && !b.isDemo) return -1
    if (!a.isDemo && b.isDemo) return 1
    return a.name.localeCompare(b.name)
  })

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({
        title: t('common.error'),
        description: t('common.name_required'),
        variant: 'destructive',
      })
      return
    }
    if (!formData.email?.trim() || !isValidEmail(formData.email)) {
      toast({
        title: t('common.error'),
        description: t('common.email_invalid'),
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

    const { password, confirmPassword, parentPartnerId, ...userData } = formData

    let finalParentId = currentUser.id
    let finalPartnerId = parentPartnerId

    // Partner creating employee automatically links to themselves
    if (currentUser.role === 'partner') {
      finalPartnerId = currentUser.id
    }

    const finalUserData = {
      ...userData,
      parentId: isEditing ? userData.parentId : finalParentId,
      parentPartnerId: finalPartnerId,
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

  const openEdit = (user: User) => {
    setFormData({
      ...user,
      password: '',
      confirmPassword: '',
      parentPartnerId: user.parentPartnerId,
      country: user.country || 'US',
      permissions: user.permissions || [],
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

  const handleRoleChange = (val: UserRole) => {
    setFormData({
      ...formData,
      role: val,
      permissions: [],
    })
  }

  const handlePermissionChange = (newPermissions: Permission[]) => {
    setFormData({ ...formData, permissions: newPermissions })
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

  if (!hasPermission(currentUser as User, 'users', 'view')) {
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
          {allowedRoles.length > 0 && (
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? t('common.edit') : t('common.new')} User
                  </DialogTitle>
                  <DialogDescription>{t('users.subtitle')}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
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
                        country={formData.country as any}
                        onCountryChange={(c) =>
                          setFormData({ ...formData, country: c })
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
                        onValueChange={handleRoleChange}
                        disabled={isEditing && formData.isDemo}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.includes('software_tenant') && (
                            <SelectItem value="software_tenant">
                              {t('roles.software_tenant')}
                            </SelectItem>
                          )}
                          {allowedRoles.includes('internal_user') && (
                            <SelectItem value="internal_user">
                              {t('roles.internal_user')}
                            </SelectItem>
                          )}
                          {allowedRoles.includes('partner') && (
                            <SelectItem value="partner">
                              {t('roles.partner')}
                            </SelectItem>
                          )}
                          {allowedRoles.includes('property_owner') && (
                            <SelectItem value="property_owner">
                              {t('roles.property_owner')}
                            </SelectItem>
                          )}
                          {allowedRoles.includes('tenant') && (
                            <SelectItem value="tenant">
                              {t('roles.tenant')}
                            </SelectItem>
                          )}
                          {allowedRoles.includes('partner_employee') && (
                            <SelectItem value="partner_employee">
                              {t('roles.partner_employee')}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Permission Selector Integration */}
                  <div className="col-span-2">
                    <PermissionSelector
                      role={formData.role as UserRole}
                      currentPermissions={formData.permissions || []}
                      onChange={handlePermissionChange}
                    />
                  </div>

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

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">{t('users.registered')}</TabsTrigger>
          <TabsTrigger value="matrix">
            <Shield className="h-4 w-4 mr-2" />
            {t('users.permissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
                              <span className="font-medium">
                                <DataMask>{user.name}</DataMask>
                              </span>
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
                              <DataMask>{user.email}</DataMask>
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
                            {(user.status === 'pending_approval' ||
                              user.status === 'blocked') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50 h-8"
                                onClick={() => handleApprove(user.id)}
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

                            {user.status === 'active' &&
                              currentUser.id !== user.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  onClick={() => initiateBlock(user.id)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {currentUser.id !== user.id && !user.isDemo && (
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
        </TabsContent>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Matrix</CardTitle>
              <CardDescription>
                Overview of permissions per role and resource.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsMatrix />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
