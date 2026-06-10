'use client'

import { User } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ToolTimeline } from '@/components/tool-timeline'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Assistant is responding">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// Render assistant text with basic paragraph/line handling.
function MessageText({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean)
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
      {blocks.map((block, i) => (
        <p key={i} className="whitespace-pre-wrap text-pretty">
          {block}
        </p>
      ))}
    </div>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const hasToolEvents = !!message.toolEvents?.length

  return (
    <div className={cn('flex w-full gap-3 sm:gap-4', isUser && 'justify-end')}>
      {/* Assistant avatar — circular logo */}
      {!isUser && (
        <div className="mt-0.5 shrink-0">
          <Logo size={32} className="glow-primary" />
        </div>
      )}

      <div
        className={cn(
          'min-w-0 max-w-[min(52rem,90%)]',
          isUser && 'flex flex-col items-end',
        )}
      >
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground">
            <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                R.E.A.C.T. AI
              </span>
              <span className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                AI Assistant
              </span>
            </div>

            {hasToolEvents && <ToolTimeline events={message.toolEvents!} />}

            {message.pending && !message.content ? (
              <div className="mt-2">
                <TypingIndicator />
              </div>
            ) : (
              <div className={cn(hasToolEvents && 'mt-3')}>
                <MessageText content={message.content} />
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}
