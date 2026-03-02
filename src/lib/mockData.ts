import {
  Property,
  Task,
  Financials,
  Message,
  Tenant,
  Owner,
  Partner,
  User,
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
  Booking,
  CalendarBlock,
  MessageTemplate,
  ServiceCategory,
  Visit,
  Workflow,
  Hotel,
  Tower,
  TourStep,
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
} from './types'

export const mockAdvertisers: Advertiser[] = [
  {
    id: 'adv1',
    name: 'Home Services LLC',
    email: 'contact@homeservices.com',
    phone: '555-1234',
    address: '123 Main St',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'adv2',
    name: 'Orlando Cleaners',
    email: 'sales@orlandoclean.com',
    phone: '555-5678',
    address: '456 Oak Ave',
    createdAt: '2023-02-15T00:00:00Z',
  },
]

export const mockAdPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
  placementModifiers: {
    home_top: 20,
    home_bottom: 10,
    partner_page: 5,
    tenant_page: 15,
    performance: 25,
  },
}

export const defaultFinancialSettings: FinancialSettings = {
  companyName: 'COREPM Inc',
  ein: '12-3456789',
  bankName: 'Chase',
  routingNumber: '122000248',
  accountNumber: '1234567890',
  gatewayProvider: 'stripe',
  gateways: {
    stripe: { enabled: true },
    paypal: { enabled: false },
    mercadoPago: { enabled: false },
  },
  isProduction: false,
  globalCurrency: 'USD',
}

export const systemUsers: User[] = [
  {
    id: 'user1',
    name: 'Admin User',
    email: 'admin@corepm.com',
    role: 'platform_owner',
    status: 'active',
    isFirstLogin: false,
  },
  {
    id: 'user2',
    name: 'Property Manager',
    email: 'pm@corepm.com',
    role: 'software_tenant',
    status: 'active',
    isFirstLogin: false,
  },
  {
    id: 'owner1',
    name: 'John Investor',
    email: 'john@investor.com',
    role: 'property_owner',
    status: 'active',
    isFirstLogin: false,
  },
]

export const condominiums: Condominium[] = [
  {
    id: 'condo1',
    name: 'Sunset Villas',
    address: '123 Sunset Blvd',
    city: 'Orlando',
    state: 'FL',
    country: 'US',
    managerName: 'Mike Johnson',
    managerPhone: '+1 555-0192',
    accessCredentials: { gate: '1234', poolCode: '9988' },
  },
]

export const hotels: Hotel[] = [
  {
    id: 'hotel1',
    name: 'Grand Resort Orlando',
    address: '1000 Resort Way',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32819',
    country: 'US',
    managerName: 'Sarah Resort',
    towers: ['t1', 't2'],
  },
]

export const towers: Tower[] = [
  { id: 't1', hotelId: 'hotel1', name: 'North Tower', floors: 15 },
  { id: 't2', hotelId: 'hotel1', name: 'South Tower', floors: 12 },
]

export const properties: Property[] = [
  {
    id: 'p1',
    name: 'Villa 101 - Sunset Resort',
    address: '101 Resort Way',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32819',
    country: 'US',
    type: 'House',
    profileType: 'short_term',
    community: 'Sunset Villas',
    condominiumId: 'condo1',
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    ownerId: 'owner1',
    image: 'https://img.usecurling.com/p/600/400?q=villa',
    listingPrice: 250,
    hoaValue: 400,
  },
  {
    id: 'p2',
    name: 'Room 501 - Grand Resort',
    address: '1000 Resort Way',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32819',
    country: 'US',
    type: 'Hotel Room',
    profileType: 'short_term',
    community: 'Grand Resort Orlando',
    hotelId: 'hotel1',
    towerId: 't1',
    roomNumber: '501',
    status: 'occupied',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    ownerId: 'owner1',
    image: 'https://img.usecurling.com/p/600/400?q=hotel%20room',
    listingPrice: 150,
    hoaValue: 0,
  },
]

export const tenants: Tenant[] = [
  {
    id: 't1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '555-0101',
    status: 'active',
    role: 'tenant',
    rentValue: 2000,
    leaseEnd: '2024-12-31',
  },
]

export const owners: Owner[] = [
  {
    id: 'owner1',
    name: 'John Investor',
    email: 'john@investor.com',
    phone: '555-0202',
    status: 'active',
    role: 'property_owner',
  },
]

export const partners: Partner[] = [
  {
    id: 'partner1',
    name: 'Elite Cleaning',
    type: 'cleaning',
    email: 'contact@eliteclean.com',
    phone: '555-0303',
    status: 'active',
    role: 'partner',
  },
]

export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Post-Checkout Cleaning',
    propertyId: 'p1',
    propertyName: 'Villa 101 - Sunset Resort',
    status: 'pending',
    type: 'cleaning',
    assignee: 'Elite Cleaning',
    assigneeId: 'partner1',
    date: new Date().toISOString(),
    priority: 'high',
  },
]

export const ledgerEntries: LedgerEntry[] = [
  {
    id: 'le1',
    propertyId: 'p1',
    date: new Date().toISOString(),
    type: 'income',
    category: 'Rent',
    amount: 2500,
    description: 'Monthly Rent - Alice',
    status: 'cleared',
  },
]

export const financials: Financials = {
  revenue: [
    { month: 'Jan', value: 5000 },
    { month: 'Feb', value: 5500 },
    { month: 'Mar', value: 6000 },
  ],
  expenses: [
    { category: 'Maintenance', value: 1200, fill: '#ef4444' },
    { category: 'Cleaning', value: 800, fill: '#3b82f6' },
    { category: 'Taxes', value: 400, fill: '#eab308' },
  ],
  invoices: [],
  payments: [],
}

export const messages: Message[] = [
  {
    id: 'm1',
    contact: 'Alice Smith',
    contactId: 't1',
    ownerId: 'user1',
    lastMessage: 'Thanks for the quick fix!',
    time: new Date().toISOString(),
    unread: 0,
    avatar: '',
    history: [],
  },
]

export const defaultPaymentIntegrations: PaymentIntegration[] = []
export const mockBankStatements: BankStatement[] = []
export const auditLogs: AuditLog[] = []
export const genericServiceRates: ServiceRate[] = []
export const notifications: Notification[] = []
export const advertisements: Advertisement[] = []
export const bookings: Booking[] = []
export const calendarBlocks: CalendarBlock[] = []
export const messageTemplates: MessageTemplate[] = []
export const serviceCategories: ServiceCategory[] = []
export const visits: Visit[] = []
export const workflows: Workflow[] = []
export const tourSteps: TourStep[] = []
export const guestServices: GuestService[] = []
export const posItems: PosItem[] = []
export const posTransactions: PosTransaction[] = []
export const promotions: Promotion[] = []
export const campaigns: Campaign[] = []
export const serviceOrders: ServiceOrder[] = []
export const feedbacks: Feedback[] = []
export const channelMappings: ChannelMapping[] = []
export const marketingWorkflows: MarketingWorkflow[] = []
export const emailTemplates: EmailTemplate[] = []

export const automationRules: AutomationRule[] = [
  {
    id: 'rule1',
    type: 'auto_generate_invoice',
    enabled: true,
    event: 'task_completion',
  },
]

export const marketAnalysisData = {
  marketTrends: [
    { month: 'Jan', rate: 120, occupancy: 65 },
    { month: 'Feb', rate: 130, occupancy: 70 },
    { month: 'Mar', rate: 145, occupancy: 80 },
  ],
}
