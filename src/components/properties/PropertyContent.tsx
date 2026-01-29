import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

interface PropertyContentProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  onNestedChange: (parent: keyof Property, key: string, value: string) => void
  canEdit: boolean
}

export function PropertyContent({
  data,
  onChange,
  onNestedChange,
  canEdit,
}: PropertyContentProps) {
  const { toast } = useToast()
  const { t } = useLanguageStore()

  // Automated Description Translation Logic
  const handleDescriptionChange = (lang: 'pt' | 'en' | 'es', value: string) => {
    // Construct the new description object based on current state
    const currentDescription = data.description || { pt: '', en: '', es: '' }

    // Start with the updated value for the current language
    const newDescription = {
      ...currentDescription,
      [lang]: value,
    }

    // Auto-translate to others if they are empty
    const others = (['pt', 'en', 'es'] as const).filter((l) => l !== lang)
    others.forEach((otherLang) => {
      const currentOther = newDescription[otherLang]
      // Only auto-fill if the other field is empty and we have a value to translate from
      if (
        (!currentOther || currentOther.trim() === '') &&
        value.trim() !== ''
      ) {
        // Simple mock translation: just prepend the lang code to indicate it's auto-filled
        // In a real application, this would be an API call to a translation service
        newDescription[otherLang] = `[${otherLang.toUpperCase()}] ${value}`
      }
    })

    // Perform a single atomic update for the entire description object
    // This ensures no race conditions or batched state update issues occur
    onChange('description', newDescription)
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
        title: t('common.copied'),
        description: `Content copied from ${from.toUpperCase()} to ${to.toUpperCase()}.`,
      })
    } else {
      toast({
        title: t('common.empty'),
        description: `Content in ${from.toUpperCase()} is empty.`,
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
            {t('properties.public_desc')}
            {canEdit && (
              <div className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                <Wand2 className="h-3 w-3" />{' '}
                {t('properties.content.auto_translate')}
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
                <Label>{t('common.description')} (PT)</Label>
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
                  <Label>{t('common.description')} (EN)</Label>
                  {canEdit && !getDesc('en') && getDesc('pt') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent('description', 'pt', 'en')}
                    >
                      <Copy className="h-3 w-3 mr-1" />{' '}
                      {t('properties.content.copy_from')} PT
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
                  <Label>{t('common.description')} (ES)</Label>
                  {canEdit && !getDesc('es') && getDesc('pt') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent('description', 'pt', 'es')}
                    >
                      <Copy className="h-3 w-3 mr-1" />{' '}
                      {t('properties.content.copy_from')} PT
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
          <CardTitle>{t('properties.content.house_rules')}</CardTitle>
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
                      <Copy className="h-3 w-3 mr-1" />{' '}
                      {t('properties.content.copy_from')} PT
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
                      <Copy className="h-3 w-3 mr-1" />{' '}
                      {t('properties.content.copy_from')} PT
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
