import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export function ImportPropertiesModal({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onImported: () => void
}) {
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleImport = async () => {
    try {
      setLoading(true)
      const parsed = JSON.parse(data)
      const properties = Array.isArray(parsed) ? parsed : [parsed]

      for (const prop of properties) {
        const { error } = await supabase.from('properties').insert({
          name: prop.name || prop.title || 'Imported Property',
          address: prop.address || prop.street || '',
          city: prop.city || '',
          state: prop.state || '',
          zip_code: prop.zip_code || prop.zipcode || prop.zip || '',
          country: prop.country || 'US',
          type: prop.type || 'apartment',
          bedrooms: prop.bedrooms || 1,
          bathrooms: prop.bathrooms || 1,
          listing_price: prop.price || prop.listing_price || 0,
          status: 'available',
        })
        if (error) throw error
      }

      toast({
        title: 'Success',
        description: 'Properties imported successfully.',
      })
      onOpenChange(false)
      onImported()
    } catch (err: any) {
      toast({
        title: 'Import Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Properties</DialogTitle>
          <DialogDescription>
            Paste JSON data exported from Airbnb or other structured formats.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='[{"name": "Cozy Apt", "address": "123 Main St", "city": "Orlando", "price": 120}]'
            className="h-48 font-mono text-sm"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading}
            className="bg-trust-blue text-white"
          >
            {loading ? 'Importing...' : 'Run Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
