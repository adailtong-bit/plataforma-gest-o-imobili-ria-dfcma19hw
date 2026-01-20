import { useState, useRef } from 'react'
import { Property, DocumentCategory } from '@/lib/types'
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
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

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
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        date: new Date().toISOString(),
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        category: selectedCategory,
        digitalSignatureStatus: 'pending' as const,
      }
      const currentDocs = property.documents || []
      onChange('documents', [...currentDocs, newDoc])
      setIsUploading(false)
      setUploadDialogOpen(false)
      setSelectedFile(null)
      if (docInputRef.current) docInputRef.current.value = ''
      toast({
        title: 'Sucesso',
        description: 'Documento categorizado e anexado.',
      })
    }, 1000)
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
          <CardTitle>Gestão de Documentos</CardTitle>
          <CardDescription>
            Organize contratos, seguros e documentos legais.
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
              {t('common.add_title')}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Classificar Documento</DialogTitle>
              <DialogDescription>
                Escolha a categoria apropriada para o documento enviado para
                organizar a documentação.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Arquivo Selecionado</Label>
                <div className="p-2 border rounded bg-muted text-sm">
                  {selectedFile?.name}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
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
                    <SelectItem value="Contract">Contrato</SelectItem>
                    <SelectItem value="Insurance">Seguro</SelectItem>
                    <SelectItem value="ID">Identificação</SelectItem>
                    <SelectItem value="Deed">Escritura</SelectItem>
                    <SelectItem value="Inspection">Inspeção</SelectItem>
                    <SelectItem value="Other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmUpload} disabled={isUploading}>
                {isUploading ? 'Salvando...' : 'Confirmar Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-semibold">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.date).toLocaleDateString()} •{' '}
                      {doc.size || 'Unknown size'} • Status:{' '}
                      {doc.digitalSignatureStatus}
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
