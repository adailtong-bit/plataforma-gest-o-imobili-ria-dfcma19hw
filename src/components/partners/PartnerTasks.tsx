import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useTaskStore from '@/stores/useTaskStore'
import { TaskCard } from '@/components/tasks/TaskCard'
import useLanguageStore from '@/stores/useLanguageStore'

interface PartnerTasksProps {
  partnerId: string
  canEdit: boolean
}

export function PartnerTasks({ partnerId, canEdit }: PartnerTasksProps) {
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()
  const { t } = useLanguageStore()

  const partnerTasks = tasks.filter((t) => t.assigneeId === partnerId)

  // Group by status
  const pendingTasks = partnerTasks.filter((t) => t.status === 'pending')
  const inProgressTasks = partnerTasks.filter((t) => t.status === 'in_progress')
  const completedTasks = partnerTasks.filter((t) => t.status === 'completed')
  const approvedTasks = partnerTasks.filter((t) => t.status === 'approved')

  const TaskList = ({
    title,
    tasks,
    colorClass,
  }: {
    title: string
    tasks: Task[]
    colorClass: string
  }) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-sm uppercase ${colorClass}`}>
          {title}
        </h3>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>
      {tasks.length === 0 ? (
        <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground bg-muted/20">
          Nenhuma tarefa.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(status) => updateTaskStatus(task.id, status)}
              onUpload={canEdit ? addTaskImage : undefined}
              onAddEvidence={canEdit ? addTaskEvidence : undefined}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('common.tasks')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TaskList
            title={t('common.pending')}
            tasks={pendingTasks}
            colorClass="text-muted-foreground"
          />
          <TaskList
            title={t('tasks.in_progress')}
            tasks={inProgressTasks}
            colorClass="text-blue-600"
          />
          <TaskList
            title={t('tasks.approval')}
            tasks={approvedTasks}
            colorClass="text-orange-600"
          />
          <TaskList
            title={t('common.completed')}
            tasks={completedTasks}
            colorClass="text-green-600"
          />
        </div>
      </CardContent>
    </Card>
  )
}
