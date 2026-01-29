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
    addInvoice: context.addInvoice,
    updateInvoice: context.updateInvoice, // Added export
    markPaymentAs: context.markPaymentAs,
    updateFinancialSettings: context.updateFinancialSettings,
    uploadBankStatement: context.uploadBankStatement,
    addLedgerEntry: context.addLedgerEntry,
    updateLedgerEntry: context.updateLedgerEntry,
    deleteLedgerEntry: context.deleteLedgerEntry,
  }
}

export default useFinancialStore
