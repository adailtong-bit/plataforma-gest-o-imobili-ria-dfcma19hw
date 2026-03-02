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
} from 'lucide-react'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
  task: Task
  onStatusChange?: (status: Task['status']) => void
  onUpload?: (taskId: string, url: string) => void
  onAddEvidence?: (taskId: string, evidence: any) => void
  canEdit?: boolean
}

export function TaskCard({ task, onStatusChange, canEdit }: TaskCardProps) {
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
    <Card className="hover:shadow-md transition-shadow bg-white relative group cursor-grab active:cursor-grabbing border-slate-200">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase bg-slate-100 font-bold text-slate-700"
            >
              {task.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] uppercase font-bold',
                getPriorityStyle(task.priority),
              )}
            >
              {task.priority}
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
      </CardContent>
    </Card>
  )
}
