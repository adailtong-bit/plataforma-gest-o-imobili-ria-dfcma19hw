import { useState, useMemo } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import { OwnerProperties } from '@/components/owners/OwnerProperties'
import { OwnerTasks } from '@/components/owners/OwnerTasks'
import { OwnerStatement } from '@/components/financial/OwnerStatement'
import { OwnerNegotiationTab } from '@/components/renewals/OwnerNegotiationTab'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  ClipboardList,
  MessageSquare,
  FileText,
  Landmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function OwnerPortal() {
  const { properties } = usePropertyStore()
  const { tasks } = useTaskStore()
  const { currentUser, allUsers, simulationMode, simulationRole } =
    useAuthStore()
  const { t } = useLanguageStore()
  const { ledgerEntries } = useFinancialStore()
  const { tenants, updateTenant } = useTenantStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'ledger'
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchParams({ tab }, { replace: true })
    setTimeout(() => {
      document
        .getElementById('portal-tabs')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  let targetUserId = currentUser?.id
  let displayName = currentUser?.name

  if (simulationMode && simulationRole === 'property_owner') {
    const firstOwner = allUsers.find((u) => u.role === 'property_owner')
    if (firstOwner) {
      targetUserId = firstOwner.id
      displayName = `[Simulated] ${firstOwner.name}`
    }
  }

  const mockProperties = useMemo(() => {
    if (!targetUserId) return []
    if (
      properties.some(
        (p) => p.ownerId === targetUserId && p.name.includes('[DEV'),
      )
    )
      return []
    return [
      {
        id: `dev_mock_prop_${targetUserId}`,
        name: '[DEV Sandbox] Oceanfront Villa',
        address: '123 Ocean Drive',
        city: 'Miami',
        status: 'rented',
        ownerId: targetUserId,
        image: 'https://img.usecurling.com/p/400/300?q=villa',
      },
    ] as any[]
  }, [targetUserId, properties])

  const allProperties = [...properties, ...mockProperties]
  const ownerProperties = allProperties.filter(
    (p) => p.ownerId === targetUserId,
  )
  const ownerPropertyIds = ownerProperties.map((p) => p.id)

  const mockPropId =
    ownerProperties.find((p) => p.name.includes('[DEV'))?.id ||
    ownerProperties[0]?.id ||
    `dev_mock_prop_${targetUserId}`

  const mockTasks = useMemo(() => {
    if (!targetUserId) return []
    return [
      {
        id: `dev_mock_task_1`,
        title: '[DEV] HVAC Maintenance',
        propertyId: mockPropId,
        propertyName: '[DEV Sandbox] Oceanfront Villa',
        status: 'pending_approval',
        approvalStatus: 'owner_pending',
        type: 'maintenance',
        date: new Date().toISOString(),
        price: 450,
        assignee: 'DevTech Services',
        description:
          '[DEV] The AC unit in the main suite is leaking and making a loud noise. Needs immediate repair. Technician found a broken coil.',
        images: [
          'https://img.usecurling.com/p/200/200?q=ac%20repair',
          'https://img.usecurling.com/p/200/200?q=water%20leak',
        ],
      },
    ] as any[]
  }, [targetUserId, mockPropId])

  const mockTenants = useMemo(() => {
    if (!targetUserId) return []
    return [
      {
        id: `dev_mock_tenant_1`,
        name: '[DEV] Test Tenant (Simulation)',
        propertyId: mockPropId,
        ownerDecision: 'pending',
        suggestedRenewalPrice: 3000,
        rentValue: 2800,
      },
    ] as any[]
  }, [targetUserId, mockPropId])

  const mockLedger = useMemo(() => {
    if (!targetUserId) return []
    return [
      {
        id: `dev_mock_ledger_1`,
        propertyId: mockPropId,
        date: new Date().toISOString(),
        type: 'expense',
        category: 'hoa',
        amount: 400,
        description: '[DEV] Monthly HOA',
        status: 'pending',
      },
      {
        id: `dev_mock_ledger_2`,
        propertyId: mockPropId,
        date: new Date().toISOString(),
        type: 'expense',
        category: 'tax',
        amount: 1200,
        description: '[DEV] Property Tax Q3',
        status: 'pending',
      },
    ] as any[]
  }, [targetUserId, mockPropId])

  const allTasks = [...tasks, ...mockTasks]
  const allTenants = [...tenants, ...mockTenants]
  const allLedgerEntries = [...ledgerEntries, ...mockLedger]

  const pendingTasks = allTasks.filter(
    (t) =>
      ownerPropertyIds.includes(t.propertyId) &&
      (t.status === 'pending_approval' || t.approvalStatus === 'owner_pending'),
  )

  const renewals = allTenants.filter(
    (t) =>
      ownerPropertyIds.includes(t.propertyId) &&
      t.suggestedRenewalPrice !== undefined &&
      t.suggestedRenewalPrice !== null,
  )

  const hoaAndTaxes = allLedgerEntries.filter(
    (e) =>
      ownerPropertyIds.includes(e.propertyId) &&
      (e.category === 'hoa' ||
        e.category === 'tax' ||
        e.description.toLowerCase().includes('hoa') ||
        e.description.toLowerCase().includes('tax')),
  )

  const pendingHoaTaxes = hoaAndTaxes.filter((e) => e.status !== 'cleared')

  if (!currentUser || !targetUserId) return null

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('owner_portal.welcome') || 'Welcome'}, {displayName}
          </h1>
          <p className="text-muted-foreground">
            {t('owner_portal.subtitle') || 'Owner Asset & Financial Portal'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            className="bg-trust-blue text-white hover:bg-blue-700 shadow-sm"
          >
            <Link to="/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('owner_portal.contact_pm') || 'Contact PM'}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="border-slate-200 shadow-sm bg-white cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
          onClick={() => handleTabChange('properties')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('owner_portal.registered_properties') ||
                'Properties Portfolio'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {ownerProperties.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-slate-200 shadow-sm bg-white cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all"
          onClick={() => handleTabChange('hoa_taxes')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('owner_portal.pending_hoa') || 'Pending HOA & Taxes'}
            </CardTitle>
            <Landmark className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {pendingHoaTaxes.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-slate-200 shadow-sm bg-white cursor-pointer hover:border-orange-400 hover:shadow-md transition-all"
          onClick={() => handleTabChange('tasks')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('owner_portal.pending_approvals') || 'Pending Cost Approvals'}
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-slate-200 shadow-sm bg-white cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
          onClick={() => handleTabChange('renewals')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('owner_portal.pending_renewals') || 'Pending Renewals'}
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {renewals.filter((r) => r.ownerDecision === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
        id="portal-tabs"
      >
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px] h-auto p-1 bg-slate-100/50 border shadow-sm">
          <TabsTrigger
            value="ledger"
            className="py-2.5 whitespace-normal h-auto text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('owner_portal.ledger') || 'Ledger & Financial'}
          </TabsTrigger>
          <TabsTrigger
            value="hoa_taxes"
            className="py-2.5 whitespace-normal h-auto text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('owner_portal.hoa_taxes') || 'HOA & Taxes'}
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="py-2.5 whitespace-normal h-auto text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('owner_portal.damages_costs') || 'Damages & Costs'}
          </TabsTrigger>
          <TabsTrigger
            value="renewals"
            className="py-2.5 whitespace-normal h-auto text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('owner_portal.renewals') || 'Renewals'}
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            className="py-2.5 whitespace-normal h-auto text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('owner_portal.properties') || 'Properties'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ledger" className="mt-6">
          <OwnerStatement
            ownerId={targetUserId}
            properties={allProperties}
            ledgerEntries={allLedgerEntries}
          />
        </TabsContent>
        <TabsContent value="hoa_taxes" className="mt-6 space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-600" />
                {t('owner_portal.hoa_taxes') || 'HOA & Property Taxes'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {t('owner_portal.hoa_desc') ||
                      'Manage your upcoming HOA fees and property taxes.'}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/financial">
                      {t('owner_portal.go_to_financial') || 'Go to Financial'}
                    </Link>
                  </Button>
                </div>
                {hoaAndTaxes.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg bg-slate-50/50">
                    <Landmark className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">
                      {t('owner_portal.no_records') || 'No records found'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {t('owner_portal.no_hoa_records') ||
                        'No HOA or Tax records have been registered for your properties.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hoaAndTaxes.map((entry) => {
                      const prop = allProperties.find(
                        (p) => p.id === entry.propertyId,
                      )
                      return (
                        <div
                          key={entry.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {entry.description}
                            </div>
                            <div className="text-sm text-slate-500">
                              {prop?.name || 'General'}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {t('common.due_date') || 'Due'}:{' '}
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                ${entry.amount.toFixed(2)}
                              </div>
                              <div className="text-xs uppercase tracking-wider font-semibold">
                                {entry.status === 'cleared' ? (
                                  <span className="text-emerald-600">
                                    {t('common.paid') || 'Paid'}
                                  </span>
                                ) : (
                                  <span className="text-orange-600">
                                    {t('common.pending') || 'Pending'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <OwnerTasks
            ownerId={targetUserId}
            properties={allProperties}
            tasksOverride={allTasks}
          />
        </TabsContent>
        <TabsContent value="renewals" className="mt-6 space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                {t('renewals.title') || 'Contract Renewals'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {renewals.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg bg-slate-50/50">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-slate-900">
                    {t('renewals.no_results') || 'No renewals found'}
                  </h3>
                </div>
              ) : (
                <div className="grid gap-6">
                  {renewals.map((tenant) => {
                    const property = allProperties.find(
                      (p) => p.id === tenant.propertyId,
                    )

                    const mockHistory = [
                      {
                        id: 'msg1',
                        senderId: 'pm',
                        text: `${t('renewals.negotiation_started') || 'Negotiation Started'}. ${t('renewals.proposed_value') || 'Proposed Value'}: $${tenant.suggestedRenewalPrice}`,
                        timestamp: new Date(
                          Date.now() - 86400000 * 2,
                        ).toISOString(),
                      },
                    ]

                    return (
                      <Card
                        key={tenant.id}
                        className="overflow-hidden border-slate-200 shadow-sm bg-slate-50/30"
                      >
                        <div className="bg-slate-100/80 p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="font-bold text-lg text-slate-900">
                              {property?.name || 'Property'}
                            </h4>
                            <p className="text-sm text-slate-600 font-medium mt-1">
                              {t('common.tenant') || 'Tenant'}:{' '}
                              <span className="text-slate-900">
                                {tenant.name}
                              </span>
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-white capitalize text-sm px-3 py-1"
                          >
                            {t(`common.${tenant.ownerDecision || 'pending'}`)}
                          </Badge>
                        </div>
                        <div className="p-5">
                          <OwnerNegotiationTab
                            tenant={tenant}
                            owner={currentUser as any}
                            history={mockHistory}
                            onSend={(text) => console.log('Sent:', text)}
                            onUpdateTenant={(data) => {
                              if (updateTenant) updateTenant(tenant.id, data)
                            }}
                          />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="properties" className="mt-6">
          <OwnerProperties ownerId={targetUserId} properties={allProperties} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
