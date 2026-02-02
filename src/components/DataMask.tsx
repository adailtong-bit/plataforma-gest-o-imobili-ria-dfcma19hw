import { cn } from '@/lib/utils'

interface DataMaskProps {
  children?: React.ReactNode
  className?: string
  width?: string | number
  showAuth?: boolean // Kept for compatibility but ignored
}

export function DataMask({ children, className }: DataMaskProps) {
  // Refactored to always render text directly without masking
  // Enforces high contrast black text and full opacity.
  // We strictly avoid applying any background or opacity reduction that could obscure data.
  return (
    <span
      className={cn(
        'text-black opacity-100 bg-transparent inline-block align-middle',
        className,
      )}
    >
      {children}
    </span>
  )
}
