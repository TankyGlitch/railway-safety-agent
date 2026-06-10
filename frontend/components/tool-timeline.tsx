'use client'

import {
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  Wrench,
  ChevronDown,
  PlayCircle,
  DatabaseZap,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ToolEvent, ToolStatus } from '@/lib/types'

// Status display config — fully driven by what the backend sends
const STATUS_CONFIG: Record<
  ToolStatus,
  { label: string; phase: string; icon: typeof CheckCircle2; className: string; dot: string }
> = {
  running: {
    label: 'Tool Started',
    phase: 'In Progress',
    icon: Loader2,
    className: 'text-primary',
    dot: 'bg-primary',
  },
  pending: {
    label: 'Pending',
    phase: 'Queued',
    icon: Clock,
    className: 'text-muted-foreground',
    dot: 'bg-muted-foreground/60',
  },
  success: {
    label: 'Tool Completed',
    phase: 'Result Received',
    icon: CheckCircle2,
    className: 'text-[var(--color-success)]',
    dot: 'bg-[var(--color-success)]',
  },
  error: {
    label: 'Tool Failed',
    phase: 'Error',
    icon: XCircle,
    className: 'text-destructive',
    dot: 'bg-destructive',
  },
}

function formatTime(ts?: string) {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function ToolEventCard({ event, isLast }: { event: ToolEvent; isLast: boolean }) {
  const [open, setOpen] = useState(false)
  const config = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.pending
  const StatusIcon = config.icon
  const time = formatTime(event.timestamp)
  const hasStructured = event.result !== undefined && event.result !== null
  const isSuccess = event.status === 'success'

  return (
    <li className="relative pl-7">
      {/* vertical rail */}
      <span
        aria-hidden
        className={cn(
          'absolute left-[9px] top-5 w-px bg-border',
          isLast ? 'h-0' : 'h-[calc(100%+0.75rem)]',
        )}
      />
      {/* timeline node */}
      <span
        aria-hidden
        className={cn(
          'absolute left-[2px] top-[7px] flex h-4 w-4 items-center justify-center rounded-full ring-[3px] ring-card',
          config.dot,
          event.status === 'running' && 'animate-pulse',
        )}
      />

      <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
        {/* top row: tool name + status badge + timestamp */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-mono text-[13px] font-semibold text-foreground truncate">
              {event.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {time && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {time}
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2 py-0.5 text-[11px] font-semibold',
                config.className,
              )}
            >
              <StatusIcon
                className={cn('size-3', event.status === 'running' && 'animate-spin')}
              />
              {config.label}
            </span>
          </div>
        </div>

        {/* phase pills */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <PlayCircle className="size-2.5" />
            Tool Started
          </span>
          {(isSuccess || event.status === 'error') && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium',
                isSuccess
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              <CheckCircle2 className="size-2.5" />
              Tool Completed
            </span>
          )}
          {isSuccess && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <DatabaseZap className="size-2.5" />
              Result Received
            </span>
          )}
        </div>

        {/* result summary */}
        {event.resultSummary && (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {event.resultSummary}
          </p>
        )}

        {/* expandable structured result */}
        {hasStructured && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              <ChevronDown
                className={cn('size-3.5 transition-transform', open && 'rotate-180')}
              />
              {open ? 'Hide details' : 'View details'}
            </button>
            {open && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-border bg-background/70 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {typeof event.result === 'string'
                  ? event.result
                  : JSON.stringify(event.result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export function ToolTimeline({ events }: { events: ToolEvent[] }) {
  if (!events?.length) return null

  return (
    <div className="mt-3 rounded-xl border border-border bg-card/50 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="flex h-5 items-center rounded-md bg-primary/15 px-2 text-[10px] font-bold uppercase tracking-widest text-primary">
          Tool Activity
        </span>
        <span className="text-[11px] text-muted-foreground">
          {events.length} event{events.length > 1 ? 's' : ''}
        </span>
      </div>
      <ul className="space-y-3">
        {events.map((event, i) => (
          <ToolEventCard
            key={event.id}
            event={event}
            isLast={i === events.length - 1}
          />
        ))}
      </ul>
    </div>
  )
}
