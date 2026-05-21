import { useState, useMemo } from 'react'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useAuthStore from '@/stores/useAuthStore'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
} from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { cn, exportToCSV } from '@/lib/utils'
import { Download } from 'lucide-react'

export default function Financial() {
  const {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
  } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const authStore = useAuthStore()
  const effectiveRole =
    authStore.simulationMode && authStore.simulationRole
      ? authStore.simulationRole
      : authStore.currentUser?.role

  const effectiveUserId =
    authStore.simulationMode && authStore.simulationRole === 'property_owner'
      ? authStore.allUsers.find((u) => u.role === 'property_owner')?.id ||
        authStore.currentUser?.id
      : authStore.currentUser?.id

  const isOwner = effectiveRole === 'property_owner'

  const [viewMode, setViewMode] = useState<'pm' | 'owner' | 'property'>(
    isOwner ? 'owner' : 'pm',
  )
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
    isOwner && effectiveUserId ? effectiveUserId : 'all',
  )
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')

  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)

  const formatLocalCurrency = (value: number) => {
    const loc =
      language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const resetForm = () => {
    setForm({
      description: '',
      amount: '',
      type: 'income',
      category: 'other',
      date: new Date().toISOString().substring(0, 10),
      propertyId: 'none',
      costType: 'variable',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
      status: 'pending',
    })
  }

  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'income',
    category: 'other',
    date: new Date().toISOString().substring(0, 10),
    propertyId: 'none',
    bookingId: '',
    costType: 'variable',
    isRecurring: false,
    recurrenceFrequency: 'monthly',
    status: 'pending',
  })

  const filteredData = useMemo(() => {
    // 1. Filter by View Mode
    const viewFiltered = ledgerEntries.filter((entry) => {
      if (viewMode === 'pm') return true
      if (viewMode === 'owner') {
        if (selectedOwnerId === 'all') return true
        const prop = properties.find((p) => p.id === entry.propertyId)
        return prop?.ownerId === selectedOwnerId
      }
      if (viewMode === 'property') {
        if (selectedPropertyId === 'all') return true
        return entry.propertyId === selectedPropertyId
      }
      return true
    })

    // 2. Filter by Category
    const catFiltered = viewFiltered.filter((entry) => {
      if (filterCategory === 'all') return true
      if (filterCategory === 'income') return entry.type === 'income'
      if (filterCategory === 'expense') return entry.type === 'expense'
      if (filterCategory === 'maintenance') {
        const cat = entry.category?.toLowerCase() || ''
        return (
          cat.includes('maintenance') ||
          cat.includes('manutenção') ||
          cat.includes('manutencao')
        )
      }
      if (filterCategory === 'cleaning') {
        const cat = entry.category?.toLowerCase() || ''
        return cat.includes('cleaning') || cat.includes('limpeza')
      }
      if (filterCategory === 'hoa') {
        const cat = entry.category?.toLowerCase() || ''
        const desc = entry.description?.toLowerCase() || ''
        return (
          cat.includes('hoa') ||
          desc.includes('hoa') ||
          desc.includes('condomínio')
        )
      }
      if (filterCategory === 'tax') {
        const cat = entry.category?.toLowerCase() || ''
        const desc = entry.description?.toLowerCase() || ''
        return (
          cat.includes('tax') ||
          cat.includes('imposto') ||
          desc.includes('tax') ||
          desc.includes('imposto')
        )
      }
      return true
    })

    // 3. Setup Period Boundaries
    let start: Date | null = null
    let end: Date | null = null
    const now = new Date()

    if (filterPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (filterPeriod === 'semester') {
      const s = now.getMonth() < 6 ? 0 : 6
      start = new Date(now.getFullYear(), s, 1)
      end = new Date(now.getFullYear(), s + 6, 0, 23, 59, 59, 999)
    } else if (filterPeriod === 'year') {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 12, 0, 23, 59, 59, 999)
    } else if (filterPeriod === 'custom' && customDateRange?.from) {
      start = new Date(customDateRange.from.getTime())
      start.setHours(0, 0, 0, 0)
      end = customDateRange.to
        ? new Date(customDateRange.to.getTime())
        : new Date(customDateRange.from.getTime())
      end.setHours(23, 59, 59, 999)
    }

    // 4. Split into previous (for initial balance) and current (for display)
    let initialBalance = 0
    const displayEntries: any[] = []

    catFiltered.forEach((entry) => {
      const entryDate = new Date(entry.date)
      const amt = entry.type === 'income' ? entry.amount : -entry.amount

      if (start && entryDate < start) {
        if (entry.status === 'cleared') {
          initialBalance += amt
        }
      } else if (start && end && entryDate >= start && entryDate <= end) {
        displayEntries.push(entry)
      } else if (!start) {
        displayEntries.push(entry)
      }
    })

    // 5. Sort and calculate running balance
    const sortedAsc = [...displayEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let currentBalance = initialBalance
    const calculated = sortedAsc.map((entry) => {
      currentBalance += entry.type === 'income' ? entry.amount : -entry.amount
      return {
        ...entry,
        runningBalance: currentBalance,
      }
    })

    return {
      entries: calculated.reverse(),
      initialBalance,
      finalBalance: currentBalance,
    }
  }, [
    ledgerEntries,
    viewMode,
    selectedOwnerId,
    selectedPropertyId,
    properties,
    filterCategory,
    filterPeriod,
    customDateRange,
  ])

  const balances = useMemo(() => {
    let income = 0
    let expense = 0
    let pendingIncome = 0
    let pendingExpense = 0

    filteredData.entries.forEach((e) => {
      if (e.status === 'cleared') {
        if (e.type === 'income') income += e.amount
        else expense += e.amount
      } else {
        if (e.type === 'income') pendingIncome += e.amount
        else pendingExpense += e.amount
      }
    })

    return {
      currentBalance: filteredData.finalBalance,
      periodNet: income - expense,
      income,
      expense,
      pendingIncome,
      pendingExpense,
      pendingBalance: pendingIncome - pendingExpense,
    }
  }, [filteredData])

  const handleAdd = () => {
    if (Number(form.amount) <= 0) {
      toast({
        title: t('financial.invalid_amount') || 'Invalid amount',
        description:
          t('financial.invalid_amount_desc') ||
          'Amount must be greater than zero.',
        variant: 'destructive',
      })
      return
    }
    if (!form.description) {
      toast({
        title: t('financial.invalid_desc') || 'Invalid description',
        description:
          t('financial.invalid_desc_hint') || 'Description is required.',
        variant: 'destructive',
      })
      return
    }

    addLedgerEntry({
      description: form.description || 'New transaction',
      amount: Number(form.amount) || 0,
      type: form.type as 'income' | 'expense',
      date: new Date(form.date).toISOString(),
      status: form.status as 'pending' | 'cleared',
      category: form.category,
      propertyId: form.propertyId === 'none' ? '' : form.propertyId,
      bookingId: form.bookingId || null,
      costType: form.costType as 'fixed' | 'variable',
      isRecurring: form.isRecurring,
      recurrenceFrequency: form.recurrenceFrequency as 'monthly' | 'yearly',
      nextRecurrenceGenerated: false,
    })
    setIsAddOpen(false)
    resetForm()
    toast({
      title: t('financial.success_add') || 'Transaction added successfully',
    })
  }

  const handleEdit = () => {
    if (editingRecord?.status === 'cleared') {
      toast({
        title: t('financial.error') || 'Action Not Allowed',
        description:
          t('financial.locked_record') ||
          'Cleared or paid records are locked for financial integrity and auditing.',
        variant: 'destructive',
      })
      return
    }

    if (Number(form.amount) <= 0) {
      toast({
        title: t('financial.invalid_amount') || 'Invalid amount',
        description:
          t('financial.invalid_amount_desc') ||
          'Amount must be greater than zero.',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord) {
      updateLedgerEntry({
        ...editingRecord,
        description: form.description,
        amount: Number(form.amount),
        type: form.type as 'income' | 'expense',
        category: form.category,
        date: new Date(form.date).toISOString(),
        propertyId: form.propertyId === 'none' ? '' : form.propertyId,
        bookingId: form.bookingId || null,
        costType: form.costType as 'fixed' | 'variable',
        isRecurring: form.isRecurring,
        recurrenceFrequency: form.recurrenceFrequency as 'monthly' | 'yearly',
        status: form.status as 'pending' | 'cleared',
      })
    }
    setEditingRecord(null)
    toast({
      title: t('financial.success_edit') || 'Transaction updated successfully',
    })
  }

  const openEdit = (entry: import('@/lib/types').LedgerEntry) => {
    setEditingRecord(entry)
    setForm({
      description: entry.description,
      amount: entry.amount.toString(),
      type: entry.type,
      category: entry.category || 'other',
      date: entry.date.substring(0, 10),
      propertyId: entry.propertyId || 'none',
      bookingId: entry.bookingId || '',
      costType: entry.costType || 'variable',
      isRecurring: entry.isRecurring || false,
      recurrenceFrequency: entry.recurrenceFrequency || 'monthly',
      status: entry.status || 'pending',
    })
  }

  const handleDelete = (id: string) => {
    const entry = ledgerEntries.find((e) => e.id === id)
    if (entry?.status === 'cleared') {
      toast({
        title: t('financial.error') || 'Action Not Allowed',
        description:
          t('financial.locked_record') ||
          'Cleared or paid records are locked for financial integrity and auditing.',
        variant: 'destructive',
      })
      return
    }

    deleteLedgerEntry(id)
    toast({
      title:
        t('financial.success_delete') || 'Transaction deleted successfully',
    })
  }

  const markAsPaid = (entry: import('@/lib/types').LedgerEntry) => {
    updateLedgerEntry({
      ...entry,
      status: 'cleared',
      paymentDate: new Date().toISOString(),
    })
    toast({
      title: t('financial.success_paid') || 'Transaction marked as paid',
    })
  }

  const handleExport = () => {
    const headers = [
      t('financial.table_date') || 'Date',
      t('common.property') || 'Property',
      t('financial.type') || 'Type',
      t('financial.category') || 'Category',
      t('financial.description') || 'Description',
      t('financial.amount') || 'Amount',
      t('financial.table_status') || 'Status',
    ]
    const rows = filteredData.entries.map((entry) => {
      const property = properties.find((p) => p.id === entry.propertyId)
      return [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        property?.name || t('common.unknown') || 'Unknown',
        entry.type === 'income'
          ? t('financial.income') || 'Income'
          : t('financial.expense') || 'Expense',
        entry.category || '',
        `"${entry.description.replace(/"/g, '""')}"`,
        entry.amount.toFixed(2),
        entry.status === 'cleared'
          ? t('common.paid') || 'Paid'
          : t('common.pending') || 'Pending',
      ]
    })
    exportToCSV('financial_statement', headers, rows)
    toast({
      title: t('common.success') || 'Success',
      description: t('common.export_success') || 'Data exported successfully.',
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.financial') || 'Financial'}
          </h1>
          <p className="text-muted-foreground">
            {t('financial.management_desc', 'Management Desc')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />{' '}
            {t('financial.export_csv') || 'Export (CSV)'}
          </Button>
          <Dialog
            open={isAddOpen}
            onOpenChange={(val) => {
              if (val) resetForm()
              setIsAddOpen(val)
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white">
                <Plus className="h-4 w-4" />{' '}
                {t('financial.add_transaction') || 'Add Transaction'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {t('financial.add_title') || 'Include Transaction'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('financial.type') || 'Type'}</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">
                          {t('financial.income') || 'Income'}
                        </SelectItem>
                        <SelectItem value="expense">
                          {t('financial.expense') || 'Expense'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('financial.date') || 'Date'}</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('financial.description') || 'Description'}</Label>
                    <Input
                      placeholder={
                        t('financial.description_placeholder') ||
                        'E.g: Electric Bill, Rent...'
                      }
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('financial.category') || 'Category'}</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="other">
                          {t('financial.categories.other') || 'Other'}
                        </SelectItem>
                        <SelectItem value="rent">
                          {t('financial.categories.rent') || 'Rent'}
                        </SelectItem>
                        <SelectItem value="maintenance">
                          {t('financial.categories.maintenance') ||
                            'Maintenance'}
                        </SelectItem>
                        <SelectItem value="cleaning">
                          {t('financial.categories.cleaning') || 'Cleaning'}
                        </SelectItem>
                        <SelectItem value="hoa">
                          {t('financial.categories.hoa') || 'HOA / Condo'}
                        </SelectItem>
                        <SelectItem value="tax">
                          {t('financial.categories.tax') || 'Taxes'}
                        </SelectItem>
                        <SelectItem value="utilities">
                          {t('financial.categories.utilities') || 'Utilities'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('financial.amount') || 'Amount'}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (val < 0) return
                        setForm({ ...form, amount: e.target.value })
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      {t('financial.booking_optional') ||
                        'Booking / Guest ID (Optional)'}
                    </Label>
                    <Input
                      placeholder="Booking ID for Guest Consumption"
                      value={form.bookingId}
                      onChange={(e) =>
                        setForm({ ...form, bookingId: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>
                      {t('financial.property_optional') ||
                        'Property (Optional)'}
                    </Label>
                    <Select
                      value={form.propertyId}
                      onValueChange={(v) => setForm({ ...form, propertyId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.all') || 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        {!isOwner && (
                          <SelectItem value="none">
                            {t('financial.pm_general', 'Pm General')}
                          </SelectItem>
                        )}
                        {properties
                          .filter(
                            (p) => !isOwner || p.ownerId === effectiveUserId,
                          )
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {form.type === 'expense' && (
                  <div className="grid gap-2">
                    <Label>
                      {t('financial.cost_category') || 'Cost Category'}
                    </Label>
                    <Select
                      value={form.costType}
                      onValueChange={(v) => setForm({ ...form, costType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">
                          {t('financial.fixed_cost') || 'Fixed Cost'}
                        </SelectItem>
                        <SelectItem value="variable">
                          {t('financial.variable_cost') || 'Variable Cost'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={form.isRecurring}
                    onCheckedChange={(v) =>
                      setForm({ ...form, isRecurring: v })
                    }
                  />
                  <Label>
                    {t('financial.is_recurring') ||
                      'Is this a recurring expense/income?'}
                  </Label>
                </div>

                {form.isRecurring && (
                  <div className="grid gap-2">
                    <Label>
                      {t('financial.recurrence_freq') || 'Recurrence Frequency'}
                    </Label>
                    <Select
                      value={form.recurrenceFrequency}
                      onValueChange={(v) =>
                        setForm({ ...form, recurrenceFrequency: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t('financial.monthly') || 'Monthly'}
                        </SelectItem>
                        <SelectItem value="yearly">
                          {t('financial.yearly') || 'Yearly'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('financial.recurring_hint') ||
                        'When marking this item as "Paid", the system will automatically generate the entry for the next month/year.'}
                    </p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>
                    {t('financial.initial_status') || 'Initial Status'}
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        {t('common.pending') || 'Pending'}
                      </SelectItem>
                      <SelectItem value="cleared">
                        {t('financial.cleared') || 'Paid/Received'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>
                  {t('financial.save_transaction') || 'Save Transaction'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {t('financial.balances_panel', 'Balances Panel')}
          </CardTitle>
          <CardDescription>
            {t('financial.balances_desc', 'Balances Desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              {!isOwner && (
                <Tabs
                  value={viewMode}
                  onValueChange={(v: 'pm' | 'owner' | 'property') => {
                    setViewMode(v)
                    setSelectedOwnerId('all')
                    setSelectedPropertyId('all')
                  }}
                >
                  <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="pm" className="gap-2">
                      <Building className="w-4 h-4 hidden sm:block" />{' '}
                      {t('financial.pm_general', 'Pm General')}
                    </TabsTrigger>
                    <TabsTrigger value="owner" className="gap-2">
                      <User className="w-4 h-4 hidden sm:block" />{' '}
                      {t('financial.owner', 'Owner')}
                    </TabsTrigger>
                    <TabsTrigger value="property" className="gap-2">
                      <Building className="w-4 h-4 hidden sm:block" />{' '}
                      {t('common.property', 'Propriedade')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {viewMode === 'owner' && !isOwner && (
                <div className="w-full md:w-[400px]">
                  <Select
                    value={selectedOwnerId}
                    onValueChange={setSelectedOwnerId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t('financial.select_owner') || 'Select Owner'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('financial.all_owners') || 'All Owners'}
                      </SelectItem>
                      {owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === 'property' && (
                <div className="w-full md:w-[400px]">
                  <Select
                    value={selectedPropertyId}
                    onValueChange={setSelectedPropertyId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t('financial.select_property') || 'Select Property'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('financial.all_properties') || 'All Properties'}
                      </SelectItem>
                      {properties.map((p) => {
                        if (isOwner && p.ownerId !== effectiveUserId)
                          return null
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isOwner && viewMode === 'owner' && (
                <div className="flex items-center gap-2 text-sm font-medium bg-blue-50 text-blue-700 px-4 py-2 rounded-md border border-blue-200">
                  <User className="w-4 h-4" />{' '}
                  {t('financial.viewing_your_properties') ||
                    'Viewing Your Properties'}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                <span className="hidden xl:inline">
                  {t('financial.filters') || 'Filters:'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-[140px] sm:w-[160px] bg-white">
                    <SelectValue
                      placeholder={t('common.category') || 'Category'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('financial.all_categories', 'All Categories')}
                    </SelectItem>
                    <SelectItem value="income">
                      {t('financial.incomes') || 'Incomes'}
                    </SelectItem>
                    <SelectItem value="expense">
                      {t('financial.expenses') || 'Expenses'}
                    </SelectItem>
                    <SelectItem value="maintenance">
                      {t('financial.maintenances') || 'Maintenances'}
                    </SelectItem>
                    <SelectItem value="cleaning">
                      {t('financial.cleanings') || 'Cleanings'}
                    </SelectItem>
                    <SelectItem value="hoa">
                      {t('financial.hoa_condo') || 'HOA / Condo'}
                    </SelectItem>
                    <SelectItem value="tax">
                      {t('financial.taxes') || 'Taxes'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-[140px] sm:w-[160px] bg-white">
                    <SelectValue placeholder={t('common.period') || 'Period'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('financial.all_period', 'All Period')}
                    </SelectItem>
                    <SelectItem value="month">
                      {t('financial.current_month') || 'Current Month'}
                    </SelectItem>
                    <SelectItem value="semester">
                      {t('financial.semester') || 'Semester'}
                    </SelectItem>
                    <SelectItem value="year">
                      {t('financial.fiscal_year') || 'Fiscal Year'}
                    </SelectItem>
                    <SelectItem value="custom">
                      {t('financial.custom') || 'Custom'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {filterPeriod === 'custom' && (
                  <div className="bg-white rounded-md">
                    <DatePickerWithRange
                      date={customDateRange}
                      setDate={setCustomDateRange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className={cn(
                'border-2',
                balances.currentBalance >= 0
                  ? 'border-green-100 bg-green-50/50'
                  : 'border-red-100 bg-red-50/50',
              )}
            >
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600 mb-1">
                  {t('financial.projected_balance', 'Projected Balance')}
                </div>
                <div
                  className={cn(
                    'text-3xl font-bold',
                    balances.currentBalance >= 0
                      ? 'text-green-700'
                      : 'text-red-700',
                  )}
                >
                  {formatLocalCurrency(balances.currentBalance)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {t(
                    'financial.projected_balance_desc',
                    'Projected Balance Desc',
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600 mb-1">
                  {t('financial.total_incomes', 'Total Incomes')}
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatLocalCurrency(balances.income)}
                </div>
                {balances.pendingIncome > 0 && (
                  <div className="text-xs text-blue-600 mt-2">
                    +{formatLocalCurrency(balances.pendingIncome)}{' '}
                    {t('financial.pending_suffix') || 'pending'}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600 mb-1">
                  {t('financial.total_expenses', 'Total Expenses')}
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatLocalCurrency(balances.expense)}
                </div>
                {balances.pendingExpense > 0 && (
                  <div className="text-xs text-orange-600 mt-2">
                    +{formatLocalCurrency(balances.pendingExpense)}{' '}
                    {t('financial.pending_suffix') || 'pending'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg">
            {t('financial.statement') || 'Transaction Statement'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('financial.table_date') || 'Date'}</TableHead>
                <TableHead>
                  {t('financial.table_desc') || 'Description'}
                </TableHead>
                <TableHead>
                  {t('financial.table_type_cat') || 'Type / Category'}
                </TableHead>
                <TableHead>{t('financial.table_status') || 'Status'}</TableHead>
                <TableHead className="text-right">
                  {t('financial.table_amount') || 'Amount'}
                </TableHead>
                <TableHead className="text-right">
                  {t('financial.table_balance') || 'Balance'}
                </TableHead>
                <TableHead className="text-right">
                  {t('financial.table_actions') || 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.entries.map((entry) => {
                const isIncome = entry.type === 'income'
                return (
                  <TableRow key={entry.id} className="hover:bg-slate-50">
                    <TableCell>
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {entry.description}
                        </span>
                        {entry.propertyId && (
                          <span className="text-xs text-slate-500">
                            {properties.find((p) => p.id === entry.propertyId)
                              ?.name ||
                              t(
                                'financial.deleted_property',
                                'Deleted Property',
                              )}
                          </span>
                        )}
                        {entry.isRecurring && (
                          <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {entry.recurrenceFrequency === 'monthly'
                              ? t('financial.monthly') || 'Monthly'
                              : t('financial.yearly') || 'Yearly'}
                          </span>
                        )}
                        {entry.referenceId && (
                          <span className="text-[10px] text-slate-400 mt-1 font-mono">
                            Ref: {entry.referenceId.substring(0, 8)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={isIncome ? 'default' : 'destructive'}
                          className={
                            isIncome
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {isIncome ? (
                            <ArrowUpCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownCircle className="w-3 h-3 mr-1" />
                          )}
                          {isIncome
                            ? t('financial.income') || 'Income'
                            : t('financial.expense') || 'Expense'}
                        </Badge>
                        {!isIncome && entry.costType && (
                          <Badge
                            variant="outline"
                            className="text-xs border-slate-300"
                          >
                            {entry.costType === 'fixed'
                              ? t('financial.fixed_cost') || 'Fixed Cost'
                              : t('financial.variable_cost') || 'Variable Cost'}
                          </Badge>
                        )}
                        {entry.category && entry.category !== 'other' && (
                          <span className="text-[10px] text-slate-500 capitalize px-1 bg-slate-100 rounded-sm">
                            {entry.category}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.status === 'cleared' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{' '}
                          {t('common.paid') || 'Paid'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />{' '}
                          {t('common.pending') || 'Pending'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-bold',
                        isIncome ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      {isIncome ? '+' : '-'}
                      {formatLocalCurrency(entry.amount)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-bold',
                        entry.runningBalance >= 0
                          ? 'text-slate-900'
                          : 'text-red-600',
                      )}
                    >
                      {formatLocalCurrency(entry.runningBalance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {entry.status !== 'cleared' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => markAsPaid(entry)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />{' '}
                            {t('financial.pay') || 'Pay'}
                          </Button>
                        )}
                        {entry.status !== 'cleared' && (
                          <>
                            <Dialog
                              open={editingRecord?.id === entry.id}
                              onOpenChange={(open) =>
                                !open && setEditingRecord(null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                  onClick={() => openEdit(entry)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {t('financial.edit_transaction') ||
                                      'Edit Transaction'}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.type') || 'Type'}
                                      </Label>
                                      <Select
                                        value={form.type}
                                        onValueChange={(v) =>
                                          setForm({ ...form, type: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="income">
                                            {t('financial.income') || 'Income'}
                                          </SelectItem>
                                          <SelectItem value="expense">
                                            {t('financial.expense') ||
                                              'Expense'}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.date') || 'Date'}
                                      </Label>
                                      <Input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) =>
                                          setForm({
                                            ...form,
                                            date: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.description') ||
                                          'Description'}
                                      </Label>
                                      <Input
                                        value={form.description}
                                        onChange={(e) =>
                                          setForm({
                                            ...form,
                                            description: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.category') || 'Category'}
                                      </Label>
                                      <Select
                                        value={form.category}
                                        onValueChange={(v) =>
                                          setForm({ ...form, category: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="other">
                                            {t('financial.categories.other') ||
                                              'Other'}
                                          </SelectItem>
                                          <SelectItem value="rent">
                                            {t('financial.categories.rent') ||
                                              'Rent'}
                                          </SelectItem>
                                          <SelectItem value="maintenance">
                                            {t(
                                              'financial.categories.maintenance',
                                            ) || 'Maintenance'}
                                          </SelectItem>
                                          <SelectItem value="cleaning">
                                            {t(
                                              'financial.categories.cleaning',
                                            ) || 'Cleaning'}
                                          </SelectItem>
                                          <SelectItem value="hoa">
                                            {t('financial.categories.hoa') ||
                                              'HOA / Condo'}
                                          </SelectItem>
                                          <SelectItem value="tax">
                                            {t('financial.categories.tax') ||
                                              'Taxes'}
                                          </SelectItem>
                                          <SelectItem value="utilities">
                                            {t(
                                              'financial.categories.utilities',
                                            ) || 'Utilities'}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.amount') || 'Amount'}
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value)
                                          if (val < 0) return
                                          setForm({
                                            ...form,
                                            amount: e.target.value,
                                          })
                                        }}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.booking_optional') ||
                                          'Booking / Guest ID'}
                                      </Label>
                                      <Input
                                        placeholder="Booking ID for Guest Consumption"
                                        value={form.bookingId}
                                        onChange={(e) =>
                                          setForm({
                                            ...form,
                                            bookingId: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('common.property') || 'Property'}
                                      </Label>
                                      <Select
                                        value={form.propertyId}
                                        onValueChange={(v) =>
                                          setForm({ ...form, propertyId: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {!isOwner && (
                                            <SelectItem value="none">
                                              {t('financial.pm_general') ||
                                                'PM (General)'}
                                            </SelectItem>
                                          )}
                                          {properties
                                            .filter(
                                              (p) =>
                                                !isOwner ||
                                                p.ownerId === effectiveUserId,
                                            )
                                            .map((p) => (
                                              <SelectItem
                                                key={p.id}
                                                value={p.id}
                                              >
                                                {p.name}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {form.type === 'expense' && (
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.cost_category') ||
                                          'Cost Category'}
                                      </Label>
                                      <Select
                                        value={form.costType}
                                        onValueChange={(v) =>
                                          setForm({ ...form, costType: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="fixed">
                                            {t('financial.fixed_cost') ||
                                              'Fixed Cost'}
                                          </SelectItem>
                                          <SelectItem value="variable">
                                            {t('financial.variable_cost') ||
                                              'Variable Cost'}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                      checked={form.isRecurring}
                                      onCheckedChange={(v) =>
                                        setForm({ ...form, isRecurring: v })
                                      }
                                    />
                                    <Label>
                                      {t('financial.is_recurring') ||
                                        'Is this a recurring expense/income?'}
                                    </Label>
                                  </div>

                                  {form.isRecurring && (
                                    <div className="grid gap-2">
                                      <Label>
                                        {t('financial.recurrence_freq') ||
                                          'Recurrence Frequency'}
                                      </Label>
                                      <Select
                                        value={form.recurrenceFrequency}
                                        onValueChange={(v) =>
                                          setForm({
                                            ...form,
                                            recurrenceFrequency: v,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="monthly">
                                            {t('financial.monthly') ||
                                              'Monthly'}
                                          </SelectItem>
                                          <SelectItem value="yearly">
                                            {t('financial.yearly') || 'Yearly'}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  <div className="grid gap-2">
                                    <Label>
                                      {t('financial.initial_status') ||
                                        'Initial Status'}
                                    </Label>
                                    <Select
                                      value={form.status}
                                      onValueChange={(v) =>
                                        setForm({ ...form, status: v })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          {t('common.pending') || 'Pending'}
                                        </SelectItem>
                                        <SelectItem value="cleared">
                                          {t('financial.cleared') ||
                                            'Paid/Received'}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleEdit}>
                                    {t('financial.save_changes') ||
                                      'Save Changes'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t('financial.delete_transaction') ||
                                      'Delete Transaction'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('financial.delete_confirm') ||
                                      'Are you sure you want to delete this transaction? This action cannot be undone.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t('common.cancel') || 'Cancel'}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(entry.id)}
                                  >
                                    {t('common.delete') || 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {entry.status === 'cleared' && (
                          <div className="text-xs text-slate-400 italic flex items-center gap-1">
                            Locked (Audited)
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredData.entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {t('financial.no_transactions') ||
                      'No transactions found for the selected filters.'}
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
