import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { properties } from '@/lib/mockData'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Wifi, BedDouble, Bath } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Properties() {
  const [filter, setFilter] = useState('')

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.address.toLowerCase().includes(filter.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'vacant':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Ocupado'
      case 'vacant':
        return 'Vago'
      case 'maintenance':
        return 'Manutenção'
      default:
        return status
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Propriedades
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas casas e condomínios.
          </p>
        </div>
        <Button className="bg-trust-blue hover:bg-blue-700">
          Nova Propriedade
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <Input
          placeholder="Buscar por nome ou endereço..."
          className="md:w-[300px]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="occupied">Ocupado</SelectItem>
            <SelectItem value="vacant">Vago</SelectItem>
            <SelectItem value="maintenance">Manutenção</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Comunidade/HOA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="sunny">Sunny Isles HOA</SelectItem>
            <SelectItem value="brickell">Brickell Heights</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="relative h-48 w-full">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(property.status)} hover:${getStatusColor(property.status)}`}
              >
                {getStatusLabel(property.status)}
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {property.community}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{property.address}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
                  <BedDouble className="h-4 w-4 mb-1 text-primary" />
                  <span className="font-semibold">
                    {property.bedrooms} Beds
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
                  <Bath className="h-4 w-4 mb-1 text-primary" />
                  <span className="font-semibold">
                    {property.bathrooms} Baths
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
                  <Users className="h-4 w-4 mb-1 text-primary" />
                  <span className="font-semibold">
                    {property.guests} Guests
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20">
              <Link to={`/properties/${property.id}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-white transition-colors"
                >
                  Ver Detalhes
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
