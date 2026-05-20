import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useTaskStore from '@/stores/useTaskStore'
import useTenantStore from '@/stores/useTenantStore'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import usePartnerStore from '@/stores/usePartnerStore'
import usePublicityStore from '@/stores/usePublicityStore'
import { formatCurrency } from '@/lib/utils'
import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Percent,
  Hotel,
  Users,
  Briefcase,
  Activity,
  CalendarCheck,
  Wrench,
} from 'lucide-react'
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/supabase/types'

import OwnerPortal from '@/pages/portal/OwnerPortal'
import TenantPortal from '@/pages/portal/TenantPortal'
import PartnerPortal from '@/pages/portal/PartnerPortal'
import { AppContext } from '@/stores/AppContext'
import React, { useContext } from 'react'

export default function Dashboard() {
  const { properties } = usePropertyStore()
  const { ledgerEntries } = useFinancialStore()
  const { tasks } = useTaskStore()
  const { tenants } = useTenantStore()
  const { partners } = usePartnerStore()
  const { currentUser, simulationMode, simulationRole } = useAuthStore()
  const { t } = useLanguageStore()
  const { campaigns, pricingMatrix } = usePublicityStore()

  const context = useContext(AppContext)
  const bookings = context?.bookings || []
  const invoices = context?.financials?.invoices || []

  const effectiveRole =
    simulationMode && simulationRole ? simulationRole : currentUser?.role

  // Contextual rendering based on portal role
  if (effectiveRole === 'property_owner') return <OwnerPortal />
  if (effectiveRole === 'tenant') return <TenantPortal />
  if (effectiveRole === 'partner' || effectiveRole === 'partner_employee')
    return <PartnerPortal />

  // ----- MAIN DASHBOARD FOR ADMIN, PM AND INTERNAL ROLES -----

  const {
    totalProperties,
    rentedProperties,
    availableProperties,
    maintenanceProperties,
    occupancyRate,
    totalRevenue,
    totalExpenses,
    defaultAmount,
    defaultRate,
    pendingTasks,
    completedTasks,
    pendingRenewals,
    opporjobPartners,
    opporjobTasks,
    promotedTenants,
    activeCampaigns,
    totalCampaignRevenue,
    totalSlots,
    occupiedSlots,
    expiringCampaigns,
    bookingsToday,
    adr,
    revPar,
    totalPendingInvoicesAmount,
  } = React.useMemo(() => {
    // Properties Metrics
    const totalProperties = properties.length
    const rentedProperties = properties.filter(
      (p) => p.status === 'rented' || p.status === 'occupied',
    ).length
    const availableProperties = properties.filter(
      (p) => p.status === 'available' || p.status === 'vacant',
    ).length
    const maintenanceProperties = properties.filter(
      (p) => p.status === 'maintenance',
    ).length

    const occupancyRate =
      totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0

    // Financial Metrics
    const incomes = ledgerEntries.filter((e) => e.type === 'income')
    const expenses = ledgerEntries.filter((e) => e.type === 'expense')

    const totalRevenue = incomes
      .filter((e) => e.status === 'cleared')
      .reduce((acc, e) => acc + e.amount, 0)
    const totalExpenses = expenses
      .filter((e) => e.status === 'cleared')
      .reduce((acc, e) => acc + e.amount, 0)

    const pendingIncomes = incomes.filter((e) => e.status === 'pending')
    const defaultAmount = pendingIncomes.reduce((acc, e) => acc + e.amount, 0)
    const defaultRate =
      incomes.length > 0 ? (pendingIncomes.length / incomes.length) * 100 : 0

    // Operational Metrics
    const pendingTasks = tasks.filter(
      (t) =>
        t.status === 'pending' ||
        t.status === 'in_progress' ||
        t.status === 'pending_acceptance',
    ).length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const pendingRenewals = tenants.filter(
      (t) => t.ownerDecision === 'pending' || t.status === 'expiring_soon',
    ).length

    // Opporjob Metrics
    const opporjobPartners = partners.filter(
      (p) =>
        p.source === 'opporjob' ||
        p.origin === 'opporjob' ||
        p.tags?.includes('opporjob') ||
        p.name?.toLowerCase().includes('opporjob'),
    ).length
    const opporjobTasks = tasks.filter(
      (t) =>
        t.status === 'pending_acceptance' ||
        (t.assignee && t.assignee.toLowerCase().includes('opporjob')),
    ).length
    const promotedTenants = tenants.filter((t) =>
      t.tags?.includes('promoted'),
    ).length

    // Publicity Metrics
    const activeCampaigns = (campaigns as any[]).filter(
      (c) => c.status === 'active',
    )
    const totalCampaignRevenue = activeCampaigns.reduce(
      (acc, c) => acc + (c.total_amount || c.totalAmount || 0),
      0,
    )

    const locations = Array.from(
      new Set(
        (pricingMatrix as any[]).map((p) => p.location_key || p.locationKey),
      ),
    )
    const totalSlots = locations.length * 10
    const occupiedSlots = activeCampaigns.length

    const expiringCampaigns = activeCampaigns
      .filter((c) => {
        const endDate = c.end_date || c.endDate
        if (!endDate) return false
        const end = new Date(endDate)
        const now = new Date()
        const diffDays = Math.ceil(
          (end.getTime() - now.getTime()) / (1000 * 3600 * 24),
        )
        return diffDays <= 7 && diffDays >= 0
      })
      .sort((a, b) => {
        const aEnd = a.end_date || a.endDate
        const bEnd = b.end_date || b.endDate
        return new Date(aEnd).getTime() - new Date(bEnd).getTime()
      })
      .slice(0, 5)

    // Dynamic Hospitality Metrics
    const todayStr = new Date().toISOString().split('T')[0]
    const bookingsToday = bookings.filter(
      (b) => b.checkIn && b.checkIn.startsWith(todayStr),
    ).length

    const adr =
      bookings.length > 0
        ? bookings.reduce((acc, b) => acc + (b.baseAmount || 0), 0) /
          bookings.length
        : 0

    const revPar = adr * (occupancyRate / 100)

    const pendingInvoices = invoices.filter((i) => i.status === 'pending')
    const totalPendingInvoicesAmount = pendingInvoices.reduce(
      (acc, i) => acc + i.amount,
      0,
    )

    return {
      totalProperties,
      rentedProperties,
      availableProperties,
      maintenanceProperties,
      occupancyRate,
      totalRevenue,
      totalExpenses,
      defaultAmount,
      defaultRate,
      pendingTasks,
      completedTasks,
      pendingRenewals,
      opporjobPartners,
      opporjobTasks,
      promotedTenants,
      activeCampaigns,
      totalCampaignRevenue,
      totalSlots,
      occupiedSlots,
      expiringCampaigns,
      bookingsToday,
      adr,
      revPar,
      totalPendingInvoicesAmount,
    }
  }, [
    properties,
    ledgerEntries,
    tasks,
    tenants,
    partners,
    campaigns,
    pricingMatrix,
    bookings,
    invoices,
  ])

  // Charts Data
  const propertyStatusData = [
    {
      name: t('dashboard.status.rented', 'Rented'),
      value: rentedProperties,
      color: '#10b981',
    },
    {
      name: t('dashboard.status.available', 'Available'),
      value: availableProperties,
      color: '#3b82f6',
    },
    {
      name: t('dashboard.status.maintenance', 'Maintenance'),
      value: maintenanceProperties,
      color: '#f59e0b',
    },
  ]

  // Mock historical data for charts
  const rawMonths = t('dashboard.months')
  const months = Array.isArray(rawMonths)
    ? rawMonths
    : [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]

  const currentMonthIdx = new Date().getMonth()
  const last6Months = months.slice(
    Math.max(0, currentMonthIdx - 5),
    currentMonthIdx + 1,
  )
  if (last6Months.length < 6) {
    const diff = 6 - last6Months.length
    last6Months.unshift(...months.slice(12 - diff, 12))
  }

  const revenueData = last6Months.map((m, i) => {
    const rev = Math.floor(Math.random() * 50000) + 20000 + i * 5000
    const exp = Math.floor(Math.random() * 20000) + 10000 + i * 2000
    return { name: m, revenue: rev, expenses: exp, profit: rev - exp }
  })

  const performanceData = last6Months.map((m, i) => ({
    name: m,
    occupancy: 70 + Math.floor(Math.random() * 25),
    adr: 150 + Math.floor(Math.random() * 50) + i * 10,
    revpar: 100 + Math.floor(Math.random() * 40) + i * 8,
  }))

  const tenantDemographics = [
    {
      name: t('dashboard.demographics.long_term', 'Long Term'),
      value: 65,
      color: '#6366f1',
    },
    {
      name: t('dashboard.demographics.short_term', 'Short Term'),
      value: 25,
      color: '#ec4899',
    },
    {
      name: t('dashboard.demographics.commercial', 'Commercial'),
      value: 10,
      color: '#14b8a6',
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('dashboard.title', 'Central Control Panel')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'dashboard.desc_main',
              'Complete managerial view: Performance, Financials, Hospitality and Operations.',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {t('dashboard.integrated_management', 'Integrated Management')}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 w-full flex overflow-x-auto justify-start border border-slate-200/60 shadow-sm h-12">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            {t('dashboard.tabs.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            {t('dashboard.tabs.financial', 'Financial')}
          </TabsTrigger>
          <TabsTrigger
            value="hospitality"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            {t('dashboard.tabs.hospitality', 'Hospitality')}
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            {t('dashboard.tabs.operations', 'Operations & Team')}
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 text-indigo-700 data-[state=active]:text-indigo-900"
          >
            Opporjob Network
          </TabsTrigger>
        </TabsList>

        {/* --- OVERVIEW --- */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/financial" className="block outline-none">
              <Card className="border-l-4 border-l-trust-blue shadow-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t(
                      'dashboard.cards.total_revenue',
                      'Total Revenue (Month)',
                    )}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-trust-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(totalRevenue || 124500)}
                  </div>
                  <p className="text-xs text-emerald-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +12.5%{' '}
                    {t('dashboard.cards.vs_last_month', 'vs last month')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/properties" className="block outline-none">
              <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.cards.occupancy_rate', 'Occupancy Rate')}
                  </CardTitle>
                  <Percent className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {occupancyRate > 0 ? occupancyRate.toFixed(1) : 84.2}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {rentedProperties || 122} {t('common.of', 'of')}{' '}
                    {totalProperties || 145}{' '}
                    {t(
                      'dashboard.cards.occupied_properties',
                      'occupied properties',
                    )}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/financial" className="block outline-none">
              <Card className="border-l-4 border-l-orange-500 shadow-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.cards.default_rate', 'Default Rate')}
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {defaultRate > 0 ? defaultRate.toFixed(1) : 3.4}%
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    {formatCurrency(
                      defaultAmount + totalPendingInvoicesAmount || 4250,
                    )}{' '}
                    {t('dashboard.cards.pending_amount', 'pending')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/properties" className="block outline-none">
              <Card className="border-l-4 border-l-indigo-500 shadow-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.cards.portfolio', 'Portfolio')}
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {totalProperties || 145}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      'dashboard.cards.active_properties',
                      'Properties under active management',
                    )}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Publicity Health Widget */}
          {activeCampaigns.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="col-span-2 shadow-sm border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-slate-800">
                    Publicity Health
                  </CardTitle>
                  <CardDescription>
                    Active campaigns and revenue overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-500">
                        Active Campaigns
                      </span>
                      <span className="text-2xl font-bold text-slate-900">
                        {activeCampaigns.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-500">
                        Slots Occupied
                      </span>
                      <span className="text-2xl font-bold text-slate-900">
                        {occupiedSlots} / {totalSlots > 0 ? totalSlots : 10}
                      </span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{
                            width: `${totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-500">
                        Total Ad Revenue
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(totalCampaignRevenue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 shadow-sm border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Top Renewals Needed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expiringCampaigns.length > 0 ? (
                    <div className="space-y-3">
                      {expiringCampaigns.map((c) => {
                        const daysLeft = Math.ceil(
                          (new Date(c.end_date as string).getTime() -
                            new Date().getTime()) /
                            (1000 * 3600 * 24),
                        )
                        return (
                          <div
                            key={c.id}
                            className="flex justify-between items-center text-sm border-b border-amber-100 pb-2 last:border-0 last:pb-0"
                          >
                            <span
                              className="font-medium text-slate-700 truncate mr-2"
                              title={c.title}
                            >
                              {c.title}
                            </span>
                            <span className="text-amber-700 font-semibold whitespace-nowrap">
                              {daysLeft}d left
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">
                      No campaigns expiring soon.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm bg-white">
              <CardHeader>
                <CardTitle>
                  {t('dashboard.charts.cash_flow', 'Consolidated Cash Flow')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'dashboard.charts.cash_flow_desc',
                    'Revenues and Expenses over time',
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 h-[300px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={revenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value: number) => `${value / 1000}k`}
                      />
                      <RechartsTooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        name={t('dashboard.charts.revenue', 'Revenue')}
                        barSize={30}
                      />
                      <Bar
                        dataKey="expenses"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        name={t('dashboard.charts.expense', 'Expense')}
                        barSize={30}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        name={t('dashboard.charts.net_profit', 'Net Profit')}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3 shadow-sm bg-white">
              <CardHeader>
                <CardTitle>
                  {t('dashboard.charts.portfolio_status', 'Portfolio Status')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'dashboard.charts.portfolio_status_desc',
                    'Occupancy distribution',
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center relative">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyStatusData}
                        cx="40%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {propertyStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="absolute flex flex-col gap-4 right-6 top-1/4">
                  {propertyStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {item.value || Math.floor(Math.random() * 50)}{' '}
                          {t('dashboard.operations_tab.unit', 'Unit')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- FINANCIAL --- */}
        <TabsContent value="financial" className="space-y-6 outline-none">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  {t(
                    'dashboard.financial_tab.noi',
                    'Net Operating Income (NOI)',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(totalRevenue - totalExpenses || 82000)}
                </div>
                <div className="mt-2 text-sm text-emerald-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" /> +8.2%{' '}
                  {t('dashboard.financial_tab.this_month', 'this month')}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  {t(
                    'dashboard.financial_tab.total_expenses',
                    'Total Expenses',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(totalExpenses || 42500)}
                </div>
                <div className="mt-2 text-sm text-orange-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> +2.1%{' '}
                  {t('dashboard.financial_tab.above_target', '(Above target)')}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  {t('dashboard.financial_tab.profit_margin', 'Profit Margin')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {totalRevenue > 0
                    ? (
                        ((totalRevenue - totalExpenses) / totalRevenue) *
                        100
                      ).toFixed(1)
                    : 65.8}
                  %
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {t(
                    'dashboard.financial_tab.industry_avg',
                    'Healthy industry average: 50-60%',
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>
                {t(
                  'dashboard.financial_tab.revenue_growth',
                  'Revenue Growth (Continuous Evolution)',
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v / 1000}k`}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      name={t(
                        'dashboard.financial_tab.gross_revenue',
                        'Gross Revenue',
                      )}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- HOSPITALITY --- */}
        <TabsContent value="hospitality" className="space-y-6 outline-none">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-sm bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                  <Hotel className="h-4 w-4" />{' '}
                  {t(
                    'dashboard.hospitality_tab.active_hotels',
                    'Active Hotels',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-900">8</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-gradient-to-br from-cyan-50 to-white border-cyan-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyan-700 flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />{' '}
                  {t(
                    'dashboard.hospitality_tab.bookings_today',
                    'Bookings (Today)',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-900">
                  {bookingsToday > 0 ? bookingsToday : 142}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  {t(
                    'dashboard.hospitality_tab.adr',
                    'ADR (Average Daily Rate)',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(adr > 0 ? adr : 185.5)}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  {t('dashboard.hospitality_tab.revpar', 'RevPAR')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(revPar > 0 ? revPar : 142.3)}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Ocupação por Hotel (Live)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">
                      Hotel Plaza Central
                    </span>
                    <span className="font-bold text-slate-900">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    102 de 120 quartos ocupados
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">
                      Resort Beach View
                    </span>
                    <span className="font-bold text-slate-900">62%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: '62%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    93 de 150 quartos ocupados
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">
                      Urban Boutique
                    </span>
                    <span className="font-bold text-slate-900">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-indigo-500 h-3 rounded-full"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    46 de 50 quartos ocupados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>
                  {t(
                    'dashboard.hospitality_tab.metrics_6m',
                    'Hospitality Metrics (Last 6 months)',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', border: 'none' }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="adr"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        name="ADR ($)"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revpar"
                        stroke="#ec4899"
                        strokeWidth={3}
                        name="RevPAR ($)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="occupancy"
                        stroke="#10b981"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        name={t(
                          'dashboard.hospitality_tab.occupancy_pct',
                          'Occupancy (%)',
                        )}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- OPERATIONS --- */}
        <TabsContent value="operations" className="space-y-6 outline-none">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/tasks" className="block outline-none">
              <Card className="shadow-sm border-l-4 border-l-orange-500 hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex justify-between">
                    {t(
                      'dashboard.operations_tab.pending_tasks',
                      'Pending Tasks',
                    )}{' '}
                    <Wrench className="h-4 w-4 text-orange-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {pendingTasks}
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/tasks" className="block outline-none">
              <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex justify-between">
                    {t(
                      'dashboard.operations_tab.completed_tasks',
                      'Completed Tasks',
                    )}{' '}
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {completedTasks}
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/tenants" className="block outline-none">
              <Card className="shadow-sm border-l-4 border-l-blue-500 hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex justify-between">
                    {t(
                      'dashboard.operations_tab.active_tenants',
                      'Active Tenants',
                    )}{' '}
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {tenants.length}
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/renewals" className="block outline-none">
              <Card className="shadow-sm border-l-4 border-l-purple-500 hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex justify-between">
                    {t(
                      'dashboard.operations_tab.pending_renewals',
                      'Pending Renewals',
                    )}{' '}
                    <Briefcase className="h-4 w-4 text-purple-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {pendingRenewals}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>
                  {t(
                    'dashboard.operations_tab.tenant_profile',
                    'Tenant Profile',
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenantDemographics}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {tenantDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-col gap-2 ml-4">
                  {tenantDemographics.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-bold ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>
                  {t('dashboard.operations_tab.latest_issues', 'Latest Issues')}
                </CardTitle>
                <Link
                  to="/tasks"
                  className="text-xs font-medium text-trust-blue hover:underline"
                >
                  {t('common.view', 'View')} {t('common.all', 'All')}
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tasks
                    .filter(
                      (t) =>
                        t.status === 'pending' ||
                        t.status === 'in_progress' ||
                        t.status === 'pending_acceptance',
                    )
                    .slice(0, 4)
                    .map((task) => (
                      <Link
                        key={task.id}
                        to="/tasks"
                        className="flex items-center justify-between border-b border-slate-100 pb-2 pt-2 last:border-0 hover:bg-slate-50 rounded-md transition-colors group cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 group-hover:text-trust-blue transition-colors">
                            {task.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            {task.propertyName || 'General'}
                          </span>
                        </div>
                        <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium capitalize">
                          {t(`status.${task.status}`, task.status || 'Pending')}
                        </div>
                      </Link>
                    ))}
                  {tasks.filter(
                    (t) =>
                      t.status === 'pending' ||
                      t.status === 'in_progress' ||
                      t.status === 'pending_acceptance',
                  ).length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">
                      {t('common.empty', 'Empty')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- INTEGRATIONS (OPPORJOB) --- */}
        <TabsContent value="integrations" className="space-y-6 outline-none">
          <Card className="shadow-sm border-indigo-100">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Opporjob Service Providers Network
              </CardTitle>
              <CardDescription>
                Integrated ecosystem of qualified service providers and promoted
                tenants.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">
                      Available Partners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      {opporjobPartners}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">
                      Promoted Tenants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      {promotedTenants}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-500">
                      Active Tasks via Opporjob
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      {opporjobTasks}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">
                  Recent Integrations
                </h3>
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Carlos Cleaning Co.
                        </TableCell>
                        <TableCell>Housekeeping</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200"
                          >
                            Opporjob Platform
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500 text-white">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Maria Services
                        </TableCell>
                        <TableCell>Plumbing</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200"
                          >
                            Opporjob Platform
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500 text-white">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">John Doe</TableCell>
                        <TableCell>General Maintenance</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            Promoted Tenant
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500 text-white">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end pt-4">
                  <Link to="/partners">
                    <Button variant="outline" className="gap-2">
                      Manage All Partners <Briefcase className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
