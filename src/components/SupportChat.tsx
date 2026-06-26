import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { HeadsetIcon as MessageSquare, ChevronRightIcon as X, BoltIcon as Send } from '../ui/Icons'

export const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Получаем или генерируем анонимный ID пользователя
    let storedId = localStorage.getItem('bazzar_support_id')
    if (!storedId) {
      storedId = crypto.randomUUID()
      localStorage.setItem('bazzar_support_id', storedId)
    }
    setUserId(storedId)
  }, [])

  useEffect(() => {
    if (!userId) return

    // Load initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
    }
    
    if (isOpen) {
      fetchMessages()
    }

    // Subscribe to realtime changes
    const channel = supabase.channel(`support_chat_${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `user_id=eq.${userId}` 
      }, payload => {
        setMessages(prev => {
          if (prev.some(m => m.message === payload.new.message && m.created_at.slice(0, 16) === payload.new.created_at.slice(0, 16))) {
            return prev
          }
          return [...prev, payload.new]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const msgText = newMessage.trim()
    setNewMessage('')

    const tempMsg = {
      id: crypto.randomUUID(),
      user_id: userId,
      is_from_user: true,
      message: msgText,
      project: 'Bazzar Certs',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    const { error } = await supabase
      .from('support_messages')
      .insert({
        user_id: userId,
        is_from_user: true,
        message: msgText,
        project: 'Bazzar Certs'
      })

    if (error) {
      console.error('Ошибка отправки:', error)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!isOpen ? (
        <motion.button 
          key="chat-trigger"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: 30, right: 30, zIndex: 50,
            background: 'var(--text)',
            color: 'var(--bg)', padding: '14px 20px', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span style={{ display: 'flex' }}><MessageSquare size={18} /></span>
          Поддержка
        </motion.button>
      ) : (
        <motion.div 
          key="chat-window"
          initial={{ opacity: 0, scale: 0.85, y: 30, transformOrigin: 'bottom right' }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'fixed', bottom: 30, right: 30, zIndex: 50,
            width: 380, height: 540,
            background: 'var(--bg)',
            border: '1px solid var(--hair)',
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'var(--surface)',
            padding: '18px 20px',
            borderBottom: '1px solid var(--hair)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', margin: 0, color: 'var(--text)' }}>Bazzar Support</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '4px 0 0 0' }}>Отвечаем в течение 5 минут</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: '1px solid var(--hair)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', margin: 'auto', fontSize: '0.9rem' }}>
                Напишите нам, если у вас возникли вопросы.
              </div>
            ) : (
              messages.map(msg => {
                const isClient = msg.is_from_user === true
                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      alignSelf: isClient ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isClient ? 'var(--text)' : 'var(--surface-2)',
                      color: isClient ? 'var(--bg)' : 'var(--text)',
                      padding: '12px 16px',
                      borderRadius: 12,
                      borderBottomRightRadius: isClient ? 4 : 12,
                      borderBottomLeftRadius: !isClient ? 4 : 12,
                      fontSize: '0.9rem',
                      lineHeight: 1.5
                    }}
                  >
                    {msg.message}
                  </motion.div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: 16,
            background: 'var(--surface)',
            borderTop: '1px solid var(--hair)',
            display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              style={{
                flex: 1, background: 'var(--bg)', border: '1px solid var(--hair)',
                color: 'var(--text)', padding: '0 16px', borderRadius: 10, fontSize: '0.9rem',
                outline: 'none', height: 44
              }}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              style={{
                background: newMessage.trim() ? 'var(--text)' : 'var(--surface-2)',
                color: newMessage.trim() ? 'var(--bg)' : 'var(--text-3)', border: 'none', borderRadius: 10, width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: newMessage.trim() ? 'pointer' : 'default',
                flexShrink: 0
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
