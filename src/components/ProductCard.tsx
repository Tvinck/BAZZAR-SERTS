import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Flame, Sparkles, Tag, X, Smartphone, ShoppingBag, Download, Loader2, Check } from 'lucide-react'
import type { Product } from '../types'
import { useI18n } from '../hooks/useI18n'
import { useOwnedApps } from '../hooks/useOwnedApps'
import { installTarget } from '../lib/appInstall'

const API_BASE = 'https://connect-4va6.vercel.app'

interface Props {
  product: Product
  index?: number
  /** Автооткрытие покупки (возврат после регистрации: /catalog?...&buy=<id>) */
  autoStart?: boolean
}

export function ProductCard({ product, index = 0, autoStart = false }: Props) {
  const { t } = useI18n()
  const { owned, markOwned } = useOwnedApps()
  const accentColor = '#a78bfa'
  const isApp = product.category === 'apps'
  const [showModal, setShowModal] = useState(false)
  const [buying, setBuying] = useState(false)
  const [bought, setBought] = useState(false)
  const [email, setEmail] = useState(() => localStorage.getItem('bazzar_email') || '')

  const isPaid = isApp && product.price > 0
  const hasAccess = isApp && (!isPaid || owned.has(product.id) || bought) // можно устанавливать
  const install = installTarget(product.ipa_url)

  // Возврат после регистрации — сразу открываем оплату нужного приложения
  useEffect(() => {
    if (autoStart && isApp && isPaid && !hasAccess) setShowModal(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  // Бесплатное — фиксируем установку в кабинете (в фоне)
  const recordFree = () => {
    const uid = localStorage.getItem('apple_udid')
    if (!uid || isPaid) return
    fetch(`${API_BASE}/api/shop/app-purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: product.id, udid: uid }),
    }).catch(() => {})
  }

  // ── Purchase / Install handler ──
  const handlePurchase = async () => {
    const udid = localStorage.getItem('apple_udid')
    if (!udid) {
      setShowModal(true)
      return
    }

    if (isPaid && !email.trim()) {
      setShowModal(true)
      return
    }

    setBuying(true)
    try {
      const res = await fetch(`${API_BASE}/api/shop/app-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: product.id,
          udid,
          email: email.trim() || undefined,
        }),
      })
      const json = await res.json()

      if (json.alreadyOwned || json.free) {
        setBought(true)
        markOwned(product.id)
        return
      }

      if (json.paymentUrl) {
        localStorage.setItem('bazzar_email', email.trim())
        window.location.href = json.paymentUrl
        return
      }

      alert(json.error || 'Ошибка. Попробуйте позже.')
    } catch {
      alert('Ошибка сети. Попробуйте позже.')
    } finally {
      setBuying(false)
    }
  }

  const cardContent = (
    <div className="card card-hover" style={{
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Thumbnail */}
      <div style={{
        aspectRatio: '4/3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: product.image 
          ? `url(${product.image}) center/cover no-repeat`
          : product.grad || `radial-gradient(circle at 50% 60%, ${accentColor}12 0%, var(--surface-2) 70%)`,
        position: 'relative',
      }}>
        {!product.image && (
          <span style={{ fontSize: '3rem' }}>{product.emoji || '🛍️'}</span>
        )}

        {/* Badge */}
        {product.badge && (
          <span className={`badge badge-${product.badge}`} style={{ position: 'absolute', top: 10, left: 10 }}>
            {product.badge === 'hot' && <><Flame size={12} /> {t('badge.hot')}</>}
            {product.badge === 'new' && <><Sparkles size={12} /> {t('badge.new')}</>}
            {product.badge === 'sale' && <><Tag size={12} /> {t('badge.sale')}</>}
          </span>
        )}

        {/* App type indicator */}
        {isApp && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            padding: '3px 10px', borderRadius: 'var(--r-full)',
            background: 'rgba(149,51,255,0.85)', backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: '0.68rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Smartphone size={11} /> APP
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{
        padding: '14px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
      }}>
        <h3 style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {product.title}
        </h3>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.subtitle}
        </p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: 8 }}>
          <Star size={13} fill="#fcab14" stroke="#fcab14" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginLeft: 4 }}>{product.sold > 0 ? `${product.sold.toLocaleString('ru-RU')} ${t('product.sales')}` : t('badge.new')}</span>
        </div>

        {/* Price / Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
          {isApp ? (
            <div style={{ display: 'flex', gap: 6, width: '100%', alignItems: 'center' }}>
              {/* Статус: цена (не куплено) / Куплено / Бесплатно */}
              {isPaid && !hasAccess ? (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.92rem' }}>
                  {product.price} ₽
                </span>
              ) : isPaid ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Check size={12} /> Куплено
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6' }}>Бесплатно</span>
              )}

              {hasAccess ? (
                install.mode === 'none' ? (
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem',
                    padding: '5px 14px', borderRadius: 'var(--r-full)', marginLeft: 'auto',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-3, #888)',
                  }}>Скоро</span>
                ) : (
                  <a
                    href={install.href}
                    {...(install.mode === 'download' ? { download: true } : {})}
                    onClick={(e) => { e.stopPropagation(); recordFree() }}
                    style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem',
                      padding: '5px 14px', borderRadius: 'var(--r-full)', marginLeft: 'auto',
                      background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                      color: '#fff', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Download size={12} /> {install.label}
                  </a>
                )
              ) : (
                <span
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handlePurchase() }}
                  style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem',
                    padding: '5px 14px', borderRadius: 'var(--r-full)', marginLeft: 'auto',
                    background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                    color: '#fff', cursor: buying ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    opacity: buying ? 0.7 : 1, transition: 'opacity 200ms',
                  }}
                >
                  {buying ? <Loader2 size={12} className="animate-spin" /> : <><ShoppingBag size={12} /> Купить</>}
                </span>
              )}
            </div>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                {product.price === 0 ? t('product.free') : `${product.price} ₽`}
              </span>
              {product.old_price && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>
                  {product.old_price} ₽
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        {isApp ? (
          <div>{cardContent}</div>
        ) : (
          <Link to={`/product/${product.id}`}>
            {cardContent}
          </Link>
        )}
      </motion.div>

      {/* Purchase/UDID Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                zIndex: 2000, cursor: 'pointer',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(400px, 90vw)',
                background: 'var(--bg-3, #1a1a2e)',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                borderRadius: 'var(--r-xl, 20px)',
                padding: '32px 28px',
                zIndex: 2001,
                textAlign: 'center',
              }}
            >
              {/* Close */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-3, #666)', cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>

              {/* Icon */}
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--r-xl, 20px)',
                background: 'rgba(149,51,255,0.1)',
                border: '1px solid rgba(149,51,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                {product.image ? (
                  <img src={product.image} alt="" width={56} height={56} style={{ borderRadius: 12, objectFit: 'cover' }} />
                ) : (
                  <Smartphone size={32} style={{ color: 'var(--accent, #9533ff)' }} />
                )}
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
                {product.title}
              </h3>

              {product.price > 0 && (
                <div style={{
                  display: 'inline-block',
                  padding: '6px 18px', borderRadius: 'var(--r-full)',
                  background: 'linear-gradient(135deg, rgba(149,51,255,0.15), rgba(110,0,229,0.1))',
                  border: '1px solid rgba(149,51,255,0.25)',
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '1.1rem', color: '#af66ff',
                  marginBottom: 16,
                }}>
                  {product.price} ₽
                </div>
              )}

              {/* No UDID — need to get it */}
              {!localStorage.getItem('apple_udid') ? (
                <>
                  <p style={{ color: 'var(--text-2, #999)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                    Для установки приложения необходимо получить UDID вашего устройства.
                  </p>
                  <Link
                    to="/get-udid"
                    onClick={() => {
                      // сохраняем намерение — после регистрации (/auth) вернёмся к оплате этого приложения
                      localStorage.setItem('pending_app_purchase', JSON.stringify({ appId: product.id }))
                      setShowModal(false)
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '12px 28px', borderRadius: 'var(--r-full)',
                      background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                      color: '#fff', fontWeight: 700, fontSize: '0.92rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Smartphone size={16} /> Получить UDID
                  </Link>
                </>
              ) : (
                <>
                  {/* Has UDID — show email for paid or confirm for free */}
                  {isPaid && (
                    <div style={{ marginBottom: 16, textAlign: 'left' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
                        Email для чека:
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        style={{
                          width: '100%', padding: '12px 16px',
                          borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                          background: 'rgba(255,255,255,0.04)', color: 'var(--text)',
                          fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  )}

                  <p style={{ color: 'var(--text-2, #999)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 20 }}>
                    {isPaid
                      ? 'После оплаты приложение появится в вашем кабинете.'
                      : 'Приложение будет добавлено в ваш кабинет.'}
                  </p>

                  <button
                    onClick={() => { setShowModal(false); handlePurchase() }}
                    disabled={buying || (isPaid && !email.trim())}
                    style={{
                      width: '100%', padding: '14px 24px',
                      borderRadius: 'var(--r-full)', border: 'none',
                      background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                      color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                      cursor: buying ? 'wait' : 'pointer', fontFamily: 'inherit',
                      opacity: (buying || (isPaid && !email.trim())) ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {buying ? 'Обработка...' : isPaid ? `Купить за ${product.price} ₽` : 'Установить бесплатно'}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
