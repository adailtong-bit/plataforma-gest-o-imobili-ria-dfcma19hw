import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, BookOpen, MessageCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useLanguageStore from '@/stores/useLanguageStore'

export default function HelpHub() {
  const { t } = useLanguageStore()

  const resources = [
    {
      title: 'Documentation',
      icon: BookOpen,
      desc: 'Read detailed guides on using the platform.',
    },
    {
      title: 'Video Tutorials',
      icon: FileText,
      desc: 'Watch step-by-step video instructions.',
    },
    {
      title: 'Contact Support',
      icon: MessageCircle,
      desc: 'Get in touch with our support team directly.',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.help_hub')}
        </h1>
        <p className="text-muted-foreground">Find answers and get support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res, idx) => (
          <Card
            key={idx}
            className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <res.icon className="h-5 w-5 text-blue-600" />
                {res.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-slate-600 mb-4">{res.desc}</p>
              <Button variant="outline" className="w-full">
                Access Resource
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
