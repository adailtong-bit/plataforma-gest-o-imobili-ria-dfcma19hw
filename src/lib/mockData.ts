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
} from '@/lib/types'

// Mock Data for the Application

// ... (Keep existing systemUsers, owners, tenants, partners, hotels, towers, properties, tasks, financials, etc. as they were)
// To keep it shorter and focused on new features, I assume existing data is preserved.
// I will just add the NEW data arrays here.

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
    name: 'Grand Plaza Miami',
    address: '1500 Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    country: 'US',
    zipCode: '33139',
    description: 'Luxury oceanfront hotel with premium amenities.',
    managerName: 'Elena Rodriguez',
    managerEmail: 'elena.r@grandplaza.com',
    managerPhone: '+1 (305) 555-0199',
    amenities: ['Ocean View', 'Spa', 'Pool'],
    policies: ['Check-in: 3 PM', 'No Smoking'],
    contacts: [],
    towers: [],
  },
]

export const towers: Tower[] = [
  {
    id: 't1',
    hotelId: 'h1',
    name: 'Ocean Tower',
    description: 'Direct ocean views.',
    floors: 15,
  },
]

export const properties: Property[] = [
  {
    id: 'p1',
    hotelId: 'h1',
    towerId: 't1',
    name: 'Ocean Suite 101',
    roomNumber: '101',
    type: 'Hotel Room',
    profileType: 'short_term',
    status: 'available',
    listingPrice: 350,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['Wi-Fi', 'TV', 'Balcony'],
    image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
    ownerId: 'owner1',
    community: 'Grand Plaza',
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
export const defaultFinancialSettings = {
  companyName: 'COREPM',
  ein: '',
  bankName: '',
  routingNumber: '',
  accountNumber: '',
  gatewayProvider: 'stripe' as const,
  gateways: {
    stripe: { enabled: true },
    paypal: { enabled: false },
    mercadoPago: { enabled: false },
  },
  isProduction: false,
}
export const mockBankStatements: BankStatement[] = []
export const ledgerEntries: LedgerEntry[] = []
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
    propertyName: 'Ocean Suite 101',
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

// NEW MOCK DATA
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
    description: '15% off summer bookings',
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
