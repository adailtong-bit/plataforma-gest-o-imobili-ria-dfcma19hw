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
import useUserStore from '@/stores/useUserStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import logo from '@/assets/logo-estilizado.jpg'
import { Separator } from '@/components/ui/separator'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isPhoneValid, isValidEmail, isGenericOrPlaceholder } from '@/lib/utils'

export default function Register() {
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addUser } = useUserStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'US', // default
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

    if (!formData.name || isGenericOrPlaceholder(formData.name)) {
      toast({
        title: t('common.error'),
        description: t('common.name_required'),
        variant: 'destructive',
      })
      return
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: t('common.error'),
        description: t('common.email_invalid'),
        variant: 'destructive',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    if (
      formData.phone &&
      !isPhoneValid(formData.phone, formData.country as any)
    ) {
      toast({
        title: t('common.error'),
        description: `Invalid phone format for ${formData.country}.`,
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
      country: formData.country,
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
          <CardDescription>{t('auth.register_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('settings.personal_info')}
              </h3>

              {/* Country first */}
              <div className="grid gap-2">
                <Label>{t('common.country')}</Label>
                <Select
                  value={formData.country}
                  onValueChange={(val) =>
                    setFormData({ ...formData, country: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States (USA)</SelectItem>
                    <SelectItem value="BR">Brazil (Brasil)</SelectItem>
                    <SelectItem value="ES">Spain (España)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('common.full_name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('auth.name_placeholder')}
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
                    country={formData.country as any}
                    onCountryChange={(c) =>
                      setFormData({ ...formData, country: c })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.email_placeholder')}
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
                    placeholder={t('auth.company_placeholder')}
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t('common.tax_id')}</Label>
                  <Input
                    id="taxId"
                    placeholder={t('auth.tax_id_placeholder')}
                    value={formData.taxId}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">{t('common.address')}</Label>
                  <Input
                    id="address"
                    placeholder={t('auth.address_placeholder')}
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

