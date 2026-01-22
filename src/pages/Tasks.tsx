import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import useTaskStore from '@/stores/useTaskStore'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import useLanguageStore from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { TaskInvoiceDialog } from '@/components/financial/TaskInvoiceDialog'

export default function Tasks() {
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()
  const { t } = useLanguageStore()
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('tasks.title')}
          </h1>
          <p className="text-muted-foreground">{t('tasks.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
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

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">{t('tasks.board')}</TabsTrigger>
          <TabsTrigger value="list">{t('tasks.list')}</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full min-h-[500px]">
            {/* Pending Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                  {t('common.pending')}
                </h3>
                <Badge variant="secondary">
                  {tasks.filter((t) => t.status === 'pending').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'pending')
                .map((task) => (
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

            {/* In Progress Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-blue-600">
                  {t('tasks.in_progress')}
                </h3>
                <Badge className="bg-blue-100 text-blue-700">
                  {tasks.filter((t) => t.status === 'in_progress').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
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

            {/* Approval Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-orange-600">
                  {t('tasks.approval')}
                </h3>
                <Badge className="bg-orange-100 text-orange-700">
                  {tasks.filter((t) => t.status === 'approved').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'approved')
                .map((task) => (
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

            {/* Completed Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-green-600">
                  {t('common.completed')}
                </h3>
                <Badge className="bg-green-100 text-green-700">
                  {tasks.filter((t) => t.status === 'completed').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'completed')
                .map((task) => (
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
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-6">
              <p>Modo lista a ser implementado com Tabela Shadcn.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
