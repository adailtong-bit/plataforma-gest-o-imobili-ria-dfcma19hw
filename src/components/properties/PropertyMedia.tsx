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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/ui/file-upload'
import { Trash2, Upload, FileText, Download, Plus } from 'lucide-react'
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

interface PropertyMediaProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyMedia({ data, onChange, canEdit }: PropertyMediaProps) {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      // Mock upload delay
      setTimeout(() => {
        const newImages = Array.from(files).map((file) =>
          URL.createObjectURL(file),
        )
        const currentGallery = data.gallery || []
        onChange('gallery', [...currentGallery, ...newImages])
        setIsUploading(false)
        if (galleryInputRef.current) galleryInputRef.current.value = ''
        toast({
          title: 'Sucesso',
          description: `${newImages.length} foto(s) adicionada(s) à galeria.`,
        })
      }, 1000)
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = data.gallery || []
    const newGallery = currentGallery.filter((_, i) => i !== index)
    onChange('gallery', newGallery)
    toast({
      title: 'Removido',
      description: 'Imagem removida da galeria.',
    })
  }

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
        const currentDocs = data.documents || []
        onChange('documents', [...currentDocs, newDoc])
        setIsUploading(false)
        if (docInputRef.current) docInputRef.current.value = ''
        toast({
          title: 'Sucesso',
          description: 'Documento anexado.',
        })
      }, 1000)
    }
  }

  const handleRemoveDoc = (docId: string) => {
    const currentDocs = data.documents || []
    const newDocs = currentDocs.filter((d) => d.id !== docId)
    onChange('documents', newDocs)
    toast({
      title: 'Removido',
      description: 'Documento excluído.',
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <div className="grid grid-cols-1 gap-6">
            {/* Main Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem Principal</CardTitle>
                <CardDescription>
                  Esta é a imagem de capa da propriedade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <FileUpload
                    value={data.image}
                    onChange={(url) => onChange('image', url)}
                    disabled={!canEdit}
                    label="Alterar Capa"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Galeria de Fotos</CardTitle>
                  <CardDescription>
                    Fotos adicionais da propriedade.
                  </CardDescription>
                </div>
                {canEdit && (
                  <div>
                    <input
                      type="file"
                      ref={galleryInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryUpload}
                    />
                    <Button
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? 'Enviando...' : 'Adicionar Fotos'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!data.gallery || data.gallery.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    Sem fotos na galeria.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.gallery.map((img, index) => (
                      <div
                        key={index}
                        className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
                      >
                        <img
                          src={img}
                          alt={`Gallery ${index}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {canEdit && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir Imagem
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover esta imagem
                                    da galeria?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveGalleryImage(index)
                                    }
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  Contratos, manuais e arquivos importantes.
                </CardDescription>
              </div>
              {canEdit && (
                <div>
                  <input
                    type="file"
                    ref={docInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocUpload}
                  />
                  <Button
                    onClick={() => docInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isUploading ? 'Enviando...' : 'Adicionar Documento'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!data.documents || data.documents.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    Nenhum documento anexado.
                  </div>
                ) : (
                  data.documents.map((doc) => (
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
                                  Excluir Documento
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o documento "
                                  {doc.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveDoc(doc.id)}
                                >
                                  Excluir
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
