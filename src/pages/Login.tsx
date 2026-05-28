import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import useAuthStore from '@/stores/useAuthStore'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  User,
  Shield,
  Building,
  Home,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/Logo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Login() {
  const { signIn, loading: isAuthLoading, session } = useAuth()

  const { currentUser, isAuthLoading: appLoading } = useAuthStore()

  const isAuthenticated = !!session
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [email, setEmail] = useState('adailtong@gmail.com')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading && !appLoading) {
      if (session && !currentUser) {
        // Still loading profile or no profile, just wait.
        return
      }

      let targetPath = from

      if (targetPath === '/' || targetPath === '/login') {
        const role = (currentUser as any)?.role?.toLowerCase() || 'master'
        switch (role) {
          case 'owner':
          case 'property_owner':
            targetPath = '/portal/owner'
            break
          case 'partner':
          case 'partner_employee':
            targetPath = '/portal/partner'
            break
          case 'tenant':
            targetPath = '/portal/tenant'
            break
          case 'master':
          case 'super_admin':
          case 'admin':
          case 'platform_owner':
          case 'software_tenant':
          case 'internal_user':
            targetPath = '/'
            break
          default:
            targetPath = '/'
        }
      }
      navigate(targetPath, { replace: true })
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    appLoading,
    currentUser,
    session,
    navigate,
    from,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Por favor, insira um endereço de e-mail.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await signIn(email, password)
    if (!error) {
      toast({
        title: 'Bem-vindo(a) de volta',
        description: 'Autenticação realizada com sucesso.',
      })
    } else {
      toast({
        title: 'Falha na Autenticação',
        description:
          'Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    let pwd = ''
    if (demoEmail === 'master@plataforma.com') pwd = 'master123'
    else if (demoEmail === 'admin@plataforma.com') pwd = 'admin123'
    else if (demoEmail === 'parceiro@plataforma.com') pwd = 'parceiro123'
    else if (demoEmail === 'proprietario@plataforma.com')
      pwd = 'proprietario123'
    else if (demoEmail === 'locatario@plataforma.com') pwd = 'locatario123'
    else pwd = 'password'

    const { error } = await signIn(demoEmail, pwd)
    if (!error) {
      toast({
        title: 'Bem-vindo(a) de volta',
        description: 'Autenticação realizada com sucesso.',
      })
    } else {
      toast({
        title: 'Falha na Autenticação',
        description:
          'Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'master':
      case 'super_admin':
      case 'admin':
      case 'platform_owner':
      case 'software_tenant':
      case 'internal_user':
        return <Shield className="h-4 w-4 text-primary shrink-0" />
      case 'owner':
      case 'property_owner':
        return <Building className="h-4 w-4 text-blue-500 shrink-0" />
      case 'tenant':
        return <Home className="h-4 w-4 text-green-500 shrink-0" />
      case 'partner':
      case 'service':
      case 'partner_employee':
        return <Briefcase className="h-4 w-4 text-orange-500 shrink-0" />
      default:
        return <User className="h-4 w-4 text-slate-500 shrink-0" />
    }
  }

  const demoUsers = [
    {
      email: 'master@plataforma.com',
      name: 'Master User',
      role: 'master',
      id: '1',
    },
    {
      email: 'admin@plataforma.com',
      name: 'Admin User',
      role: 'admin',
      id: '2',
    },
    {
      email: 'parceiro@plataforma.com',
      name: 'Partner User',
      role: 'partner',
      id: '3',
    },
    {
      email: 'proprietario@plataforma.com',
      name: 'Owner User',
      role: 'property_owner',
      id: '4',
    },
    {
      email: 'locatario@plataforma.com',
      name: 'Tenant User',
      role: 'tenant',
      id: '5',
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://img.usecurling.com/p/1000/1000?q=modern%20architecture&color=blue"
            alt="Architecture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="z-10">
          <Logo className="text-white scale-150 origin-left" />
        </div>
        <div className="z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight">
            A plataforma completa para gestão imobiliária
          </h1>
          <p className="text-slate-400 text-lg">
            Gerencie propriedades, proprietários, parceiros e finanças em um só
            lugar com o Summerpm.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Logo />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Bem-vindo(a) de volta
            </h2>
            <p className="text-sm text-slate-500">
              Insira suas credenciais para acessar sua conta
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Contas de Teste</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@plataforma.com"
                        className="pl-10 bg-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <Button
                        variant="link"
                        type="button"
                        className="p-0 h-auto text-xs text-trust-blue font-medium"
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="pl-10 pr-10 bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-trust-blue hover:bg-blue-700 text-base shadow-sm"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="text-center mt-4 space-y-2">
                  <p className="text-xs text-slate-500">
                    Ao entrar, você concorda com nossos Termos de Serviço e
                    Política de Privacidade.
                  </p>
                  <p className="text-sm">
                    Não tem uma conta?{' '}
                    <Link
                      to="/register"
                      className="text-trust-blue hover:underline font-medium"
                    >
                      Criar conta
                    </Link>
                  </p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="demo">
              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-4">
                  Selecione uma conta de teste para entrar instantaneamente e
                  explorar a plataforma sob diferentes perspectivas.
                </p>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {demoUsers.map((user, index) => (
                    <Button
                      key={`demo-${user.id}-${index}`}
                      variant="outline"
                      className="w-full h-auto py-3 px-4 justify-start items-center hover:bg-blue-50 hover:border-blue-200 transition-colors gap-3 group bg-white"
                      onClick={() => handleDemoLogin(user.email)}
                    >
                      <div className="bg-slate-100 group-hover:bg-white p-2 rounded-md transition-colors">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="flex flex-col items-start text-left flex-1 overflow-hidden">
                        <span className="font-medium text-sm text-slate-900 group-hover:text-trust-blue transition-colors truncate w-full">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
