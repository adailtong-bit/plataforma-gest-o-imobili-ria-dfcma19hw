import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Plus, Search, Image as ImageIcon } from 'lucide-react'

export function PropertiesGuide() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-navy">
          <Building className="h-6 w-6 text-primary" />
          Property Management Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose max-w-none text-muted-foreground">
          <p>
            Learn how to efficiently manage your property listings, update
            details, and maintain an organized portfolio using the Properties
            module.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="adding">
            <AccordionTrigger className="text-lg font-semibold">
              Adding a Property (Step-by-Step)
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-slate-700 font-medium">
                Follow these steps to list a new property on the platform:
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
                  button located at the top right corner.
                </li>
                <li>
                  Fill in the <strong>'Informações Básicas'</strong> (Basic
                  Info) form.
                  <ul className="list-disc pl-5 mt-1 text-slate-600">
                    <li>
                      <strong>Title:</strong> A unique name for the property.
                    </li>
                    <li>
                      <strong>Address:</strong> Full physical address.
                    </li>
                    <li>
                      <strong>Price:</strong> Monthly rent or sale price.
                    </li>
                  </ul>
                </li>
                <li>
                  Select the <strong>Profile Type</strong> (Long Term vs Short
                  Term) to configure relevant fields automatically.
                </li>
                <li>
                  Click <strong>'Salvar'</strong> (Save) to create the listing.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="images">
            <AccordionTrigger className="text-lg font-semibold">
              Uploading & Managing Photos
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <ImageIcon className="h-5 w-5 text-purple-500 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    High-quality images are crucial for marketing. To add
                    photos:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
                    <li>Open the property details page.</li>
                    <li>
                      Go to the <strong>'Fotos'</strong> tab.
                    </li>
                    <li>
                      Drag and drop images or click <strong>'Upload'</strong>.
                    </li>
                    <li>
                      Set the best image as the <strong>Cover Photo</strong> by
                      clicking the star icon on the image.
                    </li>
                  </ol>
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
                    <strong>Address</strong>, or <strong>Tenant Name</strong>.
                  </p>
                  <p className="text-sm text-slate-700">
                    <strong>Advanced Filters:</strong> Use the dropdown menus to
                    filter by:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    <li>Status (Available, Rented, Sold)</li>
                    <li>Type (House, Apartment, Condo)</li>
                    <li>Bedrooms / Bathrooms count</li>
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
