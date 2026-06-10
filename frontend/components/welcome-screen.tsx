'use client'

import { Logo } from '@/components/logo'
import { SUGGESTED_PROMPTS } from '@/lib/suggested-prompts'

export function WelcomeScreen({
  onPrompt,
}: {
  onPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">

        {/* Circular brand identity */}
        <div className="flex flex-col items-center gap-4">
          <div className="glow-primary rounded-full p-1 ring-2 ring-primary/40">
            <Logo size={120} />
          </div>
          <div className="text-center">
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
              R.E.A.C.T. AI
            </h1>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Rail Emergency Action &amp; Coordination Tool
            </p>
          </div>
          <p className="max-w-sm text-center text-pretty text-sm leading-relaxed text-muted-foreground">
            AI-powered emergency coordination and decision support for Indian
            Railways officers. Describe an incident below to begin.
          </p>
        </div>

        {/* Prompt cards */}
        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SUGGESTED_PROMPTS.map(({ icon: Icon, label, prompt }) => (
            <button
              key={prompt}
              onClick={() => onPrompt(prompt)}
              className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {prompt}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
