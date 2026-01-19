import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useUserStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useUserStore must be used within AppProvider')

  return {
    users: context.users,
    addUser: context.addUser,
    updateUser: context.updateUser,
    deleteUser: context.deleteUser,
    approveUser: context.approveUser,
    blockUser: context.blockUser,
  }
}

export default useUserStore
