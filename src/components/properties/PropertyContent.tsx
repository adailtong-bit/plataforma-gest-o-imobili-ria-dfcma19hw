import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Descrição Pública</CardTitle>
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
                  value={data.description?.pt || ''}
                  onChange={(e) =>
                    onNestedChange('description', 'pt', e.target.value)
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
                  {canEdit && !data.description?.en && (
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
                  value={data.description?.en || ''}
                  onChange={(e) =>
                    onNestedChange('description', 'en', e.target.value)
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
                  {canEdit && !data.description?.es && (
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
                  value={data.description?.es || ''}
                  onChange={(e) =>
                    onNestedChange('description', 'es', e.target.value)
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
                  value={data.hoaRules?.pt || ''}
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
                  {canEdit && !data.hoaRules?.en && (
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
                  value={data.hoaRules?.en || ''}
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
                  {canEdit && !data.hoaRules?.es && (
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
                  value={data.hoaRules?.es || ''}
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
