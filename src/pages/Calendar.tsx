import { useState, useMemo, useContext } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import useTaskStore from '@/stores/useTaskStore'
import useTenantStore from '@/stores/useTenantStore'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import { Task } from '@/lib/types'
import { isSameDay, parseISO } from 'date-fns'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  Briefcase,
  DollarSign,
  FileText,
  AlertTriangle,
  Filter,
  Building,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ptBR, es, enUS } from 'date-fns/locale'

type CalendarEvent =
  | { type: 'task'; data: Task; date: Date }
  | {
      type: 'contract'
      data: { id: string; name: string; type: string; propertyId?: string }
      date: Date
    }
  | {
      type: 'financial'
      data: {
        id: string
        description: string
        amount: number
        type: string
        propertyId?: string
      }
      date: Date
    }

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks } = useTaskStore()
  const { tenants } = useTenantStore()
  const { ledgerEntries } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { partners } = usePartnerStore()
  const { t, language } = useLanguageStore()
  const context = useContext(AppContext)
  const selectedPropertyId = context?.selectedPropertyId || 'all'
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const navigate = useNavigate()

  const [filterPartner, setFilterPartner] = useState<string>('all')

  const dateLocale = language === 'pt' ? ptBR : language === 'es' ? es : enUS

  const taskEvents: CalendarEvent[] = tasks
    .filter((t) => {
      if (selectedPropertyId !== 'all' && t.propertyId !== selectedPropertyId)
        return false
      if (filterPartner !== 'all' && t.assigneeId !== filterPartner)
        return false
      return true
    })
    .map((t) => ({
      type: 'task',
      data: t,
      date: new Date(t.date),
    }))

  const contractEvents: CalendarEvent[] = tenants
    .filter((t) => t.leaseEnd && t.status === 'active')
    .filter((t) => {
      if (selectedPropertyId !== 'all' && t.propertyId !== selectedPropertyId)
        return false
      if (filterPartner !== 'all') return false
      return true
    })
    .map((t) => ({
      type: 'contract',
      data: {
        id: t.id,
        name: t.name,
        type: 'Lease Expiry',
        propertyId: t.propertyId,
      },
      date: parseISO(t.leaseEnd!),
    }))

  const financialEvents: CalendarEvent[] = ledgerEntries
    .filter((e) => e.dueDate && e.status === 'pending')
    .filter((e) => {
      if (selectedPropertyId !== 'all' && e.propertyId !== selectedPropertyId)
        return false
      if (filterPartner !== 'all') return false
      return true
    })
    .map((e) => ({
      type: 'financial',
      data: {
        id: e.id,
        description: e.description,
        amount: e.amount,
        type: e.type,
        propertyId: e.propertyId,
      },
      date: parseISO(e.dueDate!),
    }))

  const allEvents = [...taskEvents, ...contractEvents, ...financialEvents]

  const dayEvents = useMemo(() => {
    if (!date) return []
    return allEvents.filter((e) => isSameDay(e.date, date))
  }, [date, allEvents])

  const modifiers = {
    task: taskEvents.map((e) => e.date),
    contract: contractEvents.map((e) => e.date),
    financial: financialEvents.map((e) => e.date),
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setSheetOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-slate-600 border-slate-300 bg-slate-100 font-bold'
      case 'in_progress':
        return 'text-blue-700 border-blue-300 bg-blue-100 font-bold'
      case 'completed':
        return 'text-green-700 border-green-300 bg-green-100 font-bold'
      case 'approved':
        return 'text-orange-700 border-orange-300 bg-orange-100 font-bold'
      default:
        return 'text-slate-600 border-slate-300 font-bold'
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100vh-10rem)] h-auto">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {t('calendar.title')}
          </h1>
          <p className="text-slate-700 font-medium">{t('calendar.subtitle')}</p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Filter className="h-4 w-4 text-slate-600" />
          <Select value={filterPartner} onValueChange={setFilterPartner}>
            <SelectTrigger className="w-[180px] border-slate-300 text-slate-900">
              <SelectValue placeholder={t('common.partners')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full h-auto">
        <Card className="lg:col-span-8 h-[500px] lg:h-full flex flex-col border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-2">
              <CardTitle className="text-slate-950">
                {t('calendar.integrated_view')}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-300 font-bold"
                >
                  <Briefcase className="w-3 h-3 mr-1" />{' '}
                  {t('common.operations')}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-300 font-bold"
                >
                  <FileText className="w-3 h-3 mr-1" /> {t('common.contracts')}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-300 font-bold"
                >
                  <DollarSign className="w-3 h-3 mr-1" />{' '}
                  {t('common.financial')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={dateLocale}
              className="rounded-md border shadow-sm w-full h-full text-slate-900"
              classNames={{
                month: 'space-y-4 w-full h-full flex flex-col',
                table: 'w-full h-full border-collapse space-y-1',
                head_row: 'flex w-full',
                head_cell:
                  'text-slate-600 rounded-md w-full font-bold text-[0.8rem]',
                row: 'flex w-full mt-2 flex-1',
                cell: 'h-full w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-full w-full p-0 font-medium aria-selected:opacity-100 flex flex-col items-center justify-start pt-2 hover:bg-slate-100 text-slate-900',
              }}
              modifiers={modifiers}
              modifiersClassNames={{
                task: 'after:content-["•"] after:text-blue-600 after:block after:text-lg after:leading-[0]',
                contract:
                  'after:content-["•"] after:text-red-600 after:block after:text-lg after:leading-[0]',
                financial:
                  'after:content-["•"] after:text-green-600 after:block after:text-lg after:leading-[0]',
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 h-[500px] lg:h-full flex flex-col border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-950">
              {date ? formatDate(date, language) : t('calendar.title')}
            </CardTitle>
            <CardDescription className="text-slate-700 font-medium">
              {dayEvents.length} events for this day.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 pb-6">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-slate-600 text-center py-8 font-medium">
                    {t('calendar.no_activities')}
                  </p>
                ) : (
                  dayEvents.map((event, idx) => {
                    if (event.type === 'task') {
                      return (
                        <div
                          key={`task-${event.data.id}`}
                          className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors border-l-4 border-l-blue-600 group relative bg-white"
                        >
                          <div
                            className="cursor-pointer"
                            onClick={() => handleTaskClick(event.data)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase bg-blue-100 text-blue-800 border-blue-300 font-bold"
                              >
                                {t(`partners.${event.data.type}`) ||
                                  event.data.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] uppercase',
                                  getStatusColor(event.data.status),
                                )}
                              >
                                {t(`common.${event.data.status}`) ||
                                  event.data.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-950">
                                {event.data.title}
                              </p>
                              <p className="text-xs text-slate-700 font-medium line-clamp-1">
                                {event.data.propertyName}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-blue-700 font-semibold">
                                  {event.data.assignee}
                                </p>
                                {event.data.price && (
                                  <p className="text-xs font-bold text-green-700">
                                    {formatCurrency(event.data.price, language)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {event.data.propertyId && (
                            <div className="mt-2 pt-2 border-t flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 gap-1 text-slate-800 hover:text-black font-medium"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(
                                    `/properties/${event.data.propertyId}`,
                                  )
                                }}
                              >
                                <Building className="h-3 w-3" />{' '}
                                {t('common.property')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    }
                    if (event.type === 'contract') {
                      return (
                        <div
                          key={`contract-${event.data.id}`}
                          className="flex flex-col gap-2 p-3 border rounded-lg border-l-4 border-l-red-600 bg-red-50"
                        >
                          <div className="flex justify-between items-start">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase bg-red-100 text-red-800 border-red-300 font-bold"
                            >
                              Expiration
                            </Badge>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-red-900">
                              Lease End
                            </p>
                            <p className="text-xs text-slate-800 font-medium">
                              {t('common.relationship_tenant')}:{' '}
                              {event.data.name}
                            </p>
                          </div>
                          {event.data.propertyId && (
                            <div className="mt-2 pt-2 border-t border-red-200 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 gap-1 text-red-900 hover:bg-red-200 font-bold"
                                onClick={() =>
                                  navigate(
                                    `/properties/${event.data.propertyId}`,
                                  )
                                }
                              >
                                <Building className="h-3 w-3" />{' '}
                                {t('common.property')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    }
                    if (event.type === 'financial') {
                      return (
                        <div
                          key={`fin-${event.data.id}`}
                          className="flex flex-col gap-2 p-3 border rounded-lg border-l-4 border-l-green-600 bg-green-50"
                        >
                          <div className="flex justify-between items-start">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase bg-green-100 text-green-800 border-green-300 font-bold"
                            >
                              {t('common.due_date')}
                            </Badge>
                            <DollarSign className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-950">
                              {event.data.description}
                            </p>
                            <p className="text-xs font-bold text-green-800">
                              {formatCurrency(event.data.amount, language)}
                            </p>
                          </div>
                          {event.data.propertyId && (
                            <div className="mt-2 pt-2 border-t border-green-200 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 gap-1 text-green-900 hover:bg-green-200 font-bold"
                                onClick={() =>
                                  navigate(
                                    `/properties/${event.data.propertyId}`,
                                  )
                                }
                              >
                                <Building className="h-3 w-3" />{' '}
                                {t('common.property')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <TaskDetailsSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
