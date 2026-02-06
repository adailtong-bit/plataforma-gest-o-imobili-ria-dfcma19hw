import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, UserCog, Navigation, Shield } from 'lucide-react'

export function SettingsGuide() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-navy">
          <Settings className="h-6 w-6 text-primary" />
          System Settings & Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose max-w-none text-muted-foreground">
          <p>
            Master the platform navigation and configure your user profile and
            system preferences.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="navigation">
            <AccordionTrigger className="text-lg font-semibold">
              Navigation Basics
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <Navigation className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    <strong>Sidebar:</strong> The main menu on the left provides
                    access to all major modules (Dashboard, Properties, CRM,
                    Financials). It can be collapsed for more screen space.
                  </p>
                  <p className="text-sm text-slate-700">
                    <strong>Header Shortcuts:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li>
                      <strong>Search Bar:</strong> Global search for properties,
                      tenants, or leads.
                    </li>
                    <li>
                      <strong>Notifications Bell:</strong> Alerts for new tasks,
                      messages, or system updates.
                    </li>
                    <li>
                      <strong>Language Switcher:</strong> Toggle between
                      Portuguese (PT), English (EN), and Spanish (ES).
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="profile">
            <AccordionTrigger className="text-lg font-semibold">
              User Profile Management
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <UserCog className="h-5 w-5 text-purple-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    To manage your account:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
                    <li>
                      Click on your <strong>Avatar</strong> in the sidebar
                      footer (bottom left).
                    </li>
                    <li>
                      This opens the user menu. Currently, user settings are
                      also accessible via the <strong>Settings</strong> page.
                    </li>
                    <li>
                      Go to <strong>Settings</strong> {'>'}{' '}
                      <strong>Profile</strong> tab.
                    </li>
                    <li>
                      You can update your <strong>Full Name</strong>,{' '}
                      <strong>Phone Number</strong>, and{' '}
                      <strong>Password</strong> here.
                    </li>
                    <li>
                      Click <strong>'Salvar Alterações'</strong> to apply
                      changes.
                    </li>
                  </ol>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="permissions">
            <AccordionTrigger className="text-lg font-semibold">
              Roles & Permissions
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <Shield className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    Access to modules depends on your assigned role:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li>
                      <strong>Platform Owner (Admin):</strong> Full access to
                      all settings, data, and system configurations.
                    </li>
                    <li>
                      <strong>Software Tenant (Manager/PM):</strong> Access to
                      day-to-day operations, properties, CRM, and financial
                      reports. Restricted from global system configs.
                    </li>
                    <li>
                      <strong>Internal User (Staff):</strong> Operational access
                      to tasks, calendar, and visits.
                    </li>
                    <li>
                      <strong>Partner / Owner / Tenant:</strong> Portal-only
                      access restricted to their own relevant data.
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
