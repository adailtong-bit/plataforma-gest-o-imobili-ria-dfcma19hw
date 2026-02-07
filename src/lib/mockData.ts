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
} from '@/lib/types'

// Mock Data for the Application

export const systemUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@corepm.com',
    role: 'platform_owner',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male',
    permissions: [], // Use role-based permissions from matrix
    status: 'active',
    isFirstLogin: false,
  },
  {
    id: 'u2',
    name: 'Hotel Manager',
    email: 'pm@corepm.com',
    role: 'software_tenant',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female',
    permissions: [], // Use role-based permissions from matrix
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
    description:
      'Luxury oceanfront hotel with premium amenities and world-class service.',
    managerName: 'Elena Rodriguez',
    managerEmail: 'elena.r@grandplaza.com',
    managerPhone: '+1 (305) 555-0199',
    amenities: [
      'Ocean View',
      'Spa',
      'Valet Parking',
      'Rooftop Pool',
      'Fine Dining',
      'Concierge',
    ],
    policies: [
      'Check-in: 3 PM',
      'Check-out: 11 AM',
      'No Smoking in Rooms',
      'Pets Allowed ($50 fee)',
    ],
    contacts: [
      {
        id: 'c1',
        role: 'Front Desk',
        name: 'Reception',
        phone: '(305) 555-0100',
        email: 'frontdesk@grandplaza.com',
      },
      {
        id: 'c2',
        role: 'General Manager',
        name: 'Elena Rodriguez',
        phone: '(305) 555-0199',
        email: 'elena.r@grandplaza.com',
      },
    ],
    towers: [],
  },
  {
    id: 'h2',
    name: 'Sunset Bay Resort',
    address: '400 Bay Dr',
    city: 'Tampa',
    state: 'FL',
    country: 'US',
    zipCode: '33602',
    description: 'Family friendly resort with bay views and water activities.',
    managerName: 'Mike Johnson',
    managerEmail: 'mike@sunsetbay.com',
    managerPhone: '+1 (813) 555-0200',
    amenities: [
      'Pool',
      'Water Park',
      'Kids Club',
      'Tennis Court',
      'Beach Access',
    ],
    policies: ['No Pets', 'Resort Fee Applies', 'Check-in: 4 PM'],
    contacts: [],
    towers: [],
  },
]

export const towers: Tower[] = [
  {
    id: 't1',
    hotelId: 'h1',
    name: 'Ocean Tower',
    description: 'Direct ocean views, renovated in 2024.',
    floors: 15,
  },
  {
    id: 't2',
    hotelId: 'h1',
    name: 'City Tower',
    description: 'City skyline views, larger suites.',
    floors: 12,
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
    amenities: [
      'Wi-Fi',
      'Smart TV',
      'Mini Bar',
      'Ocean View Balcony',
      'Jacuzzi',
    ],
    image: 'https://img.usecurling.com/p/400/300?q=luxury%20hotel%20room',
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
    gallery: [
      'https://img.usecurling.com/p/400/300?q=hotel%20room',
      'https://img.usecurling.com/p/400/300?q=hotel%20bathroom',
    ],
  },
  {
    id: 'p2',
    hotelId: 'h1',
    towerId: 't1',
    name: 'Ocean Standard 102',
    roomNumber: '102',
    type: 'Hotel Room',
    profileType: 'short_term',
    status: 'occupied',
    listingPrice: 280,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['Wi-Fi', 'TV', 'Coffee Maker'],
    image: 'https://img.usecurling.com/p/400/300?q=hotel%20bedroom',
    ownerId: 'owner1',
    community: 'Grand Plaza',
    address: '1500 Collins Ave, Miami Beach, FL',
    roomCharacteristics: {
      bedType: 'Queen',
      view: 'Sea View',
      hasBalcony: false,
      maxOccupancy: 2,
      sizeSqFt: 350,
    },
    priceHistory: [],
  },
  {
    id: 'p3',
    hotelId: 'h1',
    towerId: 't2',
    name: 'City Suite 201',
    roomNumber: '201',
    type: 'Hotel Room',
    profileType: 'short_term',
    status: 'cleaning',
    listingPrice: 220,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['Wi-Fi', 'TV', 'City View'],
    image: 'https://img.usecurling.com/p/400/300?q=modern%20hotel%20interior',
    ownerId: 'system',
    community: 'Grand Plaza',
    address: '1500 Collins Ave, Miami Beach, FL',
    roomCharacteristics: {
      bedType: 'King',
      view: 'City View',
      hasBalcony: true,
      maxOccupancy: 2,
      sizeSqFt: 400,
    },
    priceHistory: [],
  },
  {
    id: 'p4',
    hotelId: 'h1',
    towerId: 't2',
    name: 'City Standard 202',
    roomNumber: '202',
    type: 'Hotel Room',
    profileType: 'short_term',
    status: 'maintenance',
    listingPrice: 180,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['Wi-Fi', 'TV'],
    image: 'https://img.usecurling.com/p/400/300?q=simple%20hotel%20room',
    ownerId: 'system',
    community: 'Grand Plaza',
    address: '1500 Collins Ave, Miami Beach, FL',
    roomCharacteristics: {
      bedType: 'Double',
      view: 'City View',
      hasBalcony: false,
      maxOccupancy: 2,
      sizeSqFt: 300,
    },
    priceHistory: [],
  },
]

export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Fix AC Unit',
    propertyId: 'p1',
    propertyName: 'Ocean Suite 101',
    status: 'pending',
    type: 'maintenance',
    assignee: 'Best Cleaning Co',
    assigneeId: 'partner1',
    date: '2024-05-15T10:00:00Z',
    priority: 'high',
    price: 150,
  },
]

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
  stripe: {
    enabled: true,
    publicKey: 'pk_test_sample',
    secretKey: 'sk_test_sample',
  },
  paypal: { enabled: false, clientId: '', secretKey: '' },
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
  currency: 'USD',
  taxRate: 7.0,
  invoiceFooter: 'Thank you for choosing COREPM.',
}

export const mockBankStatements: BankStatement[] = []
export const ledgerEntries: LedgerEntry[] = []
export const auditLogs: AuditLog[] = []

// Generic Service Rates
export const genericServiceRates: ServiceRate[] = [
  {
    id: 'gsr1',
    serviceName: 'Standard Cleaning',
    servicePrice: 50,
    partnerPayment: 40,
    pmValue: 10,
    productPrice: 0,
    validFrom: '2024-01-01',
    type: 'generic',
  },
  {
    id: 'gsr2',
    serviceName: 'Deep Cleaning',
    servicePrice: 100,
    partnerPayment: 80,
    pmValue: 20,
    productPrice: 0,
    validFrom: '2024-01-01',
    type: 'generic',
  },
  {
    id: 'gsr3',
    serviceName: 'Maintenance Labor',
    servicePrice: 75,
    partnerPayment: 60,
    pmValue: 15,
    productPrice: 0,
    validFrom: '2024-01-01',
    type: 'generic',
  },
]

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'System Update',
    message: 'Welcome to the COREPM dashboard.',
    type: 'info',
    read: false,
    timestamp: new Date().toISOString(),
  },
]

// Advertisements & Marketing
export const advertisements: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Summer Promotion',
    placement: 'sidebar',
    active: true,
    imageUrl: 'https://img.usecurling.com/p/300/200?q=summer',
    linkUrl: '#',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad2',
    title: 'Local Tours Partner',
    placement: 'home_bottom',
    active: true,
    imageUrl: 'https://img.usecurling.com/p/300/200?q=tour',
    linkUrl: '#',
    createdAt: new Date().toISOString(),
  },
]

export const mockAdvertisers: Advertiser[] = [
  {
    id: 'adv1',
    name: 'Miami Tours Inc.',
    email: 'partners@miamitours.com',
    phone: '555-0000',
    address: 'Miami, FL',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adv2',
    name: 'Beach Rentals',
    email: 'info@beachrentals.com',
    phone: '555-1111',
    address: 'Tampa, FL',
    createdAt: new Date().toISOString(),
  },
]

export const mockAdPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
}

export const bookings: Booking[] = []
export const calendarBlocks: CalendarBlock[] = []

// Message Templates
export const messageTemplates: MessageTemplate[] = [
  {
    id: 'mt1',
    name: 'Booking Confirmation',
    content: 'Dear {guest_name}, your booking at {hotel_name} is confirmed.',
    trigger: 'confirmation',
    subject: 'Booking Confirmed',
    active: true,
  },
  {
    id: 'mt2',
    name: 'Check-in Instructions',
    content: 'Welcome! Your room code is {room_code}. Enjoy your stay.',
    trigger: 'check_in_24h',
    subject: 'Check-in Details',
    active: true,
  },
  {
    id: 'mt3',
    name: 'Check-out Thank You',
    content: 'Thank you for staying with us. We hope to see you again!',
    trigger: 'check_out_instructions',
    subject: 'Thank You',
    active: true,
  },
]

export const serviceCategories: ServiceCategory[] = [
  { id: 'sc1', name: 'Cleaning', color: '#3b82f6' },
  { id: 'sc2', name: 'Maintenance', color: '#f59e0b' },
  { id: 'sc3', name: 'Concierge', color: '#8b5cf6' },
  { id: 'sc4', name: 'Food & Beverage', color: '#ef4444' },
]

export const visits: Visit[] = []
export const workflows: Workflow[] = []

// Tour Guide Steps
export const tourSteps = [
  {
    targetId: 'body',
    title: 'Welcome to COREPM',
    content:
      "Welcome to COREPM! Let's take a quick tour of your management dashboard.",
  },
  {
    targetId: 'sidebar-menu',
    title: 'Navigation',
    content:
      'Use the sidebar to navigate between different modules like Hotels, Properties, and Financials.',
    placement: 'right' as const,
  },
  {
    targetId: 'global-actions',
    title: 'Quick Actions',
    content:
      'Use the search bar to quickly find properties, tenants, or tasks.',
    placement: 'bottom' as const,
  },
  {
    targetId: 'user-profile',
    title: 'User Profile',
    content:
      'Manage your profile settings, switch languages, and logout from here.',
    placement: 'bottom' as const,
  },
]

// Market Data for Analysis
export const marketData = [
  {
    name: 'Jan',
    month: 'Jan',
    revenue: 45000,
    expenses: 15000,
    occupancy: 65,
    adr: 150,
    compSet: 62,
  },
  {
    name: 'Feb',
    month: 'Feb',
    revenue: 52000,
    expenses: 18000,
    occupancy: 70,
    adr: 155,
    compSet: 65,
  },
  {
    name: 'Mar',
    month: 'Mar',
    revenue: 48000,
    expenses: 16000,
    occupancy: 68,
    adr: 152,
    compSet: 66,
  },
  {
    name: 'Apr',
    month: 'Apr',
    revenue: 61000,
    expenses: 21000,
    occupancy: 75,
    adr: 160,
    compSet: 72,
  },
  {
    name: 'May',
    month: 'May',
    revenue: 55000,
    expenses: 19000,
    occupancy: 72,
    adr: 158,
    compSet: 70,
  },
  {
    name: 'Jun',
    month: 'Jun',
    revenue: 67000,
    expenses: 23000,
    occupancy: 80,
    adr: 165,
    compSet: 78,
  },
  {
    name: 'Jul',
    month: 'Jul',
    revenue: 72000,
    expenses: 25000,
    occupancy: 85,
    adr: 170,
    compSet: 82,
  },
  {
    name: 'Aug',
    month: 'Aug',
    revenue: 69000,
    expenses: 24000,
    occupancy: 82,
    adr: 168,
    compSet: 80,
  },
  {
    name: 'Sep',
    month: 'Sep',
    revenue: 58000,
    expenses: 20000,
    occupancy: 74,
    adr: 162,
    compSet: 72,
  },
  {
    name: 'Oct',
    month: 'Oct',
    revenue: 51000,
    expenses: 17000,
    occupancy: 69,
    adr: 156,
    compSet: 68,
  },
  {
    name: 'Nov',
    month: 'Nov',
    revenue: 49000,
    expenses: 16500,
    occupancy: 67,
    adr: 154,
    compSet: 65,
  },
  {
    name: 'Dec',
    month: 'Dec',
    revenue: 75000,
    expenses: 26000,
    occupancy: 88,
    adr: 175,
    compSet: 85,
  },
]
