import { useState } from 'react'
import { Send, Share2, Link2, Check } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   ShareButtons — Telegram, VK, Скопировать ссылку
   ═══════════════════════════════════════════════════════════ */

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 'var(--r-full)',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    color: 'var(--text-2)',
    fontSize: '0.78rem',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    textDecoration: 'none',
    transition: 'all 200ms var(--ease)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.background = 'rgba(149,51,255,0.1)'
    el.style.borderColor = 'rgba(149,51,255,0.3)'
    el.style.color = '#fff'
    el.style.transform = 'translateY(-1px)'
  }

  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.background = 'rgba(255,255,255,0.04)'
    el.style.borderColor = 'var(--border)'
    el.style.color = 'var(--text-2)'
    el.style.transform = 'translateY(0)'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {/* Telegram */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={pillStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <Send size={13} />
        Telegram
      </a>

      {/* VK */}
      <a
        href={vkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={pillStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <Share2 size={13} />
        VK
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        style={{
          ...pillStyle,
          ...(copied ? {
            background: 'rgba(59, 179, 59, 0.1)',
            borderColor: 'rgba(59, 179, 59, 0.3)',
            color: '#3bb33b',
          } : {}),
        }}
        onMouseEnter={!copied ? hoverIn : undefined}
        onMouseLeave={!copied ? hoverOut : undefined}
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? 'Скопировано!' : 'Ссылка'}
      </button>
    </div>
  )
}
