import {
  Hotel,
  Tower,
  Property,
  User,
  Task,
  FinancialRecord,
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
} from '@/lib/types'

// Mock Data for the Application

export const systemUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@corepm.com',
    role: 'admin',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male',
    permissions: ['*'],
  },
  {
    id: 'u2',
    name: 'Hotel Manager',
    email: 'manager@corepm.com',
    role: 'manager',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female',
    permissions: ['hotels', 'properties', 'tenants', 'calendar', 'tasks'],
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
    ownerId: 'system',
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
    ownerId: 'system',
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

export const tasks: Task[] = []
export const financials: FinancialRecord[] = []
export const messages: Message[] = []
export const tenants: Tenant[] = []
export const owners: Owner[] = []
export const partners: Partner[] = []
export const automationRules: any[] = []
export const condominiums: Condominium[] = []

export const defaultPaymentIntegrations = {
  stripe: {
    enabled: true,
    publicKey: 'pk_test_sample',
    secretKey: 'sk_test_sample',
  },
  paypal: { enabled: false, clientId: '', secretKey: '' },
}

export const defaultFinancialSettings = {
  currency: 'USD',
  taxRate: 7.0,
  invoiceFooter: 'Thank you for choosing COREPM.',
}

export const mockBankStatements: any[] = []
export const ledgerEntries: any[] = []
export const auditLogs: any[] = []

// Generic Service Rates
export const genericServiceRates = [
  {
    id: 'gsr1',
    name: 'Standard Cleaning',
    amount: 50,
    type: 'flat',
    description: 'Regular room cleaning',
  },
  {
    id: 'gsr2',
    name: 'Deep Cleaning',
    amount: 100,
    type: 'flat',
    description: 'Deep cleaning and sanitization',
  },
  {
    id: 'gsr3',
    name: 'Maintenance Labor',
    amount: 75,
    type: 'hourly',
    description: 'General maintenance work',
  },
  {
    id: 'gsr4',
    name: 'Room Service Surcharge',
    amount: 15,
    type: 'percentage',
    description: 'Fee on food orders',
  },
]

export const notifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'System Update',
    message: 'Welcome to the COREPM dashboard.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
]

// Advertisements & Marketing
export const advertisements = [
  {
    id: 'ad1',
    title: 'Summer Promotion',
    placement: 'sidebar',
    active: true,
    impressions: 1200,
    clicks: 45,
  },
  {
    id: 'ad2',
    title: 'Local Tours Partner',
    placement: 'dashboard',
    active: true,
    impressions: 3400,
    clicks: 120,
  },
]

export const mockAdvertisers = [
  {
    id: 'adv1',
    name: 'Miami Tours Inc.',
    contact: 'partners@miamitours.com',
    status: 'active',
  },
  {
    id: 'adv2',
    name: 'Beach Rentals',
    contact: 'info@beachrentals.com',
    status: 'pending',
  },
]

export const mockAdPricing = {
  sidebar: 50,
  banner: 100,
  featured: 200,
  popup: 300,
}

export const bookings: Booking[] = []
export const calendarBlocks: CalendarBlock[] = []

// Message Templates
export const messageTemplates = [
  {
    id: 'mt1',
    name: 'Booking Confirmation',
    content: 'Dear {guest_name}, your booking at {hotel_name} is confirmed.',
    type: 'email',
  },
  {
    id: 'mt2',
    name: 'Payment Reminder',
    content: 'This is a reminder that your invoice is due.',
    type: 'sms',
  },
  {
    id: 'mt3',
    name: 'Check-in Instructions',
    content: 'Welcome! Your room code is {room_code}. Enjoy your stay.',
    type: 'email',
  },
  {
    id: 'mt4',
    name: 'Check-out Thank You',
    content: 'Thank you for staying with us. We hope to see you again!',
    type: 'email',
  },
]

export const serviceCategories = [
  { id: 'sc1', name: 'Cleaning', description: 'Housekeeping services' },
  { id: 'sc2', name: 'Maintenance', description: 'Repairs and upkeep' },
  { id: 'sc3', name: 'Concierge', description: 'Guest assistance' },
  { id: 'sc4', name: 'Food & Beverage', description: 'Dining services' },
]

export const visits: Visit[] = []
export const workflows: Workflow[] = []

// Tour Guide Steps
export const tourSteps = [
  {
    target: 'body',
    content:
      "Welcome to COREPM! Let's take a quick tour of your management dashboard.",
    disableBeacon: true,
  },
  {
    target: '[href="/hotels"]',
    content:
      'Manage your Hotels and Towers here. You can view occupancy, add rooms, and manage staff.',
  },
  {
    target: '[href="/properties"]',
    content:
      'View a master list of all rooms and properties across all locations.',
  },
  {
    target: '[href="/calendar"]',
    content:
      'Use the Calendar to view bookings, availability, and manage reservations.',
  },
  {
    target: '[href="/financial"]',
    content: 'Track revenue, expenses, and generate financial reports here.',
  },
]

export const marketData = {
  marketTrends: [
    { month: 'Jan', occupancy: 65, rate: 120 },
    { month: 'Feb', occupancy: 70, rate: 125 },
    { month: 'Mar', occupancy: 75, rate: 135 },
    { month: 'Apr', occupancy: 72, rate: 130 },
    { month: 'May', occupancy: 68, rate: 140 },
    { month: 'Jun', occupancy: 80, rate: 150 },
  ],
  competitors: [
    { name: 'Grand Plaza', rate: 150, occupancy: 75, rating: 4.8 },
    { name: 'Sunset Bay', rate: 130, occupancy: 70, rating: 4.5 },
    { name: 'Ocean View', rate: 140, occupancy: 65, rating: 4.2 },
    { name: 'City Center', rate: 110, occupancy: 80, rating: 4.0 },
  ],
  demandForecast: [
    { date: '2024-07-01', demand: 'High' },
    { date: '2024-07-02', demand: 'High' },
    { date: '2024-07-03', demand: 'Medium' },
    { date: '2024-07-04', demand: 'Low' },
    { date: '2024-07-05', demand: 'High' },
  ],
}
