import { useState } from 'react'
import { Compass, Copy, Check } from 'lucide-react'
import { profileNeedsSafari } from '../lib/browser'

/* ═══════════════════════════════════════════════════════════
   SafariHint — предупреждение «откройте в Safari».
   Показывается только когда текущий браузер не сможет установить
   профиль UDID (встроенный браузер Telegram/GGSel/соцсетей или
   Chrome/Firefox на iOS). Иначе не рендерит ничего.
   ═══════════════════════════════════════════════════════════ */

export function SafariHint() {
  const [copied, setCopied] = useState(false)
  // Вычисляем один раз при монтировании — UA в течение сессии не меняется
  const [needsSafari] = useState(() => profileNeedsSafari())

  if (!needsSafari) return null

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '14px 16px', marginBottom: 20, textAlign: 'left',
        background: 'rgba(245,158,11,0.10)',
        border: '1px solid rgba(245,158,11,0.30)',
        borderRadius: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Compass size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>
            Откройте страницу в Safari
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
            Профиль устройства устанавливается только в браузере <b>Safari</b>. Во встроенном
            браузере (Telegram, соцсети) или в Chrome установка не сработает. Скопируйте ссылку
            и откройте её в Safari.
          </div>
        </div>
      </div>
      <button
        onClick={copyLink}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 'var(--r-full, 999px)',
          background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
          color: copied ? '#22C55E' : '#f59e0b',
          fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        {copied ? <><Check size={14} /> Ссылка скопирована</> : <><Copy size={14} /> Скопировать ссылку</>}
      </button>
    </div>
  )
}
