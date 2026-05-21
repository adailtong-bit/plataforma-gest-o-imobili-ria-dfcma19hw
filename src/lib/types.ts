export type UserRole =
  | 'master'
  | 'super_admin'
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
  | 'service_pricing'

export type Action = 'view' | 'create' | 'edit' | 'delete'

export interface Permission {
  resource: Resource
  actions: Action[]
}

export interface SeasonalPrice {
  id: string
  startDate: string
  endDate: string
  price: number
}

export interface ItemPrice {
  id: string
  price: number
  startDate: string
  endDate: string
}

export interface GuestService {
  id: string
  name: string
  description: string
  price: number
  category: 'spa' | 'transport' | 'dining' | 'other'
  active: boolean
  validityStart?: string
  seasonalPrices?: SeasonalPrice[]
  prices?: ItemPrice[]
  organizationId?: string
}

export interface ServiceOrder {
  id: string
  bookingId: string
  serviceId: string
  serviceName: string
  price: number
  date: string
  scheduledFor?: string
  status: 'pending' | 'delivered' | 'cancelled'
  notes?: string
  organizationId?: string
}

export interface PosItem {
  id: string
  name: string
  price: number
  category: 'minibar' | 'restaurant' | 'laundry' | 'shop'
  active: boolean
  validityStart?: string
  prices?: ItemPrice[]
  organizationId?: string
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
  organizationId?: string
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
  targetType?: 'all' | 'property' | 'hotel'
  targetId?: string
  scope?: 'global' | 'specific_rooms'
  roomIds?: string[]
  organizationId?: string
}

export interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'
  startDate: string
  endDate: string
  promotions: string[]
  targetAudience?: 'all' | 'past_guests' | 'leads'
  description?: string
  imageUrl?: string
  discountValue?: number
  discountType?: 'percentage' | 'fixed_amount'
  organizationId?: string
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
  organizationId?: string
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
  organizationId?: string
}

export interface MarketingWorkflow {
  id: string
  name: string
  trigger: 'booking_confirmed' | 'check_in' | 'check_out' | 'cancellation'
  offsetTime: number
  templateId: string
  active: boolean
  organizationId?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  organizationId?: string
}

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
  globalCurrency: 'USD' | 'BRL' | 'EUR'
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
  config?: Record<string, unknown>
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organizationId?: string
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
  number?: string
  complement?: string
  neighborhood?: string
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
  organizationId?: string
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
  number?: string
  neighborhood?: string
  city: string
  state: string
  country: string
  zipCode: string
  description?: string
  managerName?: string
  managerEmail?: string
  managerPhone?: string
  image?: string
  gallery?: string[]
  towers?: string[]
  amenities?: string[]
  policies?: string[]
  contacts?: HotelContact[]
  generalAccessCode?: string
  poolAccessCode?: string
  gameRoomAccessCode?: string
  organizationId?: string
}

export interface Tower {
  id: string
  hotelId: string
  name: string
  description?: string
  floors?: number
  organizationId?: string
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
  | 'vacant'

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

export interface PropertyContact {
  id: string
  role: string
  name: string
  phone: string
  email: string
}

export interface Property {
  id: string
  name: string
  address: string
  number?: string
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
  floor?: string
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
  contacts?: PropertyContact[]
  organizationId?: string
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
  status: 'active' | 'past' | 'prospective' | 'expiring_soon'
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
  ownerDecision?: 'pending' | 'accepted' | 'rejected' | 'counter'
  tenantDecision?: 'pending' | 'accepted' | 'rejected' | 'counter'
  tags?: string[]
  rentAdjustmentConfig?: {
    type: 'percentage' | 'fixed'
    value: number
    frequency: 'yearly'
    nextAdjustmentDate?: string
  }
  isDemo?: boolean
  inspections?: InventoryInspection[]
  cpfCnpj?: string
  rg?: string
  dob?: string
  nationality?: string
  maritalStatus?: string
  profession?: string
  monthlyIncome?: number
  secondaryPhone?: string
  whatsapp?: string
  zipCode?: string
  addressNumber?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  organizationId?: string
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
  baseAmount?: number
  promotionId?: string
  discountAmount?: number
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
  organizationId?: string
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
  organizationId?: string
}

export interface MessageTemplate {
  id: string
  name: string
  trigger: 'confirmation' | 'check_in_24h' | 'check_out_instructions' | 'manual'
  subject: string
  content: string
  active: boolean
  organizationId?: string
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
  cpfCnpj?: string
  rg?: string
  dob?: string
  nationality?: string
  maritalStatus?: string
  profession?: string
  secondaryPhone?: string
  whatsapp?: string
  addressNumber?: string
  complement?: string
  neighborhood?: string
  organizationId?: string
}

export interface ServiceCategory {
  id: string
  name: string
  color: string
  organizationId?: string
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
  country?: 'US' | 'BR' | 'ES'
  description?: string
  teamPayout?: number
  pmCommissionType?: 'fixed' | 'percentage'
  organizationId?: string
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
  skills?: string[]
}

export interface Partner {
  id: string
  name: string
  type: 'agent' | 'cleaning' | 'maintenance' | string
  companyName?: string
  entityType?: 'individual' | 'company'
  teams?: string
  email: string
  phone: string
  country?: string
  status: 'active' | 'inactive' | string
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
  source?: string
  origin?: string
  tags?: string[]
  serviceRates?: ServiceRate[]
  employees?: PartnerEmployee[]
  linkedPropertyIds?: string[]
  documents?: GenericDocument[]
  isDemo?: boolean
  cpfCnpj?: string
  rg?: string
  dob?: string
  nationality?: string
  maritalStatus?: string
  profession?: string
  secondaryPhone?: string
  whatsapp?: string
  addressNumber?: string
  complement?: string
  neighborhood?: string
  organizationId?: string
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
  pricingModel?: 'partner_driven' | 'pm_driven'
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
  organizationId?: string
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'pending_approval'
  | 'pending_acceptance'
  | 'rejected'

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'approved' | 'sent'
  date: string
  dueDate?: string
  fromName?: string
  fromEmail?: string
  fromPhone?: string
  fromAddress?: string
  toName?: string
  toEmail?: string
  toPhone?: string
  toAddress?: string
  fromId?: string
  toId?: string
  propertyId?: string
  type?: 'team_to_partner' | 'partner_to_pm' | 'admin_to_pm' | 'generic'
  bookingId?: string
  organizationId?: string
  items?: InvoiceItem[]
  notes?: string
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
  organizationId?: string
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
  costType?: 'fixed' | 'variable'
  isRecurring?: boolean
  recurrenceFrequency?: 'monthly' | 'yearly'
  nextRecurrenceGenerated?: boolean
  invoiceId?: string
  organizationId?: string
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
  organizationId?: string
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
  organizationId?: string
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
  organizationId?: string
}

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  role: UserRole
  actionType: 'task' | 'notification' | 'email' | 'approval'
  config?: Record<string, unknown>
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
  propertyIds?: string[]
  organizationId?: string
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
  organizationId?: string
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
  role?: string
}

export interface Advertiser {
  id: string
  name: string
  legalName?: string
  taxId?: string
  email: string
  phone: string
  address: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  billingContactName?: string
  billingContactEmail?: string
  billingContactPhone?: string
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
    sidebar?: number
    footer?: number
    header?: number
    performance?: number
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
    | 'header'
    | 'performance'
  placementType?: 'header' | 'footer'
  targetPages?: string[]
  advertiserId?: string
  validity?: 'weekly' | 'bi-weekly' | 'monthly'
  renewable?: boolean
  price?: number
  startDate?: string
  endDate?: string

  partnerId?: string
  propertyId?: string
  baseCost?: number
  pmCommissionType?: 'fixed' | 'percentage'
  pmCommissionValue?: number
  finalPrice?: number
  status?: 'draft' | 'active' | 'finalized' | 'cancelled' | 'expired'
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
  organizationId?: string
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
  organizationId?: string
}

export interface SubscriptionTier {
  id: string
  name: string
  basePrice: number
  maxUnits: number
  additionalUnitCost: number
  region: 'global' | 'us' | 'eu' | 'br'
  features: string[]
}

export interface SubscriptionDiscount {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  expiresAt: string
}

export interface PMSpecificPricing {
  id: string
  pmId: string
  fixedRate: number
}

export interface BillingAgreement {
  id: string
  sourceId?: string
  sourceRole?:
    | UserRole
    | 'admin'
    | 'team'
    | 'advertiser'
    | 'master'
    | 'partner_employee'
  targetId: string
  targetName?: string
  targetRole: UserRole | 'advertiser'
  name: string
  type:
    | 'fixed_admin_fee'
    | 'booking_percentage'
    | 'markup_maintenance'
    | 'markup_cleaning'
    | 'markup_purchases'
    | 'software_fee_per_house'
    | 'ad_placement_fee'
    | 'partner_cleaning_fee'
    | 'partner_maintenance_fee'
    | 'partner_parts_fee'
    | 'team_cleaning_fee'
    | 'team_maintenance_fee'
    | 'team_parts_fee'
    | 'custom'
  valueType: 'fixed' | 'percentage'
  value: number
  frequency: 'monthly' | 'per_booking' | 'per_task' | 'per_item'
  validFrom: string
  validTo?: string
  status: 'active' | 'historical'
  organizationId?: string
}

export interface BillingPeriod {
  id: string
  targetId: string
  targetName?: string
  startDate: string
  endDate: string
  status: 'open' | 'closed' | 'paid'
  totalAmount: number
  invoiceId?: string
  organizationId?: string
}
