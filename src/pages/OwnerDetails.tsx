import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  User as UserIcon,
  Building,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import useOwnerStore from '@/stores/useOwnerStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OwnerStatement } from '@/components/financial/OwnerStatement'
import { BillingManager } from '@/components/users/BillingManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Owner } from '@/lib/types'

export default function OwnerDetails() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const currentTab = tab || 'overview'
  const { owners } = useOwnerStore()
  const { properties } = usePropertyStore()
  const { ledgerEntries } = useFinancialStore()

  const [isLoading, setIsLoading] = useState(true)
  const [owner, setOwner] = useState<Owner | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const found = owners.find((o) => o.id === id)
      if (found) {
        setOwner(found)
      }
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [id, owners])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="p-6 text-center max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Owner Not Found
        </h2>
        <Button
          onClick={() => navigate('/owners')}
          className="mt-4 bg-trust-blue text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Owners
        </Button>
      </div>
    )
  }

  const ownerProperties = properties.filter((p) => p.ownerId === owner.id)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/owners')}
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border">
              <UserIcon className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {owner.name}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Owner Portfolio
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(v) => navigate(`/owners/${id}/${v}`)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 md:w-[500px] mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" /> {owner.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400" />{' '}
                  {owner.phone || 'No phone provided'}
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    {owner.address && <div>{owner.address}</div>}
                    <div>
                      {owner.city ? `${owner.city}, ` : ''}
                      {owner.state ? `${owner.state} ` : ''}
                      {owner.zipCode || owner.zip_code || ''}
                    </div>
                    {!owner.city && !owner.address && (
                      <span className="text-slate-400">
                        No address provided
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 border-t pt-4 mt-2">
                  <span className="font-semibold text-slate-500">Tax ID:</span>{' '}
                  {owner.document || 'Not provided'}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  Owned Properties ({ownerProperties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ownerProperties.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No properties assigned to this owner.
                    </p>
                  )}
                  {ownerProperties.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => navigate(`/properties/${p.id}`)}
                    >
                      <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {p.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials">
          <OwnerStatement
            ownerId={owner.id}
            properties={properties}
            ledgerEntries={ledgerEntries}
          />
        </TabsContent>

        <TabsContent value="agreements">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Service Agreements & Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-6">
                Configure the financial agreements and billing periods for this
                owner. These rules dictate management fees, maintenance markups,
                and other automated charges.
              </div>
              <BillingManager targetId={owner.id} targetRole="property_owner" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
