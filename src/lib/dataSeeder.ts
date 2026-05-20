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
      id: `org_seed_${Date.now()}_1`,
      name: 'Simulated Horizon Management',
      email: 'admin@simhorizon.com',
    },
    {
      id: `org_seed_${Date.now()}_2`,
      name: 'Simulated Stellar Properties',
      email: 'admin@simstellar.com',
    },
  ]

  const firstNames = [
    'Emma',
    'Liam',
    'Olivia',
    'Noah',
    'Ava',
    'Oliver',
    'Sophia',
    'Elijah',
    'Isabella',
    'James',
    'Mia',
    'William',
    'Charlotte',
    'Benjamin',
    'Amelia',
    'Lucas',
    'Harper',
    'Henry',
    'Evelyn',
    'Theodore',
  ]
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
  ]

  const getRandomName = (seed: number) =>
    `${firstNames[seed % firstNames.length]} ${lastNames[(seed * 3) % lastNames.length]}`

  pms.forEach((pm, pmIdx) => {
    // 1. PM Admin
    data.users.push({
      id: `u_${pm.id}_admin`,
      name: `${pm.name} Admin`,
      email: pm.email,
      role: 'software_tenant',
      organizationId: pm.id,
      isFirstLogin: false,
      status: 'active',
      companyName: pm.name,
    })

    // 2. Team, Owners, Partners, Tenants (10 each)
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
    }

    for (let i = 0; i < 10; i++) {
      data.owners.push({
        id: `o_${pm.id}_${i}`,
        name: getRandomName(pmIdx * 100 + i),
        email: `owner${i}@${pm.id}.com`,
        phone: `555-010${i}`,
        role: 'property_owner',
        status: 'active',
        organizationId: pm.id,
      })

      data.partners.push({
        id: `p_${pm.id}_${i}`,
        name: `${i % 2 === 0 ? 'Cleaning' : 'Maintenance'} Crew ${i} - ${pm.name}`,
        type: i % 2 === 0 ? 'cleaning' : 'maintenance',
        email: `partner${i}@${pm.id}.com`,
        phone: `555-020${i}`,
        role: 'partner',
        status: 'active',
        organizationId: pm.id,
      })

      const leaseStart = new Date()
      leaseStart.setMonth(leaseStart.getMonth() - (12 + (i % 6)))
      const leaseEnd = new Date(leaseStart)
      leaseEnd.setFullYear(leaseEnd.getFullYear() + 1)

      data.tenants.push({
        id: `t_${pm.id}_${i}`,
        name: getRandomName(pmIdx * 200 + i),
        email: `tenant${i}@${pm.id}.com`,
        phone: `555-030${i}`,
        role: 'tenant',
        status: 'active',
        rentValue: 1500 + i * 150,
        leaseStart: leaseStart.toISOString(),
        leaseEnd: leaseEnd.toISOString(),
        organizationId: pm.id,
        negotiationStatus:
          leaseEnd.getTime() < Date.now() + 60 * 86400000
            ? 'negotiating'
            : undefined,
        suggestedRenewalPrice: 1500 + i * 150 + 100,
      })
    }

    // 3. Properties & Transactions (20 properties per PM, 25+ movements each)
    for (let i = 0; i < 20; i++) {
      const isStr = i < 10
      const pid = `prop_${pm.id}_${i}`
      const ownerId = `o_${pm.id}_${i % 10}`
      const partnerId = `p_${pm.id}_${i % 10}`

      data.properties.push({
        id: pid,
        name: `${isStr ? 'Vacation Villa' : 'Residential Apt'} ${i + 1}`,
        address: `100${i} Simulation Blvd`,
        city: 'Orlando',
        state: 'FL',
        zipCode: '32801',
        country: 'US',
        type: isStr ? 'House' : 'Apartment',
        profileType: isStr ? 'short_term' : 'long_term',
        community: 'Simulated Heights',
        status: isStr ? 'available' : 'rented',
        bedrooms: 3 + (i % 3),
        bathrooms: 2,
        guests: 6 + (i % 2) * 2,
        ownerId,
        image: `https://img.usecurling.com/p/400/300?q=${isStr ? 'house' : 'apartment'}&seed=${i + pm.id.length}`,
        organizationId: pm.id,
        listingPrice: isStr ? 250 : 2000,
      })

      // Revenue Generation (Short-Term)
      if (isStr) {
        for (let b = 0; b < 10; b++) {
          const bid = `bkg_${pid}_${b}`
          const amt = 250 * (3 + (b % 4)) // random nights

          const checkIn = new Date()
          checkIn.setDate(checkIn.getDate() - (b * 14 + 5))
          const checkOut = new Date(checkIn)
          checkOut.setDate(checkOut.getDate() + (3 + (b % 4)))

          data.bookings.push({
            id: bid,
            propertyId: pid,
            propertyName: `Vacation Villa ${i + 1}`,
            guestName: getRandomName(pmIdx * 300 + i * 10 + b),
            guestEmail: `guest_${pmIdx}_${i}_${b}@sim.com`,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            status: 'checked_out',
            totalAmount: amt,
            baseAmount: amt,
            paid: true,
            platform: ['airbnb', 'vrbo', 'direct', 'booking.com'][b % 4] as
              | 'airbnb'
              | 'vrbo'
              | 'direct'
              | 'booking.com',
            organizationId: pm.id,
          })
          data.invoices.push({
            id: `inv_${bid}`,
            description: `Booking ${bid}`,
            amount: amt,
            status: 'paid',
            date: checkIn.toISOString(),
            propertyId: pid,
            bookingId: bid,
            type: 'generic',
            organizationId: pm.id,
          })
          data.ledgerEntries.push({
            id: `le_${bid}`,
            propertyId: pid,
            date: checkIn.toISOString(),
            type: 'income',
            category: 'Booking',
            amount: amt,
            description: 'Booking payment',
            status: 'cleared',
            organizationId: pm.id,
          })
        }
      } else {
        // Revenue Generation (Long-Term)
        const tenant = data.tenants[i % 10]
        for (let m = 0; m < 12; m++) {
          const rId = `inv_r_${pid}_${m}`
          const rAmt = tenant.rentValue
          const d = new Date()
          d.setMonth(d.getMonth() - m)

          data.invoices.push({
            id: rId,
            description: `Rent Month ${d.toLocaleString('default', { month: 'short' })}`,
            amount: rAmt,
            status: 'paid',
            date: d.toISOString(),
            propertyId: pid,
            toId: tenant.id,
            type: 'generic',
            organizationId: pm.id,
          })
          data.ledgerEntries.push({
            id: `le_r_${rId}`,
            propertyId: pid,
            date: d.toISOString(),
            type: 'income',
            category: 'Rent',
            amount: rAmt,
            description: `Monthly Rent - ${tenant.name}`,
            status: 'cleared',
            organizationId: pm.id,
          })
        }
      }

      // Expenses & Tasks Generation (10 transactions)
      for (let t = 0; t < 10; t++) {
        const tskId = `task_${pid}_${t}`
        const isCleaning = t % 2 === 0
        const cost = isCleaning ? 150 : 350 + t * 20
        const d = new Date()
        d.setDate(d.getDate() - t * 15)

        data.tasks.push({
          id: tskId,
          title: `${isCleaning ? 'Routine Cleaning' : 'Maintenance Repair'} ${t + 1}`,
          propertyId: pid,
          propertyName: `Prop ${i + 1}`,
          status: 'completed',
          type: isCleaning ? 'cleaning' : 'maintenance',
          assignee: `Partner ${i % 10}`,
          assigneeId: partnerId,
          date: d.toISOString(),
          priority: isCleaning ? 'medium' : 'high',
          price: cost,
          laborCost: cost * 0.7,
          organizationId: pm.id,
        })
        data.ledgerEntries.push({
          id: `le_t_${tskId}`,
          propertyId: pid,
          date: d.toISOString(),
          type: 'expense',
          category: isCleaning ? 'Cleaning' : 'Maintenance',
          amount: cost,
          description: `Service cost - ${isCleaning ? 'Cleaning' : 'Maintenance'}`,
          status: 'cleared',
          organizationId: pm.id,
        })
      }
    }
  })

  return data
}
