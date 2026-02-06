import { useState } from 'react'
import {
  HelpCircle,
  LayoutDashboard,
  Building,
  Users,
  Settings,
} from 'lucide-react'
import { DashboardGuide } from '@/components/help/DashboardGuide'
import { PropertiesGuide } from '@/components/help/PropertiesGuide'
import { LeadsGuide } from '@/components/help/LeadsGuide'
import { SettingsGuide } from '@/components/help/SettingsGuide'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HelpHub() {
  const [activeGuide, setActiveGuide] = useState<
    'dashboard' | 'properties' | 'leads' | 'settings'
  >('dashboard')

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Usage',
      icon: LayoutDashboard,
      component: DashboardGuide,
    },
    {
      id: 'properties',
      label: 'Properties & Hotels',
      icon: Building,
      component: PropertiesGuide,
    },
    {
      id: 'leads',
      label: 'Lead Management',
      icon: Users,
      component: LeadsGuide,
    },
    {
      id: 'settings',
      label: 'System & Settings',
      icon: Settings,
      component: SettingsGuide,
    },
  ] as const

  const ActiveComponent = menuItems.find(
    (item) => item.id === activeGuide,
  )!.component

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-100px)]">
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-navy flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          Help Center
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Comprehensive step-by-step guides to help you master the COREPM
          platform. Select a module below to view detailed instructions.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4 px-2 uppercase tracking-wider">
            Guides
          </h3>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'justify-start gap-3 h-12 text-base font-medium',
                  activeGuide === item.id
                    ? 'bg-blue-50 text-primary hover:bg-blue-100'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
                onClick={() => setActiveGuide(item.id)}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    activeGuide === item.id ? 'text-primary' : 'text-slate-400',
                  )}
                />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="mt-8 px-4 py-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-1">
              Need more help?
            </h4>
            <p className="text-xs text-blue-700 mb-3">
              Contact our support team for specialized assistance.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Contact Support
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  )
}
