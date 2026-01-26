import {
  subDays,
  addDays,
  startOfMonth,
  subMonths,
  endOfMonth,
  eachMonthOfInterval,
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
} from '@/lib/types'

// Helper for random data
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]
const randomDate = (start: Date, end: Date) =>
  new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ).toISOString()

// --- 1. USERS GENERATION ---

// 1 Master Admin
const masterAdmin: User = {
  id: 'admin_master',
  name: 'Master Admin',
  email: 'admin@corepm.com',
  role: 'platform_owner',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=admin',
  status: 'active',
  isFirstLogin: false,
  address: '1 Headquarters, Admin City',
  taxId: '00-0000000',
  country: 'US',
}

// 5 Property Managers (Tenants)
const tenantsData: User[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `tenant_manager_${i + 1}`,
  name: `Property Manager ${i + 1}`,
  email: `manager${i + 1}@corepm.com`,
  role: 'software_tenant',
  avatar: `https://img.usecurling.com/ppl/thumbnail?gender=${i % 2 === 0 ? 'male' : 'female'}&seed=${i + 10}`,
  parentId: 'admin_master',
  status: 'active',
  isFirstLogin: false,
  hasPaidEntryFee: true,
  subscriptionPlan: 'unlimited',
  taxId: `99-000000${i}`,
  address: `${i * 100} Management Blvd`,
  country: 'US',
}))

// Internal Users (Staff for PM 1)
const internalUsers: User[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `staff_${i + 1}`,
  name: `Staff Member ${i + 1}`,
  email: `staff${i + 1}@corepm.com`,
  role: 'internal_user',
  avatar: `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${i + 20}`,
  parentId: tenantsData[0].id,
  permissions: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'properties', actions: ['view', 'create', 'edit'] },
    { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'short_term', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'financial', actions: ['view'] },
    { resource: 'reports', actions: ['view'] },
  ],
  status: 'active',
  isFirstLogin: false,
  country: 'US',
}))

// Partners (Vendors)
const partnersData: Partner[] = tenantsData.flatMap((manager, tIdx) =>
  Array.from({ length: 3 }).map((_, i) => ({
    id: `partner_${tIdx}_${i}`,
    name:
      i === 0
        ? `Cleaning Co ${tIdx + 1}`
        : i === 1
          ? `FixIt Maintenance ${tIdx + 1}`
          : `Inspection Pro ${tIdx + 1}`,
    type: i === 0 ? 'cleaning' : i === 1 ? 'maintenance' : 'agent',
    companyName:
      i === 0
        ? `Sparkle Clean ${tIdx}`
        : i === 1
          ? `Handy Heroes ${tIdx}`
          : `InspectIt ${tIdx}`,
    email: `partner${tIdx}_${i}@service.com`,
    phone: `+1 (555) 88${tIdx}${i}`,
    country: 'US',
    status: 'active',
    rating: 4.5 + Math.random() * 0.5,
    role: 'partner',
    address: '123 Service Rd',
    employees: [
      {
        id: `emp_${tIdx}_${i}_1`,
        name: `Tech ${tIdx}-${i}`,
        role: i === 0 ? 'Cleaner' : 'Technician',
        email: `tech${tIdx}_${i}@service.com`,
        status: 'active',
      },
    ],
  })),
)

// Partner Employees as Users
const partnerEmployees: User[] = partnersData.flatMap((p) =>
  (p.employees || []).map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email || '',
    role: 'partner_employee',
    avatar: `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${e.id}`,
    parentId: tenantsData[0].id, // Simplified mapping
    parentPartnerId: p.id,
    status: 'active',
    isFirstLogin: false,
    country: 'US',
  })),
)

// Demo Users
const demoUsers: User[] = [
  {
    id: 'demo_owner',
    name: 'Demo Owner',
    email: 'owner@demo.com',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=demo3',
    status: 'active',
    isFirstLogin: false,
    country: 'US',
    isDemo: true,
    parentId: 'tenant_manager_1',
  },
  {
    id: 'demo_tenant',
    name: 'Demo Tenant',
    email: 'tenant@demo.com',
    role: 'tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=demo4',
    status: 'active',
    isFirstLogin: false,
    country: 'US',
    isDemo: true,
    parentId: 'tenant_manager_1',
  },
]

export const systemUsers: User[] = [
  masterAdmin,
  ...tenantsData,
  ...internalUsers,
  ...partnerEmployees,
  ...partnersData.map(
    (p) =>
      ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: 'partner',
        avatar: p.avatar,
        status: 'active',
        isFirstLogin: false,
        country: 'US',
      }) as User,
  ),
  ...demoUsers,
]

// --- 2. INVENTORY GENERATION HELPERS ---

const inventoryCategories = [
  {
    name: 'Furniture',
    items: [
      'Sofa',
      'Dining Table',
      'Chair',
      'Bed Frame',
      'Nightstand',
      'Wardrobe',
      'Coffee Table',
    ],
  },
  {
    name: 'Appliances',
    items: [
      'Refrigerator',
      'Microwave',
      'Oven',
      'Dishwasher',
      'Washing Machine',
      'Dryer',
      'Toaster',
    ],
  },
  {
    name: 'Electronics',
    items: ['Smart TV', 'Wi-Fi Router', 'Smart Lock', 'Thermostat'],
  },
  {
    name: 'Kitchen',
    items: [
      'Cutlery Set',
      'Pots & Pans',
      'Coffee Maker',
      'Blender',
      'Knife Set',
    ],
  },
  {
    name: 'Bedroom',
    items: [
      'King Mattress',
      'Queen Mattress',
      'Pillows',
      'Luxury Sheets',
      'Duvet',
    ],
  },
  {
    name: 'Bathroom',
    items: ['Towel Set', 'Hair Dryer', 'Shower Curtain', 'Bath Mat'],
  },
]

const generateInventory = (count: number): InventoryItem[] => {
  return Array.from({ length: count }).map((_, i) => {
    const category = randomItem(inventoryCategories)
    const name = randomItem(category.items)
    const conditionRoll = Math.random()
    let condition = 'Good'
    let damageHistory: any[] = []

    // Ensure we have some damaged items for testing (approx 15%)
    if (conditionRoll > 0.85) condition = 'Damaged'
    else if (conditionRoll > 0.7) condition = 'Fair'
    else if (conditionRoll < 0.3) condition = 'New'

    const media: InventoryMedia[] = [
      {
        id: `media_${Date.now()}_${i}`,
        url: `https://img.usecurling.com/p/200/200?q=${name.replace(' ', '%20')}&seed=${i}`,
        type: 'image',
        date: subDays(new Date(), randomInt(1, 365)).toISOString(),
        notes: `Photo of ${name}`,
      },
    ]

    if (condition === 'Damaged') {
      damageHistory.push({
        id: `dmg_${i}`,
        date: subDays(new Date(), randomInt(1, 10)).toISOString(),
        description: 'Item found broken during last inspection',
        reportedBy: 'Inspector',
      })
    }

    return {
      id: `inv_${Date.now()}_${i}`,
      name: `${name} ${i + 1}`,
      category: category.name,
      quantity: randomInt(1, 4),
      condition: condition as any,
      description: `Standard ${name.toLowerCase()} for the unit.`,
      createdAt: subDays(new Date(), randomInt(30, 365)).toISOString(),
      updatedAt: subDays(new Date(), randomInt(1, 30)).toISOString(),
      damageHistory,
      media,
    }
  })
}

// --- 3. PROPERTIES GENERATION ---

// Owners (2 per PM)
export const owners: Owner[] = tenantsData.flatMap((tenant, tIdx) =>
  Array.from({ length: 2 }).map((_, oIdx) => ({
    id: `owner_${tIdx}_${oIdx}`,
    name: `Owner ${tIdx + 1}-${oIdx + 1}`,
    email: `owner${tIdx}_${oIdx}@example.com`,
    phone: `+1 (555) 00${tIdx}${oIdx}`,
    status: 'active',
    role: 'property_owner',
    avatar: `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${50 + tIdx + oIdx}`,
    country: 'US',
    address: '123 Owner Lane, Orlando, FL 32801',
  })),
)
owners.push({
  id: demoUsers[0].id,
  name: demoUsers[0].name,
  email: demoUsers[0].email,
  phone: '+1 555 999 8888',
  status: 'active',
  role: 'property_owner',
  avatar: demoUsers[0].avatar,
  isDemo: true,
})

// 50 Properties (10 per tenant)
export const properties: Property[] = tenantsData.flatMap((tenant, tIdx) =>
  Array.from({ length: 10 }).map((_, pIdx) => {
    const isShortTerm = pIdx % 2 === 0
    return {
      id: `prop_${tIdx}_${pIdx}`,
      name: `${isShortTerm ? 'Vacation' : 'Residence'} ${tIdx + 1}-${pIdx + 1}`,
      address: `${100 + pIdx} Tenant${tIdx + 1} St`,
      city: 'Orlando',
      state: 'FL',
      zipCode: '32801',
      country: 'US',
      type: pIdx % 3 === 0 ? 'House' : 'Condo',
      profileType: isShortTerm ? 'short_term' : 'long_term',
      community: `Community ${tIdx + 1}`,
      condominiumId: 'condo1',
      status: pIdx % 5 === 0 ? 'available' : 'rented',
      marketingStatus: 'listed',
      listingPrice: 350 + pIdx * 50, // Daily or Monthly base
      publishToPortals: true,
      image: `https://img.usecurling.com/p/400/300?q=${isShortTerm ? 'vacation%20house' : 'apartment'}&seed=${tIdx}${pIdx}`,
      gallery: [
        `https://img.usecurling.com/p/400/300?q=living%20room&seed=${tIdx}${pIdx}1`,
        `https://img.usecurling.com/p/400/300?q=bedroom&seed=${tIdx}${pIdx}2`,
      ],
      bedrooms: 2 + (pIdx % 3),
      bathrooms: 2,
      guests: 4 + (pIdx % 4),
      hoaValue: 200,
      hoaFrequency: 'monthly',
      ownerId: `owner_${tIdx}_${pIdx % 2}`,
      documents: [],
      agentId: `partner_${tIdx}_2`,
      fixedExpenses: [
        {
          id: `fe-${tIdx}-${pIdx}`,
          name: 'Internet',
          amount: 50,
          dueDay: 5,
          frequency: 'monthly',
        },
      ],
      healthScore: randomInt(60, 100),
      inventory: generateInventory(12), // 12 items per property
    }
  }),
)

// Add Demo Property
properties.push({
  id: 'demo_property_1',
  name: 'Demo Oceanview Villa',
  address: '1 Demo Way, Miami, FL',
  city: 'Miami',
  state: 'FL',
  zipCode: '33139',
  country: 'US',
  type: 'House',
  profileType: 'short_term',
  community: 'Demo Community',
  status: 'available',
  marketingStatus: 'listed',
  listingPrice: 500,
  publishToPortals: true,
  image: 'https://img.usecurling.com/p/400/300?q=luxury%20villa',
  gallery: ['https://img.usecurling.com/p/400/300?q=villa%20interior'],
  bedrooms: 4,
  bathrooms: 3,
  guests: 8,
  ownerId: 'demo_owner',
  documents: [],
  healthScore: 98,
  inventory: generateInventory(15),
})

// --- 4. BOOKINGS & TENANTS ---

// Long Term Tenants
export const tenants: Tenant[] = tenantsData.flatMap((manager, tIdx) =>
  Array.from({ length: 3 }).map((_, i) => ({
    id: `occupant_${tIdx}_${i}`,
    name: `Occupant ${tIdx}-${i}`,
    email: `occupant${tIdx}_${i}@test.com`,
    phone: `+1 (555) 99${tIdx}${i}`,
    propertyId: `prop_${tIdx}_${i * 2 + 1}`, // Odd index = long term
    rentValue: 2000 + i * 100,
    leaseStart: subDays(new Date(), 300).toISOString(),
    leaseEnd: addDays(new Date(), 60).toISOString(),
    status: 'active',
    role: 'tenant',
    country: 'US',
    idNumber: `ID-${tIdx}-${i}`,
    inspections: [],
  })),
)

// Short Term Bookings (Generate 20+)
export const bookings: Booking[] = []
const shortTermProps = properties.filter((p) => p.profileType === 'short_term')

// Historical Bookings
shortTermProps.slice(0, 10).forEach((prop, i) => {
  bookings.push({
    id: `bk_past_${i}`,
    propertyId: prop.id,
    propertyName: prop.name,
    guestName: `Past Guest ${i}`,
    guestEmail: `guest${i}@travel.com`,
    checkIn: subDays(new Date(), randomInt(10, 60)).toISOString(),
    checkOut: subDays(new Date(), randomInt(2, 9)).toISOString(),
    status: 'checked_out',
    totalAmount: randomInt(500, 2000),
    paid: true,
    platform: randomItem(['airbnb', 'vrbo', 'booking.com'] as const),
    adults: 2,
  })
})

// Future Bookings
shortTermProps.slice(0, 10).forEach((prop, i) => {
  bookings.push({
    id: `bk_future_${i}`,
    propertyId: prop.id,
    propertyName: prop.name,
    guestName: `Future Guest ${i}`,
    guestEmail: `future${i}@travel.com`,
    checkIn: addDays(new Date(), randomInt(5, 30)).toISOString(),
    checkOut: addDays(new Date(), randomInt(35, 45)).toISOString(),
    status: 'confirmed',
    totalAmount: randomInt(800, 2500),
    paid: i % 2 === 0, // Mix of paid/unpaid
    platform: randomItem(['airbnb', 'vrbo', 'direct'] as const),
    adults: randomInt(2, 6),
  })
})

// --- 5. TASKS GENERATION ---

export const tasks: Task[] = []
const taskTypes = ['cleaning', 'maintenance', 'inspection'] as const
const taskStatuses = [
  'pending',
  'in_progress',
  'completed',
  'approved',
] as const

// Generate 50 Random Standard Tasks
for (let i = 0; i < 50; i++) {
  const prop = randomItem(properties)
  const type = randomItem(taskTypes)
  const status = randomItem(taskStatuses)
  const isCompleted = status === 'completed'
  const partner = randomItem(
    partnersData.filter(
      (p) => p.type === (type === 'inspection' ? 'agent' : type),
    ) || partnersData,
  )

  tasks.push({
    id: `task_${i}`,
    title: `${type === 'cleaning' ? 'Cleaning' : type === 'maintenance' ? 'Repair' : 'Inspection'} - ${prop.name}`,
    propertyId: prop.id,
    propertyName: prop.name,
    propertyAddress: prop.address,
    propertyCommunity: prop.community,
    status: status,
    type: type,
    assignee: partner?.name || 'Unassigned',
    assigneeId: partner?.id,
    date: isCompleted
      ? subDays(new Date(), randomInt(1, 30)).toISOString()
      : addDays(new Date(), randomInt(1, 14)).toISOString(),
    priority: randomItem(['low', 'medium', 'high', 'critical'] as const),
    price: randomInt(50, 300),
    laborCost: randomInt(40, 200),
    billableAmount: randomInt(60, 400),
    description: `Routine ${type} task for property.`,
    images: isCompleted
      ? [`https://img.usecurling.com/p/300/200?q=${type}`]
      : [],
  })
}

// Generate Maintenance Tasks for Damaged Inventory (Integration Requirement)
properties.forEach((prop) => {
  prop.inventory?.forEach((item) => {
    if (['Damaged', 'Broken', 'Missing', 'Poor'].includes(item.condition)) {
      const partner = randomItem(
        partnersData.filter((p) => p.type === 'maintenance'),
      )
      tasks.push({
        id: `task_auto_${item.id}`,
        title: `Repair: ${item.name}`,
        propertyId: prop.id,
        propertyName: prop.name,
        propertyAddress: prop.address,
        propertyCommunity: prop.community,
        status: 'pending',
        type: 'maintenance',
        assignee: partner?.name || 'Unassigned',
        assigneeId: partner?.id,
        date: new Date().toISOString(),
        priority: 'high',
        description: `Auto-generated maintenance task for damaged item: ${item.name}. Condition: ${item.condition}.`,
        inventoryItemId: item.id,
        source: 'automation',
        price: 150,
      })
    }
  })
})

// --- 6. MESSAGES GENERATION ---

export const messages: Message[] = []

// Generate 15 threads
for (let i = 0; i < 15; i++) {
  const owner = randomItem(owners)
  const tenant = tenantsData[0] // PM
  const isOwnerSender = i % 2 === 0

  const history: ChatMessage[] = []
  const msgCount = randomInt(3, 8)

  for (let j = 0; j < msgCount; j++) {
    history.push({
      id: `m_${i}_${j}`,
      text: j % 2 === 0 ? 'Hello, I have a question.' : 'Sure, how can I help?',
      senderId:
        j % 2 === 0
          ? isOwnerSender
            ? owner.id
            : tenant.id
          : isOwnerSender
            ? tenant.id
            : owner.id,
      timestamp: subDays(new Date(), randomInt(0, 5)).toISOString(),
      read: true,
    })
  }

  messages.push({
    id: `thread_${i}`,
    contact: owner.name,
    contactId: owner.id,
    ownerId: tenant.id,
    lastMessage: history[history.length - 1].text,
    time: history[history.length - 1].timestamp,
    unread: randomInt(0, 2),
    avatar: owner.avatar || '',
    history: history,
  })
}

// --- 7. LEDGER GENERATION ---

export const ledgerEntries: LedgerEntry[] = []
const months = eachMonthOfInterval({
  start: subMonths(new Date(), 5),
  end: new Date(),
})

// Generate Ledger for last 6 months
properties.slice(0, 20).forEach((prop) => {
  months.forEach((month) => {
    // Income
    if (
      prop.status === 'rented' ||
      (prop.profileType === 'short_term' && randomInt(0, 1) === 1)
    ) {
      ledgerEntries.push({
        id: `inc_${prop.id}_${month.getTime()}`,
        propertyId: prop.id,
        date: addDays(startOfMonth(month), 5).toISOString(),
        type: 'income',
        category: 'Rent',
        amount: prop.profileType === 'long_term' ? 2000 : randomInt(1500, 4000),
        description: `Rent Income - ${month.toLocaleString('default', { month: 'short' })}`,
        status: 'cleared',
      })
    }

    // Expense - Management Fee
    ledgerEntries.push({
      id: `exp_mgm_${prop.id}_${month.getTime()}`,
      propertyId: prop.id,
      date: addDays(endOfMonth(month), -1).toISOString(),
      type: 'expense',
      category: 'Management Fee',
      amount: 200,
      description: 'Monthly Management Fee',
      status: 'cleared',
    })

    // Random Maintenance
    if (randomInt(0, 10) > 7) {
      ledgerEntries.push({
        id: `exp_maint_${prop.id}_${month.getTime()}`,
        propertyId: prop.id,
        date: addDays(startOfMonth(month), 15).toISOString(),
        type: 'expense',
        category: 'Maintenance',
        amount: randomInt(50, 300),
        description: 'General Repairs',
        status: 'cleared',
      })
    }
  })
})

// --- 8. FINANCIALS SUMMARY ---

// Calculate totals for charts
const revenueByMonth = months.map((m) => {
  const total = ledgerEntries
    .filter(
      (l) =>
        l.type === 'income' && new Date(l.date).getMonth() === m.getMonth(),
    )
    .reduce((acc, curr) => acc + curr.amount, 0)
  return {
    month: m.toLocaleString('default', { month: 'short' }),
    value: total,
  }
})

export const financials: Financials = {
  revenue: revenueByMonth,
  expenses: [
    { category: 'Maintenance', value: 4500, fill: 'var(--color-maintenance)' },
    { category: 'Management Fees', value: 3200, fill: 'var(--color-cleaning)' },
    { category: 'Utilities', value: 1200, fill: 'var(--color-utilities)' },
  ],
  invoices: [],
  payments: [],
}

// --- EXPORTS ---

export const partners = partnersData
export const condominiums: Condominium[] = [
  {
    id: 'condo1',
    name: 'Sunny Isles HOA',
    address: '100 Sunny Blvd, Orlando, FL',
    hoaFee: 450.0,
    hoaFrequency: 'monthly',
    contacts: [],
    feeHistory: [],
  },
]
export const calendarBlocks: CalendarBlock[] = []
export const messageTemplates: MessageTemplate[] = [
  {
    id: 'tmpl_1',
    name: 'Booking Confirmation',
    trigger: 'confirmation',
    subject: 'Confirmed!',
    content: 'Booking Confirmed.',
    active: true,
  },
]
export const automationRules: AutomationRule[] = [
  { id: 'rule1', type: 'rent_reminder', enabled: true, daysBefore: 3 },
]
export const auditLogs: AuditLog[] = []
export const genericServiceRates: ServiceRate[] = []
export const notifications: Notification[] = [
  {
    id: 'notif_1',
    title: 'New Booking',
    message: 'You have a new booking request.',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'info',
  },
  {
    id: 'notif_2',
    title: 'Maintenance Alert',
    message: 'High priority maintenance reported.',
    timestamp: subDays(new Date(), 1).toISOString(),
    read: false,
    type: 'warning',
  },
  {
    id: 'notif_3',
    title: 'Inventory Alert',
    message: 'Damage reported for Sofa in Residence 1-1.',
    timestamp: subDays(new Date(), 2).toISOString(),
    read: true,
    type: 'warning',
  },
]
export const advertisements: Advertisement[] = []
export const mockAdvertisers: Advertiser[] = []
export const mockAdPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
}
export const mockBankStatements: BankStatement[] = []
export const defaultPaymentIntegrations: PaymentIntegration[] = []
export const defaultFinancialSettings: FinancialSettings = {
  companyName: 'CorePM Demo',
  ein: '00-0000000',
  bankName: 'Demo Bank',
  routingNumber: '000000000',
  accountNumber: '000000000',
  gatewayProvider: 'manual',
  isProduction: false,
}
export const marketData: MarketData[] = []
export const workflows: Workflow[] = []
