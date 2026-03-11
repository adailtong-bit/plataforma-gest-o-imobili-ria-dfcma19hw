import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdsManager } from '@/components/publicity/AdsManager'
import { AdvertiserList } from '@/components/publicity/AdvertiserList'
import { PricingConfig } from '@/components/publicity/PricingConfig'
import useLanguageStore from '@/stores/useLanguageStore'

export default function PublicityAdmin() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.publicity_admin') || 'Publicity Management'}
        </h1>
        <p className="text-muted-foreground">
          Manage platform advertisements, marketing campaigns, and partner
          billing.
        </p>
      </div>

      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="mb-4 bg-white border">
          <TabsTrigger value="ads" className="data-[state=active]:bg-slate-100">
            Campaigns & Ads
          </TabsTrigger>
          <TabsTrigger
            value="advertisers"
            className="data-[state=active]:bg-slate-100"
          >
            Advertisers
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-slate-100"
          >
            Pricing Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="m-0">
          <AdsManager />
        </TabsContent>

        <TabsContent value="advertisers" className="m-0">
          <AdvertiserList />
        </TabsContent>

        <TabsContent value="pricing" className="m-0">
          <PricingConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
}
