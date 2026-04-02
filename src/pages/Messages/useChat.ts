/* ── GardeCoeur — Hook WebSocket messagerie ──────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react'
import { messagingApi } from '@/services/api'
import type { Message } from '@/types'

type WsStatus = 'idle' | 'connecting' | 'open' | 'closed'

interface UseChatReturn {
  messages: Message[]
  isConnecting: boolean
  isConnected: boolean
  sendMessage: (content: string) => void
  loadMessages: (id: number) => Promise<void>
}

const WS_BASE = 'ws://localhost:8000/ws/chat'
const RECONNECT_DELAY = 3000

export function useChat(conversationId: number | null): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<WsStatus>('idle')

  const wsRef = useRef<WebSocket | null>(null)
  const unmountedRef = useRef(false)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadMessages = useCallback(async (id: number) => {
    const res = await messagingApi.messages(id)
    if (!unmountedRef.current) {
      setMessages(res.data as Message[])
    }
  }, [])

  const connect = useCallback((id: number) => {
    const token = localStorage.getItem('access_token') ?? ''
    const url = `${WS_BASE}/${id}/?token=${token}`

    setStatus('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!unmountedRef.current) setStatus('open')
    }

    ws.onmessage = (event: MessageEvent) => {
      if (unmountedRef.current) return
      try {
        const data = JSON.parse(event.data as string) as {
          type: string
          id: number
          content: string
          sender_id: number
          created_at: string
        }
        if (data.type === 'message.received') {
          const incoming: Message = {
            id: data.id,
            sender: data.sender_id,
            sender_email: '',
            content: data.content,
            read_at: null,
            created_at: data.created_at,
          }
          setMessages(prev => [...prev, incoming])
        }
      } catch {
        // ignore malformed frames
      }
    }

    ws.onclose = () => {
      if (unmountedRef.current) return
      setStatus('closed')
      // Reconnect automatically unless we deliberately closed
      reconnectTimerRef.current = setTimeout(() => {
        if (!unmountedRef.current) connect(id)
      }, RECONNECT_DELAY)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  // Open/close WebSocket when conversationId changes
  useEffect(() => {
    unmountedRef.current = false

    if (conversationId === null) {
      setMessages([])
      setStatus('idle')
      return
    }

    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    wsRef.current?.close()
    setMessages([])
    loadMessages(conversationId)
    connect(conversationId)

    return () => {
      unmountedRef.current = true
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [conversationId, connect, loadMessages])

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ content }))
  }, [])

  return {
    messages,
    isConnecting: status === 'connecting',
    isConnected: status === 'open',
    sendMessage,
    loadMessages,
  }
}
