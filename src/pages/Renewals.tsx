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
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useNavigate, Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { CloseNegotiationDialog } from '@/components/renewals/CloseNegotiationDialog'
import { GenericDocument } from '@/lib/types'

export default function Renewals() {
  const { tenants, renewTenantContract } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [filterStatus, setFilterStatus] = useState<
    'all' | 'critical' | 'upcoming'
  >('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)

  // Filter tenants with active leases
  const activeTenants = tenants.filter(
    (t) => t.status === 'active' && t.leaseEnd,
  )

  const renewalData = activeTenants
    .map((t) => {
      const daysLeft = differenceInDays(new Date(t.leaseEnd!), new Date())
      const property = properties.find((p) => p.id === t.propertyId)
      const owner = owners.find((o) => o.id === property?.ownerId)

      let status: 'critical' | 'upcoming' | 'safe' = 'safe'
      if (daysLeft < 30) status = 'critical'
      else if (daysLeft < 90) status = 'upcoming'

      return {
        tenant: t,
        property,
        owner,
        daysLeft,
        status,
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
                <TableHead>{t('common.owners')}</TableHead>
                <TableHead>{t('tenants.new_tenant')}</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhuma renovação pendente.
                  </TableCell>
                </TableRow>
              ) : (
                renewalData.map(
                  ({ tenant, property, owner, daysLeft, status }) => (
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
                      <TableCell>{owner?.name || '-'}</TableCell>
                      <TableCell>{tenant.name}</TableCell>
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
                            {daysLeft} {t('renewals.days_left')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
