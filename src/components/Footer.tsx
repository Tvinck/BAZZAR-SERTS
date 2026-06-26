import { Send, Mail } from 'lucide-react'
import { Link } from '../ui/nav'
import { BazzarMark, BazzarWordmark, ShieldIcon } from '../ui/Icons'

export function Footer() {
  const cols = [
    { h: 'Каталог', items: ['Игровая валюта', 'Пополнение Steam', 'Подписки', 'Аккаунты', 'Аренда'] },
    { h: 'Покупателю', items: ['Как купить', 'Гарантии', 'Возврат', 'Отзывы', 'FAQ'] },
    { h: 'Компания', items: ['О BAZZAR', 'Стать продавцом', 'Контакты', 'Оферта', 'Конфиденциальность'] }
  ]
  return (
    <footer style={{ borderTop: '1px solid var(--hair)', background: 'var(--bg-2)', marginTop: 40 }}>
      <div className="container" style={{ padding: '56px 0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <BazzarMark size={34} />
              <BazzarWordmark size="1.05rem" />
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: 260, lineHeight: 1.6 }}>
              Маркетплейс цифровых товаров: игровая валюта, аккаунты, пополнения и подписки. Моментально и безопасно.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {[Send, Mail].map((Ic, i) => (
                <a key={i} href="#" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}><Ic size={16} /></a>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', marginBottom: 14 }}>{c.h}</div>
              {c.items.map(i => (
                <Link key={i} to="/catalog" style={{ display: 'block', marginBottom: 10, fontSize: '0.86rem', color: 'var(--text-3)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>{i}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, paddingTop: 22, borderTop: '1px solid var(--hair)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>© {new Date().getFullYear()} BAZZAR MARKET</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.82rem', color: 'var(--text-3)' }}>
            <span style={{ color: 'var(--green)', display: 'flex' }}><ShieldIcon size={15} /></span> Безопасные платежи и гарантия возврата
          </span>
        </div>
      </div>
    </footer>
  )
}
