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

// Mock Data for the Application

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

// Separate property for Global Stock
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
    priceHistory: [],
    gallery: [],
    channelMappings: [],
    inventory: [],
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
    priceHistory: [],
    gallery: [],
    channelMappings: [],
    inventory: [],
  },
]

export const tasks: Task[] = []
export const financials: Financials = {
  revenue: [],
  expenses: [],
  invoices: [],
  payments: [],
}
export const messages: Message[] = []
export const automationRules: any[] = []
export const condominiums: Condominium[] = []
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
  {
    id: 's3',
    name: 'Spa Package',
    description: '60 min massage',
    price: 120,
    category: 'spa',
    active: true,
  },
  {
    id: 's4',
    name: 'Room Service',
    description: 'In-room dining service',
    price: 15,
    category: 'dining',
    active: true,
  },
]

export const posItems: PosItem[] = [
  {
    id: 'pos1',
    name: 'Cola',
    price: 5,
    category: 'minibar',
    active: true,
  },
  {
    id: 'pos2',
    name: 'Chips',
    price: 4,
    category: 'minibar',
    active: true,
  },
  {
    id: 'pos3',
    name: 'Laundry Service',
    price: 30,
    category: 'laundry',
    active: true,
  },
  {
    id: 'pos4',
    name: 'Club Sandwich',
    price: 18,
    category: 'restaurant',
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
    { name: 'Beach Stay', rate: 160 },
  ],
  demandForecast: [
    { date: '2024-07-01', demand: 'High' },
    { date: '2024-07-02', demand: 'High' },
    { date: '2024-07-03', demand: 'Medium' },
    { date: '2024-07-04', demand: 'High' },
    { date: '2024-07-05', demand: 'Low' },
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


