import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, X, Send, Paperclip } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { supabase } from '../lib/supabase'
import { sanitizeInput } from '../lib/sanitize'

/* ═══════════════════════════════════════════════════════════
   SupportChat — Виджет поддержки с Supabase RPC бэкендом
   ═══════════════════════════════════════════════════════════ */

interface SupabaseMessage {
  id: string
  user_id: string
  is_from_user: boolean
  message: string
  project: string
  created_at: string
}

/** Get a short device description from User-Agent */
function getDeviceInfo(): string {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) {
    const m = ua.match(/iPhone OS (\d+[_\d]*)/)
    return `iPhone (iOS ${m ? m[1].replace(/_/g, '.') : '?'})`
  }
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) {
    const m = ua.match(/Android ([0-9.]+)/)
    return `Android ${m ? m[1] : ''}`
  }
  if (/Mac OS X/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Windows'
  return 'Web'
}

export function SupportChat() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<SupabaseMessage[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate or retrieve anonymous support user ID
  useEffect(() => {
    let storedId = localStorage.getItem('bazzar_support_id')
    if (!storedId) {
      storedId = crypto.randomUUID()
      localStorage.setItem('bazzar_support_id', storedId)
    }
    setUserId(storedId)

    const handleOpenChat = () => setOpen(true)
    window.addEventListener('open-support-chat', handleOpenChat)
    return () => window.removeEventListener('open-support-chat', handleOpenChat)
  }, [])

  // Load messages from Supabase and poll every 3s
  useEffect(() => {
    if (!userId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase.rpc('get_bazzar_support_messages', {
        p_user_id: userId
      })
      if (!error && data) {
        setMessages(data)
      }
    }

    if (open) {
      fetchMessages()
    }

    const interval = setInterval(() => {
      if (open) fetchMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [userId, open])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Get client context for enriched notifications
  const getClientContext = () => {
    // UDID from auth flow (stored after profile installation)
    const udid = localStorage.getItem('bazzar_udid') || null
    const deviceInfo = getDeviceInfo()
    const currentPage = window.location.pathname

    return { udid, deviceInfo, currentPage }
  }

  // Send message via Supabase RPC
  const sendMessage = async () => {
    if (!input.trim() || !userId) return

    const msgText = sanitizeInput(input)
    setInput('')

    // Optimistic update
    const tempMsg: SupabaseMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      is_from_user: true,
      message: msgText,
      project: 'Bazzar Certs',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    const ctx = getClientContext()
    const { error } = await supabase.rpc('bazzar_support_message', {
      p_user_id: userId,
      p_message: msgText,
      p_udid: ctx.udid,
      p_device_info: ctx.deviceInfo,
      p_current_page: ctx.currentPage,
    })

    if (error) {
      console.error('Ошибка отправки:', error)
    }
  }

  // Handle image attachment
  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    const sendImageMessage = async () => {
      const msgText = `📷 [Фото: ${file.name}]`
      const tempMsg: SupabaseMessage = {
        id: crypto.randomUUID(),
        user_id: userId!,
        is_from_user: true,
        message: msgText,
        project: 'Bazzar Certs',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempMsg])

      const ctx = getClientContext()
      await supabase.rpc('bazzar_support_message', {
        p_user_id: userId,
        p_message: msgText,
        p_udid: ctx.udid,
        p_device_info: ctx.deviceInfo,
        p_current_page: ctx.currentPage,
      })
    }

    sendImageMessage()
    e.target.value = ''
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  // Quick reply questions
  const quickReplies = [
    t('chat.q1'),
    t('chat.q2'),
    t('chat.q3'),
    t('chat.q4'),
  ].filter(Boolean)

  const handleQuickReply = async (question: string) => {
    if (!userId) return

    const tempMsg: SupabaseMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      is_from_user: true,
      message: question,
      project: 'Bazzar Certs',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    const ctx = getClientContext()
    await supabase.rpc('bazzar_support_message', {
      p_user_id: userId,
      p_message: question,
      p_udid: ctx.udid,
      p_device_info: ctx.deviceInfo,
      p_current_page: ctx.currentPage,
    })
  }

  return (
    <>
      {/* Кнопка чата */}
      <div className="chat-btn">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--gradient)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            cursor: 'pointer',
          }}
          aria-label={t('chat.title')}
        >
          <Headphones size={22} />
        </motion.button>
      </div>

      {/* Окно чата */}
      <AnimatePresence>
        {open && (
          <>
            {/* Оверлей (mobile) */}
            <motion.div
              className="overlay desktop-hide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="chat-window"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                position: 'fixed',
                bottom: 96,
                right: 24,
                width: 380,
                height: 500,
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 1500,
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Хедер чата */}
              <div style={{
                padding: '16px 20px',
                background: 'var(--gradient-subtle)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
                    {t('chat.title')}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                    {t('chat.online')}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface-2)',
                    color: 'var(--text-2)',
                  }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Сообщения */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-3)', margin: 'auto', fontSize: '0.9rem' }}>
                    {t('chat.empty') || 'Напишите нам, если у вас возникли вопросы.'}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isClient = msg.is_from_user === true
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          alignSelf: isClient ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                        }}
                      >
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isClient
                            ? 'var(--r-md) var(--r-md) var(--r-xs) var(--r-md)'
                            : 'var(--r-md) var(--r-md) var(--r-md) var(--r-xs)',
                          background: isClient ? 'var(--accent-1)' : 'var(--surface-2)',
                          color: isClient ? '#fff' : 'var(--text)',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                        }}>
                          {msg.message}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 4, display: 'block', textAlign: isClient ? 'right' : 'left' }}>
                          {formatTime(msg.created_at)}
                        </span>
                      </motion.div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Быстрые ответы */}
              {messages.length <= 2 && quickReplies.length > 0 && (
                <div style={{
                  padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap',
                  borderTop: '1px solid var(--border)',
                }}>
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleQuickReply(q)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--r-full)',
                        background: 'rgba(149,51,255,0.08)', border: '1px solid rgba(149,51,255,0.2)',
                        color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 200ms', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(149,51,255,0.15)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(149,51,255,0.08)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Ввод */}
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                style={{
                  padding: 12,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <input
                  className="field"
                  type="text"
                  placeholder={t('chat.inputPlaceholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  style={{ flex: 1, borderRadius: 'var(--r-full)', padding: '10px 16px', fontSize: '0.85rem' }}
                />
                {/* Прикрепить файл */}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAttach} />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--r-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--surface-2)', color: 'var(--text-3)',
                    border: '1px solid var(--border)', flexShrink: 0,
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  title="Прикрепить фото / скриншот"
                >
                  <Paperclip size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="btn btn-gradient"
                  style={{ padding: '10px 14px', borderRadius: 'var(--r-full)' }}
                >
                  <Send size={16} />
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
