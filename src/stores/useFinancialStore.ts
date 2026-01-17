import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useFinancialStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useFinancialStore must be used within AppProvider')

  return {
    financials: context.financials,
    financialSettings: context.financialSettings,
    bankStatements: context.bankStatements,
    addInvoice: context.addInvoice,
    markPaymentAs: context.markPaymentAs,
    updateFinancialSettings: context.updateFinancialSettings,
    uploadBankStatement: context.uploadBankStatement,
  }
}

export default useFinancialStore
