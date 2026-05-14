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
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react'
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

interface OwnerTasksProps {
  ownerId: string
  properties: Property[]
}

export function OwnerTasks({ ownerId, properties }: OwnerTasksProps) {
  const { tasks, updateTaskStatus } = useTaskStore()
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

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
    const taskDate = new Date(t.date)
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

  const handleApprove = (taskId: string, approved: boolean) => {
    updateTaskStatus(taskId, approved ? 'approved' : 'cancelled')
    toast({
      title: approved ? 'Manutenção Aprovada' : 'Manutenção Recusada',
      description: 'O status da manutenção foi atualizado com sucesso.',
    })
  }

  return (
    <div className="space-y-6">
      {pendingApprovals.length > 0 && (
        <Card className="border-orange-200 shadow-md">
          <CardHeader className="bg-orange-50 border-b border-orange-100">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ClipboardList className="h-5 w-5" /> Aprovações Pendentes (
              {pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map((task) => {
                const property = ownerProperties.find(
                  (p) => p.id === task.propertyId,
                )
                return (
                  <div
                    key={task.id}
                    className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3"
                  >
                    <div>
                      <div className="font-bold text-lg">{task.title}</div>
                      <div className="text-sm text-slate-500">
                        {property?.name}
                      </div>
                    </div>
                    <div className="text-sm bg-slate-50 p-2 rounded">
                      <div>
                        <strong>Custo Estimado:</strong>{' '}
                        {formatCurrency(task.price || 0, 'pt-BR')}
                      </div>
                      <div>
                        <strong>Data Sugerida:</strong>{' '}
                        {task.date
                          ? new Date(task.date).toLocaleDateString('pt-BR')
                          : 'A definir'}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(task.id, true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleApprove(task.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Recusar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Histórico de Tarefas e
            Manutenções
          </CardTitle>
          <div className="flex gap-2">
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Propriedade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Propriedades</SelectItem>
                {ownerProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o Período</SelectItem>
                <SelectItem value="this_month">Este Mês</SelectItem>
                <SelectItem value="last_month">Mês Passado</SelectItem>
                <SelectItem value="this_year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
              Nenhuma tarefa registrada para as propriedades deste proprietário
              no período selecionado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
