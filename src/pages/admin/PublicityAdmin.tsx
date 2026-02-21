import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvertiserList } from '@/components/publicity/AdvertiserList'
import { AdsManager } from '@/components/publicity/AdsManager'
import { PricingConfig } from '@/components/publicity/PricingConfig'
import { Megaphone, Users, DollarSign } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

export default function PublicityAdmin() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('publicity.title')}
        </h1>
        <p className="text-muted-foreground">{t('publicity.subtitle')}</p>
      </div>

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="ads" className="whitespace-nowrap">
            <Megaphone className="h-4 w-4 mr-2" /> {t('publicity.tab_ads')}
          </TabsTrigger>
          <TabsTrigger value="advertisers" className="whitespace-nowrap">
            <Users className="h-4 w-4 mr-2" /> {t('publicity.tab_advertisers')}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="whitespace-nowrap">
            <DollarSign className="h-4 w-4 mr-2" /> {t('publicity.tab_pricing')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          <AdsManager />
        </TabsContent>

        <TabsContent value="advertisers">
          <AdvertiserList />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
}
