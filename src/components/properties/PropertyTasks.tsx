import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ClipboardList,
  Calendar as CalendarIcon,
  List,
  Plus,
} from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import useTaskStore from '@/stores/useTaskStore'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { isSameDay, parseISO } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatDate } from '@/lib/utils'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'

interface PropertyTasksProps {
  propertyId: string
  canEdit: boolean
}

export function PropertyTasks({ propertyId, canEdit }: PropertyTasksProps) {
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()
  const { t, language } = useLanguageStore()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

  const propertyTasks = tasks.filter((t) => t.propertyId === propertyId)

  // Sort by date descending for list view
  const sortedTasks = [...propertyTasks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Tasks for calendar view (day)
  const dayTasks = propertyTasks.filter((t) =>
    isSameDay(parseISO(t.date), date || new Date()),
  )

  const taskDates = propertyTasks.map((t) => parseISO(t.date))

  const handleScheduleMaintenance = () => {
    setScheduleDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> {t('common.tasks')} &{' '}
            {t('common.maintenance')}
          </CardTitle>
          <div className="flex gap-2 items-center">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleScheduleMaintenance}
                className="hidden md:flex gap-2"
              >
                <Plus className="h-4 w-4" /> Schedule Maintenance
              </Button>
            )}
            <div className="flex bg-muted rounded-md p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={view === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setView('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={view === 'calendar' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setView('calendar')}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Calendar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'list' ? (
            sortedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                {t('common.empty')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                    onUpload={canEdit ? addTaskImage : undefined}
                    onAddEvidence={canEdit ? addTaskEvidence : undefined}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-auto flex justify-center border rounded-md p-4 bg-white shadow-sm">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  modifiers={{
                    hasTask: taskDates,
                  }}
                  modifiersClassNames={{
                    hasTask:
                      'after:content-["•"] after:text-blue-500 after:block after:text-lg after:leading-[0]',
                  }}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {t('common.tasks')} {date ? formatDate(date, language) : ''}
                  </h3>
                  {canEdit && date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleScheduleMaintenance}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Schedule on this day
                    </Button>
                  )}
                </div>
                {dayTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                    {t('common.empty')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={(status) =>
                          updateTaskStatus(task.id, status)
                        }
                        onUpload={canEdit ? addTaskImage : undefined}
                        onAddEvidence={canEdit ? addTaskEvidence : undefined}
                        canEdit={canEdit}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        initialPropertyId={propertyId}
        initialDate={date}
      />
    </>
  )
}
