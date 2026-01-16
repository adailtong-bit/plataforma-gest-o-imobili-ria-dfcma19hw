import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  MessageSquare,
  MoreVertical,
} from 'lucide-react'
import useOwnerStore from '@/stores/useOwnerStore'
import usePropertyStore from '@/stores/usePropertyStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import useLanguageStore from '@/stores/useLanguageStore'

export default function OwnerDetails() {
  const { id } = useParams()
  const { owners } = useOwnerStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const owner = owners.find((o) => o.id === id)
  const ownerProperties = properties.filter((p) => p.ownerId === id)

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Proprietário não encontrado</h2>
        <Link to="/owners">
          <Button>{t('common.back')}</Button>
        </Link>
      </div>
    )
  }

  const handleAction = (action: string) => {
    toast({
      title: t('owners.workflow_started'),
      description: t('owners.workflow_desc', {
        action: action,
        name: owner.name,
      }),
    })
    if (action === 'Mensagem') {
      navigate('/messages')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/owners">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {owner.name}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Badge
              variant={owner.status === 'active' ? 'default' : 'secondary'}
              className={owner.status === 'active' ? 'bg-green-600' : ''}
            >
              {t(`common.${owner.status}`)}
            </Badge>
            <span className="text-sm">ID: {owner.id}</span>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              {t('common.actions')} <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleAction(t('owners.renew_contract'))}
            >
              <FileText className="mr-2 h-4 w-4" /> {t('owners.renew_contract')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction(t('owners.generate_statement'))}
            >
              <Building2 className="mr-2 h-4 w-4" />{' '}
              {t('owners.generate_statement')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('Mensagem')}>
              <MessageSquare className="mr-2 h-4 w-4" />{' '}
              {t('tenants.send_message')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t('owners.contact_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{owner.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('roles.property_owner')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{owner.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{owner.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Since 2024</span>
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleAction('Mensagem')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />{' '}
              {t('tenants.send_message')}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('owners.linked_properties')}</CardTitle>
            <CardDescription>{t('owners.linked_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {ownerProperties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('owners.no_properties')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownerProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/properties/${prop.id}`}
                    className="block group"
                  >
                    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-all bg-card">
                      <div className="relative h-32">
                        <img
                          src={prop.image}
                          alt={prop.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge
                          className={`absolute top-2 right-2`}
                          variant="secondary"
                        >
                          {t(`common.${prop.status}`)}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {prop.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {prop.address}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {prop.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
