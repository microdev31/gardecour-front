/* ── GardeCoeur — Page Messagerie ────────────────────────────────────────── */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Avatar, Badge, Spinner } from '@/components/ui'
import { PageLayout } from '@/components/layout'
import { useAuthStore } from '@/store/authStore'
import { messagingApi } from '@/services/api'
import type { Conversation } from '@/types'
import { useChat } from './useChat'
import styles from './Messages.module.css'

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()

  if (isYesterday) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function sameMinute(a: string, b: string): boolean {
  return a.slice(0, 16) === b.slice(0, 16)
}

/* ── Skeleton messages ───────────────────────────────────────────────────── */

const MessagesSkeleton: React.FC = () => (
  <div className={styles.skeletonList}>
    {[180, 120, 200, 100].map((w, i) => (
      <div key={i} className={`${styles.skeletonRow} ${i % 2 === 1 ? styles.skeletonRowRight : ''}`}>
        <div className={styles.skeletonBubble} style={{ width: w }} />
      </div>
    ))}
  </div>
)

/* ── Main page ───────────────────────────────────────────────────────────── */

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showToast, setShowToast] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { messages, isConnecting, isConnected, sendMessage, loadMessages } = useChat(selectedId)

  /* ── Load conversations ────────────────────────────────────────────────── */

  useEffect(() => {
    messagingApi.conversations()
      .then(res => setConversations(res.data as Conversation[]))
      .finally(() => setLoadingConvs(false))
  }, [])

  /* ── Show toast on disconnect ──────────────────────────────────────────── */

  useEffect(() => {
    if (selectedId === null) return
    if (!isConnecting && !isConnected) {
      setShowToast(true)
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setShowToast(false), 4000)
    } else {
      setShowToast(false)
    }
    return () => {
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current)
    }
  }, [isConnecting, isConnected, selectedId])

  /* ── Scroll to bottom on new messages ──────────────────────────────────── */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ── Select conversation ───────────────────────────────────────────────── */

  const handleSelectConv = useCallback(async (id: number) => {
    if (id === selectedId) return
    setSelectedId(id)
    setLoadingMsgs(true)
    try {
      await loadMessages(id)
    } finally {
      setLoadingMsgs(false)
    }
  }, [selectedId, loadMessages])

  /* ── Send message ──────────────────────────────────────────────────────── */

  const handleSend = useCallback(() => {
    const content = inputValue.trim()
    if (!content || !isConnected) return
    sendMessage(content)
    setInputValue('')
  }, [inputValue, isConnected, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }, [handleSend])

  /* ── Derived ───────────────────────────────────────────────────────────── */

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null
  const correspondentName = selectedConv
    ? `Conversation #${selectedConv.connection}`
    : ''

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Messages</div>

          {loadingConvs ? (
            <div className={styles.sidebarLoading}><Spinner size="md" /></div>
          ) : conversations.length === 0 ? (
            <div className={styles.emptyConv}>
              <div className={styles.emptyConvIcon}>💬</div>
              <div className={styles.emptyConvTitle}>Aucune conversation</div>
              <div className={styles.emptyConvText}>
                Envoyez une demande de mise en relation pour commencer à échanger.
              </div>
            </div>
          ) : (
            <div className={styles.convList}>
              {conversations.map(conv => {
                const name = `Conversation #${conv.connection}`
                const isActive = conv.id === selectedId
                const avatarColor = user?.role === 'PARENT' ? 'moss' : 'apricot'

                return (
                  <div
                    key={conv.id}
                    className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
                    onClick={() => handleSelectConv(conv.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleSelectConv(conv.id)}
                  >
                    <Avatar initials={getInitials(name)} size="md" color={avatarColor} />
                    <div className={styles.convInfo}>
                      <div className={styles.convName}>{name}</div>
                      {conv.last_message && (
                        <div className={styles.convPreview}>{conv.last_message.content}</div>
                      )}
                    </div>
                    <div className={styles.convMeta}>
                      {conv.last_message && (
                        <span className={styles.convTime}>
                          {formatTime(conv.last_message.created_at)}
                        </span>
                      )}
                      {conv.unread_count > 0 && <span className={styles.unreadDot} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>

        {/* ── Chat zone ── */}
        <section className={styles.chat}>
          {selectedConv === null ? (
            <div className={styles.chatEmpty}>
              <div className={styles.chatEmptyIcon}>✉️</div>
              <div className={styles.chatEmptyTitle}>Sélectionnez une conversation</div>
              <span>Choisissez un échange dans la liste à gauche.</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={styles.chatHeader}>
                <Avatar
                  initials={getInitials(correspondentName)}
                  size="md"
                  color={user?.role === 'PARENT' ? 'moss' : 'apricot'}
                />
                <div className={styles.chatHeaderInfo}>
                  <div className={styles.chatHeaderName}>{correspondentName}</div>
                  <div className={styles.statusBadge}>
                    <span className={`${styles.statusDot} ${isConnecting ? styles.statusDotConnecting : styles.statusDotOnline}`} />
                    <span className={styles.statusLabel}>
                      {isConnecting ? 'Connexion…' : 'En ligne'}
                    </span>
                  </div>
                </div>
                {!isConnected && !isConnecting && (
                  <Badge color="parchment">Hors ligne</Badge>
                )}
              </div>

              {/* Messages */}
              <div className={styles.messagesList}>
                {loadingMsgs ? (
                  <MessagesSkeleton />
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.sender === user?.id
                    const prevMsg = idx > 0 ? messages[idx - 1] : null
                    const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null

                    // New sender group = show gap above
                    const newGroup = prevMsg === null || prevMsg.sender !== msg.sender

                    // Hide time if next message is same sender + same minute
                    const hideTime =
                      nextMsg !== null &&
                      nextMsg.sender === msg.sender &&
                      sameMinute(msg.created_at, nextMsg.created_at)

                    return (
                      <div key={msg.id} className={newGroup ? styles.messageGap : undefined}>
                        <div
                          className={`${styles.messageRow} ${isOwn ? styles.messageRowOwn : styles.messageRowOther} ${styles.newMessage}`}
                        >
                          <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                            {msg.content}
                          </div>
                        </div>
                        {!hideTime && (
                          <div className={`${styles.bubbleTime} ${isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther}`}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={styles.inputBar}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Écrire un message…"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isConnecting}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={isConnecting || !inputValue.trim()}
                  aria-label="Envoyer"
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Toast */}
      {showToast && (
        <div className={styles.toast}>
          Connexion perdue, reconnexion en cours…
        </div>
      )}
    </PageLayout>
  )
}

export default MessagesPage
