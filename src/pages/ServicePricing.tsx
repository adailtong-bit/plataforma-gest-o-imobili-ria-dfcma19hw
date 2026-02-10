import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceCatalog } from '@/components/settings/ServiceCatalog'
import useLanguageStore from '@/stores/useLanguageStore'
import { BarChart3, List } from 'lucide-react'

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
        <TabsList>
          <TabsTrigger value="catalog">
            <List className="h-4 w-4 mr-2" />
            {t('service_pricing.catalog_tab')}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('service_pricing.analytics_tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <Card>
            <CardContent className="pt-6">
              <ServiceCatalog />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{t('service_pricing.profit_analysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t('common.empty')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
