import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { workflows } from '@/lib/mockData'
import { Plus, Settings, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Workflows() {
  const { toast } = useToast()
  // Mock state for workflows since we read from mockData
  const [activeWorkflows] = useState(workflows)

  const handleRun = (id: string) => {
    toast({
      title: 'Workflow Iniciado',
      description: `O workflow ${id} foi disparado manualmente.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Motor de Workflow
          </h1>
          <p className="text-muted-foreground">
            Automatize processos e sequências de tarefas.
          </p>
        </div>
        <Button className="bg-trust-blue gap-2">
          <Plus className="h-4 w-4" /> Novo Workflow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflows Ativos</CardTitle>
          <CardDescription>
            Processos automatizados configurados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Gatilho</TableHead>
                <TableHead>Passos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeWorkflows.map((wf) => (
                <TableRow key={wf.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{wf.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {wf.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{wf.trigger}</Badge>
                  </TableCell>
                  <TableCell>{wf.steps.length}</TableCell>
                  <TableCell>
                    <Badge
                      variant={wf.active ? 'default' : 'secondary'}
                      className={wf.active ? 'bg-green-600' : ''}
                    >
                      {wf.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRun(wf.id)}
                        title="Executar Manualmente"
                      >
                        <Play className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Configurar">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
