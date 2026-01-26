import { useEffect } from 'react'
import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PropertyContentProps {
  data: Property
  onNestedChange: (parent: keyof Property, key: string, value: string) => void
  canEdit: boolean
}

export function PropertyContent({
  data,
  onNestedChange,
  canEdit,
}: PropertyContentProps) {
  const { toast } = useToast()

  // Automated Description Translation Logic
  const handleDescriptionChange = (lang: 'pt' | 'en' | 'es', value: string) => {
    // Update current language
    onNestedChange('description', lang, value)

    // Auto-translate to others if they are empty
    // This is a simulation of real-time translation
    const others = (['pt', 'en', 'es'] as const).filter((l) => l !== lang)
    others.forEach((otherLang) => {
      const currentOther = data.description?.[otherLang]
      if (!currentOther || currentOther.trim() === '') {
        // Simple mock translation: just prepend the lang code to indicate it's auto-filled
        // In production, this would call a translation API
        const mockTranslation = `[${otherLang.toUpperCase()}] ${value}`
        onNestedChange('description', otherLang, mockTranslation)
      }
    })
  }

  const copyContent = (
    field: 'description' | 'hoaRules',
    from: 'pt' | 'en' | 'es',
    to: 'pt' | 'en' | 'es',
  ) => {
    const content = data[field]?.[from]
    if (content) {
      onNestedChange(field, to, content)
      toast({
        title: 'Copiado',
        description: `Conteúdo copiado de ${from.toUpperCase()} para ${to.toUpperCase()}.`,
      })
    } else {
      toast({
        title: 'Vazio',
        description: `O conteúdo em ${from.toUpperCase()} está vazio.`,
        variant: 'destructive',
      })
    }
  }

  // Helper to safely access nested properties
  const getDesc = (lang: 'pt' | 'en' | 'es') => data.description?.[lang] || ''
  const getRules = (lang: 'pt' | 'en' | 'es') => data.hoaRules?.[lang] || ''

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Descrição Pública
            {canEdit && (
              <div className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                <Wand2 className="h-3 w-3" /> Auto-translate active
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pt">
            <TabsList>
              <TabsTrigger value="pt">Português</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="es">Español</TabsTrigger>
            </TabsList>
            <TabsContent value="pt">
              <div className="grid gap-2 mt-2">
                <Label>Descrição (PT)</Label>
                <Textarea
                  value={getDesc('pt')}
                  onChange={(e) =>
                    handleDescriptionChange('pt', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                  placeholder="Descrição completa em Português..."
                />
              </div>
            </TabsContent>
            <TabsContent value="en">
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <Label>Description (EN)</Label>
                  {canEdit && !getDesc('en') && getDesc('pt') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent('description', 'pt', 'en')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copiar de PT
                    </Button>
                  )}
                </div>
                <Textarea
                  value={getDesc('en')}
                  onChange={(e) =>
                    handleDescriptionChange('en', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                  placeholder="Full description in English..."
                />
              </div>
            </TabsContent>
            <TabsContent value="es">
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <Label>Descripción (ES)</Label>
                  {canEdit && !getDesc('es') && getDesc('pt') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent('description', 'pt', 'es')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copiar de PT
                    </Button>
                  )}
                </div>
                <Textarea
                  value={getDesc('es')}
                  onChange={(e) =>
                    handleDescriptionChange('es', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                  placeholder="Descripción completa en Español..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras da Casa / HOA</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pt">
            <TabsList>
              <TabsTrigger value="pt">Português</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="es">Español</TabsTrigger>
            </TabsList>
            <TabsContent value="pt">
              <div className="grid gap-2 mt-2">
                <Label>Regras (PT)</Label>
                <Textarea
                  value={getRules('pt')}
                  onChange={(e) =>
                    onNestedChange('hoaRules', 'pt', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                  placeholder="Regras do condomínio..."
                />
              </div>
            </TabsContent>
            <TabsContent value="en">
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <Label>Rules (EN)</Label>
                  {canEdit && !getRules('en') && getRules('pt') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent('hoaRules', 'pt', 'en')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copiar de PT
                    </Button>
                  )}
                </div>
                <Textarea
                  value={getRules('en')}
                  onChange={(e) =>
                    onNestedChange('hoaRules', 'en', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                  placeholder="HOA Rules..."
                />
              </div>
            </TabsContent>
            <TabsContent value="es">
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <Label>Reglas (ES)</Label>
                  {canEdit && !getRules('es') && getRules('pt') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent('hoaRules', 'pt', 'es')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copiar de PT
                    </Button>
                  )}
                </div>
                <Textarea
                  value={getRules('es')}
                  onChange={(e) =>
                    onNestedChange('hoaRules', 'es', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                  placeholder="Reglas del condominio..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
