import React, { createContext, useState, ReactNode, useEffect } from 'react'
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
  ServiceRate,
  Notification,
  Advertisement,
  Advertiser,
  AdPricing,
  GenericDocument,
  NegotiationStatus,
  NegotiationLogEntry,
  Booking,
  CalendarBlock,
  MessageTemplate,
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
  genericServiceRates as initialGenericRates,
  notifications as initialNotifications,
  advertisements as initialAdvertisements,
  mockAdvertisers,
  mockAdPricing,
  bookings as initialBookings,
  calendarBlocks as initialBlocks,
  messageTemplates as initialTemplates,
} from '@/lib/mockData'
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
  bookings: Booking[]
  calendarBlocks: CalendarBlock[]
  messageTemplates: MessageTemplate[]
  automationRules: AutomationRule[]
  currentUser: User | Owner | Partner | Tenant
  allUsers: (User | Owner | Partner | Tenant)[]
  users: User[]
  paymentIntegrations: PaymentIntegration[]
  financialSettings: FinancialSettings
  bankStatements: BankStatement[]
  ledgerEntries: LedgerEntry[]
  auditLogs: AuditLog[]
  genericServiceRates: ServiceRate[]
  notifications: Notification[]
  advertisements: Advertisement[]
  advertisers: Advertiser[]
  adPricing: AdPricing
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
  updateTask: (task: Task) => void
  addTask: (task: Task) => void
  addInvoice: (invoice: Invoice) => void
  markPaymentAs: (paymentId: string, status: Payment['status']) => void
  addTaskImage: (taskId: string, imageUrl: string) => void
  addTaskEvidence: (taskId: string, evidence: Evidence) => void
  sendMessage: (contactId: string, text: string, attachments?: string[]) => void
  markAsRead: (contactId: string) => void
  addTenant: (tenant: Tenant) => void
  updateTenant: (tenant: Tenant) => void
  addOwner: (owner: Owner) => void
  updateOwner: (owner: Owner) => void
  addPartner: (partner: Partner) => void
  updatePartner: (partner: Partner) => void
  addBooking: (booking: Booking) => void
  updateBooking: (booking: Booking) => void
  deleteBooking: (bookingId: string) => void
  addCalendarBlock: (block: CalendarBlock) => void
  deleteCalendarBlock: (blockId: string) => void
  addMessageTemplate: (template: MessageTemplate) => void
  updateMessageTemplate: (template: MessageTemplate) => void
  deleteMessageTemplate: (templateId: string) => void
  setCurrentUser: (userId: string) => void
  startChat: (contactId: string) => void
  updateAutomationRule: (rule: AutomationRule) => void
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
  updatePaymentIntegration: (integration: PaymentIntegration) => void
  updateFinancialSettings: (settings: FinancialSettings) => void
  uploadBankStatement: (statement: BankStatement) => void
  addLedgerEntry: (entry: LedgerEntry) => void
  updateLedgerEntry: (entry: LedgerEntry) => void
  deleteLedgerEntry: (entryId: string) => void
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
  addGenericServiceRate: (rate: ServiceRate) => void
  updateGenericServiceRate: (rate: ServiceRate) => void
  deleteGenericServiceRate: (rateId: string) => void
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  ) => void
  markNotificationAsRead: (id: string) => void
  approveUser: (userId: string) => void
  blockUser: (userId: string) => void
  renewTenantContract: (
    tenantId: string,
    newEnd: string,
    newRent: number,
    newStart?: string,
    contractDoc?: GenericDocument,
  ) => void
  updateTenantNegotiation: (
    tenantId: string,
    data: {
      status?: NegotiationStatus
      suggestedPrice?: number
      log?: NegotiationLogEntry
    },
  ) => void
  addAdvertisement: (ad: Advertisement) => void
  updateAdvertisement: (ad: Advertisement) => void
  deleteAdvertisement: (adId: string) => void
  addAdvertiser: (advertiser: Advertiser) => void
  updateAdvertiser: (advertiser: Advertiser) => void
  deleteAdvertiser: (id: string) => void
  updateAdPricing: (pricing: AdPricing) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [condominiums, setCondominiums] =
    useState<Condominium[]>(initialCondominiums)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('app_tenants')
    return saved ? JSON.parse(saved) : initialTenants
  })

  useEffect(() => {
    localStorage.setItem('app_tenants', JSON.stringify(tenants))
  }, [tenants])

  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem('app_owners')
    return saved ? JSON.parse(saved) : initialOwners
  })

  useEffect(() => {
    localStorage.setItem('app_owners', JSON.stringify(owners))
  }, [owners])

  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [calendarBlocks, setCalendarBlocks] =
    useState<CalendarBlock[]>(initialBlocks)
  const [messageTemplates, setMessageTemplates] =
    useState<MessageTemplate[]>(initialTemplates)
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
  const [genericServiceRates, setGenericServiceRates] =
    useState<ServiceRate[]>(initialGenericRates)
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(
    initialAdvertisements,
  )
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(mockAdvertisers)
  const [adPricing, setAdPricingState] = useState<AdPricing>(mockAdPricing)

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

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...log,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  ) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const addLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries((prev) => [...prev, entry])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Ledger',
      entityId: entry.id,
      details: `Created ledger entry: ${entry.amount} (${entry.type})`,
    })
  }

  const updateLedgerEntry = (entry: LedgerEntry) =>
    setLedgerEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)))
  const deleteLedgerEntry = (id: string) =>
    setLedgerEntries((prev) => prev.filter((e) => e.id !== id))
  const setCurrentUser = (id: string) => {
    const u = allUsers.find((user) => user.id === id)
    if (u) setCurrentUserObj(u)
  }
  const approveUser = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u)),
    )
  const blockUser = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'blocked' } : u)),
    )
  const sendMessage = (id: string, text: string) => {
    // Basic implementation for mock
    setAllMessages((prev) => {
      const existing = prev.find((m) => m.contactId === id)
      if (existing) {
        return prev.map((m) =>
          m.contactId === id
            ? {
                ...m,
                lastMessage: text,
                time: 'Just now',
                history: [
                  ...m.history,
                  {
                    id: `msg-${Date.now()}`,
                    text,
                    sender: 'me',
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : m,
        )
      }
      return prev
    })
  }
  const markAsRead = (id: string) => {}
  const startChat = (id: string) => {
    // Basic implementation for mock
    const contact = allUsers.find((u) => u.id === id)
    if (contact && !allMessages.find((m) => m.contactId === id)) {
      setAllMessages((prev) => [
        ...prev,
        {
          id: `chat-${Date.now()}`,
          contact: contact.name,
          contactId: contact.id,
          ownerId: currentUser.id,
          lastMessage: '',
          time: 'New',
          unread: 0,
          avatar: contact.avatar || '',
          history: [],
        },
      ])
    }
  }
  const addProperty = (p: Property) => setProperties([...properties, p])
  const updateProperty = (p: Property) =>
    setProperties(properties.map((prop) => (prop.id === p.id ? p : prop)))
  const deleteProperty = (id: string) =>
    setProperties(properties.filter((p) => p.id !== id))
  const addCondominium = (c: Condominium) =>
    setCondominiums([...condominiums, c])
  const updateCondominium = (c: Condominium) =>
    setCondominiums(
      condominiums.map((condo) => (condo.id === c.id ? c : condo)),
    )
  const deleteCondominium = (id: string) =>
    setCondominiums(condominiums.filter((c) => c.id !== id))
  const addTask = (t: Task) => setTasks([...tasks, t])
  const updateTask = (t: Task) =>
    setTasks(tasks.map((task) => (task.id === t.id ? t : task)))
  const updateTaskStatus = (id: string, status: any) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)))
  const addInvoice = (i: Invoice) => {
    setFinancials((prev) => ({ ...prev, invoices: [...prev.invoices, i] }))
  }
  const markPaymentAs = (id: string, status: any) => {}
  const addTaskImage = (id: string, img: string) => {}
  const addTaskEvidence = (id: string, ev: Evidence) => {}
  const addTenant = (t: Tenant) => setTenants([...tenants, t])
  const updateTenant = (t: Tenant) =>
    setTenants(tenants.map((ten) => (ten.id === t.id ? t : ten)))
  const addOwner = (o: Owner) => setOwners([...owners, o])
  const updateOwner = (o: Owner) =>
    setOwners(owners.map((own) => (own.id === o.id ? o : own)))
  const addPartner = (p: Partner) => setPartners([...partners, p])
  const updatePartner = (p: Partner) =>
    setPartners(partners.map((par) => (par.id === p.id ? p : par)))
  const addUser = (u: User) => setUsers([...users, u])
  const updateUser = (u: User) =>
    setUsers(users.map((user) => (user.id === u.id ? u : user)))
  const deleteUser = (id: string) => setUsers(users.filter((u) => u.id !== id))
  const updateAutomationRule = (r: AutomationRule) => {}
  const updatePaymentIntegration = (i: PaymentIntegration) => {}
  const updateFinancialSettings = (s: FinancialSettings) => {}
  const uploadBankStatement = (s: BankStatement) => {}
  const addGenericServiceRate = (r: ServiceRate) => {}
  const updateGenericServiceRate = (r: ServiceRate) => {}
  const deleteGenericServiceRate = (id: string) => {}
  const renewTenantContract = () => {}
  const updateTenantNegotiation = () => {}
  const addAdvertisement = (a: Advertisement) => {}
  const updateAdvertisement = (a: Advertisement) => {}
  const deleteAdvertisement = (id: string) => {}
  const addAdvertiser = (a: Advertiser) => {}
  const updateAdvertiser = (a: Advertiser) => {}
  const deleteAdvertiser = (id: string) => {}
  const updateAdPricing = (p: AdPricing) => {}

  // New Methods
  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking])
    if (booking.paid && booking.totalAmount > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `inc-${Date.now()}`,
        propertyId: booking.propertyId,
        date: new Date().toISOString(),
        dueDate: booking.checkIn,
        paymentDate: new Date().toISOString(),
        type: 'income',
        category: 'Rent (Short Term)',
        amount: booking.totalAmount,
        description: `Booking #${booking.id.slice(-4)} - ${booking.guestName}`,
        referenceId: booking.id,
        status: 'cleared',
      }
      addLedgerEntry(ledgerEntry)
    }
  }

  const updateBooking = (booking: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)))
  }

  const deleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
  }

  const addCalendarBlock = (block: CalendarBlock) => {
    setCalendarBlocks((prev) => [...prev, block])
  }

  const deleteCalendarBlock = (blockId: string) => {
    setCalendarBlocks((prev) => prev.filter((b) => b.id !== blockId))
  }

  const addMessageTemplate = (template: MessageTemplate) => {
    setMessageTemplates((prev) => [...prev, template])
  }

  const updateMessageTemplate = (template: MessageTemplate) => {
    setMessageTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? template : t)),
    )
  }

  const deleteMessageTemplate = (templateId: string) => {
    setMessageTemplates((prev) => prev.filter((t) => t.id !== templateId))
  }

  const visibleMessages = allMessages // Simplified

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
        bookings,
        calendarBlocks,
        messageTemplates,
        automationRules,
        currentUser,
        allUsers,
        users,
        paymentIntegrations,
        financialSettings,
        bankStatements,
        ledgerEntries,
        auditLogs,
        genericServiceRates,
        notifications,
        advertisements,
        advertisers,
        adPricing,
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
        updateTask,
        addTask,
        addInvoice,
        markPaymentAs,
        addTaskImage,
        addTaskEvidence,
        sendMessage,
        markAsRead,
        addTenant,
        updateTenant,
        addOwner,
        updateOwner,
        addPartner,
        updatePartner,
        addBooking,
        updateBooking,
        deleteBooking,
        addCalendarBlock,
        deleteCalendarBlock,
        addMessageTemplate,
        updateMessageTemplate,
        deleteMessageTemplate,
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
        addGenericServiceRate,
        updateGenericServiceRate,
        deleteGenericServiceRate,
        addNotification,
        markNotificationAsRead,
        approveUser,
        blockUser,
        renewTenantContract,
        updateTenantNegotiation,
        addAdvertisement,
        updateAdvertisement,
        deleteAdvertisement,
        addAdvertiser,
        updateAdvertiser,
        deleteAdvertiser,
        updateAdPricing,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
