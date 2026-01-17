import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useFinancialStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useFinancialStore must be used within AppProvider')

  return {
    financials: context.financials,
    addInvoice: context.addInvoice,
    markPaymentAs: context.markPaymentAs,
  }
}

export default useFinancialStore
