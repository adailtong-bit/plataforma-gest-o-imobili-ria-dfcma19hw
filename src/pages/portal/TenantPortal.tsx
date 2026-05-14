import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import useTaskStore from '@/stores/useTaskStore'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  Wrench,
  MessageSquare,
  FileText,
  Send,
  Plus,
  Calendar,
  Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

export default function TenantPortal() {
  const { currentUser, allUsers, simulationMode, simulationRole } =
    useAuthStore()
  const { properties, tenants } = useContext(AppContext)!
  const { tasks, addTask } = useTaskStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  let targetUserId = currentUser?.id
  let displayName = currentUser?.name

  if (simulationMode && simulationRole === 'tenant') {
    const firstTenant = allUsers.find((u) => u.role === 'tenant')
    if (firstTenant) {
      targetUserId = firstTenant.id
      displayName = `[Simulated] ${firstTenant.name}`
    }
  }

  const activeTenant = tenants.find((t) => t.id === targetUserId)
  const property = properties.find((p) => p.id === activeTenant?.propertyId)

  // Maintenance Dialog
  const [openMaintenance, setOpenMaintenance] = useState(false)
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  })

  // Messages
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<
    { sender: 'me' | 'pm'; text: string; date: Date }[]
  >([
    {
      sender: 'pm',
      text: 'Welcome to your tenant portal! Let us know if you need anything.',
      date: new Date(Date.now() - 86400000),
    },
  ])

  const tenantTasks = tasks.filter(
    (t) => t.propertyId === property?.id && t.source === 'tenant',
  )

  const handleCreateMaintenance = () => {
    if (!maintenanceForm.title || !property) return

    addTask({
      title: maintenanceForm.title,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.address,
      type: 'maintenance',
      priority: maintenanceForm.priority as any,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      source: 'tenant',
      price: 0,
      laborCost: 0,
      teamMemberPayout: 0,
      pricingModel: 'pm_driven',
    })

    toast({ title: 'Maintenance request submitted' })
    setOpenMaintenance(false)
    setMaintenanceForm({ title: '', description: '', priority: 'medium' })
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    setMessages([
      ...messages,
      { sender: 'me', text: message, date: new Date() },
    ])
    setMessage('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'pm',
          text: 'We received your message and will reply shortly.',
          date: new Date(),
        },
      ])
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome, {displayName}
        </h1>
        <p className="text-muted-foreground">Tenant Portal</p>
      </div>

      {!property ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-600">
              You do not have an active lease at the moment. If you believe this
              is an error, please contact your property manager.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 max-w-md">
            <TabsTrigger value="overview" className="gap-2">
              <Home className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="h-4 w-4" /> Maintenance
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-trust-blue" /> Current Lease
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{property.name}</h3>
                    <p className="text-slate-600">{property.address}</p>
                    {property.city && (
                      <p className="text-slate-500">
                        {property.city}, {property.state}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Monthly Rent</p>
                      <p className="font-semibold">
                        ${activeTenant?.rentValue || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-50"
                      >
                        {activeTenant?.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-trust-blue" /> Contracts &
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Lease Agreement</p>
                          <p className="text-xs text-slate-500">
                            Signed on {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>
                    Open and track issues for your property.
                  </CardDescription>
                </div>
                <Dialog
                  open={openMaintenance}
                  onOpenChange={setOpenMaintenance}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-trust-blue text-white gap-2">
                      <Plus className="h-4 w-4" /> New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Maintenance Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Issue Title</Label>
                        <Input
                          placeholder="E.g., Leaking faucet in kitchen"
                          value={maintenanceForm.title}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={maintenanceForm.priority}
                          onValueChange={(v) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              priority: v,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              Low - Routine issue
                            </SelectItem>
                            <SelectItem value="medium">
                              Medium - Needs attention soon
                            </SelectItem>
                            <SelectItem value="high">
                              High - Urgent issue
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Provide more details..."
                          value={maintenanceForm.description}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setOpenMaintenance(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateMaintenance}
                        disabled={!maintenanceForm.title}
                      >
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tenantTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Wrench className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                    <p>No maintenance requests found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tenantTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {task.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Priority:{' '}
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="flex flex-col h-[600px]">
              <CardHeader>
                <CardTitle>Property Manager Chat</CardTitle>
                <CardDescription>
                  Negotiations and general inquiries.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-6 pt-0">
                <ScrollArea className="flex-1 border rounded-md p-4 bg-slate-50/50">
                  <div className="flex flex-col gap-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
                      >
                        <div
                          className={`p-3 rounded-lg text-sm shadow-sm ${msg.sender === 'me' ? 'bg-trust-blue text-white rounded-br-none' : 'bg-white border rounded-bl-none'}`}
                        >
                          {msg.text}
                        </div>
                        <span
                          className={`text-[10px] text-muted-foreground mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}
                        >
                          {format(msg.date, 'MMM d, h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-trust-blue text-white px-8"
                  >
                    <Send className="h-4 w-4 mr-2" /> Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
