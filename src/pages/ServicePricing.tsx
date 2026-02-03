import { ServiceCatalog } from '@/components/settings/ServiceCatalog'
import { ServiceAnalytics } from '@/components/settings/ServiceAnalytics'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ServicePricing() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('service_pricing.title')}
        </h1>
        <p className="text-muted-foreground">{t('service_pricing.subtitle')}</p>
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="catalog">
            {t('common.service_pricing')}
          </TabsTrigger>
          <TabsTrigger value="analytics">{t('reports.reports')}</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog">
          <ServiceCatalog />
        </TabsContent>
        <TabsContent value="analytics">
          <ServiceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
