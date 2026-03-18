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
  TaskStatus,
  Invoice,
  Payment,
} from './types'

const generated = (() => {
  const systemUsers: User[] = [
    {
      id: 'user1',
      name: 'Platform Admin',
      email: 'admin@corepm.com',
      role: 'platform_owner',
      status: 'active',
      isFirstLogin: false,
    },
  ]

  const properties: Property[] = []
  const condominiums: Condominium[] = []
  const hotels: Hotel[] = []
  const towers: Tower[] = []
  const tenants: Tenant[] = []
  const owners: Owner[] = []
  const partners: Partner[] = []
  const tasks: Task[] = []
  const ledgerEntries: LedgerEntry[] = []
  const invoices: Invoice[] = []
  const payments: Payment[] = []
  const bookings: Booking[] = []
  const auditLogs: AuditLog[] = []
  const messages: Message[] = []
  const genericServiceRates: ServiceRate[] = []
  const notifications: Notification[] = []
  const advertisements: Advertisement[] = []
  const advertisers: Advertiser[] = []
  const adPricing: AdPricing = {
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
  const calendarBlocks: CalendarBlock[] = []
  const messageTemplates: MessageTemplate[] = []
  const serviceCategories: ServiceCategory[] = []
  const visits: Visit[] = []
  const workflows: Workflow[] = []
  const tourSteps: TourStep[] = []
  const guestServices: GuestService[] = []
  const posItems: PosItem[] = []
  const posTransactions: PosTransaction[] = []
  const promotions: Promotion[] = []
  const campaigns: Campaign[] = []
  const serviceOrders: ServiceOrder[] = []
  const feedbacks: Feedback[] = []
  const channelMappings: ChannelMapping[] = []
  const marketingWorkflows: MarketingWorkflow[] = []
  const emailTemplates: EmailTemplate[] = []
  const automationRules: AutomationRule[] = []
  const mockBankStatements: BankStatement[] = []
  const defaultPaymentIntegrations: PaymentIntegration[] = []

  const defaultFinancialSettings: FinancialSettings = {
    companyName: 'COREPM Inc',
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

  const marketAnalysisData = {
    marketTrends: [
      { month: 'Jan', rate: 120, occupancy: 65 },
      { month: 'Feb', rate: 130, occupancy: 70 },
      { month: 'Mar', rate: 145, occupancy: 80 },
      { month: 'Apr', rate: 160, occupancy: 85 },
      { month: 'May', rate: 180, occupancy: 90 },
      { month: 'Jun', rate: 200, occupancy: 95 },
    ],
  }

  const orgs = [
    { id: 'org_acme', name: 'Acme Property Management', domain: 'acme.com' },
    {
      id: 'org_stellar',
      name: 'Stellar Management',
      domain: 'stellar.com',
    },
  ]

  const firstNames = [
    'John',
    'Jane',
    'Michael',
    'Emily',
    'David',
    'Sarah',
    'Robert',
    'Jessica',
    'William',
    'Ashley',
    'James',
    'Mary',
    'Richard',
    'Patricia',
  ]
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Miller',
    'Davis',
    'Garcia',
    'Rodriguez',
    'Wilson',
    'Martinez',
    'Anderson',
  ]

  const getRandomName = (seed: number) =>
    `${firstNames[seed % firstNames.length]} ${
      lastNames[(seed * 3) % lastNames.length]
    }`
  const getAvatar = (seed: number) =>
    `https://img.usecurling.com/ppl/thumbnail?seed=${seed}`

  // Global static items
  advertisers.push(
    {
      id: 'adv1',
      name: 'Home Services LLC',
      email: 'contact@homeservices.com',
      phone: '555-1234',
      address: '123 Main St',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'adv2',
      name: 'Orlando Cleaners',
      email: 'sales@orlandoclean.com',
      phone: '555-5678',
      address: '456 Oak Ave',
      createdAt: new Date().toISOString(),
    },
  )

  advertisements.push({
    id: 'ad1',
    title: 'Premium Cleaning Tools',
    imageUrl: 'https://img.usecurling.com/p/400/200?q=cleaning',
    linkUrl: '#',
    active: true,
    placement: 'performance',
    createdAt: new Date().toISOString(),
  })

  serviceCategories.push(
    { id: 'sc_clean', name: 'Cleaning', color: '#3b82f6' },
    { id: 'sc_maint', name: 'Maintenance', color: '#ef4444' },
  )

  guestServices.push(
    {
      id: 'gs1',
      name: 'Airport Transfer',
      description: 'One-way transfer',
      price: 50,
      category: 'transport',
      active: true,
    },
    {
      id: 'gs2',
      name: 'Massage',
      description: '1-hour relaxing massage',
      price: 100,
      category: 'spa',
      active: true,
    },
  )

  posItems.push(
    {
      id: 'pos1',
      name: 'Water Bottle',
      price: 3,
      category: 'minibar',
      active: true,
    },
    {
      id: 'pos2',
      name: 'Snack Pack',
      price: 5,
      category: 'minibar',
      active: true,
    },
  )

  workflows.push({
    id: 'wf1',
    name: 'Check-out Cleaning',
    description: 'Auto create cleaning task on checkout',
    trigger: 'after_checkout',
    active: true,
    steps: [
      { id: 'wfs1', name: 'Create Task', role: 'partner', actionType: 'task' },
    ],
  })

  automationRules.push({
    id: 'ar1',
    type: 'auto_generate_invoice',
    enabled: true,
    event: 'task_completion',
  })

  // Loop through orgs
  orgs.forEach((org, orgIdx) => {
    // Admin
    systemUsers.push({
      id: `u_${org.id}_admin`,
      name: `${org.name} Admin`,
      email: `admin@${org.domain}`,
      role: 'software_tenant',
      organizationId: org.id,
      status: 'active',
      isFirstLogin: false,
      companyName: org.name,
    })

    // Staff
    for (let i = 0; i < 3; i++) {
      systemUsers.push({
        id: `u_${org.id}_staff_${i}`,
        name: `Staff ${i + 1} (${org.name})`,
        email: `staff${i + 1}@${org.domain}`,
        role: 'internal_user',
        organizationId: org.id,
        status: 'active',
        isFirstLogin: false,
        permissions: [
          { resource: 'dashboard', actions: ['view'] },
          {
            resource: 'properties',
            actions: ['view', 'create', 'edit', 'delete'],
          },
        ],
      })
    }

    // Condos & Hotels
    condominiums.push({
      id: `condo_${org.id}_1`,
      name: `Sunset Villas ${org.name}`,
      address: '123 Sunset Blvd',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      managerName: 'Mike Manager',
      managerPhone: '555-0001',
      accessCredentials: { gate: '1234', poolCode: '9988' },
      organizationId: org.id,
    })

    hotels.push({
      id: `hotel_${org.id}_1`,
      name: `Grand Resort ${org.name}`,
      address: '100 Resort Way',
      city: 'Orlando',
      state: 'FL',
      zipCode: '32819',
      country: 'US',
      managerName: 'Sarah Resort',
      towers: [`t_${org.id}_1`],
      organizationId: org.id,
    })

    towers.push({
      id: `t_${org.id}_1`,
      hotelId: `hotel_${org.id}_1`,
      name: 'North Tower',
      floors: 15,
      organizationId: org.id,
    })

    // Owners
    for (let i = 0; i < 5; i++) {
      owners.push({
        id: `o_${org.id}_${i}`,
        name: getRandomName(orgIdx * 10 + i),
        email: `owner${i}@example.com`,
        phone: '555-' + (1000 + i),
        status: 'active',
        role: 'property_owner',
        organizationId: org.id,
        avatar: getAvatar(orgIdx * 10 + i),
      })
    }

    // Partners
    for (let i = 0; i < 3; i++) {
      partners.push({
        id: `p_${org.id}_${i}`,
        name: `${i % 2 === 0 ? 'Elite Cleaning' : 'Quick Maintenance'} ${org.name}`,
        type: i % 2 === 0 ? 'cleaning' : 'maintenance',
        email: `partner${i}@example.com`,
        phone: '555-' + (2000 + i),
        status: 'active',
        role: 'partner',
        organizationId: org.id,
        entityType: 'company',
        employees: [
          {
            id: `pe_${org.id}_${i}_1`,
            name: 'Emp 1',
            role: 'Staff',
            status: 'active',
          },
          {
            id: `pe_${org.id}_${i}_2`,
            name: 'Emp 2',
            role: 'Staff',
            status: 'active',
          },
        ],
      })
    }

    // Tenants
    for (let i = 0; i < 15; i++) {
      const leaseEndDate = new Date()
      leaseEndDate.setDate(leaseEndDate.getDate() + (i * 15 - 60))

      tenants.push({
        id: `t_${org.id}_${i}`,
        name: getRandomName(orgIdx * 20 + i),
        email: `tenant${i}@example.com`,
        phone: '555-' + (3000 + i),
        status: 'active',
        role: 'tenant',
        rentValue: 1500 + i * 100,
        leaseEnd: leaseEndDate.toISOString(),
        organizationId: org.id,
        negotiationStatus:
          leaseEndDate.getTime() < Date.now() + 60 * 86400000
            ? 'negotiating'
            : undefined,
        suggestedRenewalPrice: 1600 + i * 100,
      })
    }

    // Properties (10 LTR, 10 STR)
    for (let i = 0; i < 20; i++) {
      const isStr = i < 10
      const pid = `p_${org.id}_${i}`
      const ownerId = `o_${org.id}_${i % 5}`

      properties.push({
        id: pid,
        name: `${isStr ? 'Vacation Home' : 'Apt'} ${i + 1} - ${org.name}`,
        address: `100${i} Main St`,
        city: 'Orlando',
        state: 'FL',
        zipCode: '32819',
        country: 'US',
        type: isStr ? 'House' : 'Apartment',
        profileType: isStr ? 'short_term' : 'long_term',
        community: isStr ? `Sunset Villas ${org.name}` : 'Downtown',
        condominiumId: isStr ? `condo_${org.id}_1` : undefined,
        status: isStr ? 'available' : 'rented',
        bedrooms: 2 + (i % 3),
        bathrooms: 1 + (i % 2),
        guests: 4 + (i % 4) * 2,
        ownerId: ownerId,
        image: `https://img.usecurling.com/p/600/400?q=${isStr ? 'vacation%20home' : 'apartment'}&seed=${orgIdx * 20 + i}`,
        listingPrice: isStr ? 200 + i * 10 : 2000 + i * 100,
        hoaValue: 300,
        organizationId: org.id,
      })

      // LTR Tenant assignment & rent history
      if (!isStr) {
        const tenant = tenants[i % 15]
        tenant.propertyId = pid

        for (let m = 0; m < 6; m++) {
          const d = new Date()
          d.setMonth(d.getMonth() - m)
          const rentAmt = tenant.rentValue

          ledgerEntries.push({
            id: `le_rent_${pid}_${m}`,
            propertyId: pid,
            date: d.toISOString(),
            type: 'income',
            category: 'Rent',
            amount: rentAmt,
            description: `Rent payment - ${tenant.name}`,
            status: 'cleared',
            organizationId: org.id,
          })

          invoices.push({
            id: `inv_rent_${pid}_${m}`,
            description: `Rent - ${d.toLocaleString('default', { month: 'long' })}`,
            amount: rentAmt,
            status: 'paid',
            date: d.toISOString(),
            propertyId: pid,
            toId: tenant.id,
            type: 'generic',
            organizationId: org.id,
          })
        }
      }

      // STR Bookings
      if (isStr) {
        // Past Bookings
        for (let b = 0; b < 5; b++) {
          const checkIn = new Date()
          checkIn.setDate(checkIn.getDate() - (b * 15 + 10))
          const checkOut = new Date(checkIn)
          checkOut.setDate(checkOut.getDate() + 5)

          const bid = `bkg_past_${pid}_${b}`
          const amount = 1000 + b * 50

          bookings.push({
            id: bid,
            propertyId: pid,
            propertyName: `${isStr ? 'Vacation Home' : 'Apt'} ${i + 1}`,
            guestName: getRandomName(orgIdx * 100 + i * 5 + b),
            guestEmail: `guest${b}@example.com`,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            status: 'checked_out',
            totalAmount: amount,
            baseAmount: amount,
            paid: true,
            platform: ['airbnb', 'vrbo', 'direct', 'booking.com'][b % 4] as any,
            organizationId: org.id,
          })

          feedbacks.push({
            id: `fb_${bid}`,
            bookingId: bid,
            propertyId: pid,
            guestName: getRandomName(orgIdx * 100 + i * 5 + b),
            rating: 4 + (b % 2),
            comment:
              'Great stay, very clean and comfortable. Will definitely return!',
            date: checkOut.toISOString(),
            status: 'reviewed',
            organizationId: org.id,
          })

          ledgerEntries.push({
            id: `le_bkg_${bid}`,
            propertyId: pid,
            date: checkIn.toISOString(),
            type: 'income',
            category: 'Booking',
            amount: amount,
            description: `Booking payout - ${bid}`,
            status: 'cleared',
            organizationId: org.id,
          })

          invoices.push({
            id: `inv_bkg_${bid}`,
            description: `Booking Invoice ${bid}`,
            amount: amount,
            status: 'paid',
            date: checkIn.toISOString(),
            propertyId: pid,
            bookingId: bid,
            type: 'generic',
            organizationId: org.id,
          })
        }

        // Current Booking
        const currentCheckIn = new Date()
        currentCheckIn.setDate(currentCheckIn.getDate() - 1)
        const currentCheckOut = new Date(currentCheckIn)
        currentCheckOut.setDate(currentCheckOut.getDate() + 4)
        bookings.push({
          id: `bkg_cur_${pid}`,
          propertyId: pid,
          propertyName: `Vacation Home ${i + 1}`,
          guestName: getRandomName(orgIdx * 100 + i * 5 + 5),
          guestEmail: `guestcur@example.com`,
          checkIn: currentCheckIn.toISOString(),
          checkOut: currentCheckOut.toISOString(),
          status: 'checked_in',
          totalAmount: 1200,
          baseAmount: 1200,
          paid: true,
          platform: 'airbnb',
          organizationId: org.id,
        })

        // Future Bookings
        for (let b = 0; b < 2; b++) {
          const futureCheckIn = new Date()
          futureCheckIn.setDate(futureCheckIn.getDate() + (b * 10 + 10))
          const futureCheckOut = new Date(futureCheckIn)
          futureCheckOut.setDate(futureCheckOut.getDate() + 5)
          bookings.push({
            id: `bkg_fut_${pid}_${b}`,
            propertyId: pid,
            propertyName: `Vacation Home ${i + 1}`,
            guestName: getRandomName(orgIdx * 100 + i * 5 + 6 + b),
            guestEmail: `guestfut${b}@example.com`,
            checkIn: futureCheckIn.toISOString(),
            checkOut: futureCheckOut.toISOString(),
            status: 'confirmed',
            totalAmount: 1300,
            baseAmount: 1300,
            paid: false,
            platform: 'direct',
            organizationId: org.id,
          })
        }

        // Cancelled Booking
        const cancCheckIn = new Date()
        cancCheckIn.setDate(cancCheckIn.getDate() + 20)
        const cancCheckOut = new Date(cancCheckIn)
        cancCheckOut.setDate(cancCheckOut.getDate() + 3)
        bookings.push({
          id: `bkg_canc_${pid}`,
          propertyId: pid,
          propertyName: `Vacation Home ${i + 1}`,
          guestName: getRandomName(orgIdx * 100 + i * 5 + 8),
          guestEmail: `guestcanc@example.com`,
          checkIn: cancCheckIn.toISOString(),
          checkOut: cancCheckOut.toISOString(),
          status: 'cancelled',
          totalAmount: 500,
          baseAmount: 500,
          paid: false,
          platform: 'vrbo',
          organizationId: org.id,
        })
      }

      // Tasks for property
      for (let t = 0; t < 4; t++) {
        const type = t % 2 === 0 ? 'cleaning' : 'maintenance'
        const partnerId = `p_${org.id}_${t % 2 === 0 ? 0 : 1}`
        const partnerName =
          partners.find((p) => p.id === partnerId)?.name || 'Partner'

        const statuses: TaskStatus[] = [
          'completed',
          'pending',
          'in_progress',
          'pending_approval',
        ]
        const status = statuses[t]

        tasks.push({
          id: `tsk_${pid}_${t}`,
          title: `${type === 'cleaning' ? 'Post-checkout Cleaning' : 'AC Repair'} - ${pid}`,
          propertyId: pid,
          propertyName: `Property ${i + 1}`,
          status: status,
          approvalStatus:
            status === 'pending_approval' ? 'owner_pending' : undefined,
          type: type,
          assignee: partnerName,
          assigneeId: partnerId,
          date: new Date(Date.now() + (t * 2 - 4) * 86400000).toISOString(),
          priority: t % 3 === 0 ? 'high' : 'medium',
          price: 150 + t * 20,
          laborCost: 100 + t * 10,
          organizationId: org.id,
        })

        if (status === 'completed') {
          ledgerEntries.push({
            id: `le_tsk_${pid}_${t}`,
            propertyId: pid,
            date: new Date().toISOString(),
            type: 'expense',
            category: type === 'cleaning' ? 'Cleaning' : 'Maintenance',
            amount: 150 + t * 20,
            description: `Service cost - ${type}`,
            status: 'cleared',
            organizationId: org.id,
          })
        }
      }
    }

    // Visits
    for (let i = 0; i < 5; i++) {
      visits.push({
        id: `v_${org.id}_${i}`,
        propertyId: `p_${org.id}_${i}`,
        propertyName: `Vacation Home ${i + 1}`,
        clientName: getRandomName(orgIdx * 50 + i),
        date: new Date(Date.now() + i * 86400000).toISOString(),
        status: i % 2 === 0 ? 'completed' : 'scheduled',
        reason: 'showing',
        organizationId: org.id,
      })
    }

    // Messages
    for (let i = 0; i < 5; i++) {
      messages.push({
        id: `msg_${org.id}_${i}`,
        contact: getRandomName(orgIdx * 60 + i),
        contactId: `t_${org.id}_${i}`,
        ownerId: `u_${org.id}_admin`,
        lastMessage: 'Is the maintenance done?',
        time: new Date().toISOString(),
        unread: i % 2,
        avatar: getAvatar(orgIdx * 60 + i),
        history: [
          {
            id: 'h1',
            text: 'Hi, I need help with the AC.',
            senderId: `t_${org.id}_${i}`,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'h2',
            text: 'We will send someone today.',
            senderId: `u_${org.id}_admin`,
            timestamp: new Date(Date.now() - 40000000).toISOString(),
          },
          {
            id: 'h3',
            text: 'Is the maintenance done?',
            senderId: `t_${org.id}_${i}`,
            timestamp: new Date().toISOString(),
          },
        ],
        organizationId: org.id,
      })
    }

    // Audit logs
    for (let i = 0; i < 50; i++) {
      auditLogs.push({
        id: `al_${org.id}_${i}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        userId: `u_${org.id}_admin`,
        userName: `${org.name} Admin`,
        action: i % 3 === 0 ? 'login' : i % 2 === 0 ? 'update' : 'create',
        entity: i % 3 === 0 ? 'Auth' : i % 2 === 0 ? 'Property' : 'Task',
        details: `User performed action ${i} successfully.`,
        organizationId: org.id,
      })
    }

    // Promotions & Campaigns
    promotions.push({
      id: `promo_${org.id}`,
      code: 'SUMMER20',
      type: 'percentage',
      value: 20,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      active: true,
      usageCount: 5,
      targetType: 'all',
      organizationId: org.id,
    })
    campaigns.push({
      id: `camp_${org.id}`,
      name: 'Summer Deal',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      promotions: [`promo_${org.id}`],
      targetAudience: 'all',
      discountValue: 20,
      discountType: 'percentage',
      organizationId: org.id,
    })
  })

  const financials: Financials = {
    revenue: [
      { month: 'Jan', value: 15000 },
      { month: 'Feb', value: 18000 },
      { month: 'Mar', value: 22000 },
      { month: 'Apr', value: 21000 },
      { month: 'May', value: 25000 },
      { month: 'Jun', value: 28000 },
    ],
    expenses: [
      { category: 'Maintenance', value: 4500, fill: '#ef4444' },
      { category: 'Cleaning', value: 3200, fill: '#3b82f6' },
      { category: 'Taxes', value: 1500, fill: '#eab308' },
      { category: 'Utilities', value: 2100, fill: '#8b5cf6' },
    ],
    invoices,
    payments,
  }

  return {
    systemUsers,
    properties,
    condominiums,
    hotels,
    towers,
    tenants,
    owners,
    partners,
    tasks,
    ledgerEntries,
    financials,
    bookings,
    auditLogs,
    messages,
    genericServiceRates,
    notifications,
    advertisements,
    advertisers,
    adPricing,
    calendarBlocks,
    messageTemplates,
    serviceCategories,
    visits,
    workflows,
    tourSteps,
    guestServices,
    posItems,
    posTransactions,
    promotions,
    campaigns,
    serviceOrders,
    feedbacks,
    channelMappings,
    marketingWorkflows,
    emailTemplates,
    automationRules,
    mockBankStatements,
    defaultPaymentIntegrations,
    defaultFinancialSettings,
    marketAnalysisData,
  }
})()

export const {
  systemUsers,
  properties,
  condominiums,
  hotels,
  towers,
  tenants,
  owners,
  partners,
  tasks,
  ledgerEntries,
  financials,
  bookings,
  auditLogs,
  messages,
  genericServiceRates,
  notifications,
  advertisements,
  advertisers,
  adPricing,
  calendarBlocks,
  messageTemplates,
  serviceCategories,
  visits,
  workflows,
  tourSteps,
  guestServices,
  posItems,
  posTransactions,
  promotions,
  campaigns,
  serviceOrders,
  feedbacks,
  channelMappings,
  marketingWorkflows,
  emailTemplates,
  automationRules,
  mockBankStatements,
  defaultPaymentIntegrations,
  defaultFinancialSettings,
  marketAnalysisData,
} = generated

export const mockAdvertisers = generated.advertisers
export const mockAdPricing = generated.adPricing
