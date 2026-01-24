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

export default function Login() {
  const { t } = useLanguageStore()
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // For mock purposes, any password works if email exists
    // In real app, verify password
    const success = login(email)
    if (success) {
      toast({
        title: t('common.welcome'),
        description: 'Login successful.',
      })
      navigate('/')
    } else {
      toast({
        title: t('common.error'),
        description: 'Invalid credentials.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-md" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.login_title')}
          </CardTitle>
          <CardDescription>
            Enter your email to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Link to="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-trust-blue">
              {t('common.continue')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              {t('common.register')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
