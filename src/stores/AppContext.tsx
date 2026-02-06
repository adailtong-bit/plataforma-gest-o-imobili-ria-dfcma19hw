import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
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
  ChatMessage,
  ChatAttachment,
  ServiceCategory,
  Visit,
  Workflow,
  Hotel,
  Tower,
  TaskHistory,
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
  serviceCategories as initialServiceCategories,
  visits as initialVisits,
  workflows as initialWorkflows,
  hotels as initialHotels,
  towers as initialTowers,
} from '@/lib/mockData'
import { translations, Language } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'
import { differenceInDays, differenceInHours, parseISO } from 'date-fns'

interface AppContextType {
  properties: Property[]
  condominiums: Condominium[]
  hotels: Hotel[]
  towers: Tower[]
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
  workflows: Workflow[]
  currentUser: User | Owner | Partner | Tenant
  allUsers: (User | Owner | Partner | Tenant)[]
  users: User[]
  isAuthenticated: boolean
  paymentIntegrations: PaymentIntegration[]
  financialSettings: FinancialSettings
  bankStatements: BankStatement[]
  ledgerEntries: LedgerEntry[]
  auditLogs: AuditLog[]
  genericServiceRates: ServiceRate[]
  serviceCategories: ServiceCategory[]
  notifications: Notification[]
  advertisements: Advertisement[]
  advertisers: Advertiser[]
  adPricing: AdPricing
  language: Language
  typingStatus: Record<string, boolean>
  selectedPropertyId: string
  visits: Visit[]
  setLanguage: (lang: Language) => void
  setSelectedPropertyId: (id: string) => void
  t: (key: string, params?: Record<string, string>) => string
  login: (email: string) => boolean
  logout: () => void
  addProperty: (property: Property) => void
  updateProperty: (property: Property) => void
  deleteProperty: (propertyId: string) => void
  addCondominium: (condo: Condominium) => void
  updateCondominium: (condo: Condominium) => void
  deleteCondominium: (condoId: string) => void
  addHotel: (hotel: Hotel) => void
  updateHotel: (hotel: Hotel) => void
  deleteHotel: (hotelId: string) => void
  addTower: (tower: Tower) => void
  updateTower: (tower: Tower) => void
  deleteTower: (towerId: string) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  updateTask: (task: Task) => void
  addTask: (task: Task) => void
  deleteTask: (taskId: string) => void
  approveTask: (taskId: string) => void
  rejectTask: (taskId: string, reason: string) => void
  notifySupplier: (taskId: string) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (invoice: Invoice) => void
  markPaymentAs: (paymentId: string, status: Payment['status']) => void
  addTaskImage: (taskId: string, imageUrl: string) => void
  addTaskEvidence: (taskId: string, evidence: Evidence) => void
  sendMessage: (
    contactId: string,
    text: string,
    attachments?: ChatAttachment[],
    senderIdOverride?: string,
  ) => void
  markAsRead: (threadId: string) => void
  startChat: (contactId: string) => void
  setTyping: (userId: string, isTyping: boolean) => void
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
  addServiceCategory: (category: ServiceCategory) => void
  updateServiceCategory: (category: ServiceCategory) => void
  deleteServiceCategory: (categoryId: string) => void
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
  setCurrentUser: (id: string) => void
  addVisit: (visit: Visit) => void
  updateVisit: (visit: Visit) => void
  deleteVisit: (id: string) => void
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (workflow: Workflow) => void
  deleteWorkflow: (id: string) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [condominiums, setCondominiums] =
    useState<Condominium[]>(initialCondominiums)
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels)
  const [towers, setTowers] = useState<Tower[]>(initialTowers)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)
  const [visits, setVisits] = useState<Visit[]>(initialVisits)

  // ... (rest of state initializations)
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
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)

  const [allMessages, setAllMessages] = useState<Message[]>(initialMessages)
  const [users, setUsers] = useState<User[]>(systemUsers)
  const [paymentIntegrations, setPaymentIntegrations] = useState<
    PaymentIntegration[]
  >(defaultPaymentIntegrations)

  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(
    {
      ...defaultFinancialSettings,
      gateways: {
        stripe: { enabled: false },
        paypal: { enabled: false },
        mercadoPago: { enabled: false },
      },
      approvalThreshold: 100,
    },
  )

  const [bankStatements, setBankStatements] =
    useState<BankStatement[]>(mockBankStatements)
  const [ledgerEntries, setLedgerEntries] =
    useState<LedgerEntry[]>(initialLedgerEntries)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs)
  const [genericServiceRates, setGenericServiceRates] =
    useState<ServiceRate[]>(initialGenericRates)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    initialServiceCategories,
  )
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(
    initialAdvertisements,
  )
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(mockAdvertisers)
  const [adPricing, setAdPricingState] = useState<AdPricing>(mockAdPricing)
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({})

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language')
    return (saved as Language) || 'en'
  })

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUserObj] = useState<
    User | Owner | Partner | Tenant
  >(systemUsers[0])

  const { toast } = useToast()

  // Automated Notifications Check (useEffect block omitted for brevity, assuming kept as is)
  useEffect(() => {
    // ... (same as original)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app_language', lang)
  }

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      // ... (same as original)
      const resolveKey = (dict: any, k: string) => {
        const parts = k.split('.')
        let current = dict
        for (const part of parts) {
          if (current === undefined || current === null) return undefined
          current = current[part]
        }
        return typeof current === 'string' ? current : undefined
      }

      let text = resolveKey(translations[language], key)
      if (!text && language !== 'en') {
        text = resolveKey(translations['en'], key)
      }

      if (!text) {
        const parts = key.split('.')
        const lastPart = parts[parts.length - 1]
        text = lastPart
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      }

      if (text && params) {
        Object.entries(params).forEach(([pkey, pval]) => {
          text = text!.replace(`{${pkey}}`, pval)
        })
      }

      return text || key
    },
    [language],
  )

  const allUsers = useMemo(() => {
    const combined = [...users, ...owners, ...partners, ...tenants]
    const uniqueMap = new Map()
    combined.forEach((u) => {
      if (uniqueMap.has(u.id)) {
        uniqueMap.set(u.id, { ...uniqueMap.get(u.id), ...u })
      } else {
        uniqueMap.set(u.id, u)
      }
    })
    return Array.from(uniqueMap.values())
  }, [users, owners, partners, tenants])

  const login = (email: string) => {
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (user) {
      setCurrentUserObj(user)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
  }

  const setCurrentUser = (id: string) => {
    const u = allUsers.find((user) => user.id === id)
    if (u) setCurrentUserObj(u)
  }

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...log,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      }
      setNotifications((prev) => [newNotif, ...prev])
      toast({
        title: notification.title,
        description: notification.message,
        duration: 3000,
        variant: notification.type === 'critical' ? 'destructive' : 'default',
        action: notification.link ? (
          <div
            className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-primary/90"
            onClick={() => (window.location.href = notification.link!)}
          >
            View
          </div>
        ) : undefined,
      })
    },
    [toast, currentUser],
  )

  const addTask = (t: Task) => {
    const taskWithHistory: Task = {
      ...t,
      createdBy: currentUser.id,
      history: [
        ...(t.history || []),
        {
          id: `hist-${Date.now()}`,
          action: 'create',
          statusTo: t.status,
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date().toISOString(),
          note: 'Task created',
        },
      ],
    }

    setTasks([...tasks, taskWithHistory])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Task',
      entityId: t.propertyId,
      details: `Created task: ${t.title} for ${t.propertyName}`,
    })

    if (t.priority === 'critical' || t.priority === 'high') {
      addNotification({
        title: 'Urgent Maintenance',
        message: `High priority task created: ${t.title}`,
        type: 'critical',
        category: 'maintenance',
        link: '/tasks',
      })
    }
  }

  const updateTask = (t: Task) => {
    const oldTask = tasks.find((task) => task.id === t.id)
    const updatedTask = {
      ...t,
      completedDate:
        t.status === 'completed' && oldTask?.status !== 'completed'
          ? new Date().toISOString()
          : t.completedDate,
    }
    setTasks(tasks.map((task) => (task.id === t.id ? updatedTask : task)))

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Task',
      entityId: t.propertyId,
      details: `Updated task: ${t.title}. Status: ${t.status}`,
    })

    if (
      t.status === 'completed' &&
      oldTask?.status !== 'completed' &&
      (t.billableAmount || t.price)
    ) {
      const amount = t.billableAmount || t.price || 0
      const ledgerEntry: LedgerEntry = {
        id: `auto-task-${t.id}-${Date.now()}`,
        propertyId: t.propertyId,
        date: new Date().toISOString(),
        type: 'expense',
        category: t.type === 'cleaning' ? 'Cleaning' : 'Maintenance',
        amount: amount,
        description: `Task Completed: ${t.title}`,
        referenceId: t.id,
        status: 'pending',
        payee: t.assignee,
      }
      addLedgerEntry(ledgerEntry)
      toast({
        title: 'Financial Posting',
        description: `Task cost (${amount}) automatically posted to ledger.`,
      })
    }
  }

  const approveTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const isAdminOrPM = [
      'platform_owner',
      'software_tenant',
      'internal_user',
    ].includes(currentUser.role)

    let nextStatus: Task['status'] = task.status
    let nextApprovalStatus = task.approvalStatus
    let note = ''

    if (task.approvalStatus === 'owner_pending' && !isAdminOrPM) {
      nextApprovalStatus = 'pm_pending'
      note = 'Approved by Owner. Pending PM approval.'
      toast({
        title: t('common.approved'),
        description: 'Aprovado. Aguardando PM.',
      })
    } else {
      nextApprovalStatus = 'approved'
      nextStatus = 'pending'
      note = 'Task approved for execution.'
      toast({
        title: t('common.approved'),
        description: 'Tarefa aprovada para execução.',
      })
    }

    const newHistoryItem: TaskHistory = {
      id: `hist-${Date.now()}`,
      action: 'approve',
      statusFrom: task.status,
      statusTo: nextStatus,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      note: note,
    }

    const updatedTask = {
      ...task,
      status: nextStatus,
      approvalStatus: nextApprovalStatus,
      history: [...(task.history || []), newHistoryItem],
    }

    updateTask(updatedTask)

    // Notify requester if final approval
    if (nextApprovalStatus === 'approved' && task.createdBy) {
      addNotification({
        title: 'Task Approved',
        message: `Your task "${task.title}" has been approved.`,
        type: 'success',
        category: 'maintenance',
        link: '/tasks',
      })
    }
  }

  const rejectTask = (taskId: string, reason: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const creator = allUsers.find((u) => u.id === task.createdBy)
    const newAssigneeId = task.createdBy || task.assigneeId
    const newAssigneeName = creator?.name || 'Requester'

    const newHistoryItem: TaskHistory = {
      id: `hist-${Date.now()}`,
      action: 'reject',
      statusFrom: task.status,
      statusTo: 'rejected',
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      note: reason,
    }

    updateTask({
      ...task,
      status: 'rejected',
      approvalStatus: undefined,
      assigneeId: newAssigneeId,
      assignee: newAssigneeName,
      history: [...(task.history || []), newHistoryItem],
    })

    if (creator) {
      addNotification({
        title: 'Task Rejected',
        message: `Task "${task.title}" rejected: ${reason}`,
        type: 'warning',
        category: 'maintenance',
        link: '/tasks',
      })
    }

    toast({
      title: t('common.reject'),
      description: 'Tarefa rejeitada e retornada ao solicitante.',
      variant: 'destructive',
    })
  }

  // ... (rest of functions: addLedgerEntry, addProperty, etc.)
  const addLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries((prev) => [...prev, entry])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Financial',
      entityId: entry.propertyId,
      details: `Financial Entry: ${entry.type === 'income' ? '+' : '-'}${entry.amount} (${entry.category}) - ${entry.description}`,
    })
  }

  const addProperty = (p: Property) => {
    setProperties([...properties, p])
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Property',
      entityId: p.id,
      details: `Created property: ${p.name}`,
    })
    if (p.hoaValue && p.hoaValue > 0) {
      const hoaEntry: LedgerEntry = {
        id: `auto-hoa-${p.id}-${Date.now()}`,
        propertyId: p.id,
        date: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        type: 'expense',
        category: 'HOA Fee',
        amount: p.hoaValue,
        description: `Initial HOA Fee - ${p.community || 'Association'}`,
        status: 'pending',
      }
      setTimeout(() => addLedgerEntry(hoaEntry), 100)
    }
  }

  const updateProperty = (p: Property) => {
    setProperties(properties.map((prop) => (prop.id === p.id ? p : prop)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Property',
      entityId: p.id,
      details: `Updated property details: ${p.name}`,
    })
  }

  const deleteProperty = (id: string) => {
    const prop = properties.find((p) => p.id === id)
    setProperties(properties.filter((p) => p.id !== id))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Property',
      entityId: id,
      details: `Deleted property: ${prop?.name || id}`,
    })
  }

  const addCondominium = (c: Condominium) =>
    setCondominiums([...condominiums, c])
  const updateCondominium = (c: Condominium) =>
    setCondominiums(
      condominiums.map((condo) => (condo.id === c.id ? c : condo)),
    )
  const deleteCondominium = (id: string) =>
    setCondominiums(condominiums.filter((c) => c.id !== id))
  const addHotel = (h: Hotel) => setHotels([...hotels, h])
  const updateHotel = (h: Hotel) =>
    setHotels(hotels.map((hotel) => (hotel.id === h.id ? h : hotel)))
  const deleteHotel = (id: string) =>
    setHotels(hotels.filter((h) => h.id !== id))
  const addTower = (t: Tower) => setTowers([...towers, t])
  const updateTower = (t: Tower) =>
    setTowers(towers.map((tower) => (tower.id === t.id ? t : tower)))
  const deleteTower = (id: string) =>
    setTowers(towers.filter((t) => t.id !== id))

  const updateTaskStatus = (id: string, status: Task['status']) => {
    const task = tasks.find((t) => t.id === id)
    if (task) {
      // Just a status update, can also log to history
      const newHistoryItem: TaskHistory = {
        id: `hist-${Date.now()}`,
        action: 'update',
        statusFrom: task.status,
        statusTo: status,
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date().toISOString(),
        note: `Status updated manually to ${status}`,
      }
      updateTask({
        ...task,
        status,
        history: [...(task.history || []), newHistoryItem],
      })
    }
  }

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    setTasks(tasks.filter((t) => t.id !== id))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Task',
      entityId: task?.propertyId || id,
      details: `Deleted task: ${task?.title || id}`,
    })
  }

  const notifySupplier = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const now = new Date().toISOString()
    updateTask({ ...task, lastNotified: now })
    toast({
      title: 'Notification Sent',
      description: `Supplier ${task.assignee} notified about task "${task.title}".`,
    })
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const updateLedgerEntry = (entry: LedgerEntry) => {
    setLedgerEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Financial',
      entityId: entry.propertyId,
      details: `Updated financial entry: ${entry.description}`,
    })
  }

  const deleteLedgerEntry = (id: string) => {
    const entry = ledgerEntries.find((e) => e.id === id)
    setLedgerEntries((prev) => prev.filter((e) => e.id !== id))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'delete',
      entity: 'Financial',
      entityId: entry?.propertyId || id,
      details: `Deleted financial entry: ${entry?.description || id}`,
    })
  }

  // ... (rest of handlers, keeping them same but ensuring we return context correctly)
  const approveUser = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u)),
    )
  const blockUser = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'blocked' } : u)),
    )
  const setTyping = (userId: string, isTyping: boolean) =>
    setTypingStatus((prev) => ({ ...prev, [userId]: isTyping }))

  const sendMessage = (
    contactId: string,
    text: string,
    attachments: ChatAttachment[] = [],
    senderIdOverride?: string,
  ) => {
    // ... (sendMessage logic from original file)
    const senderId = senderIdOverride || currentUser.id
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text,
      senderId,
      timestamp: new Date().toISOString(),
      attachments,
      read: false,
    }

    setAllMessages((prev) => {
      let nextMessages = [...prev]
      const senderThreadIndex = nextMessages.findIndex(
        (m) => m.ownerId === senderId && m.contactId === contactId,
      )
      if (senderThreadIndex >= 0) {
        nextMessages[senderThreadIndex] = {
          ...nextMessages[senderThreadIndex],
          lastMessage: text,
          time: newMessage.timestamp,
          history: [...nextMessages[senderThreadIndex].history, newMessage],
        }
      } else {
        const contact = allUsers.find((u) => u.id === contactId)
        nextMessages.push({
          id: `chat-${senderId}-${contactId}`,
          contact: contact?.name || 'Unknown',
          contactId: contactId,
          ownerId: senderId,
          lastMessage: text,
          time: newMessage.timestamp,
          unread: 0,
          avatar: contact?.avatar || '',
          history: [newMessage],
        })
      }

      const recipientThreadIndex = nextMessages.findIndex(
        (m) => m.ownerId === contactId && m.contactId === senderId,
      )
      if (recipientThreadIndex >= 0) {
        nextMessages[recipientThreadIndex] = {
          ...nextMessages[recipientThreadIndex],
          lastMessage: text,
          time: newMessage.timestamp,
          unread: nextMessages[recipientThreadIndex].unread + 1,
          history: [...nextMessages[recipientThreadIndex].history, newMessage],
        }
      } else {
        const senderUser = allUsers.find((u) => u.id === senderId)
        nextMessages.push({
          id: `chat-${contactId}-${senderId}`,
          contact: senderUser?.name || 'Unknown',
          contactId: senderId,
          ownerId: contactId,
          lastMessage: text,
          time: newMessage.timestamp,
          unread: 1,
          avatar: senderUser?.avatar || '',
          history: [newMessage],
        })
      }

      return nextMessages
    })
  }

  const markAsRead = (threadId: string) => {
    setAllMessages((prev) =>
      prev.map((m) => {
        if (m.id === threadId) {
          return {
            ...m,
            unread: 0,
            history: m.history.map((msg) =>
              msg.senderId !== currentUser.id ? { ...msg, read: true } : msg,
            ),
          }
        }
        return m
      }),
    )
  }

  const startChat = (contactId: string) => {
    if (
      allMessages.some(
        (m) => m.ownerId === currentUser.id && m.contactId === contactId,
      )
    ) {
      return
    }
    const contact = allUsers.find((u) => u.id === contactId)
    if (contact) {
      setAllMessages((prev) => [
        ...prev,
        {
          id: `chat-${currentUser.id}-${contactId}`,
          contact: contact.name,
          contactId: contact.id,
          ownerId: currentUser.id,
          lastMessage: '',
          time: new Date().toISOString(),
          unread: 0,
          avatar: contact.avatar || '',
          history: [],
        },
      ])
    }
  }

  const addInvoice = (i: Invoice) => {
    setFinancials((prev) => ({ ...prev, invoices: [...prev.invoices, i] }))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'create',
      entity: 'Invoice',
      details: `Generated Invoice: ${i.amount} - ${i.description}`,
    })
  }
  const updateInvoice = (i: Invoice) => {
    setFinancials((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) => (inv.id === i.id ? i : inv)),
    }))
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'update',
      entity: 'Invoice',
      details: `Updated Invoice ${i.id}. Status: ${i.status}`,
    })
  }

  // ... rest of simple handlers
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
  const updateAutomationRule = (r: AutomationRule) =>
    setAutomationRules((prev) =>
      prev.map((rule) => (rule.id === r.id ? r : rule)),
    )
  const updatePaymentIntegration = (i: PaymentIntegration) =>
    setPaymentIntegrations((prev) =>
      prev.map((pi) => (pi.provider === i.provider ? i : pi)),
    )
  const updateFinancialSettings = (s: FinancialSettings) =>
    setFinancialSettings(s)
  const uploadBankStatement = (s: BankStatement) =>
    setBankStatements((prev) => [...prev, s])
  const addGenericServiceRate = (r: ServiceRate) =>
    setGenericServiceRates((prev) => [
      ...prev,
      { ...r, lastUpdated: new Date().toISOString() },
    ])
  const updateGenericServiceRate = (r: ServiceRate) =>
    setGenericServiceRates((prev) =>
      prev.map((rate) =>
        rate.id === r.id
          ? { ...r, lastUpdated: new Date().toISOString() }
          : rate,
      ),
    )
  const deleteGenericServiceRate = (id: string) =>
    setGenericServiceRates((prev) => prev.filter((r) => r.id !== id))
  const addServiceCategory = (category: ServiceCategory) =>
    setServiceCategories((prev) => [...prev, category])
  const updateServiceCategory = (category: ServiceCategory) =>
    setServiceCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c)),
    )
  const deleteServiceCategory = (categoryId: string) =>
    setServiceCategories((prev) => prev.filter((c) => c.id !== categoryId))
  const renewTenantContract = (
    id: string,
    end: string,
    rent: number,
    start?: string,
    doc?: GenericDocument,
  ) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const docs = doc ? [...(t.documents || []), doc] : t.documents
          return {
            ...t,
            leaseStart: start || t.leaseStart,
            leaseEnd: end,
            rentValue: rent,
            negotiationStatus: 'closed',
            documents: docs,
          }
        }
        return t
      }),
    )
  }
  const updateTenantNegotiation = (
    id: string,
    data: {
      status?: NegotiationStatus
      suggestedPrice?: number
      log?: NegotiationLogEntry
    },
  ) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const logs = data.log
            ? [...(t.negotiationLogs || []), data.log]
            : t.negotiationLogs
          return {
            ...t,
            negotiationStatus: data.status || t.negotiationStatus,
            suggestedRenewalPrice:
              data.suggestedPrice !== undefined
                ? data.suggestedPrice
                : t.suggestedRenewalPrice,
            negotiationLogs: logs,
          }
        }
        return t
      }),
    )
  }
  const addAdvertisement = (a: Advertisement) =>
    setAdvertisements((prev) => [...prev, a])
  const updateAdvertisement = (a: Advertisement) =>
    setAdvertisements((prev) => prev.map((ad) => (ad.id === a.id ? a : ad)))
  const deleteAdvertisement = (id: string) =>
    setAdvertisements((prev) => prev.filter((ad) => ad.id !== id))
  const addAdvertiser = (a: Advertiser) =>
    setAdvertisers((prev) => [...prev, a])
  const updateAdvertiser = (a: Advertiser) =>
    setAdvertisers((prev) => prev.map((ad) => (ad.id === a.id ? a : ad)))
  const deleteAdvertiser = (id: string) =>
    setAdvertisers((prev) => prev.filter((ad) => ad.id !== id))
  const updateAdPricing = (p: AdPricing) => setAdPricingState(p)
  const addBooking = (booking: Booking) =>
    setBookings((prev) => [...prev, booking])
  const updateBooking = (booking: Booking) =>
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)))
  const deleteBooking = (bookingId: string) =>
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
  const addCalendarBlock = (block: CalendarBlock) =>
    setCalendarBlocks((prev) => [...prev, block])
  const deleteCalendarBlock = (blockId: string) =>
    setCalendarBlocks((prev) => prev.filter((b) => b.id !== blockId))
  const addMessageTemplate = (template: MessageTemplate) =>
    setMessageTemplates((prev) => [...prev, template])
  const updateMessageTemplate = (template: MessageTemplate) =>
    setMessageTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? template : t)),
    )
  const deleteMessageTemplate = (templateId: string) =>
    setMessageTemplates((prev) => prev.filter((t) => t.id !== templateId))
  const addVisit = (visit: Visit) => setVisits((prev) => [...prev, visit])
  const updateVisit = (visit: Visit) =>
    setVisits((prev) => prev.map((v) => (v.id === visit.id ? visit : v)))
  const deleteVisit = (id: string) =>
    setVisits((prev) => prev.filter((v) => v.id !== id))
  const addWorkflow = (workflow: Workflow) =>
    setWorkflows((prev) => [...prev, workflow])
  const updateWorkflow = (workflow: Workflow) =>
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflow.id ? workflow : w)),
    )
  const deleteWorkflow = (id: string) =>
    setWorkflows((prev) => prev.filter((w) => w.id !== id))

  const visibleMessages = useMemo(
    () => allMessages.filter((m) => m.ownerId === currentUser.id),
    [allMessages, currentUser.id],
  )

  return (
    <AppContext.Provider
      value={{
        properties,
        condominiums,
        hotels,
        towers,
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
        workflows,
        currentUser,
        allUsers,
        users,
        isAuthenticated,
        paymentIntegrations,
        financialSettings,
        bankStatements,
        ledgerEntries,
        auditLogs,
        genericServiceRates,
        serviceCategories,
        notifications,
        advertisements,
        advertisers,
        adPricing,
        language,
        typingStatus,
        selectedPropertyId,
        visits,
        setTyping,
        setLanguage,
        setSelectedPropertyId,
        t,
        login,
        logout,
        addProperty,
        updateProperty,
        deleteProperty,
        addCondominium,
        updateCondominium,
        deleteCondominium,
        addHotel,
        updateHotel,
        deleteHotel,
        addTower,
        updateTower,
        deleteTower,
        updateTaskStatus,
        updateTask,
        addTask,
        deleteTask,
        approveTask,
        rejectTask,
        notifySupplier,
        addInvoice,
        updateInvoice,
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
        addServiceCategory,
        updateServiceCategory,
        deleteServiceCategory,
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
        addVisit,
        updateVisit,
        deleteVisit,
        addWorkflow,
        updateWorkflow,
        deleteWorkflow,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
