import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, PieChart, TrendingUp } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Reports() {
  const { t } = useLanguageStore()

  const reports = [
    {
      title: 'Financial Summary',
      icon: PieChart,
      desc: 'Monthly revenue, expenses, and net profit.',
    },
    {
      title: 'Occupancy Report',
      icon: TrendingUp,
      desc: 'Detailed occupancy rates across all properties.',
    },
    {
      title: 'Maintenance Logs',
      icon: FileText,
      desc: 'All maintenance requests and costs.',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.reports')}
        </h1>
        <p className="text-muted-foreground">
          Download and analyze system reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <Card
            key={idx}
            className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <report.icon className="h-5 w-5 text-blue-600" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">{report.desc}</p>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
