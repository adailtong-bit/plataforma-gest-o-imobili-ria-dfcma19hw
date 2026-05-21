import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Building2,
  X,
  FileText,
  Upload,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

export default function Owners() {
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [owners, setOwners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({})
  const [uploading, setUploading] = useState(false)

  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false)
  const [selectedOwnerForProperties, setSelectedOwnerForProperties] =
    useState<any>(null)
  const [ownerProperties, setOwnerProperties] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)

  const fetchOwners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'property_owner')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setOwners(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ status: 'active', documents: [] })
    setIsOpen(true)
  }

  const handleOpenEdit = (owner: any) => {
    setEditingId(owner.id)
    setForm({
      ...owner,
      documents: owner.documents || [],
    })
    setIsOpen(true)
  }

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const newDocs = form.documents || []
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('owner-documents')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('owner-documents')
          .getPublicUrl(filePath)

        newDocs.push({
          name: file.name,
          url: data.publicUrl,
        })
      }
      setForm({ ...form, documents: newDocs })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          document: form.document,
          address: form.address,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          country: form.country,
          zip_code: form.zip_code,
          status: form.status,
          documents: form.documents,
        })
        .eq('id', editingId)

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('common.success', 'Success') })
      }
    } else {
      const { error } = await supabase.rpc('create_user_profile', {
        p_email: form.email,
        p_password: 'Password123!',
        p_name: form.name,
        p_role: 'property_owner',
        p_phone: form.phone || null,
        p_document: form.document || null,
        p_city: form.city || null,
        p_state: form.state || null,
        p_status: form.status || 'active',
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('common.success', 'Success') })

        const { data: newProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', form.email)
          .single()

        if (newProfile) {
          await supabase
            .from('profiles')
            .update({
              address: form.address,
              neighborhood: form.neighborhood,
              country: form.country,
              zip_code: form.zip_code,
              documents: form.documents,
            })
            .eq('id', newProfile.id)
        }
      }
    }
    setIsOpen(false)
    fetchOwners()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: t('common.success', 'Success') })
      fetchOwners()
    }
  }

  const handleOpenProperties = async (owner: any) => {
    setSelectedOwnerForProperties(owner)
    setPropertiesModalOpen(true)
    setLoadingProperties(true)
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, address, city, state')
      .eq('owner_id', owner.id)

    if (!error) {
      setOwnerProperties(data || [])
    }
    setLoadingProperties(false)
  }

  const formatAddress = (owner: any) => {
    const parts = [
      owner.address,
      owner.neighborhood,
      owner.city,
      owner.state,
      owner.country,
      owner.zip_code,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('sidebar.owners', 'Owners')}
          </h1>
          <p className="text-slate-500">
            {t('owners.subtitle', 'Manage your property owners')}
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue text-white gap-2"
        >
          <Plus className="h-4 w-4" /> {t('common.add_owner', 'Add Owner')}
        </Button>
      </div>

      <Dialog open={propertiesModalOpen} onOpenChange={setPropertiesModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>
              {t('owners.linked_properties', 'Linked Properties')} -{' '}
              {selectedOwnerForProperties?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {loadingProperties ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : ownerProperties.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {t(
                  'owners.no_properties',
                  'No properties found for this owner.',
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {ownerProperties.map((prop) => (
                  <Card key={prop.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {prop.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {prop.address}
                          {prop.city ? `, ${prop.city}` : ''}
                          {prop.state ? `, ${prop.state}` : ''}
                        </p>
                      </div>
                      <Link to={`/properties/${prop.id}`}>
                        <Button variant="outline" size="sm">
                          {t('common.view', 'View')}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="p-6 border-t mt-auto">
            <Button
              variant="outline"
              onClick={() => setPropertiesModalOpen(false)}
            >
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>
              {editingId
                ? t('common.edit_owner', 'Edit Owner')
                : t('common.add_owner', 'Add Owner')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t('common.personal_info', 'Personal Info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('common.name', 'Name')} *</Label>
                    <Input
                      id="name"
                      value={form.name || ''}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">
                      {t('common.tax_id_label', 'Tax ID / Document')}
                    </Label>
                    <Input
                      id="document"
                      value={form.document || ''}
                      onChange={(e) =>
                        setForm({ ...form, document: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t('common.email', 'Email')} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email || ''}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('common.phone', 'Phone')}</Label>
                    <Input
                      id="phone"
                      value={form.phone || ''}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t('common.address_info', 'Address Info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t('common.address', 'Street Address')}
                    </Label>
                    <Input
                      id="address"
                      value={form.address || ''}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">
                      {t('common.neighborhood', 'Neighborhood')}
                    </Label>
                    <Input
                      id="neighborhood"
                      value={form.neighborhood || ''}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('common.city', 'City')}</Label>
                    <Input
                      id="city"
                      value={form.city || ''}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t('common.state', 'State')}</Label>
                    <Input
                      id="state"
                      value={form.state || ''}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {t('common.country', 'Country')}
                    </Label>
                    <Input
                      id="country"
                      value={form.country || ''}
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">
                      {t('common.zip_code', 'Zip Code')}
                    </Label>
                    <Input
                      id="zip_code"
                      value={form.zip_code || ''}
                      onChange={(e) =>
                        setForm({ ...form, zip_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="status">
                      {t('common.status', 'Status')}
                    </Label>
                    <Select
                      value={form.status || 'active'}
                      onValueChange={(v) => setForm({ ...form, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.status', 'Status')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {t('status.active', 'Active')}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t('status.inactive', 'Inactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100 col-span-2">
                    <Label className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4" />{' '}
                      {t('common.documents', 'Documents')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById('owner-docs-upload')?.click()
                        }
                        disabled={uploading}
                        className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                      >
                        {uploading ? (
                          <>
                            <span className="h-4 w-4 mr-2 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                            {t('common.uploading', 'Uploading...')}
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />{' '}
                            {t('common.add_documents', 'Add Documents')}
                          </>
                        )}
                      </Button>
                      <input
                        id="owner-docs-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleDocumentUpload}
                        disabled={uploading}
                      />
                    </div>
                    {form.documents && form.documents.length > 0 && (
                      <div className="grid gap-2 mt-4">
                        {form.documents.map((doc: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-md border border-slate-200 bg-slate-50"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline truncate"
                              >
                                {doc.name || `Document ${i + 1}`}
                              </a>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                const newDocs = [...form.documents]
                                newDocs.splice(i, 1)
                                setForm({ ...form, documents: newDocs })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t mt-auto">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-trust-blue text-white"
              disabled={uploading}
            >
              {uploading
                ? t('common.uploading', 'Uploading...')
                : t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>{t('common.name', 'Name')}</TableHead>
                  <TableHead>{t('common.contact', 'Contact')}</TableHead>
                  <TableHead>{t('common.location', 'Address')}</TableHead>
                  <TableHead>{t('common.tax_id_label', 'Tax ID')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  owners.map((owner) => (
                    <TableRow key={owner.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {owner.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex flex-col">
                          <span className="text-sm">{owner.email}</span>
                          <span className="text-xs text-slate-500">
                            {owner.phone || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[200px] truncate">
                        {formatAddress(owner)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {owner.document || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            owner.status === 'active' ? 'default' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {t(
                            `status.${owner.status}`,
                            owner.status || 'Active',
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenProperties(owner)}
                            title={t(
                              'owners.view_properties',
                              'View Properties',
                            )}
                          >
                            <Building2 className="h-4 w-4" />
                          </Button>
                          <Link to={`/owners/${owner.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />{' '}
                              {t('common.view', 'View')}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(owner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('common.delete_owner', 'Delete Owner')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_owner_desc',
                                    'Are you sure you want to delete this owner?',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(owner.id)}
                                >
                                  {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
