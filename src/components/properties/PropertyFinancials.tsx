import { useState } from 'react'
import { Property, Owner, Partner, LedgerEntry } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { PropertyLedger } from '@/components/financial/PropertyLedger'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PropertyFinancialsProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  owners: Owner[]
  partners: Partner[]
}

export function PropertyFinancials({
  data,
  onChange,
  canEdit,
  owners,
  partners,
}: PropertyFinancialsProps) {
  const { toast } = useToast()
  const { t, language } = useLanguageStore()
  const {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    currency,
    financials: { invoices },
  } = useFinancialStore()

  const [openExpense, setOpenExpense] = useState(false)
  const [confirmActionOpen, setConfirmActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'add' | 'edit'>('add')
  const [currentExpenseId, setCurrentExpenseId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurrenceFrequency: 'monthly',
  })

  // Filter entries to only match this property
  const propertyEntries = ledgerEntries.filter((e) => e.propertyId === data.id)

  // Isolate recurring expenses for the fixed expenses table view
  const recurringEntries = propertyEntries.filter(
    (e) => e.isRecurring && e.type === 'expense',
  )

  const handleOpenAdd = () => {
    setFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      recurrenceFrequency: 'monthly',
    })
    setCurrentExpenseId(null)
    setActionType('add')
    setOpenExpense(true)
  }

  const handleOpenEdit = (entry: LedgerEntry) => {
    setFormData({
      description: entry.description,
      amount: entry.amount,
      date: entry.date.split('T')[0],
      recurrenceFrequency: entry.recurrenceFrequency || 'monthly',
    })
    setCurrentExpenseId(entry.id)
    setActionType('edit')
    setOpenExpense(true)
  }

  const validateForm = () => {
    if (!formData.description || !formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return false
    }

    if (formData.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than zero.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handlePreSubmit = () => {
    if (!validateForm()) return
    if (actionType === 'add') {
      executeSave()
    } else {
      setConfirmActionOpen(true)
    }
  }

  const executeSave = () => {
    if (actionType === 'add') {
      addLedgerEntry({
        propertyId: data.id,
        description: formData.description,
        amount: formData.amount,
        type: 'expense',
        category: 'fixed_expense',
        date: new Date(formData.date).toISOString(),
        isRecurring: true,
        recurrenceFrequency: formData.recurrenceFrequency as
          | 'monthly'
          | 'yearly',
        status: 'pending',
      })

      toast({
        title: t('common.success'),
        description: t('common.save'),
      })
    } else if (currentExpenseId) {
      const existing = ledgerEntries.find((e) => e.id === currentExpenseId)
      if (existing) {
        updateLedgerEntry({
          ...existing,
          description: formData.description,
          amount: formData.amount,
          date: new Date(formData.date).toISOString(),
          recurrenceFrequency: formData.recurrenceFrequency as
            | 'monthly'
            | 'yearly',
        })

        toast({
          title: t('common.success'),
          description: t('common.save'),
        })
      }
    }

    setConfirmActionOpen(false)
    setOpenExpense(false)
  }

  const handleRemoveExpense = (id: string) => {
    deleteLedgerEntry(id)
    toast({
      title: t('common.removed'),
      description: t('common.delete_success'),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('properties.tabs.financial')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>{t('common.owners')}</Label>
            <Select
              value={data.ownerId || 'none'}
              onValueChange={(v) =>
                onChange('ownerId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('partners.agent')}</Label>
            <Select
              value={data.agentId || 'none'}
              onValueChange={(v) =>
                onChange('agentId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                {partners
                  .filter((p) => p.type === 'agent')
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-2 pt-4">
            <h3 className="font-semibold text-sm">
              {t('properties.hoa_fee') || 'Taxa de Condomínio'}
            </h3>
          </div>
          <div className="grid gap-2">
            <Label>{t('properties.hoa_fee')}</Label>
            <CurrencyInput
              value={data.hoaValue || 0}
              onChange={(val) => onChange('hoaValue', val)}
              disabled={!canEdit}
              currency={currency}
              locale={
                language === 'pt'
                  ? 'pt-BR'
                  : language === 'es'
                    ? 'es-ES'
                    : 'en-US'
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('properties.hoa_freq')}</Label>
            <Select
              value={data.hoaFrequency || 'monthly'}
              onValueChange={(v) => onChange('hoaFrequency', v)}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  {t('properties.monthly')}
                </SelectItem>
                <SelectItem value="quarterly">
                  {t('properties.quarterly')}
                </SelectItem>
                <SelectItem value="semi-annually">
                  {t('properties.annually')} (2x)
                </SelectItem>
                <SelectItem value="annually">
                  {t('properties.annually')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('common.financial') || 'Fixed Expenses'}</CardTitle>
          <Button onClick={handleOpenAdd} className="bg-trust-blue gap-2">
            <Plus className="h-4 w-4" /> {t('common.add_title')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.description')}</TableHead>
                <TableHead>{t('common.value')}</TableHead>
                <TableHead>{t('common.frequency') || 'Frequency'}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringEntries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
              {recurringEntries.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(expense.amount, currency)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {expense.recurrenceFrequency || 'Monthly'}
                  </TableCell>
                  <TableCell>{formatDate(expense.date, language)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
                              onClick={() => handleRemoveExpense(expense.id)}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.invoices', 'Invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('common.number', 'Number')}</TableHead>
                <TableHead>{t('common.description', 'Description')}</TableHead>
                <TableHead>{t('common.value', 'Value')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.filter((inv) => inv.propertyId === data.id).length ===
                0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty', 'No records found.')}
                  </TableCell>
                </TableRow>
              )}
              {invoices
                .filter((inv) => inv.propertyId === data.id)
                .map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.date, language)}</TableCell>
                    <TableCell>
                      {invoice.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>
                      {formatCurrency(invoice.amount, currency)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {invoice.status}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <PropertyLedger propertyId={data.id} entries={propertyEntries} />
        </CardContent>
      </Card>

      <Dialog open={openExpense} onOpenChange={setOpenExpense}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'add' ? t('common.new') : t('common.edit')}
            </DialogTitle>
            <DialogDescription>{t('common.details')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                {t('common.description')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t('properties.financial_fields.name_placeholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t('common.value')} <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      amount: val,
                    })
                  }
                  currency={currency}
                  locale={
                    language === 'pt'
                      ? 'pt-BR'
                      : language === 'es'
                        ? 'es-ES'
                        : 'en-US'
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t('common.date')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>{t('common.frequency') || 'Frequency'}</Label>
                <Select
                  value={formData.recurrenceFrequency}
                  onValueChange={(v) =>
                    setFormData({ ...formData, recurrenceFrequency: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenExpense(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handlePreSubmit} className="bg-trust-blue">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmActionOpen} onOpenChange={setConfirmActionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmActionOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeSave}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
