import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import logo from '@/assets/logo-estilizado.jpg'
import { Separator } from '@/components/ui/separator'
import { PhoneInput } from '@/components/ui/phone-input'

export default function Register() {
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addUser } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    taxId: '',
    address: '',
    billComOrgId: '',
    billComApiKey: '',
    bankName: '',
    routingNumber: '',
  })

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    // Simulate registration
    addUser({
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'software_tenant', // Default for self-registration
      status: 'active', // Or pending based on rules
      isFirstLogin: true,
      phone: formData.phone,
      companyName: formData.companyName,
      taxId: formData.taxId,
      address: formData.address,
    })

    toast({
      title: 'Registration Successful',
      description: 'Welcome to COREPM! Please login.',
    })
    navigate('/login')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8">
      <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-trust-blue">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-md" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.register_title')}
          </CardTitle>
          <CardDescription>
            Complete your profile to get started with COREPM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('settings.personal_info')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('common.full_name')}</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('common.phone')}</Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('auth.company_details')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {t('settings.company_legal_name')}
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="My Realty LLC"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t('common.tax_id')}</Label>
                  <Input
                    id="taxId"
                    placeholder="EIN / CNPJ"
                    value={formData.taxId}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">{t('common.address')}</Label>
                  <Input
                    id="address"
                    placeholder="123 Business Rd, City, State"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('common.confirm_password')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-trust-blue text-lg h-12 mt-4"
            >
              {t('auth.register_title')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.already_have_account')}{' '}
            <Link
              to="/login"
              className="text-trust-blue font-semibold hover:underline"
            >
              {t('common.login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
