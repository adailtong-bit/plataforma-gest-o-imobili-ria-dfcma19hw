import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useSubscriptionStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useSubscriptionStore must be used within AppProvider')

  return {
    subscriptionConfig: context.subscriptionConfig,
    updateSubscriptionConfig: context.updateSubscriptionConfig,
  }
}

export default useSubscriptionStore
