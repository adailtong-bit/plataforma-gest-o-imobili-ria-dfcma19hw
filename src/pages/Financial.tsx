import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User } from '@/lib/types'

export default function Financial() {
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()

  if (!hasPermission(currentUser as User, 'financial', 'view')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado ao painel financeiro.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('financial.title')}
          </h1>
          <p className="text-muted-foreground">{t('financial.subtitle')}</p>
        </div>
      </div>
      {/* Financial Content */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Conteúdo financeiro visível apenas para usuários autorizados.</p>
        </CardContent>
      </Card>
    </div>
  )
}
