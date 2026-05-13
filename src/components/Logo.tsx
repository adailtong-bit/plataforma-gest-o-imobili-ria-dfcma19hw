import { cn } from '@/lib/utils'
import logoImg from '@/assets/summerpm-logo-d35a2.jpg'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-bold', className)}>
      <img
        src={logoImg}
        alt="Summerpm Logo"
        className="h-8 w-8 rounded object-cover"
      />
      <span className="text-xl tracking-tight">Summerpm</span>
    </div>
  )
}
