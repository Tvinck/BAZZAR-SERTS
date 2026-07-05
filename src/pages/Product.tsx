import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { StarIcon, ShieldIcon, CheckIcon, VerifyIcon } from '../ui/Icons'
import { LegalModal, LegalType } from '../components/LegalModal'

const REVIEWS = [
  { id: 1, name: 'Алексей С.', text: 'Сертификат пришел моментально! Установил TikTok, все работает отлично, спасибо.', rating: 5, date: 'Сегодня' },
  { id: 2, name: 'Максим', text: 'Покупаю VIP уже второй раз. Первый отработал год без слетов. Очень доволен сервисом.', rating: 5, date: 'Вчера' },
  { id: 3, name: 'Даня', text: 'Сначала сомневался, но поддержка все объяснила. Установил Scarlet и Сбербанк. Топ!', rating: 5, date: '2 дня назад' }
]

export function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    supabase.from('bazzar_products').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setProduct(data)
      } else {
        navigate('/catalog')
      }
      setLoading(false)
    })
  }, [id, navigate])

  const isCert = product?.category === 'certs'
  
  // Имитация скидок (старая цена +25-40%)
  const denominations = isCert ? [
    { label: 'Базовый', price: 400, oldPrice: 690, discount: 42, warranty: '40 дней', image: '/cert_basic.png' }, 
    { label: 'Продвинутый', price: 990, oldPrice: 1650, discount: 40, warranty: '180 дней', image: '/cert_advanced.png' }, 
    { label: 'VIP', price: 1490, oldPrice: 2490, discount: 40, warranty: '330 дней', image: '/cert_vip.png' }
  ] : [
    { label: 'Базовый', mult: 1, discount: 15 }, { label: 'Стандарт', mult: 2.6, discount: 20 }, { label: 'Премиум', mult: 5.1, discount: 30 }, { label: 'Мега', mult: 9.4, discount: 40 }
  ]

  const [denom, setDenom] = useState(0)
  const [contact, setContact] = useState('')
  const [isContactValid, setIsContactValid] = useState(false)
  const [promo, setPromo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ggsel')
  const [legalModal, setLegalModal] = useState<LegalType>(null)

  if (loading || !product) {
    return <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-3)' }}>Загрузка...</div>
  }

  const selectedDenom: any = denominations[denom]
  
  const unit = product.price > 0 
    ? (isCert ? selectedDenom.price : Math.round(product.price * (selectedDenom.mult || 1))) 
    : 0

  const oldUnit = isCert && selectedDenom.oldPrice 
    ? selectedDenom.oldPrice 
    : Math.round(unit * (1 + (selectedDenom.discount || 0)/100))

  const handleBuy = () => {
    if (paymentMethod === 'ggsel') {
      window.location.href = '/success?uniquecode=GGSEL_MOCK_' + Math.floor(Math.random() * 1000000)
    } else {
      alert('В демо-режиме доступна только оплата GGSel')
    }
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero Header */}
      <div style={{ position: 'relative', height: 260, background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(40,40,40,1) 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 120, height: 120, borderRadius: 24, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            {product.image ? (
              <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '4rem' }}>{product.emoji || '🛍️'}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)' }}>{product.title}</h1>
            <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{product.subtitle}</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -20, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24 }} className="prod-grid">
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stats */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 0', textAlign: 'center', background: 'var(--surface-2)' }}>
              <div style={{ borderRight: '1px solid var(--hair)' }}>
                <div style={{ color: '#fbbf24', fontSize: '1.3rem', fontWeight: 800 }}>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Рейтинг</div>
              </div>
              <div>
                <div style={{ color: 'var(--text)', fontSize: '1.3rem', fontWeight: 800 }}>{product.sold > 0 ? `${(product.sold / 1000).toFixed(1)}K` : 'Новинка'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Продаж</div>
              </div>
            </div>

            {/* Input Data */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>Ваш Telegram для связи</span>
                <button onClick={() => alert('Откройте Telegram -> Настройки -> Имя пользователя. Скопируйте это имя (начинается с @).')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Где взять?</button>
              </div>
              <input 
                value={contact} 
                onChange={e => {
                  setContact(e.target.value)
                  if (e.target.value.length > 3 && isContactValid === false) setIsContactValid(true)
                  if (e.target.value.length <= 3 && isContactValid === true) setIsContactValid(false)
                }}
                placeholder="@username" 
                className="field" 
                style={{ height: 52, fontSize: '1.1rem' }} 
              />
              <button 
                onClick={() => setIsContactValid(!isContactValid)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: isContactValid ? 'var(--text)' : 'var(--text-3)', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${isContactValid ? 'var(--text)' : 'var(--text-3)'}`, background: isContactValid ? 'var(--text)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isContactValid && <span style={{ color: '#000', display: 'flex' }}><CheckIcon size={14} /></span>}
                </div>
                Я указал верный контакт
              </button>
            </div>

            {/* Denominations */}
            <div className="card" style={{ padding: '24px 24px 12px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Выберите номинал</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                {denominations.map((d, i) => (
                  <button key={i} onClick={() => setDenom(i)} style={{ 
                    textAlign: 'left', 
                    background: denom === i ? 'rgba(255, 255, 255, 0.06)' : 'var(--bg)',
                    border: `2px solid ${denom === i ? '#ffffff' : 'var(--hair)'}`,
                    borderRadius: 16, 
                    padding: 16, 
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    {denom === i && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#ffffff', color: '#000000', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Выбрано
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{d.label}</div>
                      {isCert && (
                        <div style={{ background: '#fbbf24', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                          + {d.warranty}
                        </div>
                      )}
                    </div>
                    {d.image && (
                      <div style={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '8px 0' }}>
                        <img src={d.image} alt={d.label} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 'auto' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{isCert ? d.price : Math.round(product.price * (d.mult || 1))} ₽</span>
                      {d.discount && (
                        <span style={{ background: 'var(--red)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, marginBottom: 3 }}>
                          -{d.discount}%
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', textDecoration: 'line-through', marginBottom: 3 }}>
                        {isCert ? d.oldPrice : Math.round((product.price * (d.mult || 1)) * (1 + d.discount/100))} ₽
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card" style={{ padding: 24, marginTop: 16 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Отзывы покупателей</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {REVIEWS.map(r => (
                  <div key={r.id} style={{ borderBottom: r.id !== REVIEWS.length ? '1px solid var(--hair)' : 'none', paddingBottom: r.id !== REVIEWS.length ? 16 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{r.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{r.date}</span>
                    </div>
                    <div style={{ display: 'flex', color: '#fbbf24', marginBottom: 8 }}>
                      {[...Array(r.rating)].map((_, i) => <StarIcon key={i} size={14} />)}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
          {/* Right Column (Checkout) */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              {/* Product Info Mini */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--hair)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
                  {product.image ? <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '1.5rem', textAlign: 'center', lineHeight: '48px' }}>{product.emoji}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{product.title}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedDenom.label}</div>
                </div>
              </div>

              {/* Payment Methods */}
              <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Способ оплаты</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                {[
                  { id: 'ggsel', name: 'GGSel / Карта', badge: 'Выгодно' },
                  { id: 'sbp', name: 'СБП', mock: true }
                ].map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{ 
                      padding: '12px', borderRadius: 12, border: `1px solid ${paymentMethod === m.id ? 'var(--text)' : 'var(--hair)'}`, 
                      background: paymentMethod === m.id ? 'rgba(255, 255, 255, 0.06)' : 'var(--surface-2)',
                      color: paymentMethod === m.id ? 'var(--text)' : 'var(--text-2)',
                      fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', position: 'relative'
                    }}
                  >
                    {m.name}
                    {m.badge && <span style={{ position: 'absolute', top: -8, right: -4, background: 'var(--red)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 8 }}>{m.badge}</span>}
                  </button>
                ))}
              </div>

              {/* Promo */}
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Промокод" className="field" style={{ paddingRight: 50, height: 46 }} />
                <button className="btn btn-ghost" style={{ position: 'absolute', right: 4, top: 4, height: 38, padding: '0 12px' }}>OK</button>
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', color: 'var(--text-2)' }}>
                <span>Цена</span><span style={{ textDecoration: 'line-through', color: 'var(--text-3)' }}>{oldUnit.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', color: 'var(--text-2)' }}>
                <span>Выгода</span><span style={{ color: 'var(--red)', fontWeight: 600 }}>-{selectedDenom.discount}%</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0 0', marginTop: 8, borderTop: '1px solid var(--hair)' }}>
                <span style={{ color: 'var(--text)' }}>Итого</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>{unit.toLocaleString('ru-RU')} ₽</span>
              </div>

              {/* Buy Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuy}
                className="btn btn-primary" 
                style={{ width: '100%', height: 56, marginTop: 24, fontSize: '1.1rem' }}
              >
                Купить за {unit.toLocaleString('ru-RU')} ₽
              </motion.button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 12 }}>
                Нажимая «Купить», вы принимаете <br/>
                <button onClick={() => setLegalModal('terms')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Правила сервиса</button> и <button onClick={() => setLegalModal('disclaimer')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Договор оферты</button>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <div className="card" style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)' }}>
                <ShieldIcon size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>Безопасная<br/>покупка</span>
              </div>
              <div className="card" style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)' }}>
                <VerifyIcon size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>Мгновенная<br/>выдача</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  )
}
