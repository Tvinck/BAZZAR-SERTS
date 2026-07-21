import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Shield, Zap, Clock, Heart, Check, ArrowRight, Truck, RefreshCcw, Headphones, Flame, Sparkles, Tag, Gift, TrendingUp, CreditCard, Smartphone, ShieldAlert } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { ShareButtons } from '../components/ShareButtons'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useI18n } from '../hooks/useI18n'
import { sanitizeEmail } from '../lib/sanitize'
import { supabase } from '../lib/supabase'
import { getDeviceDisplayName } from '../lib/device-models'

export function Product() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const reviews = [
    { id: 1, name: t('product.review1.name'), avatar: 'АС', rating: 5, text: t('product.review1.text'), date: t('product.review1.date') },
    { id: 2, name: t('product.review2.name'), avatar: 'МК', rating: 5, text: t('product.review2.text'), date: t('product.review2.date') },
    { id: 3, name: t('product.review3.name'), avatar: 'ДА', rating: 5, text: t('product.review3.text'), date: t('product.review3.date') },
  ]

  const { id } = useParams<{ id: string }>()
  const { product, related, loading: productLoading } = useProduct(id)
  usePageTitle(product?.title || t('product.notFound'))
  const [selectedDenom, setSelectedDenom] = useState('standard')
  const [dbTiers, setDbTiers] = useState<{ id: string; label: string; days: string; price: number; desc: string }[] | null>(null)
  const [telegram, setTelegram] = useState('')
  const [promo, setPromo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card')
  const [email, setEmail] = useState('')
  const [paying, setPaying] = useState(false)
  const [showRegModal, setShowRegModal] = useState(false)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('desc')
  const { viewed, addViewed } = useRecentlyViewed()

  // Device selection for purchase
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [showDeviceConfirm, setShowDeviceConfirm] = useState(false)
  const [userDevices, setUserDevices] = useState<{ id: string; device_udid: string; model: string; display_name: string }[]>([])
  const [selectedDeviceUdid, setSelectedDeviceUdid] = useState('')
  const [selectedDeviceModel, setSelectedDeviceModel] = useState('')

  const TABS = [
    { id: 'desc', label: t('tab.desc') },
    { id: 'specs', label: t('tab.specs') },
    { id: 'delivery', label: t('tab.delivery') },
    { id: 'reviews', label: t('tab.reviews') },
  ]

  // Фолбэк-тарифы (если у товара нет вариантов в БД)
  const DENOMINATIONS = [
    { id: 'basic', label: t('tier.basic.label'), days: t('tier.basic.days'), price: 390, desc: t('tier.basic.desc') },
    { id: 'standard', label: t('tier.standard.label'), days: t('tier.standard.days'), price: 890, desc: t('tier.standard.desc') },
    { id: 'vip', label: t('tier.vip.label'), days: t('tier.vip.days'), price: 1490, desc: t('tier.vip.desc') },
  ]
  // Тарифы: из БД (управляются в Connect → Каталог 2.0 → Варианты) или фолбэк.
  const tiers = dbTiers && dbTiers.length ? dbTiers : DENOMINATIONS

  // Трекать просмотр
  useEffect(() => {
    if (product) addViewed(product.id)
  }, [product?.id])

  // Подтягиваем варианты тарифов товара из БД (безопасный эндпоинт без себестоимости)
  useEffect(() => {
    if (!product?.id || product.category !== 'certs') return
    let mounted = true
    fetch(`/api/variants?productId=${product.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted || !Array.isArray(d?.variants) || d.variants.length === 0) return
        const mapped = d.variants.map((v: { id: string; name: string; guarantee_months: number; price: number }) => ({
          id: v.id, label: v.name, days: `${v.guarantee_months} мес`, price: v.price, desc: '',
        }))
        setDbTiers(mapped)
        setSelectedDenom(mapped[0].id)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [product?.id])

  // Payment function — called after device selection
  const proceedToPayment = async (targetUdid: string) => {
    if (telegram.trim()) localStorage.setItem('bazzar_contact', telegram.trim())
    if (promo.trim()) localStorage.setItem('bazzar_promo', promo.trim())
    const cleanEmail = sanitizeEmail(email)
    if (cleanEmail) localStorage.setItem('bazzar_email', cleanEmail)

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      alert('Укажите корректный email — на него придёт чек.')
      return
    }

    setPaying(true)
    setShowDeviceConfirm(false)
    setShowDeviceModal(false)
    try {
      const res = await fetch('https://connect-4va6.vercel.app/api/shop/tbank/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentPrice,
          description: product?.title || 'Сертификат Apple',
          email: email.trim(),
          telegram: telegram.trim() || undefined,
          udid: targetUdid,
          paymentMethod,
          returnUrl: `${window.location.origin}/cabinet?tab=orders`,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success && json.paymentUrl) {
        window.location.href = json.paymentUrl
      } else {
        alert(json.error || 'Не удалось создать платёж. Попробуйте позже.')
        setPaying(false)
      }
    } catch {
      alert('Ошибка сети. Попробуйте позже.')
      setPaying(false)
    }
  }

  if (productLoading) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--surface-2)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-3)' }}>{t('general.loading')}</p>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <Shield size={48} style={{ color: 'var(--text-3)', marginBottom: 16 }} />
          <h2 style={{ marginTop: 16 }}>{t('product.notFound')}</h2>
          <p style={{ color: 'var(--text-3)', margin: '8px 0 24px', fontSize: '0.9rem' }}>{t('product.notFoundDesc')}</p>
          <Link to="/catalog" className="btn btn-gradient" style={{ gap: 6 }}>{t('nav.catalog')} <ArrowRight size={16} /></Link>
        </div>
      </section>
    )
  }

  const isCert = product.category === 'certs'
  const currentPrice = isCert
    ? tiers.find(d => d.id === selectedDenom)?.price || product.price
    : product.price

  // Похожие товары (из хука)
  const similar = related.slice(0, 4)

  return (
    <section className="section" style={{ paddingTop: 'clamp(80px, 10vw, 100px)' }}>
      <div className="container">
        {/* Хлебные крошки */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-6)', fontSize: '0.82rem', flexWrap: 'wrap' }}
        >
          <Link to="/" style={{ color: 'var(--text-3)', transition: 'color 200ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>
            {t('general.home')}
          </Link>
          <span style={{ color: 'var(--text-3)' }}>›</span>
          <Link to="/catalog" style={{ color: 'var(--text-3)', transition: 'color 200ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>
            {t('nav.catalog')}
          </Link>
          <span style={{ color: 'var(--text-3)' }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>{product.title}</span>
        </motion.div>

        <style>{`
          @media (min-width: 769px) {
            .product-grid { grid-template-columns: 1fr 400px !important; }
          }
        `}</style>

        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--sp-6)',
          alignItems: 'start',
        }}>
          {/* ══ ЛЕВАЯ КОЛОНКА ══ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Баннер с иконкой */}
            <div className="card" style={{
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: product.image
                ? `url(${product.image}) center/cover no-repeat`
                : product.grad || `radial-gradient(circle at 50% 60%, #a78bfa18 0%, var(--surface-2) 70%)`,
              marginBottom: 'var(--sp-6)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Декоративные кольца */}
              {!product.image && (
                <>
                  <div style={{
                    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                    border: '1px solid rgba(167,139,250,0.08)', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }} />
                  <div style={{
                    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                    border: '1px solid rgba(167,139,250,0.04)', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }} />
                </>
              )}

              {!product.image && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: 100, height: 100, borderRadius: 'var(--r-xl)',
                    background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 1,
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>{product.emoji || '🛍️'}</span>
                </motion.div>
              )}

              <button
                onClick={() => setLiked(!liked)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: liked ? '#ff2121' : 'var(--text-3)',
                  transition: 'all 200ms', zIndex: 2,
                }}
              >
                <Heart size={18} fill={liked ? '#ff2121' : 'none'} />
              </button>
              {product.badge && (
                <span className={`badge badge-${product.badge}`} style={{ position: 'absolute', top: 14, left: 14, zIndex: 2 }}>
                  {product.badge === 'hot' && <><Flame size={12} /> {t('badge.hot')}</>}
                  {product.badge === 'new' && <><Sparkles size={12} /> {t('badge.new')}</>}
                  {product.badge === 'sale' && <><Tag size={12} /> {t('badge.sale')}</>}
                  {product.badge === 'popular' && <><TrendingUp size={12} /> {t('badge.popular')}</>}
                  {product.badge === 'free' && <><Gift size={12} /> {t('badge.free')}</>}
                </span>
              )}
            </div>

            {/* Заголовок + рейтинг */}
            <div style={{ marginBottom: 'var(--sp-6)' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', marginBottom: 8, lineHeight: 1.2 }}>
                {product.title}
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: 'var(--sp-4)' }}>
                {product.subtitle}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating) ? '#fcab14' : 'transparent'} stroke={s <= Math.round(product.rating) ? '#fcab14' : 'var(--text-3)'} />
                  ))}
                  <span style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 700, marginLeft: 4 }}>{product.rating}</span>
                </div>
                <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{product.sold.toLocaleString('ru-RU')} {t('product.sales')}</span>
                <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>{t('product.inStock')}</span>
              </div>

              {/* Поделиться */}
              <div style={{ marginTop: 'var(--sp-3)' }}>
                <ShareButtons
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={product.title}
                />
              </div>
            </div>

            {/* Табы */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600,
                    color: activeTab === tab.id ? '#fff' : 'var(--text-3)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 200ms', marginBottom: -1,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Содержимое табов */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === 'desc' && (
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                    {product.subtitle}
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {[
                    [t('spec.category'), product.category === 'certs' ? t('spec.category.cert') : product.category === 'apps' ? t('spec.category.app') : t('spec.category.util')],
                    [t('spec.delivery'), product.delivery],
                    [t('spec.rating'), `${product.rating} / 5.0`],
                    [t('spec.sales'), product.sold.toLocaleString('ru-RU')],
                    [t('spec.compatibility'), 'iOS 15+, iPhone / iPad'],
                    [t('spec.guarantee'), t('spec.guaranteeValue')],
                  ].map(([label, value], i) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 20px', fontSize: '0.88rem',
                      borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ color: 'var(--text-3)' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {[
                    { icon: <Truck size={20} />, title: t('delivery.instant.title'), desc: t('delivery.instant.desc'), color: 'var(--accent)' },
                    { icon: <RefreshCcw size={20} />, title: t('delivery.guarantee.title'), desc: t('delivery.guarantee.desc'), color: 'var(--success)' },
                    { icon: <Headphones size={20} />, title: t('delivery.support.title'), desc: t('delivery.support.desc'), color: '#25a2e0' },
                  ].map(item => (
                    <div key={item.title} className="card" style={{ padding: 'var(--sp-5)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
                        background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: item.color,
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {reviews.slice(0, 3).map(r => (
                    <div key={r.id} className="card" style={{ padding: 'var(--sp-5)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                        }}>{r.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.name}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{r.date}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={12} fill={s <= r.rating ? '#fcab14' : 'transparent'} stroke={s <= r.rating ? '#fcab14' : 'var(--text-3)'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* ══ ПРАВАЯ КОЛОНКА — ПОКУПКА (sticky) ══ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ position: 'sticky', top: 80 }}
          >
            <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {/* Цена крупно */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>
                  {currentPrice === 0 ? t('product.free') : `${currentPrice} ₽`}
                </span>
                {product.old_price && (
                  <span style={{ fontSize: '1rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>
                    {product.old_price} ₽
                  </span>
                )}
              </div>

              {/* Тарифы для сертификатов */}
              {isCert && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('product.chooseTier')}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tiers.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDenom(d.id)}
                        style={{
                          padding: '14px 16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderRadius: 'var(--r-md)',
                          border: `1px solid ${selectedDenom === d.id ? 'var(--accent)' : 'var(--border)'}`,
                          background: selectedDenom === d.id ? 'rgba(149,51,255,0.08)' : 'var(--surface-2)',
                          transition: 'all 200ms',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: `2px solid ${selectedDenom === d.id ? 'var(--accent)' : 'var(--text-3)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 200ms',
                          }}>
                            {selectedDenom === d.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{d.label}</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{d.days} · {d.desc}</p>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{d.price} ₽</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Способ оплаты */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Способ оплаты
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'card' as const, name: 'Картой', icon: <CreditCard size={16} /> },
                    { id: 'sbp' as const, name: 'СБП', icon: <Smartphone size={16} /> },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 'var(--r-md)',
                        border: `1.5px solid ${paymentMethod === m.id ? 'var(--accent)' : 'var(--border)'}`,
                        background: paymentMethod === m.id ? 'rgba(149,51,255,0.08)' : 'var(--surface-2)',
                        color: paymentMethod === m.id ? 'var(--text)' : 'var(--text-2)',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 200ms',
                      }}
                    >
                      {m.icon}
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telegram */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('product.telegram')} <span style={{ fontWeight: 400, opacity: 0.6 }}>{t('product.telegramOptional')}</span>
                </label>
                <input className="field" type="text" placeholder="@username" value={telegram}
                  onChange={(e) => setTelegram(e.target.value)} style={{ borderRadius: 'var(--r-md)' }} />
              </div>

              {/* Email для чека */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Email для чека
                </label>
                <input className="field" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} style={{ borderRadius: 'var(--r-md)' }} />
              </div>

              {/* Промокод */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('product.promo')}
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="field" type="text" placeholder="BAZZAR2024" value={promo}
                    onChange={(e) => setPromo(e.target.value)} style={{ flex: 1, borderRadius: 'var(--r-md)' }} />
                  <button className="btn btn-soft" style={{ padding: '12px 16px', borderRadius: 'var(--r-md)' }}>OK</button>
                </div>
              </div>

              {/* CTA кнопка */}
              <button className="btn btn-gradient" disabled={paying} onClick={async () => {
                // Проверка регистрации — нужен UDID
                const currentUdid = localStorage.getItem('apple_udid')
                if (!currentUdid) {
                  setShowRegModal(true)
                  return
                }

                // Load devices and show selection modal
                try {
                  const { data: devicesData } = await supabase
                    .from('bazzar_devices')
                    .select('*')
                    .eq('owner_udid', currentUdid)
                    .order('created_at', { ascending: true })
                  const devicesList = devicesData || []
                  if (devicesList.length > 1) {
                    setUserDevices(devicesList)
                    setSelectedDeviceUdid(currentUdid)
                    setShowDeviceModal(true)
                    return
                  }
                  // Single device or no devices in table — show confirmation
                  const targetUdid = devicesList.length === 1 ? devicesList[0].device_udid : currentUdid
                  const targetModel = devicesList.length === 1 ? getDeviceDisplayName(devicesList[0].model) : (localStorage.getItem('apple_device_model') || 'Apple устройство')
                  setUserDevices(devicesList)
                  setSelectedDeviceUdid(targetUdid)
                  setSelectedDeviceModel(targetModel)
                  setShowDeviceConfirm(true)
                } catch {
                  // Fallback — proceed with current UDID
                  proceedToPayment(currentUdid)
                }
              }} style={{
                width: '100%', padding: '16px 0', fontSize: '1.05rem', fontWeight: 800,
                borderRadius: 'var(--r-md)', marginTop: 4,
                opacity: paying ? 0.6 : 1,
              }}>
                {paying ? 'Переходим к оплате…' : currentPrice === 0 ? t('product.installFree') : `${t('product.buyFor')} ${currentPrice} ₽`}
              </button>

              {/* Гарантии */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
                {[
                  { icon: <Shield size={15} />, text: t('guarantee.replacement') },
                  { icon: <Zap size={15} />, text: t('guarantee.instant') },
                  { icon: <Clock size={15} />, text: t('guarantee.support') },
                  { icon: <Check size={15} />, text: t('guarantee.payment') },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--success)' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══ ПОХОЖИЕ ТОВАРЫ ══ */}
        {similar.length > 0 && (
          <div style={{ marginTop: 'var(--sp-10)' }}>
            <div className="section-head">
              <h2>{t('product.similar')}</h2>
              <Link to={`/catalog?category=${product.category}`} className="btn btn-ghost" style={{ fontSize: '0.82rem', gap: 4 }}>
                {t('product.allInCategory')} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid-products">
              {similar.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
        {/* Недавно просмотренные */}
        {(() => {
          const recentProducts = viewed
            .filter(vid => vid !== product.id)
            .map(vid => similar.find((p: any) => p.id === vid) || related.find((p: any) => p.id === vid))
            .filter(Boolean)
            .slice(0, 4)
          if (recentProducts.length === 0) return null
          return (
            <div style={{ marginTop: 'var(--sp-10)' }}>
              <div className="section-head">
                <h2>{t('product.recent')}</h2>
              </div>
              <div className="grid-products">
                {recentProducts.map((p, i) => <ProductCard key={p!.id} product={p!} index={i} />)}
              </div>
            </div>
          )
        })()}
      </div>
      {/* Device confirmation modal (1 device) */}
      <AnimatePresence>
        {showDeviceConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeviceConfirm(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', maxWidth: 400, width: '100%', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'rgba(149,51,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Подтвердите устройство</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Сертификат будет оформлен на:</p>
                </div>
              </div>

              <div style={{
                padding: '16px', borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 20,
              }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{selectedDeviceModel}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                  UDID: {selectedDeviceUdid}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-gradient" onClick={() => proceedToPayment(selectedDeviceUdid)}
                  style={{ flex: 1, padding: '14px 0', borderRadius: 'var(--r-md)', fontWeight: 700 }}>
                  <Check size={16} /> Да, оформить
                </button>
                <button className="btn btn-ghost" onClick={() => { setShowDeviceConfirm(false); navigate('/cabinet?tab=devices') }}
                  style={{ padding: '14px 16px', borderRadius: 'var(--r-md)', fontSize: '0.82rem' }}>
                  + Другое
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device selection modal (multiple devices) */}
      <AnimatePresence>
        {showDeviceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeviceModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)', maxWidth: 420, width: '100%', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>Выберите устройство</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 20 }}>
                На какое устройство оформить сертификат?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {userDevices.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDeviceUdid(d.device_udid)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                      background: selectedDeviceUdid === d.device_udid ? 'rgba(149,51,255,0.08)' : 'var(--surface-2)',
                      border: `2px solid ${selectedDeviceUdid === d.device_udid ? 'var(--accent)' : 'var(--border)'}`,
                      transition: 'all 150ms',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${selectedDeviceUdid === d.device_udid ? 'var(--accent)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {selectedDeviceUdid === d.device_udid && (
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{getDeviceDisplayName(d.model)}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                        {d.device_udid.slice(0, 12)}...{d.device_udid.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-gradient" onClick={() => proceedToPayment(selectedDeviceUdid)}
                  style={{ flex: 1, padding: '14px 0', borderRadius: 'var(--r-md)', fontWeight: 700 }}>
                  Выбрать
                </button>
                <button className="btn btn-ghost" onClick={() => { setShowDeviceModal(false); navigate('/cabinet?tab=devices') }}
                  style={{ padding: '14px 16px', borderRadius: 'var(--r-md)', fontSize: '0.82rem' }}>
                  + Добавить новое
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно регистрации */}
      <AnimatePresence>
        {showRegModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegModal(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                position: 'fixed', zIndex: 2001,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 'min(400px, 90vw)',
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}
            >
              {/* Иконка-хедер */}
              <div style={{
                padding: '32px 24px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 'var(--r-lg)',
                  background: 'linear-gradient(135deg, rgba(149,51,255,0.15), rgba(6,182,212,0.15))',
                  border: '1px solid rgba(149,51,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShieldAlert size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                  fontWeight: 800, color: 'var(--text)', textAlign: 'center',
                  letterSpacing: '-0.02em',
                }}>
                  Нужна регистрация
                </h3>
              </div>

              {/* Контент */}
              <div style={{ padding: '16px 24px 8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Для покупки необходимо привязать ваше Apple-устройство. Это займёт <strong style={{ color: 'var(--text)' }}>30 секунд</strong> — установите профиль, и мы автоматически определим ваш UDID.
                </p>
              </div>

              {/* Шаги */}
              <div style={{
                padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {[
                  { num: '1', text: 'Откройте страницу с iPhone / iPad' },
                  { num: '2', text: 'Установите профиль конфигурации' },
                  { num: '3', text: 'Вернитесь и оплатите покупку' },
                ].map(step => (
                  <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--r-full)',
                      background: 'rgba(149,51,255,0.12)', border: '1px solid rgba(149,51,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                    }}>{step.num}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{step.text}</span>
                  </div>
                ))}
              </div>

              {/* Кнопки */}
              <div style={{ padding: '8px 24px 24px', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowRegModal(false)}
                  className="btn btn-soft"
                  style={{ flex: 1, padding: '14px 0', borderRadius: 'var(--r-md)', fontSize: '0.9rem' }}
                >
                  Позже
                </button>
                <button
                  onClick={() => { setShowRegModal(false); navigate('/cabinet') }}
                  className="btn btn-gradient"
                  style={{ flex: 2, padding: '14px 0', borderRadius: 'var(--r-md)', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  Зарегистрироваться
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
