import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { Tenant } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatDate, formatCurrency } from '@/lib/utils'

interface PropertyContractsProps {
  propertyId: string
  canEdit: boolean
}

export function PropertyContracts({
  propertyId,
  canEdit,
}: PropertyContractsProps) {
  const { tenants, addTenant } = useTenantStore()
  const { properties, updateProperty } = usePropertyStore()
  const { toast } = useToast()
  const { t, language } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)

  const [newContract, setNewContract] = useState<Partial<Tenant>>({
    name: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: '',
    rentValue: 0,
    status: 'active',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const propertyTenants = tenants.filter((t) => t.propertyId === propertyId)
  const property = properties.find((p) => p.id === propertyId)

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    if (!newContract.name) {
      newErrors.name = 'Name is required'
      isValid = false
    }

    if (!newContract.leaseStart) {
      newErrors.leaseStart = 'Start date is required'
      isValid = false
    }

    if (!newContract.leaseEnd) {
      newErrors.leaseEnd = 'End date is required'
      isValid = false
    } else if (
      newContract.leaseStart &&
      newContract.leaseEnd < newContract.leaseStart
    ) {
      newErrors.leaseEnd = 'End date cannot be before start date'
      isValid = false
    }

    if (!newContract.rentValue || newContract.rentValue <= 0) {
      newErrors.rentValue = 'Rent value must be greater than 0'
      isValid = false
    }

    if (property?.status === 'maintenance') {
      newErrors.general =
        'Cannot create contract for property under maintenance'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please check the highlighted fields',
        variant: 'destructive',
      })
      return
    }

    addTenant({
      id: `tenant-${Date.now()}`,
      propertyId,
      name: newContract.name,
      email: newContract.email || 'placeholder@email.com',
      phone: newContract.phone || '',
      rentValue: Number(newContract.rentValue),
      leaseStart: newContract.leaseStart,
      leaseEnd: newContract.leaseEnd,
      status: (newContract.status as any) || 'active',
      role: 'tenant',
    } as Tenant)

    // Update property status based on new contract
    if (newContract.status === 'active' && property) {
      updateProperty({ ...property, status: 'rented' })
    }

    setIsOpen(false)
    setNewContract({
      name: '',
      email: '',
      phone: '',
      leaseStart: '',
      leaseEnd: '',
      rentValue: 0,
      status: 'active',
    })
    setErrors({})
    toast({
      title: 'Contract Created',
      description: 'The contract has been successfully created.',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('common.contracts')}</CardTitle>
          <CardDescription>{t('properties.tabs.contracts')}</CardDescription>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-trust-blue gap-2"
          >
            <Plus className="h-4 w-4" /> {t('common.new')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            {errors.general}
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.tenants')}</TableHead>
              <TableHead>{t('common.start_date')}</TableHead>
              <TableHead>{t('common.end_date')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertyTenants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              propertyTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    {tenant.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {tenant.leaseStart
                        ? formatDate(tenant.leaseStart, language)
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {tenant.leaseEnd
                        ? formatDate(tenant.leaseEnd, language)
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(tenant.rentValue, language)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tenant.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setErrors({})
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.new')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className={errors.name ? 'text-red-500' : ''}>
                {t('common.name')}
              </Label>
              <Input
                value={newContract.name}
                onChange={(e) => {
                  setNewContract({ ...newContract, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                placeholder="John Doe"
                className={
                  errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
                }
                onBlur={() => {
                  if (!newContract.name)
                    setErrors({ ...errors, name: 'Name is required' })
                }}
              />
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className={errors.leaseStart ? 'text-red-500' : ''}>
                  {t('common.start_date')}
                </Label>
                <Input
                  type="date"
                  value={newContract.leaseStart}
                  onChange={(e) => {
                    setNewContract({
                      ...newContract,
                      leaseStart: e.target.value,
                    })
                    if (errors.leaseStart)
                      setErrors({ ...errors, leaseStart: '' })
                  }}
                  className={
                    errors.leaseStart
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                  onBlur={() => {
                    if (!newContract.leaseStart)
                      setErrors({
                        ...errors,
                        leaseStart: 'Start date is required',
                      })
                  }}
                />
                {errors.leaseStart && (
                  <span className="text-xs text-red-500">
                    {errors.leaseStart}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label className={errors.leaseEnd ? 'text-red-500' : ''}>
                  {t('common.end_date')}
                </Label>
                <Input
                  type="date"
                  value={newContract.leaseEnd}
                  onChange={(e) => {
                    setNewContract({ ...newContract, leaseEnd: e.target.value })
                    if (errors.leaseEnd) setErrors({ ...errors, leaseEnd: '' })
                  }}
                  className={
                    errors.leaseEnd
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                  onBlur={() => {
                    if (!newContract.leaseEnd) {
                      setErrors({ ...errors, leaseEnd: 'End date is required' })
                    } else if (
                      newContract.leaseStart &&
                      newContract.leaseEnd < newContract.leaseStart
                    ) {
                      setErrors({
                        ...errors,
                        leaseEnd: 'End date cannot be before start date',
                      })
                    }
                  }}
                />
                {errors.leaseEnd && (
                  <span className="text-xs text-red-500">
                    {errors.leaseEnd}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className={errors.rentValue ? 'text-red-500' : ''}>
                  {t('common.value')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newContract.rentValue || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0) {
                      setNewContract({
                        ...newContract,
                        rentValue: val,
                      })
                      if (errors.rentValue)
                        setErrors({ ...errors, rentValue: '' })
                    }
                  }}
                  className={
                    errors.rentValue
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                  onBlur={() => {
                    if (!newContract.rentValue || newContract.rentValue <= 0) {
                      setErrors({
                        ...errors,
                        rentValue: 'Rent value must be greater than 0',
                      })
                    }
                  }}
                />
                {errors.rentValue && (
                  <span className="text-xs text-red-500">
                    {errors.rentValue}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label>{t('common.status')}</Label>
                <Select
                  value={newContract.status}
                  onValueChange={(v) =>
                    setNewContract({ ...newContract, status: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('common.active')}</SelectItem>
                    <SelectItem value="prospective">
                      {t('common.pending')}
                    </SelectItem>
                    <SelectItem value="past">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} className="bg-trust-blue">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
