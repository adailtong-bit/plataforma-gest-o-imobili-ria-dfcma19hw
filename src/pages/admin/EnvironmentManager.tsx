import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, Shield, TestTube, Database, Zap } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { UserRole } from '@/lib/types'
import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { generateSeederData } from '@/lib/dataSeeder'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EnvironmentManager() {
  const {
    simulationMode,
    setSimulationMode,
    simulationRole,
    setSimulationRole,
    currentUser,
  } = useAuthStore()

  const appContext = useContext(AppContext)
  const seedDatabase = appContext?.seedDatabase
  const { toast } = useToast()

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const roles: UserRole[] = [
    'software_tenant',
    'internal_user',
    'property_owner',
    'partner',
    'partner_employee',
    'tenant',
  ]

  if (currentUser?.role !== 'platform_owner') {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md flex items-center gap-3 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-bold">Access Denied. Platform Owner only.</p>
        </div>
      </div>
    )
  }

  const handleGenerate = async () => {
    if (!seedDatabase) return
    setIsGenerating(true)
    setProgress(10)

    // Simulate calculation
    await new Promise((r) => setTimeout(r, 600))
    setProgress(40)

    // Generate heavy payload
    const data = generateSeederData()

    // Simulate injection
    await new Promise((r) => setTimeout(r, 600))
    setProgress(80)

    // Commit to state
    seedDatabase(data)

    // Finish
    await new Promise((r) => setTimeout(r, 400))
    setProgress(100)

    toast({
      title: 'Simulation Data Generated',
      description:
        'Successfully injected thousands of records across all PM entities.',
    })

    setTimeout(() => {
      setIsGenerating(false)
      setProgress(0)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Environment & Data Factory
        </h1>
        <p className="text-muted-foreground">
          Manage bypass logic, simulate user roles, and populate realistic test
          data.
        </p>
      </div>

      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="simulation">Developer Bypass</TabsTrigger>
          <TabsTrigger value="data-factory">Data Factory</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-6 m-0">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Developer Bypass
              </CardTitle>
              <CardDescription>
                By default, the platform owner ignores all RequirePermission
                restrictions. You can toggle this off (Simulation Mode ON) to
                test the app as a regular user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Simulation Mode</Label>
                  <p className="text-sm text-slate-500">
                    {simulationMode
                      ? 'Bypass is OFF. You are subject to UI restrictions.'
                      : 'Bypass is ON. You have 100% autonomy.'}
                  </p>
                </div>
                <Switch
                  checked={simulationMode}
                  onCheckedChange={(checked) => {
                    setSimulationMode(checked)
                    if (checked && !simulationRole) setSimulationRole('tenant')
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {simulationMode && (
            <Card className="border-orange-200 bg-orange-50/50 shadow-sm animate-in fade-in slide-in-from-top-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <TestTube className="h-5 w-5" />
                  Simulate Role
                </CardTitle>
                <CardDescription className="text-orange-700/80">
                  Select which role you want to simulate. Your permissions will
                  immediately match this role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-sm space-y-3">
                  <Label className="font-semibold text-orange-900">
                    Target Role
                  </Label>
                  <Select
                    value={simulationRole || ''}
                    onValueChange={(val) => setSimulationRole(val as UserRole)}
                  >
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          className="capitalize"
                        >
                          {role.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data-factory" className="m-0">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="h-6 w-6 text-trust-blue" />
                Administrative Data Seeder
              </CardTitle>
              <CardDescription>
                Populate the system with realistic records across all modules
                (Properties, Owners, Partners, Financials, Bookings, etc.) to
                thoroughly test reporting and data isolation.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col gap-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Generation Scope
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
                    <li>2 Distinct PM Organizations</li>
                    <li>20+ Properties (Mixed STR & LTR)</li>
                    <li>Owners, Partners & Staff Teams</li>
                    <li>Active Tenants & Guest Bookings</li>
                    <li>400+ Financial Transactions</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col justify-center items-center text-center">
                  <p className="text-sm font-medium text-slate-700 mb-4">
                    Ready to spin up the simulation?
                  </p>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-trust-blue hover:bg-blue-700 text-white font-bold h-12"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Mock Dataset'}
                  </Button>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>Injecting Records...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
