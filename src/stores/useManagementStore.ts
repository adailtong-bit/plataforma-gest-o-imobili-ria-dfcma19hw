import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useManagementStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useManagementStore must be used within AppProvider')

  return {
    // Services
    guestServices: context.guestServices,
    serviceOrders: context.serviceOrders,
    addGuestService: context.addGuestService,
    updateGuestService: context.updateGuestService,
    deleteGuestService: context.deleteGuestService,
    addServiceOrder: context.addServiceOrder,

    // POS
    posItems: context.posItems,
    posTransactions: context.posTransactions,
    addPosItem: context.addPosItem,
    updatePosItem: context.updatePosItem,
    deletePosItem: context.deletePosItem,
    addPosTransaction: context.addPosTransaction,

    // Marketing
    promotions: context.promotions,
    campaigns: context.campaigns,
    addPromotion: context.addPromotion,
    updatePromotion: context.updatePromotion,
    deletePromotion: context.deletePromotion,
    addCampaign: context.addCampaign,
    updateCampaign: context.updateCampaign,
    deleteCampaign: context.deleteCampaign,

    // Marketing Automation (New)
    marketingWorkflows: context.marketingWorkflows,
    emailTemplates: context.emailTemplates,
    addMarketingWorkflow: context.addMarketingWorkflow,
    updateMarketingWorkflow: context.updateMarketingWorkflow,
    deleteMarketingWorkflow: context.deleteMarketingWorkflow,
    addEmailTemplate: context.addEmailTemplate,
    updateEmailTemplate: context.updateEmailTemplate,
    deleteEmailTemplate: context.deleteEmailTemplate,
  }
}

export default useManagementStore
