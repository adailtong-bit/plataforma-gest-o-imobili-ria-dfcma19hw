import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
                />
              </div>
            </TabsContent>
            <TabsContent value="en">
              <div className="grid gap-2 mt-2">
                <Label>Description (EN)</Label>
                <Textarea
                  value={data.description?.en || ''}
                  onChange={(e) =>
                    onNestedChange('description', 'en', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                />
              </div>
            </TabsContent>
            <TabsContent value="es">
              <div className="grid gap-2 mt-2">
                <Label>Descripción (ES)</Label>
                <Textarea
                  value={data.description?.es || ''}
                  onChange={(e) =>
                    onNestedChange('description', 'es', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
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
                />
              </div>
            </TabsContent>
            <TabsContent value="en">
              <div className="grid gap-2 mt-2">
                <Label>Rules (EN)</Label>
                <Textarea
                  value={data.hoaRules?.en || ''}
                  onChange={(e) =>
                    onNestedChange('hoaRules', 'en', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                />
              </div>
            </TabsContent>
            <TabsContent value="es">
              <div className="grid gap-2 mt-2">
                <Label>Reglas (ES)</Label>
                <Textarea
                  value={data.hoaRules?.es || ''}
                  onChange={(e) =>
                    onNestedChange('hoaRules', 'es', e.target.value)
                  }
                  disabled={!canEdit}
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
