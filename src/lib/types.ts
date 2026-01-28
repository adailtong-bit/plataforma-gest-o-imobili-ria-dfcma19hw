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
  | 'short_term'
  | 'migration'
  | 'analytics'
  | 'automation'
  | 'reports'

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
  pixKey?: string
  apiKey?: string
  apiSecret?: string
  crmProvider?: 'salesforce' | 'hubspot' | 'zoho' | 'none'
  crmApiKey?: string
  isProduction: boolean
  approvalThreshold?: number
  // Billing Model
  pmManagementFee?: number
  cleaningFeeRouting?: 'owner' | 'pm' | 'partner'
  maintenanceMarginLabor?: number
  maintenanceMarginMaterial?: number
  // Bill.com Integration
  billComEnabled?: boolean
  billComOrgId?: string
  billComApiKey?: string
  billComEnvironment?: 'sandbox' | 'production'
  // Service Pricing
  priceReviewThresholdDays?: number
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
  country?: string
  companyName?: string
  parentId?: string
  parentPartnerId?: string // Link employee to partner entity
  permissions?: Permission[]
  allowedProfileTypes?: ('long_term' | 'short_term')[]
  password?: string
  status: 'active' | 'pending_activation' | 'pending_approval' | 'blocked'
  isFirstLogin: boolean
  taxId?: string
  address?: string
  hasPaidEntryFee?: boolean
  subscriptionPlan?: 'free' | 'pay_per_house' | 'unlimited'
  mirrorAdmin?: boolean
  isDemo?: boolean
}

export interface CondoContact {
  id: string
  role: string
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
  zipCode?: string
  city?: string
  state?: string
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
  | 'reserved'

export interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDay: number
  frequency: 'monthly' | 'yearly'
  provider?: string
  accountNumber?: string
  contractStartDate?: string
  contractEndDate?: string
  recurringValue?: number
}

export interface SocialMediaLinks {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
  other?: string
}

export interface ChannelLink {
  id: string
  platform:
    | 'airbnb'
    | 'booking.com'
    | 'vrbo'
    | 'expedia'
    | 'tripadvisor'
    | 'other'
  url: string
  lastSync?: string
  status: 'active' | 'error' | 'pending'
}

export type ItemCondition =
  | 'New'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Damaged'
  | 'Missing'
  | 'Broken'

export interface DamageRecord {
  id: string
  date: string
  description: string
  reportedBy?: string
  images?: string[]
  linkedTaskId?: string
}

export interface InventoryMedia {
  id: string
  url: string
  type: 'image' | 'video'
  date: string
  notes?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  description?: string
  condition: ItemCondition
  notes?: string
  createdAt?: string
  updatedAt?: string
  damageHistory?: DamageRecord[]
  media?: InventoryMedia[]
}

export interface InventoryCheckResult {
  itemId?: string // Reference to original item
  name: string
  category: string
  originalCondition: ItemCondition
  condition: ItemCondition // Observed condition
  notes?: string
  quantity: number
}

export interface InventoryInspection {
  id: string
  date: string
  type: 'check_in' | 'check_out'
  performedBy: string
  items: InventoryCheckResult[]
  notes?: string
  signature?: string
}

export interface Property {
  id: string
  name: string
  address: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  additionalInfo?: string
  type: string
  profileType: 'long_term' | 'short_term'
  community: string
  condominiumId?: string
  status: PropertyStatus
  marketingStatus?: 'listed' | 'unlisted'
  listingPrice?: number
  publishToPortals?: boolean
  image: string
  gallery?: string[]
  bedrooms: number
  bathrooms: number
  guests: number
  wifiSsid?: string
  wifiPassword?: string
  accessCodeBuilding?: string
  accessCodeUnit?: string
  accessCodeGuest?: string
  accessCodeService?: string
  accessCodeCleaning?: string
  accessCodePool?: string
  hoaValue?: number
  hoaFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually'
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
  documents?: PropertyDocument[]
  contractConfig?: {
    expirationAlertDays: number
    renewalAlertDate?: string
  }
  ownerId: string
  agentId?: string
  iCalUrl?: string
  channelLinks?: ChannelLink[]
  fixedExpenses?: FixedExpense[]
  socialMedia?: SocialMediaLinks
  leadContact?: string
  healthScore?: number
  inventory?: InventoryItem[] // Inventory Management
}

export type DocumentCategory =
  | 'Contract'
  | 'Insurance'
  | 'ID'
  | 'Other'
  | 'Others'
  | 'Deed'
  | 'Inspection'
  | 'Passport'
  | 'SSN'
  | 'DriverLicense'

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
  address?: string
  propertyId?: string
  rentValue: number
  leaseStart?: string
  leaseEnd?: string
  status: 'active' | 'past' | 'prospective'
  role: UserRole
  avatar?: string
  documents?: GenericDocument[]
  idNumber?: string
  passport?: string
  driverLicense?: string
  socialSecurity?: string
  references?: string
  referralContacts?: { name: string; phone: string; email?: string }[]
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  negotiationStatus?: NegotiationStatus
  negotiationLogs?: NegotiationLogEntry[]
  suggestedRenewalPrice?: number
  rentAdjustmentConfig?: {
    type: 'percentage' | 'fixed'
    value: number
    frequency: 'yearly'
    nextAdjustmentDate?: string
  }
  isDemo?: boolean
  inspections?: InventoryInspection[] // Check-in/Check-out Inspections
}

export interface Booking {
  id: string
  propertyId: string
  propertyName?: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  totalAmount: number
  paid: boolean
  platform: 'airbnb' | 'vrbo' | 'direct' | 'booking.com' | 'other'
  notes?: string
  ledgerEntryId?: string
  generatedTasks?: string[]
  adults?: number
  children?: number
  inspections?: InventoryInspection[] // Short-term Inspections
}

export interface CalendarBlock {
  id: string
  propertyId: string
  startDate: string
  endDate: string
  type: 'manual_block' | 'maintenance' | 'external_sync'
  notes?: string
  taskId?: string
  source?: string
}

export interface MessageTemplate {
  id: string
  name: string
  trigger: 'confirmation' | 'check_in_24h' | 'check_out_instructions' | 'manual'
  subject: string
  content: string
  active: boolean
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
  address?: string
  zipCode?: string
  city?: string
  state?: string
  secondContact?: {
    name: string
    phone: string
    email?: string
  }
  pmAgreementUrl?: string
  isDemo?: boolean
}

export interface ServiceCategory {
  id: string
  name: string
  color: string
}

export interface ServiceRate {
  id: string
  serviceName: string
  servicePrice: number
  partnerPayment: number
  pmValue: number
  productPrice: number
  validFrom: string
  validTo?: string
  type?: 'generic' | 'specific'
  categoryId?: string
  lastUpdated?: string
}

export interface PartnerEmployee {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  address?: string
  zipCode?: string
  city?: string
  state?: string
  country?: string
  documents?: GenericDocument[]
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
  zipCode?: string
  city?: string
  state?: string
  paymentInfo?: {
    bankName: string
    routingNumber: string
    accountNumber: string
    bankNumber?: string
    zelle?: string
  }
  serviceRates?: ServiceRate[]
  employees?: PartnerEmployee[]
  linkedPropertyIds?: string[]
  documents?: GenericDocument[]
  isDemo?: boolean
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
  status:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'approved'
    | 'pending_approval'
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
  laborCost?: number
  materialCost?: number
  billableAmount?: number
  teamMemberPayout?: number
  backToBack?: boolean
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  bookingId?: string
  rating?: number
  feedback?: string
  source?: 'manual' | 'migration' | 'automation'
  inventoryItemId?: string
  lastNotified?: string // Supplier Communication Automation
  invoiceId?: string
}

export interface Invoice {
  id: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'approved' | 'sent'
  date: string
  fromId?: string
  toId?: string
  type?: 'team_to_partner' | 'partner_to_pm' | 'admin_to_pm' | 'generic'
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
  payee?: string
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
    | 'sync'
    | 'import'
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
  type:
    | 'rent_reminder'
    | 'contract_expiry'
    | 'maintenance_update'
    | 'auto_approve_task'
    | 'auto_generate_invoice'
  enabled: boolean
  daysBefore?: number
  template?: string
  threshold?: number
  event?: 'task_completion' | 'booking_confirmation'
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

export interface ChatAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'pdf' | 'file'
  size?: string
}

export interface ChatMessage {
  id: string
  text: string
  senderId: string
  timestamp: string
  attachments?: ChatAttachment[]
  read?: boolean
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
