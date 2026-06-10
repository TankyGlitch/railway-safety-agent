'use client'

import { ArrowUp, Square } from 'lucide-react'
import { useRef, type FormEvent, type KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop?: () => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleInput(next: string) {
    onChange(next)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (isLoading || disabled) return
    if (!value.trim()) return
    onSubmit()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border border-border bg-card p-2 pl-4 shadow-sm transition-colors',
          'focus-within:border-primary/60 focus-within:glow-primary',
        )}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Describe the railway emergency or ask R.E.A.C.T. AI…"
          className="max-h-[200px] min-h-[24px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
          aria-label="Message R.E.A.C.T. AI"
        />

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80"
          >
            <Square className="size-4 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl transition-all',
              canSend
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'cursor-not-allowed bg-secondary text-muted-foreground',
            )}
          >
            <ArrowUp className="size-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        R.E.A.C.T. AI provides operational recommendations and coordinates actions
        through connected MCP tools.
      </p>
    </form>
  )
}
