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
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Clock,
  Upload,
  MapPin,
  Eye,
  CheckCircle2,
  User,
  Edit,
  Pencil,
  Play,
  Square,
  Star,
  ThumbsUp,
  BellRing,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { TaskDetailsSheet } from './TaskDetailsSheet'
import { EvidenceUploadDialog } from './EvidenceUploadDialog'
import { EditTaskDialog } from './EditTaskDialog'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import usePartnerStore from '@/stores/usePartnerStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useTaskStore from '@/stores/useTaskStore'

interface TaskCardProps {
  task: Task
  onStatusChange: (status: Task['status']) => void
  onUpload?: (taskId: string, img: string) => void
  onAddEvidence?: (taskId: string, evidence: Evidence) => void
  canEdit?: boolean
}

export function TaskCard({
  task,
  onStatusChange,
  onUpload,
  onAddEvidence,
  canEdit = false,
}: TaskCardProps) {
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const { partners } = usePartnerStore()
  const { updateTask, notifySupplier } = useTaskStore()

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')

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
      onUpload(task.id, 'https://img.usecurling.com/p/200/150?q=maintenance')
      toast({
        title: 'Foto enviada',
        description: 'Evidência adicionada à tarefa.',
      })
    }
  }

  const handleEvidenceUpload = (evidenceList: Evidence[]) => {
    if (onAddEvidence) {
      evidenceList.forEach((ev) => onAddEvidence(task.id, ev))
      const type = evidenceList[0]?.type

      if (type === 'arrival') {
        onStatusChange('in_progress')
        setCheckInOpen(false)
        toast({
          title: 'Check-in realizado',
          description: `Tarefa iniciada às ${format(new Date(), 'HH:mm')}`,
        })
      } else if (type === 'completion') {
        onStatusChange('completed')
        setCheckOutOpen(false)
        toast({
          title: 'Serviço Concluído',
          description: `Tarefa finalizada com ${evidenceList.length} fotos.`,
        })
      }
    }
  }

  const handleRate = () => {
    updateTask({
      ...task,
      rating,
      feedback,
    })
    setRateOpen(false)
    toast({
      title: 'Avaliação Enviada',
      description: 'Obrigado pelo feedback!',
    })
  }

  const handleApprove = () => {
    onStatusChange('pending')
    toast({
      title: 'Aprovado',
      description: 'Tarefa autorizada para execução.',
    })
  }

  // Hierarchical Visibility Logic
  const isTeamMember = currentUser.role === 'partner_employee'
  const isPartner = currentUser.role === 'partner'
  const isOwner = currentUser.role === 'property_owner'
  const isAdminOrPM = [
    'platform_owner',
    'software_tenant',
    'internal_user',
  ].includes(currentUser.role)

  // Determine which financial values to show
  const showPartnerPrice = isAdminOrPM || isPartner
  const showTeamPayout = isAdminOrPM || isPartner || isTeamMember
  const showBillable = isAdminOrPM || isOwner

  const partnerRecord = isPartner
    ? partners.find(
        (p) => p.id === currentUser.id || p.email === currentUser.email,
      )
    : partners.find((p) => p.id === task.assigneeId)

  const canDelegate =
    (isPartner &&
      partnerRecord &&
      (task.assigneeId === partnerRecord.id ||
        (partnerRecord.linkedPropertyIds?.includes(task.propertyId) &&
          task.type === partnerRecord.type))) ||
    isAdminOrPM

  const handleAssignEmployee = (employeeId: string) => {
    updateTask({ ...task, partnerEmployeeId: employeeId })
    toast({
      title: 'Funcionário Atribuído',
      description: `Tarefa delegada internamente.`,
    })
    setAssignOpen(false)
  }

  const assignedEmployeeName = partnerRecord?.employees?.find(
    (e) => e.id === task.partnerEmployeeId,
  )?.name

  return (
    <>
      <TaskDetailsSheet
        task={task}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />

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

      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Serviço</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <div className="grid gap-2">
              <Label>Comentário</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Como foi o serviço?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRate}>Enviar Avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="hover:shadow-md transition-shadow group flex flex-col h-full relative">
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start">
            <Badge
              variant="outline"
              className={getPriorityColor(task.priority)}
            >
              {task.priority.toUpperCase()}
            </Badge>
            <div className="flex gap-1 flex-wrap justify-end">
              {task.status === 'pending_approval' && (
                <Badge className="bg-orange-500 text-white text-[10px] h-5">
                  Approval Req
                </Badge>
              )}
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
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
              {task.title}
            </CardTitle>
            {canEdit &&
              task.status !== 'completed' &&
              task.status !== 'pending_approval' &&
              !isTeamMember && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
          </div>
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

          <div className="flex flex-col gap-1 mb-3">
            {showBillable && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Preço Total:</span>
                <span className="font-bold text-gray-900">
                  ${(task.billableAmount || task.price || 0).toFixed(2)}
                </span>
              </div>
            )}
            {showPartnerPrice && task.price && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Custo (Partner):</span>
                <span className="font-semibold text-green-700">
                  ${task.price.toFixed(2)}
                </span>
              </div>
            )}
            {showTeamPayout && task.teamMemberPayout && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payout (Equipe):</span>
                <span className="font-semibold text-blue-700">
                  ${task.teamMemberPayout.toFixed(2)}
                </span>
              </div>
            )}
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

          {/* Supplier Communication - Last Notified */}
          {task.lastNotified && isAdminOrPM && (
            <div className="mt-2 text-[10px] text-muted-foreground text-right italic">
              Notified: {format(new Date(task.lastNotified), 'dd/MM HH:mm')}
            </div>
          )}

          {(assignedEmployeeName || canDelegate) && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Equipe:</span>
                {assignedEmployeeName ? (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {assignedEmployeeName}
                    </Badge>
                    {canDelegate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setAssignOpen(true)}
                        title="Alterar Atribuição"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                      >
                        <User className="h-3 w-3 mr-1" /> Atribuir
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delegar Tarefa</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Label>Selecione um funcionário</Label>
                        <Select onValueChange={handleAssignEmployee}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Escolha..." />
                          </SelectTrigger>
                          <SelectContent>
                            {partnerRecord?.employees?.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name} ({emp.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto grid gap-2">
          {/* Action Buttons for PM/Admin */}
          {isAdminOrPM && task.status !== 'completed' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => notifySupplier(task.id)}
                title="Notify Supplier"
              >
                <BellRing className="h-3 w-3 mr-1" /> Notify
              </Button>
            </div>
          )}

          {task.status === 'pending_approval' && isAdminOrPM && (
            <Button
              size="sm"
              className="w-full h-9 text-xs bg-orange-600 hover:bg-orange-700"
              onClick={handleApprove}
            >
              <ThumbsUp className="h-3 w-3 mr-2" /> Aprovar Orçamento
            </Button>
          )}

          {task.status === 'pending' && (
            <Button
              size="sm"
              className="w-full h-9 text-xs bg-trust-blue hover:bg-trust-blue/90"
              onClick={() => setCheckInOpen(true)}
            >
              <Play className="h-3 w-3 mr-2 fill-current" />{' '}
              {t('tasks.start_checkin')}
            </Button>
          )}
          {task.status === 'in_progress' && (
            <div className="grid grid-cols-2 gap-2 w-full">
              {onUpload && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs h-9">
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
                className="text-xs h-9 bg-green-600 hover:bg-green-700"
                onClick={() => setCheckOutOpen(true)}
              >
                <Square className="h-3 w-3 mr-1 fill-current" />{' '}
                {t('tasks.finish')}
              </Button>
            </div>
          )}
          {task.status === 'completed' && (
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 h-9 text-xs cursor-default"
              >
                <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                {t('common.completed')}
              </Button>
              {isAdminOrPM && !task.rating && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  onClick={() => setRateOpen(true)}
                  title="Avaliar"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              {task.rating && (
                <div className="flex items-center gap-1 px-2 border rounded-md bg-yellow-50 text-yellow-700">
                  <Star className="h-3 w-3 fill-yellow-500" />
                  <span className="text-xs font-bold">{task.rating}</span>
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground"
            onClick={() => setDetailsOpen(true)}
          >
            {t('tasks.details_evidence')}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
