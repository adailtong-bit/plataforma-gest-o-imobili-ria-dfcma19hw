import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useAuthStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAuthStore must be used within AppProvider')

  return {
    currentUser: context.currentUser,
    setCurrentUser: context.setCurrentUser,
    allUsers: context.allUsers,
  }
}

export default useAuthStore
