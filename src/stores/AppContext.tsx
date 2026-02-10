// ... existing imports
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
import { isSameDay, parseISO } from 'date-fns'

interface AppContextType {
  // Existing props
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
  nightAudits: NightAudit[]

  // New props
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

  // Tour Props
  isTourOpen: boolean
  currentStepIndex: number
  tourSteps: TourStep[]
  tutorialModules: TutorialModule[]
  activeVideo: string | null

  // Methods
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
  runNightAudit: () => void

  // New Methods
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

  // Automation
  runWorkflows: (trigger: string, context?: any) => void
  executeWorkflow: (workflow: Workflow, targetPropertyIds?: string[]) => void

  startTour: () => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  openVideo: (videoUrl: string) => void
  closeVideo: () => void
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

  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem('app_owners')
    return saved ? JSON.parse(saved) : initialOwners
  })

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

  // New State
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
  // Defaulting isAuthenticated to true to fulfill user story access requirement
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [currentUser, setCurrentUserObj] = useState<
    User | Owner | Partner | Tenant
  >(systemUsers[0])

  // Tour State
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  const { toast } = useToast()

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
        resolveKey(translations['en'], key) ||
        key
      if (params) {
        Object.entries(params).forEach(([pkey, pval]) => {
          text = text.replace(`{${pkey}}`, pval)
        })
      }
      return text
    },
    [language],
  )

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
  const logout = () => setIsAuthenticated(false)
  const setCurrentUser = (id: string) => {
    const u = allUsers.find((u) => u.id === id)
    if (u) setCurrentUserObj(u)
  }
  const addProperty = (p: Property) => setProperties([...properties, p])
  const updateProperty = (p: Property) =>
    setProperties(properties.map((x) => (x.id === p.id ? p : x)))
  const deleteProperty = (id: string) =>
    setProperties(properties.filter((x) => x.id !== id))
  const addCondominium = (c: Condominium) =>
    setCondominiums([...condominiums, c])
  const updateCondominium = (c: Condominium) =>
    setCondominiums(condominiums.map((x) => (x.id === c.id ? c : x)))
  const deleteCondominium = (id: string) =>
    setCondominiums(condominiums.filter((x) => x.id !== id))
  const addHotel = (h: Hotel) => setHotels([...hotels, h])
  const updateHotel = (h: Hotel) =>
    setHotels(hotels.map((x) => (x.id === h.id ? h : x)))
  const deleteHotel = (id: string) =>
    setHotels(hotels.filter((x) => x.id !== id))
  const addTower = (t: Tower) => setTowers([...towers, t])
  const updateTower = (t: Tower) =>
    setTowers(towers.map((x) => (x.id === t.id ? t : x)))
  const deleteTower = (id: string) =>
    setTowers(towers.filter((x) => x.id !== id))
  const addTask = (t: Task) => setTasks([...tasks, t])
  const updateTask = (t: Task) =>
    setTasks(tasks.map((x) => (x.id === t.id ? t : x)))
  const deleteTask = (id: string) => setTasks(tasks.filter((x) => x.id !== id))
  const updateTaskStatus = (id: string, status: Task['status']) =>
    updateTask({ ...tasks.find((t) => t.id === id)!, status })
  const approveTask = (id: string) => updateTaskStatus(id, 'pending')
  const rejectTask = (id: string) => updateTaskStatus(id, 'rejected')
  const addInvoice = (i: Invoice) =>
    setFinancials((prev) => ({ ...prev, invoices: [...prev.invoices, i] }))
  const updateInvoice = (i: Invoice) =>
    setFinancials((prev) => ({
      ...prev,
      invoices: prev.invoices.map((x) => (x.id === i.id ? i : x)),
    }))
  const addGuestService = (s: GuestService) =>
    setGuestServices([...guestServices, s])
  const updateGuestService = (s: GuestService) =>
    setGuestServices(guestServices.map((x) => (x.id === s.id ? s : x)))
  const deleteGuestService = (id: string) =>
    setGuestServices(guestServices.filter((x) => x.id !== id))
  const addServiceOrder = (o: ServiceOrder) =>
    setServiceOrders([...serviceOrders, o])
  const addPosItem = (i: PosItem) => setPosItems([...posItems, i])
  const updatePosItem = (i: PosItem) =>
    setPosItems(posItems.map((x) => (x.id === i.id ? i : x)))
  const deletePosItem = (id: string) =>
    setPosItems(posItems.filter((x) => x.id !== id))
  const addPosTransaction = (t: PosTransaction) =>
    setPosTransactions([...posTransactions, t])
  const addPromotion = (p: Promotion) => setPromotions([...promotions, p])
  const updatePromotion = (p: Promotion) =>
    setPromotions(promotions.map((x) => (x.id === p.id ? p : x)))
  const deletePromotion = (id: string) =>
    setPromotions(promotions.filter((x) => x.id !== id))
  const addCampaign = (c: Campaign) => setCampaigns([...campaigns, c])
  const updateCampaign = (c: Campaign) =>
    setCampaigns(campaigns.map((x) => (x.id === c.id ? c : x)))
  const deleteCampaign = (id: string) =>
    setCampaigns(campaigns.filter((x) => x.id !== id))
  const addTenant = (t: Tenant) => setTenants([...tenants, t])
  const updateTenant = (t: Tenant) =>
    setTenants(tenants.map((x) => (x.id === t.id ? t : x)))
  const addOwner = (o: Owner) => setOwners([...owners, o])
  const updateOwner = (o: Owner) =>
    setOwners(owners.map((x) => (x.id === o.id ? o : x)))
  const addPartner = (p: Partner) => setPartners([...partners, p])
  const updatePartner = (p: Partner) =>
    setPartners(partners.map((x) => (x.id === p.id ? p : x)))
  const addBooking = (b: Booking) => setBookings([...bookings, b])
  const updateBooking = (b: Booking) =>
    setBookings(bookings.map((x) => (x.id === b.id ? b : x)))
  const deleteBooking = (id: string) =>
    setBookings(bookings.filter((x) => x.id !== id))
  const addCalendarBlock = (b: CalendarBlock) =>
    setCalendarBlocks([...calendarBlocks, b])
  const deleteCalendarBlock = (id: string) =>
    setCalendarBlocks(calendarBlocks.filter((x) => x.id !== id))
  const addMessageTemplate = (t: MessageTemplate) =>
    setMessageTemplates([...messageTemplates, t])
  const updateMessageTemplate = (t: MessageTemplate) =>
    setMessageTemplates(messageTemplates.map((x) => (x.id === t.id ? t : x)))
  const deleteMessageTemplate = (id: string) =>
    setMessageTemplates(messageTemplates.filter((x) => x.id !== id))
  const updateAutomationRule = (r: AutomationRule) =>
    setAutomationRules(automationRules.map((x) => (x.id === r.id ? r : x)))
  const addUser = (u: User) => setUsers([...users, u])
  const updateUser = (u: User) =>
    setUsers(users.map((x) => (x.id === u.id ? u : x)))
  const deleteUser = (id: string) => setUsers(users.filter((x) => x.id !== id))
  const updatePaymentIntegration = (i: PaymentIntegration) =>
    setPaymentIntegrations(
      paymentIntegrations.map((x) => (x.provider === i.provider ? i : x)),
    )
  const updateFinancialSettings = (s: FinancialSettings) =>
    setFinancialSettings(s)
  const uploadBankStatement = (s: BankStatement) =>
    setBankStatements([...bankStatements, s])
  const addLedgerEntry = (e: LedgerEntry) =>
    setLedgerEntries([...ledgerEntries, e])
  const updateLedgerEntry = (e: LedgerEntry) =>
    setLedgerEntries(ledgerEntries.map((x) => (x.id === e.id ? e : x)))
  const deleteLedgerEntry = (id: string) =>
    setLedgerEntries(ledgerEntries.filter((x) => x.id !== id))
  const addAuditLog = (l: any) =>
    setAuditLogs([
      ...auditLogs,
      { ...l, id: Date.now().toString(), timestamp: new Date().toISOString() },
    ])
  const addGenericServiceRate = (r: ServiceRate) =>
    setGenericServiceRates([...genericServiceRates, r])
  const updateGenericServiceRate = (r: ServiceRate) =>
    setGenericServiceRates(
      genericServiceRates.map((x) => (x.id === r.id ? r : x)),
    )
  const deleteGenericServiceRate = (id: string) =>
    setGenericServiceRates(genericServiceRates.filter((x) => x.id !== id))
  const addServiceCategory = (c: ServiceCategory) =>
    setServiceCategories([...serviceCategories, c])
  const updateServiceCategory = (c: ServiceCategory) =>
    setServiceCategories(serviceCategories.map((x) => (x.id === c.id ? c : x)))
  const deleteServiceCategory = (id: string) =>
    setServiceCategories(serviceCategories.filter((x) => x.id !== id))
  const addNotification = (n: any) =>
    setNotifications((prev) => [
      ...prev,
      {
        ...n,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      },
    ])
  const markNotificationAsRead = (id: string) =>
    setNotifications(
      notifications.map((x) => (x.id === id ? { ...x, read: true } : x)),
    )
  const approveUser = (id: string) =>
    setUsers(users.map((x) => (x.id === id ? { ...x, status: 'active' } : x)))
  const blockUser = (id: string) =>
    setUsers(users.map((x) => (x.id === id ? { ...x, status: 'blocked' } : x)))
  const renewTenantContract = (id: string, end: string, val: number) =>
    setTenants(
      tenants.map((x) =>
        x.id === id ? { ...x, leaseEnd: end, rentValue: val } : x,
      ),
    )
  const updateTenantNegotiation = (id: string, d: any) =>
    setTenants(tenants.map((x) => (x.id === id ? { ...x, ...d } : x)))
  const addAdvertisement = (a: Advertisement) =>
    setAdvertisements([...advertisements, a])
  const updateAdvertisement = (a: Advertisement) =>
    setAdvertisements(advertisements.map((x) => (x.id === a.id ? a : x)))
  const deleteAdvertisement = (id: string) =>
    setAdvertisements(advertisements.filter((x) => x.id !== id))
  const addAdvertiser = (a: Advertiser) => setAdvertisers([...advertisers, a])
  const updateAdvertiser = (a: Advertiser) =>
    setAdvertisements(advertisers.map((x) => (x.id === a.id ? a : x)))
  const deleteAdvertiser = (id: string) =>
    setAdvertisers(advertisers.filter((x) => x.id !== id))
  const updateAdPricing = (p: AdPricing) => setAdPricingState(p)
  const addVisit = (v: Visit) => setVisits([...visits, v])
  const updateVisit = (v: Visit) =>
    setVisits(visits.map((x) => (x.id === v.id ? v : x)))
  const deleteVisit = (id: string) =>
    setVisits(visits.filter((x) => x.id !== id))
  const addWorkflow = (w: Workflow) => setWorkflows([...workflows, w])
  const updateWorkflow = (w: Workflow) =>
    setWorkflows(workflows.map((x) => (x.id === w.id ? w : x)))
  const deleteWorkflow = (id: string) =>
    setWorkflows(workflows.filter((x) => x.id !== id))
  const runNightAudit = () => {}
  const markPaymentAs = () => {}
  const addTaskImage = () => {}
  const addTaskEvidence = () => {}
  const notifySupplier = () => {}
  const setTyping = () => {}
  const startChat = () => {}
  const sendMessage = () => {}
  const markAsRead = () => {}
  const startTour = () => setIsTourOpen(true)
  const endTour = () => setIsTourOpen(false)
  const nextStep = () => setCurrentStepIndex(currentStepIndex + 1)
  const prevStep = () => setCurrentStepIndex(currentStepIndex - 1)
  const openVideo = (url: string) => setActiveVideo(url)
  const closeVideo = () => setActiveVideo(null)
  const addFeedback = (f: Feedback) => setFeedbacks([...feedbacks, f])
  const updateFeedback = (f: Feedback) =>
    setFeedbacks(feedbacks.map((x) => (x.id === f.id ? f : x)))
  const addChannelMapping = (m: ChannelMapping) =>
    setChannelMappings([...channelMappings, m])
  const updateChannelMapping = (m: ChannelMapping) =>
    setChannelMappings(channelMappings.map((x) => (x.id === m.id ? m : x)))
  const deleteChannelMapping = (id: string) =>
    setChannelMappings(channelMappings.filter((x) => x.id !== id))
  const addMarketingWorkflow = (w: MarketingWorkflow) =>
    setMarketingWorkflows([...marketingWorkflows, w])
  const updateMarketingWorkflow = (w: MarketingWorkflow) =>
    setMarketingWorkflows(
      marketingWorkflows.map((x) => (x.id === w.id ? w : x)),
    )
  const deleteMarketingWorkflow = (id: string) =>
    setMarketingWorkflows(marketingWorkflows.filter((x) => x.id !== id))
  const addEmailTemplate = (t: EmailTemplate) =>
    setEmailTemplates([...emailTemplates, t])
  const updateEmailTemplate = (t: EmailTemplate) =>
    setEmailTemplates(emailTemplates.map((x) => (x.id === t.id ? t : x)))
  const deleteEmailTemplate = (id: string) =>
    setEmailTemplates(emailTemplates.filter((x) => x.id !== id))

  const visibleMessages = useMemo(
    () => allMessages.filter((m) => m.ownerId === currentUser.id),
    [allMessages, currentUser.id],
  )
  const allUsers = useMemo(
    () => [...users, ...owners, ...partners, ...tenants],
    [users, owners, partners, tenants],
  )

  // --- Automation Logic ---

  const executeWorkflow = useCallback(
    (workflow: Workflow, targetPropertyIds?: string[]) => {
      const propertyIds =
        targetPropertyIds && targetPropertyIds.length > 0
          ? targetPropertyIds
          : workflow.propertyIds && workflow.propertyIds.length > 0
            ? workflow.propertyIds
            : []

      // If no properties defined or passed, we can't really execute 'tasks' for generic workflows unless it's a system workflow
      // But typically property workflows need property context.
      if (propertyIds.length === 0) return

      let tasksCreated = 0

      propertyIds.forEach((propertyId) => {
        const property = properties.find((p) => p.id === propertyId)
        if (!property) return

        workflow.steps.forEach((step, index) => {
          if (step.actionType === 'task') {
            // Role & Partner Assignment Logic
            let assigneeName = getRoleName(step.role)
            let assigneeId = undefined
            let assignedRole = step.role

            // Conflict Prevention: Check for linked partner
            const linkedPartner = partners.find(
              (p) =>
                p.linkedPropertyIds?.includes(propertyId) &&
                (step.name.toLowerCase().includes('clean')
                  ? p.type === 'cleaning'
                  : p.type === 'maintenance'),
            )

            // If a partner is linked to this property for this task type, FORCE assignment to them
            if (linkedPartner) {
              assigneeName = linkedPartner.name
              assigneeId = linkedPartner.id
              // We keep assignedRole as 'partner' or whatever it was, but concrete assignee is fixed
            }

            // Critical Status Logic (Back-to-Back)
            let priority: Task['priority'] = 'medium'
            let isBackToBack = false

            // Look for bookings checking out today or recently
            // This logic is simplified for the demo. In prod, we'd check dates carefully against "now"
            // If the workflow is 'after_checkout', usually we have a booking context.
            // But here we are bulk running. Let'd assume we check for ANY back-to-back condition near today.
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

            const newTask: Task = {
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
                : 'maintenance', // Inference
              priority: priority,
              date: new Date().toISOString(),
              assignee: assigneeName,
              assigneeId: assigneeId,
              assignedRole: assignedRole,
              source: 'automation',
              backToBack: isBackToBack,
              createdBy: currentUser.id,
            }

            addTask(newTask)
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
    [properties, partners, bookings, addTask, toast, currentUser.id],
  )

  const runWorkflows = useCallback(
    (trigger: string, context?: any) => {
      // 1. Filter relevant workflows
      const activeWorkflows = workflows.filter(
        (wf) => wf.active && wf.trigger === trigger,
      )

      if (activeWorkflows.length === 0) return

      let propertyId = context?.property?.id || context?.booking?.propertyId

      // If we have a property context, just run for that property
      if (propertyId) {
        activeWorkflows.forEach((wf) => {
          // If workflow has specific properties, respect that constraint
          if (wf.propertyIds && wf.propertyIds.length > 0) {
            if (!wf.propertyIds.includes(propertyId)) return // Skip if this workflow doesn't apply to this property
          }
          executeWorkflow(wf, [propertyId])
        })
      } else {
        // Global Trigger (no specific property context passed, maybe 'manual' without selection)
        // We run for all configured properties of the matching workflows
        activeWorkflows.forEach((wf) => {
          executeWorkflow(wf) // Will use wf.propertyIds inside
        })
      }
    },
    [workflows, executeWorkflow],
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
        nightAudits,
        guestServices,
        posItems,
        posTransactions,
        promotions,
        campaigns,
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
        startChat,
        setTyping,
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

