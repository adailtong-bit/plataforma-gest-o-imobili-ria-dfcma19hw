import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye, Download, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Link } from 'react-router-dom'
import { ImportPropertiesModal } from '@/components/properties/ImportPropertiesModal'
import { BulkPricingModal } from '@/components/properties/BulkPricingModal'
import { PropertyFormModal } from '@/components/properties/PropertyFormModal'
import useSearchStore from '@/stores/useSearchStore'

export default function Properties() {
  const { t } = useDbTranslations()
  const { toast } = useToast()
  const { searchQuery } = useSearchStore()

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>(null)

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    if (error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    else setProperties(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleOpenAdd = () => {
    setEditingProperty(null)
    setIsOpen(true)
  }
  const handleOpenEdit = (property: any) => {
    setEditingProperty(property)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    else {
      toast({ title: t('common.success', 'Success') })
      fetchProperties()
    }
  }

  const formatAddress = (prop: any) =>
    [
      prop.address,
      prop.number,
      prop.neighborhood,
      prop.city,
      prop.state,
      prop.zip_code,
      prop.country,
    ]
      .filter(Boolean)
      .join(', ')

  const filteredProperties = properties.filter((property) => {
    if (!searchQuery) return true
    const lowerQuery = searchQuery.toLowerCase()
    const nameMatch = property.name?.toLowerCase().includes(lowerQuery)
    const addressMatch = property.address?.toLowerCase().includes(lowerQuery)
    return nameMatch || addressMatch
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('properties.title', 'Properties')}
          </h1>
          <p className="text-slate-500">
            {t('properties.subtitle', 'Manage your properties')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBulkOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" /> Bulk Pricing
          </Button>
          <Button
            onClick={() => setIsImportOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" /> Import
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="bg-trust-blue text-white gap-2"
          >
            <Plus className="h-4 w-4" />{' '}
            {t('common.add_property', 'Add Property')}
          </Button>
        </div>
      </div>

      <ImportPropertiesModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImported={fetchProperties}
      />
      <BulkPricingModal
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        onUpdated={fetchProperties}
      />
      <PropertyFormModal
        open={isOpen}
        onOpenChange={setIsOpen}
        property={editingProperty}
        onSaved={fetchProperties}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>{t('common.name', 'Name')}</TableHead>
                  <TableHead>{t('common.address', 'Address')}</TableHead>
                  <TableHead>{t('common.details', 'Details')}</TableHead>
                  <TableHead>{t('common.price', 'Price')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No properties available.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow
                      key={property.id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell>
                        {property.image ? (
                          <img
                            src={property.image}
                            className="w-12 h-12 rounded object-cover shadow-sm border border-slate-200"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {property.name}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[250px] truncate">
                        {formatAddress(property)}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {property.bedrooms || 0} bd | {property.bathrooms || 0}{' '}
                        ba | {property.area || 0} sqft
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {property.listing_price
                          ? `$${property.listing_price}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            property.status === 'available'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {t(
                            `status.${property.status}`,
                            property.status || 'Available',
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/properties/${property.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(property)}
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
                                  Delete Property
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this property?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(property.id)}
                                >
                                  Delete
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
