import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, PlayCircle, BookOpen, HelpCircle } from 'lucide-react'
import useTourStore from '@/stores/useTourStore'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function HelpHub() {
  const { tutorialModules, openVideo } = useTourStore()
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    'All',
    'Operational',
    'CRM',
    'Financial',
    'Settings',
    'System',
  ]

  const filteredModules = tutorialModules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getFilteredByCategory = (cat: string) => {
    if (cat === 'All') return filteredModules
    return filteredModules.filter((m) => m.category === cat)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" /> Help Hub
        </h1>
        <p className="text-muted-foreground">
          Video tutorials and guides to help you master the platform.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tutorials..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="All" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="data-[state=active]:bg-primary data-[state=active]:text-white border border-transparent data-[state=active]:border-primary bg-white hover:bg-slate-100"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredByCategory(cat).length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  No tutorials found in this category matching your search.
                </div>
              ) : (
                getFilteredByCategory(cat).map((module) => (
                  <Card
                    key={module.key}
                    className="hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => openVideo(module.videoUrl)}
                  >
                    <CardHeader className="pb-2">
                      <div className="aspect-video bg-slate-100 rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                        <PlayCircle className="h-12 w-12 text-slate-400 group-hover:text-primary transition-colors" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                      <CardTitle className="text-base flex items-center justify-between">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {module.description}
                      </CardDescription>
                      <Button variant="link" className="px-0 mt-2 text-primary">
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Documentation</h3>
            <p className="text-sm text-blue-700">
              Read detailed guides and API references.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-white text-blue-700 border-blue-200"
        >
          View Docs
        </Button>
      </div>
    </div>
  )
}
