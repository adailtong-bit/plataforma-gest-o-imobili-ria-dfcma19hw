import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Settings, Play, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useWorkflowStore from '@/stores/useWorkflowStore'
import useLanguageStore from '@/stores/useLanguageStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { Workflow, WorkflowStep, UserRole } from '@/lib/types'
import { MultiSelect } from '@/components/ui/multi-select'
import { useNavigate } from 'react-router-dom'
import { DataMask } from '@/components/DataMask'

const initialWorkflowState: Omit<Workflow, 'id'> = {
  name: '',
  description: '',
  trigger: 'manual',
  active: true,
  steps: [],
  propertyIds: [],
}

const initialStepState: WorkflowStep = {
  id: '',
  name: '',
  role: 'platform_owner',
  actionType: 'task',
}

export default function Workflows() {
  const {
    workflows,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
  } = useWorkflowStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState<
    Omit<Workflow, 'id'> & { id?: string }
  >(initialWorkflowState)
  const [newStep, setNewStep] = useState<WorkflowStep>(initialStepState)

  // Execution State
  const [runDialogOpen, setRunDialogOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null,
  )
  const [selectedRunPropertyIds, setSelectedRunPropertyIds] = useState<
    string[]
  >([])

  const propertyOptions = properties.map((p) => ({
    label: p.name,
    value: p.id,
  }))

  const getRoleName = (role: UserRole) => {
    return t(`roles.${role}`)
  }

  const handleRunClick = (wf: Workflow) => {
    setSelectedWorkflow(wf)
    // If workflow has configured properties, default to them. Else, empty.
    setSelectedRunPropertyIds(
      wf.propertyIds && wf.propertyIds.length > 0 ? wf.propertyIds : [],
    )
    setRunDialogOpen(true)
  }

  const handleExecute = () => {
    if (!selectedWorkflow) return

    if (selectedRunPropertyIds.length === 0) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    // Execute directly using the dedicated method
    executeWorkflow(selectedWorkflow, selectedRunPropertyIds)

    setRunDialogOpen(false)
    setSelectedWorkflow(null)
    setSelectedRunPropertyIds([])

    // Redirect to Tasks
    navigate('/tasks')
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setCurrentWorkflow(initialWorkflowState)
      setIsEditing(false)
    }
  }

  const handleSave = () => {
    if (!currentWorkflow.name) {
      toast({
        title: t('common.error'),
        description: t('common.name_required'),
        variant: 'destructive',
      })
      return
    }

    if (isEditing && currentWorkflow.id) {
      updateWorkflow(currentWorkflow as Workflow)
      toast({ title: t('common.save'), description: 'Workflow updated.' })
    } else {
      addWorkflow({
        ...currentWorkflow,
        id: `wf_${Date.now()}`,
      } as Workflow)
      toast({ title: t('common.save'), description: 'Workflow created.' })
    }
    handleOpenChange(false)
  }

  const handleEdit = (wf: Workflow) => {
    setCurrentWorkflow(wf)
    setIsEditing(true)
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteWorkflow(id)
    toast({ title: t('common.delete'), description: 'Workflow deleted.' })
  }

  const addStep = () => {
    if (!newStep.name) return
    const step = { ...newStep, id: `step_${Date.now()}` }
    setCurrentWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, step],
    }))
    setNewStep(initialStepState)
  }

  const removeStep = (stepId: string) => {
    setCurrentWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('workflows.title')}
          </h1>
          <p className="text-muted-foreground">{t('workflows.subtitle')}</p>
        </div>
        <Button
          className="bg-trust-blue gap-2"
          onClick={() => {
            setCurrentWorkflow(initialWorkflowState)
            setIsEditing(false)
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> {t('workflows.new_workflow')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('workflows.title')}</CardTitle>
          <CardDescription>{workflows.length} workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('workflows.trigger')}</TableHead>
                <TableHead>{t('properties.title')}</TableHead>
                <TableHead>{t('workflows.steps')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((wf) => (
                  <TableRow key={wf.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <DataMask>{wf.name}</DataMask>
                        <span className="text-xs text-muted-foreground">
                          <DataMask>{wf.description}</DataMask>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{wf.trigger}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {wf.propertyIds && wf.propertyIds.length > 0
                          ? `${wf.propertyIds.length} ${t('common.properties').toLowerCase()}`
                          : t('common.all')}
                      </Badge>
                    </TableCell>
                    <TableCell>{wf.steps.length}</TableCell>
                    <TableCell>
                      <Badge
                        variant={wf.active ? 'default' : 'secondary'}
                        className={wf.active ? 'bg-green-600' : ''}
                      >
                        {wf.active
                          ? t('users.status_active')
                          : t('users.status_blocked')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRunClick(wf)}
                          title={t('workflows.run_manual')}
                        >
                          <Play className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(wf)}
                          title={t('workflows.config_workflow')}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(wf.id)}
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Run Workflow Dialog */}
      <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('workflows.run_workflow')}</DialogTitle>
            <DialogDescription>
              {t('workflows.select_properties')} "{selectedWorkflow?.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('workflows.select_properties')}</Label>
              <MultiSelect
                options={propertyOptions}
                selected={selectedRunPropertyIds}
                onChange={setSelectedRunPropertyIds}
                placeholder={t('common.select')}
              />
              <p className="text-xs text-muted-foreground">
                {t('workflows.tasks_generated_desc')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRunDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleExecute}
              className="bg-trust-blue"
              disabled={selectedRunPropertyIds.length === 0}
            >
              <Play className="h-4 w-4 mr-2" /> {t('workflows.run_workflow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Edit Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? t('workflows.edit_workflow')
                : t('workflows.new_workflow')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('common.name')}</Label>
                <Input
                  value={currentWorkflow.name}
                  onChange={(e) =>
                    setCurrentWorkflow({
                      ...currentWorkflow,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('workflows.trigger')}</Label>
                <Select
                  value={currentWorkflow.trigger}
                  onValueChange={(val: any) =>
                    setCurrentWorkflow({ ...currentWorkflow, trigger: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="before_checkin">
                      {t('marketing.before')} {t('marketing.check_in')}
                    </SelectItem>
                    <SelectItem value="after_checkout">
                      {t('marketing.after')} {t('marketing.check_out')}
                    </SelectItem>
                    <SelectItem value="lease_start">Lease Start</SelectItem>
                    <SelectItem value="lease_end">Lease End</SelectItem>
                    <SelectItem value="maintenance_request">
                      Maintenance Request
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t('properties.title')}</Label>
              <MultiSelect
                options={propertyOptions}
                selected={currentWorkflow.propertyIds || []}
                onChange={(selected) =>
                  setCurrentWorkflow({
                    ...currentWorkflow,
                    propertyIds: selected,
                  })
                }
                placeholder={t('common.select')}
              />
              <p className="text-xs text-muted-foreground">
                {t('workflows.tasks_generated_desc')}
              </p>
            </div>

            <div className="grid gap-2">
              <Label>{t('common.description')}</Label>
              <Input
                value={currentWorkflow.description}
                onChange={(e) =>
                  setCurrentWorkflow({
                    ...currentWorkflow,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="wf-active"
                checked={currentWorkflow.active}
                onCheckedChange={(checked) =>
                  setCurrentWorkflow({ ...currentWorkflow, active: checked })
                }
              />
              <Label htmlFor="wf-active">{t('workflows.active_status')}</Label>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-semibold mb-2">{t('workflows.steps')}</h3>
              <div className="space-y-4">
                {currentWorkflow.steps.map((step, index) => (
                  <div
                    key={step.id || index}
                    className="flex items-center justify-between bg-muted/20 p-2 rounded border"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{step.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleName(step.role)} - {step.actionType}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-2 items-end border-t pt-4">
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t('workflows.step_name')}
                    </Label>
                    <Input
                      value={newStep.name}
                      onChange={(e) =>
                        setNewStep({ ...newStep, name: e.target.value })
                      }
                      placeholder={t('workflows.step_name')}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {t('workflows.step_role')}
                    </Label>
                    <Select
                      value={newStep.role}
                      onValueChange={(val: UserRole) =>
                        setNewStep({ ...newStep, role: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform_owner">
                          {t('roles.platform_owner')}
                        </SelectItem>
                        <SelectItem value="software_tenant">
                          {t('roles.software_tenant')}
                        </SelectItem>
                        <SelectItem value="partner">
                          {t('roles.partner')}
                        </SelectItem>
                        <SelectItem value="internal_user">
                          {t('roles.internal_user')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={addStep}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-3 w-3" /> {t('workflows.add_step')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="bg-trust-blue">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
