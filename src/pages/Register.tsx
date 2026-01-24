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
import useAuthStore from '@/stores/useAuthStore' // Assuming addUser exists or simulating
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import logo from '@/assets/logo-estilizado.jpg'
import { Separator } from '@/components/ui/separator'

export default function Register() {
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    billComOrgId: '', // New field
    billComApiKey: '', // New field
    bankName: '', // New field
    routingNumber: '', // New field
  })

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate registration logic
    // In real app, call API
    toast({
      title: 'Registration Successful',
      description: 'Please check your email to verify your account.',
    })
    navigate('/login')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-md" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.register_title')}
          </CardTitle>
          <CardDescription>
            Create your property management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('common.full_name')}</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t('settings.company_legal_name')}
                </Label>
                <Input
                  id="companyName"
                  placeholder="My Realty LLC"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-900">
                {t('auth.bill_credentials')} (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billComOrgId">{t('auth.bill_org_id')}</Label>
                  <Input
                    id="billComOrgId"
                    placeholder="org_..."
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billComApiKey">API Key</Label>
                  <Input
                    id="billComApiKey"
                    type="password"
                    placeholder="key_..."
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-900">
                {t('auth.bank_settings')} (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">{t('settings.bank_name')}</Label>
                  <Input
                    id="bankName"
                    placeholder="Chase / Wells Fargo"
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">
                    {t('settings.routing_number')}
                  </Label>
                  <Input
                    id="routingNumber"
                    placeholder="123456789"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-trust-blue">
              {t('common.register')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.already_have_account')}{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              {t('common.login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
