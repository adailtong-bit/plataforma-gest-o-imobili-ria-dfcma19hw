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
import { FileUpload } from '@/components/ui/file-upload'
import { Trash2, Upload, Star } from 'lucide-react'
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
  const [isUploading, setIsUploading] = useState(false)

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
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

  const handleSetMainPhoto = (url: string) => {
    onChange('image', url)
    toast({
      title: 'Foto Principal Atualizada',
      description: 'A imagem de capa foi alterada.',
    })
  }

  return (
    <div className="space-y-6">
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
                    {data.image === img && (
                      <div className="absolute top-2 left-2 bg-trust-blue text-white text-[10px] px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" /> Principal
                      </div>
                    )}
                    {canEdit && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleSetMainPhoto(img)}
                        >
                          Definir Principal
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir Imagem
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover esta imagem da
                                galeria?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveGalleryImage(index)}
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
    </div>
  )
}
