import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

export default function Hotels() {
  const { t } = useDbTranslations()
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchHotels = async () => {
      const { data } = await supabase
        .from('hotels')
        .select('id, name, city, manager_name')
        .order('created_at', { ascending: false })
        .limit(50)
      if (isMounted) {
        setHotels(data || [])
        setLoading(false)
      }
    }
    fetchHotels()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('hotels.title', 'Hotels')}
        </h1>
        <p className="text-slate-500">
          {t('hotels.subtitle', 'Manage your hotels')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('hotels.list', 'Hotel List')}</CardTitle>
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
                      {t('table_header_name', 'Name')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_city', 'City')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_manager', 'Manager')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hotels.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        {t('common.no_data', 'No data available')}
                      </td>
                    </tr>
                  ) : (
                    hotels.map((hotel) => (
                      <tr
                        key={hotel.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {hotel.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {hotel.city}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {hotel.manager_name ||
                            t('common.unassigned', 'Unassigned')}
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
