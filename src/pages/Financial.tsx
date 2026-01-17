import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Upload, FileText, CheckCircle2, DollarSign } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { hasPermission } from '@/lib/permissions'
import { User, BankStatement } from '@/lib/types'
import { useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  YAxis,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export default function Financial() {
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const { bankStatements, uploadBankStatement, ledgerEntries } =
    useFinancialStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [reportPeriod, setReportPeriod] = useState('yearly')

  if (!hasPermission(currentUser as User, 'financial', 'view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado ao painel financeiro.
      </div>
    )
  }

  // Calculate Metrics
  const totalIncome = ledgerEntries
    .filter((e) => e.type === 'income' && e.status === 'cleared')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpense = ledgerEntries
    .filter((e) => e.type === 'expense' && e.status === 'cleared')
    .reduce((sum, e) => sum + e.amount, 0)

  const noi = totalIncome - totalExpense

  // Prepare Chart Data (Group by Month)
  const chartData = ledgerEntries.reduce(
    (acc, entry) => {
      const month = new Date(entry.date).toLocaleString('default', {
        month: 'short',
      })
      const existing = acc.find((d) => d.month === month)
      if (existing) {
        if (entry.type === 'income') existing.income += entry.amount
        else existing.expense += entry.amount
      } else {
        acc.push({
          month,
          income: entry.type === 'income' ? entry.amount : 0,
          expense: entry.type === 'expense' ? entry.amount : 0,
        })
      }
      return acc
    },
    [] as { month: string; income: number; expense: number }[],
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setTimeout(() => {
      const newStatement: BankStatement = {
        id: `stmt-${Date.now()}`,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        itemsCount: Math.floor(Math.random() * 50) + 10,
        totalAmount: Math.floor(Math.random() * 10000) + 1000,
        url: '#',
      }
      uploadBankStatement(newStatement)
      setIsUploading(false)
      toast({
        title: 'Sucesso',
        description: 'Extrato enviado para conciliação.',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('financial.title')}
          </h1>
          <p className="text-muted-foreground">{t('financial.subtitle')}</p>
        </div>
        <Select value={reportPeriod} onValueChange={setReportPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="semiannual">Semestral</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NOI (Líquido)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${noi.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="reconciliation">
            {t('financial.reconciliation')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Receita vs Despesas</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip
                      formatter={(value: number) =>
                        `$${value.toLocaleString()}`
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="income"
                      name="Receita"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Despesa"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('financial.upload_statement')}</CardTitle>
                <CardDescription>{t('financial.upload_desc')}</CardDescription>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.csv"
                  onChange={handleFileUpload}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Enviando...' : 'Upload Extrato'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-4">{t('financial.statements')}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data Upload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankStatements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {t('financial.no_statements')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    bankStatements.map((stmt) => (
                      <TableRow key={stmt.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {stmt.fileName}
                        </TableCell>
                        <TableCell>
                          {new Date(stmt.uploadDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {stmt.status === 'reconciled' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />{' '}
                              {t('financial.reconciled')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {t('financial.pending_reconciliation')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{stmt.itemsCount}</TableCell>
                        <TableCell>
                          ${stmt.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
