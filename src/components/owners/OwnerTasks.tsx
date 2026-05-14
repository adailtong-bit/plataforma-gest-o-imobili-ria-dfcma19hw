import { useState } from 'react'
import { Property, Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import useTaskStore from '@/stores/useTaskStore'
import { Button } from '@/components/ui/button'
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
  startOfYear,
  endOfYear,
} from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import { RejectTaskDialog } from '@/components/tasks/RejectTaskDialog'

interface OwnerTasksProps {
  ownerId: string
  properties: Property[]
  tasksOverride?: Task[]
}

export function OwnerTasks({
  ownerId,
  properties,
  tasksOverride,
}: OwnerTasksProps) {
  const storeTasks = useTaskStore((state) => state.tasks)
  const { updateTaskStatus } = useTaskStore()
  const { t } = useLanguageStore()
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null)

  const tasks = tasksOverride || storeTasks

  const ownerProperties = properties.filter((p) => p.ownerId === ownerId)
  const ownerPropertyIds = ownerProperties.map((p) => p.id)

  const ownerTasks = tasks.filter((t) => {
    // Property Filter
    if (selectedPropertyId !== 'all' && t.propertyId !== selectedPropertyId)
      return false
    // Ownership Filter
    return ownerPropertyIds.includes(t.propertyId)
  })

  // Apply Time Filter
  const filteredTasks = ownerTasks.filter((t) => {
    if (timeFilter === 'all') return true
    const taskDate = new Date(t.date || new Date())
    const now = new Date()

    if (timeFilter === 'this_month') {
      return isWithinInterval(taskDate, {
        start: startOfMonth(now),
        end: endOfMonth(now),
      })
    }
    if (timeFilter === 'last_month') {
      const last = subMonths(now, 1)
      return isWithinInterval(taskDate, {
        start: startOfMonth(last),
        end: endOfMonth(last),
      })
    }
    if (timeFilter === 'this_year') {
      return isWithinInterval(taskDate, {
        start: startOfYear(now),
        end: endOfYear(now),
      })
    }
    return true
  })

  // Sort by date descending
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  )

  const pendingApprovals = ownerTasks.filter(
    (t) =>
      t.approvalStatus === 'owner_pending' || t.status === 'pending_approval',
  )
  const { toast } = useToast()

  const handleApprove = (taskId: string) => {
    updateTaskStatus(taskId, 'approved')
    toast({
      title: t('owner_portal.task_approved') || 'Tarefa Aprovada',
      description:
        t('owner_portal.task_status_updated') ||
        'O status da tarefa foi atualizado com sucesso.',
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {pendingApprovals.length > 0 && (
        <Card className="border-orange-200 shadow-md">
          <CardHeader className="bg-orange-50 border-b border-orange-100">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
              <ClipboardList className="h-5 w-5" />{' '}
              {t('owner_portal.cost_approvals') ||
                'Aprovações de Custos (Acima do Limite)'}{' '}
              ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {pendingApprovals.map((task) => {
                const property = ownerProperties.find(
                  (p) => p.id === task.propertyId,
                )
                return (
                  <div
                    key={task.id}
                    className="border border-orange-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-lg text-slate-900 leading-tight">
                          {task.title}
                        </div>
                        <div className="text-sm font-medium text-slate-500 mt-1">
                          {property?.name || task.propertyName}
                        </div>
                      </div>
                      <div className="text-right shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                          {t('owner_portal.estimated_cost') || 'Custo Estimado'}
                        </div>
                        <div className="font-bold text-xl text-slate-900">
                          {formatCurrency(task.price || 0, 'en-US')}
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{task.description}</span>
                      </div>
                    )}

                    {task.images && task.images.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Evidências
                          Fotográficas
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {task.images.slice(0, 4).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Evidence"
                              className="w-16 h-16 object-cover rounded-md border border-slate-200 shadow-sm"
                            />
                          ))}
                          {task.images.length > 4 && (
                            <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-md border border-slate-200 text-xs font-bold text-slate-600 shrink-0">
                              +{task.images.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-slate-500">
                      <strong>
                        {t('owner_portal.suggested_date') || 'Data Sugerida'}:
                      </strong>
                      <span className="ml-2">
                        {task.date
                          ? new Date(task.date).toLocaleDateString()
                          : t('common.to_be_defined') || 'A definir'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none text-slate-700 bg-white shadow-sm"
                        onClick={() => setSelectedTask(task)}
                      >
                        <Eye className="w-4 h-4 mr-2" />{' '}
                        {t('common.view_details') || 'Ver Detalhes'}
                      </Button>
                      <Button
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 shadow-sm"
                        onClick={() => handleApprove(task.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />{' '}
                        {t('common.approve') || 'Aprovar'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectTaskId(task.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />{' '}
                        {t('common.reject') || 'Recusar'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-slate-600" />{' '}
            {t('owner_portal.maintenance_history') ||
              'Histórico de Danos e Custos de Manutenção'}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <SelectValue
                  placeholder={t('common.property') || 'Propriedade'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('common.all_properties') || 'Todas as Propriedades'}
                </SelectItem>
                {ownerProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white">
                <SelectValue placeholder={t('common.period') || 'Período'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('common.all_period') || 'Todo o Período'}
                </SelectItem>
                <SelectItem value="this_month">
                  {t('common.this_month') || 'Este Mês'}
                </SelectItem>
                <SelectItem value="last_month">
                  {t('common.last_month') || 'Mês Passado'}
                </SelectItem>
                <SelectItem value="this_year">
                  {t('common.this_year') || 'Este Ano'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg bg-slate-50/50">
              <ClipboardList className="h-8 w-8 mx-auto mb-3 text-slate-300" />
              <h3 className="text-sm font-medium text-slate-900">
                {t('owner_portal.no_records') || 'Nenhum registro encontrado'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t('owner_portal.no_tasks') ||
                  'Nenhuma tarefa registrada para as propriedades deste proprietário no período selecionado.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTasks.map((task) => (
                <div key={task.id} className="relative group">
                  <TaskCard
                    task={task}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                  />
                  <div className="absolute inset-0 bg-slate-900/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Button
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto shadow-md"
                      onClick={() => setSelectedTask(task)}
                    >
                      <Eye className="w-4 h-4 mr-2" />{' '}
                      {t('common.view_details') || 'Ver Detalhes'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDetailsSheet
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={selectedTask}
      />

      {rejectTaskId && (
        <RejectTaskDialog
          taskId={rejectTaskId}
          open={!!rejectTaskId}
          onOpenChange={(open) => !open && setRejectTaskId(null)}
        />
      )}
    </div>
  )
}
