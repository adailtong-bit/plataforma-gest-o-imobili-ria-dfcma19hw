import { Task } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  MoreHorizontal,
  Upload,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onStatusChange?: (status: Task['status']) => void
  onUpload?: (taskId: string, url: string) => void
  onAddEvidence?: (taskId: string, evidence: any) => void
  canEdit?: boolean
}

export function TaskCard({
  task,
  onStatusChange,
  onUpload,
  onAddEvidence,
  canEdit = false,
}: TaskCardProps) {
  const { t, language } = useLanguageStore()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending_approval':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <Card className="hover:shadow-md transition-all border-slate-200 bg-white group">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Badge
            variant="outline"
            className={cn('font-bold', getPriorityColor(task.priority))}
          >
            {task.priority.toUpperCase()}
          </Badge>
          {canEdit && onStatusChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t('tasks.change_status')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onStatusChange('pending')}>
                  {t('common.pending')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('in_progress')}>
                  {t('tasks.in_progress')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                  {t('common.completed')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div>
          <h4 className="font-bold text-base leading-tight text-slate-900 line-clamp-2">
            <DataMask>{task.title}</DataMask>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <DataMask>{task.propertyName}</DataMask>
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 font-medium mt-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.date, language)}</span>
          </div>
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>
                <DataMask>{task.assignee}</DataMask>
              </span>
            </div>
          )}
        </div>

        {task.description && (
          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded line-clamp-2">
            <DataMask>{task.description}</DataMask>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <Badge
            variant="secondary"
            className={cn('text-[10px]', getStatusColor(task.status))}
          >
            {t(`common.${task.status}`) || task.status}
          </Badge>
          <div className="flex gap-1">
            {task.images && task.images.length > 0 && (
              <Badge variant="outline" className="gap-1 px-1.5">
                <ImageIcon className="h-3 w-3" /> {task.images.length}
              </Badge>
            )}
            {task.evidence && task.evidence.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1 px-1.5 bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="h-3 w-3" /> {task.evidence.length}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
