import { useState, useMemo, memo } from 'react'
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
  Calendar as CalendarIcon,
  List as ListIcon,
  Download,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useNavigate, Link } from 'react-router-dom'
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
} from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { CloseNegotiationDialog } from '@/components/renewals/CloseNegotiationDialog'
import { NegotiationSheet } from '@/components/renewals/NegotiationSheet'
import { GenericDocument } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import useAuthStore from '@/stores/useAuthStore'
import { DataMask } from '@/components/DataMask'

// Optimized Row Component
const RenewalRow = memo(
  ({
    data,
    isSelected,
    onSelect,
    onOpenSheet,
    onStartNegotiation,
    onCloseNegotiation,
    showFinancials,
    language,
    t,
  }: {
    data: any
    isSelected: boolean
    onSelect: (id: string, checked: boolean) => void
    onOpenSheet: (id: string) => void
    onStartNegotiation: (id: string) => void
    onCloseNegotiation: (id: string) => void
    showFinancials: boolean
    language: any
    t: (key: string) => string
  }) => {
    const {
      tenant,
      property,
      owner,
      daysLeft,
      displayStatus,
      negotiationStatus,
    } = data

    return (
      <TableRow className={displayStatus === 'critical' ? 'bg-red-50/30' : ''}>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(c) => onSelect(tenant.id, c as boolean)}
          />
        </TableCell>
        <TableCell>
          {property ? (
            <Link
              to={`/properties/${property.id}`}
              className="flex items-center gap-2 hover:text-blue-700 hover:underline font-bold text-slate-900"
            >
              <Building className="h-4 w-4 text-slate-600" />
              <DataMask>{property.name}</DataMask>
            </Link>
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell>
          {owner ? (
            <div className="flex items-center gap-2 text-slate-900 font-medium">
              <User className="h-3 w-3 text-slate-600" />
              <span>
                <DataMask>{owner.name}</DataMask>
              </span>
            </div>
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell className="text-slate-900 font-medium">
          <DataMask>{tenant.name}</DataMask>
        </TableCell>
        <TableCell>
          <BadgeStatus status={negotiationStatus} t={t} />
        </TableCell>
        {showFinancials && (
          <TableCell className="text-slate-900 font-medium">
            <DataMask>
              {tenant.suggestedRenewalPrice
                ? formatCurrency(tenant.suggestedRenewalPrice, language)
                : '-'}
            </DataMask>
          </TableCell>
        )}
        {showFinancials && (
          <TableCell className="text-slate-900 font-medium">
            <DataMask>
              {formatCurrency(tenant.rentValue ?? 0, language)}
            </DataMask>
          </TableCell>
        )}
        <TableCell>
          <div className="flex flex-col">
            <span
              className={
                displayStatus === 'critical'
                  ? 'text-red-700 font-bold'
                  : 'font-bold text-slate-900'
              }
            >
              {tenant.leaseEnd ? formatDate(tenant.leaseEnd, language) : 'N/A'}
            </span>
            <span className="text-xs text-slate-700 font-medium">
              {displayStatus === 'renewed'
                ? t('common.renewals')
                : daysLeft > 0
                  ? `${daysLeft} days left`
                  : t('common.overdue')}
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
                  onClick={() => onOpenSheet(tenant.id)}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                >
                  <ClipboardList className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('common.details')}</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartNegotiation(tenant.id)}
              title={t('renewals.negotiation_started')}
              className="text-slate-900 font-medium border-slate-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>

            {negotiationStatus !== 'closed' && (
              <Button
                size="sm"
                className="bg-trust-blue text-white font-bold"
                onClick={() => onCloseNegotiation(tenant.id)}
                title={t('renewals.close_negotiation')}
              >
                <FileText className="h-4 w-4 mr-2" /> {t('common.close')}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    )
  },
)

const BadgeStatus = ({
  status,
  t,
}: {
  status: string
  t: (key: string) => string
}) => {
  switch (status) {
    case 'negotiating':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-800 border-yellow-300 font-bold"
        >
          {t('status.negotiating') || 'Negotiating'}
        </Badge>
      )
    case 'owner_contacted':
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-800 border-blue-300 font-bold"
        >
          {t('status.owner_contacted') || 'Owner Contacted'}
        </Badge>
      )
    case 'tenant_contacted':
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-800 border-purple-300 font-bold"
        >
          {t('status.tenant_contacted') || 'Tenant Contacted'}
        </Badge>
      )
    case 'vacating':
      return (
        <Badge variant="destructive" className="font-bold">
          {t('status.vacating') || 'Vacating'}
        </Badge>
      )
    case 'closed':
      return (
        <Badge className="bg-green-600 font-bold text-white">
          {t('common.completed')}
        </Badge>
      )
    default:
      return (
        <Badge
          variant="secondary"
          className="font-bold text-slate-800 border-slate-300"
        >
          {t('common.pending')}
        </Badge>
      )
  }
}

export default function Renewals() {
  const { tenants, renewTenantContract } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t, language } = useLanguageStore()
  const { currentUser } = useAuthStore()

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const showFinancials = ['platform_owner', 'software_tenant'].includes(
    currentUser.role,
  )

  const relevantTenants = useMemo(
    () =>
      tenants.filter(
        (t) => t && (t.status === 'active' || t.negotiationStatus === 'closed'),
      ),
    [tenants],
  )

  const processedData = useMemo(() => {
    return relevantTenants
      .map((t) => {
        const property = properties.find((p) => p.id === t.propertyId)

        // Strict LTR Filter: Only show Long Term Rentals in Renewals
        if (property?.profileType !== 'long_term') return null

        const owner = owners.find((o) => o.id === property?.ownerId)

        let daysLeft = 9999
        const leaseEndDate = t.leaseEnd ? new Date(t.leaseEnd) : new Date()
        try {
          if (t.leaseEnd) {
            daysLeft = differenceInDays(leaseEndDate, new Date())
          }
        } catch (e) {
          console.error('Invalid date', e)
        }

        let displayStatus:
          | 'critical'
          | 'upcoming'
          | 'year'
          | 'safe'
          | 'renewed' = 'safe'

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
          leaseEndDate,
          displayStatus,
          negotiationStatus: t.negotiationStatus || 'negotiating',
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [relevantTenants, properties, owners])

  const filteredData = useMemo(() => {
    return processedData
      .filter((item) => {
        // Status Filter
        if (filterStatus !== 'all') {
          if (filterStatus === 'renewed') {
            if (item.displayStatus !== 'renewed') return false
          } else if (item.displayStatus === 'renewed') {
            return false
          } else {
            if (filterStatus === 'critical' && item.daysLeft >= 30) return false
            if (filterStatus === 'upcoming' && item.daysLeft >= 90) return false
            if (filterStatus === 'year' && item.daysLeft >= 365) return false
          }
        }

        // Owner Filter
        if (selectedOwner !== 'all' && item.owner?.id !== selectedOwner)
          return false

        // Date Range Filter
        if (dateRange.from && item.leaseEndDate < dateRange.from) return false
        if (dateRange.to && item.leaseEndDate > dateRange.to) return false

        // Search Term
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          const propName = item.property?.name?.toLowerCase() || ''
          const tenantName = item.tenant?.name?.toLowerCase() || ''
          const ownerName = item.owner?.name?.toLowerCase() || ''

          if (
            !propName.includes(term) &&
            !tenantName.includes(term) &&
            !ownerName.includes(term)
          ) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [processedData, filterStatus, selectedOwner, searchTerm, dateRange])

  const handleStartNegotiation = (tenantId: string) => {
    navigate(`/messages?contactId=${tenantId}&context=renewal`)
    toast({
      title: t('renewals.negotiation_started'),
      description: 'Redirecting to chat...',
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

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) newSelected.add(id)
    else newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map((d) => d.tenant.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkExport = () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    toast({
      title: t('common.export_success_title'),
      description: `${t('common.export_data')} (${count})`,
    })
    // Mock export
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

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDayEvents = (date: Date) => {
    return filteredData.filter((d) => isSameDay(d.leaseEndDate, date))
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {t('renewals.title')}
          </h1>
          <p className="text-slate-700 font-medium">{t('renewals.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={
              viewMode === 'list'
                ? 'bg-trust-blue text-white'
                : 'text-slate-900 border-slate-300'
            }
          >
            <ListIcon className="h-4 w-4 mr-2" /> {t('common.list')}
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={
              viewMode === 'calendar'
                ? 'bg-trust-blue text-white'
                : 'text-slate-900 border-slate-300'
            }
          >
            <CalendarIcon className="h-4 w-4 mr-2" />{' '}
            {t('common.calendar_view')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder={t('renewals.search_placeholder')}
            className="pl-8 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] border-slate-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('renewals.all_status')}</SelectItem>
            <SelectItem value="critical">Critical (&lt;30d)</SelectItem>
            <SelectItem value="upcoming">Upcoming (&lt;90d)</SelectItem>
            <SelectItem value="renewed">Renewed</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-start text-left font-normal border-slate-300 text-slate-900"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>{t('renewals.filter_date')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range: any) => setDateRange(range || {})}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {selectedIds.size > 0 && (
          <Button
            variant="outline"
            onClick={handleBulkExport}
            className="border-slate-300 text-slate-900"
          >
            <Download className="h-4 w-4 mr-2" /> {t('common.export')} (
            {selectedIds.size})
          </Button>
        )}
      </div>

      {viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedIds.size === filteredData.length &&
                        filteredData.length > 0
                      }
                      onCheckedChange={(c) => handleSelectAll(c as boolean)}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-slate-950">
                    {t('common.property')}
                  </TableHead>
                  <TableHead className="font-bold text-slate-950">
                    {t('common.owners')}
                  </TableHead>
                  <TableHead className="font-bold text-slate-950">
                    {t('tenants.new_tenant')}
                  </TableHead>
                  <TableHead className="font-bold text-slate-950">
                    {t('common.status')}
                  </TableHead>
                  {showFinancials && (
                    <TableHead className="font-bold text-slate-950">
                      {t('renewals.suggestion')}
                    </TableHead>
                  )}
                  {showFinancials && (
                    <TableHead className="font-bold text-slate-950">
                      {t('renewals.current_value')}
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-slate-950">
                    {t('common.due_date')}
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-950">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-slate-600 font-medium"
                    >
                      {t('renewals.no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <RenewalRow
                      key={item.tenant.id}
                      data={item}
                      isSelected={selectedIds.has(item.tenant.id)}
                      onSelect={handleSelect}
                      onOpenSheet={handleOpenSheet}
                      onStartNegotiation={handleStartNegotiation}
                      onCloseNegotiation={handleOpenCloseDialog}
                      showFinancials={showFinancials}
                      language={language}
                      t={t}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="border-slate-300 text-slate-900"
              >
                {t('common.back')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="border-slate-300 text-slate-900"
              >
                {t('common.continue')}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="font-bold text-center p-2 bg-slate-100 text-slate-900"
              >
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const events = getDayEvents(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[100px] border rounded p-2 flex flex-col gap-1 bg-white',
                    events.length > 0 && 'bg-blue-50/30',
                  )}
                >
                  <span className="text-sm font-semibold text-right block text-slate-700">
                    {format(day, 'd')}
                  </span>
                  {events.map((ev) => (
                    <div
                      key={ev.tenant.id}
                      className={cn(
                        'text-[10px] p-1 rounded truncate cursor-pointer hover:opacity-80 font-bold',
                        ev.displayStatus === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : ev.displayStatus === 'renewed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800',
                      )}
                      onClick={() => handleOpenSheet(ev.tenant.id)}
                      title={ev.property?.name}
                    >
                      <DataMask>{ev.property?.name}</DataMask>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

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
