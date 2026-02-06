import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Plus, Search, Image as ImageIcon, Hotel } from 'lucide-react'

export function PropertiesGuide() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-navy">
          <Building className="h-6 w-6 text-primary" />
          Property & Hotel Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose max-w-none text-muted-foreground">
          <p>
            Learn how to efficiently manage your residential properties and
            hotel inventory. This guide covers adding units, uploading images,
            and managing listings.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="residential">
            <AccordionTrigger className="text-lg font-semibold">
              Adding a Residential Property
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700 font-medium">
                Follow these steps to list a new residential property (House,
                Condo, Apartment):
              </p>
              <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-700">
                <li>
                  Navigate to the <strong>Properties</strong> page via the
                  sidebar.
                </li>
                <li>
                  Click the{' '}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-white">
                    <Plus className="w-3 h-3 mr-1" /> Nova Propriedade
                  </span>{' '}
                  button.
                </li>
                <li>
                  <strong>Step 1: Basic Info</strong>
                  <ul className="list-disc pl-5 mt-1 text-slate-600">
                    <li>
                      Select <strong>Rental Type</strong>: Short Term (Vacation)
                      or Long Term (Lease).
                    </li>
                    <li>
                      Enter <strong>Name</strong> and <strong>Address</strong>.
                      The system will auto-format the address.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Step 2: Financials</strong>
                  <ul className="list-disc pl-5 mt-1 text-slate-600">
                    <li>
                      Input the <strong>Listing Price</strong> (Rent/Sale
                      value).
                    </li>
                    <li>
                      Specify <strong>HOA Fees</strong> if applicable.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Step 3: Details & Media</strong>
                  <ul className="list-disc pl-5 mt-1 text-slate-600">
                    <li>Add Bedrooms, Bathrooms, and Guest Capacity.</li>
                    <li>
                      Upload a <strong>Cover Image</strong> to represent the
                      property in listings.
                    </li>
                  </ul>
                </li>
                <li>
                  Click <strong>'Salvar'</strong> to create the listing.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hotels">
            <AccordionTrigger className="text-lg font-semibold flex items-center gap-2">
              <Hotel className="h-4 w-4" /> Hotel Management
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                Managing Hotels involves a hierarchy:{' '}
                <strong>Hotel &gt; Tower &gt; Room</strong>.
              </p>

              <div className="space-y-4">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h4 className="font-bold text-sm text-blue-900">
                    1. Adding a Hotel
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Go to <strong>Hotels</strong> in the sidebar and click{' '}
                    <strong>"Novo Hotel"</strong>. Fill in the hotel name,
                    address, and manager contact details.
                  </p>
                </div>

                <div className="border-l-2 border-indigo-500 pl-4">
                  <h4 className="font-bold text-sm text-indigo-900">
                    2. Adding Towers
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Open the Hotel Details page. In the "Towers" section, click{' '}
                    <strong>"Add Tower"</strong>. Specify the tower name (e.g.,
                    "North Wing") and total floors.
                  </p>
                </div>

                <div className="border-l-2 border-purple-500 pl-4">
                  <h4 className="font-bold text-sm text-purple-900">
                    3. Managing Rooms
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Navigate into a Tower to see the Room List. Click{' '}
                    <strong>"Add Room"</strong> to create units. You can set
                    specific room numbers and floor assignments.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="images">
            <AccordionTrigger className="text-lg font-semibold">
              Managing Photos & Documents
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <ImageIcon className="h-5 w-5 text-purple-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    Once a property is created, you can enhance it with more
                    details:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li>
                      Go to the <strong>'Fotos'</strong> tab in property details
                      to upload a gallery.
                    </li>
                    <li>
                      Use the <strong>'Documentos'</strong> tab to store deeds,
                      contracts, and insurance policies securely.
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="filtering">
            <AccordionTrigger className="text-lg font-semibold">
              Search & Filters
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <Search className="h-5 w-5 text-blue-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    Use the search bar at the top of the Properties list to find
                    properties by <strong>Name</strong>,{' '}
                    <strong>Address</strong>, or <strong>Community</strong>.
                  </p>
                  <p className="text-sm text-slate-700">
                    <strong>Advanced Filters:</strong> Use the dropdown menus to
                    filter by:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li>
                      <strong>Status:</strong> Available, Rented, Sold,
                      Maintenance.
                    </li>
                    <li>
                      <strong>Profile:</strong> Short Term vs Long Term.
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
