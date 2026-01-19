import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePublicityStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePublicityStore must be used within AppProvider')

  return {
    advertisements: context.advertisements,
    addAdvertisement: context.addAdvertisement,
    updateAdvertisement: context.updateAdvertisement,
    deleteAdvertisement: context.deleteAdvertisement,
  }
}

export default usePublicityStore
