import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useCondominiumStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useCondominiumStore must be used within AppProvider')

  return {
    condominiums: context.condominiums,
    addCondominium: context.addCondominium,
    updateCondominium: context.updateCondominium,
    deleteCondominium: context.deleteCondominium,
  }
}

export default useCondominiumStore
