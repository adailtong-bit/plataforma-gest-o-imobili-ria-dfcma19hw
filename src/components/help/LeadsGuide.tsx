import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileCheck } from 'lucide-react'

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
              The Lead Lifecycle
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                Leads progress through specific stages in the system. It is
                important to keep the status updated to ensure accurate
                reporting.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="border p-3 rounded-lg bg-blue-50">
                  <strong className="block text-blue-700 mb-1">
                    1. Novo (New)
                  </strong>
                  <span className="text-xs text-slate-600">
                    Lead just arrived from website, portal, or manual entry. Not
                    yet contacted.
                  </span>
                </div>
                <div className="border p-3 rounded-lg bg-yellow-50">
                  <strong className="block text-yellow-700 mb-1">
                    2. Em Negociação
                  </strong>
                  <span className="text-xs text-slate-600">
                    Contact made. Property viewings scheduled or proposals sent.
                  </span>
                </div>
                <div className="border p-3 rounded-lg bg-green-50">
                  <strong className="block text-green-700 mb-1">
                    3. Fechado
                  </strong>
                  <span className="text-xs text-slate-600">
                    Contract signed. Lead is converted to a Tenant.
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
                  <strong>Updating Status:</strong> Click on a lead card in the
                  CRM board and drag it to the next column, or use the status
                  dropdown in the lead details view.
                </li>
                <li>
                  <strong>Viewing Details:</strong> Click on the lead name to
                  view contact information, source (e.g., Zillow, Airbnb), and
                  preferred property.
                </li>
                <li>
                  <strong>Notes & History:</strong> Use the{' '}
                  <strong>'Histórico'</strong> tab within a lead profile to log
                  calls, emails, or visit notes.
                </li>
              </ul>
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
                    Once a lead agrees to rent:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
                    <li>Open the Lead Details.</li>
                    <li>
                      Click the <strong>'Converter para Inquilino'</strong>{' '}
                      (Convert to Tenant) button.
                    </li>
                    <li>
                      Review the pre-filled information and add lease dates.
                    </li>
                    <li>
                      The lead will be archived, and a new Tenant profile will
                      be created automatically.
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
