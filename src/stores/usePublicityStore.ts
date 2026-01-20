import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePublicityStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePublicityStore must be used within AppProvider')

  return {
    advertisements: context.advertisements,
    advertisers: context.advertisers,
    adPricing: context.adPricing,
    addAdvertisement: context.addAdvertisement,
    updateAdvertisement: context.updateAdvertisement,
    deleteAdvertisement: context.deleteAdvertisement,
    addAdvertiser: context.addAdvertiser,
    updateAdvertiser: context.updateAdvertiser,
    deleteAdvertiser: context.deleteAdvertiser,
    updateAdPricing: context.updateAdPricing,
  }
}

export default usePublicityStore
