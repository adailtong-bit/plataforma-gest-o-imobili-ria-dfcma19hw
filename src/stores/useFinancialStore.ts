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
    ledgerEntries: context.ledgerEntries,
    genericServiceRates: context.genericServiceRates, // Exposed
    currency: context.currency,
    formatCurrency: context.formatAppCurrency,
    addInvoice: context.addInvoice,
    updateInvoice: context.updateInvoice,
    markPaymentAs: context.markPaymentAs,
    updateFinancialSettings: context.updateFinancialSettings,
    uploadBankStatement: context.uploadBankStatement,
    addLedgerEntry: context.addLedgerEntry,
    updateLedgerEntry: context.updateLedgerEntry,
    deleteLedgerEntry: context.deleteLedgerEntry,
    addGenericServiceRate: context.addGenericServiceRate, // Exposed
    updateGenericServiceRate: context.updateGenericServiceRate, // Exposed
    deleteGenericServiceRate: context.deleteGenericServiceRate, // Exposed
  }
}

export default useFinancialStore


