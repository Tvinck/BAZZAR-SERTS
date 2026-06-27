import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { StarIcon, BoltIcon, ShieldIcon, ChevronRightIcon, MinusIcon, PlusIcon, HeartIcon, VerifyIcon } from '../ui/Icons'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../hooks/useCart'

export function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    // Fetch current product
    supabase.from('bazzar_products').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setProduct(data)
        // Fetch related products
        supabase.from('bazzar_products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .eq('active', true)
          .limit(5)
          .then(({ data: relData }) => {
            setRelated(relData || [])
          })
          
        // Fetch reviews
        supabase.from('bazzar_reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .then(({ data: revData }) => {
            setReviews(revData || [])
            setLoading(false)
          })
      } else {
        navigate('/catalog') // not found
      }
    })
  }, [id, navigate])

  const isCert = product?.category === 'certs'
  const denominations = isCert ? [
    { label: 'Базовый (40 дней)', price: 400 }, 
    { label: 'Продвинутый (180 дней)', price: 990 }, 
    { label: 'VIP (330 дней)', price: 1490 }
  ] : [
    { label: 'Базовый', mult: 1 }, { label: 'Стандарт', mult: 2.6 }, { label: 'Премиум', mult: 5.1 }, { label: 'Мега', mult: 9.4 }
  ]
  const [denom, setDenom] = useState(0)
  const [qty, setQty] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  
  if (loading || !product) {
    return <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-3)' }}>Загрузка...</div>
  }

  const unit = product.price > 0 
    ? (isCert ? denominations[denom].price : Math.round(product.price * (denominations[denom].mult || 1))) 
    : 0
  const total = unit * qty

  return (
    <div style={{ position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '28px 0 60px' }}>
        {/* Хлебные крошки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 22 }}>
          <Link to="/" style={{ color: 'var(--text-3)' }}>Главная</Link><ChevronRightIcon size={14} />
          <Link to="/catalog" style={{ color: 'var(--text-3)' }}>Каталог</Link><ChevronRightIcon size={14} />
          <span style={{ color: 'var(--text-2)' }}>{product.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 28, alignItems: 'start' }} className="prod-grid">
          {/* Левая часть */}
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="card" style={{ position: 'relative', height: 320, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {product.image ? (
                <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              ) : (
                <span style={{ fontSize: '7rem', zIndex: 1 }}>{product.emoji || '🛍️'}</span>
              )}
              {product.badge && <span className="badge badge-hot" style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>🔥 Хит продаж</span>}
            </motion.div>

            {/* Описание */}
            <div className="card" style={{ padding: 24, marginTop: 18 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>Описание</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>
                {product.title} — {product.subtitle.toLowerCase()}. Товар выдаётся автоматически сразу после оплаты: вы получите код или данные в личном кабинете и на email.
                Гарантия активации и быстрая поддержка в чате 24/7. Подходит для аккаунтов любого региона.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginTop: 18 }}>
                {[['Платформа', 'Все регионы'], ['Тип', 'Цифровой код'], ['Выдача', product.delivery], ['Гарантия', product.warranty || 'Без гарантии']].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Отзывы */}
            <div className="card" style={{ padding: 24, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem' }}>Отзывы</h3>
                <span className="chip"><span style={{ color: product.rating > 0 ? '#fbbf24' : 'var(--text-3)', display: 'inline-flex' }}><StarIcon size={13} /></span> {product.rating > 0 ? product.rating.toFixed(1) : 'Новый'} {product.sold > 0 ? `· ${Math.round(product.sold / 18)} оценок` : ''}</span>
              </div>
              
              {reviews.length > 0 ? reviews.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderTop: '1px solid var(--hair)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--bg)', flexShrink: 0 }}>{(r.author || 'A')[0]}</div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.author || 'Пользователь'}</span><span style={{ display: 'flex', gap: 1, color: '#fbbf24' }}>{Array.from({ length: r.rating || 5 }).map((_, i) => <StarIcon key={i} size={11} />)}</span></div>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', marginTop: 4 }}>{r.text}</p>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--text-3)', fontSize: '0.9rem', padding: '10px 0' }}>Пока нет отзывов. Станьте первым!</div>
              )}
            </div>
          </div>

          {/* Правая часть — покупка (sticky) */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: 24 }}>
              <h1 style={{ fontSize: '1.5rem' }}>{product.title}</h1>
              <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{product.subtitle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '12px 0 20px', fontSize: '0.84rem', color: 'var(--text-2)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: product.rating > 0 ? '#fbbf24' : 'var(--text-3)' }}><StarIcon size={14} /> <span style={{ color: 'var(--text-2)' }}>{product.rating > 0 ? product.rating.toFixed(1) : 'Новый'}</span></span>
                <span style={{ color: 'var(--text-3)' }}>{product.sold > 0 ? `${product.sold.toLocaleString('ru-RU')} продаж` : 'Пока нет продаж'}</span>
              </div>

              {/* Номиналы */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 9 }}>Выберите номинал</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 18 }}>
                {denominations.map((d, i) => (
                  <button key={d.label} onClick={() => setDenom(i)}
                    style={{ padding: '11px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', border: `1px solid ${denom === i ? 'var(--text)' : 'var(--hair)'}`, background: denom === i ? 'var(--text)' : 'var(--surface-2)', color: denom === i ? 'var(--bg)' : 'var(--text)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{d.label}</div>
                    <div style={{ fontSize: '0.8rem', color: denom === i ? 'var(--bg)' : 'var(--text-3)' }}>{(isCert ? d.price : Math.round(product.price * (d.mult || 1))).toLocaleString('ru-RU')} ₽</div>
                  </button>
                ))}
              </div>

              {/* Количество */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-2)' }}>Количество</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)', borderRadius: 11, padding: 5 }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn}><MinusIcon size={16} /></button>
                  <span style={{ fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={qtyBtn}><PlusIcon size={16} /></button>
                </div>
              </div>

              {/* Итого */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)', marginBottom: 18 }}>
                <span style={{ color: 'var(--text-2)' }}>Итого</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>{total.toLocaleString('ru-RU')} ₽</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button 
                  whileHover={{ y: -1 }} 
                  whileTap={{ scale: 0.97 }} 
                  className="btn btn-primary" 
                  style={{ flex: 1, height: 52 }} 
                  onClick={() => {
                    addItem({ 
                      ...product, 
                      title: isCert ? `${product.title} - ${denominations[denom].label}` : product.title,
                      price: unit, 
                      qty 
                    });
                    navigate('/cart');
                  }}
                >
                  Купить сейчас
                </motion.button>
                <button onClick={() => setIsFavorite(!isFavorite)} className="btn btn-ghost" style={{ width: 52, height: 52, padding: 0, color: isFavorite ? 'var(--red)' : 'var(--text)' }} aria-label="В избранное">
                  <HeartIcon size={19} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                <Row icon={<span style={{ color: 'var(--green)', display: 'flex' }}><BoltIcon size={16} /></span>} text={<>Выдача: <b>{product.delivery}</b></>} />
                <Row icon={<span style={{ color: 'var(--cyan)', display: 'flex' }}><ShieldIcon size={16} /></span>} text={product.warranty ? `Гарантия: ${product.warranty}` : "Без гарантии"} />
                <Row icon={<span style={{ color: 'var(--violet)', display: 'flex' }}><VerifyIcon size={16} /></span>} text="Официально от BAZZAR" />
              </div>
            </div>
          </div>
        </div>

        {/* Похожее */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 className="section-title" style={{ marginBottom: 22 }}>Похожие товары</h2>
            <div className="grid-products">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
      </div>
      <style>{`@media (max-width:880px){ .prod-grid{ grid-template-columns:1fr !important } }`}</style>
    </div>
  )
}

const qtyBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--elevated)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }

function Row({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.86rem', color: 'var(--text-2)' }}>{icon}{text}</div>
}
