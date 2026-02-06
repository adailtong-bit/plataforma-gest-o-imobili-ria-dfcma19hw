import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, Activity, PieChart, Info, Settings2 } from 'lucide-react'

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
              Understanding the KPI Cards
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
                    Total de Propriedades (Total Properties):
                  </strong>{' '}
                  Calculates the total number of properties currently registered
                  and active in your portfolio. Suspended properties are
                  excluded from this count by default.
                </li>
                <li>
                  <strong className="text-primary">
                    Listagens Ativas (Active Listings):
                  </strong>{' '}
                  Displays the number of properties currently marketed with a
                  status of "Available".
                </li>
                <li>
                  <strong className="text-primary">
                    Visitas Pendentes (Pending Visits):
                  </strong>{' '}
                  Shows the total number of scheduled property visits that have
                  not yet been marked as completed.
                </li>
                <li>
                  <strong className="text-primary">
                    Receita Total (Total Revenue):
                  </strong>{' '}
                  Aggregates all income ledger entries for the current period.
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
                  <h4 className="font-bold text-sm">Expense Distribution</h4>
                  <p className="text-sm text-slate-700">
                    The circular chart visualizes the distribution of expenses
                    across categories such as Maintenance, Cleaning, Taxes, and
                    Utilities. Use this to identify cost-saving opportunities.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gamification">
            <AccordionTrigger className="text-lg font-semibold">
              Portfolio Health Score
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <Info className="h-5 w-5 text-yellow-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    The <strong>Health Score</strong> is a gamified metric
                    (0-100) that indicates the overall performance of your
                    portfolio based on:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li>Occupancy rates</li>
                    <li>Timely rent collection</li>
                    <li>Completion of maintenance tasks</li>
                  </ul>
                  <p className="text-sm text-slate-700">
                    Aim for a score above <strong>80</strong> to maintain
                    "Expert" status.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="customization">
            <AccordionTrigger className="text-lg font-semibold">
              Customizing Your View
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <Settings2 className="h-5 w-5 text-slate-500 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">
                    You can toggle visibility for specific widgets to declutter
                    your workspace:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700 mt-2">
                    <li>
                      Click the <strong>Customize</strong> button at the top
                      right of the Dashboard.
                    </li>
                    <li>
                      Check or uncheck the boxes for KPI Indicators, Health
                      Score, or Revenue Chart.
                    </li>
                    <li>
                      Click <strong>Done</strong> to save your preferences for
                      the current session.
                    </li>
                  </ol>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
