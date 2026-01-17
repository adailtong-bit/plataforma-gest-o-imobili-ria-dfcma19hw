import { ServiceCatalog } from '@/components/settings/ServiceCatalog'
import useLanguageStore from '@/stores/useLanguageStore'

export default function ServicePricing() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('common.service_pricing')}
        </h1>
        <p className="text-muted-foreground">{t('common.service_desc')}</p>
      </div>
      <ServiceCatalog />
    </div>
  )
}
