import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, Activity, PieChart } from 'lucide-react'

export function DashboardGuide() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-navy">
          <BarChart2 className="h-6 w-6 text-primary" />
          Dashboard Usage Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose max-w-none text-muted-foreground">
          <p>
            Welcome to the COREPM Analytics Panel. This dashboard provides a
            real-time overview of your real estate portfolio's performance.
            Below is a detailed guide on how to interpret the metrics and
            charts.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="overview">
            <AccordionTrigger className="text-lg font-semibold">
              Understanding the "Visão Geral" (Overview)
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                The overview section consists of summary cards at the top of the
                dashboard. These cards provide instant insights into your key
                performance indicators (KPIs).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  <strong className="text-primary">
                    Total de Propriedades:
                  </strong>{' '}
                  Calculates the total number of properties currently registered
                  and active in your portfolio. Suspended properties are
                  excluded from this count by default.
                </li>
                <li>
                  <strong className="text-primary">Leads Ativos:</strong>{' '}
                  Displays the number of potential clients currently in the{' '}
                  <strong>"Novo"</strong> (New) or{' '}
                  <strong>"Em Negociação"</strong> (Negotiating) status within
                  the CRM module.
                </li>
                <li>
                  <strong className="text-primary">Contratos Fechados:</strong>{' '}
                  Shows the total number of leases that have been marked as{' '}
                  <strong>"Signed"</strong> or <strong>"Active"</strong> within
                  the current month.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="charts">
            <AccordionTrigger className="text-lg font-semibold">
              Interpreting Visual Charts
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <Activity className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Revenue Trends</h4>
                  <p className="text-sm text-slate-700">
                    The bar chart displays monthly revenue versus expenses.
                    Hover over any bar to see the exact monetary value for that
                    month. Green bars typically represent income, while
                    red/orange bars represent expenses.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <PieChart className="h-5 w-5 text-purple-500 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Occupancy Rate</h4>
                  <p className="text-sm text-slate-700">
                    The circular chart visualizes the percentage of your
                    properties that are currently rented versus those that are
                    vacant. A higher percentage indicates better portfolio
                    health.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="actions">
            <AccordionTrigger className="text-lg font-semibold">
              Quick Actions & Shortcuts
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                You can perform quick actions directly from the dashboard
                widgets:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>
                  Click on the <strong>"Pending Tasks"</strong> list to
                  immediately open the task details for approval.
                </li>
                <li>
                  Use the <strong>"Calendar"</strong> widget to see today's
                  check-ins and check-outs at a glance.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
