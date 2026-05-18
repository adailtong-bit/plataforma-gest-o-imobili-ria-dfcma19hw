import { Task } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  User,
  DollarSign,
  Calendar,
  Paperclip,
  AlertCircle,
  Eye,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Building,
  Check,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { cn } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'

interface TaskCardProps {
  task: Task
  onStatusChange?: (status: Task['status']) => void
  onUpload?: (taskId: string, url: string) => void
  onAddEvidence?: (taskId: string, evidence: any) => void
  canEdit?: boolean
}

export function TaskCard({ task, onStatusChange, canEdit }: TaskCardProps) {
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow bg-white relative group border-slate-200">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase bg-slate-100 font-bold text-slate-700"
            >
              {task.type === 'cleaning'
                ? t('common.cleaning') || 'Limpeza'
                : task.type === 'maintenance'
                  ? t('common.maintenance') || 'Manutenção'
                  : task.type === 'inspection'
                    ? t('visits.inspection') || 'Inspeção'
                    : task.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] uppercase font-bold',
                getPriorityStyle(task.priority),
              )}
            >
              {task.priority === 'low'
                ? t('common.low') || 'Baixa'
                : task.priority === 'medium'
                  ? t('common.medium') || 'Média'
                  : task.priority === 'high'
                    ? t('common.high') || 'Alta'
                    : task.priority === 'critical'
                      ? t('common.critical') || 'Crítica'
                      : task.priority}
            </Badge>
          </div>
          {task.backToBack && (
            <Badge
              variant="destructive"
              className="text-[10px] uppercase px-1 py-0 h-4"
            >
              B2B
            </Badge>
          )}
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 leading-tight">
            <DataMask>{task.title}</DataMask>
          </h4>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Building className="h-3 w-3" />
            <span className="truncate">
              <DataMask>{task.propertyName}</DataMask>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-slate-400" />
            <span className="font-medium truncate max-w-[100px]">
              <DataMask>{task.assignee}</DataMask>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span className="font-medium">
              {format(new Date(task.date), 'MMM dd')}
            </span>
          </div>
        </div>

        {task.status === 'pending_acceptance' && (
          <div className="mt-3 border-t border-slate-100 pt-3 flex flex-col gap-2">
            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
              <AlertCircle className="h-3 w-3" />
              <span>Pending Acceptance</span>
            </div>
            {canEdit &&
              (currentUser?.role === 'partner' ||
                currentUser?.role === 'partner_employee' ||
                currentUser?.role === 'platform_owner') && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onStatusChange) onStatusChange('pending')
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onStatusChange) onStatusChange('rejected')
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
