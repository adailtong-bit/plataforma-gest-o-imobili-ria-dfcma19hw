import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/Logo'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export default function Register() {
  const { signUp, loading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Erro de Validação',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await signUp(email, password)

    if (!error) {
      toast({
        title: 'Conta Criada',
        description: 'Verifique seu e-mail para confirmar seu cadastro.',
      })
      navigate('/login')
    } else {
      toast({
        title: 'Erro ao Criar Conta',
        description: error.message || 'Ocorreu um erro durante o cadastro.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-slate-50">
      <div className="absolute top-6 left-6 hidden sm:block">
        <Logo />
      </div>

      <Card className="w-full max-w-[400px] shadow-lg border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="sm:hidden flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Criar Nova Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para começar a usar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 bg-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-trust-blue hover:bg-blue-700 text-base shadow-sm"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? 'Criando...' : 'Criar Conta'}
            </Button>

            <div className="text-center text-sm mt-4">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-trust-blue hover:underline font-medium"
              >
                Fazer login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
