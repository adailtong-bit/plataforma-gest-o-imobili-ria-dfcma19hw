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
} from '@/lib/mockData'
import { canChat } from '@/lib/permissions'
import { translations, Language } from '@/lib/translations'
import {
  format,
  setDate,
  getDaysInMonth,
  differenceInDays,
  addDays,
} from 'date-fns'

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

  useEffect(() => {
    const checkExpirations = () => {
      const today = new Date()
      const daysInMonth = getDaysInMonth(today)

      properties.forEach((property) => {
        property.fixedExpenses?.forEach((expense) => {
          const validDay = Math.min(expense.dueDay, daysInMonth)
          const nextDueDate = setDate(today, validDay)

          const diff = differenceInDays(nextDueDate, today)

          if (diff >= 0 && diff <= 5) {
            const exists = notifications.find(
              (n) =>
                n.title.includes(expense.name) &&
                n.message.includes(property.name) &&
                !n.read,
            )

            if (!exists) {
              addNotification({
                title: `Vencimento Próximo: ${expense.name}`,
                message: `A despesa ${expense.name} em ${property.name} vence em ${diff} dias (${format(nextDueDate, 'dd/MM')}).`,
                type: 'warning',
              })
            }
          }
        })
      })
    }
    checkExpirations()
  }, [properties])

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

  const updateLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)))
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
    setLedgerEntries((prev) => prev.filter((e) => e.id !== entryId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Ledger',
      entityId: entryId,
      details: 'Deleted ledger entry',
    })
  }

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

  const approveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: 'active', isFirstLogin: true } : u,
      ),
    )
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'approve',
      entity: 'User',
      entityId: userId,
      details: 'Approved user access',
    })
  }

  const blockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'blocked' } : u)),
    )
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'block',
      entity: 'User',
      entityId: userId,
      details: 'Blocked user access',
    })
  }

  const visibleMessages = allMessages.filter(
    (m) =>
      m.ownerId === currentUser.id ||
      (m.contactId === currentUser.id && m.ownerId !== currentUser.id),
  )

  const sendMessage = (
    contactId: string,
    text: string,
    attachments: string[] = [],
  ) => {
    const timestamp = new Date().toISOString()
    const newMessageId = Date.now().toString()

    setAllMessages((prev) => {
      const senderThread = prev.find(
        (m) => m.ownerId === currentUser.id && m.contactId === contactId,
      )
      let newPrev = [...prev]

      if (senderThread) {
        newPrev = newPrev.map((m) =>
          m.id === senderThread.id
            ? {
                ...m,
                lastMessage: text || (attachments.length > 0 ? '📎 Anexo' : ''),
                time: 'Agora',
                history: [
                  ...m.history,
                  {
                    id: newMessageId,
                    text,
                    sender: 'me',
                    timestamp,
                    attachments,
                  },
                ],
              }
            : m,
        )
      } else {
        const contact = allUsers.find((u) => u.id === contactId)
        if (contact) {
          newPrev.push({
            id: `${currentUser.id}_${contactId}_new`,
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
                id: newMessageId,
                text,
                sender: 'me',
                timestamp,
                attachments,
              },
            ],
          })
        }
      }

      const recipientThread = prev.find(
        (m) => m.ownerId === contactId && m.contactId === currentUser.id,
      )

      if (recipientThread) {
        newPrev = newPrev.map((m) =>
          m.id === recipientThread.id
            ? {
                ...m,
                lastMessage: text || (attachments.length > 0 ? '📎 Anexo' : ''),
                time: 'Agora',
                unread: m.unread + 1,
                history: [
                  ...m.history,
                  {
                    id: newMessageId,
                    text,
                    sender: 'other',
                    timestamp,
                    attachments,
                  },
                ],
              }
            : m,
        )
      } else {
        newPrev.push({
          id: `${contactId}_${currentUser.id}_new`,
          ownerId: contactId,
          contact: currentUser.name,
          contactId: currentUser.id,
          type: currentUser.role,
          lastMessage: text,
          time: 'Agora',
          unread: 1,
          avatar: currentUser.avatar || '',
          history: [
            {
              id: newMessageId,
              text,
              sender: 'other',
              timestamp,
              attachments,
            },
          ],
        })
      }

      return newPrev
    })
  }

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

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const task = tasks.find((t) => t.id === taskId)

    // Check if task exists and is moving to 'completed'
    if (task && status === 'completed' && task.status !== 'completed') {
      // Ensure we have a price to book
      if (task.price && task.price > 0) {
        // Check for duplicate entry to ensure data integrity
        const existingEntry = ledgerEntries.find(
          (e) => e.referenceId === taskId,
        )

        if (!existingEntry) {
          const categoryMap: Record<string, string> = {
            cleaning: 'Limpeza',
            maintenance: 'Manutenção',
            inspection: 'Inspeção',
          }

          const entry: LedgerEntry = {
            id: `auto-task-${taskId}-${Date.now()}`,
            propertyId: task.propertyId,
            date: new Date().toISOString(),
            // Give 14 days for payment, so it doesn't show as overdue immediately
            dueDate: addDays(new Date(), 14).toISOString(),
            type: 'expense',
            category: categoryMap[task.type] || 'Despesa de Serviço',
            amount: task.price,
            description: `Serviço: ${task.title}`,
            referenceId: taskId,
            status: 'pending',
            payee: task.assignee,
          }
          addLedgerEntry(entry)

          addNotification({
            title: 'Custo Registrado',
            message: `O serviço "${task.title}" foi concluído e gerou uma despesa de $${task.price}.`,
            type: 'info',
          })
        }
      }
    }

    setTasks((prevTasks) => {
      return prevTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
    })
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Task',
      entityId: taskId,
      details: `Updated task status to: ${status}`,
    })
  }

  const updateTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Task',
      entityId: task.id,
      details: `Updated task: ${task.title}`,
    })
  }

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Task',
      entityId: task.id,
      details: `Created task: ${task.title}`,
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

  const startChat = (contactId: string) => {
    const contact = allUsers.find((u) => u.id === contactId)
    if (!contact) return
    if (visibleMessages.find((m) => m.contactId === contactId)) return

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

  const updateTenant = (tenant: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === tenant.id ? tenant : t)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Tenant',
      entityId: tenant.id,
      details: `Updated tenant profile: ${tenant.name}`,
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

  const updateOwner = (owner: Owner) => {
    setOwners((prev) => prev.map((o) => (o.id === owner.id ? owner : o)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Owner',
      entityId: owner.id,
      details: `Updated owner: ${owner.name}`,
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

  const updatePartner = (partner: Partner) => {
    setPartners(partners.map((p) => (p.id === partner.id ? partner : p)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Partner',
      entityId: partner.id,
      details: `Updated partner: ${partner.name}`,
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

  const addGenericServiceRate = (rate: ServiceRate) => {
    setGenericServiceRates([...genericServiceRates, rate])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'ServiceRate',
      details: `Added generic rate: ${rate.serviceName}`,
    })
  }

  const updateGenericServiceRate = (rate: ServiceRate) => {
    setGenericServiceRates(
      genericServiceRates.map((r) => (r.id === rate.id ? rate : r)),
    )
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'ServiceRate',
      details: `Updated generic rate: ${rate.serviceName}`,
    })
  }

  const deleteGenericServiceRate = (rateId: string) => {
    setGenericServiceRates(genericServiceRates.filter((r) => r.id !== rateId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'ServiceRate',
      details: 'Deleted generic rate',
    })
  }

  const renewTenantContract = (
    tenantId: string,
    newEnd: string,
    newRent: number,
    newStart?: string,
    contractDoc?: GenericDocument,
  ) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const updatedTenant = {
            ...t,
            leaseEnd: newEnd,
            leaseStart: newStart || t.leaseStart,
            rentValue: newRent,
            status: 'active' as const,
            negotiationStatus: 'closed' as const,
            documents: contractDoc
              ? [...(t.documents || []), contractDoc]
              : t.documents,
          }
          return updatedTenant
        }
        return t
      }),
    )

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'renew',
      entity: 'Tenant',
      entityId: tenantId,
      details: `Renewed lease for tenant ${tenantId}. New end: ${newEnd}`,
    })

    addNotification({
      title: 'Contrato Renovado',
      message: `O contrato do inquilino ${tenantId} foi renovado com sucesso.`,
      type: 'success',
    })
  }

  const updateTenantNegotiation = (
    tenantId: string,
    data: {
      status?: NegotiationStatus
      suggestedPrice?: number
      log?: NegotiationLogEntry
    },
  ) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            negotiationStatus: data.status ?? t.negotiationStatus,
            suggestedRenewalPrice:
              data.suggestedPrice ?? t.suggestedRenewalPrice,
            negotiationLogs: data.log
              ? [...(t.negotiationLogs || []), data.log]
              : t.negotiationLogs,
          }
        }
        return t
      }),
    )
  }

  const addAdvertisement = (ad: Advertisement) => {
    setAdvertisements((prev) => [...prev, ad])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Advertisement',
      entityId: ad.id,
      details: `Created ad: ${ad.title}`,
    })
  }

  const updateAdvertisement = (ad: Advertisement) => {
    setAdvertisements((prev) => prev.map((a) => (a.id === ad.id ? ad : a)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Advertisement',
      entityId: ad.id,
      details: `Updated ad: ${ad.title}`,
    })
  }

  const deleteAdvertisement = (adId: string) => {
    setAdvertisements((prev) => prev.filter((a) => a.id !== adId))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Advertisement',
      entityId: adId,
      details: `Deleted ad: ${adId}`,
    })
  }

  const addAdvertiser = (advertiser: Advertiser) => {
    setAdvertisers((prev) => [...prev, advertiser])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Advertiser',
      entityId: advertiser.id,
      details: `Created advertiser: ${advertiser.name}`,
    })
  }

  const updateAdvertiser = (advertiser: Advertiser) => {
    setAdvertisers((prev) =>
      prev.map((a) => (a.id === advertiser.id ? advertiser : a)),
    )
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Advertiser',
      entityId: advertiser.id,
      details: `Updated advertiser: ${advertiser.name}`,
    })
  }

  const deleteAdvertiser = (id: string) => {
    setAdvertisers((prev) => prev.filter((a) => a.id !== id))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Advertiser',
      entityId: id,
      details: `Deleted advertiser: ${id}`,
    })
  }

  const updateAdPricing = (pricing: AdPricing) => {
    setAdPricingState(pricing)
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'AdPricing',
      details: 'Updated advertisement pricing configuration',
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
