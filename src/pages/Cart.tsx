import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { TrashIcon, MinusIcon, PlusIcon, TagIcon, ShieldIcon, CartIcon } from '../ui/Icons'
import { PaymentModal } from '../components/PaymentModal'
import { trackEvent } from '../lib/analytics'
import { supabase } from '../lib/supabase'

export function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  
  useEffect(() => {
    // Demo: prefill cart with 2 products
    supabase.from('bazzar_products').select('*').limit(2).then(({ data }) => {
      if (data) {
        setItems(data.map(p => ({ ...p, qty: 1 })))
      }
    })
  }, [])
  const [promo, setPromo] = useState('')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const setQty = (id: string, d: number) => setItems(its => its.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i))
  const remove = (id: string) => setItems(its => its.filter(i => i.id !== id))

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const total = subtotal
  const hasCert = items.some(i => i.category === 'certs')

  const handlePaymentSuccess = async () => {
    setIsPaymentOpen(false)
    setItems([]) // Clear cart
    
    // Analytics: track order
    trackEvent('orders')
    
    // Update user profile if logged in
    const udid = localStorage.getItem('apple_udid')
    if (udid) {
      const planName = items.length > 0 ? items[0].title : 'Неизвестно'
      await supabase.from('bazzar_users').update({
        status: 'bought',
        last_purchase: new Date().toISOString(),
        plan: planName
      }).eq('udid', udid)
    }
    
    navigate('/cabinet')
  }

  return (
    <div className="container" style={{ padding: '36px 0 60px' }}>
      <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginBottom: 24 }}>Корзина</h1>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-3)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CartIcon size={42} /></div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Здесь пока пусто</div>
          <p style={{ color: 'var(--text-3)', margin: '8px 0 20px' }}>Добавьте товары из каталога</p>
          <Link to="/catalog" className="btn btn-primary" style={{ display: 'inline-flex' }}>В каталог <ArrowRight size={15} /></Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }} className="cart-grid">
          {/* Список */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(i => (
              <div key={i.id} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 76, height: 76, borderRadius: 13, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {i.image ? <img src={i.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>{i.emoji}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{i.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{i.subtitle}</div>
                  <div style={{ fontWeight: 700, marginTop: 6 }}>{i.price.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 11, padding: 5 }}>
                  <button onClick={() => setQty(i.id, -1)} style={qBtn}><MinusIcon size={15} /></button>
                  <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{i.qty}</span>
                  <button onClick={() => setQty(i.id, 1)} style={qBtn}><PlusIcon size={15} /></button>
                </div>
                <button onClick={() => remove(i.id)} aria-label="Удалить" style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--hair)', background: 'transparent', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(255,84,112,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--hair)' }}>
                  <TrashIcon size={17} />
                </button>
              </div>
            ))}
          </div>

          {/* Итог */}
          <div className="card" style={{ padding: 22, position: 'sticky', top: 90 }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Ваш заказ</h3>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex' }}><TagIcon size={16} /></span>
              <input className="field" value={promo} onChange={e => setPromo(e.target.value)} placeholder="Промокод" style={{ paddingLeft: 38, paddingRight: 84, height: 46 }} />
              <button className="btn btn-soft" style={{ position: 'absolute', right: 6, top: 6, height: 34, padding: '0 14px' }}>OK</button>
            </div>
            {[['Товары', `${subtotal.toLocaleString('ru-RU')} ₽`], ['Скидка', '—']].map(([k, v], idx) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem', color: 'var(--text-2)' }}>
                <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0', marginTop: 6, borderTop: '1px solid var(--hair)' }}>
              <span style={{ color: 'var(--text-2)' }}>К оплате</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.7rem' }}>{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', height: 52 }} onClick={() => setIsPaymentOpen(true)}>Оформить заказ</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, fontSize: '0.8rem', color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--green)', display: 'flex' }}><ShieldIcon size={15} /></span> Безопасная оплата, мгновенная выдача
            </div>
          </div>
        </div>
      )}
      <style>{`@media (max-width:880px){ .cart-grid{ grid-template-columns:1fr !important } }`}</style>
      
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        hasCert={hasCert}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

const qBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--elevated)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
