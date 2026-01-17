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
import { Upload, FileText, CheckCircle2 } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { hasPermission } from '@/lib/permissions'
import { User, BankStatement } from '@/lib/types'
import { useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function Financial() {
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const { bankStatements, uploadBankStatement } = useFinancialStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  if (!hasPermission(currentUser as User, 'financial', 'view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado ao painel financeiro.
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
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reconciliation">
            {t('financial.reconciliation')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Conteúdo financeiro visível apenas para usuários autorizados.
              </p>
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
