import { useState } from 'react'
import { Send, Mail } from 'lucide-react'
import { Link } from '../ui/nav'
import { BazzarMark, BazzarWordmark, ShieldIcon } from '../ui/Icons'
import { LegalModal, LegalType } from './LegalModal'

export function Footer() {
  const [legalModal, setLegalModal] = useState<LegalType>(null)

  const cols = [
    { 
      h: 'Навигация', 
      items: [
        { label: 'Главная', path: '/' },
        { label: 'Каталог', path: '/catalog' },
        { label: 'Корзина', path: '/cart' },
        { label: 'Кабинет', path: '/cabinet' }
      ] 
    },
    { 
      h: 'Наши услуги', 
      items: [
        { label: 'Сертификат разработчика', path: '/catalog' },
        { label: 'Установка приложений', path: '/catalog' },
        { label: 'Прямые ссылки (IPA)', path: '/catalog' },
        { label: 'Поддержка клиентов', path: '/cabinet' }
      ] 
    },
    { 
      h: 'Правовая информация', 
      items: [
        { label: 'Пользовательское соглашение', type: 'terms' as LegalType },
        { label: 'Политика конфиденциальности', type: 'privacy' as LegalType },
        { label: 'Отказ от ответственности', type: 'disclaimer' as LegalType }
      ] 
    }
  ]
  return (
    <footer style={{ borderTop: '1px solid var(--hair)', background: 'var(--bg-2)', marginTop: 40, paddingBottom: '70px' }}>
      <div className="container" style={{ padding: '56px 0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <BazzarMark size={34} />
              <BazzarWordmark size="1.05rem" />
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: 260, lineHeight: 1.6 }}>
              Bazzar Certs — сервис для получения сертификата разработчика Apple и безопасной установки любых приложений на iOS без App Store.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <a href="https://t.me/bazzar_support" target="_blank" rel="noreferrer" aria-label="Telegram" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                <Send size={16} />
              </a>
              <a href="mailto:support@bazzar-serts.shop" aria-label="Email" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                <Mail size={16} />
              </a>
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', marginBottom: 14 }}>{c.h}</div>
              {c.items.map((i: any) => (
                i.path ? (
                  <Link key={i.label} to={i.path} style={{ display: 'block', marginBottom: 10, fontSize: '0.86rem', color: 'var(--text-3)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>{i.label}</Link>
                ) : (
                  <button key={i.label} onClick={() => setLegalModal(i.type)} style={{ display: 'block', marginBottom: 10, fontSize: '0.86rem', color: 'var(--text-3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>{i.label}</button>
                )
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, paddingTop: 22, borderTop: '1px solid var(--hair)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>© {new Date().getFullYear()} BAZZAR CERTS</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.82rem', color: 'var(--text-3)' }}>
            <span style={{ color: 'var(--green)', display: 'flex' }}><ShieldIcon size={15} /></span> Безопасная установка на iOS
          </span>
        </div>
      </div>
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </footer>
  )
}
