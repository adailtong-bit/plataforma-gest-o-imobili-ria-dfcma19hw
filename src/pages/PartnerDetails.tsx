import { useParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useLanguageStore from '@/stores/useLanguageStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Briefcase,
  Users,
  Mail,
  Phone,
  MapPin,
  Tag,
  Building2,
  User,
  Wrench,
  DollarSign,
  FileText,
} from 'lucide-react'
import { DataMask } from '@/components/DataMask'
import { Badge } from '@/components/ui/badge'
import { PartnerStaff } from '@/components/partners/PartnerStaff'
import { PartnerPricing } from '@/components/partners/PartnerPricing'
import { PartnerDocuments } from '@/components/partners/PartnerDocuments'
import { PartnerProperties } from '@/components/partners/PartnerProperties'

export default function PartnerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useContext(AppContext)
  const partners = context?.partners || []
  const updatePartner = context?.updatePartner
  const { t } = useLanguageStore()

  const partner = partners.find((p) => p.id === id)

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Partner Not Found</h1>
        <Button onClick={() => navigate('/partners')}>
          {t('common.back') || 'Go Back'}
        </Button>
      </div>
    )
  }

  const handleUpdate = (updatedPartner: any) => {
    if (updatePartner) {
      updatePartner(updatedPartner)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/partners')}
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              {partner.entityType === 'individual' ? (
                <User className="h-5 w-5 text-slate-400" />
              ) : (
                <Building2 className="h-5 w-5 text-slate-400" />
              )}
              <DataMask>{partner.name}</DataMask>
              <Badge
                variant={partner.status === 'active' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {partner.status || 'unknown'}
              </Badge>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-slate-500 font-medium capitalize flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {partner.entityType || 'company'}
              </p>
              <span className="text-slate-300">•</span>
              <p className="text-sm text-slate-500 font-medium capitalize flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                {partner.type || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList
          className={`grid ${partner.entityType === 'company' ? 'grid-cols-5 max-w-3xl' : 'grid-cols-4 max-w-2xl'} w-full bg-white border h-auto p-1 mb-6`}
        >
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-slate-100 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="data-[state=active]:bg-slate-100 py-2"
          >
            Services & Pricing
          </TabsTrigger>
          {partner.entityType === 'company' && (
            <TabsTrigger
              value="staff"
              className="data-[state=active]:bg-slate-100 py-2"
            >
              Team / Staff
            </TabsTrigger>
          )}
          <TabsTrigger
            value="properties"
            className="data-[state=active]:bg-slate-100 py-2"
          >
            Properties
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-slate-100 py-2"
          >
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-trust-blue" />
                  Registration Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {partner.entityType === 'company' && (
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Legal/Corporate Name
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      <DataMask>{partner.companyName || '-'}</DataMask>
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Tax ID (CPF/CNPJ/EIN)
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    <DataMask>{partner.cpfCnpj || '-'}</DataMask>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Primary Function
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1 capitalize">
                    {partner.type || '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-trust-blue" />
                  Contact & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1 truncate">
                      <DataMask>{partner.email || '-'}</DataMask>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      <DataMask>{partner.phone || '-'}</DataMask>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      <DataMask>
                        {[
                          partner.address,
                          partner.city,
                          partner.state,
                          partner.zipCode,
                        ]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </DataMask>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <PartnerPricing
            partner={partner}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>

        {partner.entityType === 'company' && (
          <TabsContent value="staff">
            <PartnerStaff
              partner={partner}
              onUpdate={handleUpdate}
              canEdit={true}
            />
          </TabsContent>
        )}

        <TabsContent value="properties">
          <PartnerProperties
            partner={partner}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="documents">
          <PartnerDocuments
            partner={partner}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
