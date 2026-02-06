import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, PlayCircle, BookOpen, HelpCircle } from 'lucide-react'
import useTourStore from '@/stores/useTourStore'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { VideoPlayerModal } from '@/components/help/VideoPlayerModal'

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
          <HelpCircle className="h-8 w-8 text-primary" /> Central de Ajuda
        </h1>
        <p className="text-muted-foreground">
          Tutoriais em vídeo e guias para ajudar você a dominar a plataforma.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar tutoriais..."
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
              className="data-[state=active]:bg-primary data-[state=active]:text-white border border-transparent data-[state=active]:border-primary bg-white hover:bg-slate-100 rounded-full px-4"
            >
              {cat === 'All' ? 'Todos' : cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredByCategory(cat).length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  Nenhum tutorial encontrado nesta categoria.
                </div>
              ) : (
                getFilteredByCategory(cat).map((module) => (
                  <Card
                    key={module.key}
                    className="hover:shadow-lg transition-all group cursor-pointer border-slate-200"
                    onClick={() => openVideo(module.videoUrl)}
                  >
                    <CardHeader className="pb-2">
                      <div className="aspect-video bg-slate-100 rounded-md mb-3 flex items-center justify-center relative overflow-hidden group-hover:ring-2 ring-primary/20 transition-all">
                        <PlayCircle className="h-12 w-12 text-slate-400 group-hover:text-primary transition-colors z-10" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        {/* Placeholder generic image background for aesthetic */}
                        <img
                          src={`https://img.usecurling.com/p/400/225?q=${module.category}%20technology&color=blue&dpr=1`}
                          alt={module.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply"
                        />
                      </div>
                      <CardTitle className="text-base flex items-center justify-between line-clamp-1">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 h-10">
                        {module.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="default"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                        onClick={(e) => {
                          e.stopPropagation()
                          openVideo(module.videoUrl)
                        }}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" /> Assistir Agora
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full text-blue-600 shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-lg">
              Documentação Completa
            </h3>
            <p className="text-sm text-blue-700">
              Leia guias detalhados e referências da API.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold"
        >
          Ver Documentação
        </Button>
      </div>

      <VideoPlayerModal />
    </div>
  )
}
