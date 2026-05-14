/* Input Component - A component that displays an input - from shadcn/ui (exposes Input) */
import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent negative sign for numerical fields
      if (type === 'number' && e.key === '-') {
        e.preventDefault()
      }
      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    return (
      <input
        type={type}
        onKeyDown={handleKeyDown}
        min={type === 'number' ? '0' : undefined}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base text-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-black placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-100 md:text-sm shadow-none',
          // Enforce text color and opacity even when disabled
          'disabled:text-black disabled:bg-white',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
