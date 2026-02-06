import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileCheck, History } from 'lucide-react'

export function LeadsGuide() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-navy">
          <Users className="h-6 w-6 text-primary" />
          Lead Management Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose max-w-none text-muted-foreground">
          <p>
            The CRM module helps you track potential clients from initial
            contact to contract signing. This guide covers the entire lead
            lifecycle.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="lifecycle">
            <AccordionTrigger className="text-lg font-semibold">
              Lead Status Workflow
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                Leads progress through specific stages. It is critical to update
                the status to maintain an accurate sales funnel.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="border p-3 rounded-lg bg-blue-50 border-blue-100">
                  <strong className="block text-blue-800 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    1. Novo (New)
                  </strong>
                  <span className="text-xs text-slate-600">
                    Lead just arrived from website, portal, or manual entry.
                    <strong> Action:</strong> Review contact details and assign
                    an agent.
                  </span>
                </div>
                <div className="border p-3 rounded-lg bg-yellow-50 border-yellow-100">
                  <strong className="block text-yellow-800 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                    2. Em Negociação
                  </strong>
                  <span className="text-xs text-slate-600">
                    (In Negotiation) Contact made. Property viewings scheduled
                    or proposals sent.
                    <strong> Action:</strong> Log interactions in History.
                  </span>
                </div>
                <div className="border p-3 rounded-lg bg-green-50 border-green-100">
                  <strong className="block text-green-800 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    3. Fechado
                  </strong>
                  <span className="text-xs text-slate-600">
                    (Closed) Contract signed. Lead is converted to a Tenant.
                    <strong> Action:</strong> Use "Convert to Tenant" button.
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="managing">
            <AccordionTrigger className="text-lg font-semibold">
              Managing & Updating Leads
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <ul className="list-disc pl-5 space-y-3 text-sm text-slate-700">
                <li>
                  <strong>Updating Status:</strong> In the Kanban board view,
                  drag and drop the lead card to the next column. Alternatively,
                  open the lead details and use the status dropdown menu.
                </li>
                <li>
                  <strong>Viewing Details:</strong> Click on the lead name to
                  view contact information, source (e.g., Zillow, Airbnb), and
                  their preferred property.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="history">
            <AccordionTrigger className="text-lg font-semibold flex items-center gap-2">
              <History className="h-4 w-4" /> Contact History
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                Keeping a record of interactions is key to closing deals.
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
                <li>Open the Lead Profile.</li>
                <li>
                  Navigate to the <strong>'Histórico'</strong> tab.
                </li>
                <li>
                  You can see a timeline of status changes and automated system
                  notes.
                </li>
                <li>Add manual notes for calls, emails, or visit feedback.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="conversion">
            <AccordionTrigger className="text-lg font-semibold">
              Converting a Lead to a Tenant
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <FileCheck className="h-5 w-5 text-green-600 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    When a deal is closed:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
                    <li>Open the Lead Details.</li>
                    <li>
                      Click the <strong>'Converter para Inquilino'</strong>{' '}
                      (Convert to Tenant) button at the top right.
                    </li>
                    <li>
                      Review the pre-filled information and add lease dates
                      (Start/End).
                    </li>
                    <li>
                      The lead will be archived, and a new Tenant profile will
                      be created in the Tenants module automatically.
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
