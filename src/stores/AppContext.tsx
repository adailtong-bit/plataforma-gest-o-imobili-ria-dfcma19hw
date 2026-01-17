import React, { createContext, useState, ReactNode } from 'react'
import {
  Property,
  Task,
  Financials,
  Message,
  Invoice,
  Evidence,
  Tenant,
  Owner,
  Partner,
  User,
  Payment,
  AutomationRule,
  Condominium,
  PaymentIntegration,
  FinancialSettings,
  BankStatement,
  LedgerEntry,
  AuditLog,
} from '@/lib/types'
import {
  properties as initialProperties,
  tasks as initialTasks,
  financials as initialFinancials,
  messages as initialMessages,
  tenants as initialTenants,
  owners as initialOwners,
  partners as initialPartners,
  systemUsers,
  automationRules as initialAutomationRules,
  condominiums as initialCondominiums,
  defaultPaymentIntegrations,
  defaultFinancialSettings,
  mockBankStatements,
  ledgerEntries as initialLedgerEntries,
  auditLogs as initialAuditLogs,
} from '@/lib/mockData'
import { canChat } from '@/lib/permissions'
import { translations, Language } from '@/lib/translations'

interface AppContextType {
  properties: Property[]
  condominiums: Condominium[]
  tasks: Task[]
  financials: Financials
  messages: Message[]
  tenants: Tenant[]
  owners: Owner[]
  partners: Partner[]
  automationRules: AutomationRule[]
  currentUser: User | Owner | Partner | Tenant
  allUsers: (User | Owner | Partner | Tenant)[]
  users: User[] // Managed system users
  paymentIntegrations: PaymentIntegration[]
  financialSettings: FinancialSettings
  bankStatements: BankStatement[]
  ledgerEntries: LedgerEntry[]
  auditLogs: AuditLog[]
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
  addProperty: (property: Property) => void
  updateProperty: (property: Property) => void
  deleteProperty: (propertyId: string) => void
  addCondominium: (condo: Condominium) => void
  updateCondominium: (condo: Condominium) => void
  deleteCondominium: (condoId: string) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  addTask: (task: Task) => void
  addInvoice: (invoice: Invoice) => void
  markPaymentAs: (paymentId: string, status: Payment['status']) => void
  addTaskImage: (taskId: string, imageUrl: string) => void
  addTaskEvidence: (taskId: string, evidence: Evidence) => void
  sendMessage: (contactId: string, text: string, attachments?: string[]) => void
  markAsRead: (contactId: string) => void
  addTenant: (tenant: Tenant) => void
  addOwner: (owner: Owner) => void
  addPartner: (partner: Partner) => void
  setCurrentUser: (userId: string) => void
  startChat: (contactId: string) => void
  updateAutomationRule: (rule: AutomationRule) => void
  // User Management
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
  // Payment Settings
  updatePaymentIntegration: (integration: PaymentIntegration) => void
  updateFinancialSettings: (settings: FinancialSettings) => void
  uploadBankStatement: (statement: BankStatement) => void
  // Ledger
  addLedgerEntry: (entry: LedgerEntry) => void
  updateLedgerEntry: (entry: LedgerEntry) => void
  deleteLedgerEntry: (entryId: string) => void
  // Audit
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [condominiums, setCondominiums] =
    useState<Condominium[]>(initialCondominiums)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [owners, setOwners] = useState<Owner[]>(initialOwners)
  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(
    initialAutomationRules,
  )
  const [allMessages, setAllMessages] = useState<Message[]>(initialMessages)
  const [users, setUsers] = useState<User[]>(systemUsers)
  const [paymentIntegrations, setPaymentIntegrations] = useState<
    PaymentIntegration[]
  >(defaultPaymentIntegrations)
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(
    defaultFinancialSettings,
  )
  const [bankStatements, setBankStatements] =
    useState<BankStatement[]>(mockBankStatements)
  const [ledgerEntries, setLedgerEntries] =
    useState<LedgerEntry[]>(initialLedgerEntries)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs)

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language')
    return (saved as Language) || 'pt'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app_language', lang)
  }

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.')
    let current: any = translations[language]

    for (const k of keys) {
      if (current[k] === undefined) return key
      current = current[k]
    }

    if (typeof current === 'string' && params) {
      let text = current
      Object.entries(params).forEach(([pkey, pval]) => {
        text = text.replace(`{${pkey}}`, pval)
      })
      return text
    }

    return current as string
  }

  const [currentUser, setCurrentUserObj] = useState<
    User | Owner | Partner | Tenant
  >(systemUsers[0])

  const allUsers = [...users, ...owners, ...partners, ...tenants]

  const setCurrentUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId)
    if (user) {
      setCurrentUserObj(user)
      addAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'login',
        entity: 'System',
        details: 'User switched/logged in',
      })
    }
  }

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...log,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const visibleMessages = allMessages.filter(
    (m) => m.ownerId === currentUser.id,
  )

  const addProperty = (property: Property) => {
    setProperties([...properties, property])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Property',
      entityId: property.id,
      details: `Created property: ${property.name}`,
    })
  }

  const updateProperty = (property: Property) => {
    setProperties(properties.map((p) => (p.id === property.id ? property : p)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Property',
      entityId: property.id,
      details: `Updated property: ${property.name}`,
    })
  }

  const deleteProperty = (propertyId: string) => {
    const hasActiveTenant = tenants.some(
      (t) => t.propertyId === propertyId && t.status === 'active',
    )
    if (hasActiveTenant) {
      throw new Error('error_active_tenant')
    }
    setProperties(properties.filter((p) => p.id !== propertyId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Property',
      entityId: propertyId,
      details: 'Deleted property',
    })
  }

  const addCondominium = (condo: Condominium) => {
    setCondominiums([...condominiums, condo])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Condominium',
      entityId: condo.id,
      details: `Created condo: ${condo.name}`,
    })
  }

  const updateCondominium = (condo: Condominium) => {
    setCondominiums(condominiums.map((c) => (c.id === condo.id ? condo : c)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Condominium',
      entityId: condo.id,
      details: `Updated condo: ${condo.name}`,
    })
  }

  const deleteCondominium = (condoId: string) => {
    const isLinked = properties.some((p) => p.condominiumId === condoId)
    if (isLinked) {
      throw new Error('error_linked_condo')
    }
    setCondominiums(condominiums.filter((c) => c.id !== condoId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Condominium',
      entityId: condoId,
      details: 'Deleted condo',
    })
  }

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Task',
      entityId: taskId,
      details: `Updated task status to: ${status}`,
    })
  }

  const addTask = (task: Task) => {
    setTasks([...tasks, task])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Task',
      entityId: task.id,
      details: `Created task: ${task.title}`,
    })
  }

  const addTaskImage = (taskId: string, imageUrl: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, images: [...(t.images || []), imageUrl] } : t,
      ),
    )
  }

  const addTaskEvidence = (taskId: string, evidence: Evidence) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              evidence: [...(t.evidence || []), evidence],
              images: [...(t.images || []), evidence.url],
            }
          : t,
      ),
    )
  }

  const addInvoice = (invoice: Invoice) => {
    setFinancials({
      ...financials,
      invoices: [invoice, ...financials.invoices],
    })
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Invoice',
      entityId: invoice.id,
      details: `Created invoice: ${invoice.description}`,
    })
  }

  const markPaymentAs = (paymentId: string, status: Payment['status']) => {
    setFinancials({
      ...financials,
      payments: financials.payments.map((p) =>
        p.id === paymentId ? { ...p, status } : p,
      ),
    })
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Payment',
      entityId: paymentId,
      details: `Updated payment status to: ${status}`,
    })
  }

  const sendMessage = (
    contactId: string,
    text: string,
    attachments: string[] = [],
  ) => {
    setAllMessages((prev) => {
      const existing = prev.find(
        (m) => m.ownerId === currentUser.id && m.contactId === contactId,
      )

      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      if (existing) {
        return prev.map((m) => {
          if (m.id === existing.id) {
            return {
              ...m,
              lastMessage: text || (attachments.length > 0 ? '📎 Anexo' : ''),
              time: 'Agora',
              history: [
                ...m.history,
                {
                  id: Date.now().toString(),
                  text,
                  sender: 'me',
                  timestamp,
                  attachments,
                },
              ],
            }
          }
          return m
        })
      } else {
        const contact = allUsers.find((u) => u.id === contactId)
        if (!contact) return prev

        const newMsg: Message = {
          id: `${currentUser.id}_${contactId}_${Date.now()}`,
          ownerId: currentUser.id,
          contact: contact.name,
          contactId: contact.id,
          type: contact.role,
          lastMessage: text,
          time: 'Agora',
          unread: 0,
          avatar: contact.avatar || '',
          history: [
            {
              id: Date.now().toString(),
              text,
              sender: 'me',
              timestamp,
              attachments,
            },
          ],
        }
        return [newMsg, ...prev]
      }
    })
  }

  const startChat = (contactId: string) => {
    const contact = allUsers.find((u) => u.id === contactId)
    if (!contact) return

    const existing = visibleMessages.find((m) => m.contactId === contactId)
    if (existing) {
      // Logic for existing chat
    } else {
      if (canChat(currentUser.role, contact.role)) {
        const newMsg: Message = {
          id: `${currentUser.id}_${contactId}_new`,
          ownerId: currentUser.id,
          contact: contact.name,
          contactId: contact.id,
          type: contact.role,
          lastMessage: 'Inicie a conversa...',
          time: 'Agora',
          unread: 0,
          avatar: contact.avatar || '',
          history: [],
        }
        setAllMessages((prev) => [newMsg, ...prev])
      }
    }
  }

  const markAsRead = (messageId: string) => {
    setAllMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, unread: 0 } : m)),
    )
  }

  const addTenant = (tenant: Tenant) => {
    setTenants([...tenants, tenant])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Tenant',
      entityId: tenant.id,
      details: `Registered tenant: ${tenant.name}`,
    })
  }

  const addOwner = (owner: Owner) => {
    setOwners([...owners, owner])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Owner',
      entityId: owner.id,
      details: `Registered owner: ${owner.name}`,
    })
  }

  const addPartner = (partner: Partner) => {
    setPartners([...partners, partner])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Partner',
      entityId: partner.id,
      details: `Registered partner: ${partner.name}`,
    })
  }

  const updateAutomationRule = (rule: AutomationRule) => {
    setAutomationRules(
      automationRules.map((r) => (r.id === rule.id ? rule : r)),
    )
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Automation',
      entityId: rule.id,
      details: `Updated automation rule: ${rule.type}`,
    })
  }

  const addUser = (user: User) => {
    setUsers([...users, user])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'User',
      entityId: user.id,
      details: `Created user: ${user.name}`,
    })
  }

  const updateUser = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? user : u)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'User',
      entityId: user.id,
      details: `Updated user: ${user.name}`,
    })
  }

  const deleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'User',
      entityId: userId,
      details: 'Deleted user',
    })
  }

  const updatePaymentIntegration = (integration: PaymentIntegration) => {
    setPaymentIntegrations(
      paymentIntegrations.map((p) =>
        p.provider === integration.provider ? integration : p,
      ),
    )
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Settings',
      details: `Updated payment integration: ${integration.provider}`,
    })
  }

  const updateFinancialSettings = (settings: FinancialSettings) => {
    setFinancialSettings(settings)
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Settings',
      details: 'Updated financial settings',
    })
  }

  const uploadBankStatement = (statement: BankStatement) => {
    setBankStatements([statement, ...bankStatements])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'BankStatement',
      details: `Uploaded statement: ${statement.fileName}`,
    })
  }

  const addLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries([...ledgerEntries, entry])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Ledger',
      entityId: entry.id,
      details: `Created ledger entry: ${entry.amount} (${entry.type})`,
    })
  }

  const updateLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries(ledgerEntries.map((e) => (e.id === entry.id ? entry : e)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Ledger',
      entityId: entry.id,
      details: `Updated ledger entry: ${entry.id}`,
    })
  }

  const deleteLedgerEntry = (entryId: string) => {
    setLedgerEntries(ledgerEntries.filter((e) => e.id !== entryId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Ledger',
      entityId: entryId,
      details: 'Deleted ledger entry',
    })
  }

  return (
    <AppContext.Provider
      value={{
        properties,
        condominiums,
        tasks,
        financials,
        messages: visibleMessages,
        tenants,
        owners,
        partners,
        automationRules,
        currentUser,
        allUsers,
        users,
        paymentIntegrations,
        financialSettings,
        bankStatements,
        ledgerEntries,
        auditLogs,
        language,
        setLanguage,
        t,
        addProperty,
        updateProperty,
        deleteProperty,
        addCondominium,
        updateCondominium,
        deleteCondominium,
        updateTaskStatus,
        addTask,
        addInvoice,
        markPaymentAs,
        addTaskImage,
        addTaskEvidence,
        sendMessage,
        markAsRead,
        addTenant,
        addOwner,
        addPartner,
        setCurrentUser,
        startChat,
        updateAutomationRule,
        addUser,
        updateUser,
        deleteUser,
        updatePaymentIntegration,
        updateFinancialSettings,
        uploadBankStatement,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
