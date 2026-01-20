import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Building,
  History,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useNavigate, Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { CloseNegotiationDialog } from '@/components/renewals/CloseNegotiationDialog'
import { GenericDocument, NegotiationStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Renewals() {
  const { tenants, renewTenantContract } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [filterStatus, setFilterStatus] = useState<
    'all' | 'critical' | 'upcoming' | 'renewed'
  >('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)

  // Filter tenants with active leases or recently renewed
  const activeTenants = tenants.filter(
    (t) => t.status === 'active' && t.leaseEnd,
  )

  const renewalData = activeTenants
    .map((t) => {
      const daysLeft = differenceInDays(new Date(t.leaseEnd!), new Date())
      const property = properties.find((p) => p.id === t.propertyId)
      const owner = owners.find((o) => o.id === property?.ownerId)

      let status: 'critical' | 'upcoming' | 'safe' | 'renewed' = 'safe'
      if (daysLeft < 30) status = 'critical'
      else if (daysLeft < 90) status = 'upcoming'

      // Simple logic for 'renewed' - if daysLeft > 180 and was recently updated (mock)
      if (daysLeft > 180) status = 'renewed'

      return {
        tenant: t,
        property,
        owner,
        daysLeft,
        status,
        negotiationStatus: t.negotiationStatus || 'negotiating',
      }
    })
    .filter((item) => {
      // Status Filter
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      // Owner Filter
      if (selectedOwner !== 'all' && item.owner?.id !== selectedOwner)
        return false
      // Search Term
      if (
        searchTerm &&
        !item.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }
      return true
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const handleStartNegotiation = (tenantId: string) => {
    navigate(`/messages?contactId=${tenantId}&context=renewal`)
    toast({
      title: t('renewals.negotiation_started'),
      description: 'Redirecionando para o chat com o inquilino.',
    })
  }

  const handleOpenCloseDialog = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    setDialogOpen(true)
  }

  const handleCloseNegotiation = (data: {
    newValue: number
    newStart: string
    newEnd: string
    contractUrl: string
  }) => {
    if (selectedTenantId) {
      // Create document object
      const contractDoc: GenericDocument = {
        id: `contract-${Date.now()}`,
        name: 'Renovação de Contrato.pdf',
        url: data.contractUrl,
        date: new Date().toISOString(),
        type: 'application/pdf',
        category: 'Contract',
      }

      renewTenantContract(
        selectedTenantId,
        data.newEnd,
        data.newValue,
        data.newStart,
        contractDoc,
      )

      setSelectedTenantId(null)
    }
  }

  const currentTenantValue = selectedTenantId
    ? tenants.find((t) => t.id === selectedTenantId)?.rentValue || 0
    : 0

  // Count metrics for cards
  const criticalCount = renewalData.filter(
    (d) => d.status === 'critical',
  ).length
  const upcomingCount = renewalData.filter(
    (d) => d.status === 'upcoming',
  ).length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'negotiating':
        return (
          <Badge variant="outline" className="bg-yellow-50">
            Em Negociação
          </Badge>
        )
      case 'owner_contacted':
        return (
          <Badge variant="outline" className="bg-blue-50">
            Proprietário Contatado
          </Badge>
        )
      case 'tenant_contacted':
        return (
          <Badge variant="outline" className="bg-purple-50">
            Inquilino Contatado
          </Badge>
        )
      case 'vacating':
        return <Badge variant="destructive">Desocupando</Badge>
      case 'closed':
        return <Badge className="bg-green-600">Fechado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('renewals.title')}
        </h1>
        <p className="text-muted-foreground">{t('renewals.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="bg-red-50 border-red-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus('critical')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> {t('renewals.critical')} (
              &lt; 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800">
              {criticalCount}
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-orange-50 border-orange-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterStatus('upcoming')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Clock className="h-5 w-5" /> {t('renewals.upcoming')} (30-90
              dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">
              {upcomingCount}
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-green-50 border-green-100 cursor-pointer hover:shadow-md"
          onClick={() => setFilterStatus('renewed')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Renovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">
              {activeTenants.length - criticalCount - upcomingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('renewals.search_placeholder')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v: any) => setFilterStatus(v)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="critical">{t('renewals.critical')}</SelectItem>
            <SelectItem value="upcoming">{t('renewals.upcoming')}</SelectItem>
            <SelectItem value="renewed">Renovados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedOwner} onValueChange={setSelectedOwner}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={t('common.owners')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>{t('tenants.new_tenant')}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sugestão ($)</TableHead>
                <TableHead>{t('renewals.current_value')}</TableHead>
                <TableHead>{t('common.due_date')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewalData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Nenhuma renovação pendente.
                  </TableCell>
                </TableRow>
              ) : (
                renewalData.map(
                  ({
                    tenant,
                    property,
                    owner,
                    daysLeft,
                    status,
                    negotiationStatus,
                  }) => (
                    <TableRow
                      key={tenant.id}
                      className={status === 'critical' ? 'bg-red-50/30' : ''}
                    >
                      <TableCell>
                        {property ? (
                          <Link
                            to={`/properties/${property.id}`}
                            className="flex items-center gap-2 hover:text-blue-600 hover:underline font-medium"
                          >
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {property.name}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{tenant.name}</TableCell>
                      <TableCell>{getStatusBadge(negotiationStatus)}</TableCell>
                      <TableCell>
                        {tenant.suggestedRenewalPrice
                          ? `${tenant.suggestedRenewalPrice}`
                          : '-'}
                      </TableCell>
                      <TableCell>${tenant.rentValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            className={
                              status === 'critical'
                                ? 'text-red-600 font-bold'
                                : 'font-medium'
                            }
                          >
                            {format(new Date(tenant.leaseEnd!), 'dd/MM/yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {daysLeft > 0
                              ? `${daysLeft} dias restantes`
                              : 'Vencido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Logs de Negociação"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Histórico de Negociação
                                </DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                {tenant.negotiationLogs &&
                                tenant.negotiationLogs.length > 0 ? (
                                  tenant.negotiationLogs.map((log) => (
                                    <div key={log.id} className="mb-4 text-sm">
                                      <div className="flex justify-between font-semibold">
                                        <span>{log.action}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {format(
                                            new Date(log.date),
                                            'dd/MM/yyyy HH:mm',
                                          )}
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground">
                                        {log.note}
                                      </p>
                                      <span className="text-xs italic">
                                        Por: {log.user}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted-foreground text-center">
                                    Nenhum registro.
                                  </p>
                                )}
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartNegotiation(tenant.id)}
                            title={t('renewals.negotiate')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />{' '}
                            {t('renewals.negotiate')}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-trust-blue"
                            onClick={() => handleOpenCloseDialog(tenant.id)}
                            title={t('renewals.close_negotiation')}
                          >
                            <FileText className="h-4 w-4 mr-2" /> Fechar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CloseNegotiationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleCloseNegotiation}
        currentValue={currentTenantValue}
      />
    </div>
  )
}
