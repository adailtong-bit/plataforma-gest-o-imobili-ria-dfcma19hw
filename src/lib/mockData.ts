import { subDays, subMonths, addDays } from 'date-fns'
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
} from '@/lib/types'

// --- System-Wide Seeded Test Environment ---

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
  ],
  status: 'active',
  isFirstLogin: false,
  country: 'US',
}))

// Combine Users
export const systemUsers: User[] = [
  masterAdmin,
  ...tenantsData,
  ...internalUsers,
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
  })),
)

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
    address: '123 Owner Lane',
    secondContact: {
      name: 'Spouse Name',
      phone: '+1 555 1234',
    },
  })),
)

// Tenants (Occupants - 3 per manager)
export const tenants: Tenant[] = tenantsData.flatMap((manager, tIdx) =>
  Array.from({ length: 3 }).map((_, i) => ({
    id: `occupant_${tIdx}_${i}`,
    name: `Occupant ${tIdx}-${i}`,
    email: `occupant${tIdx}_${i}@test.com`,
    phone: `+1 (555) 99${tIdx}${i}`,
    propertyId: `prop_${tIdx}_${i}`, // Assign to first few properties
    rentValue: 2000,
    leaseStart: '2024-01-01',
    leaseEnd: i === 0 ? '2024-02-15' : '2024-12-31', // one expiring soon
    status: 'active',
    role: 'tenant',
    country: 'US',
    idNumber: `ID-${tIdx}-${i}`,
    emergencyContact: {
      name: 'Emergency Person',
      phone: '+1 555 9999',
      relation: 'Sibling',
    },
  })),
)

// Partners (3 per manager)
export const partners: Partner[] = tenantsData.flatMap((manager, tIdx) =>
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
    documents: [],
  })),
)

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
    assignee: 'Partner 0-1',
    assigneeId: 'partner_0_1',
    date: subDays(new Date(), 1).toISOString(),
    priority: 'high',
    images: ['https://img.usecurling.com/p/300/200?q=clean%20bedroom'],
    price: 150.0,
    recurrence: 'none',
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
  invoices: [],
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

export const messages: Message[] = []

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

export const genericServiceRates: ServiceRate[] = []

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
