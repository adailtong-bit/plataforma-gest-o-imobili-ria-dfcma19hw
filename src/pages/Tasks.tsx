import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import useTaskStore from '@/stores/useTaskStore'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import useLanguageStore from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import { FileText, Filter } from 'lucide-react'
import { TaskInvoiceDialog } from '@/components/financial/TaskInvoiceDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Tasks() {
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()
  const { t } = useLanguageStore()
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  // Memoized task lists for performance
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterType === 'all') return true
      return t.type === filterType
    })
  }, [tasks, filterType])

  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending'),
    [filteredTasks],
  )
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'in_progress'),
    [filteredTasks],
  )
  const approvalTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'approved'),
    [filteredTasks],
  )
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'completed'),
    [filteredTasks],
  )

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('tasks.title')}
          </h1>
          <p className="text-muted-foreground">{t('tasks.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] h-9">
              <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="cleaning">{t('partners.cleaning')}</SelectItem>
              <SelectItem value="maintenance">
                {t('partners.maintenance')}
              </SelectItem>
              <SelectItem value="inspection">Inspeção</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9"
            onClick={() => setInvoiceDialogOpen(true)}
          >
            <FileText className="h-4 w-4" /> Generate Invoice
          </Button>
          <CreateTaskDialog />
        </div>
      </div>

      <TaskInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />

      <Tabs defaultValue="board" className="space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="board">{t('tasks.board')}</TabsTrigger>
            <TabsTrigger value="list">{t('tasks.list')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {/* Pending Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4 border border-border/50">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                  {t('common.pending')}
                </h3>
                <Badge variant="secondary">{pendingTasks.length}</Badge>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                    onAddEvidence={addTaskEvidence}
                    canEdit={true}
                  />
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-blue-50/50 p-4 rounded-lg flex flex-col gap-4 border border-blue-100">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <h3 className="font-semibold text-sm uppercase text-blue-700">
                  {t('tasks.in_progress')}
                </h3>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {inProgressTasks.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                    onUpload={addTaskImage}
                    onAddEvidence={addTaskEvidence}
                    canEdit={true}
                  />
                ))}
              </div>
            </div>

            {/* Approval Column */}
            <div className="bg-orange-50/50 p-4 rounded-lg flex flex-col gap-4 border border-orange-100">
              <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                <h3 className="font-semibold text-sm uppercase text-orange-700">
                  {t('tasks.approval')}
                </h3>
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  {approvalTasks.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
                {approvalTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                    onAddEvidence={addTaskEvidence}
                    canEdit={true}
                  />
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-green-50/50 p-4 rounded-lg flex flex-col gap-4 border border-green-100">
              <div className="flex items-center justify-between pb-2 border-b border-green-200">
                <h3 className="font-semibold text-sm uppercase text-green-700">
                  {t('common.completed')}
                </h3>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  {completedTasks.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                    onAddEvidence={addTaskEvidence}
                    canEdit={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Modo lista otimizado disponível em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
