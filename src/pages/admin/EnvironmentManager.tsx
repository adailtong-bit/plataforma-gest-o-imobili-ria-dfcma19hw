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
import { AlertTriangle, Shield, TestTube } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { UserRole } from '@/lib/types'

export default function EnvironmentManager() {
  const {
    simulationMode,
    setSimulationMode,
    simulationRole,
    setSimulationRole,
    currentUser,
  } = useAuthStore()

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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Environment Management
        </h1>
        <p className="text-muted-foreground">
          Manage bypass logic and simulate user roles for testing.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Developer Bypass
            </CardTitle>
            <CardDescription>
              By default, the platform owner ignores all RequirePermission
              restrictions. You can toggle this off (Simulation Mode ON) to test
              the app as a regular user.
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
      </div>
    </div>
  )
}
