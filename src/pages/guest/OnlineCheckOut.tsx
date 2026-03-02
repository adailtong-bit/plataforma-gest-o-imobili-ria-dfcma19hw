import { useEffect, useState, useContext, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '@/stores/AppContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, ChevronRight, Star, CreditCard } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Invoice } from '@/lib/types'

export default function OnlineCheckOut() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { bookings, updateBooking, financials } = useContext(AppContext)!
  const { toast } = useToast()
  const { language } = useLanguageStore()

  const booking = bookings.find((b) => b.id === bookingId)

  // Find all pending invoices associated to this booking (consumptions)
  const bookingInvoices = useMemo(() => {
    return financials.invoices.filter(
      (inv) => inv.bookingId === bookingId && inv.status === 'pending',
    )
  }, [financials.invoices, bookingId])

  const [step, setStep] = useState(1)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!booking) {
      toast({
        title: 'Error',
        description: 'Booking not found.',
        variant: 'destructive',
      })
      navigate('/')
    }
  }, [booking, navigate, toast])

  if (!booking) return null

  const pendingAmount = bookingInvoices.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  )
  const totalAmount = booking.totalAmount + pendingAmount

  const handleFinish = () => {
    updateBooking({
      ...booking,
      status: 'checked_out',
      checkedOutAt: new Date().toISOString(),
      feedbackId: `fb-${Date.now()}`,
    })
    setStep(4) // Success step
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-xl mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-navy mb-2">Check-Out Online</h1>
        <p className="text-slate-500 text-center">
          Esperamos que você tenha aproveitado sua estadia na propriedade{' '}
          {booking.propertyName}.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <div className="flex justify-between mb-8 px-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-trust-blue -z-10 -translate-y-1/2 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors bg-white ${
                s <= step
                  ? 'border-trust-blue text-trust-blue'
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Resumo da Conta</CardTitle>
              <CardDescription>
                Revise os valores pendentes antes de finalizar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Valor da Hospedagem</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(booking.totalAmount, 'BRL')}
                  </span>
                </div>

                {bookingInvoices.length > 0 && (
                  <>
                    <div className="pt-2 border-t border-slate-200 text-sm font-semibold text-slate-700">
                      Consumos (PDV / Serviços)
                    </div>
                    {bookingInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex justify-between items-center text-sm ml-2"
                      >
                        <span className="text-slate-500">
                          {inv.description}
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(inv.amount, 'BRL')}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    Total a Pagar
                  </span>
                  <span className="font-bold text-lg text-trust-blue">
                    {formatCurrency(totalAmount, 'BRL')}
                  </span>
                </div>
              </div>

              {pendingAmount > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-sm text-amber-800 flex gap-3">
                  <CreditCard className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <div>
                    Você possui consumos extras. O valor será cobrado no cartão
                    de crédito em arquivo ou você pode se dirigir à recepção.
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-trust-blue hover:bg-navy text-white h-12 text-lg"
                onClick={() => setStep(2)}
              >
                Continuar <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Avalie sua Estadia</CardTitle>
              <CardDescription>Como foi a sua experiência?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-12 h-12 cursor-pointer transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {rating === 0 && 'Toque para avaliar'}
                  {rating === 1 && 'Ruim'}
                  {rating === 2 && 'Razoável'}
                  {rating === 3 && 'Bom'}
                  {rating === 4 && 'Muito Bom'}
                  {rating === 5 && 'Excelente'}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Algum comentário ou sugestão?</Label>
                <textarea
                  className="w-full flex min-h-[120px] rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust-blue"
                  placeholder="Conte-nos o que você mais gostou ou o que podemos melhorar..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                className="w-1/3"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button
                className="w-2/3 bg-trust-blue hover:bg-navy text-white h-12"
                onClick={() => setStep(3)}
                disabled={rating === 0}
              >
                Continuar <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Finalizar Saída</CardTitle>
              <CardDescription>
                Confirme que você está deixando a propriedade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700">
                <p className="mb-2">
                  <strong>Instruções de Saída:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Por favor, certifique-se de não esquecer nenhum pertence.
                  </li>
                  <li>Tranque a porta ao sair.</li>
                  <li>
                    Deixe as chaves físicas (se houver) no local indicado.
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                className="w-1/3"
                onClick={() => setStep(2)}
              >
                Voltar
              </Button>
              <Button
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white h-12"
                onClick={handleFinish}
              >
                Confirmar Saída
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-0 shadow-lg text-center py-12">
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy">
                Check-Out Concluído!
              </h2>
              <p className="text-slate-500 max-w-sm">
                Obrigado por se hospedar conosco. A fatura final foi enviada
                para o seu email. Tenha uma viagem segura!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
