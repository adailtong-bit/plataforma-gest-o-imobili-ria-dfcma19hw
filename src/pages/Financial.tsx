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
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { User, BankStatement } from '@/lib/types'
import { useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { FinancialReports } from '@/components/financial/FinancialReports'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'

export default function Financial() {
  const { t, language } = useLanguageStore()
  const { currentUser, hasPermissionSync } = useAuthStore()
  const { bankStatements, uploadBankStatement } = useFinancialStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  if (!hasPermissionSync(currentUser as User, 'financial', 'view')) {
    return (
      <div className="p-8 text-center text-black font-medium">
        {t('common.access_denied_desc')}
      </div>
    )
  }

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
        title: t('common.success'),
        description: t('financial.upload_desc'),
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          {t('financial.title')}
        </h1>
        <p className="text-black font-medium">{t('financial.subtitle')}</p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="bg-slate-100 border border-slate-200">
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
          >
            {t('common.reports')} & Analytics
          </TabsTrigger>
          <TabsTrigger
            value="reconciliation"
            className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
          >
            {t('financial.reconciliation')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="reconciliation">
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-black">
                  {t('financial.upload_statement')}
                </CardTitle>
                <CardDescription className="text-black font-medium">
                  {t('financial.upload_desc')}
                </CardDescription>
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
                  className="bg-trust-blue text-white font-bold"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? '...' : t('financial.upload_statement')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-bold text-black mb-4">
                {t('financial.statements')}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-white hover:bg-white">
                    <TableHead className="font-bold text-black">
                      {t('common.documents')}
                    </TableHead>
                    <TableHead className="font-bold text-black">
                      {t('common.date')}
                    </TableHead>
                    <TableHead className="font-bold text-black">
                      {t('common.status')}
                    </TableHead>
                    <TableHead className="font-bold text-black">
                      {t('reports.total_items')}
                    </TableHead>
                    <TableHead className="font-bold text-black">
                      {t('common.total')}
                    </TableHead>
                    <TableHead className="text-right font-bold text-black">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankStatements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-black font-medium"
                      >
                        {t('financial.no_statements')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    bankStatements.map((stmt) => (
                      <TableRow
                        key={stmt.id}
                        className="bg-white hover:bg-slate-50 border-b border-slate-100"
                      >
                        <TableCell className="font-bold text-black flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-700" />
                          <DataMask>{stmt.fileName}</DataMask>
                        </TableCell>
                        <TableCell className="text-black font-medium">
                          <DataMask>
                            {formatDate(stmt.uploadDate, language)}
                          </DataMask>
                        </TableCell>
                        <TableCell>
                          {stmt.status === 'reconciled' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300 font-bold">
                              <CheckCircle2 className="w-3 h-3 mr-1" />{' '}
                              {t('financial.reconciled')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 border-yellow-300 font-bold"
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {t('financial.pending_reconciliation')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-black font-bold">
                          <DataMask>{stmt.itemsCount}</DataMask>
                        </TableCell>
                        <TableCell className="text-black font-bold">
                          <DataMask>
                            {formatCurrency(stmt.totalAmount, language)}
                          </DataMask>
                        </TableCell>
                        <TableCell className="text-right">
                          {stmt.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 text-black font-medium hover:bg-slate-100"
                            >
                              {t('financial.reconciliation')}
                            </Button>
                          )}
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
