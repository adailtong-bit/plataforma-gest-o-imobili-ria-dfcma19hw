import { useState, useRef } from 'react'
import { GenericDocument, DocumentCategory } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2, Upload, File } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface DocumentVaultProps {
  documents: GenericDocument[]
  onUpdate: (documents: GenericDocument[]) => void
  canEdit: boolean
  title?: string
  description?: string
}

export function DocumentVault({
  documents,
  onUpdate,
  canEdit,
  title,
  description,
}: DocumentVaultProps) {
  const { t, language } = useLanguageStore()
  const { toast } = useToast()
  const docInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategory>('Other')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadDialogOpen(true)
    }
  }

  const handleConfirmUpload = () => {
    if (!selectedFile) return

    setIsUploading(true)
    setTimeout(() => {
      const newDoc: GenericDocument = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        date: new Date().toISOString(),
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        category: selectedCategory,
      }
      onUpdate([...(documents || []), newDoc])
      setIsUploading(false)
      setUploadDialogOpen(false)
      setSelectedFile(null)
      if (docInputRef.current) docInputRef.current.value = ''
      toast({
        title: t('common.success'),
        description: 'Document stored.',
      })
    }, 1000)
  }

  const handleRemoveDoc = (docId: string) => {
    const newDocs = (documents || []).filter((d) => d.id !== docId)
    onUpdate(newDocs)
    toast({
      title: t('common.removed'),
      description: 'Document deleted permanently.',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title || t('common.documents')}</CardTitle>
          <CardDescription>
            {description || 'Manage uploaded files.'}
          </CardDescription>
        </div>
        {canEdit && (
          <div>
            <input
              type="file"
              ref={docInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              onChange={handleFileSelect}
            />
            <Button
              onClick={() => docInputRef.current?.click()}
              className="bg-trust-blue"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('common.upload')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Classify Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Selected File</Label>
                <div className="p-2 border rounded bg-muted text-sm flex items-center gap-2">
                  <File className="h-4 w-4 text-blue-500" />
                  {selectedFile?.name}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) =>
                    setSelectedCategory(v as DocumentCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="ID">ID</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="SSN">SSN / Tax ID</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Deed">Deed</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmUpload} disabled={isUploading}>
                {isUploading ? 'Saving...' : t('common.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {!documents || documents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              {t('common.empty')}
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {doc.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.date, language)} •{' '}
                      {doc.size || 'Unknown size'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    download={doc.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  {canEdit && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('common.confirm_delete')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('common.delete_desc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('common.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveDoc(doc.id)}
                          >
                            {t('common.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
