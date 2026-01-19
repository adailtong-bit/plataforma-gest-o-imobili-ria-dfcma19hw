import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { Advertisement } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { FileUpload } from '@/components/ui/file-upload'

export default function PublicityAdmin() {
  const {
    advertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
  } = usePublicityStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Advertisement>>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    active: true,
    placement: 'footer',
  })

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: 'Erro de Validação',
        description: 'Título e Imagem são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      const ad = advertisements.find((a) => a.id === editingId)
      if (ad) {
        updateAdvertisement({ ...ad, ...formData } as Advertisement)
        toast({ title: 'Anúncio atualizado' })
      }
    } else {
      addAdvertisement({
        id: `ad-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...formData,
      } as Advertisement)
      toast({ title: 'Anúncio criado' })
    }
    setOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      deleteAdvertisement(id)
      toast({ title: 'Anúncio excluído' })
    }
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id)
    setFormData(ad)
    setOpen(true)
  }

  const handleToggleActive = (ad: Advertisement) => {
    updateAdvertisement({ ...ad, active: !ad.active })
    toast({
      title: 'Status atualizado',
      description: `Anúncio ${!ad.active ? 'ativado' : 'desativado'}.`,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      active: true,
      placement: 'footer',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Gestão de Publicidade
          </h1>
          <p className="text-muted-foreground">
            Gerencie anúncios e banners do sistema.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Anúncio' : 'Criar Novo Anúncio'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Seguros Parceiros"
                />
              </div>
              <div className="grid gap-2">
                <Label>Descrição (Opcional)</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Breve descrição do serviço..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Link de Destino</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={formData.linkUrl || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Imagem do Banner</Label>
                <FileUpload
                  value={formData.imageUrl}
                  onChange={(url) =>
                    setFormData({ ...formData, imageUrl: url })
                  }
                  label="Upload Banner"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-mode"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
                <Label htmlFor="active-mode">Ativo imediatamente</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anúncios Ativos</CardTitle>
          <CardDescription>
            Lista de campanhas publicitárias no rodapé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum anúncio cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="h-12 w-20 bg-muted rounded overflow-hidden relative">
                        {ad.imageUrl ? (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 absolute top-3 left-7 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{ad.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {ad.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ad.linkUrl ? (
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                        >
                          Link <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ad.active}
                          onCheckedChange={() => handleToggleActive(ad)}
                        />
                        <Badge
                          variant={ad.active ? 'default' : 'secondary'}
                          className={ad.active ? 'bg-green-600' : ''}
                        >
                          {ad.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
