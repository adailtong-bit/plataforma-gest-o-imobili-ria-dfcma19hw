import { useState } from 'react'
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
import { Pencil, Trash2, MoreHorizontal, Settings, Network } from 'lucide-react'
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
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useBillingStore from '@/stores/useBillingStore'
import useAuthStore from '@/stores/useAuthStore'
import { BillingAgreement } from '@/lib/types'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function ServicePricing() {
  const { t } = useDbTranslations()
  const { agreements, addAgreement, updateAgreement, deleteAgreement } =
    useBillingStore()
  const { allUsers, currentUser } = useAuthStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<BillingAgreement | null>(
    null,
  )

  const isPlatformAdmin = [
    'master',
    'super_admin',
    'platform_owner',
    'admin',
  ].includes(currentUser?.role || '')

  const effectiveSourceRole = isPlatformAdmin
    ? 'master'
    : currentUser?.role || 'software_tenant'

  const getRoleHierarchy = (sourceRole: string) => {
    if (
      ['master', 'super_admin', 'platform_owner', 'admin'].includes(sourceRole)
    ) {
      return {
        allowedTargets: [
          { value: 'software_tenant', label: 'Property Manager' },
          { value: 'advertiser', label: 'Advertiser' },
        ],
        allowedTypes: {
          software_tenant: [
            {
              value: 'software_fee_per_house',
              label: 'Software Fee (Per House)',
            },
            { value: 'fixed_admin_fee', label: 'Platform Fixed Fee' },
          ],
          advertiser: [
            { value: 'ad_placement_fee', label: 'Ad Placement Fee' },
          ],
        },
      }
    }

    if (sourceRole === 'software_tenant') {
      return {
        allowedTargets: [{ value: 'property_owner', label: 'Property Owner' }],
        allowedTypes: {
          property_owner: [
            { value: 'booking_percentage', label: 'Booking Revenue Share (%)' },
            { value: 'fixed_admin_fee', label: 'Fixed Admin Fee' },
            { value: 'markup_cleaning', label: 'Cleaning Markup' },
            { value: 'markup_maintenance', label: 'Maintenance Markup' },
            { value: 'markup_purchases', label: 'Purchases/Parts Markup' },
          ],
        },
      }
    }

    if (sourceRole === 'partner') {
      return {
        allowedTargets: [
          { value: 'software_tenant', label: 'Property Manager' },
        ],
        allowedTypes: {
          software_tenant: [
            { value: 'partner_cleaning_fee', label: 'Cleaning Fee' },
            { value: 'partner_maintenance_fee', label: 'Maintenance Fee' },
            { value: 'partner_parts_fee', label: 'Parts & Materials Fee' },
          ],
        },
      }
    }

    if (sourceRole === 'partner_employee') {
      return {
        allowedTargets: [
          { value: 'partner', label: 'Service Partner (Your Boss)' },
        ],
        allowedTypes: {
          partner: [
            { value: 'team_cleaning_fee', label: 'Cleaning Payout' },
            { value: 'team_maintenance_fee', label: 'Maintenance Payout' },
            { value: 'team_parts_fee', label: 'Parts Reimbursement' },
          ],
        },
      }
    }

    return { allowedTargets: [], allowedTypes: {} }
  }

  const hierarchy = getRoleHierarchy(effectiveSourceRole)

  const defaultForm: Partial<BillingAgreement> = {
    name: '',
    sourceRole: effectiveSourceRole,
    targetId: 'global',
    targetRole: hierarchy.allowedTargets[0]?.value as any,
    type: hierarchy.allowedTypes[hierarchy.allowedTargets[0]?.value]?.[0]
      ?.value as any,
    valueType: 'percentage',
    value: 0,
    frequency: 'per_booking',
    validFrom: new Date().toISOString().split('T')[0],
    status: 'active',
  }

  const [form, setForm] = useState<Partial<BillingAgreement>>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const visibleAgreements = agreements.filter((a) => {
    if (isPlatformAdmin) return true
    return a.sourceId === currentUser?.id || a.sourceRole === currentUser?.role
  })

  const filteredRates = visibleAgreements.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.name) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord) {
      updateAgreement({ ...editingRecord, ...form } as BillingAgreement)
      toast({
        title: 'Success',
        description: 'Agreement updated successfully.',
      })
    } else {
      addAgreement({
        id: `ba-${Date.now()}`,
        name: form.name,
        sourceId: currentUser?.id,
        sourceRole: form.sourceRole || effectiveSourceRole,
        targetId: form.targetId || 'global',
        targetRole: form.targetRole || hierarchy.allowedTargets[0]?.value,
        type:
          form.type ||
          hierarchy.allowedTypes[form.targetRole as string]?.[0]?.value ||
          'custom',
        valueType: form.valueType || 'fixed',
        value: Number(form.value) || 0,
        frequency: form.frequency || 'monthly',
        validFrom: form.validFrom || new Date().toISOString().split('T')[0],
        status: form.status || 'active',
      } as BillingAgreement)
      toast({
        title: 'Success',
        description: 'Agreement created successfully.',
      })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm(defaultForm)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteAgreement(deleteId)
      toast({
        title: 'Success',
        description: 'Agreement deleted successfully.',
      })
      setDeleteId(null)
    }
  }

  const getTargetName = (id: string) => {
    if (id === 'global') return 'Global'
    const u = allUsers.find((user) => user.id === id)
    return u ? `${u.name}` : id
  }

  const formatValue = (val: number, type: string) => {
    return type === 'percentage' ? `${val}%` : `$${val.toFixed(2)}`
  }

  const roleLabels: Record<string, string> = {
    master: t('role_master', 'Admin'),
    software_tenant: t('role_software_tenant', 'PM'),
    property_owner: t('role_property_owner', 'Owner'),
    partner: t('role_partner', 'Partner'),
    partner_employee: t('role_partner_employee', 'Team'),
    advertiser: t('role_advertiser', 'Advertiser'),
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('service_pricing_title', 'N-Tier Billing & Agreements')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'service_pricing_desc',
              'Configure automated hierarchy rules (Admin ➔ PM ➔ Owner & Partner ➔ PM).',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm(defaultForm)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white hover:bg-blue-700">
                <Network className="h-4 w-4" />{' '}
                {t('btn_new_rule', 'New Billing Rule')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] bg-white">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord
                    ? t('btn_edit_rule', 'Edit Billing Rule')
                    : t('btn_new_rule', 'New Billing Rule')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-sm text-slate-700 uppercase tracking-wider">
                      Financial Hierarchy
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Only valid relationships for your role (
                      {roleLabels[effectiveSourceRole] || effectiveSourceRole})
                      are shown.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Billed By (Source Role)</Label>
                      <Input
                        value={
                          roleLabels[form.sourceRole as string] ||
                          form.sourceRole
                        }
                        disabled
                        className="bg-slate-100 text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Billed To (Target Role)</Label>
                      <Select
                        value={form.targetRole as string}
                        onValueChange={(val: any) => {
                          const allowedTypes = hierarchy.allowedTypes[val] || []
                          setForm({
                            ...form,
                            targetRole: val,
                            targetId: 'global',
                            type: allowedTypes[0]?.value || 'custom',
                          })
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Who pays?" />
                        </SelectTrigger>
                        <SelectContent>
                          {hierarchy.allowedTargets.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input
                      placeholder="e.g. Monthly PM Admin Fee"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Player Scope</Label>
                    <Select
                      value={form.targetId}
                      onValueChange={(val: any) =>
                        setForm({ ...form, targetId: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Global" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">
                          Global (All{' '}
                          {roleLabels[form.targetRole as string] || 'Users'})
                        </SelectItem>
                        {allUsers
                          .filter((u) => u.role === form.targetRole)
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
                  <div className="space-y-2 col-span-2">
                    <Label>Calculation Logic (Rule Type)</Label>
                    <Select
                      value={form.type}
                      onValueChange={(val: any) =>
                        setForm({ ...form, type: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hierarchy.allowedTypes[form.targetRole as string]?.map(
                          (t: any) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ),
                        )}
                        <SelectItem value="custom">Custom Rule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value Type</Label>
                    <Select
                      value={form.valueType}
                      onValueChange={(val: any) =>
                        setForm({ ...form, valueType: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Value type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount / Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.value}
                      onChange={(e) =>
                        setForm({ ...form, value: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={form.frequency}
                      onValueChange={(val: any) =>
                        setForm({ ...form, frequency: val })
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_booking">
                          Per Booking (Auto)
                        </SelectItem>
                        <SelectItem value="per_task">
                          Per Task (Auto)
                        </SelectItem>
                        <SelectItem value="monthly">Monthly Fixed</SelectItem>
                        <SelectItem value="yearly">Yearly Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                    <Input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) =>
                        setForm({ ...form, validFrom: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('btn_cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue text-white"
                >
                  {t('btn_save_rule', 'Save Rule')}
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
                <TableHead>{t('column_name', 'Rule Name')}</TableHead>
                <TableHead>
                  {t('column_hierarchy', 'Hierarchy (By ➔ To)')}
                </TableHead>
                <TableHead>{t('column_scope', 'Target Scope')}</TableHead>
                <TableHead>{t('column_logic', 'Logic Type')}</TableHead>
                <TableHead>{t('column_rate', 'Rate')}</TableHead>
                <TableHead>{t('column_status', 'Status')}</TableHead>
                <TableHead className="text-right">
                  {t('column_actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((agreement) => (
                <TableRow key={agreement.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {agreement.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-blue-600">
                        {roleLabels[agreement.sourceRole as string] || 'System'}
                      </span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-emerald-600">
                        {roleLabels[agreement.targetRole as string] || 'User'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700"
                    >
                      {getTargetName(agreement.targetId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 capitalize">
                      {agreement.type.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {formatValue(agreement.value, agreement.valueType)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        agreement.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {agreement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(isPlatformAdmin ||
                      agreement.sourceId === currentUser?.id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRecord(agreement)
                              setForm(agreement)
                              setIsAddOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2 text-slate-600" />{' '}
                            {t('btn_edit_rule', 'Edit Rule')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => setDeleteId(agreement.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('btn_delete_rule', 'Delete Rule')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Network className="h-10 w-10 text-slate-300" />
                      <p>
                        {t(
                          'msg_no_rules',
                          'No billing hierarchy rules configured.',
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                      >
                        {t('btn_create_rule', 'Create rule')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this billing rule? It will no
              longer be applied to future automated invoices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
