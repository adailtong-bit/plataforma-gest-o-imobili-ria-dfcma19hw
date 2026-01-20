import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvertiserList } from '@/components/publicity/AdvertiserList'
import { AdsManager } from '@/components/publicity/AdsManager'
import { PricingConfig } from '@/components/publicity/PricingConfig'
import { Megaphone, Users, DollarSign } from 'lucide-react'

export default function PublicityAdmin() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Publicity Administration
        </h1>
        <p className="text-muted-foreground">
          Manage advertisers, campaigns, and monetization settings.
        </p>
      </div>

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ads">
            <Megaphone className="h-4 w-4 mr-2" /> Advertisements
          </TabsTrigger>
          <TabsTrigger value="advertisers">
            <Users className="h-4 w-4 mr-2" /> Advertisers
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" /> Pricing Config
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
