import { useContext, useState, useEffect } from 'react'
import { AppContext } from '@/stores/AppContext'
import useUserStore from '@/stores/useUserStore'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { UserRole, Permission } from '@/lib/types'
import { PermissionSelector } from '@/components/users/PermissionSelector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BillingManager } from '@/components/users/BillingManager'

export default function Users() {
  const { currentUser } = useContext(AppContext)!
  const { profiles, updateProfile, deleteProfile, addProfile } = useUserStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', role: '' })
  const [permissions, setPermissions] = useState<Permission[]>([])

  const [pmForm, setPmForm] = useState({
    companyName: '',
    taxId: '',
    address: '',
    subscriptionPlan: 'pay_per_house',
  })

  const [activeTab, setActiveTab] = useState('team')

  const isPlatformOwner =
    currentUser?.role === 'platform_owner' || currentUser?.role === 'master'

  const availableRoles =
    isPlatformOwner && activeTab === 'pms'
      ? ['software_tenant']
      : ['internal_user', 'software_tenant']

  const teamMembers = profiles.filter(
    (u) => u.role !== 'software_tenant' || !isPlatformOwner,
  )
  const pmUsers = profiles.filter((u) => u.role === 'software_tenant')

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      role: activeTab === 'pms' ? 'software_tenant' : 'internal_user',
    })
    setPmForm({
      companyName: '',
      taxId: '',
      address: '',
      subscriptionPlan: 'pay_per_house',
    })
    setPermissions([])
    setEditingRecord(null)
  }

  const handleAdd = () => {
    if (!form.name || !form.email || !form.role) {
      toast({ title: 'Validation Error', variant: 'destructive' })
      return
    }

    // Note: Creating a real auth user requires an Edge Function.
    // For demo purposes, we will just insert into the profiles table if possible,
    // though the DB requires `id` to match an existing auth.user.
    // To unblock the frontend, we use a random UUID for demo.
    const randomUuid = crypto.randomUUID
      ? crypto.randomUUID()
      : `user-${Date.now()}`

    addProfile({
      id: randomUuid,
      name: form.name,
      email: form.email,
      role: form.role as UserRole,
      // The other fields are not in the profiles table schema by default,
      // but we can pass them if the schema allows or ignore them.
    })
    setIsAddOpen(false)
    resetForm()
    toast({ title: 'Usuário incluído com sucesso' })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateProfile({
        ...editingRecord,
        name: form.name,
        email: form.email,
        role: form.role || editingRecord.role,
      })
    }
    setEditingRecord(null)
    setIsAddOpen(false)
    toast({ title: 'Usuário alterado com sucesso' })
  }

  const handleDelete = (id: string) => {
    deleteProfile(id)
    toast({ title: 'Usuário excluído com sucesso' })
  }

  const renderPermBadges = (perms?: Permission[]) => {
    if (!perms || perms.length === 0)
      return <span className="text-xs text-muted-foreground">Default</span>
    return (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {perms.map((p) => (
          <Badge
            key={p.resource}
            variant="outline"
            className="text-[10px] py-0 px-1"
          >
            {p.resource.substring(0, 4)}:{' '}
            {p.actions.map((a) => a.charAt(0).toUpperCase()).join('')}
          </Badge>
        ))}
      </div>
    )
  }

  const renderTable = (data: any[], isPM: boolean) => (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead>{t('common.name') || 'Nome'}</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          {isPM && <TableHead>Company</TableHead>}
          {!isPM && <TableHead>Permissions</TableHead>}
          <TableHead>{t('common.status') || 'Status'}</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id} className="hover:bg-slate-50">
            <TableCell className="font-medium text-slate-900">
              <DataMask>{user.name}</DataMask>
            </TableCell>
            <TableCell>
              <DataMask>{user.email}</DataMask>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {user.role.replace('_', ' ')}
              </Badge>
            </TableCell>
            {isPM && <TableCell>{user.companyName || '-'}</TableCell>}
            {!isPM && (
              <TableCell>{renderPermBadges(user.permissions)}</TableCell>
            )}
            <TableCell>
              <Badge
                variant={user.status === 'active' ? 'default' : 'secondary'}
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
                    setPmForm({
                      companyName: user.companyName || '',
                      taxId: user.taxId || '',
                      address: user.address || '',
                      subscriptionPlan:
                        user.subscriptionPlan || 'pay_per_house',
                    })
                    setPermissions(user.permissions || [])
                    setIsAddOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(user.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={isPM ? 6 : 6} className="text-center py-6">
              {t('common.empty') || 'No users found.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Identity & Players Management
          </h1>
          <p className="text-muted-foreground">
            Manage team members, permissions, property managers, and financial
            agreements.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="bg-trust-blue text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Add {activeTab === 'pms' ? 'PM' : 'User'}
        </Button>
      </div>

      <Dialog
        open={isAddOpen}
        onOpenChange={(v) => {
          setIsAddOpen(v)
          if (!v) resetForm()
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Player Configuration' : 'Add New Player'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger
                value="permissions"
                disabled={form.role !== 'internal_user'}
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                disabled={
                  !editingRecord ||
                  !['software_tenant', 'property_owner'].includes(form.role)
                }
              >
                Billing Agreements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v })}
                    disabled={activeTab === 'pms'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === 'pms' && form.role === 'software_tenant' && (
                  <>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>Company Name</Label>
                      <Input
                        value={pmForm.companyName}
                        onChange={(e) =>
                          setPmForm({ ...pmForm, companyName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label>Tax ID</Label>
                      <Input
                        value={pmForm.taxId}
                        onChange={(e) =>
                          setPmForm({ ...pmForm, taxId: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Billing Address</Label>
                      <Input
                        value={pmForm.address}
                        onChange={(e) =>
                          setPmForm({ ...pmForm, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Subscription Plan</Label>
                      <Select
                        value={pmForm.subscriptionPlan}
                        onValueChange={(v) =>
                          setPmForm({ ...pmForm, subscriptionPlan: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pay_per_house">
                            Pay Per House
                          </SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={editingRecord ? handleEdit : handleAdd}>
                  Save Profile
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Access Control (CRUD)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define exactly what this team member can view and edit across
                  the platform.
                </p>
                <PermissionSelector
                  role={form.role as UserRole}
                  currentPermissions={permissions}
                  onChange={setPermissions}
                />
                <div className="flex justify-end pt-4">
                  <Button onClick={editingRecord ? handleEdit : handleAdd}>
                    Save Permissions
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing">
              {editingRecord && (
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                    Configure the financial agreements and billing periods for
                    this player. These rules will be used automatically when
                    generating period invoices.
                  </div>
                  <BillingManager
                    targetId={editingRecord.id}
                    targetRole={editingRecord.role as UserRole}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0">
          {isPlatformOwner ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="m-4">
                <TabsTrigger value="team">Team Members</TabsTrigger>
                <TabsTrigger value="pms">Property Managers</TabsTrigger>
              </TabsList>
              <TabsContent value="team" className="m-0 overflow-auto">
                {renderTable(teamMembers, false)}
              </TabsContent>
              <TabsContent value="pms" className="m-0 overflow-auto">
                {renderTable(pmUsers, true)}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="overflow-auto">
              {renderTable(teamMembers, false)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
