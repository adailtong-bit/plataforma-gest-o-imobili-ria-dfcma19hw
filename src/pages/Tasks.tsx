import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import useTaskStore from '@/stores/useTaskStore'
import useAuthStore from '@/stores/useAuthStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import useLanguageStore from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Eye,
  Pencil,
  RotateCw,
  CheckCircle,
  XCircle,
  ThumbsUp,
} from 'lucide-react'
import { TaskInvoiceDialog } from '@/components/financial/TaskInvoiceDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataMask } from '@/components/DataMask'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'
import { Task } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function Tasks() {
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence, updateTask } =
    useTaskStore()
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // State for actions in List View
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const isAdminOrPM = [
    'platform_owner',
    'software_tenant',
    'internal_user',
  ].includes(currentUser.role)
  const isOwner = currentUser.role === 'property_owner'

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Role-based filtering
      if (isOwner) {
        // Owners only see tasks for their properties
        const property = properties.find((p) => p.id === t.propertyId)
        if (property?.ownerId !== currentUser.id) return false
      }

      const typeMatch = filterType === 'all' || t.type === filterType
      const statusMatch = filterStatus === 'all' || t.status === filterStatus
      return typeMatch && statusMatch
    })
  }, [tasks, filterType, filterStatus, isOwner, currentUser.id, properties])

  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending'),
    [filteredTasks],
  )
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'in_progress'),
    [filteredTasks],
  )
  const approvalTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending_approval'),
    [filteredTasks],
  )
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'completed'),
    [filteredTasks],
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300 font-bold'
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-300 font-bold'
      case 'medium':
        return 'text-blue-700 bg-blue-100 border-blue-300 font-bold'
      default:
        return 'text-slate-700 bg-slate-100 border-slate-300 font-bold'
    }
  }

  const getStatusLabel = (status: string, approvalStatus?: string) => {
    switch (status) {
      case 'pending':
        return t('common.pending')
      case 'in_progress':
        return t('tasks.in_progress')
      case 'completed':
        return t('common.completed')
      case 'pending_approval':
        return approvalStatus === 'owner_pending'
          ? t('tasks.status_wait_owner')
          : t('tasks.status_wait_pm')
      default:
        return status
    }
  }

  const openDetails = (task: Task) => {
    setSelectedTask(task)
    setDetailsOpen(true)
  }

  const openEdit = (task: Task) => {
    setSelectedTask(task)
    setEditOpen(true)
  }

  const advanceStatus = (task: Task) => {
    let nextStatus: Task['status'] = task.status
    if (task.status === 'pending') nextStatus = 'in_progress'
    else if (task.status === 'in_progress') nextStatus = 'completed'
    // Simplified flow for list view
    if (nextStatus !== task.status) {
      updateTaskStatus(task.id, nextStatus)
    }
  }

  const handleApprove = (task: Task) => {
    if (task.approvalStatus === 'owner_pending') {
      updateTask({
        ...task,
        approvalStatus: 'pm_pending',
      })
      toast({
        title: t('common.approved'),
        description: 'Aprovado. Aguardando PM.',
      })
    } else if (task.approvalStatus === 'pm_pending') {
      updateTask({
        ...task,
        approvalStatus: 'approved',
        status: 'pending',
      })
      toast({
        title: t('common.approved'),
        description: 'Tarefa aprovada para execução.',
      })
    } else if (isAdminOrPM && task.status === 'pending_approval') {
      // Super Approval or Generic
      updateTask({
        ...task,
        approvalStatus: 'approved',
        status: 'pending',
      })
      toast({
        title: t('common.approved'),
        description: 'Tarefa aprovada pelo Gestor.',
      })
    }
  }

  const handleReject = (task: Task) => {
    updateTask({
      ...task,
      status: 'pending', // Return to pending for edit/review
      approvalStatus: undefined, // Clear approval chain
    })
    toast({
      title: t('common.reject'),
      description: 'Tarefa rejeitada e retornada para revisão.',
      variant: 'destructive',
    })
  }

  const canApprove = (task: Task) => {
    if (task.status !== 'pending_approval') return false
    const property = properties.find((p) => p.id === task.propertyId)
    const isMyProperty = property?.ownerId === currentUser.id

    if (task.approvalStatus === 'owner_pending') {
      return (isOwner && isMyProperty) || isAdminOrPM // PM Super-Approval
    }
    if (task.approvalStatus === 'pm_pending') {
      return isAdminOrPM
    }
    return false
  }

  const canReject = (task: Task) => {
    return canApprove(task)
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Dialogs for List View Actions */}
      {selectedTask && (
        <>
          <TaskDetailsSheet
            task={selectedTask}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          />
          <EditTaskDialog
            task={selectedTask}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        </>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {t('tasks.title')}
          </h1>
          <p className="text-black font-medium">{t('tasks.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] h-9 text-black border-slate-300 font-medium bg-white">
              <Filter className="w-3 h-3 mr-2 text-black" />
              <SelectValue placeholder={t('common.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('common.pending')}</SelectItem>
              <SelectItem value="in_progress">
                {t('tasks.in_progress')}
              </SelectItem>
              <SelectItem value="completed">{t('common.completed')}</SelectItem>
              <SelectItem value="pending_approval">
                {t('tasks.approval')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] h-9 text-black border-slate-300 font-medium bg-white">
              <Filter className="w-3 h-3 mr-2 text-black" />
              <SelectValue placeholder={t('common.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="cleaning">{t('partners.cleaning')}</SelectItem>
              <SelectItem value="maintenance">
                {t('partners.maintenance')}
              </SelectItem>
              <SelectItem value="inspection">Inspeção</SelectItem>
            </SelectContent>
          </Select>

          {isAdminOrPM && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-black border-slate-300 font-medium bg-white"
              onClick={() => setInvoiceDialogOpen(true)}
            >
              <FileText className="h-4 w-4" />{' '}
              {t('automation.auto_generate_invoice') || 'Generate Invoice'}
            </Button>
          )}
          <CreateTaskDialog />
        </div>
      </div>

      <TaskInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />

      <Tabs defaultValue="board" className="space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <TabsList className="bg-slate-100 border border-slate-200">
            <TabsTrigger
              value="board"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600 gap-2"
            >
              <LayoutGrid className="h-4 w-4" /> {t('tasks.board')}
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600 gap-2"
            >
              <ListIcon className="h-4 w-4" /> {t('tasks.list')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {/* Approval Column */}
            <div className="bg-orange-50 p-4 rounded-lg flex flex-col gap-4 border border-orange-100 h-full">
              <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                <h3 className="font-bold text-sm uppercase text-orange-900">
                  {t('tasks.approval')}
                </h3>
                <Badge className="bg-orange-100 text-orange-900 font-bold border-orange-300 hover:bg-orange-200">
                  <DataMask>{approvalTasks.length}</DataMask>
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

            {/* Pending Column */}
            <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-4 border border-slate-200 h-full">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-sm uppercase text-black">
                  {t('common.pending')} (Ready)
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-white border text-black font-bold border-slate-300"
                >
                  <DataMask>{pendingTasks.length}</DataMask>
                </Badge>
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
            <div className="bg-blue-50 p-4 rounded-lg flex flex-col gap-4 border border-blue-100 h-full">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <h3 className="font-bold text-sm uppercase text-blue-900">
                  {t('tasks.in_progress')}
                </h3>
                <Badge className="bg-blue-100 text-blue-900 font-bold border-blue-300 hover:bg-blue-200">
                  <DataMask>{inProgressTasks.length}</DataMask>
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

            {/* Completed Column */}
            <div className="bg-green-50 p-4 rounded-lg flex flex-col gap-4 border border-green-100 h-full">
              <div className="flex items-center justify-between pb-2 border-b border-green-200">
                <h3 className="font-bold text-sm uppercase text-green-900">
                  {t('common.completed')}
                </h3>
                <Badge className="bg-green-100 text-green-900 font-bold border-green-300 hover:bg-green-200">
                  <DataMask>{completedTasks.length}</DataMask>
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

        <TabsContent value="list" className="flex-1 min-h-0">
          <Card className="bg-white border-slate-200 h-full overflow-hidden flex flex-col">
            <CardContent className="p-0 flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>{t('tasks.task_title')}</TableHead>
                    <TableHead>{t('properties.title')}</TableHead>
                    <TableHead>{t('tasks.assignee')}</TableHead>
                    <TableHead>{t('tasks.scheduled_date')}</TableHead>
                    <TableHead>{t('common.priority')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('tasks.service_type')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-black">
                        {task.title}
                      </TableCell>
                      <TableCell>{task.propertyName}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>
                        {format(new Date(task.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            task.status === 'pending_approval'
                              ? task.approvalStatus === 'owner_pending'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                              : ''
                          }
                        >
                          {getStatusLabel(task.status, task.approvalStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{task.type}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canApprove(task) && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-8"
                                onClick={() => handleApprove(task)}
                                title={t('common.approve')}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {t('common.approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => handleReject(task)}
                                title={t('common.reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {t('common.reject')}
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetails(task)}
                            title={t('common.details')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(task)}
                            title={t('common.edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {task.status !== 'completed' &&
                            task.status !== 'pending_approval' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => advanceStatus(task)}
                                title={t('tasks.change_status')}
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTasks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('common.empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
