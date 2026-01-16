import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useOwnerStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useOwnerStore must be used within AppProvider')

  return {
    owners: context.owners,
    addOwner: context.addOwner,
  }
}

export default useOwnerStore
