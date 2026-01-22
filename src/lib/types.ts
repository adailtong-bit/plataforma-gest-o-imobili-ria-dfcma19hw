export type UserRole =
  | 'platform_owner'
  | 'software_tenant'
  | 'internal_user'
  | 'property_owner'
  | 'partner'
  | 'partner_employee'
  | 'tenant'

export type Resource =
  | 'dashboard'
  | 'properties'
  | 'condominiums'
  | 'tenants'
  | 'owners'
  | 'partners'
  | 'calendar'
  | 'tasks'
  | 'financial'
  | 'messages'
  | 'users'
  | 'settings'
  | 'audit_logs'
  | 'portal'
  | 'market_analysis'
  | 'workflows'
  | 'renewals'
  | 'publicity'
  | 'short_term' // Added resource

export type Action = 'view' | 'create' | 'edit' | 'delete'

export interface Permission {
  resource: Resource
  actions: Action[]
}

export interface FinancialSettings {
  companyName: string
  ein: string
  bankName: string
  routingNumber: string
  accountNumber: string
  gatewayProvider: 'stripe' | 'plaid' | 'manual'
  pixKey?: string // Brazil Pix
  apiKey?: string
  apiSecret?: string
  crmProvider?: 'salesforce' | 'hubspot' | 'zoho' | 'none'
  crmApiKey?: string
  isProduction: boolean
}

export interface BankStatement {
  id: string
  fileName: string
  uploadDate: string
  status: 'pending' | 'reconciled' | 'error'
  itemsCount: number
  totalAmount: number
  url: string
}

export interface PaymentIntegration {
  provider: 'bank_transfer' | 'credit_card' | 'bill_com'
  enabled: boolean
  apiKey?: string
  accountNumber?: string
  config?: Record<string, any>
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  country?: string // Geo-standardization
  companyName?: string
  parentId?: string // For hierarchy
  permissions?: Permission[] // For internal users
  allowedProfileTypes?: ('long_term' | 'short_term')[] // Property profile restrictions
  password?: string

  // New Access & Profile Fields
  status: 'active' | 'pending_activation' | 'pending_approval' | 'blocked'
  isFirstLogin: boolean
  taxId?: string // CPF/CNPJ or SSN/EIN
  address?: string

  // Monetization Fields (Relevant for software_tenant)
  hasPaidEntryFee?: boolean
  subscriptionPlan?: 'free' | 'pay_per_house' | 'unlimited'
}

export interface CondoContact {
  id: string
  role: string // Service Desk, Maintenance, Security
  name: string
  phone: string
  email: string
}

export interface HoaFeeHistory {
  id: string
  amount: number
  validFrom: string
  validTo?: string
}

export interface Condominium {
  id: string
  name: string
  address: string
  managerName?: string
  managerPhone?: string
  managerEmail?: string
  description?: string
  accessCredentials?: {
    guest?: string
    service?: string
    cleaning?: string
    amenities?: string
    gate?: string
    mainGateCar?: string
    pedestrianGate?: string
    poolCode?: string
    qrCodeUrl?: string
  }
  hoaFee?: number
  hoaFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually'
  hoaContract?: {
    name: string
    url: string
    date: string
  }
  contacts?: CondoContact[]
  feeHistory?: HoaFeeHistory[]
}

export type PropertyStatus =
  | 'interested'
  | 'rented'
  | 'available'
  | 'in_registration'
  | 'suspended'
  | 'released'

export interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDay: number
  frequency: 'monthly' | 'yearly'
  provider?: string
  accountNumber?: string
  // Enhanced Contract Fields
  contractStartDate?: string
  contractEndDate?: string
  recurringValue?: number // Explicit recurring value if different from amount
}

export interface SocialMediaLinks {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
  other?: string
}

export interface Property {
  id: string
  name: string
  address: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string // Geo-standardization
  additionalInfo?: string // New field for address refinement
  type: string
  profileType: 'long_term' | 'short_term'
  community: string
  condominiumId?: string
  status: PropertyStatus
  marketingStatus?: 'listed' | 'unlisted'
  listingPrice?: number // Marketing
  publishToPortals?: boolean // Marketing
  image: string
  gallery?: string[]
  bedrooms: number
  bathrooms: number
  guests: number

  // Access
  wifiSsid?: string
  wifiPassword?: string
  accessCodeBuilding?: string
  accessCodeUnit?: string
  accessCodeGuest?: string
  accessCodeService?: string
  accessCodeCleaning?: string

  // HOA
  hoaValue?: number
  hoaFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually'

  // Content
  description?: {
    pt: string
    en: string
    es: string
  }
  hoaRules?: {
    pt: string
    en: string
    es: string
  }

  // Documents
  documents?: PropertyDocument[]

  contractConfig?: {
    expirationAlertDays: number
    renewalAlertDate?: string
  }

  ownerId: string
  agentId?: string
  iCalUrl?: string

  // Financial
  fixedExpenses?: FixedExpense[]

  // New Marketing Fields
  socialMedia?: SocialMediaLinks
  leadContact?: string
}

export type DocumentCategory =
  | 'Contract'
  | 'Insurance'
  | 'ID'
  | 'Other'
  | 'Others' // Added as per requirement
  | 'Deed'
  | 'Inspection'
  | 'Passport'
  | 'SSN'

export interface PropertyDocument {
  id: string
  name: string
  url: string
  date: string
  size?: string
  type?: string
  category: DocumentCategory
  digitalSignatureStatus?: 'signed' | 'pending' | 'none'
}

export interface GenericDocument {
  id: string
  name: string
  url: string
  date: string
  size?: string
  type?: string
  category: DocumentCategory
}

export type NegotiationStatus =
  | 'negotiating'
  | 'owner_contacted'
  | 'tenant_contacted'
  | 'vacating'
  | 'closed'

export interface NegotiationLogEntry {
  id: string
  date: string
  action: string
  note: string
  user: string
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  country?: string
  propertyId?: string
  rentValue: number
  leaseStart?: string
  leaseEnd?: string
  status: 'active' | 'past' | 'prospective'
  role: UserRole
  avatar?: string
  documents?: GenericDocument[]

  // Extended fields
  idNumber?: string
  driverLicense?: string
  socialSecurity?: string
  references?: string
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }

  // Renewals
  negotiationStatus?: NegotiationStatus
  negotiationLogs?: NegotiationLogEntry[]
  suggestedRenewalPrice?: number
}

export interface Booking {
  id: string
  propertyId: string
  propertyName?: string // For denormalization convenience in lists
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string // ISO Date
  checkOut: string // ISO Date
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  totalAmount: number
  paid: boolean
  platform: 'airbnb' | 'vrbo' | 'direct' | 'booking.com' | 'other'
  notes?: string
  ledgerEntryId?: string // Link to financial record
  generatedTasks?: string[] // IDs of cleaning/inspection tasks
  adults?: number
  children?: number
}

export interface Owner {
  id: string
  name: string
  email: string
  phone: string
  country?: string
  status: 'active' | 'inactive'
  accountNumber?: string
  role: UserRole
  avatar?: string
  documents?: GenericDocument[]

  // Extended fields
  address?: string
  secondContact?: {
    name: string
    phone: string
    email?: string
  }
  pmAgreementUrl?: string
}

export interface ServiceRate {
  id: string
  serviceName: string
  price: number
  validFrom: string
  validTo?: string
  type?: 'generic' | 'specific'
}

export interface PartnerEmployee {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  status: 'active' | 'inactive'
  schedule?: {
    date: string
    slots: string[]
    value?: number
  }[]
}

export interface Partner {
  id: string
  name: string
  type: 'agent' | 'cleaning' | 'maintenance'
  companyName?: string
  email: string
  phone: string
  country?: string
  status: 'active' | 'inactive'
  rating?: number
  role: UserRole
  avatar?: string
  address?: string
  paymentInfo?: {
    bankName: string
    routingNumber: string
    accountNumber: string
  }
  serviceRates?: ServiceRate[]
  employees?: PartnerEmployee[]
  linkedPropertyIds?: string[]
  documents?: GenericDocument[]
}

export interface Evidence {
  id: string
  url: string
  type: 'arrival' | 'completion' | 'other'
  timestamp: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  notes?: string
}

export interface Task {
  id: string
  title: string
  propertyId: string
  propertyName: string
  propertyAddress?: string
  propertyCommunity?: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  type: 'cleaning' | 'maintenance' | 'inspection'
  assignee: string
  assigneeId?: string
  partnerEmployeeId?: string
  date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  images?: string[]
  evidence?: Evidence[]
  description?: string
  price?: number
  backToBack?: boolean
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  bookingId?: string // Link to Short Term Booking
}

export interface Invoice {
  id: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'approved'
  date: string
}

export interface Payment {
  id: string
  tenantId: string
  tenantName: string
  propertyId: string
  amount: number
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  type: 'rent' | 'deposit' | 'fee'
}

export interface LedgerEntry {
  id: string
  propertyId: string
  date: string
  dueDate?: string
  paymentDate?: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  referenceId?: string
  beneficiaryId?: string
  status: 'pending' | 'cleared' | 'void' | 'overdue' | 'unpaid'
  attachments?: { name: string; url: string }[]
  payee?: string // Added for advanced reporting
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'approve'
    | 'block'
    | 'renew'
    | 'other'
  entity: string
  entityId?: string
  details?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}

export interface Financials {
  revenue: { month: string; value: number }[]
  expenses: { category: string; value: number; fill: string }[]
  invoices: Invoice[]
  payments: Payment[]
}

export interface AutomationRule {
  id: string
  type: 'rent_reminder' | 'contract_expiry' | 'maintenance_update'
  enabled: boolean
  daysBefore: number
  template: string
}

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  role: UserRole
  actionType: 'task' | 'notification' | 'email' | 'approval'
  config?: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: 'manual' | 'lease_start' | 'lease_end' | 'maintenance_request'
  steps: WorkflowStep[]
  active: boolean
}

export interface MarketData {
  region: string
  averagePrice: number
  occupancyRate: number
  trend: 'up' | 'down' | 'stable'
  competitorCount: number
  averageDaysOnMarket: number
  // Expanded fields
  shortTermRate: number
  longTermRate: number
  pricePerSqFt: number
  saturationIndex: number
  propertyTaxAvg?: number
  hoaAvg?: number
}

export interface Message {
  id: string
  contact: string
  contactId: string
  ownerId: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  type?: string
  history: ChatMessage[]
}

export interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: string
  attachments?: string[]
}

export interface Advertiser {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

export interface AdPricing {
  weekly: number
  biWeekly: number
  monthly: number
}

export interface Advertisement {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl: string
  active: boolean
  createdAt: string
  placement?: 'footer' | 'sidebar'
  advertiserId?: string
  validity?: 'weekly' | 'bi-weekly' | 'monthly'
  renewable?: boolean
  price?: number
  startDate?: string
  endDate?: string
}
