import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const usePropertyStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePropertyStore must be used within AppProvider')

  return {
    properties: context.properties,
    channelMappings: context.channelMappings, // Added mappings
    addProperty: context.addProperty,
    updateProperty: context.updateProperty,
    deleteProperty: context.deleteProperty,
    addChannelMapping: context.addChannelMapping,
    updateChannelMapping: context.updateChannelMapping,
    deleteChannelMapping: context.deleteChannelMapping,
  }
}

export default usePropertyStore
