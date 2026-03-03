import { useState, useRef } from 'react'
import { Partner } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2, Upload } from 'lucide-react'
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

interface PartnerDocumentsProps {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}

export function PartnerDocuments({
  partner,
  onUpdate,
  canEdit,
}: PartnerDocumentsProps) {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const docInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setTimeout(() => {
        const newDoc = {
          id: `doc-${Date.now()}`,
          name: file.name,
          url: URL.createObjectURL(file),
          date: new Date().toISOString(),
          type: file.type,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          category: 'Other' as any,
        }
        const currentDocs = partner.documents || []
        onUpdate({ ...partner, documents: [...currentDocs, newDoc] })
        setIsUploading(false)
        if (docInputRef.current) docInputRef.current.value = ''
        toast({
          title: 'Success',
          description: 'Document attached to partner.',
        })
      }, 1000)
    }
  }

  const handleRemoveDoc = (docId: string) => {
    const currentDocs = partner.documents || []
    const newDocs = currentDocs.filter((d) => d.id !== docId)
    onUpdate({ ...partner, documents: newDocs })
    toast({
      title: 'Removed',
      description: 'Document deleted.',
    })
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div>
          <CardTitle>Document Repository</CardTitle>
          <CardDescription>
            Contracts, certifications, W9, and other files.
          </CardDescription>
        </div>
        {canEdit && (
          <div>
            <input
              type="file"
              ref={docInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              onChange={handleDocUpload}
            />
            <Button
              onClick={() => docInputRef.current?.click()}
              disabled={isUploading}
              className="bg-trust-blue text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Add Document'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {!partner.documents || partner.documents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50">
              No documents attached.
            </div>
          ) : (
            partner.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(doc.date).toLocaleDateString()} •{' '}
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
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the document "
                            {doc.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
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
