import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export default function Renewals() {
  const { tenants } = useTenantStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [filter, setFilter] = useState<'all' | 'critical' | 'upcoming'>('all')

  // Filter tenants with active leases
  const activeTenants = tenants.filter(
    (t) => t.status === 'active' && t.leaseEnd,
  )

  const renewalData = activeTenants
    .map((t) => {
      const daysLeft = differenceInDays(new Date(t.leaseEnd!), new Date())
      const property = properties.find((p) => p.id === t.propertyId)

      let status: 'critical' | 'upcoming' | 'safe' = 'safe'
      if (daysLeft < 30) status = 'critical'
      else if (daysLeft < 90) status = 'upcoming'

      return {
        tenant: t,
        property,
        daysLeft,
        status,
      }
    })
    .filter((item) => {
      if (filter === 'all') return item.status !== 'safe' // Show only relevant renewals by default in dashboard
      return item.status === filter
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const handleStartNegotiation = (tenantId: string) => {
    navigate(`/messages?contactId=${tenantId}&context=renewal`)
    toast({
      title: 'Negociação Iniciada',
      description: 'Redirecionando para o chat com o inquilino.',
    })
  }

  const handleSendProposal = (tenantId: string) => {
    toast({
      title: 'Proposta Enviada',
      description: 'Nova minuta de contrato enviada por email.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Renovação de Contratos
        </h1>
        <p className="text-muted-foreground">
          Gestão de vencimentos e negociações de LTR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Críticos (&lt; 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800">
              {renewalData.filter((d) => d.status === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" /> Próximos (30-90 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">
              {renewalData.filter((d) => d.status === 'upcoming').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Renovados (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">4</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fila de Renovação</CardTitle>
          <CardDescription>
            Contratos vencendo nos próximos 90 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquilino</TableHead>
                <TableHead>Propriedade</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewalData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhuma renovação pendente.
                  </TableCell>
                </TableRow>
              ) : (
                renewalData.map(({ tenant, property, daysLeft, status }) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{property?.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {format(new Date(tenant.leaseEnd!), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {daysLeft} dias restantes
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {status === 'critical' ? (
                        <Badge variant="destructive">Crítico</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                          Atenção
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartNegotiation(tenant.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" /> Negociar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-trust-blue"
                          onClick={() => handleSendProposal(tenant.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" /> Proposta
                        </Button>
                      </div>
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

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
