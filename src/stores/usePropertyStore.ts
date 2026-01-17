import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePropertyStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePropertyStore must be used within AppProvider')

  return {
    properties: context.properties,
    addProperty: context.addProperty,
    updateProperty: context.updateProperty,
  }
}

export default usePropertyStore
