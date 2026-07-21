import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone, CreditCard, Shield, AlertTriangle, Check,
  ChevronRight, Mail, Loader2, ExternalLink, Info, Lock
} from 'lucide-react'
import { SafariHint } from '../components/SafariHint'

/* ═══════════════════════════════════════════════════════════
   Registration — Manual registration for Avito customers
   Route: /r/:code
   Flow: Step 1 (get UDID via profile install) → Step 2 (pay via T-Bank)
   ═══════════════════════════════════════════════════════════ */

const CONNECT = 'https://connect-4va6.vercel.app'

interface RegData {
  platform: string
  guaranteeMonths: number
  price: number
  status: string
  hasUdid: boolean
  extraInfo: string | null
}

/* ── Shared Styles ────────────────────────────────────────── */

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--sp-6)',
}

const glassCardHover: React.CSSProperties = {
  ...glassCard,
  transition: 'border-color 200ms ease, box-shadow 200ms ease',
}

/* ── Step Progress Component ──────────────────────────────── */

function StepProgress({ currentStep, hasUdid }: { currentStep: number; hasUdid: boolean }) {
  const steps = [
    { num: 1, label: 'Получить UDID', icon: Smartphone },
    { num: 2, label: 'Оплата', icon: CreditCard },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, margin: '0 auto var(--sp-8)', maxWidth: 400,
    }}>
      {steps.map((step, i) => {
        const Icon = step.icon
        const isCompleted = step.num === 1 ? hasUdid : false
        const isActive = step.num === currentStep
        const color = isCompleted
          ? 'var(--success, #3bb33b)'
          : isActive
            ? 'var(--accent, #9533ff)'
            : 'var(--text-3, #666)'

        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, minWidth: 80,
              }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 'var(--r-md)',
                background: isCompleted
                  ? 'rgba(59,179,59,0.12)'
                  : isActive
                    ? 'rgba(149,51,255,0.12)'
                    : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isCompleted ? 'rgba(59,179,59,0.3)' : isActive ? 'rgba(149,51,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 300ms ease',
              }}>
                {isCompleted ? (
                  <Check size={22} style={{ color }} />
                ) : (
                  <Icon size={22} style={{ color }} />
                )}
              </div>
              <span style={{
                fontSize: '0.75rem', fontWeight: 500, color,
                whiteSpace: 'nowrap',
              }}>{step.label}</span>
            </motion.div>

            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 12px',
                marginBottom: 24,
                background: hasUdid
                  ? 'linear-gradient(90deg, var(--success, #3bb33b), var(--accent, #9533ff))'
                  : 'rgba(255,255,255,0.06)',
                borderRadius: 1,
                transition: 'background 500ms ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────── */

export function Registration() {
  const { code } = useParams<{ code: string }>()

  const [reg, setReg] = useState<RegData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [hasUdid, setHasUdid] = useState(false)

  // Current step: 1 = UDID, 2 = Pay
  const currentStep = hasUdid ? 2 : 1

  /* ── Load registration data ────────────────────────────── */
  const loadRegistration = useCallback(async () => {
    if (!code) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${CONNECT}/api/registration/${code}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Ошибка ${res.status}`)
      }
      const data: RegData = await res.json()
      setReg(data)

      // Check UDID from localStorage or from server
      const localUdid = localStorage.getItem('apple_udid')
      setHasUdid(!!localUdid || data.hasUdid)
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить данные регистрации')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    loadRegistration()
  }, [loadRegistration])

  // Re-check UDID when page is focused (user returns from profile install)
  useEffect(() => {
    const onFocus = () => {
      const localUdid = localStorage.getItem('apple_udid')
      if (localUdid) setHasUdid(true)
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  /* ── Handlers ──────────────────────────────────────────── */
  const handleGetUdid = () => {
    if (!code) return
    localStorage.setItem('pending_registration_code', code)
    window.location.href = '/api/udid/generate'
  }

  const handlePay = async () => {
    if (!code || !email.trim()) return
    setPaying(true)
    setPayError(null)
    try {
      const res = await fetch(`${CONNECT}/api/registration/${code}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          returnUrl: window.location.href,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка оплаты')
      // Redirect to payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }
    } catch (err: any) {
      setPayError(err.message || 'Ошибка при создании платежа')
    } finally {
      setPaying(false)
    }
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  /* ── Format price ──────────────────────────────────────── */
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(p)

  /* ── Loading State ─────────────────────────────────────── */
  if (loading) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ maxWidth: 560, textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <div style={{
              width: 48, height: 48,
              border: '3px solid var(--surface-2, #272727)',
              borderTopColor: 'var(--accent, #9533ff)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: 'var(--text-3, #666)', fontSize: '0.9rem' }}>
              Загрузка регистрации…
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  /* ── Error State ───────────────────────────────────────── */
  if (error || !reg) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ maxWidth: 560, textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--r-xl)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={28} style={{ color: 'var(--error, #ff2121)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
              Регистрация не найдена
            </h2>
            <p style={{ color: 'var(--text-3, #666)', fontSize: '0.9rem', maxWidth: 360 }}>
              {error || 'Проверьте правильность ссылки или обратитесь к продавцу.'}
            </p>
            <button
              className="btn btn-gradient"
              onClick={loadRegistration}
              style={{ marginTop: 8, gap: 6 }}
            >
              Попробовать снова <ChevronRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  /* ── Already paid/completed ────────────────────────────── */
  if (reg.status === 'paid' || reg.status === 'completed') {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ maxWidth: 560, textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--r-xl)',
              background: 'rgba(59,179,59,0.12)',
              border: '1px solid rgba(59,179,59,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={36} style={{ color: 'var(--success, #3bb33b)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
              Оплата получена!
            </h2>
            <p style={{ color: 'var(--text-2, #999)', fontSize: '0.9rem', maxWidth: 380 }}>
              Ваша регистрация оплачена. Сертификат будет активирован в течение нескольких минут.
              {reg.extraInfo && <><br /><br />{reg.extraInfo}</>}
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  /* ── Main Content ──────────────────────────────────────── */
  return (
    <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)', paddingBottom: 'var(--sp-16)' }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                width: 64, height: 64, borderRadius: 'var(--r-xl)',
                background: 'rgba(149,51,255,0.1)',
                border: '1px solid rgba(149,51,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Shield size={28} style={{ color: 'var(--accent, #9533ff)' }} />
            </motion.div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 1.75rem)',
              fontWeight: 700,
              marginBottom: 6,
            }}>
              Регистрация устройства
            </h1>
            <p style={{ color: 'var(--text-3, #666)', fontSize: '0.9rem' }}>
              {reg.platform} · Гарантия {reg.guaranteeMonths} мес.
            </p>
          </div>

          {/* ── Step Progress ───────────────────────────────── */}
          <StepProgress currentStep={currentStep} hasUdid={hasUdid} />

          {/* ── Order Card ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ ...glassCard, marginBottom: 'var(--sp-4)' }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: 'var(--sp-4)',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3, #666)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Заказ
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                  Сертификат подписи · {reg.platform}
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(149,51,255,0.15), rgba(110,0,229,0.08))',
                border: '1px solid rgba(149,51,255,0.2)',
                borderRadius: 'var(--r-md)',
                padding: '8px 14px',
                textAlign: 'right',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3, #666)', marginBottom: 2 }}>
                  К оплате
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {formatPrice(reg.price)}
                </div>
              </div>
            </div>

            {/* Guarantee info */}
            <div style={{
              display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap',
            }}>
              {[
                { label: 'Гарантия', value: `${reg.guaranteeMonths} мес.` },
                { label: 'Платформа', value: reg.platform },
                { label: 'Статус', value: hasUdid ? 'UDID получен' : 'Ожидание UDID' },
              ].map((item) => (
                <div key={item.label} style={{
                  flex: '1 1 100px',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3, #666)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Warning Card ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--sp-4)',
              marginBottom: 'var(--sp-6)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4, color: '#f59e0b' }}>
                Защита от краденых устройств
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2, #999)', lineHeight: 1.5 }}>
                Мы подписываем только устройства, UDID которых получен напрямую через наш сервис.
                Это гарантирует, что сертификат не будет привязан к украденному устройству.
              </p>
            </div>
          </motion.div>

          {/* ── Step 1: UDID ────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {!hasUdid ? (
              <motion.div
                key="step-udid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ ...glassCardHover, marginBottom: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-4)' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--r-sm)',
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Smartphone size={18} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                        Шаг 1: Получение UDID
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-3, #666)' }}>
                        Откройте эту страницу на iPhone/iPad
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--sp-5)' }}>
                    {[
                      'Нажмите кнопку «Получить UDID» ниже',
                      'Разрешите установку профиля в настройках',
                      'Перейдите в Настройки → Основные → VPN и управление устройством',
                      'Установите загруженный профиль',
                      'Вернитесь на эту страницу — UDID определится автоматически',
                    ].map((text, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 'var(--r-full)',
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 600, color: '#3b82f6',
                          flexShrink: 0, marginTop: 1,
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-2, #999)', lineHeight: 1.5 }}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <SafariHint />

                  <button
                    onClick={handleGetUdid}
                    className="btn btn-gradient"
                    style={{
                      width: '100%', justifyContent: 'center',
                      padding: '14px 24px', fontSize: '0.95rem', gap: 8,
                    }}
                  >
                    <Smartphone size={18} />
                    Получить UDID
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Info tip */}
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '12px 14px',
                  background: 'rgba(59,130,246,0.05)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid rgba(59,130,246,0.1)',
                }}>
                  <Info size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-3, #666)', lineHeight: 1.5 }}>
                    UDID — уникальный идентификатор вашего Apple-устройства.
                    Он необходим для выпуска именного сертификата подписи.
                    Профиль безопасен и автоматически удалится после получения.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* ── Step 2: Payment ───────────────────────────── */
              <motion.div
                key="step-pay"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ ...glassCardHover }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-5)' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--r-sm)',
                      background: 'rgba(149,51,255,0.1)',
                      border: '1px solid rgba(149,51,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CreditCard size={18} style={{ color: 'var(--accent, #9533ff)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                        Шаг 2: Оплата
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-3, #666)' }}>
                        Безопасная оплата через Т-Банк
                      </p>
                    </div>
                  </div>

                  {/* UDID confirmed badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', marginBottom: 'var(--sp-5)',
                    background: 'rgba(59,179,59,0.06)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid rgba(59,179,59,0.15)',
                  }}>
                    <Check size={16} style={{ color: 'var(--success, #3bb33b)' }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--success, #3bb33b)', fontWeight: 500 }}>
                      UDID устройства получен
                    </span>
                  </div>

                  {/* Email input */}
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <label style={{
                      display: 'block', fontSize: '0.8rem', fontWeight: 500,
                      color: 'var(--text-2, #999)', marginBottom: 8,
                    }}>
                      Email для чека и уведомлений
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 'var(--r-md)',
                      padding: '0 14px',
                      transition: 'border-color 200ms ease',
                    }}>
                      <Mail size={18} style={{ color: 'var(--text-3, #666)', flexShrink: 0 }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.ru"
                        style={{
                          flex: 1, padding: '14px 0',
                          background: 'transparent', border: 'none', outline: 'none',
                          color: 'var(--text, #fff)', fontSize: '0.95rem',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>

                  {/* Pay error */}
                  <AnimatePresence>
                    {payError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 'var(--r-sm)',
                          padding: '10px 14px',
                          marginBottom: 'var(--sp-4)',
                          fontSize: '0.82rem', color: '#ef4444',
                        }}
                      >
                        {payError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay button */}
                  <button
                    onClick={handlePay}
                    disabled={!isValidEmail || paying}
                    style={{
                      width: '100%', padding: '14px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: isValidEmail && !paying
                        ? 'linear-gradient(135deg, #af66ff, #6e00e5)'
                        : 'rgba(255,255,255,0.05)',
                      color: isValidEmail && !paying ? '#fff' : 'var(--text-3, #666)',
                      border: 'none', borderRadius: 'var(--r-md)',
                      fontSize: '0.95rem', fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: isValidEmail && !paying ? 'pointer' : 'not-allowed',
                      transition: 'all 200ms ease',
                      opacity: paying ? 0.7 : 1,
                    }}
                  >
                    {paying ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Создание платежа…
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Оплатить {formatPrice(reg.price)}
                        <ExternalLink size={14} />
                      </>
                    )}
                  </button>

                  {/* Security note */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, marginTop: 12,
                  }}>
                    <Lock size={12} style={{ color: 'var(--text-3, #666)' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3, #666)' }}>
                      Безопасная оплата · Шифрование SSL · Т-Банк
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Extra info ───────────────────────────────────── */}
          {reg.extraInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: 'var(--sp-5)',
                padding: '12px 14px',
                background: 'rgba(149,51,255,0.05)',
                borderRadius: 'var(--r-sm)',
                border: '1px solid rgba(149,51,255,0.1)',
                fontSize: '0.82rem', color: 'var(--text-2, #999)', lineHeight: 1.5,
              }}
            >
              {reg.extraInfo}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
