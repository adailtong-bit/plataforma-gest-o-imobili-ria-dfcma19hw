import { useState } from 'react'
import { MigrationWizard } from '@/components/migration/MigrationWizard'
import {
  Database,
  History,
  ChevronRight,
  KeyRound,
  Copy,
  ShieldCheck,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import useAuditStore from '@/stores/useAuditStore'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function MigrationHub() {
  const { auditLogs } = useAuditStore()
  const importHistory = auditLogs.filter((l) => l.action === 'import')
  const [logOpen, setLogOpen] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: `Copied ${text}`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Migration Hub
          </h1>
          <p className="text-muted-foreground">
            Import properties, owners, and historical data from external
            platforms.
          </p>
        </div>
        <Sheet open={logOpen} onOpenChange={setLogOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" /> View Migration Logs
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Migration History</SheetTitle>
              <SheetDescription>
                Detailed logs of data import operations.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[80vh] mt-4 pr-4">
              <div className="space-y-4">
                {importHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No import history found.
                  </p>
                ) : (
                  importHistory.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-3 space-y-2 bg-muted/20"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">
                          {log.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'PP pp')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.details}</p>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Database className="h-3 w-3" /> Source: CIIRUS/CSV
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Multi-Role Access Dashboard */}
      <Card className="border-blue-200 shadow-sm animate-fade-in">
        <CardHeader className="bg-blue-50/50">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <KeyRound className="h-5 w-5 text-blue-600" />
            Multi-Role Access Dashboard
          </CardTitle>
          <CardDescription>
            Use these credentials on the login screen to test different
            permission levels and views. The system is populated with thousands
            of records. Password for all is{' '}
            <strong className="font-mono text-slate-800">demo123</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="font-bold text-slate-900">Role</TableHead>
                <TableHead className="font-bold text-slate-900">
                  Description
                </TableHead>
                <TableHead className="font-bold text-slate-900">
                  Login Email
                </TableHead>
                <TableHead className="text-right font-bold text-slate-900">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-white hover:bg-slate-50">
                <TableCell className="font-bold">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    Admin (Platform Owner)
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Full system access, all properties and settings.
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  admin@corepm.com
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('admin@corepm.com')}
                    className="gap-2 border-slate-300"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="bg-white hover:bg-slate-50">
                <TableCell className="font-bold">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Manager (PM)
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Software tenant managing operations.
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  pm@corepm.com
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('pm@corepm.com')}
                    className="gap-2 border-slate-300"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="bg-white hover:bg-slate-50">
                <TableCell className="font-bold">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Tenant
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Renter viewing their lease, payments, and tickets.
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  tenant@demo.com
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('tenant@demo.com')}
                    className="gap-2 border-slate-300"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="bg-white hover:bg-slate-50">
                <TableCell className="font-bold">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    Owner
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Property owner checking statements and approvals.
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  owner@demo.com
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('owner@demo.com')}
                    className="gap-2 border-slate-300"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="bg-white hover:bg-slate-50">
                <TableCell className="font-bold">
                  <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                    Partner / Supplier
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Service provider managing tasks and invoices.
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold">
                  partner@demo.com
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('partner@demo.com')}
                    className="gap-2 border-slate-300"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MigrationWizard />

      <Card className="max-w-3xl mx-auto w-full mt-6 bg-blue-50/30 border-blue-100">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Need help migrating?
            </h3>
            <p className="text-sm text-blue-700">
              Check our documentation for CSV formatting and API limits.
            </p>
          </div>
          <Button variant="link" className="text-blue-600 font-bold">
            View Docs <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
