import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

/* ═══════════════════════════════════════════════════════════
   CookieBanner — GDPR-совместимый баннер
   Компактный на мобильных
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'bazzar_cookies_accepted'

export function CookieBanner() {
  const [show, setShow] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setShow(true), 1500)
        return () => clearTimeout(t)
      }
    } catch { /* ignore */ }
  }, [])

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch { /* ignore */ }
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            bottom: 76,
            left: 12,
            right: 12,
            zIndex: 95,
            maxWidth: 420,
            margin: '0 auto',
            padding: '14px 16px',
            borderRadius: 18,
            background: 'rgba(20, 20, 28, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Close X */}
          <button
            onClick={accept}
            aria-label="Закрыть"
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: 'none', color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>

          {/* Content */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingRight: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(149,51,255,0.1)',
              border: '1px solid rgba(149,51,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Cookie size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
              {t('cookie.text')}{' '}
              <Link to="/privacy" onClick={accept} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                {t('cookie.privacyLink')}
              </Link>
            </div>
          </div>

          {/* Accept button */}
          <button
            onClick={accept}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '10px',
              borderRadius: 50,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            {t('cookie.accept')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
