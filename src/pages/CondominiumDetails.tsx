import { useParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useLanguageStore from '@/stores/useLanguageStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Key, User, Info } from 'lucide-react'
import { DataMask } from '@/components/DataMask'

export default function CondominiumDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { condominiums } = useContext(AppContext)!
  const { t } = useLanguageStore()

  const condo = condominiums.find((c) => c.id === id)

  if (!condo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Condominium Not Found</h1>
        <Button onClick={() => navigate('/condominiums')}>
          {t('common.back')}
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
          onClick={() => navigate('/condominiums')}
          className="border-slate-300"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            <DataMask>{condo.name}</DataMask>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            <DataMask>
              {condo.city}
              {condo.state ? `, ${condo.state}` : ''}
            </DataMask>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-trust-blue" />
              {t('condominiums.general_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {t('condominiums.description')}
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                <DataMask>{condo.description || '-'}</DataMask>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {t('common.name')}
              </p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                <DataMask>{condo.name}</DataMask>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-trust-blue" />
              {t('condominiums.management')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.manager_name')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.managerName || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.manager_phone')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.managerPhone || '-'}</DataMask>
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.manager_email')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.managerEmail || '-'}</DataMask>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-trust-blue" />
              {t('condominiums.addressing')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.street')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.address || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.number')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.number || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.complement')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.complement || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.neighborhood')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.neighborhood || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.city')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.city || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.state')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.state || '-'}</DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.zip_code')}
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <DataMask>{condo.zipCode || '-'}</DataMask>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-trust-blue" />
              {t('condominiums.access_codes')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.gate_code')}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1 bg-slate-100 p-2 rounded inline-block w-full">
                  <DataMask blur>
                    {condo.accessCredentials?.gate || '-'}
                  </DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.pedestrian_gate')}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1 bg-slate-100 p-2 rounded inline-block w-full">
                  <DataMask blur>
                    {condo.accessCredentials?.pedestrianGate || '-'}
                  </DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.pool_code')}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1 bg-slate-100 p-2 rounded inline-block w-full">
                  <DataMask blur>
                    {condo.accessCredentials?.poolCode || '-'}
                  </DataMask>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('condominiums.amenities_code')}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1 bg-slate-100 p-2 rounded inline-block w-full">
                  <DataMask blur>
                    {condo.accessCredentials?.amenities || '-'}
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
