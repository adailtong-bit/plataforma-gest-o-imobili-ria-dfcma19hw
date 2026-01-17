import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePartnerStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePartnerStore must be used within AppProvider')

  return {
    partners: context.partners,
    genericServiceRates: context.genericServiceRates,
    addPartner: context.addPartner,
    updatePartner: context.updatePartner,
    addGenericServiceRate: context.addGenericServiceRate,
    updateGenericServiceRate: context.updateGenericServiceRate,
    deleteGenericServiceRate: context.deleteGenericServiceRate,
  }
}

export default usePartnerStore
