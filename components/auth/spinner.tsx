'use client'
import clsx from 'clsx'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function Spinner({
  size = 'md',
  label = 'Checking user session'
}: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          {
            'h-4 w-4': size === 'sm',
            'h-6 w-6': size === 'md',
            'h-10 w-10': size === 'lg',
          }
        )}
        role="status"
        aria-live="polite"
        aria-label={label}
      />
    </div>
  )
}