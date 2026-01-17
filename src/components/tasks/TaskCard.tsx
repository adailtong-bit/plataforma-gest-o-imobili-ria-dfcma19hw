import { useState } from 'react'
import { Task, Evidence } from '@/lib/types'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Clock,
  Upload,
  MapPin,
  Eye,
  Camera,
  CheckCircle2,
  Receipt,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { TaskDetailsSheet } from './TaskDetailsSheet'
import { EvidenceUploadDialog } from './EvidenceUploadDialog'
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'

interface TaskCardProps {
  task: Task
  onStatusChange: (status: Task['status']) => void
  onUpload?: (taskId: string, img: string) => void
  onAddEvidence?: (taskId: string, evidence: Evidence) => void
}

export function TaskCard({
  task,
  onStatusChange,
  onUpload,
  onAddEvidence,
}: TaskCardProps) {
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const { addLedgerEntry, ledgerEntries } = useFinancialStore()
  const [detailsOpen, setDetailsOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [file, setFile] = useState<File | null>(null)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)

  const isBilled = ledgerEntries.some((e) => e.referenceId === task.id)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const handleGenericUpload = () => {
    if (onUpload) {
      // Mock upload
      onUpload(task.id, 'https://img.usecurling.com/p/200/150?q=maintenance')
      toast({
        title: 'Foto enviada',
        description: 'Evidência adicionada à tarefa.',
      })
    }
  }

  const handleEvidenceUpload = (evidence: Evidence) => {
    if (onAddEvidence) {
      onAddEvidence(task.id, evidence)

      if (evidence.type === 'arrival') {
        onStatusChange('in_progress')
        setCheckInOpen(false)
        toast({
          title: 'Check-in realizado',
          description: 'Tarefa iniciada com registro de chegada.',
        })
      } else if (evidence.type === 'completion') {
        onStatusChange('completed')
        setCheckOutOpen(false)
        toast({
          title: 'Serviço Concluído',
          description: 'Tarefa finalizada com registro de conclusão.',
        })
      }
    }
  }

  const handleBillTask = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task.price) {
      toast({
        title: 'Erro',
        description: 'Esta tarefa não tem preço definido.',
        variant: 'destructive',
      })
      return
    }

    addLedgerEntry({
      id: `ledg-task-${task.id}`,
      propertyId: task.propertyId,
      date: new Date().toISOString(),
      type: 'expense',
      category:
        task.type === 'cleaning'
          ? 'Cleaning'
          : task.type === 'maintenance'
            ? 'Maintenance'
            : 'Other',
      amount: task.price,
      description: `${t(`tasks.${task.type}` || 'Serviço')} - ${task.title}`,
      referenceId: task.id,
      status: 'pending',
    })

    toast({
      title: 'Lançamento Criado',
      description: `Despesa de $${task.price} adicionada ao ledger.`,
    })
  }

  return (
    <>
      <TaskDetailsSheet
        task={task}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <EvidenceUploadDialog
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        task={task}
        type="arrival"
        onConfirm={handleEvidenceUpload}
      />

      <EvidenceUploadDialog
        open={checkOutOpen}
        onOpenChange={setCheckOutOpen}
        task={task}
        type="completion"
        onConfirm={handleEvidenceUpload}
      />

      <Card className="hover:shadow-md transition-shadow group flex flex-col h-full">
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start">
            <Badge
              variant="outline"
              className={getPriorityColor(task.priority)}
            >
              {task.priority.toUpperCase()}
            </Badge>
            <div className="flex gap-1 flex-wrap justify-end">
              {task.type === 'cleaning' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {t('partners.cleaning')}
                </Badge>
              )}
              {task.type === 'maintenance' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Reparo
                </Badge>
              )}
              {task.type === 'inspection' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Inspeção
                </Badge>
              )}
              {task.backToBack && (
                <Badge variant="destructive" className="text-[10px] px-1 h-5">
                  B2B
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="font-medium truncate">{task.propertyName}</div>
            {(task.propertyAddress || task.propertyCommunity) && (
              <div className="flex items-start gap-1 text-[10px] opacity-80">
                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {task.propertyCommunity ? `${task.propertyCommunity}, ` : ''}
                  {task.propertyAddress}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-grow">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(task.date), 'dd/MM/yyyy')}</span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-xs font-medium bg-secondary px-2 py-1 rounded-full truncate max-w-[120px]">
              {task.assignee}
            </div>
            {((task.images && task.images.length > 0) ||
              (task.evidence && task.evidence.length > 0)) && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <Eye className="h-2 w-2" />
                {(task.images?.length || 0) + (task.evidence?.length || 0)}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto grid gap-2">
          {task.status === 'pending' && (
            <Button
              size="sm"
              className="w-full h-8 text-xs bg-trust-blue hover:bg-trust-blue/90"
              onClick={() => setCheckInOpen(true)}
            >
              <Camera className="h-3 w-3 mr-2" /> {t('tasks.start_checkin')}
            </Button>
          )}
          {task.status === 'in_progress' && (
            <div className="grid grid-cols-2 gap-2 w-full">
              {onUpload && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs h-8">
                      <Upload className="h-3 w-3 mr-1" /> {t('tasks.photos')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('tasks.evidence_upload')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">
                          {t('tasks.evidence_photo')}
                        </Label>
                        <Input
                          id="picture"
                          type="file"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button onClick={handleGenericUpload}>
                        {t('tasks.send')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                size="sm"
                className="text-xs h-8 bg-green-600 hover:bg-green-700"
                onClick={() => setCheckOutOpen(true)}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> {t('tasks.finish')}
              </Button>
            </div>
          )}
          {task.status === 'completed' && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 h-8 text-xs cursor-default"
              >
                <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                {t('common.completed')}
              </Button>
              {task.price && !isBilled && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={handleBillTask}
                  title="Lançar no Financeiro"
                >
                  <Receipt className="h-4 w-4 text-orange-600" />
                </Button>
              )}
              {isBilled && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-green-600"
                  title="Já lançado"
                  disabled
                >
                  <Receipt className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs text-muted-foreground"
            onClick={() => setDetailsOpen(true)}
          >
            {t('tasks.details_evidence')}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
