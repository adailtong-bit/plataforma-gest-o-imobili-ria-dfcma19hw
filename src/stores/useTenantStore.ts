import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useTenantStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useTenantStore must be used within AppProvider')

  return {
    tenants: context.tenants,
    addTenant: context.addTenant,
    renewTenantContract: context.renewTenantContract,
  }
}

export default useTenantStore
