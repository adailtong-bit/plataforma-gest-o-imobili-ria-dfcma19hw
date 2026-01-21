import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Search,
  Building,
  ClipboardList,
  User,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useNavigate, Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { CloseNegotiationDialog } from '@/components/renewals/CloseNegotiationDialog'
import { NegotiationSheet } from '@/components/renewals/NegotiationSheet'
import { GenericDocument } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Renewals() {
  const { tenants, renewTenantContract } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  // Filter Status
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'critical' | 'upcoming' | 'year' | 'renewed'
  >('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)

  // Filter tenants active or recently renewed
  const relevantTenants = tenants.filter(
    (t) => t.status === 'active' || t.negotiationStatus === 'closed',
  )

  // Pre-calculate data
  const mappedData = relevantTenants.map((t) => {
    let daysLeft = 9999
    try {
      if (t.leaseEnd) {
        daysLeft = differenceInDays(new Date(t.leaseEnd), new Date())
      }
    } catch (e) {
      console.error('Invalid date', e)
    }

    const property = properties.find((p) => p.id === t.propertyId)
    const owner = owners.find((o) => o.id === property?.ownerId)

    // Display Status (Exclusive for Badge Color)
    let displayStatus: 'critical' | 'upcoming' | 'year' | 'safe' | 'renewed' =
      'safe'

    if (t.negotiationStatus === 'closed') {
      displayStatus = 'renewed'
    } else {
      if (daysLeft < 30) displayStatus = 'critical'
      else if (daysLeft < 90) displayStatus = 'upcoming'
      else if (daysLeft < 365) displayStatus = 'year'
    }

    return {
      tenant: t,
      property,
      owner,
      daysLeft,
      displayStatus,
      negotiationStatus: t.negotiationStatus || 'negotiating',
    }
  })

  const renewalData = mappedData
    .filter((item) => {
      // Cumulative Filter Logic
      if (filterStatus !== 'all') {
        if (filterStatus === 'renewed') {
          if (item.displayStatus !== 'renewed') return false
        } else if (item.displayStatus === 'renewed') {
          return false // Don't show renewed in day-based filters
        } else {
          // Day based filters
          if (filterStatus === 'critical' && item.daysLeft >= 30) return false
          if (filterStatus === 'upcoming' && item.daysLeft >= 90) return false
          if (filterStatus === 'year' && item.daysLeft >= 365) return false
        }
      }

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

  const handleOpenSheet = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    setSheetOpen(true)
  }

  const handleCloseNegotiation = (data: {
    newValue: number
    newStart: string
    newEnd: string
    contractUrl: string
  }) => {
    if (selectedTenantId) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'negotiating':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Em Negociação
          </Badge>
        )
      case 'owner_contacted':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Proprietário Contatado
          </Badge>
        )
      case 'tenant_contacted':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Inquilino Contatado
          </Badge>
        )
      case 'vacating':
        return <Badge variant="destructive">Inquilino vai desocupar</Badge>
      case 'closed':
        return <Badge className="bg-green-600">Fechado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  // Calculate cumulative counts
  const criticalCount = mappedData.filter(
    (d) => d.displayStatus !== 'renewed' && d.daysLeft < 30,
  ).length
  const upcomingCount = mappedData.filter(
    (d) => d.displayStatus !== 'renewed' && d.daysLeft < 90,
  ).length
  const yearCount = mappedData.filter(
    (d) => d.displayStatus !== 'renewed' && d.daysLeft < 365,
  ).length
  const renewedCount = mappedData.filter(
    (d) => d.displayStatus === 'renewed',
  ).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('renewals.title')}
        </h1>
        <p className="text-muted-foreground">{t('renewals.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Button
          variant={filterStatus === 'critical' ? 'default' : 'outline'}
          className={cn(
            'gap-2',
            filterStatus === 'critical' && 'bg-red-600 hover:bg-red-700',
          )}
          onClick={() =>
            setFilterStatus(filterStatus === 'critical' ? 'all' : 'critical')
          }
        >
          {t('renewals.critical')} (&lt; 30d)
          <Badge
            variant="secondary"
            className="ml-1 bg-white/20 text-current hover:bg-white/30"
          >
            {criticalCount}
          </Badge>
        </Button>

        <Button
          variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
          className={cn(
            'gap-2',
            filterStatus === 'upcoming' &&
              'bg-orange-500 hover:bg-orange-600 text-white',
          )}
          onClick={() =>
            setFilterStatus(filterStatus === 'upcoming' ? 'all' : 'upcoming')
          }
        >
          {t('renewals.upcoming')} (&lt; 90d)
          <Badge
            variant="secondary"
            className="ml-1 bg-white/20 text-current hover:bg-white/30"
          >
            {upcomingCount}
          </Badge>
        </Button>

        <Button
          variant={filterStatus === 'year' ? 'default' : 'outline'}
          className={cn(
            'gap-2',
            filterStatus === 'year' && 'bg-blue-600 hover:bg-blue-700',
          )}
          onClick={() =>
            setFilterStatus(filterStatus === 'year' ? 'all' : 'year')
          }
        >
          1 Ano (&lt; 365d)
          <Badge
            variant="secondary"
            className="ml-1 bg-white/20 text-current hover:bg-white/30"
          >
            {yearCount}
          </Badge>
        </Button>

        <Button
          variant={filterStatus === 'renewed' ? 'default' : 'outline'}
          className={cn(
            'gap-2',
            filterStatus === 'renewed' && 'bg-green-600 hover:bg-green-700',
          )}
          onClick={() =>
            setFilterStatus(filterStatus === 'renewed' ? 'all' : 'renewed')
          }
        >
          Renovados
          <Badge
            variant="secondary"
            className="ml-1 bg-white/20 text-current hover:bg-white/30"
          >
            {renewedCount}
          </Badge>
        </Button>
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
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhuma renovação correspondente aos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                renewalData.map(
                  ({
                    tenant,
                    property,
                    owner,
                    daysLeft,
                    displayStatus,
                    negotiationStatus,
                  }) => (
                    <TableRow
                      key={tenant.id}
                      className={
                        displayStatus === 'critical' ? 'bg-red-50/30' : ''
                      }
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
                      <TableCell>
                        {owner ? (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{owner.name}</span>
                          </div>
                        ) : (
                          '-'
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
                              displayStatus === 'critical'
                                ? 'text-red-600 font-bold'
                                : 'font-medium'
                            }
                          >
                            {tenant.leaseEnd
                              ? format(new Date(tenant.leaseEnd), 'dd/MM/yyyy')
                              : 'N/A'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {displayStatus === 'renewed'
                              ? 'Renovado'
                              : daysLeft > 0
                                ? `${daysLeft} dias restantes`
                                : 'Vencido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenSheet(tenant.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unified Negotiation Details & Chat</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartNegotiation(tenant.id)}
                            title={t('renewals.negotiate')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>

                          {negotiationStatus !== 'closed' && (
                            <Button
                              size="sm"
                              className="bg-trust-blue"
                              onClick={() => handleOpenCloseDialog(tenant.id)}
                              title={t('renewals.close_negotiation')}
                            >
                              <FileText className="h-4 w-4 mr-2" /> Fechar
                            </Button>
                          )}
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

      <NegotiationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tenantId={selectedTenantId}
      />
    </div>
  )
}
