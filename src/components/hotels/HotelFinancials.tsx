import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { PropertyLedger } from '@/components/financial/PropertyLedger'

export function HotelFinancials({ hotelId }: { hotelId: string }) {
  const { t } = useLanguageStore()
  const { ledgerEntries } = useFinancialStore()
  const { properties } = usePropertyStore()

  // Find all properties (rooms) belonging to this hotel
  const hotelProperties = properties.filter(
    (p) => p.hotelId === hotelId || p.hotel_id === hotelId,
  )
  const propertyIds = hotelProperties.map((p) => p.id)

  // Filter ledger entries for those properties
  const hotelEntries = ledgerEntries.filter(
    (e) => e.propertyId && propertyIds.includes(e.propertyId),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('financial.ledger') || 'Hotel Consolidated Ledger'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-6">
            This ledger shows the consolidated financial records for all rooms
            associated with this hotel.
          </p>
          <PropertyLedger propertyId={hotelId} entries={hotelEntries} />
        </CardContent>
      </Card>
    </div>
  )
}
