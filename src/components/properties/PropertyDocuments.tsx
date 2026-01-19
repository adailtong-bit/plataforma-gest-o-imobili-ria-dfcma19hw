import { useState, useRef } from 'react'
import { Property } from '@/lib/types'
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

interface PropertyDocumentsProps {
  property: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyDocuments({
  property,
  onChange,
  canEdit,
}: PropertyDocumentsProps) {
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
        }
        const currentDocs = property.documents || []
        onChange('documents', [...currentDocs, newDoc])
        setIsUploading(false)
        if (docInputRef.current) docInputRef.current.value = ''
        toast({
          title: t('tenants.success_title'),
          description: 'Documento anexado à propriedade.',
        })
      }, 1000)
    }
  }

  const handleRemoveDoc = (docId: string) => {
    const currentDocs = property.documents || []
    const newDocs = currentDocs.filter((d) => d.id !== docId)
    onChange('documents', newDocs)
    toast({
      title: 'Removido',
      description: 'Documento excluído.',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Repositório de Documentos</CardTitle>
          <CardDescription>
            Contratos, manuais, plantas e outros arquivos.
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
              className="bg-trust-blue"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? t('properties.uploading') : t('common.add_title')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!property.documents || property.documents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhum documento anexado.
            </div>
          ) : (
            property.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
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
