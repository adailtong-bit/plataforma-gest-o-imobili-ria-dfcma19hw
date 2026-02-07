import {
  Property,
  User,
  Tenant,
  Owner,
  Partner,
  Task,
  Financials,
  Message,
  MarketData,
  Condominium,
  Hotel,
  Tower,
  Booking,
  Notification,
  AuditLog,
  Workflow,
  AutomationRule,
  Visit,
  Lead,
  InventoryItem,
  Invoice,
  Payment,
  CalendarBlock,
} from '@/lib/types'

// Mock Users
export const users: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@corepm.com',
    role: 'platform_owner',
    status: 'active',
    isFirstLogin: false,
    permissions: [
      { resource: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
    ],
  },
  {
    id: 'u2',
    name: 'Manager Demo',
    email: 'manager@corepm.com',
    role: 'internal_user',
    status: 'active',
    isFirstLogin: false,
  },
]

// Mock Owners
export const owners: Owner[] = [
  {
    id: 'o1',
    name: 'James Wilson',
    email: 'james@example.com',
    phone: '555-0101',
    status: 'active',
    role: 'property_owner',
    country: 'US',
    city: 'Miami',
    state: 'FL',
  },
]

// Mock Partners
export const partners: Partner[] = [
  {
    id: 'p1',
    name: 'Top Cleaners',
    type: 'cleaning',
    email: 'info@topclean.com',
    phone: '555-0102',
    status: 'active',
    role: 'partner',
  },
]

// Mock Tenants
export const tenants: Tenant[] = [
  {
    id: 't1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '555-0103',
    rentValue: 2000,
    status: 'active',
    role: 'tenant',
    propertyId: 'prop1',
  },
]

// Mock Hotels
export const hotels: Hotel[] = [
  {
    id: 'h1',
    name: 'Grand Plaza',
    address: '100 Ocean Dr',
    city: 'Miami',
    state: 'FL',
    country: 'US',
    zipCode: '33139',
    managerName: 'Carlos Manager',
    towers: ['tow1'],
  },
]

// Mock Towers
export const towers: Tower[] = [
  {
    id: 'tow1',
    hotelId: 'h1',
    name: 'Tower A',
    floors: 12,
  },
]

// Mock Properties
const baseProperties: Property[] = [
  {
    id: 'prop1',
    name: 'Downtown Condo',
    address: '123 Main St',
    type: 'Apartment',
    profileType: 'long_term',
    community: 'Metro City',
    status: 'rented',
    ownerId: 'o1',
    image: 'https://img.usecurling.com/p/400/300?q=apartment',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    listingPrice: 2000,
    amenities: ['Gym', 'Pool'],
  },
]

const hotelRooms: Property[] = []
for (let i = 1; i <= 10; i++) {
  hotelRooms.push({
    id: `hr${i}`,
    name: `Room 10${i}`,
    address: '100 Ocean Dr',
    type: 'Hotel Room',
    profileType: 'short_term',
    community: 'Grand Plaza',
    hotelId: 'h1',
    towerId: 'tow1',
    roomNumber: `10${i}`,
    status: i % 3 === 0 ? 'occupied' : 'available',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
    ownerId: 'system',
    listingPrice: 250,
    amenities: ['Wifi', 'TV', 'Minibar'],
    roomCharacteristics: {
      bedType: 'King',
      view: 'Ocean',
      hasBalcony: true,
      maxOccupancy: 2,
    },
  })
}

export const properties: Property[] = [...baseProperties, ...hotelRooms]

// Mock Condominiums
export const condominiums: Condominium[] = [
  {
    id: 'c1',
    name: 'Metro City',
    address: '123 Main St',
    city: 'Miami',
    state: 'FL',
  },
]

// Mock Tasks
export const tasks: Task[] = [
  {
    id: 'tsk1',
    title: 'Leaking Faucet',
    propertyId: 'prop1',
    propertyName: 'Downtown Condo',
    status: 'pending',
    type: 'maintenance',
    assignee: 'p1',
    date: new Date().toISOString(),
    priority: 'medium',
  },
]

// Mock Financials
export const invoices: Invoice[] = [
  {
    id: 'inv1',
    description: 'Rent Jan',
    amount: 2000,
    status: 'paid',
    date: new Date().toISOString(),
  },
]

export const payments: Payment[] = [
  {
    id: 'pay1',
    tenantId: 't1',
    tenantName: 'Sarah Connor',
    propertyId: 'prop1',
    amount: 2000,
    date: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    status: 'paid',
    type: 'rent',
  },
]

export const financials: Financials = {
  revenue: [
    { month: 'Jan', value: 2000 },
    { month: 'Feb', value: 2500 },
    { month: 'Mar', value: 2200 },
  ],
  expenses: [
    { category: 'Maintenance', value: 150, fill: '#ef4444' },
    { category: 'Utilities', value: 300, fill: '#3b82f6' },
  ],
  invoices,
  payments,
}

// Mock Messages
export const messages: Message[] = [
  {
    id: 'm1',
    contact: 'Sarah Connor',
    contactId: 't1',
    ownerId: 'u1',
    lastMessage: 'Is the parking included?',
    time: '09:00',
    unread: 1,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female',
    history: [],
  },
]

// Mock Market Data
export const marketData: MarketData = {
  region: 'Miami, FL',
  averagePrice: 500000,
  occupancyRate: 88,
  trend: 'up',
  competitorCount: 50,
  averageDaysOnMarket: 30,
  shortTermRate: 300,
  longTermRate: 2500,
  pricePerSqFt: 400,
  saturationIndex: 50,
}

// Other empty or minimal exports to satisfy imports
export const bookings: Booking[] = []
export const notifications: Notification[] = []
export const auditLogs: AuditLog[] = []
export const workflows: Workflow[] = []
export const automationRules: AutomationRule[] = []
export const visits: Visit[] = []
export const leads: Lead[] = []
export const inventory: InventoryItem[] = []
export const calendarBlocks: CalendarBlock[] = []
