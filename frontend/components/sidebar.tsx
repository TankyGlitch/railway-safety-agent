'use client'

import { Plus, MessageSquare, Radio, ShieldCheck, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewIncident: () => void
  open: boolean
  onClose: () => void
}

function StatusRow({
  label,
  value,
  ok = true,
}: {
  label: string
  value: string
  ok?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        <span
          className={cn(
            'size-1.5 rounded-full',
            ok ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]',
            ok && 'animate-pulse',
          )}
        />
        {value}
      </span>
    </div>
  )
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewIncident,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* header / logo */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={36} className="glow-primary shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold tracking-tight text-sidebar-foreground truncate">
                R.E.A.C.T. AI
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">
                Rail Emergency Action &amp; Coordination Tool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent md:hidden shrink-0"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* new incident */}
        <div className="px-3">
          <button
            onClick={onNewIncident}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 glow-primary"
          >
            <Plus className="size-4" />
            New Incident
          </button>
        </div>

        {/* history */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Incident History
          </p>
          <ScrollArea className="flex-1 px-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-3 text-xs leading-relaxed text-muted-foreground">
                No incidents yet. Start a new incident to begin coordinating a
                response.
              </p>
            ) : (
              <ul className="space-y-0.5 pb-2">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        c.id === activeId
                          ? 'bg-sidebar-accent text-sidebar-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                      )}
                    >
                      <MessageSquare className="size-4 shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        {/* system status */}
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="mb-2.5 flex items-center gap-2">
              <Radio className="size-3.5 text-primary" />
              <span className="text-xs font-semibold text-sidebar-foreground">
                System Status
              </span>
            </div>
            <div className="space-y-1.5">
              <StatusRow label="Backend Status" value="Connecting…" ok={false} />
              <StatusRow label="Connection Status" value="Pending" ok={false} />
              <StatusRow label="Data Store" value="Pending" ok={false} />
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-sidebar-border pt-2.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-[var(--color-success)]" />
              Secure session · Indian Railways
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
