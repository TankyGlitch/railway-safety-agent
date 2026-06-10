'use client'

import { Menu, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ChatInput } from '@/components/chat-input'
import { Logo } from '@/components/logo'
import { MessageBubble } from '@/components/message-bubble'
import { Sidebar } from '@/components/sidebar'
import { WelcomeScreen } from '@/components/welcome-screen'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@/hooks/use-chat'

export default function Page() {
  const {
    conversations,
    active,
    activeId,
    isLoading,
    error,
    sendMessage,
    newIncident,
    selectConversation,
    stop,
  } = useChat()

  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = active?.messages ?? []

  // Auto-scroll to newest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, active?.messages])

  function handleSend() {
    const text = input
    setInput('')
    void sendMessage(text)
  }

  function handlePrompt(prompt: string) {
    void sendMessage(prompt)
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          selectConversation(id)
          setSidebarOpen(false)
        }}
        onNewIncident={() => {
          newIncident()
          setInput('')
          setSidebarOpen(false)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            {/* circular logo in header */}
            <Logo size={28} className="glow-primary hidden md:inline-flex" />
            <h2 className="truncate text-sm font-medium text-foreground">
              {active ? active.title : 'New Incident'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            Operational
          </div>
        </header>

        {/* messages / welcome */}
        <div className="relative min-h-0 flex-1">
          {messages.length === 0 ? (
            <WelcomeScreen onPrompt={handlePrompt} />
          ) : (
            <ScrollArea className="h-full" viewportRef={scrollRef}>
              <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* error banner */}
        {error && (
          <div className="mx-auto w-full max-w-4xl px-4">
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <TriangleAlert className="size-4 shrink-0" />
              {error}
            </div>
          </div>
        )}

        {/* composer */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="mx-auto w-full max-w-4xl">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              onStop={stop}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
