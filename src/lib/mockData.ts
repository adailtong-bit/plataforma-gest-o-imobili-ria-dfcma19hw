import { subDays, addDays } from 'date-fns'
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
} from '@/lib/types'

// 1 Master Admin
const masterAdmin: User = {
  id: 'admin_master',
  name: 'Master Admin',
  email: 'eu@corepm.com',
  role: 'platform_owner',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
  status: 'active',
  isFirstLogin: false,
  address: '1 Headquarters, Admin City',
  taxId: '00-0000000',
  country: 'US',
}

// 5 Tenants (Property Managers)
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

// Users per role level (3 each)
// Internal Users (Staff) for Tenant 1
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
  ],
  status: 'active',
  isFirstLogin: false,
  country: 'US',
}))

// Team Member (Partner Employee) Mock
const partnerEmployees: User[] = [
  {
    id: 'emp_1',
    name: 'Team Member 1',
    email: 'team1@service.com',
    role: 'partner_employee',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=30',
    parentId: 'tenant_manager_1', // Managed by PM
    parentPartnerId: 'partner_0_0', // Employed by Partner 0-0
    status: 'active',
    isFirstLogin: false,
    country: 'US',
  },
]

// DEMO USERS IMPLEMENTATION
const demoPartnerUser: User = {
  id: 'demo_partner',
  name: 'Demo Partner (Company)',
  email: 'partner@demo.com',
  role: 'partner',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=demo1',
  status: 'active',
  isFirstLogin: false,
  permissions: [
    { resource: 'tasks', actions: ['view', 'edit'] },
    { resource: 'financial', actions: ['view'] },
    { resource: 'portal', actions: ['view'] },
    { resource: 'messages', actions: ['view'] },
  ],
  companyName: 'Demo Services LLC',
  country: 'US',
  isDemo: true,
  parentId: 'tenant_manager_1',
}

const demoTeamUser: User = {
  id: 'demo_team',
  name: 'Demo Team Member',
  email: 'team@demo.com',
  role: 'partner_employee',
  parentId: 'tenant_manager_1', // Managed by PM
  parentPartnerId: 'demo_partner', // Linked to partner
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=demo2',
  status: 'active',
  isFirstLogin: false,
  permissions: [
    { resource: 'tasks', actions: ['view', 'edit'] }, // Restricted view
    { resource: 'portal', actions: ['view'] },
    { resource: 'messages', actions: ['view'] },
  ],
  country: 'US',
  isDemo: true,
  parentId: 'tenant_manager_1',
}

const demoOwnerUser: User = {
  id: 'demo_owner',
  name: 'Demo Owner',
  email: 'owner@demo.com',
  role: 'property_owner',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=demo3',
  status: 'active',
  isFirstLogin: false,
  permissions: [
    { resource: 'properties', actions: ['view'] },
    { resource: 'financial', actions: ['view'] },
    { resource: 'portal', actions: ['view'] },
    { resource: 'messages', actions: ['view'] },
  ],
  country: 'US',
  isDemo: true,
  parentId: 'tenant_manager_1',
}

const demoTenantUser: User = {
  id: 'demo_tenant',
  name: 'Demo Tenant',
  email: 'tenant@demo.com',
  role: 'tenant',
  avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=demo4',
  status: 'active',
  isFirstLogin: false,
  permissions: [
    { resource: 'portal', actions: ['view'] },
    { resource: 'messages', actions: ['view'] },
    { resource: 'tasks', actions: ['create'] }, // Request maintenance
  ],
  country: 'US',
  isDemo: true,
  parentId: 'tenant_manager_1',
}

// Combine Users
export const systemUsers: User[] = [
  masterAdmin,
  ...tenantsData,
  ...internalUsers,
  ...partnerEmployees,
  demoPartnerUser,
  demoTeamUser,
  demoOwnerUser,
  demoTenantUser,
]

// 50 Properties (10 per tenant)
export const properties: Property[] = tenantsData.flatMap((tenant, tIdx) =>
  Array.from({ length: 10 }).map((_, pIdx) => ({
    id: `prop_${tIdx}_${pIdx}`,
    name: `Property ${tIdx + 1}-${pIdx + 1}`,
    address: `${100 + pIdx} Tenant${tIdx + 1} St`,
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    country: 'US',
    type: pIdx % 3 === 0 ? 'House' : 'Condo',
    profileType: pIdx % 2 === 0 ? 'short_term' : 'long_term',
    community: `Community ${tIdx + 1}`,
    condominiumId: 'condo1',
    status: pIdx % 4 === 0 ? 'rented' : 'available',
    marketingStatus: 'listed',
    listingPrice: 150 + pIdx * 10,
    publishToPortals: true,
    image: `https://img.usecurling.com/p/400/300?q=house%20${tIdx}-${pIdx}`,
    gallery: [
      `https://img.usecurling.com/p/400/300?q=house%20${tIdx}-${pIdx}`,
      `https://img.usecurling.com/p/400/300?q=interior%20${tIdx}-${pIdx}`,
    ],
    bedrooms: 2 + (pIdx % 3),
    bathrooms: 2,
    guests: 4 + (pIdx % 4),
    hoaValue: 200,
    hoaFrequency: 'monthly',
    ownerId: `owner_${tIdx}_${pIdx % 2}`, // 2 owners per tenant for mock
    documents: [],
    agentId: `partner_${tIdx}_0`, // 1 agent per tenant
    fixedExpenses: [
      {
        id: `fe-${tIdx}-${pIdx}`,
        name: 'Internet',
        amount: 50,
        dueDay: 5,
        frequency: 'monthly',
      },
    ],
    socialMedia: {
      facebook: 'https://facebook.com/property',
      instagram: 'https://instagram.com/property',
    },
    leadContact: 'sales@agency.com',
    channelLinks: [],
  })),
)

// Add Demo Property for Demo Owner
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
  ownerId: demoOwnerUser.id,
  documents: [],
  channelLinks: [],
})

// Owners (2 per tenant approx)
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
    secondContact: {
      name: 'Spouse Name',
      phone: '+1 555 1234',
    },
    pmAgreementUrl: 'https://example.com/agreement.pdf',
  })),
)

// Add Demo Owner Entity
owners.push({
  id: demoOwnerUser.id,
  name: demoOwnerUser.name,
  email: demoOwnerUser.email,
  phone: '+1 (555) 999 8888',
  status: 'active',
  role: 'property_owner',
  avatar: demoOwnerUser.avatar,
  country: 'US',
  address: 'Demo Address 123',
  isDemo: true,
})

// Tenants (Occupants - 3 per manager)
export const tenants: Tenant[] = tenantsData.flatMap((manager, tIdx) =>
  Array.from({ length: 3 }).map((_, i) => ({
    id: `occupant_${tIdx}_${i}`,
    name: `Occupant ${tIdx}-${i}`,
    email: `occupant${tIdx}_${i}@test.com`,
    phone: `+1 (555) 99${tIdx}${i}`,
    propertyId: `prop_${tIdx}_${i}`, // Assign to first few properties
    rentValue: 2000,
    leaseStart: subDays(new Date(), 300).toISOString(),
    leaseEnd:
      i === 0
        ? addDays(new Date(), 25).toISOString()
        : i === 1
          ? addDays(new Date(), 365).toISOString()
          : addDays(new Date(), 60).toISOString(),
    status: 'active',
    role: 'tenant',
    country: 'US',
    idNumber: `ID-${tIdx}-${i}`,
    emergencyContact: {
      name: 'Emergency Person',
      phone: '+1 555 9999',
      relation: 'Sibling',
    },
    negotiationStatus: i === 0 ? 'negotiating' : i === 1 ? 'closed' : undefined,
    suggestedRenewalPrice: i === 0 ? 2200 : undefined,
    negotiationLogs:
      i === 0
        ? [
            {
              id: 'log1',
              date: new Date().toISOString(),
              action: 'Contacted Owner',
              note: 'Owner agreed to negotiate',
              user: 'Staff Member',
            },
          ]
        : [],
  })),
)

// Add Demo Tenant Entity
tenants.push({
  id: demoTenantUser.id,
  name: demoTenantUser.name,
  email: demoTenantUser.email,
  phone: '+1 (555) 777 6666',
  propertyId: 'demo_property_1',
  rentValue: 4500,
  leaseStart: subDays(new Date(), 10).toISOString(),
  leaseEnd: addDays(new Date(), 355).toISOString(),
  status: 'active',
  role: 'tenant',
  country: 'US',
  avatar: demoTenantUser.avatar,
  isDemo: true,
})

// Bookings (Short Term)
export const bookings: Booking[] = [
  {
    id: 'bk_1',
    propertyId: 'prop_0_0', // Assuming Property 1-1 is short term
    guestName: 'John Smith',
    guestEmail: 'john@traveler.com',
    guestPhone: '+1 555 0101',
    checkIn: addDays(new Date(), 2).toISOString(),
    checkOut: addDays(new Date(), 7).toISOString(),
    status: 'confirmed',
    totalAmount: 1250.0,
    paid: true,
    platform: 'airbnb',
    adults: 2,
    children: 1,
  },
  {
    id: 'bk_2',
    propertyId: 'prop_0_1',
    guestName: 'Maria Garcia',
    guestEmail: 'maria@traveler.com',
    checkIn: subDays(new Date(), 2).toISOString(),
    checkOut: addDays(new Date(), 3).toISOString(),
    status: 'checked_in',
    totalAmount: 850.0,
    paid: true,
    platform: 'booking.com',
    adults: 2,
  },
  {
    id: 'bk_3',
    propertyId: 'prop_0_0',
    guestName: 'Family Vacation',
    guestEmail: 'fam@traveler.com',
    checkIn: addDays(new Date(), 10).toISOString(),
    checkOut: addDays(new Date(), 17).toISOString(),
    status: 'confirmed',
    totalAmount: 2100.0,
    paid: false,
    platform: 'vrbo',
    adults: 4,
    children: 2,
  },
]

// Calendar Blocks
export const calendarBlocks: CalendarBlock[] = [
  {
    id: 'blk_1',
    propertyId: 'prop_0_0',
    startDate: addDays(new Date(), 20).toISOString(),
    endDate: addDays(new Date(), 25).toISOString(),
    type: 'manual_block',
    notes: 'Owner usage',
  },
]

// Message Templates
export const messageTemplates: MessageTemplate[] = [
  {
    id: 'tmpl_1',
    name: 'Booking Confirmation',
    trigger: 'confirmation',
    subject: 'Booking Confirmed!',
    content: 'Hi {GuestName}, your booking is confirmed for {CheckInDate}.',
    active: true,
  },
  {
    id: 'tmpl_2',
    name: 'Check-in Instructions',
    trigger: 'check_in_24h',
    subject: 'Check-in Instructions for Tomorrow',
    content:
      'Hi {GuestName}, you can check in tomorrow after 4 PM. Code: 1234.',
    active: true,
  },
]

// Partners (3 per manager)
const generatedPartners: Partner[] = tenantsData.flatMap((manager, tIdx) =>
  Array.from({ length: 3 }).map((_, i) => ({
    id: `partner_${tIdx}_${i}`,
    name: `Partner ${tIdx}-${i}`,
    type: i === 0 ? 'agent' : i === 1 ? 'cleaning' : 'maintenance',
    companyName: `Partner Co ${tIdx}-${i}`,
    email: `partner${tIdx}_${i}@service.com`,
    phone: `+1 (555) 88${tIdx}${i}`,
    country: 'US',
    status: 'active',
    rating: 4.8,
    role: 'partner',
    address: '123 Service Rd',
    serviceRates: [],
    employees:
      i === 0
        ? [
            {
              id: 'emp_1', // Linked to user above
              name: 'Team Member 1',
              role: 'Cleaner',
              email: 'team1@service.com',
              status: 'active',
            },
          ]
        : [],
    linkedPropertyIds: [`prop_${tIdx}_0`, `prop_${tIdx}_1`],
    documents: [],
  })),
)

// Add Demo Partner Entity
const demoPartner: Partner = {
  id: demoPartnerUser.id,
  name: demoPartnerUser.name,
  type: 'maintenance',
  companyName: demoPartnerUser.companyName,
  email: demoPartnerUser.email,
  phone: '+1 (555) 123 4567',
  country: 'US',
  status: 'active',
  role: 'partner',
  address: 'Demo Partner HQ',
  isDemo: true,
  employees: [
    {
      id: demoTeamUser.id,
      name: demoTeamUser.name,
      role: 'Technician',
      email: demoTeamUser.email,
      status: 'active',
    },
  ],
  linkedPropertyIds: ['demo_property_1'],
}

export const partners: Partner[] = [...generatedPartners, demoPartner]

export const condominiums: Condominium[] = [
  {
    id: 'condo1',
    name: 'Sunny Isles HOA',
    address: '100 Sunny Blvd, Orlando, FL',
    managerName: 'Pedro Manager',
    managerPhone: '+1 555-8888',
    managerEmail: 'hoasunny@example.com',
    description: 'Condomínio de alto padrão próximo aos parques.',
    accessCredentials: {
      guest: '9988',
      service: '7766',
      cleaning: '5544',
      mainGateCar: '1234#',
      pedestrianGate: '4321',
      poolCode: '9090',
    },
    hoaFee: 450.0,
    hoaFrequency: 'monthly',
    contacts: [
      {
        id: 'c1',
        role: 'Security',
        name: 'Guard Station',
        phone: '+1 555 1111',
        email: 'security@sunnyisles.com',
      },
      {
        id: 'c2',
        role: 'Maintenance',
        name: 'Fix It All',
        phone: '+1 555 2222',
        email: 'maint@sunnyisles.com',
      },
    ],
    feeHistory: [
      {
        id: 'fh1',
        amount: 400,
        validFrom: '2023-01-01',
        validTo: '2023-12-31',
      },
      {
        id: 'fh2',
        amount: 450,
        validFrom: '2024-01-01',
      },
    ],
  },
]

export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Limpeza Pós-Checkout',
    propertyId: 'prop_0_0',
    propertyName: 'Property 1-1',
    propertyAddress: '100 Tenant1 St',
    propertyCommunity: 'Community 1',
    status: 'completed',
    type: 'cleaning',
    assignee: 'Partner 0-0', // Assigned to Partner company
    assigneeId: 'partner_0_0',
    partnerEmployeeId: 'emp_1', // Assigned to Team Member
    date: subDays(new Date(), 1).toISOString(),
    priority: 'high',
    images: ['https://img.usecurling.com/p/300/200?q=clean%20bedroom'],
    price: 150.0, // Vendor cost
    laborCost: 150.0,
    billableAmount: 180.0, // With margin
    teamMemberPayout: 50.0,
    recurrence: 'none',
    bookingId: 'bk_1',
  },
  // Add Task for Demo Team
  {
    id: 'demo_task_1',
    title: 'Demo Maintenance Task',
    propertyId: 'demo_property_1',
    propertyName: 'Demo Oceanview Villa',
    propertyAddress: '1 Demo Way',
    status: 'in_progress',
    type: 'maintenance',
    assignee: 'Demo Services LLC',
    assigneeId: demoPartnerUser.id,
    partnerEmployeeId: demoTeamUser.id,
    date: new Date().toISOString(),
    priority: 'medium',
    price: 200.0,
    laborCost: 200.0,
    materialCost: 50.0,
    billableAmount: 300.0, // Example calculation
    teamMemberPayout: 80.0,
    description: 'Fix the AC unit in the master bedroom.',
  },
]

export const financials: Financials = {
  revenue: [
    { month: 'Jan', value: 12500 },
    { month: 'Fev', value: 15000 },
    { month: 'Mar', value: 18000 },
    { month: 'Abr', value: 14000 },
    { month: 'Mai', value: 21000 },
    { month: 'Jun', value: 24000 },
  ],
  expenses: [
    { category: 'Manutenção', value: 4500, fill: 'var(--color-maintenance)' },
    { category: 'Limpeza', value: 3200, fill: 'var(--color-cleaning)' },
  ],
  invoices: [
    {
      id: 'inv-001',
      description: 'Cleaning Services - Jan 2024',
      amount: 1250.0,
      status: 'pending',
      date: subDays(new Date(), 5).toISOString(),
      fromId: 'tenant_manager_1',
      toId: 'owner_0_0',
      type: 'generic',
    },
    {
      id: 'inv-002',
      description: 'Plumbing Repair',
      amount: 450.0,
      status: 'paid',
      date: subDays(new Date(), 15).toISOString(),
      fromId: 'partner_0_2',
      toId: 'tenant_manager_1',
      type: 'partner_to_pm',
    },
  ],
  payments: [],
}

export const automationRules: AutomationRule[] = [
  {
    id: 'rule1',
    type: 'rent_reminder',
    enabled: true,
    daysBefore: 3,
    template: 'Olá {tenant}, lembrete que seu aluguel vence em 3 dias.',
  },
]

// Seed messages with correct senderId attribution for testing
export const messages: Message[] = [
  {
    id: 'msg_thread_1_pm',
    contact: 'Demo Owner',
    contactId: 'demo_owner',
    ownerId: 'tenant_manager_1',
    lastMessage: 'Hello, how is my property?',
    time: new Date().toISOString(),
    unread: 1,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=demo3',
    history: [
      {
        id: 'm1',
        text: 'Hi there! Just checking in.',
        senderId: 'tenant_manager_1',
        timestamp: subDays(new Date(), 1).toISOString(),
      },
      {
        id: 'm2',
        text: 'Hello, how is my property?',
        senderId: 'demo_owner',
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'msg_thread_1_owner',
    contact: 'Property Manager 1',
    contactId: 'tenant_manager_1',
    ownerId: 'demo_owner',
    lastMessage: 'Hello, how is my property?',
    time: new Date().toISOString(),
    unread: 0,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=11',
    history: [
      {
        id: 'm1',
        text: 'Hi there! Just checking in.',
        senderId: 'tenant_manager_1',
        timestamp: subDays(new Date(), 1).toISOString(),
      },
      {
        id: 'm2',
        text: 'Hello, how is my property?',
        senderId: 'demo_owner',
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

export const ledgerEntries: LedgerEntry[] = [
  {
    id: 'l1',
    propertyId: 'prop_0_0',
    date: new Date().toISOString(),
    dueDate: addDays(new Date(), 5).toISOString(),
    type: 'expense',
    category: 'Water',
    amount: 45.0,
    description: 'Water Bill - Jan',
    status: 'pending',
  },
  {
    id: 'l2',
    propertyId: 'prop_0_0',
    date: subDays(new Date(), 10).toISOString(),
    dueDate: subDays(new Date(), 5).toISOString(),
    type: 'income',
    category: 'Rent',
    amount: 2000.0,
    description: 'Rent Payment - Jan',
    status: 'cleared',
  },
]

export const auditLogs: AuditLog[] = []

export const genericServiceRates: ServiceRate[] = [
  {
    id: 'rate1',
    serviceName: 'Limpeza Padrão',
    servicePrice: 150,
    partnerPayment: 120,
    pmValue: 30,
    productPrice: 0,
    validFrom: '2023-01-01',
    type: 'generic',
  },
  {
    id: 'rate2',
    serviceName: 'Manutenção Leve',
    servicePrice: 100,
    partnerPayment: 80,
    pmValue: 20,
    productPrice: 10,
    validFrom: '2023-01-01',
    type: 'generic',
  },
]

export const notifications: Notification[] = []

export const mockBankStatements: BankStatement[] = []

export const defaultPaymentIntegrations: PaymentIntegration[] = []

export const defaultFinancialSettings: FinancialSettings = {
  companyName: 'Minha Imobiliária LLC',
  ein: '12-3456789',
  bankName: 'Chase Bank',
  routingNumber: '123456789',
  accountNumber: '987654321',
  gatewayProvider: 'stripe',
  apiKey: 'sk_test_123456789',
  apiSecret: '****',
  isProduction: false,
  pmManagementFee: 10,
  cleaningFeeRouting: 'pm',
  maintenanceMarginLabor: 15,
  maintenanceMarginMaterial: 10,
  billComEnabled: false,
}

// Market Analysis Mock Data
export const marketData: MarketData[] = [
  {
    region: 'Orlando, FL',
    averagePrice: 350000,
    occupancyRate: 85,
    trend: 'up',
    competitorCount: 120,
    averageDaysOnMarket: 25,
    shortTermRate: 180,
    longTermRate: 2200,
    pricePerSqFt: 250,
    saturationIndex: 65,
    propertyTaxAvg: 3500,
    hoaAvg: 400,
  },
  {
    region: 'Miami, FL',
    averagePrice: 550000,
    occupancyRate: 78,
    trend: 'stable',
    competitorCount: 300,
    averageDaysOnMarket: 45,
    shortTermRate: 250,
    longTermRate: 3500,
    pricePerSqFt: 450,
    saturationIndex: 85,
    propertyTaxAvg: 6000,
    hoaAvg: 800,
  },
]

// Workflows Mock Data
export const workflows: Workflow[] = [
  {
    id: 'wf_1',
    name: 'New Rental Workflow',
    description: 'Standard procedure for new tenants',
    trigger: 'lease_start',
    active: true,
    steps: [
      {
        id: 'step_1',
        name: 'Verify ID',
        role: 'internal_user',
        actionType: 'task',
        description: 'Check tenant ID documents',
      },
      {
        id: 'step_2',
        name: 'Welcome Email',
        role: 'software_tenant',
        actionType: 'email',
        description: 'Send welcome pack',
      },
    ],
  },
]

// Mock Advertisers
export const mockAdvertisers: Advertiser[] = [
  {
    id: 'adv1',
    name: 'SafeGuard Insurance',
    email: 'contact@safeguard.com',
    phone: '+1 555 999 8888',
    address: '123 Insurance Blvd, NY',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adv2',
    name: 'ProFix Maintenance',
    email: 'sales@profix.com',
    phone: '+1 555 777 6666',
    address: '456 Fix St, FL',
    createdAt: new Date().toISOString(),
  },
]

// Mock Ad Pricing
export const mockAdPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
}

// Advertisements Mock Data
export const advertisements: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Insurance Partners',
    description: 'Protect your properties with comprehensive coverage.',
    imageUrl: 'https://img.usecurling.com/p/300/100?q=insurance',
    linkUrl: 'https://example.com/insurance',
    active: true,
    createdAt: new Date().toISOString(),
    placement: 'footer',
    advertiserId: 'adv1',
    validity: 'monthly',
    renewable: true,
    price: 150,
    startDate: '2024-01-01',
    endDate: '2024-02-01',
  },
  {
    id: 'ad2',
    title: 'Maintenance Pro',
    description: 'Reliable maintenance services 24/7.',
    imageUrl: 'https://img.usecurling.com/p/300/100?q=tools',
    linkUrl: 'https://example.com/maintenance',
    active: true,
    createdAt: new Date().toISOString(),
    placement: 'footer',
    advertiserId: 'adv2',
    validity: 'weekly',
    renewable: false,
    price: 50,
    startDate: '2024-01-15',
    endDate: '2024-01-22',
  },
]
