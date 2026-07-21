import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   LivePurchaseNotification — социальное доказательство
   Показывает РЕАЛЬНЫЕ последние покупки (анонимно) из /api/stats.
   Если реальных данных нет — ничего не показывает (без фейка).
   ═══════════════════════════════════════════════════════════ */

interface RecentPurchase {
  product: string
  at: string
}

interface Purchase {
  id: number
  clientNum: string
  product: string
  time: string
}

function randomClientNumber(): string {
  // Анонимный номер клиента (не раскрываем реальные UDID/данные)
  return String(1000 + Math.floor(Math.random() * 9000))
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  return `${d} дн назад`
}

function getRandomInterval(): number {
  return (15 + Math.random() * 15) * 1000 // 15-30 секунд
}

export function LivePurchaseNotification() {
  const [pool, setPool] = useState<RecentPurchase[]>([])
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [visible, setVisible] = useState(false)

  // Реальные последние покупки с сервера
  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setPool(Array.isArray(d?.recent) ? d.recent : []))
      .catch(() => setPool([]))
  }, [])

  const showNotification = useCallback(() => {
    if (pool.length === 0) return
    const item = pool[Math.floor(Math.random() * pool.length)]
    setPurchase({
      id: Date.now(),
      clientNum: randomClientNumber(),
      product: item.product,
      time: timeAgo(item.at),
    })
    setVisible(true)
    setTimeout(() => setVisible(false), 5000)
  }, [pool])

  useEffect(() => {
    if (pool.length === 0) return
    let timeout: ReturnType<typeof setTimeout>
    const initialDelay = setTimeout(() => {
      showNotification()
      const scheduleNext = () => {
        timeout = setTimeout(() => {
          showNotification()
          scheduleNext()
        }, getRandomInterval())
      }
      scheduleNext()
    }, 3000)
    return () => {
      clearTimeout(initialDelay)
      clearTimeout(timeout)
    }
  }, [pool, showNotification])

  return (
    <AnimatePresence>
      {visible && purchase && (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, x: -80, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -80, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1500,
            maxWidth: 340,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(30, 30, 30, 0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(149,51,255,0.3), rgba(110,0,229,0.5))',
              border: '1px solid rgba(149,51,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShoppingBag size={18} style={{ color: 'rgba(255,255,255,0.8)' }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', lineHeight: 1.35, marginBottom: 3 }}>
                Клиент #{purchase.clientNum}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{purchase.product}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span>{purchase.time}</span>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              padding: '4px 10px', borderRadius: 'var(--r-full)',
              background: 'rgba(59, 179, 59, 0.12)', border: '1px solid rgba(59, 179, 59, 0.2)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3bb33b', display: 'inline-block', boxShadow: '0 0 6px rgba(59,179,59,0.5)', animation: 'pulse 2s ease-in-out infinite' }} />
              <ShoppingBag size={10} style={{ color: '#3bb33b' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
