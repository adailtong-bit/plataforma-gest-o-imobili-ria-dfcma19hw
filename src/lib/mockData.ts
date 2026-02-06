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
  Hotel,
  Tower,
  TourStep,
  TutorialModule,
} from '@/lib/types'

// Helpers
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]
const generateId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).substr(2, 9)}`

// --- SEED DATA GENERATORS ---

const firstNames = [
  'James',
  'Mary',
  'Robert',
  'Patricia',
  'John',
  'Jennifer',
  'Michael',
  'Linda',
  'David',
  'Elizabeth',
  'William',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
  'Donald',
  'Ashley',
]

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
]

const streets = [
  'Main St',
  'Oak St',
  'Pine St',
  'Maple St',
  'Cedar St',
  'Elm St',
  'Washington Ave',
  'Lake View Dr',
  'Hillside Ave',
  'Park Dr',
  'Sunset Blvd',
  'Ocean Dr',
  'Palm Tree Way',
  'Broadway',
  'Highland Ave',
  'Forest Ln',
  'River Rd',
  'Meadow Ln',
  'Valley View',
  'Summit Dr',
]

const cities = [
  'Orlando',
  'Miami',
  'Tampa',
  'Jacksonville',
  'Tallahassee',
  'Fort Lauderdale',
  'West Palm Beach',
  'Naples',
  'Sarasota',
  'Clearwater',
  'Kissimmee',
  'Boca Raton',
]

const communities = [
  'Sunset Heights',
  'Ocean View',
  'Palm Springs',
  'Golden Lakes',
  'Silver Creek',
  'Crystal Cove',
  'Emerald Bay',
  'Royal Palm',
  'Coral Reef',
  'Harbor Point',
  'Paradise Valley',
  'Hidden Gem',
  'Blue Lagoon',
  'Sunny Isles',
  'Grandview',
]

const serviceTypes = [
  'Cleaning',
  'Maintenance',
  'Inspection',
  'Plumbing',
  'Electrical',
  'Painting',
  'AC Repair',
  'Pool Service',
  'Landscaping',
  'Pest Control',
]

// Generators

const generateCondos = (count: number): Condominium[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('condo'),
    name:
      i < communities.length
        ? communities[i]
        : `${randomItem(communities)} ${i}`,
    address: `${randomInt(100, 9999)} ${randomItem(streets)}`,
    city: randomItem(cities),
    state: 'FL',
    zipCode: `${randomInt(32000, 34999)}`,
    hoaFee: randomInt(200, 800),
    hoaFrequency: 'monthly',
    managerName: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
    managerPhone: `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    managerEmail: `manager${i}@condo.com`,
  }))
}

const generateOwners = (count: number): Owner[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('owner'),
    name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
    email: `owner${i}@example.com`,
    phone: `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    country: 'US',
    status: 'active',
    role: 'property_owner',
    avatar: `https://img.usecurling.com/ppl/thumbnail?gender=${i % 2 === 0 ? 'male' : 'female'}&seed=${i}`,
    accountNumber: `${randomInt(10000000, 99999999)}`,
    address: `${randomInt(100, 9999)} ${randomItem(streets)}`,
    city: randomItem(cities),
    state: 'FL',
    zipCode: `${randomInt(32000, 34999)}`,
    documents: [],
    properties: [],
  }))
}

const generateProperties = (
  count: number,
  owners: Owner[],
  condos: Condominium[],
): Property[] => {
  // Use a stable set of queries instead of seed which is not supported for /p/ endpoint
  const queries = [
    'modern house',
    'luxury apartment',
    'villa',
    'condo building',
    'cottage',
    'suburban home',
    'living room',
    'kitchen interior',
    'house exterior',
    'pool house',
  ]

  return Array.from({ length: count }).map((_, i) => {
    const owner = randomItem(owners)
    const condo = randomItem(condos)
    const query = queries[i % queries.length]

    return {
      id: generateId('prop'),
      name: `${randomItem(['Luxury', 'Cozy', 'Modern', 'Spacious', 'Charming'])} ${randomItem(['Villa', 'Apt', 'Condo', 'House', 'Loft'])} ${i + 1}`,
      address: `${randomInt(100, 9999)} ${randomItem(streets)}`,
      city: condo.city,
      state: condo.state,
      zipCode: condo.zipCode,
      type: randomItem(['House', 'Apartment', 'Condo']),
      profileType: randomItem(['long_term', 'short_term']),
      community: condo.name,
      condominiumId: condo.id,
      status: randomItem(['rented', 'available', 'rented', 'maintenance']), // Weight rented higher
      bedrooms: randomInt(1, 6),
      bathrooms: randomInt(1, 4),
      guests: randomInt(2, 12),
      // Corrected URL: Removed 'seed' param which is invalid for /p/ endpoint and causes 500/fetch errors
      image: `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(query)}`,
      ownerId: owner.id,
      listingPrice: randomInt(200000, 900000),
      hoaValue: condo.hoaFee,
    }
  })
}

const generateTenants = (count: number, properties: Property[]): Tenant[] => {
  const rentedProps = properties.filter((p) => p.status === 'rented')
  // Ensure we don't try to generate more tenants than rented properties available for linking unique logic if strict,
  // but for mock data we can reuse or just pick available. Ideally 1-to-1 for rented.

  return Array.from({ length: Math.min(count, rentedProps.length) }).map(
    (_, i) => {
      const prop = rentedProps[i]
      return {
        id: generateId('tenant'),
        name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        email: `tenant${i}@example.com`,
        phone: `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        status: 'active',
        role: 'tenant',
        rentValue: randomInt(1500, 5000),
        leaseStart: subMonths(new Date(), randomInt(1, 12)).toISOString(),
        leaseEnd: addMonths(new Date(), randomInt(1, 12)).toISOString(),
        avatar: `https://img.usecurling.com/ppl/thumbnail?gender=${i % 2 === 0 ? 'male' : 'female'}&seed=${i + 100}`,
        propertyId: prop.id,
        documents: [],
      }
    },
  )
}

const generateTasks = (count: number, properties: Property[]): Task[] => {
  return Array.from({ length: count }).map((_, i) => {
    const prop = randomItem(properties)
    const status = randomItem([
      'pending',
      'in_progress',
      'completed',
      'pending_approval',
    ]) as Task['status']
    const type = randomItem([
      'cleaning',
      'maintenance',
      'inspection',
    ]) as Task['type']

    return {
      id: generateId('task'),
      title: `${type} - ${prop.name}`,
      propertyId: prop.id,
      propertyName: prop.name,
      propertyAddress: prop.address,
      propertyCommunity: prop.community,
      status: status,
      type: type,
      assignee: 'Service Partner',
      assigneeId: 'partner_1', // Simplified
      date:
        status === 'completed'
          ? subDays(new Date(), randomInt(1, 30)).toISOString()
          : addDays(new Date(), randomInt(1, 14)).toISOString(),
      completedDate:
        status === 'completed'
          ? subDays(new Date(), randomInt(0, 5)).toISOString()
          : undefined,
      priority: randomItem(['low', 'medium', 'high', 'critical']),
      description: `Regular ${type} task for ${prop.name}.`,
      price: randomInt(100, 500),
      billableAmount: randomInt(150, 600),
    }
  })
}

const generateFinancials = (
  count: number,
  properties: Property[],
  owners: Owner[],
): LedgerEntry[] => {
  return Array.from({ length: count }).map((_, i) => {
    const prop = randomItem(properties)
    const isIncome = Math.random() > 0.4
    return {
      id: generateId('ledger'),
      propertyId: prop.id,
      date: subDays(new Date(), randomInt(0, 90)).toISOString(),
      type: isIncome ? 'income' : 'expense',
      category: isIncome
        ? 'Rent'
        : randomItem(['Maintenance', 'Cleaning', 'HOA', 'Utilities', 'Taxes']),
      amount: isIncome ? randomInt(1500, 4000) : randomInt(50, 800),
      description: isIncome ? `Rent Payment` : `Service Payment`,
      status: randomItem(['cleared', 'pending']),
    }
  })
}

const generateServiceRates = (count: number): ServiceRate[] => {
  return Array.from({ length: count }).map((_, i) => {
    const basePrice = randomInt(50, 300)
    return {
      id: generateId('rate'),
      serviceName: `${randomItem(serviceTypes)} ${randomItem(['Basic', 'Premium', 'Deep', 'Regular'])}`,
      servicePrice: basePrice * 1.5,
      partnerPayment: basePrice,
      pmValue: basePrice * 0.5,
      productPrice: randomInt(0, 50),
      validFrom: subMonths(new Date(), 6).toISOString(),
      type: 'generic',
      lastUpdated: subDays(new Date(), randomInt(0, 60)).toISOString(),
    }
  })
}

// --- INSTANTIATE DATA ---

const generatedCondos = generateCondos(50)
const generatedOwners = generateOwners(50)
const generatedProperties = generateProperties(
  50,
  generatedOwners,
  generatedCondos,
) // 50 Props
const generatedTenants = generateTenants(50, generatedProperties)
const generatedTasksList = generateTasks(50, generatedProperties)
const generatedFinancialsList = generateFinancials(
  50,
  generatedProperties,
  generatedOwners,
)
const generatedServiceRates = generateServiceRates(50)

// Generate Hotel Data
export const hotels: Hotel[] = [
  {
    id: 'hotel_1',
    name: 'Grand Plaza Hotel',
    address: '123 Beach Blvd',
    city: 'Miami',
    state: 'FL',
    country: 'US',
    zipCode: '33101',
    description: 'Luxury hotel with ocean view.',
    managerName: 'Robert CEO',
    managerEmail: 'ceo@grandplaza.com',
    managerPhone: '+1 (305) 555-0100',
    towers: ['tower_1_h1', 'tower_2_h1'],
  },
]

export const towers: Tower[] = [
  {
    id: 'tower_1_h1',
    hotelId: 'hotel_1',
    name: 'North Tower',
    description: 'Main tower with reception.',
    floors: 20,
  },
  {
    id: 'tower_2_h1',
    hotelId: 'hotel_1',
    name: 'South Tower',
    description: 'Resort suites.',
    floors: 15,
  },
]

// Add Hotel Rooms to Properties
const hotelRooms: Property[] = []
for (let i = 1; i <= 10; i++) {
  const room: Property = {
    id: `room_10${i}_h1`,
    name: `Room 10${i}`,
    address: '123 Beach Blvd',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    country: 'US',
    type: 'Hotel Room',
    profileType: 'short_term',
    community: 'Grand Plaza Hotel',
    hotelId: 'hotel_1',
    towerId: 'tower_1_h1',
    roomNumber: `10${i}`,
    status: i % 2 === 0 ? 'occupied' : 'available',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
    ownerId: 'user_owner_demo',
    listingPrice: 200, // Nightly rate
  }
  hotelRooms.push(room)
}

// --- 1. USERS & ENTITIES ---

// Explicit Demo Users for Testing
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
      { resource: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
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
  // Owner Login
  {
    id: 'user_owner_demo',
    name: 'Demo Owner',
    email: 'owner@demo.com',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
    status: 'active',
    isFirstLogin: false,
  },
  // Tenant Login
  {
    id: 'user_tenant_demo',
    name: 'Demo Tenant',
    email: 'tenant@demo.com',
    role: 'tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=100',
    status: 'active',
    isFirstLogin: false,
  },
]

// Add the demo owner to the owners list to ensure linking works
const demoOwner: Owner = {
  id: 'user_owner_demo',
  name: 'Demo Owner',
  email: 'owner@demo.com',
  phone: '+1 (555) 000-0001',
  country: 'US',
  status: 'active',
  role: 'property_owner',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
  documents: [],
  properties: [],
}

export const owners: Owner[] = [demoOwner, ...generatedOwners]

// Add demo tenant
const demoTenant: Tenant = {
  id: 'user_tenant_demo',
  name: 'Demo Tenant',
  email: 'tenant@demo.com',
  phone: '+1 (555) 000-0002',
  status: 'active',
  role: 'tenant',
  rentValue: 2000,
  leaseStart: new Date().toISOString(),
  leaseEnd: addMonths(new Date(), 12).toISOString(),
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=100',
  // Link to first property
  propertyId: generatedProperties[0].id,
  documents: [],
}

export const tenants: Tenant[] = [demoTenant, ...generatedTenants]

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
    employees: [
      {
        id: 'emp_1',
        name: 'José Silva',
        email: 'jose.silva@example.com',
        phone: '(11) 98888-7777',
        role: 'Maintenance',
        status: 'active',
      },
      {
        id: 'emp_2',
        name: 'Maria Oliveira',
        email: 'maria.o@test.com',
        phone: '(21) 97777-6666',
        role: 'Cleaning',
        status: 'active',
      },
      {
        id: 'emp_3',
        name: 'Carlos Santos',
        email: 'carlos.santos@provider.com',
        phone: '(31) 96666-5555',
        role: 'Inspection',
        status: 'active',
      },
    ],
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

export const condominiums: Condominium[] = generatedCondos
export const properties: Property[] = [...generatedProperties, ...hotelRooms]

// --- 3. TASKS ---

export const tasks: Task[] = generatedTasksList

// --- 4. FINANCIALS ---

export const invoices: Invoice[] = []
export const payments: Payment[] = []

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

export const ledgerEntries: LedgerEntry[] = generatedFinancialsList

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
    contact: 'Demo Owner',
    contactId: 'user_owner_demo',
    ownerId: 'user_pm',
    lastMessage: 'When is the next inspection?',
    time: subDays(new Date(), 1).toISOString(),
    unread: 1,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
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
  placementModifiers: {
    home_top: 1.5,
    home_bottom: 1.0,
    partner_page: 1.2,
    tenant_page: 1.1,
    pm_login: 2.0,
  },
}
export const bookings: Booking[] = [
  {
    id: 'bk_1',
    propertyId: generatedProperties[0].id,
    propertyName: generatedProperties[0].name,
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

export const genericServiceRates: ServiceRate[] = generatedServiceRates

export const serviceCategories: ServiceCategory[] = [
  { id: 'cat_1', name: 'Plumbing', color: '#3b82f6' },
  { id: 'cat_2', name: 'Electrical', color: '#eab308' },
  { id: 'cat_3', name: 'Cleaning', color: '#22c55e' },
  { id: 'cat_4', name: 'Eletricista', color: '#f59e0b' },
  { id: 'cat_5', name: 'limpeza', color: '#10b981' },
  { id: 'cat_6', name: 'encanador', color: '#3b82f6' },
  { id: 'cat_7', name: 'manutenção', color: '#6366f1' },
  { id: 'cat_8', name: 'pintura', color: '#ec4899' },
  { id: 'cat_9', name: 'telhadista', color: '#8b5cf6' },
  { id: 'cat_10', name: 'limpeza piscina', color: '#06b6d4' },
  { id: 'cat_11', name: 'técnico ar condicionado', color: '#ef4444' },
  { id: 'cat_12', name: 'técnico de manut piscina', color: '#14b8a6' },
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

// --- 9. TOUR DATA ---

export const tourSteps: TourStep[] = [
  {
    targetId: 'center',
    title: 'Welcome to COREPM',
    content: 'Welcome! This quick tour will guide you through the main features of your new property management platform.',
    placement: 'center',
  },
  {
    targetId: 'sidebar-menu',
    title: 'Main Navigation',
    content: 'Use the sidebar to access all modules: Properties, CRM, Financials, and Settings.',
    placement: 'right',
  },
  {
    targetId: 'dashboard-kpi',
    title: 'Dashboard Overview',
    content: 'Track your key performance indicators, revenue, and pending tasks at a glance.',
    placement: 'bottom',
  },
  {
    targetId: 'global-search',
    title: 'Global Actions',
    content: 'Quickly search for anything or check your notifications here.',
    placement: 'bottom',
  },
  {
    targetId: 'user-profile',
    title: 'Profile & Settings',
    content: 'Manage your account settings, preferences, and subscription here.',
    placement: 'left',
  },
]

export const tutorialModules: TutorialModule[] = [
  { key: 'dashboard', title: 'Dashboard', description: 'Overview of system status', category: 'Operational', videoUrl: 'https://example.com/video1.mp4' },
  { key: 'properties', title: 'Properties', description: 'Manage your portfolio', category: 'Operational', videoUrl: 'https://example.com/video2.mp4' },
  { key: 'hotels', title: 'Hotels', description: 'Hotel management features', category: 'Operational', videoUrl: 'https://example.com/video3.mp4' },
  { key: 'short_term', title: 'Short Term Rental', description: 'Manage bookings', category: 'Operational', videoUrl: 'https://example.com/video4.mp4' },
  { key: 'renewals', title: 'Contract Renewals', description: 'Handle lease renewals', category: 'CRM', videoUrl: 'https://example.com/video5.mp4' },
  { key: 'market_analysis', title: 'Market Analysis', description: 'Analyze market trends', category: 'CRM', videoUrl: 'https://example.com/video6.mp4' },
  { key: 'analytics', title: 'Advanced Analytics', description: 'Deep dive into data', category: 'CRM', videoUrl: 'https://example.com/video7.mp4' },
  { key: 'reports', title: 'Reports', description: 'Generate system reports', category: 'Operational', videoUrl: 'https://example.com/video8.mp4' },
  { key: 'condominiums', title: 'Condominiums', description: 'Manage condo associations', category: 'Operational', videoUrl: 'https://example.com/video9.mp4' },
  { key: 'tenants', title: 'Tenants', description: 'Manage tenant profiles', category: 'CRM', videoUrl: 'https://example.com/video10.mp4' },
  { key: 'owners', title: 'Owners', description: 'Manage property owners', category: 'CRM', videoUrl: 'https://example.com/video11.mp4' },
  { key: 'partners', title: 'Partners', description: 'Manage service providers', category: 'Operational', videoUrl: 'https://example.com/video12.mp4' },
  { key: 'service_pricing', title: 'Service Pricing', description: 'Set service rates', category: 'Settings', videoUrl: 'https://example.com/video13.mp4' },
  { key: 'calendar', title: 'Calendar', description: 'Schedule view', category: 'Operational', videoUrl: 'https://example.com/video14.mp4' },
  { key: 'visits', title: 'Visits', description: 'Manage property visits', category: 'CRM', videoUrl: 'https://example.com/video15.mp4' },
  { key: 'tasks', title: 'Tasks', description: 'Task management', category: 'Operational', videoUrl: 'https://example.com/video16.mp4' },
  { key: 'workflows', title: 'Workflows', description: 'Automate processes', category: 'Settings', videoUrl: 'https://example.com/video17.mp4' },
  { key: 'automation', title: 'Automation Rules', description: 'Configure automation', category: 'Settings', videoUrl: 'https://example.com/video18.mp4' },
  { key: 'financial', title: 'Financial', description: 'Manage finances', category: 'Financial', videoUrl: 'https://example.com/video19.mp4' },
  { key: 'invoices', title: 'Invoices', description: 'Manage billing', category: 'Financial', videoUrl: 'https://example.com/video20.mp4' },
  { key: 'messages', title: 'Messages', description: 'Communication center', category: 'CRM', videoUrl: 'https://example.com/video21.mp4' },
  { key: 'migration', title: 'Migration Hub', description: 'Import data', category: 'System', videoUrl: 'https://example.com/video22.mp4' },
  { key: 'publicity', title: 'Publicity Admin', description: 'Manage ads', category: 'System', videoUrl: 'https://example.com/video23.mp4' },
  { key: 'users', title: 'Users', description: 'Manage system users', category: 'Settings', videoUrl: 'https://example.com/video24.mp4' },
  { key: 'settings', title: 'Settings', description: 'System configuration', category: 'Settings', videoUrl: 'https://example.com/video25.mp4' },
]

