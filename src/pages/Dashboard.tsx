import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Building2, Users, FileText, CheckSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Dashboard() {
  const { t } = useDbTranslations()
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    invoices: 0,
    tasks: 0,
  })

  useEffect(() => {
    let isMounted = true
    const fetchStats = async () => {
      try {
        const [props, ten, inv, tsk] = await Promise.all([
          supabase
            .from('properties')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'tenant'),
          supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true }),
          supabase.from('tasks').select('id', { count: 'exact', head: true }),
        ])

        if (isMounted) {
          setStats({
            properties: props.count || 0,
            tenants: ten.count || 0,
            invoices: inv.count || 0,
            tasks: tsk.count || 0,
          })
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err)
      }
    }
    fetchStats()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('dashboard.title', 'Dashboard')}
        </h1>
        <p className="text-slate-500">
          {t('dashboard.subtitle', 'Overview of your operations')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('properties.title', 'Properties')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.properties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('tenants.title', 'Tenants')}
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('invoices.title', 'Invoices')}
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {t('tasks.title', 'Tasks')}
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
