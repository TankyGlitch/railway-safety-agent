'use client'

import { useCallback, useRef, useState } from 'react'
import type {
  ChatApiResponse,
  ChatMessage,
  Conversation,
  ToolEvent,
} from '@/lib/types'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function titleFromText(text: string) {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > 38 ? `${t.slice(0, 38)}…` : t || 'New Incident'
}

/**
 * Owns conversation state and talks to the backend at POST /api/chat.
 * The frontend stays tool-agnostic: it forwards the user's text + history
 * and renders whatever reply/toolEvents the backend returns.
 */
export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const active = conversations.find((c) => c.id === activeId) ?? null

  const newIncident = useCallback(() => {
    abortRef.current?.abort()
    setActiveId(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const selectConversation = useCallback((id: string) => {
    abortRef.current?.abort()
    setActiveId(id)
    setError(null)
    setIsLoading(false)
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || isLoading) return
      setError(null)

      const now = new Date().toISOString()
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content,
        createdAt: now,
      }
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: '',
        toolEvents: [],
        pending: true,
        createdAt: now,
      }

      // Resolve / create the conversation we're appending to.
      let convId = activeId
      let history: ChatMessage[] = []

      setConversations((prev) => {
        if (convId) {
          return prev.map((c) => {
            if (c.id !== convId) return c
            history = c.messages
            return { ...c, messages: [...c.messages, userMsg, assistantMsg] }
          })
        }
        convId = uid()
        const conv: Conversation = {
          id: convId,
          title: titleFromText(content),
          messages: [userMsg, assistantMsg],
          createdAt: now,
        }
        return [conv, ...prev]
      })
      if (!activeId && convId) setActiveId(convId)

      const patchAssistant = (patch: Partial<ChatMessage>) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id !== convId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id ? { ...m, ...patch } : m,
                  ),
                },
          ),
        )
      }

      setIsLoading(true)
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: content,
            conversationId: convId,
            history: history.map(({ role, content }) => ({ role, content })),
          }),
        })

        if (!res.ok) {
          throw new Error(`Backend responded with ${res.status}`)
        }

        const data = (await res.json()) as ChatApiResponse
        const reply =
          data.reply ?? data.message ?? data.content ?? ''
        const toolEvents: ToolEvent[] = (data.toolEvents ?? []).map((e) => ({
          ...e,
          id: e.id ?? uid(),
        }))

        patchAssistant({
          content:
            reply ||
            'The response was received, but no message text was returned by the backend.',
          toolEvents,
          pending: false,
        })
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          patchAssistant({
            content:
              'Response stopped. Send another message to continue coordinating.',
            pending: false,
          })
        } else {
          const message =
            'Unable to reach the response backend (POST /api/chat). Check that the Gemini + MCP service is connected and try again.'
          setError(message)
          patchAssistant({ content: message, pending: false })
        }
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [activeId, isLoading],
  )

  return {
    conversations,
    active,
    activeId,
    isLoading,
    error,
    sendMessage,
    newIncident,
    selectConversation,
    stop,
  }
}
