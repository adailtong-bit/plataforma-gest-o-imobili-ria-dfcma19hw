import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import { formatCurrency } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Dashboard() {
  const { properties, tenants, financials } = useContext(AppContext)!
  const { t } = useLanguageStore()

  const totalRevenue = financials.invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0)

  const activeTenants = tenants.filter((t) => t.status === 'active').length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {t('sidebar.dashboard') || 'Painel'}
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('common.total_revenue') || 'Receita Total'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('common.properties') || 'Propriedades'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('common.active_tenants') || 'Inquilinos Ativos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTenants}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
