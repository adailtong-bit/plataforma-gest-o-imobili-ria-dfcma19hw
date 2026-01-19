import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAuthStore from '@/stores/useAuthStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useTaskStore from '@/stores/useTaskStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { TaskCard } from '@/components/tasks/TaskCard'
import { PartnerStaff } from '@/components/partners/PartnerStaff'
import { Building, ClipboardList, Users } from 'lucide-react'

export default function PartnerPortal() {
  const { currentUser } = useAuthStore()
  const { partners, updatePartner } = usePartnerStore()
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()

  const partnerRecord = partners.find(
    (p) => p.id === currentUser.id || p.email === currentUser.email,
  )

  if (!partnerRecord) {
    return <div className="p-8">Registro de parceiro não encontrado.</div>
  }

  // Filter Data
  const linkedPropertyIds = partnerRecord.linkedPropertyIds || []
  const myProperties = properties.filter((p) =>
    linkedPropertyIds.includes(p.id),
  )

  const myTasks = tasks.filter(
    (t) =>
      t.assigneeId === partnerRecord.id || // Explicit assignment
      (linkedPropertyIds.includes(t.propertyId) &&
        t.type === partnerRecord.type &&
        !t.assigneeId), // Or linked property + correct type + unassigned
  )

  const pendingTasks = myTasks.filter((t) => t.status === 'pending')
  const activeTasks = myTasks.filter((t) => t.status === 'in_progress')
  const completedTasks = myTasks.filter((t) => t.status === 'completed')

  const handleUpdatePartner = (updated: any) => {
    updatePartner(updated)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Portal do Parceiro
        </h1>
        <p className="text-muted-foreground">Bem-vindo, {partnerRecord.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Propriedades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProperties.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" /> Tarefas
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="h-4 w-4 mr-2" /> Minha Equipe
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Building className="h-4 w-4 mr-2" /> Propriedades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myTasks.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground bg-card rounded-lg border border-dashed">
                Nenhuma tarefa atribuída no momento.
              </div>
            ) : (
              myTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  onUpload={addTaskImage}
                  onAddEvidence={addTaskEvidence}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <PartnerStaff
            partner={partnerRecord}
            onUpdate={handleUpdatePartner}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Propriedades Vinculadas</CardTitle>
              <CardDescription>
                Lista de propriedades que você atende.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Comunidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myProperties.map((prop) => (
                    <TableRow key={prop.id}>
                      <TableCell className="font-medium">{prop.name}</TableCell>
                      <TableCell>{prop.address}</TableCell>
                      <TableCell>{prop.community}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{prop.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/properties/${prop.id}`)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
