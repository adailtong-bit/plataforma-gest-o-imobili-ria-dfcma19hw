import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePartnerStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePartnerStore must be used within AppProvider')

  const deletePartner = (id: string) => {
    // Soft Delete Implementation: Instead of removing, mark as inactive
    const partner = context.partners.find((p) => p.id === id)
    if (partner) {
      context.updatePartner({ ...partner, status: 'inactive' })
      // Logic to flag pending tasks would ideally happen here or in the UI component calling this
    }
  }

  return {
    partners: context.partners,
    genericServiceRates: context.genericServiceRates,
    serviceCategories: context.serviceCategories,
    tasks: context.tasks, // Exposed for analytics
    addPartner: context.addPartner,
    updatePartner: context.updatePartner,
    deletePartner: deletePartner, // Expose soft delete wrapper
    addGenericServiceRate: context.addGenericServiceRate,
    updateGenericServiceRate: context.updateGenericServiceRate,
    deleteGenericServiceRate: context.deleteGenericServiceRate,
    addServiceCategory: context.addServiceCategory,
    updateServiceCategory: context.updateServiceCategory,
    deleteServiceCategory: context.deleteServiceCategory,
  }
}

export default usePartnerStore
