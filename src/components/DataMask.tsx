import { useMemo } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

interface DataMaskProps {
  children: React.ReactNode
  className?: string
  width?: string | number
  showAuth?: boolean // Optional override to force show if needed (debug)
}

export function DataMask({
  children,
  className,
  width,
  showAuth,
}: DataMaskProps) {
  const { isAuthenticated } = useAuthStore()

  const shouldShow = showAuth || isAuthenticated

  if (shouldShow) {
    // Ensure revealed data uses high contrast text color
    return (
      <span className={cn('text-slate-950 dark:text-slate-50', className)}>
        {children}
      </span>
    )
  }

  // Determine width style
  const style = width ? { width } : {}

  return (
    <span
      className={cn(
        'inline-block bg-slate-200 text-transparent rounded select-none animate-pulse align-middle h-[1em] min-w-[3ch]',
        className,
      )}
      style={style}
      aria-hidden="true"
    >
      {/* Invisible content to maintain approximate layout flow if needed, 
          though fixed height/width usually better for skeletons */}
      <span className="invisible">{children}</span>
    </span>
  )
}
