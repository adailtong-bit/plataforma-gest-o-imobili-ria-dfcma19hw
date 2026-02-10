import { cn } from '@/lib/utils'

interface DataMaskProps {
  children?: React.ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  // Enhanced component that applies a refined privacy mask
  // The blur is lighter and contained, with a subtle background to indicate hidden content
  // Removed heavy blur-[5px] in favor of a cleaner blur-[4px] with visual cues

  return (
    <span
      className={cn(
        'transition-all duration-300 ease-in-out inline-block align-baseline rounded px-1 -mx-1',
        blur
          ? 'filter blur-[4px] hover:blur-0 cursor-pointer select-none hover:select-text bg-foreground/10 hover:bg-transparent'
          : '',
        className,
      )}
      // Add aria-label and title for accessibility and user feedback
      aria-label={blur ? 'Sensitive data, hover to reveal' : undefined}
      title={blur ? 'Hover to reveal data' : undefined}
    >
      {children}
    </span>
  )
}
