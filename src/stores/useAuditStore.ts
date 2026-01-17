import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useAuditStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAuditStore must be used within AppProvider')

  return {
    auditLogs: context.auditLogs,
    addAuditLog: context.addAuditLog,
  }
}

export default useAuditStore
