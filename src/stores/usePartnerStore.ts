import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePartnerStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePartnerStore must be used within AppProvider')

  return {
    partners: context.partners,
    addPartner: context.addPartner,
    updatePartner: context.updatePartner,
  }
}

export default usePartnerStore
