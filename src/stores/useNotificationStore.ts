import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useNotificationStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useNotificationStore must be used within AppProvider')

  return {
    notifications: context.notifications,
    addNotification: context.addNotification,
    markNotificationAsRead: context.markNotificationAsRead,
  }
}

export default useNotificationStore
