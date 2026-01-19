import { useState } from 'react'
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
import useLanguageStore from '@/stores/useLanguageStore'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import { Task } from '@/lib/types'
import { format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks } = useTaskStore()
  const { t } = useLanguageStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'approved',
  )
  const completedTasks = tasks.filter(
    (t) => t.status === 'completed' || t.status === 'approved',
  )

  const dayTasks = tasks.filter(
    (t) => date && isSameDay(new Date(t.date), date),
  )

  // Determine days with tasks for calendar modifiers
  const cleaningDays = tasks
    .filter((t) => t.type === 'cleaning')
    .map((t) => new Date(t.date))
  const maintenanceDays = tasks
    .filter((t) => t.type === 'maintenance')
    .map((t) => new Date(t.date))
  const inspectionDays = tasks
    .filter((t) => t.type === 'inspection')
    .map((t) => new Date(t.date))

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('calendar.title')}
        </h1>
        <p className="text-muted-foreground">{t('calendar.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Calendar View */}
        <Card className="lg:col-span-8 h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Operações</CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                  {t('partners.cleaning')}
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
                  {t('partners.maintenance')}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
                  Inspeção
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
              modifiers={{
                cleaning: cleaningDays,
                maintenance: maintenanceDays,
                inspection: inspectionDays,
              }}
              modifiersClassNames={{
                cleaning:
                  'font-bold text-blue-600 after:content-["•"] after:text-blue-600 after:block after:text-lg after:leading-[0]',
                maintenance:
                  'font-bold text-orange-600 after:content-["•"] after:text-orange-600 after:block after:text-lg after:leading-[0]',
                inspection:
                  'font-bold text-purple-600 after:content-["•"] after:text-purple-600 after:block after:text-lg after:leading-[0]',
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
              {dayTasks.length} tarefas agendadas para este dia.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 pb-6">
                {dayTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma tarefa para este dia.
                  </p>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase',
                            task.type === 'cleaning'
                              ? 'border-blue-200 text-blue-700 bg-blue-50'
                              : task.type === 'maintenance'
                                ? 'border-orange-200 text-orange-700 bg-orange-50'
                                : 'border-purple-200 text-purple-700 bg-purple-50',
                          )}
                        >
                          {t(`partners.${task.type}`) || task.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(task.date), 'HH:mm')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {task.propertyName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                          {task.assignee.charAt(0)}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {task.assignee}
                        </span>
                      </div>
                    </div>
                  ))
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
