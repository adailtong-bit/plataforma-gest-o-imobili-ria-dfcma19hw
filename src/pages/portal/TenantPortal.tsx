import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuthStore from '@/stores/useAuthStore'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useMessageStore from '@/stores/useMessageStore'
import { useNavigate } from 'react-router-dom'
import { Home, DollarSign, MessageSquare, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function TenantPortal() {
  const { currentUser } = useAuthStore()
  const { tenants } = useTenantStore()
  const { properties } = usePropertyStore()
  const { ledgerEntries } = useFinancialStore()
  const navigate = useNavigate()

  const tenantRecord = tenants.find(
    (t) => t.id === currentUser.id || t.email === currentUser.email,
  )

  if (!tenantRecord) {
    return <div className="p-8">Inquilino não encontrado.</div>
  }

  const property = properties.find((p) => p.id === tenantRecord.propertyId)

  const myPayments = ledgerEntries.filter(
    (e) => e.beneficiaryId === tenantRecord.id || e.category === 'Rent',
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Portal do Inquilino
        </h1>
        <p className="text-muted-foreground">Bem-vindo, {tenantRecord.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lease Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" /> Meu Aluguel
            </CardTitle>
            <CardDescription>Detalhes do contrato atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {property ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Propriedade
                  </p>
                  <p className="text-lg font-semibold">{property.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Valor do Aluguel
                  </p>
                  <p className="text-lg font-semibold text-green-700">
                    ${tenantRecord.rentValue.toFixed(2)}/mês
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vigência
                  </p>
                  <p className="text-sm">
                    {tenantRecord.leaseStart
                      ? format(new Date(tenantRecord.leaseStart), 'dd/MM/yyyy')
                      : 'N/A'}{' '}
                    -
                    {tenantRecord.leaseEnd
                      ? format(new Date(tenantRecord.leaseEnd), 'dd/MM/yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge>{tenantRecord.status}</Badge>
                </div>
              </div>
            ) : (
              <p>Nenhuma propriedade vinculada.</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Baixar Contrato
              </Button>
              <Button
                className="w-full sm:w-auto bg-trust-blue"
                onClick={() => navigate('/messages')}
              >
                Contatar Manager
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-yellow-800">
                    Próximo Pagamento
                  </p>
                  <p className="text-xs text-yellow-700">Vence em breve</p>
                </div>
              </div>
              <Button className="w-full" variant="secondary">
                Solicitar Manutenção
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum registro.
                  </TableCell>
                </TableRow>
              ) : (
                myPayments.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell>
                      {format(new Date(pay.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{pay.description}</TableCell>
                    <TableCell>${pay.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pay.status === 'cleared' ? 'default' : 'outline'
                        }
                      >
                        {pay.status === 'cleared' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
