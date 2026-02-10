import { Dialog, DialogContent } from '@/components/ui/dialog'
export function InventoryImportDialog({ isOpen, onClose }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>Import feature placeholder</DialogContent>
    </Dialog>
  )
}
