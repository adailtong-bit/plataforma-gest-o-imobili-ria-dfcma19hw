import {
  subDays,
  addDays,
  startOfMonth,
  subMonths,
  endOfMonth,
  eachMonthOfInterval,
  subMonths as subMonthsFn,
  addMonths,
} from 'date-fns'
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
  Workflow,
  MarketData,
  Advertisement,
  Advertiser,
  AdPricing,
  Booking,
  CalendarBlock,
  MessageTemplate,
  InventoryItem,
  ChatMessage,
  InventoryMedia,
  ServiceCategory,
  Invoice,
  Lead,
  Visit,
  Payment,
  FixedExpense,
  PartnerEmployee,
  WorkflowStep,
} from '@/lib/types'

// Helpers
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

// --- 1. USERS & ENTITIES ---

export const systemUsers: User[] = [
  {
    id: 'user_admin',
    name: 'Admin User',
    email: 'admin@corepm.com',
    role: 'platform_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    status: 'active',
    isFirstLogin: false,
    permissions: [
      {
        resource: 'dashboard',
        actions: ['view', 'create', 'edit', 'delete'],
      },
    ],
  },
  {
    id: 'user_pm',
    name: 'Property Manager',
    email: 'pm@corepm.com',
    role: 'software_tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    status: 'active',
    isFirstLogin: false,
  },
]

export const owners: Owner[] = [
  {
    id: 'owner_1',
    name: 'Robert Smith',
    email: 'robert@example.com',
    phone: '+1 555-0101',
    status: 'active',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    accountNumber: '123456789',
    documents: [],
  },
  {
    id: 'owner_2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 555-0102',
    status: 'active',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
    documents: [],
  },
]

export const tenants: Tenant[] = [
  {
    id: 'tenant_1',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 555-0201',
    status: 'active',
    role: 'tenant',
    rentValue: 2500,
    leaseStart: subMonths(new Date(), 6).toISOString(),
    leaseEnd: addMonths(new Date(), 6).toISOString(),
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
    propertyId: 'prop_1',
    documents: [],
  },
  {
    id: 'tenant_2',
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '+1 555-0202',
    status: 'active',
    role: 'tenant',
    rentValue: 1800,
    leaseStart: subMonths(new Date(), 2).toISOString(),
    leaseEnd: addMonths(new Date(), 10).toISOString(),
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=6',
    propertyId: 'prop_2',
    documents: [],
  },
]

export const partners: Partner[] = [
  {
    id: 'partner_1',
    name: 'Quick Fix Maintenance',
    type: 'maintenance',
    email: 'fix@quickfix.com',
    phone: '+1 555-0301',
    status: 'active',
    role: 'partner',
    avatar: 'https://img.usecurling.com/i?q=wrench&color=blue',
    serviceRates: [],
  },
  {
    id: 'partner_2',
    name: 'Sparkle Cleaning',
    type: 'cleaning',
    email: 'clean@sparkle.com',
    phone: '+1 555-0302',
    status: 'active',
    role: 'partner',
    avatar: 'https://img.usecurling.com/i?q=broom&color=green',
    serviceRates: [],
  },
]

// --- 2. PROPERTIES & CONDOS ---

export const condominiums: Condominium[] = [
  {
    id: 'condo_1',
    name: 'Sunset Heights',
    address: '123 Sunset Blvd',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    hoaFee: 350,
    hoaFrequency: 'monthly',
  },
  {
    id: 'condo_2',
    name: 'Ocean View',
    address: '456 Ocean Dr',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    hoaFee: 500,
    hoaFrequency: 'monthly',
  },
]

export const properties: Property[] = [
  {
    id: 'prop_1',
    name: 'Sunny Villa',
    address: '101 Palm Tree Way',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    type: 'House',
    profileType: 'long_term',
    community: 'Sunset Heights',
    condominiumId: 'condo_1',
    status: 'rented',
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    image: 'https://img.usecurling.com/p/400/300?q=modern%20house',
    ownerId: 'owner_1',
    listingPrice: 450000,
    hoaValue: 350,
  },
  {
    id: 'prop_2',
    name: 'Downtown Apt',
    address: '202 Main St',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    type: 'Apartment',
    profileType: 'long_term',
    community: 'Downtown',
    status: 'rented',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    image: 'https://img.usecurling.com/p/400/300?q=apartment%20building',
    ownerId: 'owner_2',
    listingPrice: 280000,
    hoaValue: 0,
  },
  {
    id: 'prop_3',
    name: 'Beach Condo',
    address: '303 Ocean Blvd',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    type: 'Condo',
    profileType: 'short_term',
    community: 'Ocean View',
    condominiumId: 'condo_2',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    image: 'https://img.usecurling.com/p/400/300?q=beach%20condo',
    ownerId: 'owner_1',
    listingPrice: 550000,
    hoaValue: 500,
  },
]

// --- 3. TASKS ---

export const tasks: Task[] = [
  {
    id: 'task_1',
    title: 'AC Repair',
    propertyId: 'prop_1',
    propertyName: 'Sunny Villa',
    status: 'pending',
    type: 'maintenance',
    assignee: 'Quick Fix Maintenance',
    assigneeId: 'partner_1',
    date: new Date().toISOString(),
    priority: 'high',
    description: 'AC is not cooling properly.',
  },
  {
    id: 'task_2',
    title: 'Move-out Cleaning',
    propertyId: 'prop_2',
    propertyName: 'Downtown Apt',
    status: 'completed',
    type: 'cleaning',
    assignee: 'Sparkle Cleaning',
    assigneeId: 'partner_2',
    date: subDays(new Date(), 2).toISOString(),
    completedDate: subDays(new Date(), 2).toISOString(),
    priority: 'medium',
    price: 150,
  },
]

// --- 4. FINANCIALS ---

export const invoices: Invoice[] = [
  {
    id: 'inv_1',
    description: 'Monthly Management Fee',
    amount: 250,
    status: 'paid',
    date: subDays(new Date(), 10).toISOString(),
    propertyId: 'prop_1',
  },
  {
    id: 'inv_2',
    description: 'AC Repair Reimbursement',
    amount: 180,
    status: 'pending',
    date: new Date().toISOString(),
    propertyId: 'prop_1',
  },
]

export const payments: Payment[] = [
  {
    id: 'pay_1',
    tenantId: 'tenant_1',
    tenantName: 'Michael Brown',
    propertyId: 'prop_1',
    amount: 2500,
    date: subDays(new Date(), 15).toISOString(),
    dueDate: subDays(new Date(), 15).toISOString(),
    status: 'paid',
    type: 'rent',
  },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
export const revenue = months.map((month) => ({
  month,
  value: randomInt(15000, 25000),
}))

export const expenses = [
  { category: 'Maintenance', value: 4500, fill: 'hsl(var(--chart-1))' },
  { category: 'Cleaning', value: 3200, fill: 'hsl(var(--chart-2))' },
  { category: 'Utilities', value: 2100, fill: 'hsl(var(--chart-3))' },
  { category: 'Taxes', value: 1800, fill: 'hsl(var(--chart-4))' },
  { category: 'Other', value: 900, fill: 'hsl(var(--chart-5))' },
]

export const financials: Financials = {
  revenue,
  expenses,
  invoices,
  payments,
}

export const ledgerEntries: LedgerEntry[] = [
  {
    id: 'ledger_1',
    propertyId: 'prop_1',
    date: subDays(new Date(), 15).toISOString(),
    type: 'income',
    category: 'Rent',
    amount: 2500,
    description: 'Rent Payment - Oct',
    status: 'cleared',
  },
  {
    id: 'ledger_2',
    propertyId: 'prop_1',
    date: subDays(new Date(), 5).toISOString(),
    type: 'expense',
    category: 'HOA',
    amount: 350,
    description: 'Monthly HOA',
    status: 'cleared',
  },
]

export const mockBankStatements: BankStatement[] = []
export const defaultFinancialSettings: FinancialSettings = {
  companyName: 'COREPM Demo',
  ein: '',
  bankName: '',
  routingNumber: '',
  accountNumber: '',
  gatewayProvider: 'stripe',
  gateways: {
    stripe: { enabled: true },
    paypal: { enabled: false },
    mercadoPago: { enabled: false },
  },
  isProduction: false,
}

export const defaultPaymentIntegrations: PaymentIntegration[] = [
  { provider: 'bank_transfer', enabled: true },
  { provider: 'credit_card', enabled: true },
  { provider: 'bill_com', enabled: false },
]

// --- 5. COMMUNICATIONS ---

export const messages: Message[] = [
  {
    id: 'msg_1',
    contact: 'Robert Smith',
    contactId: 'owner_1',
    ownerId: 'user_pm',
    lastMessage: 'When is the next inspection?',
    time: subDays(new Date(), 1).toISOString(),
    unread: 1,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    history: [],
  },
]

export const notifications: Notification[] = [
  {
    id: 'notif_1',
    title: 'Rent Received',
    message: 'Rent for Sunny Villa has been received.',
    timestamp: subDays(new Date(), 0).toISOString(),
    read: false,
    type: 'success',
    category: 'financial',
  },
]

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Check-in Instructions',
    trigger: 'check_in_24h',
    subject: 'Welcome to your stay!',
    content: 'Here are the access codes...',
    active: true,
  },
]

// --- 6. AUTOMATION & WORKFLOWS ---

export const automationRules: AutomationRule[] = [
  {
    id: 'rule_1',
    type: 'rent_reminder',
    enabled: true,
    daysBefore: 3,
  },
]

export const workflows: Workflow[] = [
  {
    id: 'wf_1',
    name: 'New Tenant Onboarding',
    description: 'Standard process for new tenants',
    trigger: 'lease_start',
    active: true,
    steps: [
      {
        id: 'step_1',
        name: 'Send Welcome Email',
        role: 'platform_owner',
        actionType: 'email',
      },
      {
        id: 'step_2',
        name: 'Verify Insurance',
        role: 'software_tenant',
        actionType: 'task',
      },
    ],
  },
]

// --- 7. MARKET DATA ---

export const marketData: MarketData[] = [
  {
    region: 'Orlando, FL',
    averagePrice: 350000,
    occupancyRate: 85,
    trend: 'up',
    competitorCount: 120,
    averageDaysOnMarket: 25,
    shortTermRate: 150,
    longTermRate: 2200,
    pricePerSqFt: 210,
    saturationIndex: 65,
  },
  {
    region: 'Miami, FL',
    averagePrice: 550000,
    occupancyRate: 92,
    trend: 'up',
    competitorCount: 300,
    averageDaysOnMarket: 45,
    shortTermRate: 250,
    longTermRate: 3500,
    pricePerSqFt: 450,
    saturationIndex: 80,
  },
]

// --- 8. ADS & OTHERS ---

export const advertisements: Advertisement[] = []
export const mockAdvertisers: Advertiser[] = []
export const mockAdPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
}
export const bookings: Booking[] = [
  {
    id: 'bk_1',
    propertyId: 'prop_3',
    propertyName: 'Beach Condo',
    guestName: 'John Visitor',
    guestEmail: 'john@visitor.com',
    checkIn: addDays(new Date(), 5).toISOString(),
    checkOut: addDays(new Date(), 10).toISOString(),
    status: 'confirmed',
    totalAmount: 1250,
    paid: true,
    platform: 'airbnb',
  },
]
export const calendarBlocks: CalendarBlock[] = []

export const auditLogs: AuditLog[] = [
  {
    id: 'audit_1',
    timestamp: subDays(new Date(), 2).toISOString(),
    userId: 'user_admin',
    userName: 'Admin User',
    action: 'login',
    entity: 'User',
    details: 'Logged in successfully',
  },
]

export const genericServiceRates: ServiceRate[] = []
export const serviceCategories: ServiceCategory[] = [
  { id: 'cat_1', name: 'Plumbing', color: '#3b82f6' },
  { id: 'cat_2', name: 'Electrical', color: '#eab308' },
  { id: 'cat_3', name: 'Cleaning', color: '#22c55e' },
]

export const visits: Visit[] = []
// Generate some visits
for (let i = 0; i < 15; i++) {
  const prop = randomItem(properties)
  const isPast = i % 2 === 0

  visits.push({
    id: `visit_${i}`,
    propertyId: prop.id,
    propertyName: prop.name,
    clientName: `Client ${i + 1}`,
    date: isPast
      ? subDays(new Date(), randomInt(1, 10)).toISOString()
      : addDays(new Date(), randomInt(1, 14)).toISOString(),
    status: isPast ? 'completed' : 'scheduled',
    notes: 'Interested in buying/renting.',
    agentId: 'partner_1',
  })
}
