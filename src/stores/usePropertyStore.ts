import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePropertyStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePropertyStore must be used within AppProvider')

  return {
    properties: context.properties,
    selectedPropertyId: context.selectedPropertyId,
    setSelectedPropertyId: context.setSelectedPropertyId,
    addProperty: context.addProperty,
    updateProperty: context.updateProperty,
    deleteProperty: context.deleteProperty,
  }
}

export default usePropertyStore
