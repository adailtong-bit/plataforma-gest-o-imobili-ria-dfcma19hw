import {
  Hotel,
  Tower,
  Property,
  User,
  Task,
  Financials,
  Message,
  Tenant,
  Owner,
  Partner,
  Condominium,
  Booking,
  CalendarBlock,
  Visit,
  Workflow,
  Notification,
  LedgerEntry,
  BankStatement,
  AuditLog,
  ServiceRate,
  Advertisement,
  Advertiser,
  AdPricing,
  MessageTemplate,
  ServiceCategory,
  GuestService,
  PosItem,
  PosTransaction,
  Promotion,
  Campaign,
  ServiceOrder,
  MarketData,
  Feedback,
  ChannelMapping,
  MarketingWorkflow,
  EmailTemplate,
  FinancialSettings,
} from '@/lib/types'

// Setup pseudo-random generator to ensure consistent massive data load
function seedRandom(seed: number) {
  let current = seed
  return function () {
    current = (current * 9301 + 49297) % 233280
    return current / 233280
  }
}
const rng = seedRandom(42)
const rnd = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min
const rndItem = <T>(arr: T[]): T => arr[rnd(0, arr.length - 1)]
const rndDateStr = (start: Date, end: Date) =>
  new Date(start.getTime() + rng() * (end.getTime() - start.getTime()))
    .toISOString()
    .split('T')[0]
const rndDateTimeStr = (start: Date, end: Date) =>
  new Date(
    start.getTime() + rng() * (end.getTime() - start.getTime()),
  ).toISOString()

const _firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
]
const _lastNames = [
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
]
const _cities = [
  'Miami',
  'Orlando',
  'Tampa',
  'Fort Lauderdale',
  'Jacksonville',
  'Boca Raton',
  'West Palm Beach',
  'Naples',
  'Sarasota',
  'Clearwater',
]
const _streets = [
  'Ocean Drive',
  'Collins Ave',
  'Lincoln Road',
  'Brickell Ave',
  'Las Olas Blvd',
  'Biscayne Blvd',
  'Washington Ave',
  'Ponce de Leon Blvd',
  'Miracle Mile',
  'Worth Ave',
]

// --- Base Static Mock Data ---

export const systemUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@corepm.com',
    role: 'platform_owner',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male',
    permissions: [],
    status: 'active',
    isFirstLogin: false,
  },
  {
    id: 'u2',
    name: 'Hotel Manager',
    email: 'pm@corepm.com',
    role: 'software_tenant',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female',
    permissions: [],
    status: 'active',
    isFirstLogin: false,
  },
  {
    id: 'u3',
    name: 'Staff Member',
    email: 'staff@corepm.com',
    role: 'internal_user',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=2',
    status: 'active',
    isFirstLogin: false,
  },
]

export const owners: Owner[] = [
  {
    id: 'owner1',
    name: 'John Smith',
    email: 'owner@demo.com',
    phone: '(555) 123-4567',
    country: 'US',
    status: 'active',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=3',
    address: '123 Owner Lane',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
  },
]

export const tenants: Tenant[] = [
  {
    id: 't1',
    name: 'Sarah Johnson',
    email: 'tenant@demo.com',
    phone: '(555) 987-6543',
    country: 'US',
    propertyId: 'p1',
    rentValue: 3500,
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    status: 'active',
    role: 'tenant',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=4',
  },
]

export const partners: Partner[] = [
  {
    id: 'partner1',
    name: 'Best Cleaning Co',
    type: 'cleaning',
    companyName: 'Best Cleaning Co',
    email: 'partner@demo.com',
    phone: '(555) 555-5555',
    country: 'US',
    status: 'active',
    role: 'partner',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=5',
    paymentInfo: {
      bankName: 'Chase',
      routingNumber: '123456789',
      accountNumber: '987654321',
    },
  },
]

export const hotels: Hotel[] = [
  {
    id: 'h1',
    name: 'Grand Heritage Hotel',
    address: '1500 Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    country: 'US',
    zipCode: '33139',
    description:
      'Luxury oceanfront hotel with two distinct towers: Torre Norte and Torre Sul.',
    managerName: 'Elena Rodriguez',
    managerEmail: 'elena.r@grandheritage.com',
    managerPhone: '+1 (305) 555-0199',
    amenities: ['Ocean View', 'Spa', 'Pool', 'Fine Dining', 'Concierge'],
    policies: ['Check-in: 3 PM', 'Check-out: 11 AM', 'No Smoking'],
    contacts: [],
    towers: ['t1', 't2'],
  },
]

export const towers: Tower[] = [
  {
    id: 't1',
    hotelId: 'h1',
    name: 'Torre Norte',
    description: 'Heritage wing with classic decor and ocean views.',
    floors: 10,
  },
  {
    id: 't2',
    hotelId: 'h1',
    name: 'Torre Sul',
    description: 'Modern wing with contemporary suites and city views.',
    floors: 15,
  },
]

export const globalStockProperty: Property = {
  id: 'stock_main',
  name: 'Grand Heritage Storage',
  address: 'Basement Level',
  type: 'Storage',
  profileType: 'short_term',
  status: 'available',
  community: 'Grand Heritage',
  hotelId: 'h1',
  ownerId: 'system',
  image: '',
  bedrooms: 0,
  bathrooms: 0,
  guests: 0,
  inventory: [
    {
      id: 'inv_coke',
      name: 'Cola',
      category: 'Minibar',
      quantity: 150,
      condition: 'New',
    },
    {
      id: 'inv_chips',
      name: 'Chips',
      category: 'Minibar',
      quantity: 200,
      condition: 'New',
    },
    {
      id: 'inv_water',
      name: 'Water',
      category: 'Minibar',
      quantity: 300,
      condition: 'New',
    },
    {
      id: 'inv_towel',
      name: 'Towel',
      category: 'Linens',
      quantity: 500,
      condition: 'Good',
    },
    {
      id: 'inv_soap',
      name: 'Soap',
      category: 'Amenities',
      quantity: 1000,
      condition: 'New',
    },
  ],
}

export const properties: Property[] = [
  globalStockProperty,
  {
    id: 'p1',
    hotelId: 'h1',
    towerId: 't1',
    name: 'Suite 101 (Norte)',
    roomNumber: '101',
    type: 'Hotel Room',
    profileType: 'short_term',
    status: 'available',
    listingPrice: 350,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['Wi-Fi', 'TV', 'Balcony', 'Minibar'],
    image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
    ownerId: 'owner1',
    community: 'Grand Heritage',
    address: '1500 Collins Ave, Miami Beach, FL',
    roomCharacteristics: {
      bedType: 'King',
      view: 'Sea View',
      hasBalcony: true,
      maxOccupancy: 2,
      sizeSqFt: 500,
    },
  },
  {
    id: 'p2',
    hotelId: 'h1',
    towerId: 't2',
    name: 'Suite 205 (Sul)',
    roomNumber: '205',
    type: 'Hotel Room',
    profileType: 'short_term',
    status: 'occupied',
    listingPrice: 420,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['Wi-Fi', 'TV', 'City View', 'Minibar'],
    image: 'https://img.usecurling.com/p/400/300?q=modern%20suite',
    ownerId: 'owner1',
    community: 'Grand Heritage',
    address: '1500 Collins Ave, Miami Beach, FL',
    roomCharacteristics: {
      bedType: 'Queen',
      view: 'City View',
      hasBalcony: false,
      maxOccupancy: 2,
      sizeSqFt: 450,
    },
  },
]

export const financials: Financials = {
  revenue: [],
  expenses: [],
  invoices: [],
  payments: [],
}

export const defaultPaymentIntegrations = {
  stripe: { enabled: true },
  paypal: { enabled: false },
  bill_com: { enabled: false },
}
export const defaultFinancialSettings: FinancialSettings = {
  companyName: 'COREPM',
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
  globalCurrency: 'USD',
}

export const condominiums: Condominium[] = []
export const mockBankStatements: BankStatement[] = []
export const ledgerEntries: LedgerEntry[] = [
  {
    id: 'le1',
    propertyId: 'p1',
    date: '2024-05-01',
    type: 'income',
    category: 'Room',
    amount: 1400,
    description: 'Booking BK1 Payment',
    status: 'cleared',
  },
  {
    id: 'le2',
    propertyId: 'p2',
    date: '2024-05-02',
    type: 'income',
    category: 'Room',
    amount: 1200,
    description: 'Booking BK2 Payment',
    status: 'cleared',
  },
  {
    id: 'le3',
    propertyId: 'p1',
    date: '2024-05-05',
    type: 'income',
    category: 'F&B',
    amount: 50,
    description: 'Minibar Charge',
    status: 'cleared',
  },
  {
    id: 'le4',
    propertyId: 'p2',
    date: '2024-05-06',
    type: 'income',
    category: 'Services',
    amount: 120,
    description: 'Spa Service',
    status: 'cleared',
  },
]
export const auditLogs: AuditLog[] = []
export const genericServiceRates: ServiceRate[] = []
export const notifications: Notification[] = []
export const advertisements: Advertisement[] = []
export const mockAdvertisers: Advertiser[] = []
export const mockAdPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
}
export const bookings: Booking[] = [
  {
    id: 'bk1',
    propertyId: 'p1',
    guestName: 'Alice Wonderland',
    guestEmail: 'alice@example.com',
    checkIn: '2024-06-01',
    checkOut: '2024-06-05',
    status: 'checked_in',
    totalAmount: 1400,
    paid: true,
    platform: 'direct',
    propertyName: 'Suite 101 (Norte)',
  },
  {
    id: 'bk2',
    propertyId: 'p2',
    guestName: 'Bob Builder',
    guestEmail: 'bob@example.com',
    checkIn: '2024-06-10',
    checkOut: '2024-06-15',
    status: 'confirmed',
    totalAmount: 1200,
    paid: true,
    platform: 'booking.com',
    propertyName: 'Suite 205 (Sul)',
  },
]
export const calendarBlocks: CalendarBlock[] = []
export const messageTemplates: MessageTemplate[] = []
export const serviceCategories: ServiceCategory[] = [
  { id: 'sc1', name: 'Cleaning', color: '#3b82f6' },
  { id: 'sc2', name: 'Maintenance', color: '#f59e0b' },
]
export const visits: Visit[] = []
export const workflows: Workflow[] = []
export const automationRules: any[] = []
export const tourSteps = []
export const guestServices: GuestService[] = [
  {
    id: 's1',
    name: 'Airport Transfer',
    description: 'Luxury van pickup from MIA airport',
    price: 80,
    category: 'transport',
    active: true,
  },
  {
    id: 's2',
    name: 'Breakfast Buffet',
    description: 'Daily buffet breakfast',
    price: 25,
    category: 'dining',
    active: true,
  },
]
export const posItems: PosItem[] = [
  { id: 'pos1', name: 'Cola', price: 5, category: 'minibar', active: true },
  { id: 'pos2', name: 'Chips', price: 4, category: 'minibar', active: true },
  {
    id: 'pos3',
    name: 'Laundry Service',
    price: 30,
    category: 'laundry',
    active: true,
  },
]
export const posTransactions: PosTransaction[] = []
export const serviceOrders: ServiceOrder[] = []
export const promotions: Promotion[] = [
  {
    id: 'promo1',
    code: 'SUMMER2024',
    type: 'percentage',
    value: 15,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    active: true,
    usageCount: 12,
    totalDiscountApplied: 450,
    description: '15% off summer bookings',
  },
  {
    id: 'promo2',
    code: 'EARLYBIRD',
    type: 'percentage',
    value: 10,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    active: true,
    usageCount: 5,
    totalDiscountApplied: 200,
    description: 'Early bird special',
  },
]
export const campaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Summer Sale',
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    promotions: ['promo1'],
    targetAudience: 'all',
  },
]
export const marketData: MarketData[] = [
  {
    region: 'South Beach',
    averagePrice: 450000,
    occupancyRate: 85,
    trend: 'up',
    competitorCount: 150,
    averageDaysOnMarket: 45,
    shortTermRate: 280,
    longTermRate: 3500,
    pricePerSqFt: 650,
    saturationIndex: 75,
    propertyTaxAvg: 1.8,
    hoaAvg: 600,
  },
]
export const marketAnalysisData = {
  marketTrends: [
    { month: 'Jan', occupancy: 74, rate: 138 },
    { month: 'Feb', occupancy: 72, rate: 135 },
    { month: 'Mar', occupancy: 80, rate: 145 },
    { month: 'Apr', occupancy: 76, rate: 140 },
    { month: 'May', occupancy: 82, rate: 148 },
    { month: 'Jun', occupancy: 78, rate: 142 },
  ],
  competitors: [
    { name: 'Grand Hotel', rate: 155 },
    { name: 'Ocean View', rate: 145 },
    { name: 'Our Property', rate: 142 },
    { name: 'City Inn', rate: 130 },
  ],
  demandForecast: [
    { date: '2024-07-01', demand: 'High' },
    { date: '2024-07-02', demand: 'High' },
    { date: '2024-07-03', demand: 'Medium' },
  ],
}
export const feedbacks: Feedback[] = [
  {
    id: 'f1',
    bookingId: 'bk1',
    propertyId: 'p1',
    guestName: 'Alice Wonderland',
    rating: 5,
    comment: 'Amazing stay! The ocean view was breathtaking.',
    date: '2024-06-05T10:00:00Z',
    status: 'new',
  },
]
export const channelMappings: ChannelMapping[] = []
export const marketingWorkflows: MarketingWorkflow[] = [
  {
    id: 'mw1',
    name: 'Welcome Email',
    trigger: 'booking_confirmed',
    offsetTime: 0,
    templateId: 'et1',
    active: true,
  },
]
export const emailTemplates: EmailTemplate[] = [
  {
    id: 'et1',
    name: 'Welcome Confirmation',
    subject: 'Booking Confirmed!',
    body: 'Hi {guest_name}, thank you for booking {property_name}. See you soon!',
  },
]
export const tasks: Task[] = []
export const messages: Message[] = []

// --- MASSIVE DATA GENERATION ---

// Generate Condominiums (5)
for (let i = 0; i < 5; i++) {
  condominiums.push({
    id: `condo_gen_${i}`,
    name: `Condominium ${i + 1} (${rndItem(_cities)})`,
    address: `${rnd(100, 9999)} ${rndItem(_streets)}`,
    city: rndItem(_cities),
    state: 'FL',
    zipCode: `33${rnd(100, 999)}`,
    country: 'US',
    managerName: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    managerPhone: `(555) ${rnd(100, 999)}-${rnd(1000, 9999)}`,
    managerEmail: `mgr_${i}@condo.com`,
  })
}

// Generate additional Owners (100)
for (let i = 0; i < 100; i++) {
  owners.push({
    id: `owner_gen_${i}`,
    name: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    email: `owner_gen_${i}@demo.com`,
    phone: `(555) ${rnd(100, 999)}-${rnd(1000, 9999)}`,
    country: 'US',
    status: 'active',
    role: 'property_owner',
    avatar: `https://img.usecurling.com/ppl/medium?gender=${rndItem(['male', 'female'])}&seed=${i + 10}`,
    address: `${rnd(100, 9999)} ${rndItem(_streets)}`,
    city: rndItem(_cities),
    state: 'FL',
    zipCode: `33${rnd(100, 999)}`,
  })
}

// Generate additional Partners (50)
for (let i = 0; i < 50; i++) {
  const pId = `partner_gen_${i}`
  partners.push({
    id: pId,
    name: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    type: rndItem(['cleaning', 'maintenance', 'agent']),
    companyName: `${rndItem(_lastNames)} Services LLC`,
    email: `partner_gen_${i}@demo.com`,
    phone: `(555) ${rnd(100, 999)}-${rnd(1000, 9999)}`,
    country: 'US',
    status: 'active',
    role: 'partner',
    avatar: `https://img.usecurling.com/ppl/medium?gender=${rndItem(['male', 'female'])}&seed=${i + 150}`,
    linkedPropertyIds: [], // We will assign this after properties are generated
    serviceRates: [
      {
        id: `sr_${i}`,
        serviceName: 'Standard Service',
        servicePrice: rnd(100, 300),
        partnerPayment: rnd(50, 200),
        pmValue: 50,
        productPrice: rnd(100, 300),
        validFrom: '2024-01-01',
      },
    ],
  })
}

// Generate Hotels & Towers (20 hotels, 40 towers)
for (let i = 0; i < 20; i++) {
  const hId = `hotel_gen_${i}`
  hotels.push({
    id: hId,
    name: `${rndItem(['Grand', 'Royal', 'Ocean', 'Sunset'])} ${rndItem(_lastNames)} Resort`,
    address: `${rnd(100, 9999)} ${rndItem(_streets)}`,
    city: rndItem(_cities),
    state: 'FL',
    country: 'US',
    zipCode: `33${rnd(100, 999)}`,
    description: 'Luxury resort with premium amenities.',
    managerName: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    managerEmail: `mgr_${i}@hotel.com`,
    managerPhone: `(555) ${rnd(100, 999)}-${rnd(1000, 9999)}`,
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant'],
    policies: ['Check-in 3PM', 'No Smoking'],
    contacts: [],
    towers: [`tower_gen_${i}_1`, `tower_gen_${i}_2`],
  })
  towers.push({
    id: `tower_gen_${i}_1`,
    hotelId: hId,
    name: 'North Tower',
    floors: rnd(5, 20),
  })
  towers.push({
    id: `tower_gen_${i}_2`,
    hotelId: hId,
    name: 'South Tower',
    floors: rnd(5, 20),
  })
}

// Generate Properties (300)
for (let i = 0; i < 300; i++) {
  const typeRand = rnd(1, 3)
  const ownerId = rndItem(owners).id
  const pId = `prop_gen_${i}`
  const pType =
    typeRand === 1 ? 'House' : typeRand === 2 ? 'Hotel Room' : 'Apartment'
  const profile = typeRand === 1 ? 'long_term' : 'short_term'
  const status = rndItem([
    'available',
    'rented',
    'occupied',
    'maintenance',
    'cleaning',
  ])
  const condoId = typeRand === 1 ? rndItem(condominiums)?.id : undefined

  let hotelId
  let towerId
  if (pType === 'Hotel Room') {
    const h = rndItem(hotels)
    hotelId = h.id
    const hTowers = towers.filter((t) => t.hotelId === h.id)
    if (hTowers.length > 0) towerId = rndItem(hTowers).id
  }

  properties.push({
    id: pId,
    name:
      pType === 'Hotel Room'
        ? `Room ${rnd(100, 999)}`
        : `${rnd(1, 5)}BR ${pType} in ${rndItem(_cities)}`,
    address: `${rnd(100, 9999)} ${rndItem(_streets)}`,
    city: rndItem(_cities),
    state: 'FL',
    zipCode: `33${rnd(100, 999)}`,
    country: 'US',
    type: pType,
    profileType: profile as any,
    community:
      pType === 'Hotel Room'
        ? 'Hotel Resort'
        : rndItem(['Sunny Isles', 'Brickell Village', 'Coral Way']),
    condominiumId: condoId,
    hotelId,
    towerId,
    roomNumber: pType === 'Hotel Room' ? `${rnd(100, 999)}` : undefined,
    status: status as any,
    listingPrice: rnd(100, 5000),
    bedrooms: rnd(1, 5),
    bathrooms: rnd(1, 4),
    guests: rnd(2, 10),
    image: `https://img.usecurling.com/p/400/300?q=${pType === 'Hotel Room' ? 'hotel%20room' : 'house'}`,
    ownerId,
    gallery: [],
  })
}

// Assign linkedPropertyIds to partners now that properties exist
partners.forEach((p) => {
  p.linkedPropertyIds = [
    rndItem(properties)?.id || '',
    rndItem(properties)?.id || '',
  ]
})

// Generate Tenants (150)
const ltProps = properties.filter((p) => p.profileType === 'long_term')
for (let i = 0; i < 150; i++) {
  const prop = ltProps[i % ltProps.length]

  const leaseEndOptions = [
    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expired
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // < 30 days
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // < 60 days
    new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // < 90 days
    new Date(Date.now() + 200 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // Safe
  ]
  const leaseEnd = leaseEndOptions[i % leaseEndOptions.length]

  let negStatus = 'closed'
  if (i % 5 === 0) negStatus = 'vacating'
  else if (i % 5 === 1) negStatus = rndItem(['negotiating', 'tenant_contacted'])
  else if (i % 5 === 2) negStatus = 'owner_contacted'
  else if (i % 5 === 3) negStatus = 'negotiating'

  tenants.push({
    id: `tenant_gen_${i}`,
    name: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    email: `tenant_gen_${i}@demo.com`,
    phone: `(555) ${rnd(100, 999)}-${rnd(1000, 9999)}`,
    country: 'US',
    propertyId: prop.id,
    rentValue: prop.listingPrice || rnd(1000, 5000),
    leaseStart: rndDateStr(new Date(2023, 0, 1), new Date(2024, 0, 1)),
    leaseEnd: leaseEnd,
    status: rndItem(['active', 'past']),
    role: 'tenant',
    avatar: `https://img.usecurling.com/ppl/medium?gender=${rndItem(['male', 'female'])}&seed=${i + 250}`,
    negotiationStatus: negStatus as any,
    suggestedRenewalPrice: (prop.listingPrice || rnd(1000, 5000)) * 1.1,
    negotiationLogs: [
      {
        id: `log_${i}`,
        date: new Date().toISOString(),
        action: 'Status Update',
        note: `System auto-flagged for renewal negotiation`,
        user: 'System',
      },
    ],
  })
}

// Generate Tasks (500)
for (let i = 0; i < 500; i++) {
  const prop = rndItem(properties)
  const partner = rndItem(partners)
  tasks.push({
    id: `task_gen_${i}`,
    title: `${rndItem(['Fix', 'Clean', 'Inspect', 'Replace'])} ${rndItem(['AC', 'Plumbing', 'Window', 'Floor'])}`,
    propertyId: prop.id,
    propertyName: prop.name,
    status: rndItem([
      'pending',
      'in_progress',
      'completed',
      'pending_approval',
    ]),
    type: rndItem(['cleaning', 'maintenance', 'inspection']),
    assignee: partner.name,
    assigneeId: partner.id,
    date: rndDateTimeStr(new Date(2024, 0, 1), new Date(2024, 11, 31)),
    priority: rndItem(['low', 'medium', 'high', 'critical']),
    price: rnd(50, 500),
    createdBy: 'u1',
  })
}

// Generate Bookings (300)
const stProps = properties.filter((p) => p.profileType === 'short_term')
for (let i = 0; i < 300; i++) {
  const prop = rndItem(stProps)
  const cIn = rndDateStr(new Date(2024, 0, 1), new Date(2024, 11, 1))
  const cOut = rndDateStr(new Date(2024, 11, 2), new Date(2024, 11, 31))

  bookings.push({
    id: `booking_gen_${i}`,
    propertyId: prop.id,
    propertyName: prop.name,
    guestName: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    guestEmail: `guest_${i}@demo.com`,
    checkIn: cIn,
    checkOut: cOut,
    status: rndItem(['confirmed', 'checked_in', 'checked_out', 'cancelled']),
    totalAmount: rnd(200, 2000),
    paid: rnd(0, 1) === 1,
    platform: rndItem(['airbnb', 'vrbo', 'direct', 'booking.com']),
  })

  calendarBlocks.push({
    id: `block_bk_${i}`,
    propertyId: prop.id,
    startDate: cIn,
    endDate: cOut,
    type: 'external_sync',
    notes: `Booking Sync`,
  })
}

// Add Invoices (50)
for (let i = 0; i < 50; i++) {
  financials.invoices.push({
    id: `inv_gen_${i}`,
    description: `Service Invoice ${i}`,
    amount: rnd(100, 1000),
    status: rndItem(['paid', 'pending', 'approved']),
    date: new Date(Date.now() - rnd(0, 10000000000)).toISOString(),
    fromId: 'u1',
    toId: rndItem(owners)?.id,
    propertyId: rndItem(properties)?.id,
    type: 'generic',
  })
}

// Add Automation Rules
automationRules.push(
  { id: 'ar1', type: 'auto_approve_task', enabled: true, threshold: 500 },
  {
    id: 'ar2',
    type: 'auto_generate_invoice',
    enabled: true,
    event: 'task_completion',
  },
  { id: 'ar3', type: 'rent_reminder', enabled: true, daysBefore: 5 },
)

// Add Workflows
workflows.push({
  id: 'wf_demo_1',
  name: 'Standard Checkout Cleaning',
  description: 'Auto assign cleaning when guest checks out',
  trigger: 'after_checkout',
  active: true,
  steps: [
    {
      id: 'step1',
      name: 'Clean Property',
      role: 'partner',
      actionType: 'task',
    },
  ],
})

// Add Audit Logs
for (let i = 0; i < 50; i++) {
  auditLogs.push({
    id: `al_${i}`,
    timestamp: new Date(Date.now() - rnd(0, 10000000000)).toISOString(),
    userId: 'u1',
    userName: 'Admin User',
    action: rndItem(['update', 'create', 'approve', 'login']) as any,
    entity: rndItem(['Task', 'Booking', 'Tenant', 'Property']),
    details: `Simulated action ${i} on system record`,
  })
}

// Add Visits
for (let i = 0; i < 20; i++) {
  visits.push({
    id: `vis_${i}`,
    propertyId: properties[i]?.id || '',
    propertyName: properties[i]?.name || '',
    clientName: `${rndItem(_firstNames)} ${rndItem(_lastNames)}`,
    date: new Date(Date.now() + rnd(-1000000000, 1000000000)).toISOString(),
    status: rndItem(['scheduled', 'completed', 'canceled']) as any,
    registeredBy: 'u1',
    assignedTo: 'u1',
    assignedRole: 'platform_owner',
    reason: rndItem(['showing', 'inspection']),
  })
}

// Generate Advertisers (30) & Ads (50)
for (let i = 0; i < 30; i++) {
  const advId = `adv_gen_${i}`
  mockAdvertisers.push({
    id: advId,
    name: `${rndItem(_lastNames)} Marketing`,
    email: `ads_${i}@marketing.com`,
    phone: `(555) ${rnd(100, 999)}-${rnd(1000, 9999)}`,
    address: `${rnd(100, 9999)} ${rndItem(_streets)}`,
    city: rndItem(_cities),
    state: 'FL',
    country: 'US',
    createdAt: new Date().toISOString(),
  })

  for (let j = 0; j < 2; j++) {
    advertisements.push({
      id: `ad_gen_${i}_${j}`,
      title: `Special Offer ${i}-${j}`,
      imageUrl: `https://img.usecurling.com/p/600/200?q=sale`,
      linkUrl: `https://example.com/offer/${i}`,
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: rndItem([
        'home_top',
        'tenant_page',
        'partner_page',
        'sidebar',
        'header',
        'footer',
        'performance',
      ]),
    })
  }
}

// Explicitly add specific ads to ensure rotation works across all designated areas
if (mockAdvertisers.length > 0) {
  const advId = mockAdvertisers[0].id

  // Header ads (limit 1)
  advertisements.push(
    {
      id: 'ad_header_1',
      title: 'Premium Management',
      description: 'Upgrade your plan today and get 20% off!',
      imageUrl: 'https://img.usecurling.com/p/1200/100?q=banner&color=blue',
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'header',
    },
    {
      id: 'ad_header_2',
      title: 'Winter Discount',
      description: 'Special seasonal pricing on all features.',
      imageUrl: 'https://img.usecurling.com/p/1200/100?q=snow&color=cyan',
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'header',
    },
  )

  // Footer ads (limit 3, add 6 to test rotation)
  for (let k = 1; k <= 6; k++) {
    advertisements.push({
      id: `ad_footer_${k}`,
      title: `Footer Partner ${k}`,
      description: `Find top-rated services in area ${k}`,
      imageUrl: `https://img.usecurling.com/p/400/200?q=realestate&seed=${k}`,
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'footer',
    })
  }

  // Sidebar ads (limit 1, add 3 to test rotation)
  advertisements.push(
    {
      id: 'ad_sidebar_1',
      title: 'Smart Home Integration',
      description: 'Control properties remotely',
      imageUrl: 'https://img.usecurling.com/p/300/300?q=smarthome&color=green',
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'sidebar',
    },
    {
      id: 'ad_sidebar_2',
      title: 'Property Insurance',
      description: 'Protect your assets with our partners',
      imageUrl: 'https://img.usecurling.com/p/300/300?q=insurance&color=blue',
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'sidebar',
    },
    {
      id: 'ad_sidebar_3',
      title: 'Legal Services',
      description: 'Get compliant fast',
      imageUrl: 'https://img.usecurling.com/p/300/300?q=law&color=gray',
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'sidebar',
    },
  )

  // Performance Page ads (limit 2, add 5 to test rotation and side-by-side)
  for (let k = 1; k <= 5; k++) {
    advertisements.push({
      id: `ad_perf_${k}`,
      title: `Analytics Boost ${k}`,
      description: `Supercharge your data with tool ${k}`,
      imageUrl: `https://img.usecurling.com/p/600/200?q=analytics&seed=${k}`,
      linkUrl: '#',
      active: true,
      createdAt: new Date().toISOString(),
      advertiserId: advId,
      placement: 'performance',
    })
  }
}

// Generate Chats (50)
for (let i = 0; i < 50; i++) {
  const tenant = rndItem(tenants)
  messages.push({
    id: `msg_thread_${i}`,
    contact: tenant.name,
    contactId: tenant.id,
    ownerId: 'u1',
    lastMessage: 'Sure, I will check the property soon.',
    time: rndDateTimeStr(new Date(2024, 0, 1), new Date()),
    unread: rnd(0, 3),
    avatar: tenant.avatar || '',
    history: [
      {
        id: `hist_${i}_1`,
        text: 'Hello, is the maintenance scheduled?',
        senderId: tenant.id,
        timestamp: new Date().toISOString(),
      },
      {
        id: `hist_${i}_2`,
        text: 'Yes, our partner is coming tomorrow.',
        senderId: 'u1',
        timestamp: new Date().toISOString(),
        read: true,
      },
    ],
  })
}

// Generate Ledger Entries (1000)
for (let i = 0; i < 1000; i++) {
  ledgerEntries.push({
    id: `le_gen_${i}`,
    propertyId: rndItem(properties).id,
    date: rndDateStr(new Date(2024, 0, 1), new Date()),
    type: rndItem(['income', 'expense']),
    category: rndItem(['Room', 'Maintenance', 'Cleaning', 'F&B', 'Services']),
    amount: rnd(50, 2000),
    description: `Auto generated entry ${i}`,
    status: rndItem(['cleared', 'pending']),
  })
}

// Generate POS Transactions (300)
for (let i = 0; i < 300; i++) {
  const item = rndItem(posItems)
  const qty = rnd(1, 5)
  const total = item.price * qty
  posTransactions.push({
    id: `pos_gen_${i}`,
    bookingId: rndItem(bookings).id,
    items: [
      { itemId: item.id, name: item.name, quantity: qty, price: item.price },
    ],
    totalAmount: total,
    timestamp: rndDateTimeStr(new Date(2024, 0, 1), new Date()),
    status: rndItem(['charged', 'paid']),
  })
}

// Generate Calendar Blocks (100)
for (let i = 0; i < 100; i++) {
  calendarBlocks.push({
    id: `block_gen_${i}`,
    propertyId: rndItem(properties).id,
    startDate: rndDateStr(new Date(2024, 0, 1), new Date(2024, 11, 1)),
    endDate: rndDateStr(new Date(2024, 11, 2), new Date(2024, 11, 31)),
    type: rndItem(['manual_block', 'maintenance']),
    notes: 'Generated block for testing',
  })
}

// Generate Campaigns (20)
for (let i = 0; i < 20; i++) {
  campaigns.push({
    id: `camp_gen_${i}`,
    name: `Marketing Campaign ${i}`,
    status: rndItem(['active', 'completed', 'draft']),
    startDate: rndDateStr(new Date(2024, 0, 1), new Date(2024, 6, 1)),
    endDate: rndDateStr(new Date(2024, 6, 2), new Date(2025, 0, 1)),
    promotions: [rndItem(promotions).id],
    targetAudience: rndItem(['all', 'past_guests', 'leads']),
  })
}

// Generate Promotions (30)
for (let i = 0; i < 30; i++) {
  promotions.push({
    id: `promo_gen_${i}`,
    code: `PROMO${i}${rnd(100, 999)}`,
    type: rndItem(['percentage', 'fixed_amount']),
    value: rnd(10, 50),
    startDate: rndDateStr(new Date(2024, 0, 1), new Date(2024, 6, 1)),
    endDate: rndDateStr(new Date(2024, 6, 2), new Date(2025, 0, 1)),
    active: true,
    usageCount: rnd(0, 100),
    description: `Generated promotion ${i}`,
  })
}
