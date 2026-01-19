import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import useAuthStore from '@/stores/useAuthStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useUserStore from '@/stores/useUserStore'
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

export default function DashboardLayout() {
  const { currentUser, setCurrentUser } = useAuthStore()
  const { updateUser } = useUserStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Status Check & Enforcement
  useEffect(() => {
    if (!currentUser) return

    // 1. Check for Pending Approval
    if (
      currentUser.status === 'pending_approval' ||
      currentUser.status === 'blocked'
    ) {
      // In a real app, we would redirect to a "Locked" page.
      // For this demo, we might just show a blocking toast or restrict navigation,
      // but usually the Router handles this. Here we'll just alert.
      return
    }

    // 2. Force Password Change on First Login
    if (currentUser.isFirstLogin && currentUser.status === 'active') {
      setPasswordModalOpen(true)
    }

    // 3. Entry Fee for Tenants
    if (
      currentUser.role === 'software_tenant' &&
      !currentUser.isFirstLogin && // Only after password set
      !(currentUser as User).hasPaidEntryFee
    ) {
      setPaymentModalOpen(true)
    }

    // 4. Subscription Limit Check
    if (
      currentUser.role === 'software_tenant' &&
      (currentUser as User).hasPaidEntryFee &&
      properties.length > 5 &&
      (currentUser as User).subscriptionPlan === 'free'
    ) {
      setSubscriptionModalOpen(true)
    }
  }, [currentUser, properties.length])

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
      updateUser({
        ...(currentUser as User),
        isFirstLogin: false,
        status: 'active',
        // In real backend, password would be hashed here
      })
      // Force refresh current user in auth store if needed (mock)
      setCurrentUser(currentUser.id)

      setProcessing(false)
      setPasswordModalOpen(false)
      toast({ title: 'Sucesso', description: 'Senha atualizada.' })
    }, 1000)
  }

  const handleEntryPayment = () => {
    setProcessing(true)
    setTimeout(() => {
      updateUser({
        ...(currentUser as User),
        hasPaidEntryFee: true,
      })
      setCurrentUser(currentUser.id)
      setProcessing(false)
      setPaymentModalOpen(false)
      toast({ title: 'Pagamento Confirmado', description: 'Acesso liberado.' })
    }, 1500)
  }

  const handleSubscriptionUpgrade = (plan: 'pay_per_house' | 'unlimited') => {
    setProcessing(true)
    setTimeout(() => {
      updateUser({
        ...(currentUser as User),
        subscriptionPlan: plan,
      })
      setCurrentUser(currentUser.id)
      setProcessing(false)
      setSubscriptionModalOpen(false)
      toast({
        title: 'Plano Atualizado',
        description: `Plano ${plan} ativado.`,
      })
    }, 1500)
  }

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground">
          <p>© 2026 COREPM v1.0.0. All rights reserved.</p>
        </footer>

        {/* First Login Password Modal */}
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

        {/* Entry Fee Modal */}
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

        {/* Subscription Upgrade Modal */}
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
