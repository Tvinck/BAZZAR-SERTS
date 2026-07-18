import { useState, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

/**
 * Apple-style уведомление «Скачано с BazzarSerts».
 * Появляется через 1.5 с после загрузки, слайдит снизу,
 * стилизовано под iOS Dynamic Island / notification banner.
 */
export function BazzarNotification() {
  const { t } = useI18n()
  const [phase, setPhase] = useState<'hidden' | 'enter' | 'visible' | 'exit'>('hidden')

  useEffect(() => {
    const dismissed = sessionStorage.getItem('bazzar_notif_dismissed')
    if (dismissed) return

    const show = setTimeout(() => setPhase('enter'), 1500)
    return () => clearTimeout(show)
  }, [])

  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('visible'), 20)
      return () => clearTimeout(t)
    }
  }, [phase])

  const dismiss = () => {
    setPhase('exit')
    sessionStorage.setItem('bazzar_notif_dismissed', 'true')
    setTimeout(() => setPhase('hidden'), 400)
  }

  if (phase === 'hidden') return null

  const isVisible = phase === 'visible'

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 'clamp(80px, 12vh, 100px)',
          left: '50%',
          zIndex: 1000,
          width: 'calc(100% - 24px)',
          maxWidth: 380,
          pointerEvents: phase === 'exit' ? 'none' : 'auto',
          transform: `translateX(-50%) translateY(${isVisible ? '0' : '24px'}) scale(${isVisible ? 1 : 0.96})`,
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s ease',
        }}
      >
        <div style={{
          background: 'rgba(44, 44, 46, 0.82)',
          backdropFilter: 'blur(40px) saturate(190%)',
          WebkitBackdropFilter: 'blur(40px) saturate(190%)',
          border: '0.5px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 22,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.06)',
        }}>
          {/* App icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
          }}>
            {/* Lightning bolt — matches favicon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L14 2H13Z" fill="#fff" />
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 600, color: '#fff',
              letterSpacing: '-0.2px', lineHeight: 1.25,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {t('bazzar.notif.title')}
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.3, marginTop: 2,
            }}>
              bazzar-serts.shop
            </div>
          </div>

          {/* Action */}
          <a
            href="https://www.bazzar-serts.shop/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              color: '#fff',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.1px',
              padding: '7px 14px',
              borderRadius: 100,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              transition: 'background 0.2s',
            }}
          >
            {t('bazzar.notif.btn')}
            <ExternalLink size={12} strokeWidth={2.5} />
          </a>

          {/* Close */}
          <button
            onClick={dismiss}
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(60, 60, 60, 0.95)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transition: 'opacity 0.2s',
            }}
          >
            <X size={11} strokeWidth={3} />
          </button>
        </div>
      </div>
    </>
  )
}
