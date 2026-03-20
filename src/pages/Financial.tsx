import { useContext, useState, useMemo } from 'react'
import { AppContext } from '@/stores/AppContext'
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
import { cn } from '@/lib/utils'

export default function Financial() {
  const {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    formatAppCurrency,
    properties,
    owners,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [viewMode, setViewMode] = useState<'pm' | 'owner' | 'property'>('pm')
  const [selectedOwnerId, setSelectedOwnerId] = useState('all')
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')

  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)

  const resetForm = () => {
    setForm({
      description: '',
      amount: '',
      type: 'income',
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
    date: new Date().toISOString().substring(0, 10),
    propertyId: 'none',
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
      // We only update the running real bank balance for cleared items,
      // but for projection purposes we might want to include pending. Let's include all in running balance for the view.
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
    addLedgerEntry({
      id: `ledg-${Date.now()}`,
      description: form.description || 'Nova transação',
      amount: Number(form.amount) || 0,
      type: form.type as 'income' | 'expense',
      date: new Date(form.date).toISOString(),
      status: form.status as 'pending' | 'cleared',
      category: 'other',
      propertyId: form.propertyId === 'none' ? '' : form.propertyId,
      costType: form.costType as 'fixed' | 'variable',
      isRecurring: form.isRecurring,
      recurrenceFrequency: form.recurrenceFrequency as 'monthly' | 'yearly',
      nextRecurrenceGenerated: false,
    })
    setIsAddOpen(false)
    resetForm()
    toast({ title: 'Transação incluída com sucesso' })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateLedgerEntry({
        ...editingRecord,
        description: form.description,
        amount: Number(form.amount),
        type: form.type as 'income' | 'expense',
        date: new Date(form.date).toISOString(),
        propertyId: form.propertyId === 'none' ? '' : form.propertyId,
        costType: form.costType as 'fixed' | 'variable',
        isRecurring: form.isRecurring,
        recurrenceFrequency: form.recurrenceFrequency as 'monthly' | 'yearly',
        status: form.status as 'pending' | 'cleared',
      })
    }
    setEditingRecord(null)
    toast({ title: 'Transação alterada com sucesso' })
  }

  const openEdit = (entry: any) => {
    setEditingRecord(entry)
    setForm({
      description: entry.description,
      amount: entry.amount.toString(),
      type: entry.type,
      date: entry.date.substring(0, 10),
      propertyId: entry.propertyId || 'none',
      costType: entry.costType || 'variable',
      isRecurring: entry.isRecurring || false,
      recurrenceFrequency: entry.recurrenceFrequency || 'monthly',
      status: entry.status || 'pending',
    })
  }

  const handleDelete = (id: string) => {
    deleteLedgerEntry(id)
    toast({ title: 'Transação excluída com sucesso' })
  }

  const markAsPaid = (entry: any) => {
    updateLedgerEntry({
      ...entry,
      status: 'cleared',
      paymentDate: new Date().toISOString(),
    })
    toast({ title: 'Transação marcada como paga' })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.financial') || 'Financeiro'}
          </h1>
          <p className="text-muted-foreground">
            Gestão de contas correntes, custos fixos e variáveis.
          </p>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(val) => {
            if (val) resetForm()
            setIsAddOpen(val)
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> Incluir Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Incluir Transação</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Conta de Luz, Aluguel..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Propriedade (Opcional)</Label>
                  <Select
                    value={form.propertyId}
                    onValueChange={(v) => setForm({ ...form, propertyId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Geral" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geral (PM)</SelectItem>
                      {properties.map((p) => (
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
                  <Label>Categoria de Custo</Label>
                  <Select
                    value={form.costType}
                    onValueChange={(v) => setForm({ ...form, costType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">
                        Custo Fixo (Condomínio, Água, Luz)
                      </SelectItem>
                      <SelectItem value="variable">
                        Custo Variável (Limpeza, Manutenção)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={form.isRecurring}
                  onCheckedChange={(v) => setForm({ ...form, isRecurring: v })}
                />
                <Label>É uma despesa/receita recorrente?</Label>
              </div>

              {form.isRecurring && (
                <div className="grid gap-2">
                  <Label>Frequência de Repetição</Label>
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
                      <SelectItem value="monthly">Mensalmente</SelectItem>
                      <SelectItem value="yearly">Anualmente</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao marcar este item como "Pago", o sistema irá gerar
                    automaticamente o lançamento do próximo mês/ano.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Status Inicial</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cleared">Pago/Recebido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar Lançamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Painel de Saldos e Relatórios
          </CardTitle>
          <CardDescription>
            Visualize o saldo da conta corrente filtrado pela sua preferência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <Tabs
                value={viewMode}
                onValueChange={(v: any) => {
                  setViewMode(v)
                  setSelectedOwnerId('all')
                  setSelectedPropertyId('all')
                }}
              >
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                  <TabsTrigger value="pm" className="gap-2">
                    <Building className="w-4 h-4 hidden sm:block" /> PM (Geral)
                  </TabsTrigger>
                  <TabsTrigger value="owner" className="gap-2">
                    <User className="w-4 h-4 hidden sm:block" /> Proprietário
                  </TabsTrigger>
                  <TabsTrigger value="property" className="gap-2">
                    <Building className="w-4 h-4 hidden sm:block" /> Propriedade
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {viewMode === 'owner' && (
                <div className="w-full md:w-[400px]">
                  <Select
                    value={selectedOwnerId}
                    onValueChange={setSelectedOwnerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Proprietário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todos os Proprietários
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
                      <SelectValue placeholder="Selecione a Propriedade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Propriedades</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                <span className="hidden xl:inline">Filtros:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-[140px] sm:w-[160px] bg-white">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="maintenance">Manutenções</SelectItem>
                    <SelectItem value="cleaning">Limpezas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-[140px] sm:w-[160px] bg-white">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo o Período</SelectItem>
                    <SelectItem value="month">Mês Atual</SelectItem>
                    <SelectItem value="semester">Semestre</SelectItem>
                    <SelectItem value="year">Ano Fiscal</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
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
                  Saldo Final Projetado
                </div>
                <div
                  className={cn(
                    'text-3xl font-bold',
                    balances.currentBalance >= 0
                      ? 'text-green-700'
                      : 'text-red-700',
                  )}
                >
                  {formatAppCurrency(balances.currentBalance)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Saldo projetado incluindo o histórico filtrado
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600 mb-1">
                  Total Receitas (No Período)
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatAppCurrency(balances.income)}
                </div>
                {balances.pendingIncome > 0 && (
                  <div className="text-xs text-blue-600 mt-2">
                    +{formatAppCurrency(balances.pendingIncome)} pendentes
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-slate-600 mb-1">
                  Total Despesas (No Período)
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatAppCurrency(balances.expense)}
                </div>
                {balances.pendingExpense > 0 && (
                  <div className="text-xs text-orange-600 mt-2">
                    +{formatAppCurrency(balances.pendingExpense)} pendentes
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg">Extrato de Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo / Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                              ?.name || 'Propriedade Excluída'}
                          </span>
                        )}
                        {entry.isRecurring && (
                          <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {entry.recurrenceFrequency === 'monthly'
                              ? 'Mensal'
                              : 'Anual'}
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
                          {isIncome ? 'Receita' : 'Despesa'}
                        </Badge>
                        {!isIncome && entry.costType && (
                          <Badge
                            variant="outline"
                            className="text-xs border-slate-300"
                          >
                            {entry.costType === 'fixed'
                              ? 'Custo Fixo'
                              : 'Custo Variável'}
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
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Pago
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" /> Pendente
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
                      {formatAppCurrency(entry.amount)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-bold',
                        entry.runningBalance >= 0
                          ? 'text-slate-900'
                          : 'text-red-600',
                      )}
                    >
                      {formatAppCurrency(entry.runningBalance)}
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
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Pagar
                          </Button>
                        )}
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
                              <DialogTitle>Alterar Transação</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Tipo</Label>
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
                                        Receita
                                      </SelectItem>
                                      <SelectItem value="expense">
                                        Despesa
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Data</Label>
                                  <Input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) =>
                                      setForm({ ...form, date: e.target.value })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label>Descrição</Label>
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

                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Valor</Label>
                                  <Input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        amount: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Propriedade</Label>
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
                                      <SelectItem value="none">
                                        Geral (PM)
                                      </SelectItem>
                                      {properties.map((p) => (
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
                                  <Label>Categoria de Custo</Label>
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
                                        Custo Fixo
                                      </SelectItem>
                                      <SelectItem value="variable">
                                        Custo Variável
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
                                <Label>É uma despesa/receita recorrente?</Label>
                              </div>

                              {form.isRecurring && (
                                <div className="grid gap-2">
                                  <Label>Frequência</Label>
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
                                        Mensal
                                      </SelectItem>
                                      <SelectItem value="yearly">
                                        Anual
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div className="grid gap-2">
                                <Label>Status</Label>
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
                                      Pendente
                                    </SelectItem>
                                    <SelectItem value="cleared">
                                      Pago/Recebido
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleEdit}>
                                Salvar Alterações
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
                                Excluir Transação
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta transação?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(entry.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                    Nenhuma transação encontrada para os filtros selecionados.
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
