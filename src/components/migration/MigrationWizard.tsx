import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowRight,
  Upload,
  CheckCircle,
  AlertCircle,
  Database,
  Building,
  User,
  ClipboardList,
} from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useTaskStore from '@/stores/useTaskStore'
import useAuditStore from '@/stores/useAuditStore'
import { useToast } from '@/hooks/use-toast'
import { Property, Owner, Task, PropertyStatus } from '@/lib/types'

type Step = 'source' | 'upload' | 'mapping' | 'preview' | 'complete'

// Mock Data from CIIRUS export
const MOCK_CIIRUS_DATA = {
  properties: [
    {
      externalId: 'C-101',
      name: 'Sunset Villa',
      address: '123 Ocean Dr',
      owner: 'John Doe',
      status: 'Active',
    },
    {
      externalId: 'C-102',
      name: 'Palm Condo',
      address: '456 Palm Way',
      owner: 'Jane Smith',
      status: 'Active',
    },
  ],
  owners: [
    {
      externalId: 'O-55',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0101',
    },
    {
      externalId: 'O-66',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-0202',
    },
  ],
  tasks: [
    {
      externalId: 'T-900',
      title: 'Clean Out',
      propertyId: 'C-101',
      date: '2024-05-01',
      type: 'Cleaning',
      cost: 150,
    },
    {
      externalId: 'T-901',
      title: 'Fix AC',
      propertyId: 'C-102',
      date: '2024-05-02',
      type: 'Maintenance',
      cost: 200,
    },
  ],
}

export function MigrationWizard() {
  const [step, setStep] = useState<Step>('source')
  const [source, setSource] = useState('ciirus')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [mappedData, setMappedData] = useState<any>(null)
  const { addProperty } = usePropertyStore()
  const { addOwner } = useOwnerStore()
  const { addTask } = useTaskStore()
  const { addAuditLog } = useAuditStore()
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const simulateProcessing = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setMappedData(MOCK_CIIRUS_DATA)
          setStep('mapping')
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleImport = () => {
    if (!mappedData) return

    let importedProps = 0
    let importedOwners = 0
    let importedTasks = 0

    // Import Owners
    mappedData.owners.forEach((o: any) => {
      const ownerId = `owner-${Date.now()}-${Math.random()}`
      // Store ID mapping if needed, simplified here
      addOwner({
        id: ownerId,
        name: o.name,
        email: o.email,
        phone: o.phone,
        status: 'active',
        role: 'property_owner',
        isDemo: false,
      } as Owner)
      importedOwners++
    })

    // Import Properties (simplified linking)
    mappedData.properties.forEach((p: any) => {
      const propId = `prop-${Date.now()}-${Math.random()}`
      addProperty({
        id: propId,
        name: p.name,
        address: p.address,
        status: 'available',
        type: 'House',
        profileType: 'short_term',
        community: 'Imported',
        bedrooms: 3,
        bathrooms: 2,
        guests: 6,
        ownerId: 'owner-import-placeholder', // In real app, link to imported owner
        image: 'https://img.usecurling.com/p/400/300?q=house',
        documents: [],
      } as Property)
      importedProps++
    })

    // Import Tasks
    mappedData.tasks.forEach((t: any) => {
      addTask({
        id: `task-${Date.now()}-${Math.random()}`,
        title: t.title,
        propertyId: 'prop-import-placeholder', // In real app, link to prop
        propertyName: 'Imported Property',
        status: 'completed',
        type: t.type.toLowerCase() as any,
        assignee: 'Migrated',
        date: new Date().toISOString(),
        priority: 'medium',
        price: t.cost,
        source: 'migration',
      } as Task)
      importedTasks++
    })

    addAuditLog({
      userId: 'system',
      userName: 'System Migration',
      action: 'import',
      entity: 'MigrationHub',
      details: `Imported ${importedProps} properties, ${importedOwners} owners, ${importedTasks} tasks from ${source}.`,
    })

    setStep('complete')
    toast({
      title: 'Import Successful',
      description: `${importedProps} properties and related data imported.`,
    })
  }

  const renderSourceStep = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Select Source Platform</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger>
            <SelectValue placeholder="Select Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ciirus">CIIRUS (Legacy)</SelectItem>
            <SelectItem value="csv">Custom CSV / Excel</SelectItem>
            <SelectItem value="manual">Manual Entry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
        <p className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4" /> Migration Scope
        </p>
        <p className="mt-1">
          This wizard will import Properties, Owners, and Historical Tasks. Use
          CSV export from CIIRUS for best results.
        </p>
      </div>
    </div>
  )

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center">
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-medium">Upload Export File</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop your .CSV or .XML file here
        </p>
        <Input
          type="file"
          accept=".csv,.xml,.xlsx"
          className="max-w-xs"
          onChange={handleFileUpload}
        />
        {file && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircle className="h-4 w-4" /> {file.name} ready
          </div>
        )}
      </div>
      {progress > 0 && progress < 100 && (
        <div className="space-y-2">
          <Label>Processing Data...</Label>
          <Progress value={progress} />
        </div>
      )}
    </div>
  )

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4" /> Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {mappedData?.properties.length}
            </div>
            <p className="text-xs text-muted-foreground">Found in file</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Owners
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {mappedData?.owners.length}
            </div>
            <p className="text-xs text-muted-foreground">Found in file</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{mappedData?.tasks.length}</div>
            <p className="text-xs text-muted-foreground">History records</p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Field</TableHead>
              <TableHead>Target Field</TableHead>
              <TableHead>Sample Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>
                <Badge variant="outline">name</Badge>
              </TableCell>
              <TableCell>Sunset Villa</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Street Address</TableCell>
              <TableCell>
                <Badge variant="outline">address</Badge>
              </TableCell>
              <TableCell>123 Ocean Dr</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Owner Email</TableCell>
              <TableCell>
                <Badge variant="outline">email</Badge>
              </TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
        <AlertCircle className="h-4 w-4" />
        Pricing Logic: Service Catalog pricing will be applied to imported tasks
        where matching service types are found.
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
      <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-navy">Migration Complete!</h2>
      <p className="text-muted-foreground max-w-md">
        Your data has been successfully imported into the platform. You can now
        review the properties and invite owners.
      </p>
      <Button
        onClick={() => (window.location.href = '/properties')}
        className="bg-trust-blue"
      >
        Go to Properties
      </Button>
    </div>
  )

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>System Migration Wizard</CardTitle>
        <CardDescription>
          Import data from legacy systems like CIIRUS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'source' && renderSourceStep()}
        {step === 'upload' && renderUploadStep()}
        {(step === 'mapping' || step === 'preview') && renderMappingStep()}
        {step === 'complete' && renderCompleteStep()}
      </CardContent>
      {step !== 'complete' && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            disabled={step === 'source'}
            onClick={() => {
              if (step === 'upload') setStep('source')
              if (step === 'mapping') setStep('upload')
            }}
          >
            Back
          </Button>
          <Button
            className="bg-trust-blue gap-2"
            disabled={step === 'upload' && !file}
            onClick={() => {
              if (step === 'source') setStep('upload')
              else if (step === 'upload') simulateProcessing()
              else if (step === 'mapping') handleImport()
            }}
          >
            {step === 'mapping' ? 'Start Import' : 'Next Step'}
            {step !== 'mapping' && <ArrowRight className="h-4 w-4" />}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
