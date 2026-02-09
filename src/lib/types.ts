import { type ClassValue } from 'clsx'

// Re-exporting previous types plus new ones
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
  | 'visits'
  | 'hotels'
  | 'performance'
  | 'guest_services'
  | 'pos'
  | 'marketing'

export type Action = 'view' | 'create' | 'edit' | 'delete'

export interface Permission {
  resource: Resource
  actions: Action[]
}

// New Types for Advanced Management
export interface GuestService {
  id: string
  name: string
  description: string
  price: number
  category: 'spa' | 'transport' | 'dining' | 'other'
  active: boolean
}

export interface ServiceOrder {
  id: string
  bookingId: string
  serviceId: string
  serviceName: string
  price: number
  date: string
  status: 'pending' | 'delivered' | 'cancelled'
  notes?: string
}

export interface PosItem {
  id: string
  name: string
  price: number
  category: 'minibar' | 'restaurant' | 'laundry' | 'shop'
  active: boolean
}

export interface PosTransaction {
  id: string
  bookingId: string
  roomId?: string
  items: {
    itemId: string
    name: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  timestamp: string
  status: 'charged' | 'paid' | 'void'
  performedBy?: string
}

export interface Promotion {
  id: string
  code: string
  type: 'percentage' | 'fixed_amount'
  value: number
  startDate: string
  endDate: string
  active: boolean
  description?: string
  usageCount: number
  maxUsage?: number
  totalDiscountApplied?: number
}

export interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'
  startDate: string
  endDate: string
  promotions: string[] // IDs of promotions
  targetAudience?: 'all' | 'past_guests' | 'leads'
  description?: string
}

export interface Feedback {
  id: string
  bookingId: string
  propertyId: string
  guestName: string
  rating: number
  comment: string
  date: string
  status: 'new' | 'reviewed' | 'addressed'
  response?: string
}

export interface ChannelMapping {
  id: string
  propertyId: string
  platform: 'airbnb' | 'booking.com' | 'vrbo'
  localRoomTypeId?: string
  otaRoomId: string
  otaRateId?: string
  status: 'mapped' | 'error' | 'pending'
  lastSync?: string
}

export interface MarketingWorkflow {
  id: string
  name: string
  trigger: 'booking_confirmed' | 'check_in' | 'check_out' | 'cancellation'
  offsetTime: number // hours, can be negative for 'before'
  templateId: string
  active: boolean
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

// --- Existing Types (Consolidated) ---

export interface AlertConfig {
  id: string
  trigger:
    | 'price_threshold'
    | 'upcoming_booking'
    | 'new_task'
    | 'low_inventory'
    | 'payment_received'
  frequency: 'immediate' | 'daily' | 'weekly'
  enabled: boolean
  label?: string
}

export interface FinancialSettings {
  companyName: string
  ein: string
  bankName: string
  routingNumber: string
  accountNumber: string
  gatewayProvider: 'stripe' | 'plaid' | 'manual'
  gateways: {
    stripe: { enabled: boolean; publicKey?: string; secretKey?: string }
    paypal: { enabled: boolean; clientId?: string }
    mercadoPago: { enabled: boolean; publicKey?: string; accessToken?: string }
  }
  pixKey?: string
  apiKey?: string
  apiSecret?: string
  crmProvider?: 'salesforce' | 'hubspot' | 'zoho' | 'none'
  crmApiKey?: string
  isProduction: boolean
  approvalThreshold?: number
  pmManagementFee?: number
  cleaningFeeRouting?: 'owner' | 'pm' | 'partner'
  maintenanceMarginLabor?: number
  maintenanceMarginMaterial?: number
  billComEnabled?: boolean
  billComOrgId?: string
  billComApiKey?: string
  billComEnvironment?: 'sandbox' | 'production'
  priceReviewThresholdDays?: number
  alertPreferences?: AlertConfig[]
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
  parentPartnerId?: string
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
  notificationPreferences?: {
    financials: boolean
    maintenance: boolean
    contractUpdates: boolean
  }
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
  country?: string
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

export interface HotelContact {
  id: string
  role: string
  name: string
  phone: string
  email: string
}

export interface Hotel {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  description?: string
  managerName?: string
  managerEmail?: string
  managerPhone?: string
  image?: string
  towers?: string[]
  amenities?: string[]
  policies?: string[]
  contacts?: HotelContact[]
}

export interface Tower {
  id: string
  hotelId: string
  name: string
  description?: string
  floors?: number
}

export type PropertyStatus =
  | 'interested'
  | 'rented'
  | 'available'
  | 'in_registration'
  | 'suspended'
  | 'released'
  | 'reserved'
  | 'sold'
  | 'sale_pending'
  | 'cleaning'
  | 'maintenance'
  | 'occupied'

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

export interface InventoryCheckResult {
  itemId?: string
  name: string
  category: string
  originalCondition: ItemCondition
  condition: ItemCondition
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

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  source: 'Zillow' | 'Idealista' | 'Website' | 'Other'
  date: string
  status: 'new' | 'contacted' | 'qualified' | 'lost'
  message?: string
}

export interface PriceHistory {
  date: string
  price: number
  changedBy?: string
}

export interface RoomCharacteristics {
  bedType: string
  view: string
  hasBalcony: boolean
  maxOccupancy: number
  sizeSqFt?: number
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
  linkedEntityId?: string
  linkedEntityName?: string
  linkedEntityType?: 'tenant' | 'owner' | 'partner'
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

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  minStock?: number
  unit?: string
  description?: string
  condition: ItemCondition
  notes?: string
  createdAt?: string
  updatedAt?: string
  damageHistory?: DamageRecord[]
  media?: InventoryMedia[]
}

export interface RatePlan {
  id: string
  name: string
  type: 'seasonal' | 'holiday' | 'long_stay' | 'last_minute' | 'standard'
  startDate?: string
  endDate?: string
  daysOfWeek?: number[]
  minStay?: number
  adjustmentType: 'percentage' | 'fixed_price'
  adjustmentValue: number
  active: boolean
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
  hotelId?: string
  towerId?: string
  roomNumber?: string
  status: PropertyStatus
  marketingStatus?: 'listed' | 'unlisted'
  listingPrice?: number
  purchasePrice?: number
  ratePlans?: RatePlan[]
  publishToPortals?: boolean
  portalSettings?: { zillow: boolean; idealista: boolean }
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
  description?: { pt: string; en: string; es: string }
  hoaRules?: { pt: string; en: string; es: string }
  documents?: PropertyDocument[]
  contractConfig?: { expirationAlertDays: number; renewalAlertDate?: string }
  ownerId: string
  agentId?: string
  iCalUrl?: string
  channelLinks?: ChannelLink[]
  fixedExpenses?: FixedExpense[]
  socialMedia?: SocialMediaLinks
  leadContact?: string
  healthScore?: number
  inventory?: InventoryItem[]
  leads?: Lead[]
  roomCharacteristics?: RoomCharacteristics
  priceHistory?: PriceHistory[]
  amenities?: string[]
  channelMappings?: ChannelMapping[]
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
  emergencyContact?: { name: string; phone: string; relation: string }
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
  inspections?: InventoryInspection[]
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
  earlyCheckIn?: string
  lateCheckOut?: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  totalAmount: number
  paid: boolean
  platform: 'airbnb' | 'vrbo' | 'direct' | 'booking.com' | 'other'
  notes?: string
  ledgerEntryId?: string
  generatedTasks?: string[]
  adults?: number
  children?: number
  inspections?: InventoryInspection[]
  feedbackId?: string
  checkedInAt?: string
  checkedOutAt?: string
  guestSignature?: string
  estimatedArrival?: string
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
  description?: string
  ownerInfo?: string
  secondContact?: { name: string; phone: string; email?: string }
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
  schedule?: { date: string; slots: string[]; value?: number }[]
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
  location?: { lat: number; lng: number; address: string }
  notes?: string
}

export interface TaskHistory {
  id: string
  action: 'create' | 'update' | 'approve' | 'reject' | 'comment'
  statusFrom?: string
  statusTo?: string
  userId: string
  userName: string
  timestamp: string
  note?: string
}

export type TaskType =
  | 'cleaning'
  | 'maintenance'
  | 'inspection'
  | 'guest_request'
  | 'reception'

export interface Task {
  id: string
  title: string
  propertyId: string
  propertyName: string
  propertyAddress?: string
  propertyCommunity?: string
  status: TaskStatus
  type: TaskType
  assignee: string
  assigneeId?: string
  partnerEmployeeId?: string
  date: string
  completedDate?: string
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
  source?: 'manual' | 'migration' | 'automation' | 'guest'
  inventoryItemId?: string
  lastNotified?: string
  invoiceId?: string
  approvalStatus?: 'owner_pending' | 'pm_pending' | 'approved'
  lastRemindedAt?: string
  createdBy?: string
  history?: TaskHistory[]
  assignedRole?: UserRole
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'pending_approval'
  | 'rejected'

export interface Invoice {
  id: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'approved' | 'sent'
  date: string
  fromId?: string
  toId?: string
  propertyId?: string
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
  type: 'info' | 'warning' | 'success' | 'critical'
  link?: string
  category?: 'financial' | 'maintenance' | 'contract' | 'system'
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
  trigger:
    | 'manual'
    | 'lease_start'
    | 'lease_end'
    | 'maintenance_request'
    | 'before_checkin'
    | 'after_checkout'
  steps: WorkflowStep[]
  active: boolean
  propertyIds?: string[] // Added propertyIds for multi-property selection
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

export interface ContactInfo {
  name: string
  email: string
  phone: string
}

export interface Advertiser {
  id: string
  name: string
  email: string
  phone: string
  address: string
  zipCode?: string
  city?: string
  state?: string
  country?: string
  contacts?: ContactInfo[]
  createdAt: string
}

export interface AdPricing {
  weekly: number
  biWeekly: number
  monthly: number
  placementModifiers?: {
    home_top: number
    home_bottom: number
    partner_page: number
    tenant_page: number
    pm_login?: number
  }
}

export interface Advertisement {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl: string
  active: boolean
  createdAt: string
  placement?:
    | 'home_top'
    | 'home_bottom'
    | 'partner_page'
    | 'tenant_page'
    | 'footer'
    | 'sidebar'
  placementType?: 'header' | 'footer'
  targetPages?: string[]
  advertiserId?: string
  validity?: 'weekly' | 'bi-weekly' | 'monthly'
  renewable?: boolean
  price?: number
  startDate?: string
  endDate?: string
}

export interface Visit {
  id: string
  propertyId: string
  propertyName: string
  clientName: string
  date: string
  status: 'scheduled' | 'completed' | 'canceled' | 'suspended' | 'rescheduled'
  notes?: string
  agentId?: string
  registeredBy?: string
  assignedTo?: string
  assignedRole?: string
  reason?: string
}

export type TourStep = {
  targetId: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export type TutorialModule = {
  key: string
  title: string
  description: string
  category: 'Operational' | 'CRM' | 'Financial' | 'Settings' | 'System'
  videoUrl: string
}

export interface NightAudit {
  id: string
  date: string
  totalRevenue: number
  totalOccupancy: number
  roomCharges: number
  serviceFees: number
  status: 'pending' | 'completed' | 'verified'
  generatedBy: string
  notes?: string
  details?: {
    checkIns: number
    checkOuts: number
    noShows: number
  }
}
