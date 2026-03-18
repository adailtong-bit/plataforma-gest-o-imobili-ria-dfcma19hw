import {
  User,
  Property,
  Owner,
  Partner,
  Tenant,
  Booking,
  Task,
  LedgerEntry,
  Invoice,
} from './types'

export function generateSeederData() {
  const data = {
    users: [] as User[],
    properties: [] as Property[],
    owners: [] as Owner[],
    partners: [] as Partner[],
    tenants: [] as Tenant[],
    bookings: [] as Booking[],
    tasks: [] as Task[],
    ledgerEntries: [] as LedgerEntry[],
    invoices: [] as Invoice[],
  }

  const pms = [
    {
      id: 'org_seed_1',
      name: 'Stellar Management',
      email: 'admin@stellar.com',
    },
    {
      id: 'org_seed_2',
      name: 'Horizon Properties',
      email: 'admin@horizon.com',
    },
  ]

  pms.forEach((pm) => {
    // 1. PM Admin
    data.users.push({
      id: `u_${pm.id}_admin`,
      name: pm.name,
      email: pm.email,
      role: 'software_tenant',
      organizationId: pm.id,
      isFirstLogin: false,
      status: 'active',
      companyName: pm.name,
    })

    // 2. Team, Owners, Partners, Tenants (5 each)
    for (let i = 0; i < 5; i++) {
      data.users.push({
        id: `u_${pm.id}_team_${i}`,
        name: `Staff ${i} ${pm.name}`,
        email: `staff${i}@${pm.id}.com`,
        role: 'internal_user',
        organizationId: pm.id,
        isFirstLogin: false,
        status: 'active',
      })
      data.owners.push({
        id: `o_${pm.id}_${i}`,
        name: `Owner ${i} ${pm.name}`,
        email: `o${i}@${pm.id}.com`,
        phone: `555-010${i}`,
        role: 'property_owner',
        status: 'active',
        organizationId: pm.id,
      })
      data.partners.push({
        id: `p_${pm.id}_${i}`,
        name: `Partner ${i} ${pm.name}`,
        type: i % 2 === 0 ? 'cleaning' : 'maintenance',
        email: `p${i}@${pm.id}.com`,
        phone: `555-020${i}`,
        role: 'partner',
        status: 'active',
        organizationId: pm.id,
      })
      data.tenants.push({
        id: `t_${pm.id}_${i}`,
        name: `Tenant ${i} ${pm.name}`,
        email: `t${i}@${pm.id}.com`,
        phone: `555-030${i}`,
        role: 'tenant',
        status: 'active',
        rentValue: 2000 + i * 100,
        leaseEnd: new Date(Date.now() + 86400000 * 180).toISOString(),
        organizationId: pm.id,
      })
    }

    // 3. Properties & Transactions (10 properties per PM, 25+ movements each)
    for (let i = 0; i < 10; i++) {
      const isStr = i < 5
      const pid = `prop_${pm.id}_${i}`
      const ownerId = `o_${pm.id}_${i % 5}`
      const partnerId = `p_${pm.id}_${i % 5}`

      data.properties.push({
        id: pid,
        name: `${isStr ? 'Vacation Home' : 'Residential Apt'} ${i + 1}`,
        address: `100${i} Simulation St`,
        city: 'Orlando',
        state: 'FL',
        zipCode: '32801',
        country: 'US',
        type: isStr ? 'House' : 'Apartment',
        profileType: isStr ? 'short_term' : 'long_term',
        community: 'Simulated Heights',
        status: 'rented',
        bedrooms: 3 + (i % 2),
        bathrooms: 2,
        guests: 6,
        ownerId,
        image: `https://img.usecurling.com/p/400/300?q=${isStr ? 'house' : 'apartment'}&seed=${i + pm.id.length}`,
        organizationId: pm.id,
        listingPrice: isStr ? 250 : 2000,
      })

      // Revenue Generation (15 transactions)
      if (isStr) {
        for (let b = 0; b < 15; b++) {
          const bid = `bkg_${pid}_${b}`
          const amt = 150 + b * 10
          data.bookings.push({
            id: bid,
            propertyId: pid,
            propertyName: `Vacation Home ${i + 1}`,
            guestName: `Guest ${b}`,
            guestEmail: `g${b}@sim.com`,
            checkIn: new Date(Date.now() - b * 86400000 * 7).toISOString(),
            checkOut: new Date(Date.now() - b * 86400000 * 5).toISOString(),
            status: 'checked_out',
            totalAmount: amt,
            paid: true,
            platform: 'airbnb',
            organizationId: pm.id,
          })
          data.invoices.push({
            id: `inv_${bid}`,
            description: `Booking ${bid}`,
            amount: amt,
            status: 'paid',
            date: new Date().toISOString(),
            propertyId: pid,
            bookingId: bid,
            organizationId: pm.id,
          })
          data.ledgerEntries.push({
            id: `le_${bid}`,
            propertyId: pid,
            date: new Date().toISOString(),
            type: 'income',
            category: 'Booking',
            amount: amt,
            description: 'Booking payment',
            status: 'cleared',
            organizationId: pm.id,
          })
        }
      } else {
        const tid = `t_${pm.id}_${i % 5}`
        for (let m = 0; m < 15; m++) {
          const rId = `inv_r_${pid}_${m}`
          const rAmt = 2000 + (i % 3) * 100
          data.invoices.push({
            id: rId,
            description: `Rent Month ${m + 1}`,
            amount: rAmt,
            status: 'paid',
            date: new Date(Date.now() - m * 86400000 * 30).toISOString(),
            propertyId: pid,
            toId: tid,
            organizationId: pm.id,
          })
          data.ledgerEntries.push({
            id: `le_r_${rId}`,
            propertyId: pid,
            date: new Date(Date.now() - m * 86400000 * 30).toISOString(),
            type: 'income',
            category: 'Rent',
            amount: rAmt,
            description: 'Monthly Rent',
            status: 'cleared',
            organizationId: pm.id,
          })
        }
      }

      // Expenses Generation (10 transactions)
      for (let t = 0; t < 10; t++) {
        const tskId = `task_${pid}_${t}`
        const cost = 50 + t * 10
        data.tasks.push({
          id: tskId,
          title: `Routine Work ${t + 1}`,
          propertyId: pid,
          propertyName: `Prop ${i + 1}`,
          status: 'completed',
          type: t % 2 === 0 ? 'maintenance' : 'cleaning',
          assignee: `Partner ${i % 5}`,
          assigneeId: partnerId,
          date: new Date().toISOString(),
          priority: 'medium',
          price: cost,
          organizationId: pm.id,
        })
        data.ledgerEntries.push({
          id: `le_t_${tskId}`,
          propertyId: pid,
          date: new Date().toISOString(),
          type: 'expense',
          category: t % 2 === 0 ? 'Maintenance' : 'Cleaning',
          amount: cost,
          description: 'Routine service cost',
          status: 'cleared',
          organizationId: pm.id,
        })
      }
    }
  })

  return data
}
