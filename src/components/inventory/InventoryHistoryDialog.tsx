import { Dialog, DialogContent } from '@/components/ui/dialog'
export function InventoryHistoryDialog({ isOpen, onClose }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>History feature placeholder</DialogContent>
    </Dialog>
  )
}
