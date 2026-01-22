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
import { Building, ClipboardList, Users, Wallet } from 'lucide-react'
import { User } from '@/lib/types'

export default function PartnerPortal() {
  const { currentUser } = useAuthStore()
  const { partners, updatePartner } = usePartnerStore()
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()

  // Determine if it's a Partner (Company) or Team Member (Employee)
  const isTeamMember = currentUser.role === 'partner_employee'

  // Logic to find the main Partner Record
  // If Team Member, look up parent Partner by ID
  // If Partner, look up by ID
  const partnerRecord = isTeamMember
    ? partners.find(
        (p) =>
          p.id === (currentUser as User).parentPartnerId ||
          p.id === (currentUser as User).parentId,
      )
    : partners.find(
        (p) => p.id === currentUser.id || p.email === currentUser.email,
      )

  if (!partnerRecord) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Registro de parceiro não encontrado. Verifique se o vínculo com a
        empresa parceira está correto.
      </div>
    )
  }

  // Filter Data
  const linkedPropertyIds = partnerRecord.linkedPropertyIds || []
  const myProperties = properties.filter((p) =>
    linkedPropertyIds.includes(p.id),
  )

  const myTasks = tasks.filter((t) => {
    // If Team Member, ONLY see assigned tasks
    if (isTeamMember) {
      return t.partnerEmployeeId === currentUser.id
    }
    // If Partner, see all tasks assigned to the company OR unassigned but valid for this partner
    return (
      t.assigneeId === partnerRecord.id ||
      (linkedPropertyIds.includes(t.propertyId) &&
        t.type === partnerRecord.type &&
        !t.assigneeId)
    )
  })

  const pendingTasks = myTasks.filter((t) => t.status === 'pending')
  const activeTasks = myTasks.filter((t) => t.status === 'in_progress')

  // Financial Calcs with Hierarchical Visibility
  const completedTasks = myTasks.filter((t) => t.status === 'completed')

  // For Team Member: Revenue = Their Payout
  // For Partner: Revenue = Task Price, Expense = Team Payout
  const totalRevenue = completedTasks.reduce((acc, t) => {
    if (isTeamMember) return acc + (t.teamMemberPayout || 0)
    return acc + (t.price || 0)
  }, 0)

  const totalPayout = isTeamMember
    ? 0 // No payout expense for team member
    : completedTasks.reduce((acc, t) => acc + (t.teamMemberPayout || 0), 0)

  const netProfit = totalRevenue - totalPayout

  const handleUpdatePartner = (updated: any) => {
    updatePartner(updated)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Portal {isTeamMember ? 'da Equipe' : 'do Parceiro'}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <p>Bem-vindo, {currentUser.name}</p>
          {isTeamMember && (
            <Badge variant="outline" className="text-xs">
              {partnerRecord.companyName || partnerRecord.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-green-700">
              {isTeamMember ? 'Meus Ganhos' : 'Receita Bruta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Concluídas</p>
          </CardContent>
        </Card>

        {/* Only show Profit/Margin for Partners (Companies) */}
        {!isTeamMember && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Lucro Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                ${netProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Após pagamentos equipe
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" /> Minhas Tarefas
          </TabsTrigger>
          {!isTeamMember && (
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" /> Minha Equipe
            </TabsTrigger>
          )}
          <TabsTrigger value="properties">
            <Building className="h-4 w-4 mr-2" /> Propriedades
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Wallet className="h-4 w-4 mr-2" /> Extrato
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
                  canEdit={!isTeamMember || task.status === 'in_progress'} // Limit editing
                />
              ))
            )}
          </div>
        </TabsContent>

        {!isTeamMember && (
          <TabsContent value="staff">
            <PartnerStaff
              partner={partnerRecord}
              onUpdate={handleUpdatePartner}
              canEdit={true}
            />
          </TabsContent>
        )}

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Propriedades Vinculadas</CardTitle>
              <CardDescription>
                Lista de propriedades que{' '}
                {isTeamMember ? 'sua empresa atende' : 'você atende'}.
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

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Tarefa</CardTitle>
              <CardDescription>
                Registro financeiro dos serviços.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tarefa</TableHead>
                    {!isTeamMember && <TableHead>Funcionário</TableHead>}
                    <TableHead className="text-right">Valor</TableHead>
                    {!isTeamMember && (
                      <TableHead className="text-right">Custo</TableHead>
                    )}
                    {!isTeamMember && (
                      <TableHead className="text-right">Margem</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTasks.map((t) => {
                    const empName =
                      partnerRecord.employees?.find(
                        (e) => e.id === t.partnerEmployeeId,
                      )?.name || 'N/A'
                    const value = isTeamMember
                      ? t.teamMemberPayout || 0
                      : t.price || 0
                    const cost = isTeamMember ? 0 : t.teamMemberPayout || 0
                    const margin = value - cost

                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          {format(new Date(t.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{t.title}</TableCell>
                        {!isTeamMember && <TableCell>{empName}</TableCell>}
                        <TableCell className="text-right font-medium text-green-700">
                          ${value.toFixed(2)}
                        </TableCell>
                        {!isTeamMember && (
                          <TableCell className="text-right text-red-600">
                            -${cost.toFixed(2)}
                          </TableCell>
                        )}
                        {!isTeamMember && (
                          <TableCell className="text-right font-bold">
                            ${margin.toFixed(2)}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
