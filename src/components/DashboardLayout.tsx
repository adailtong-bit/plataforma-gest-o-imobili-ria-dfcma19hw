import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import useAuthStore from '@/stores/useAuthStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useUserStore from '@/stores/useUserStore'
import useTaskStore from '@/stores/useTaskStore'
import useNotificationStore from '@/stores/useNotificationStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Lock, DollarSign, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { hasPermission } from '@/lib/permissions'
import { PublicityFooter } from './PublicityFooter'
import { differenceInHours, parseISO, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

export default function DashboardLayout() {
  const { currentUser, setCurrentUser, isAuthenticated } = useAuthStore()
  const { updateUser } = useUserStore()
  const { properties } = usePropertyStore()
  const { tasks } = useTaskStore()
  const { addNotification, notifications } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Status Check & Enforcement & RBAC Redirection
  useEffect(() => {
    // If not authenticated, we don't need to check permissions
    // This allows the layout to render just the Outlet (e.g. Landing Page)
    if (!isAuthenticated || !currentUser) return

    const checkAccess = () => {
      const path = location.pathname
      let resource = ''

      if (path.startsWith('/market-analysis')) resource = 'market_analysis'
      if (path.startsWith('/workflows')) resource = 'workflows'
      if (path.startsWith('/renewals')) resource = 'renewals'
      if (path.startsWith('/admin/publicity')) resource = 'publicity'
      if (
        path.startsWith('/settings') &&
        currentUser.role !== 'platform_owner' &&
        currentUser.role !== 'software_tenant'
      )
        resource = 'settings'

      if (
        resource &&
        !hasPermission(currentUser as User, resource as any, 'view')
      ) {
        toast({
          title: 'Acesso Negado',
          description: 'User not permitted for this function',
          variant: 'destructive',
        })
        navigate('/')
      }
    }

    checkAccess()

    if (
      currentUser.status === 'pending_approval' ||
      currentUser.status === 'blocked'
    ) {
      return
    }

    if (currentUser.isFirstLogin && currentUser.status === 'active') {
      setPasswordModalOpen(true)
    }

    if (
      currentUser.role === 'software_tenant' &&
      !currentUser.isFirstLogin &&
      !(currentUser as User).hasPaidEntryFee
    ) {
      setPaymentModalOpen(true)
    }

    if (
      currentUser.role === 'software_tenant' &&
      (currentUser as User).hasPaidEntryFee &&
      properties.length > 5 &&
      (currentUser as User).subscriptionPlan === 'free'
    ) {
      setSubscriptionModalOpen(true)
    }
  }, [
    currentUser,
    properties.length,
    location.pathname,
    isAuthenticated,
    navigate,
    toast,
  ])

  // Operational Notifications Logic
  useEffect(() => {
    if (!isAuthenticated || !currentUser || !tasks) return

    const checkTasks = () => {
      const now = new Date()
      tasks.forEach((task) => {
        if (
          task.status !== 'completed' &&
          task.status !== 'approved' &&
          task.status !== 'pending_approval' &&
          task.type === 'maintenance'
        ) {
          try {
            const taskDate = parseISO(task.date)
            const hoursDiff = differenceInHours(taskDate, now)

            // Alert if maintenance task is within 48 hours
            if (hoursDiff > 0 && hoursDiff <= 48) {
              const alreadyNotified = notifications.some(
                (n) => n.message.includes(task.title) && n.type === 'warning',
              )
              if (!alreadyNotified) {
                addNotification({
                  title: 'Upcoming Maintenance',
                  message: `Maintenance "${task.title}" is due in less than 48 hours.`,
                  type: 'warning',
                })
              }
            }

            // Alert if overdue
            if (isPast(taskDate) && Math.abs(hoursDiff) > 0) {
              const alreadyNotified = notifications.some(
                (n) =>
                  n.message.includes(task.title) &&
                  n.message.includes('Overdue'),
              )
              if (!alreadyNotified) {
                addNotification({
                  title: 'Maintenance Overdue',
                  message: `Task "${task.title}" is overdue! Please check immediately.`,
                  type: 'warning',
                })
              }
            }
          } catch (e) {
            // ignore invalid dates
          }
        }
      })
    }

    const interval = setInterval(checkTasks, 60000) // Check every minute
    checkTasks() // Initial check

    return () => clearInterval(interval)
  }, [currentUser, tasks, isAuthenticated, notifications, addNotification])

  const handlePasswordUpdate = () => {
    if (newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'Senha muito curta.',
        variant: 'destructive',
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Senhas não conferem.',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)
    setTimeout(() => {
      if (currentUser) {
        updateUser({
          ...(currentUser as User),
          isFirstLogin: false,
          status: 'active',
        })
        setCurrentUser(currentUser.id)
      }

      setProcessing(false)
      setPasswordModalOpen(false)
      toast({ title: 'Sucesso', description: 'Senha atualizada.' })
    }, 1000)
  }

  const handleEntryPayment = () => {
    setProcessing(true)
    setTimeout(() => {
      if (currentUser) {
        updateUser({
          ...(currentUser as User),
          hasPaidEntryFee: true,
        })
        setCurrentUser(currentUser.id)
      }
      setProcessing(false)
      setPaymentModalOpen(false)
      toast({ title: 'Pagamento Confirmado', description: 'Acesso liberado.' })
    }, 1500)
  }

  const handleSubscriptionUpgrade = (plan: 'pay_per_house' | 'unlimited') => {
    setProcessing(true)
    setTimeout(() => {
      if (currentUser) {
        updateUser({
          ...(currentUser as User),
          subscriptionPlan: plan,
        })
        setCurrentUser(currentUser.id)
      }
      setProcessing(false)
      setSubscriptionModalOpen(false)
      toast({
        title: 'Plano Atualizado',
        description: `Plano ${plan} ativado.`,
      })
    }, 1500)
  }

  // Auth Check for Layout
  // If NOT authenticated, render ONLY the Outlet (e.g. Landing Page)
  // This effectively hides sidebar and header for guests
  if (!isAuthenticated) {
    return <Outlet />
  }

  // If Authenticated but Blocked/Pending, show restricted screen
  if (
    currentUser?.status === 'pending_approval' ||
    currentUser?.status === 'blocked'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              {currentUser.status === 'pending_approval'
                ? 'Sua conta está aguardando aprovação do administrador.'
                : 'Sua conta foi bloqueada. Entre em contato com o suporte.'}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Verificar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If Authenticated and Active, render Full Dashboard Layout
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader />
          <main
            className={cn(
              'flex-1 overflow-auto p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto flex flex-col',
              location.pathname === '/short-term' &&
                'bg-gray-50 md:bg-transparent',
              // Mobile specific background for owners route
              location.pathname === '/owners' &&
                'bg-gray-100 md:bg-transparent',
            )}
          >
            <Outlet />
            <PublicityFooter />
          </main>
          <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground mt-auto">
            <p>© 2026 COREPM v1.0.0. All rights reserved.</p>
          </footer>
        </div>

        <Dialog open={passwordModalOpen} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Definir Senha</DialogTitle>
              <DialogDescription>
                Para sua segurança, defina uma nova senha para acessar o
                sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nova Senha</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Confirmar Senha</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handlePasswordUpdate}
                disabled={processing}
                className="w-full bg-trust-blue"
              >
                {processing ? 'Salvando...' : 'Atualizar Senha'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={paymentModalOpen} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" /> Taxa de Acesso
              </DialogTitle>
              <DialogDescription>
                Para ativar sua conta de gestor, é necessário uma taxa única de
                adesão.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center space-y-4">
              <div className="text-4xl font-bold text-navy">$2.00</div>
              <p className="text-sm text-muted-foreground">
                Acesso vitalício à plataforma básica.
              </p>

              <div className="bg-muted/30 p-4 rounded-lg border text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Cartão</span>
                  <span className="font-mono">**** 4242</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Total</span>
                  <span>$2.00</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleEntryPayment}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processando...' : 'Pagar e Ativar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={subscriptionModalOpen} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-lg"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" /> Limite Atingido
              </DialogTitle>
              <DialogDescription>
                Você atingiu o limite de 5 propriedades do plano gratuito.
                Escolha um plano para continuar crescendo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Card
                className="cursor-pointer hover:border-trust-blue transition-colors border-2"
                onClick={() => handleSubscriptionUpgrade('pay_per_house')}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <h3 className="font-semibold">Pay Per House</h3>
                  <div className="text-2xl font-bold">
                    $10
                    <span className="text-sm font-normal text-muted-foreground">
                      /prop
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pague apenas pelo que adicionar.
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:border-gold transition-colors border-2 border-trust-blue bg-blue-50/50"
                onClick={() => handleSubscriptionUpgrade('unlimited')}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <Badge className="bg-gold text-navy hover:bg-gold/90 mb-1">
                    Recomendado
                  </Badge>
                  <h3 className="font-semibold text-navy">Ilimitado</h3>
                  <div className="text-2xl font-bold">
                    $299
                    <span className="text-sm font-normal text-muted-foreground">
                      /mês
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Propriedades infinitas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
