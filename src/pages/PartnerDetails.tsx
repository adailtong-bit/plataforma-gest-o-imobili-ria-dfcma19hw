import { useParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useLanguageStore from '@/stores/useLanguageStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Briefcase,
  Users,
  Mail,
  Phone,
  MapPin,
  Tag,
} from 'lucide-react'
import { DataMask } from '@/components/DataMask'
import { Badge } from '@/components/ui/badge'

export default function PartnerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useContext(AppContext)
  const partners = context?.partners || []
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

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
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
            <DataMask>{partner.name}</DataMask>
            <Badge
              variant={partner.status === 'active' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {partner.status || 'unknown'}
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 font-medium capitalize flex items-center gap-1 mt-1">
            <Tag className="h-3 w-3" />
            {partner.type || 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-trust-blue" />
              {t('partners.company_info') || 'Company Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {t('partners.company_name') || 'Empresa (Company)'}
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                <DataMask>{partner.companyName || '-'}</DataMask>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {t('partners.teams') || 'Equipes (Teams)'}
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <DataMask>{partner.teams || '-'}</DataMask>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {t('common.tax_id_label') || 'Tax ID / Document'}
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                <DataMask>{partner.cpfCnpj || '-'}</DataMask>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-trust-blue" />
              {t('common.contact_address') || 'Contact & Address'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {t('common.email') || 'Email'}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1 truncate">
                  <DataMask>{partner.email || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {t('common.phone') || 'Phone'}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{partner.phone || '-'}</DataMask>
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{' '}
                  {t('common.address') || 'Address'}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>
                    {partner.address
                      ? `${partner.address}${partner.city ? `, ${partner.city}` : ''}`
                      : '-'}
                  </DataMask>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
