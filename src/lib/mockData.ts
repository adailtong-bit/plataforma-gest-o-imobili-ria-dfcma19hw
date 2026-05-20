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
  Advertisement,
  Advertiser,
  AdPricing,
  Booking,
  CalendarBlock,
  MessageTemplate,
  ServiceCategory,
  Visit,
  Workflow,
  Hotel,
  Tower,
  TourStep,
  GuestService,
  PosItem,
  PosTransaction,
  Promotion,
  Campaign,
  ServiceOrder,
  Feedback,
  ChannelMapping,
  MarketingWorkflow,
  EmailTemplate,
  Invoice,
  Payment,
} from './types'

export const systemUsers: User[] = []
export const properties: Property[] = []
export const condominiums: Condominium[] = []
export const hotels: Hotel[] = []
export const towers: Tower[] = []
export const tenants: Tenant[] = []
export const owners: Owner[] = []
export const partners: Partner[] = []
export const tasks: Task[] = []
export const ledgerEntries: LedgerEntry[] = []
export const bookings: Booking[] = []
export const auditLogs: AuditLog[] = []
export const messages: Message[] = []
export const genericServiceRates: ServiceRate[] = []
export const notifications: Notification[] = []
export const advertisements: Advertisement[] = []
export const advertisers: Advertiser[] = []
export const calendarBlocks: CalendarBlock[] = []
export const messageTemplates: MessageTemplate[] = []
export const serviceCategories: ServiceCategory[] = []
export const visits: Visit[] = []
export const workflows: Workflow[] = []
export const tourSteps: TourStep[] = []
export const guestServices: GuestService[] = []
export const posItems: PosItem[] = []
export const posTransactions: PosTransaction[] = []
export const promotions: Promotion[] = []
export const campaigns: Campaign[] = []
export const serviceOrders: ServiceOrder[] = []
export const feedbacks: Feedback[] = []
export const channelMappings: ChannelMapping[] = []
export const marketingWorkflows: MarketingWorkflow[] = []
export const emailTemplates: EmailTemplate[] = []
export const automationRules: AutomationRule[] = []
export const mockBankStatements: BankStatement[] = []
export const defaultPaymentIntegrations: PaymentIntegration[] = []

export const adPricing: AdPricing = {
  weekly: 50,
  biWeekly: 90,
  monthly: 150,
  placementModifiers: {
    home_top: 20,
    home_bottom: 10,
    partner_page: 5,
    tenant_page: 15,
    performance: 25,
  },
}

export const financials: Financials = {
  revenue: [],
  expenses: [],
  invoices: [],
  payments: [],
}

export const defaultFinancialSettings: FinancialSettings = {
  companyName: 'Summerpm Inc',
  ein: '12-3456789',
  bankName: 'Chase',
  routingNumber: '122000248',
  accountNumber: '1234567890',
  gatewayProvider: 'stripe',
  gateways: {
    stripe: { enabled: true },
    paypal: { enabled: false },
    mercadoPago: { enabled: false },
  },
  isProduction: false,
  globalCurrency: 'USD',
}

export const marketAnalysisData = {
  marketTrends: [],
}

export const mockAdvertisers = advertisers
export const mockAdPricing = adPricing
