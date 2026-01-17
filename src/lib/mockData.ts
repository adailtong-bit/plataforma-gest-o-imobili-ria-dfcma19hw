import { addDays, subDays } from 'date-fns'
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
} from '@/lib/types'

// System Users (Staff/Admins)
export const systemUsers: User[] = [
  {
    id: 'admin_platform',
    name: 'Platform Administrator',
    email: 'admin@platform.com',
    role: 'platform_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
  },
  {
    id: 'tenant_realestate',
    name: 'Real Estate Tenant',
    email: 'tenant@realestate.com',
    role: 'software_tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=98',
    parentId: 'admin_platform',
  },
  {
    id: 'staff_view',
    name: 'Staff View Only',
    email: 'staff_view@realestate.com',
    role: 'internal_user',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=97',
    parentId: 'tenant_realestate',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'properties', actions: ['view'] },
      { resource: 'calendar', actions: ['view'] },
      { resource: 'tasks', actions: ['view'] },
    ],
    allowedProfileTypes: ['short_term', 'long_term'],
  },
  {
    id: 'staff_full',
    name: 'Staff Full Maintenance',
    email: 'staff_full@realestate.com',
    role: 'internal_user',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=96',
    parentId: 'tenant_realestate',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'properties', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'calendar', actions: ['view'] },
      { resource: 'tenants', actions: ['view'] },
    ],
    allowedProfileTypes: ['short_term'],
  },
]

export const defaultPaymentIntegrations: PaymentIntegration[] = [
  {
    provider: 'bank_transfer',
    enabled: true,
    config: { bank: 'Chase', account: '****1234' },
  },
  { provider: 'credit_card', enabled: false },
  { provider: 'bill_com', enabled: false, apiKey: '' },
]

export const owners: Owner[] = [
  {
    id: 'owner1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 0101',
    status: 'active',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  {
    id: 'owner2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 0102',
    status: 'active',
    role: 'property_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
  },
]

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
    },
    hoaFee: 450.0,
    hoaFrequency: 'monthly',
  },
]

export const properties: Property[] = [
  {
    id: 'prop1',
    name: 'Villa Sunshine',
    address: '123 Palm Street, Orlando, FL',
    type: 'House',
    profileType: 'short_term',
    community: 'Sunny Isles HOA',
    condominiumId: 'condo1',
    status: 'occupied',
    marketingStatus: 'listed',
    image: 'https://img.usecurling.com/p/400/300?q=modern%20villa',
    gallery: ['https://img.usecurling.com/p/400/300?q=modern%20villa'],
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    hoaValue: 350.0,
    hoaFrequency: 'monthly',
    ownerId: 'owner1',
    agentId: 'partner3',
  },
  {
    id: 'prop2',
    name: 'Downtown Condo',
    address: '450 Brickell Ave, Miami, FL',
    type: 'Condo',
    profileType: 'long_term',
    community: 'Brickell Heights',
    condominiumId: 'condo2',
    status: 'vacant',
    marketingStatus: 'unlisted',
    image: 'https://img.usecurling.com/p/400/300?q=luxury%20apartment',
    gallery: ['https://img.usecurling.com/p/400/300?q=luxury%20apartment'],
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    hoaValue: 800.0,
    hoaFrequency: 'quarterly',
    ownerId: 'owner2',
    agentId: 'partner3',
  },
]

export const tenants: Tenant[] = [
  {
    id: 'tenant1',
    name: 'Michael Scott',
    email: 'michael@dunder.com',
    phone: '+1 (555) 1111',
    propertyId: 'prop1',
    rentValue: 2500,
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    status: 'active',
    role: 'tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=10',
  },
]

export const partners: Partner[] = [
  {
    id: 'partner1',
    name: 'Maria Silva',
    type: 'cleaning',
    companyName: 'Sparkle Cleaners',
    email: 'maria@sparkle.com',
    phone: '+1 (555) 9991',
    status: 'active',
    rating: 4.8,
    role: 'partner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
  },
]

export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Limpeza Pós-Checkout',
    propertyId: 'prop1',
    propertyName: 'Villa Sunshine',
    propertyAddress: '123 Palm Street, Orlando, FL',
    propertyCommunity: 'Sunny Isles HOA',
    status: 'completed',
    type: 'cleaning',
    assignee: 'Maria Silva',
    assigneeId: 'partner1',
    date: subDays(new Date(), 1).toISOString(),
    priority: 'high',
    images: ['https://img.usecurling.com/p/300/200?q=clean%20bedroom'],
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
      id: 'INV-001',
      description: 'Reparo Elétrico - Villa Sunshine',
      amount: 450.0,
      status: 'pending',
      date: '2024-05-10',
    },
  ],
  payments: [
    {
      id: 'PAY-001',
      tenantId: 'tenant1',
      tenantName: 'Michael Scott',
      propertyId: 'prop1',
      amount: 2500.0,
      date: '2024-05-01',
      dueDate: '2024-05-01',
      status: 'paid',
      type: 'rent',
    },
  ],
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

export const messages: Message[] = [
  {
    id: 'conv1',
    contact: 'Maria Silva (Cleaner)',
    contactId: 'partner1',
    ownerId: 'tenant_realestate',
    type: 'partner',
    lastMessage: 'Terminei a limpeza na Villa Sunshine.',
    time: '10:30',
    unread: 2,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    history: [],
  },
]

export const owner1Messages: Message[] = []
export const partner1Messages: Message[] = []
