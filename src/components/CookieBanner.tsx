import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

/* ═══════════════════════════════════════════════════════════
   CookieBanner — GDPR-совместимый баннер
   Показывается один раз, запоминает согласие в localStorage
   Компактный на мобильных, горизонтальный на десктопе
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'bazzar_cookies_accepted'

export function CookieBanner() {
  const [show, setShow] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Показать через 1.5 сек после загрузки
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
    <>
      {/* Inject mobile styles */}
      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 95;
          width: 92%;
          max-width: 520px;
          padding: 14px 16px;
          border-radius: var(--r-xl);
          background: rgba(20, 20, 28, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        }
        @media (min-width: 640px) {
          .cookie-banner { bottom: 20px; padding: 16px 20px; }
        }
      `}</style>

      <AnimatePresence>
        {show && (
          <motion.div
            className="cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button — top right */}
            <button
              onClick={accept}
              aria-label="Закрыть"
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: 'none', color: 'var(--text-3)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={13} />
            </button>

            {/* Content row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(149,51,255,0.1)',
                border: '1px solid rgba(149,51,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Cookie size={18} style={{ color: 'var(--accent)' }} />
              </div>

              {/* Text + Button inline */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45, paddingRight: 20 }}>
                  {t('cookie.text')}{' '}
                  <Link to="/privacy" onClick={accept} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    {t('cookie.privacyLink')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Accept button — full width on mobile */}
            <button
              onClick={accept}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '9px 18px',
                borderRadius: 'var(--r-full)',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              {t('cookie.accept')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
