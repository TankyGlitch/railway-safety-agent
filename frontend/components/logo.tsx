'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** Diameter in pixels */
  size?: number
  className?: string
}

/**
 * Circular brand avatar used throughout R.E.A.C.T. AI.
 * Always renders as a circle — never as a rectangular banner.
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/react-ai-avatar.png"
        alt="R.E.A.C.T. AI"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  )
}
