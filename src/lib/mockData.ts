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
} from '@/lib/types'

// System Users (Staff/Admins)
export const systemUsers: User[] = [
  {
    id: 'admin_platform',
    name: 'Platform Administrator',
    email: 'admin@platform.com',
    role: 'platform_owner',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99',
    status: 'active',
    isFirstLogin: false,
    address: '123 Tech Park, Silicon Valley, CA',
    taxId: '00-0000000',
  },
  {
    id: 'tenant_realestate',
    name: 'Real Estate Tenant',
    email: 'tenant@realestate.com',
    role: 'software_tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=98',
    parentId: 'admin_platform',
    status: 'active',
    isFirstLogin: false, // Set to true to test forced password change if needed
    hasPaidEntryFee: true, // Set to false to test payment wall
    subscriptionPlan: 'unlimited',
    taxId: '99-9999999',
    address: '456 Property Lane, Orlando, FL',
  },
  {
    id: 'pending_user',
    name: 'New Applicant',
    email: 'new@applicant.com',
    role: 'software_tenant',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=55',
    status: 'pending_approval',
    isFirstLogin: true,
    hasPaidEntryFee: false,
    subscriptionPlan: 'free',
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
    status: 'active',
    isFirstLogin: false,
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
      { resource: 'financial', actions: ['view', 'create', 'edit'] },
      { resource: 'portal', actions: ['view'] },
    ],
    allowedProfileTypes: ['short_term'],
    status: 'active',
    isFirstLogin: false,
  },
]

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

export const mockBankStatements: BankStatement[] = [
  {
    id: 'stmt_1',
    fileName: 'Chase_Statement_Apr2024.pdf',
    uploadDate: '2024-05-01',
    status: 'reconciled',
    itemsCount: 145,
    totalAmount: 12500.0,
    url: '#',
  },
  {
    id: 'stmt_2',
    fileName: 'Chase_Statement_May2024.csv',
    uploadDate: '2024-06-01',
    status: 'pending',
    itemsCount: 132,
    totalAmount: 14200.0,
    url: '#',
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
    address: '123 Palm Street',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    type: 'House',
    profileType: 'short_term',
    community: 'Sunny Isles HOA',
    condominiumId: 'condo1',
    status: 'rented',
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
    description: {
      pt: 'Linda villa moderna perto da Disney.',
      en: 'Beautiful modern villa near Disney.',
      es: 'Hermosa villa moderna cerca de Disney.',
    },
    iCalUrl: 'https://api.plataforma.com/ical/prop1/calendar.ics',
  },
  {
    id: 'prop2',
    name: 'Downtown Condo',
    address: '450 Brickell Ave',
    city: 'Miami',
    state: 'FL',
    zipCode: '33131',
    type: 'Condo',
    profileType: 'long_term',
    community: 'Brickell Heights',
    condominiumId: 'condo2',
    status: 'available',
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
    description: {
      pt: 'Apartamento de luxo no coração de Miami.',
      en: 'Luxury apartment in the heart of Miami.',
      es: 'Apartamento de lujo en el corazón de Miami.',
    },
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
    address: '123 Cleaning Rd, Orlando, FL',
    paymentInfo: {
      bankName: 'Bank of America',
      routingNumber: '111000222',
      accountNumber: '999888777',
    },
    linkedPropertyIds: ['prop1', 'prop2'],
    employees: [
      {
        id: 'emp1',
        name: 'Ana Helper',
        role: 'Staff',
        status: 'active',
        email: 'ana@sparkle.com',
        schedule: [
          {
            date: addDays(new Date(), 1).toISOString().split('T')[0],
            slots: ['09:00', '14:00'],
            value: 80,
          },
        ],
      },
      {
        id: 'emp2',
        name: 'Carlos Cleaner',
        role: 'Supervisor',
        status: 'active',
      },
    ],
    serviceRates: [
      {
        id: 'rate1',
        serviceName: 'Limpeza Padrão',
        price: 150.0,
        validFrom: '2024-01-01',
      },
      {
        id: 'rate2',
        serviceName: 'Limpeza Pesada',
        price: 250.0,
        validFrom: '2024-01-01',
      },
      {
        id: 'rate3',
        serviceName: 'Cleaning',
        price: 150.0,
        validFrom: '2024-01-01',
      },
    ],
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
    price: 150.0,
    recurrence: 'none',
  },
  {
    id: 'task2',
    title: 'Manutenção Mensal AC',
    propertyId: 'prop2',
    propertyName: 'Downtown Condo',
    status: 'pending',
    type: 'maintenance',
    assignee: 'Maria Silva',
    assigneeId: 'partner1',
    date: new Date().toISOString(),
    priority: 'medium',
    price: 120.0,
    recurrence: 'monthly',
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

export const ledgerEntries: LedgerEntry[] = [
  {
    id: 'ledg1',
    propertyId: 'prop1',
    date: subDays(new Date(), 5).toISOString(),
    type: 'income',
    category: 'Rent',
    amount: 2500.0,
    description: 'Aluguel Janeiro',
    status: 'cleared',
  },
  {
    id: 'ledg2',
    propertyId: 'prop1',
    date: subDays(new Date(), 2).toISOString(),
    type: 'expense',
    category: 'Maintenance',
    amount: 150.0,
    description: 'Reparo Ar Condicionado',
    status: 'cleared',
  },
  {
    id: 'ledg3',
    propertyId: 'prop1',
    date: subDays(new Date(), 1).toISOString(),
    type: 'expense',
    category: 'Cleaning',
    amount: 120.0,
    description: 'Limpeza de Rotina',
    beneficiaryId: 'partner1', // Linked to partner
    status: 'pending',
  },
  {
    id: 'ledg4',
    propertyId: 'prop2',
    date: subMonths(new Date(), 1).toISOString(),
    type: 'income',
    category: 'Rent',
    amount: 3200.0,
    description: 'Aluguel Dezembro',
    status: 'cleared',
  },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'log1',
    timestamp: subDays(new Date(), 1).toISOString(),
    userId: 'admin_platform',
    userName: 'Platform Administrator',
    action: 'login',
    entity: 'System',
    details: 'User logged in',
  },
  {
    id: 'log2',
    timestamp: subDays(new Date(), 2).toISOString(),
    userId: 'tenant_realestate',
    userName: 'Real Estate Tenant',
    action: 'update',
    entity: 'Property',
    entityId: 'prop1',
    details: 'Updated property description',
  },
]

export const genericServiceRates: ServiceRate[] = [
  {
    id: 'gen1',
    serviceName: 'Limpeza Padrão (2 Quartos)',
    price: 120.0,
    validFrom: '2024-01-01',
    type: 'generic',
  },
  {
    id: 'gen2',
    serviceName: 'Limpeza Padrão (3 Quartos)',
    price: 150.0,
    validFrom: '2024-01-01',
    type: 'generic',
  },
  {
    id: 'gen3',
    serviceName: 'Manutenção Hora Técnica',
    price: 85.0,
    validFrom: '2024-01-01',
    type: 'generic',
  },
]

export const notifications: Notification[] = [
  {
    id: 'notif1',
    title: 'Novo Agendamento',
    message: 'Agendamento de limpeza criado para Villa Sunshine',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'info',
  },
  {
    id: 'notif2',
    title: 'Aluguel Recebido',
    message: 'Pagamento de Michael Scott confirmado',
    timestamp: subDays(new Date(), 1).toISOString(),
    read: true,
    type: 'success',
  },
]
