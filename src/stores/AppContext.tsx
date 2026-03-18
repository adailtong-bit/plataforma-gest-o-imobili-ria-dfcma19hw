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
  ChatAttachment,
  ServiceCategory,
  Visit,
  Workflow,
  Hotel,
  Tower,
  TourStep,
  TutorialModule,
  NightAudit,
  GuestService,
  PosItem,
  PosTransaction,
  Promotion,
  Campaign,
  ServiceOrder,
  Feedback,
  ChannelMapping,
  MarketingWorkflow,
  EmailTemplate,
  UserRole,
  Resource,
  Action,
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
  tourSteps as initialTourSteps,
  guestServices as initialGuestServices,
  posItems as initialPosItems,
  posTransactions as initialPosTransactions,
  promotions as initialPromotions,
  campaigns as initialCampaigns,
  serviceOrders as initialServiceOrders,
  feedbacks as initialFeedbacks,
  channelMappings as initialChannelMappings,
  marketingWorkflows as initialMarketingWorkflows,
  emailTemplates as initialEmailTemplates,
} from '@/lib/mockData'
import { tutorialModules as initialTutorialModules } from '@/lib/tutorials'
import { translations, Language } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'
import { DEFAULT_PERMISSIONS_MATRIX } from '@/lib/permissions'

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
  currentUser: User | Owner | Partner | Tenant | null
  allUsers: (User | Owner | Partner | Tenant)[]
  users: User[]
  isAuthenticated: boolean
  isAuthLoading: boolean
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
  nightAudits: NightAudit[]

  guestServices: GuestService[]
  posItems: PosItem[]
  posTransactions: PosTransaction[]
  promotions: Promotion[]
  campaigns: Campaign[]
  serviceOrders: ServiceOrder[]
  feedbacks: Feedback[]
  channelMappings: ChannelMapping[]
  marketingWorkflows: MarketingWorkflow[]
  emailTemplates: EmailTemplate[]

  currency: string

  isTourOpen: boolean
  currentStepIndex: number
  tourSteps: TourStep[]
  tutorialModules: TutorialModule[]
  activeVideo: string | null

  rolePermissions: Record<UserRole, Partial<Record<Resource, Action[]>>>
  updateRolePermissions: (
    role: UserRole,
    resource: Resource,
    actions: Action[],
  ) => void
  checkPermission: (
    user: User,
    resource: Resource,
    action: Action,
  ) => Promise<boolean>
  hasPermissionSync: (user: User, resource: Resource, action: Action) => boolean

  simulationMode: boolean
  setSimulationMode: (mode: boolean) => void
  simulationRole: UserRole | null
  setSimulationRole: (role: UserRole | null) => void

  setLanguage: (lang: Language) => void
  setSelectedPropertyId: (id: string) => void
  t: (key: string, params?: Record<string, string>) => string
  formatAppCurrency: (value: number) => string
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
  deleteInvoice: (invoiceId: string) => void
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
  runNightAudit: () => void

  addGuestService: (service: GuestService) => void
  updateGuestService: (service: GuestService) => void
  deleteGuestService: (id: string) => void
  addServiceOrder: (order: ServiceOrder) => void
  addPosItem: (item: PosItem) => void
  updatePosItem: (item: PosItem) => void
  deletePosItem: (id: string) => void
  addPosTransaction: (transaction: PosTransaction) => void
  addPromotion: (promo: Promotion) => void
  updatePromotion: (promo: Promotion) => void
  deletePromotion: (id: string) => void
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (campaign: Campaign) => void
  deleteCampaign: (id: string) => void
  addFeedback: (feedback: Feedback) => void
  updateFeedback: (feedback: Feedback) => void
  addChannelMapping: (mapping: ChannelMapping) => void
  updateChannelMapping: (mapping: ChannelMapping) => void
  deleteChannelMapping: (id: string) => void
  addMarketingWorkflow: (workflow: MarketingWorkflow) => void
  updateMarketingWorkflow: (workflow: MarketingWorkflow) => void
  deleteMarketingWorkflow: (id: string) => void
  addEmailTemplate: (template: EmailTemplate) => void
  updateEmailTemplate: (template: EmailTemplate) => void
  deleteEmailTemplate: (id: string) => void

  runWorkflows: (trigger: string, context?: any) => void
  executeWorkflow: (workflow: Workflow, targetPropertyIds?: string[]) => void

  startTour: () => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  openVideo: (videoUrl: string) => void
  closeVideo: () => void

  addTenant: (t: Tenant) => void
  updateTenant: (t: Tenant) => void
  addOwner: (o: Owner) => void
  updateOwner: (o: Owner) => void
  addPartner: (p: Partner) => void
  updatePartner: (p: Partner) => void
  deletePartner: (id: string) => void
  addBooking: (b: Booking) => void
  updateBooking: (b: Booking) => void
  deleteBooking: (id: string) => void
  addCalendarBlock: (b: CalendarBlock) => void
  deleteCalendarBlock: (id: string) => void
  addMessageTemplate: (t: MessageTemplate) => void
  updateMessageTemplate: (t: MessageTemplate) => void
  deleteMessageTemplate: (id: string) => void

  seedDatabase: (
    data: Partial<{
      users: User[]
      properties: Property[]
      owners: Owner[]
      partners: Partner[]
      tenants: Tenant[]
      bookings: Booking[]
      tasks: Task[]
      ledgerEntries: LedgerEntry[]
      invoices: Invoice[]
    }>,
  ) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

const getRoleName = (role: UserRole) => {
  switch (role) {
    case 'platform_owner':
      return 'Admin'
    case 'software_tenant':
      return 'Manager'
    case 'internal_user':
      return 'Staff'
    case 'partner':
      return 'Partner'
    case 'partner_employee':
      return 'Partner Employee'
    case 'property_owner':
      return 'Owner'
    case 'tenant':
      return 'Tenant'
    default:
      return 'Unknown'
  }
}

const getInitialUser = () => {
  const savedId = localStorage.getItem('app_current_user_id')
  if (!savedId) return null

  const localTenants = localStorage.getItem('app_tenants')
    ? JSON.parse(localStorage.getItem('app_tenants')!)
    : initialTenants
  const localOwners = localStorage.getItem('app_owners')
    ? JSON.parse(localStorage.getItem('app_owners')!)
    : initialOwners

  const allInitialUsers = [
    ...systemUsers,
    ...localOwners,
    ...initialPartners,
    ...localTenants,
  ]

  const found = allInitialUsers.find((u) => u.id === savedId)
  return found || null
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [condominiums, setCondominiums] =
    useState<Condominium[]>(initialCondominiums)
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels)
  const [towers, setTowers] = useState<Tower[]>(initialTowers)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)
  const [visits, setVisits] = useState<Visit[]>(initialVisits)
  const [nightAudits, setNightAudits] = useState<NightAudit[]>([])

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

  const [currency, setCurrency] = useState<string>(
    financialSettings.globalCurrency,
  )

  useEffect(() => {
    setCurrency(financialSettings.globalCurrency)
  }, [financialSettings.globalCurrency])

  const [guestServices, setGuestServices] =
    useState<GuestService[]>(initialGuestServices)
  const [posItems, setPosItems] = useState<PosItem[]>(initialPosItems)
  const [posTransactions, setPosTransactions] = useState<PosTransaction[]>(
    initialPosTransactions,
  )
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions)
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [serviceOrders, setServiceOrders] =
    useState<ServiceOrder[]>(initialServiceOrders)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks)
  const [channelMappings, setChannelMappings] = useState<ChannelMapping[]>(
    initialChannelMappings,
  )
  const [marketingWorkflows, setMarketingWorkflows] = useState<
    MarketingWorkflow[]
  >(initialMarketingWorkflows)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(
    initialEmailTemplates,
  )

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')

  const [simulationMode, setSimulationMode] = useState(false)
  const [simulationRole, setSimulationRole] = useState<UserRole | null>(null)

  const [currentUserObj, setCurrentUserObj] = useState<
    User | Owner | Partner | Tenant | null
  >(() => getInitialUser())

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = getInitialUser()
    return !!localStorage.getItem('app_current_user_id') && !!user
  })

  const [isAuthLoading, setIsAuthLoading] = useState(() => {
    const user = getInitialUser()
    if (!user) return false
    return user.role !== 'platform_owner'
  })

  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  const [rolePermissions, setRolePermissions] = useState<
    Record<UserRole, Partial<Record<Resource, Action[]>>>
  >(DEFAULT_PERMISSIONS_MATRIX)

  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const initializeSession = async () => {
      const initialUser = getInitialUser()

      if (initialUser?.role === 'platform_owner') {
        if (isMounted) {
          setCurrentUserObj(initialUser)
          setIsAuthenticated(true)
          setIsAuthLoading(false)
        }
        return
      }

      if (isMounted) setIsAuthLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (!isMounted) return

      if (initialUser) {
        setCurrentUserObj(initialUser)
        setIsAuthenticated(true)
      } else {
        setCurrentUserObj(null)
        setIsAuthenticated(false)
      }

      setIsAuthLoading(false)
    }

    initializeSession()

    return () => {
      isMounted = false
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app_language', lang)
  }

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const resolveKey = (dict: any, k: string) => {
        const parts = k.split('.')
        let current = dict
        for (const part of parts) {
          if (current === undefined || current === null) return undefined
          current = current[part]
        }
        return typeof current === 'string' ? current : undefined
      }

      let text =
        resolveKey(translations[language], key) ||
        resolveKey(translations['en'], key)

      if (!text) {
        const lastPart = key.split('.').pop() || key
        text = lastPart
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      if (params) {
        Object.entries(params).forEach(([pkey, pval]) => {
          text = text.replace(`{${pkey}}`, pval)
        })
      }
      return text
    },
    [language],
  )

  const formatAppCurrency = useCallback(
    (value: number) => {
      return formatCurrencyUtil(value, currency)
    },
    [currency],
  )

  const filterByOrg = useCallback(
    <T extends { organizationId?: string }>(items: T[]): T[] => {
      if (!currentUserObj) return []
      if (currentUserObj.role === 'platform_owner') return items
      return items.filter(
        (item) =>
          !item.organizationId ||
          item.organizationId === (currentUserObj as User).organizationId,
      )
    },
    [currentUserObj],
  )

  const attachOrg = useCallback(
    <T extends object>(item: T): T => {
      if (
        currentUserObj?.role !== 'platform_owner' &&
        (currentUserObj as User)?.organizationId
      ) {
        return {
          ...item,
          organizationId: (currentUserObj as User).organizationId,
        }
      }
      return item
    },
    [currentUserObj],
  )

  const scopedProperties = useMemo(
    () => filterByOrg(properties),
    [properties, filterByOrg],
  )
  const scopedCondominiums = useMemo(
    () => filterByOrg(condominiums),
    [condominiums, filterByOrg],
  )
  const scopedHotels = useMemo(() => filterByOrg(hotels), [hotels, filterByOrg])
  const scopedTowers = useMemo(() => filterByOrg(towers), [towers, filterByOrg])
  const scopedTasks = useMemo(() => filterByOrg(tasks), [tasks, filterByOrg])
  const scopedTenants = useMemo(
    () => filterByOrg(tenants),
    [tenants, filterByOrg],
  )
  const scopedOwners = useMemo(() => filterByOrg(owners), [owners, filterByOrg])
  const scopedPartners = useMemo(
    () => filterByOrg(partners),
    [partners, filterByOrg],
  )
  const scopedBookings = useMemo(
    () => filterByOrg(bookings),
    [bookings, filterByOrg],
  )
  const scopedVisits = useMemo(() => filterByOrg(visits), [visits, filterByOrg])
  const scopedUsers = useMemo(() => filterByOrg(users), [users, filterByOrg])
  const scopedAutomationRules = useMemo(
    () => filterByOrg(automationRules),
    [automationRules, filterByOrg],
  )
  const scopedWorkflows = useMemo(
    () => filterByOrg(workflows),
    [workflows, filterByOrg],
  )
  const scopedLedgerEntries = useMemo(
    () => filterByOrg(ledgerEntries),
    [ledgerEntries, filterByOrg],
  )
  const scopedGuestServices = useMemo(
    () => filterByOrg(guestServices),
    [guestServices, filterByOrg],
  )
  const scopedPosItems = useMemo(
    () => filterByOrg(posItems),
    [posItems, filterByOrg],
  )
  const scopedPosTransactions = useMemo(
    () => filterByOrg(posTransactions),
    [posTransactions, filterByOrg],
  )
  const scopedPromotions = useMemo(
    () => filterByOrg(promotions),
    [promotions, filterByOrg],
  )
  const scopedCampaigns = useMemo(
    () => filterByOrg(campaigns),
    [campaigns, filterByOrg],
  )
  const scopedFinancials = useMemo(
    () => ({
      ...financials,
      invoices: filterByOrg(financials.invoices),
      payments: filterByOrg(financials.payments),
    }),
    [financials, filterByOrg],
  )

  const allUsers = useMemo(() => {
    const combinedList = [...users, ...owners, ...partners, ...tenants]
    const uniqueUsers: (User | Owner | Partner | Tenant)[] = []
    const seenIds = new Set<string>()

    for (const item of combinedList) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id)
        uniqueUsers.push(item)
      }
    }

    return filterByOrg(uniqueUsers)
  }, [users, owners, partners, tenants, filterByOrg])

  const visibleMessages = useMemo(
    () => allMessages.filter((m) => m.ownerId === currentUserObj?.id),
    [allMessages, currentUserObj?.id],
  )

  const login = (email: string) => {
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (user) {
      setCurrentUserObj(user)
      localStorage.setItem('app_current_user_id', user.id)
      setIsAuthenticated(true)
      setIsAuthLoading(false)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setIsAuthLoading(false)
    localStorage.removeItem('app_current_user_id')
    setCurrentUserObj(null)
  }

  const setCurrentUser = (id: string) => {
    const u = allUsers.find((u) => u.id === id)
    if (u) {
      setCurrentUserObj(u)
      localStorage.setItem('app_current_user_id', u.id)
      setIsAuthenticated(true)
      setIsAuthLoading(false)
    }
  }

  const addProperty = (p: Property) =>
    setProperties((prev) => [...prev, attachOrg(p)])
  const updateProperty = (p: Property) =>
    setProperties((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  const deleteProperty = (id: string) =>
    setProperties((prev) => prev.filter((x) => x.id !== id))

  const addCondominium = (c: Condominium) =>
    setCondominiums((prev) => [...prev, attachOrg(c)])
  const updateCondominium = (c: Condominium) =>
    setCondominiums((prev) => prev.map((x) => (x.id === c.id ? c : x)))
  const deleteCondominium = (id: string) =>
    setCondominiums((prev) => prev.filter((x) => x.id !== id))

  const addHotel = (h: Hotel) => setHotels((prev) => [...prev, attachOrg(h)])
  const updateHotel = (h: Hotel) =>
    setHotels((prev) => prev.map((x) => (x.id === h.id ? h : x)))
  const deleteHotel = (id: string) =>
    setHotels((prev) => prev.filter((x) => x.id !== id))

  const addTower = (t: Tower) => setTowers((prev) => [...prev, attachOrg(t)])
  const updateTower = (t: Tower) =>
    setTowers((prev) => prev.map((x) => (x.id === t.id ? t : x)))
  const deleteTower = (id: string) =>
    setTowers((prev) => prev.filter((x) => x.id !== id))

  const addTask = (t: Task) => setTasks((prev) => [...prev, attachOrg(t)])
  const updateTask = (t: Task) =>
    setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)))
  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((x) => x.id !== id))

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status } : t))
      return updated
    })
    if (status === 'completed') {
      setTimeout(() => {
        runWorkflows('maintenance_request')
      }, 0)
    }
  }

  const approveTask = (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      if (task) {
        const amt = task.price || task.laborCost || 0
        if (amt > 0) {
          setTimeout(() => {
            addInvoice({
              id: `inv-auto-${Date.now()}`,
              description: `Auto-generated Invoice for Task: ${task.title}`,
              amount: amt,
              status: 'pending',
              date: new Date().toISOString(),
              propertyId: task.propertyId,
              bookingId: task.bookingId,
              type: 'generic',
            })
          }, 0)
        }
        return prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
      }
      return prev
    })
  }

  const rejectTask = (id: string) => updateTaskStatus(id, 'rejected')

  const addInvoice = (i: Invoice) =>
    setFinancials((prev) => ({
      ...prev,
      invoices: [...prev.invoices, attachOrg(i)],
    }))
  const updateInvoice = (i: Invoice) =>
    setFinancials((prev) => ({
      ...prev,
      invoices: prev.invoices.map((x) => (x.id === i.id ? i : x)),
    }))
  const deleteInvoice = (id: string) =>
    setFinancials((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((x) => x.id !== id),
    }))

  const addGuestService = (s: GuestService) =>
    setGuestServices((prev) => [...prev, attachOrg(s)])
  const updateGuestService = (s: GuestService) =>
    setGuestServices((prev) => prev.map((x) => (x.id === s.id ? s : x)))
  const deleteGuestService = (id: string) =>
    setGuestServices((prev) => prev.filter((x) => x.id !== id))

  const addServiceOrder = (o: ServiceOrder) =>
    setServiceOrders((prev) => [...prev, attachOrg(o)])
  const addPosItem = (i: PosItem) =>
    setPosItems((prev) => [...prev, attachOrg(i)])
  const updatePosItem = (i: PosItem) =>
    setPosItems((prev) => prev.map((x) => (x.id === i.id ? i : x)))
  const deletePosItem = (id: string) =>
    setPosItems((prev) => prev.filter((x) => x.id !== id))

  const addPosTransaction = (t: PosTransaction) =>
    setPosTransactions((prev) => [...prev, attachOrg(t)])
  const addPromotion = (p: Promotion) =>
    setPromotions((prev) => [...prev, attachOrg(p)])
  const updatePromotion = (p: Promotion) =>
    setPromotions((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  const deletePromotion = (id: string) =>
    setPromotions((prev) => prev.filter((x) => x.id !== id))

  const addCampaign = (c: Campaign) =>
    setCampaigns((prev) => [...prev, attachOrg(c)])
  const updateCampaign = (c: Campaign) =>
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? c : x)))
  const deleteCampaign = (id: string) =>
    setCampaigns((prev) => prev.filter((x) => x.id !== id))

  const addTenant = (t: Tenant) => setTenants((prev) => [...prev, attachOrg(t)])
  const updateTenant = (t: Tenant) =>
    setTenants((prev) => prev.map((x) => (x.id === t.id ? t : x)))
  const addOwner = (o: Owner) => setOwners((prev) => [...prev, attachOrg(o)])
  const updateOwner = (o: Owner) =>
    setOwners((prev) => prev.map((x) => (x.id === o.id ? o : x)))
  const addPartner = (p: Partner) =>
    setPartners((prev) => [...prev, attachOrg(p)])
  const updatePartner = (p: Partner) =>
    setPartners((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  const deletePartner = (id: string) =>
    setPartners((prev) => prev.filter((x) => x.id !== id))

  const addBooking = (b: Booking) => {
    setBookings((prev) => [...prev, attachOrg(b)])

    setCalendarBlocks((prev) => [
      ...prev,
      attachOrg({
        id: `block-auto-${Date.now()}`,
        propertyId: b.propertyId,
        startDate: b.checkIn,
        endDate: b.checkOut,
        type: 'external_sync',
        notes: `Booking: ${b.guestName}`,
        source: 'booking',
      }),
    ])

    setTasks((prev) => [
      ...prev,
      attachOrg({
        id: `task-clean-${Date.now()}`,
        title: `Cleaning after checkout - ${b.guestName}`,
        propertyId: b.propertyId,
        propertyName: b.propertyName || 'Property',
        status: 'pending',
        type: 'cleaning',
        assignee: 'Unassigned',
        date: b.checkOut,
        priority: 'high',
        source: 'automation',
      }),
    ])

    setTimeout(() => {
      runWorkflows('before_checkin', { booking: b })
    }, 0)
  }

  const updateBooking = (b: Booking) =>
    setBookings((prev) => prev.map((x) => (x.id === b.id ? b : x)))
  const deleteBooking = (id: string) =>
    setBookings((prev) => prev.filter((x) => x.id !== id))

  const addCalendarBlock = (b: CalendarBlock) =>
    setCalendarBlocks((prev) => [...prev, attachOrg(b)])
  const deleteCalendarBlock = (id: string) =>
    setCalendarBlocks((prev) => prev.filter((x) => x.id !== id))

  const addMessageTemplate = (t: MessageTemplate) =>
    setMessageTemplates((prev) => [...prev, attachOrg(t)])
  const updateMessageTemplate = (t: MessageTemplate) =>
    setMessageTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)))
  const deleteMessageTemplate = (id: string) =>
    setMessageTemplates((prev) => prev.filter((x) => x.id !== id))

  const updateAutomationRule = (r: AutomationRule) =>
    setAutomationRules((prev) => prev.map((x) => (x.id === r.id ? r : x)))

  const addUser = (u: User) => setUsers((prev) => [...prev, attachOrg(u)])
  const updateUser = (u: User) =>
    setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)))
  const deleteUser = (id: string) =>
    setUsers((prev) => prev.filter((x) => x.id !== id))

  const updatePaymentIntegration = (i: PaymentIntegration) =>
    setPaymentIntegrations(
      paymentIntegrations.map((x) => (x.provider === i.provider ? i : x)),
    )
  const updateFinancialSettings = (s: FinancialSettings) =>
    setFinancialSettings(s)
  const uploadBankStatement = (s: BankStatement) =>
    setBankStatements((prev) => [...prev, s])

  const addLedgerEntry = (e: LedgerEntry) =>
    setLedgerEntries((prev) => [...prev, attachOrg(e)])
  const updateLedgerEntry = (e: LedgerEntry) => {
    setLedgerEntries((prev) => {
      const existing = prev.find((x) => x.id === e.id)
      let updated = prev.map((x) => (x.id === e.id ? e : x))

      if (
        existing &&
        existing.status !== 'cleared' &&
        e.status === 'cleared' &&
        e.isRecurring &&
        !e.nextRecurrenceGenerated
      ) {
        const nextDate = new Date(e.date)
        if (e.recurrenceFrequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1)
        } else if (e.recurrenceFrequency === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1)
        }

        const nextEntry: LedgerEntry = {
          ...e,
          id: `ledg-rec-${Date.now()}`,
          date: nextDate.toISOString(),
          status: 'pending',
          nextRecurrenceGenerated: false,
        }

        updated = updated.map((x) =>
          x.id === e.id ? { ...x, nextRecurrenceGenerated: true } : x,
        )
        updated.push(nextEntry)
      }

      return updated
    })
  }
  const deleteLedgerEntry = (id: string) =>
    setLedgerEntries((prev) => prev.filter((x) => x.id !== id))

  const addAuditLog = (l: any) =>
    setAuditLogs((prev) => [
      ...prev,
      attachOrg({
        ...l,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }),
    ])
  const addGenericServiceRate = (r: ServiceRate) =>
    setGenericServiceRates((prev) => [...prev, attachOrg(r)])
  const updateGenericServiceRate = (r: ServiceRate) =>
    setGenericServiceRates((prev) => prev.map((x) => (x.id === r.id ? r : x)))
  const deleteGenericServiceRate = (id: string) =>
    setGenericServiceRates((prev) => prev.filter((x) => x.id !== id))
  const addServiceCategory = (c: ServiceCategory) =>
    setServiceCategories((prev) => [...prev, attachOrg(c)])
  const updateServiceCategory = (c: ServiceCategory) =>
    setServiceCategories((prev) => prev.map((x) => (x.id === c.id ? c : x)))
  const deleteServiceCategory = (id: string) =>
    setServiceCategories((prev) => prev.filter((x) => x.id !== id))
  const addNotification = (n: any) =>
    setNotifications((prev) => [
      ...prev,
      attachOrg({
        ...n,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      }),
    ])
  const markNotificationAsRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((x) => (x.id === id ? { ...x, read: true } : x)),
    )
  const approveUser = (id: string) =>
    setUsers((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: 'active' } : x)),
    )
  const blockUser = (id: string) =>
    setUsers((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: 'blocked' } : x)),
    )

  const renewTenantContract = (
    id: string,
    end: string,
    val: number,
    start?: string,
    contractDoc?: GenericDocument,
  ) => {
    setTenants((prev) =>
      prev.map((x) => {
        if (x.id === id) {
          const docs = contractDoc
            ? [...(x.documents || []), contractDoc]
            : x.documents
          return {
            ...x,
            leaseEnd: end,
            rentValue: val,
            leaseStart: start || x.leaseStart,
            negotiationStatus: 'closed',
            documents: docs,
          }
        }
        return x
      }),
    )
  }

  const updateTenantNegotiation = (id: string, d: any) =>
    setTenants((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x)))

  const addAdvertisement = (a: Advertisement) =>
    setAdvertisements((prev) => [...prev, attachOrg(a)])
  const updateAdvertisement = (a: Advertisement) =>
    setAdvertisements((prev) => prev.map((x) => (x.id === a.id ? a : x)))
  const deleteAdvertisement = (id: string) =>
    setAdvertisements((prev) => prev.filter((x) => x.id !== id))
  const addAdvertiser = (a: Advertiser) =>
    setAdvertisers((prev) => [...prev, attachOrg(a)])
  const updateAdvertiser = (a: Advertiser) =>
    setAdvertisers((prev) => prev.map((x) => (x.id === a.id ? a : x)))
  const deleteAdvertiser = (id: string) =>
    setAdvertisers((prev) => prev.filter((x) => x.id !== id))
  const updateAdPricing = (p: AdPricing) => setAdPricingState(p)

  const addVisit = (v: Visit) => setVisits((prev) => [...prev, attachOrg(v)])
  const updateVisit = (v: Visit) =>
    setVisits((prev) => prev.map((x) => (x.id === v.id ? v : x)))
  const deleteVisit = (id: string) =>
    setVisits((prev) => prev.filter((x) => x.id !== id))

  const addWorkflow = (w: Workflow) =>
    setWorkflows((prev) => [...prev, attachOrg(w)])
  const updateWorkflow = (w: Workflow) =>
    setWorkflows((prev) => prev.map((x) => (x.id === w.id ? w : x)))
  const deleteWorkflow = (id: string) =>
    setWorkflows((prev) => prev.filter((x) => x.id !== id))

  const runNightAudit = () => {}
  const markPaymentAs = () => {}
  const addTaskImage = () => {}
  const addTaskEvidence = () => {}
  const notifySupplier = () => {}
  const setTyping = () => {}
  const startChat = () => {}
  const sendMessage = (contactId: string, text: string) => {
    setAllMessages((prev) =>
      prev.map((m) =>
        m.contactId === contactId
          ? {
              ...m,
              lastMessage: text,
              time: new Date().toISOString(),
              history: [
                ...m.history,
                {
                  id: `hist_${Date.now()}`,
                  text,
                  senderId: currentUserObj?.id || 'system',
                  timestamp: new Date().toISOString(),
                  read: true,
                },
              ],
            }
          : m,
      ),
    )
  }
  const markAsRead = () => {}
  const startTour = () => setIsTourOpen(true)
  const endTour = () => setIsTourOpen(false)
  const nextStep = () => setCurrentStepIndex(currentStepIndex + 1)
  const prevStep = () => setCurrentStepIndex(currentStepIndex - 1)
  const openVideo = (url: string) => setActiveVideo(url)
  const closeVideo = () => setActiveVideo(null)

  const addFeedback = (f: Feedback) =>
    setFeedbacks((prev) => [...prev, attachOrg(f)])
  const updateFeedback = (f: Feedback) =>
    setFeedbacks((prev) => prev.map((x) => (x.id === f.id ? f : x)))
  const addChannelMapping = (m: ChannelMapping) =>
    setChannelMappings((prev) => [...prev, attachOrg(m)])
  const updateChannelMapping = (m: ChannelMapping) =>
    setChannelMappings((prev) => prev.map((x) => (x.id === m.id ? m : x)))
  const deleteChannelMapping = (id: string) =>
    setChannelMappings((prev) => prev.filter((x) => x.id !== id))
  const addMarketingWorkflow = (w: MarketingWorkflow) =>
    setMarketingWorkflows((prev) => [...prev, attachOrg(w)])
  const updateMarketingWorkflow = (w: MarketingWorkflow) =>
    setMarketingWorkflows((prev) => prev.map((x) => (x.id === w.id ? w : x)))
  const deleteMarketingWorkflow = (id: string) =>
    setMarketingWorkflows((prev) => prev.filter((x) => x.id !== id))
  const addEmailTemplate = (t: EmailTemplate) =>
    setEmailTemplates((prev) => [...prev, attachOrg(t)])
  const updateEmailTemplate = (t: EmailTemplate) =>
    setEmailTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)))
  const deleteEmailTemplate = (id: string) =>
    setEmailTemplates((prev) => prev.filter((x) => x.id !== id))

  const updateRolePermissions = useCallback(
    (role: UserRole, resource: Resource, actions: Action[]) => {
      setRolePermissions((prev) => ({
        ...prev,
        [role]: {
          ...prev[role],
          [resource]: actions,
        },
      }))
    },
    [],
  )

  const checkPermission = useCallback(
    async (user: any, resource: Resource, action: Action) => {
      if (!user || !user.role) return false

      if (user.role === 'platform_owner') return true

      if (user.permissions && user.permissions.length > 0) {
        const override = user.permissions.find(
          (p: Permission) => p.resource === resource,
        )
        if (override) {
          return override.actions.includes(action)
        }
      }

      const rolePerms = rolePermissions[user.role as UserRole]
      if (!rolePerms) return false

      const resourcePerms = rolePerms[resource]
      if (!resourcePerms) return false

      return resourcePerms.includes(action)
    },
    [rolePermissions],
  )

  const hasPermissionSync = useCallback(
    (user: any, resource: Resource, action: Action) => {
      if (!user || !user.role) return false

      if (user.role === 'platform_owner') return true

      if (user.permissions && user.permissions.length > 0) {
        const override = user.permissions.find(
          (p: Permission) => p.resource === resource,
        )
        if (override) {
          return override.actions.includes(action)
        }
      }

      const rolePerms = rolePermissions[user.role as UserRole]
      if (!rolePerms) return false

      const resourcePerms = rolePerms[resource]
      if (!resourcePerms) return false

      return resourcePerms.includes(action)
    },
    [rolePermissions],
  )

  const executeWorkflow = useCallback(
    (workflow: Workflow, targetPropertyIds?: string[]) => {
      const propertyIds =
        targetPropertyIds && targetPropertyIds.length > 0
          ? targetPropertyIds
          : workflow.propertyIds && workflow.propertyIds.length > 0
            ? workflow.propertyIds
            : []

      if (propertyIds.length === 0) return

      let tasksCreated = 0

      propertyIds.forEach((propertyId) => {
        const property = properties.find((p) => p.id === propertyId)
        if (!property) return

        workflow.steps.forEach((step, index) => {
          if (step.actionType === 'task') {
            let assigneeName = getRoleName(step.role)
            let assigneeId = undefined
            let assignedRole = step.role

            const linkedPartner = partners.find(
              (p) =>
                p.linkedPropertyIds?.includes(propertyId) &&
                (step.name.toLowerCase().includes('clean')
                  ? p.type === 'cleaning'
                  : p.type === 'maintenance'),
            )

            if (linkedPartner) {
              assigneeName = linkedPartner.name
              assigneeId = linkedPartner.id
            }

            let priority: Task['priority'] = 'medium'
            let isBackToBack = false

            const today = new Date().toISOString().split('T')[0]
            const checkOutToday = bookings.find(
              (b) => b.propertyId === propertyId && b.checkOut === today,
            )
            const checkInToday = bookings.find(
              (b) => b.propertyId === propertyId && b.checkIn === today,
            )

            if (checkOutToday && checkInToday) {
              priority = 'critical'
              isBackToBack = true
            }

            const newTask: Task = attachOrg({
              id: `wf_task_${Date.now()}_${workflow.id}_${propertyId}_${index}`,
              title: step.name,
              description:
                step.description ||
                `Auto-generated from workflow: ${workflow.name}`,
              propertyId: propertyId,
              propertyName: property.name || 'Unknown',
              propertyAddress: property.address,
              propertyCommunity: property.community,
              status: 'pending',
              type: step.name.toLowerCase().includes('clean')
                ? 'cleaning'
                : 'maintenance',
              priority: priority,
              date: new Date().toISOString(),
              assignee: assigneeName,
              assigneeId: assigneeId,
              assignedRole: assignedRole,
              source: 'automation',
              backToBack: isBackToBack,
              createdBy: currentUserObj?.id || 'system',
            })

            setTasks((prev) => [...prev, newTask])
            tasksCreated++
          }
        })
      })

      if (tasksCreated > 0) {
        toast({
          title: 'Workflow Executed',
          description: `${tasksCreated} tasks created across ${propertyIds.length} properties.`,
        })
      }
    },
    [properties, partners, bookings, toast, currentUserObj, attachOrg],
  )

  const runWorkflows = useCallback(
    (trigger: string, context?: any) => {
      const activeWorkflows = scopedWorkflows.filter(
        (wf) => wf.active && wf.trigger === trigger,
      )

      if (activeWorkflows.length === 0) return

      let propertyId = context?.property?.id || context?.booking?.propertyId

      if (propertyId) {
        activeWorkflows.forEach((wf) => {
          if (wf.propertyIds && wf.propertyIds.length > 0) {
            if (!wf.propertyIds.includes(propertyId)) return
          }
          executeWorkflow(wf, [propertyId])
        })
      } else {
        activeWorkflows.forEach((wf) => {
          executeWorkflow(wf)
        })
      }
    },
    [scopedWorkflows, executeWorkflow],
  )

  const seedDatabase = useCallback((data: any) => {
    if (data.users?.length) setUsers((prev) => [...prev, ...data.users])
    if (data.properties?.length)
      setProperties((prev) => [...prev, ...data.properties])
    if (data.owners?.length) setOwners((prev) => [...prev, ...data.owners])
    if (data.partners?.length)
      setPartners((prev) => [...prev, ...data.partners])
    if (data.tenants?.length) setTenants((prev) => [...prev, ...data.tenants])
    if (data.bookings?.length)
      setBookings((prev) => [...prev, ...data.bookings])
    if (data.tasks?.length) setTasks((prev) => [...prev, ...data.tasks])
    if (data.ledgerEntries?.length)
      setLedgerEntries((prev) => [...prev, ...data.ledgerEntries])
    if (data.invoices?.length)
      setFinancials((prev) => ({
        ...prev,
        invoices: [...prev.invoices, ...data.invoices],
      }))
  }, [])

  return (
    <AppContext.Provider
      value={{
        properties: scopedProperties,
        condominiums: scopedCondominiums,
        hotels: scopedHotels,
        towers: scopedTowers,
        tasks: scopedTasks,
        financials: scopedFinancials,
        messages: visibleMessages,
        tenants: scopedTenants,
        owners: scopedOwners,
        partners: scopedPartners,
        bookings: scopedBookings,
        calendarBlocks,
        messageTemplates,
        automationRules: scopedAutomationRules,
        workflows: scopedWorkflows,
        currentUser: currentUserObj,
        allUsers,
        users: scopedUsers,
        isAuthenticated,
        isAuthLoading,
        paymentIntegrations,
        financialSettings,
        bankStatements,
        ledgerEntries: scopedLedgerEntries,
        auditLogs,
        genericServiceRates,
        serviceCategories,
        notifications,
        advertisements,
        advertisers,
        adPricing,
        language,
        currency,
        typingStatus,
        selectedPropertyId,
        visits: scopedVisits,
        nightAudits,
        guestServices: scopedGuestServices,
        posItems: scopedPosItems,
        posTransactions: scopedPosTransactions,
        promotions: scopedPromotions,
        campaigns: scopedCampaigns,
        serviceOrders,
        feedbacks,
        channelMappings,
        marketingWorkflows,
        emailTemplates,
        isTourOpen,
        currentStepIndex,
        tourSteps: initialTourSteps,
        tutorialModules: initialTutorialModules,
        activeVideo,
        rolePermissions,
        updateRolePermissions,
        checkPermission,
        hasPermissionSync,
        simulationMode,
        setSimulationMode,
        simulationRole,
        setSimulationRole,
        setLanguage,
        setSelectedPropertyId,
        t,
        formatAppCurrency,
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
        deleteInvoice,
        markPaymentAs,
        addTaskImage,
        addTaskEvidence,
        sendMessage,
        markAsRead,
        startChat,
        setTyping,
        addTenant,
        updateTenant,
        addOwner,
        updateOwner,
        addPartner,
        updatePartner,
        deletePartner,
        addBooking,
        updateBooking,
        deleteBooking,
        addCalendarBlock,
        deleteCalendarBlock,
        addMessageTemplate,
        updateMessageTemplate,
        deleteMessageTemplate,
        setCurrentUser,
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
        runNightAudit,
        addGuestService,
        updateGuestService,
        deleteGuestService,
        addServiceOrder,
        addPosItem,
        updatePosItem,
        deletePosItem,
        addPosTransaction,
        addPromotion,
        updatePromotion,
        deletePromotion,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        startTour,
        endTour,
        nextStep,
        prevStep,
        openVideo,
        closeVideo,
        addFeedback,
        updateFeedback,
        addChannelMapping,
        updateChannelMapping,
        deleteChannelMapping,
        addMarketingWorkflow,
        updateMarketingWorkflow,
        deleteMarketingWorkflow,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        runWorkflows,
        executeWorkflow,
        seedDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
