import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, Database } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

export default function MigrationHub() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.migration_hub')}
        </h1>
        <p className="text-muted-foreground">Import and export system data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-blue-600" />
              Import Data
            </CardTitle>
            <CardDescription>
              Upload CSV files to bulk import records.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-2 bg-slate-50"
            >
              <Upload className="h-4 w-4" /> Select CSV File
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-green-600" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download system data as CSV for backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-2">
            <Button variant="outline" className="w-full gap-2">
              <Download className="h-4 w-4" /> Export Properties
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Download className="h-4 w-4" /> Export Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
