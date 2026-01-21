import { useState, useMemo } from 'react'
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
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import { Task } from '@/lib/types'
import { format, isSameDay, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  DollarSign,
  FileText,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Define event types for consolidation
type CalendarEvent =
  | { type: 'task'; data: Task; date: Date }
  | {
      type: 'contract'
      data: { id: string; name: string; type: string }
      date: Date
    }
  | {
      type: 'financial'
      data: { id: string; description: string; amount: number; type: string }
      date: Date
    }

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks } = useTaskStore()
  const { tenants } = useTenantStore()
  const { ledgerEntries } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { partners } = usePartnerStore()
  const { t } = useLanguageStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Filters
  const [filterPartner, setFilterPartner] = useState<string>('all')
  const [filterProperty, setFilterProperty] = useState<string>('all')

  // 1. Process Tasks
  const taskEvents: CalendarEvent[] = tasks
    .filter((t) => {
      if (filterPartner !== 'all' && t.assigneeId !== filterPartner)
        return false
      if (filterProperty !== 'all' && t.propertyId !== filterProperty)
        return false
      return true
    })
    .map((t) => ({
      type: 'task',
      data: t,
      date: new Date(t.date),
    }))

  // 2. Process Contracts (Tenants Lease End) - filtered by property
  const contractEvents: CalendarEvent[] = tenants
    .filter((t) => t.leaseEnd && t.status === 'active')
    .filter((t) => {
      if (filterProperty !== 'all' && t.propertyId !== filterProperty)
        return false
      if (filterPartner !== 'all') return false // Contracts not linked to partners directly in this view
      return true
    })
    .map((t) => ({
      type: 'contract',
      data: { id: t.id, name: t.name, type: 'Lease Expiry' },
      date: parseISO(t.leaseEnd!),
    }))

  // 3. Process Financials (Due Dates) - filtered by property
  const financialEvents: CalendarEvent[] = ledgerEntries
    .filter((e) => e.dueDate && e.status === 'pending')
    .filter((e) => {
      if (filterProperty !== 'all' && e.propertyId !== filterProperty)
        return false
      if (filterPartner !== 'all') return false // Financials usually not direct partner link in this simple view unless extended
      return true
    })
    .map((e) => ({
      type: 'financial',
      data: {
        id: e.id,
        description: e.description,
        amount: e.amount,
        type: e.type,
      },
      date: parseISO(e.dueDate!),
    }))

  // Combine all events
  const allEvents = [...taskEvents, ...contractEvents, ...financialEvents]

  // Events for selected day
  const dayEvents = useMemo(() => {
    if (!date) return []
    return allEvents.filter((e) => isSameDay(e.date, date))
  }, [date, allEvents])

  // Modifiers for Calendar dates
  const modifiers = {
    task: taskEvents.map((e) => e.date),
    contract: contractEvents.map((e) => e.date),
    financial: financialEvents.map((e) => e.date),
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('calendar.title')}
          </h1>
          <p className="text-muted-foreground">{t('calendar.subtitle')}</p>
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterPartner} onValueChange={setFilterPartner}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Parceiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Parceiros</SelectItem>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterProperty} onValueChange={setFilterProperty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Propriedade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Propriedades</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Calendar View */}
        <Card className="lg:col-span-8 h-full flex flex-col">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-2">
              <CardTitle>Visão Integrada</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Briefcase className="w-3 h-3 mr-1" /> Operações
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  <FileText className="w-3 h-3 mr-1" /> Contratos
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <DollarSign className="w-3 h-3 mr-1" /> Financeiro
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm w-full h-full"
              classNames={{
                month: 'space-y-4 w-full h-full flex flex-col',
                table: 'w-full h-full border-collapse space-y-1',
                head_row: 'flex w-full',
                head_cell:
                  'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                row: 'flex w-full mt-2 flex-1',
                cell: 'h-full w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-full w-full p-0 font-normal aria-selected:opacity-100 flex flex-col items-center justify-start pt-2 hover:bg-accent hover:text-accent-foreground',
              }}
              modifiers={modifiers}
              modifiersClassNames={{
                task: 'after:content-["•"] after:text-blue-500 after:block after:text-lg after:leading-[0]',
                contract:
                  'after:content-["•"] after:text-red-500 after:block after:text-lg after:leading-[0]',
                financial:
                  'after:content-["•"] after:text-green-500 after:block after:text-lg after:leading-[0]',
              }}
            />
          </CardContent>
        </Card>

        {/* Daily Details */}
        <Card className="lg:col-span-4 h-full flex flex-col">
          <CardHeader>
            <CardTitle>
              {date ? format(date, 'EEEE, d MMM') : 'Selecione uma data'}
            </CardTitle>
            <CardDescription>
              {dayEvents.length} eventos para este dia.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 pb-6">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum evento.
                  </p>
                ) : (
                  dayEvents.map((event, idx) => {
                    if (event.type === 'task') {
                      return (
                        <div
                          key={`task-${event.data.id}`}
                          className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border-l-4 border-l-blue-500"
                          onClick={() => handleTaskClick(event.data)}
                        >
                          <div className="flex justify-between items-start">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {t(`partners.${event.data.type}`) ||
                                event.data.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              Task
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {event.data.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {event.data.propertyName}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {event.data.assignee}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    if (event.type === 'contract') {
                      return (
                        <div
                          key={`contract-${event.data.id}`}
                          className="flex flex-col gap-2 p-3 border rounded-lg border-l-4 border-l-red-500 bg-red-50/10"
                        >
                          <div className="flex justify-between items-start">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase bg-red-50 text-red-700 border-red-200"
                            >
                              Expiração
                            </Badge>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-red-900">
                              Fim de Contrato
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Inquilino: {event.data.name}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    if (event.type === 'financial') {
                      return (
                        <div
                          key={`fin-${event.data.id}`}
                          className="flex flex-col gap-2 p-3 border rounded-lg border-l-4 border-l-green-500 bg-green-50/10"
                        >
                          <div className="flex justify-between items-start">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase bg-green-50 text-green-700 border-green-200"
                            >
                              Vencimento
                            </Badge>
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {event.data.description}
                            </p>
                            <p className="text-xs font-bold text-green-800">
                              ${event.data.amount.toFixed(2)}
                            </p>
                          </div>
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
