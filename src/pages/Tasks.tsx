import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { translateStatus } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function Tasks() {
  const { t } = useDbTranslations()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, priority, status')
        .order('created_at', { ascending: false })
        .limit(50)
      if (isMounted) {
        setTasks(data || [])
        setLoading(false)
      }
    }
    fetchTasks()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('tasks.title', 'Tasks')}
        </h1>
        <p className="text-slate-500">
          {t('tasks.subtitle', 'Manage your tasks')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tasks.list', 'Task List')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_title', 'Title')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_priority', 'Priority')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_status', 'Status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        {t('common.no_data', 'No data available')}
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {task.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600 capitalize font-medium">
                          {t(
                            `priority.${task.priority}`,
                            task.priority || 'Normal',
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              task.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize font-medium"
                          >
                            {translateStatus(task.status, t)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
