import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Copy, Check, ShieldCheck, ChevronRight, Download, Sparkles, ArrowRight } from 'lucide-react'
import { getDeviceDisplayName } from '../lib/device-models'
import { useToast } from '../components/Toast'
import { SafariHint } from '../components/SafariHint'

/* ═══════════════════════════════════════════════════════════
   GetUdid — Страница для получения UDID устройства
   Гости и клиенты могут узнать UDID без покупки
   ═══════════════════════════════════════════════════════════ */

export function GetUdid() {
  const { toast } = useToast()
  const [udid, setUdid] = useState<string | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const storedUdid = localStorage.getItem('apple_udid')
    const storedModel = localStorage.getItem('apple_device_model')
    if (storedUdid) setUdid(storedUdid)
    if (storedModel) setModel(storedModel)
  }, [])

  const handleCopy = () => {
    if (!udid) return
    navigator.clipboard.writeText(udid).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleGetUdid = () => {
    // Профиль Apple ставится только на iPhone/iPad — на десктопе/Android подсказываем открыть на устройстве
    const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!isAppleMobile) {
      toast('Откройте эту страницу на iPhone или iPad — UDID можно получить только на устройстве Apple')
      return
    }
    const host = window.location.host
    const protocol = window.location.protocol
    window.location.href = `${protocol}//${host}/api/udid/generate`
  }

  const displayModel = model ? getDeviceDisplayName(model) : null

  // ── UDID already available ───────────────────────────────
  if (udid) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)', paddingBottom: 'var(--sp-16)' }}>
        <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Success icon */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <ShieldCheck size={36} style={{ color: '#22C55E' }} />
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800, marginBottom: 8,
            }}>
              Ваш UDID
            </h1>

            {displayModel && (
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <Smartphone size={16} /> {displayModel}
              </p>
            )}

            {/* UDID display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={handleCopy}
              style={{
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--r-lg)',
                cursor: 'pointer',
                marginBottom: 32,
                transition: 'border-color 200ms',
              }}
              whileHover={{ borderColor: 'rgba(149,51,255,0.3)' }}
            >
              <code style={{
                fontFamily: 'monospace', fontSize: 'clamp(0.7rem, 2.5vw, 0.88rem)',
                color: 'var(--accent, #9533ff)', wordBreak: 'break-all', lineHeight: 1.6,
              }}>
                {udid}
              </code>
              <div style={{
                marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, fontSize: '0.78rem', color: 'var(--text-3)',
              }}>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={14} /> Скопировано!
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Copy size={14} /> Нажмите, чтобы скопировать
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* CTA cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <Link to="/catalog" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '18px 20px', borderRadius: 'var(--r-lg)',
                  background: 'linear-gradient(135deg, rgba(149,51,255,0.12), rgba(110,0,229,0.08))',
                  border: '1px solid rgba(149,51,255,0.2)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 200ms', cursor: 'pointer',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(149,51,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <ShieldCheck size={22} style={{ color: '#af66ff' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>
                      Купить сертификат
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>
                      Подпишите любые приложения на вашем устройстве
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-3)' }} />
                </div>
              </Link>

              <Link to="/catalog?category=apps" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '18px 20px', borderRadius: 'var(--r-lg)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 200ms', cursor: 'pointer',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(59,130,246,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Download size={22} style={{ color: '#3b82f6' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>
                      Приложения
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>
                      Готовые IPA для установки через подпись
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-3)' }} />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    )
  }

  // ── No UDID — show enrollment flow ──────────────────────
  const steps = [
    { num: '1', text: 'Нажмите «Получить UDID» ниже' },
    { num: '2', text: 'Перейдите в Настройки → «Профиль загружен»' },
    { num: '3', text: 'Установите профиль и вернитесь на сайт' },
  ]

  return (
    <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)', paddingBottom: 'var(--sp-16)' }}>
      <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Hero icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              width: 80, height: 80, borderRadius: 'var(--r-xl)',
              background: 'rgba(149,51,255,0.1)',
              border: '1px solid rgba(149,51,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Smartphone size={36} style={{ color: 'var(--accent, #9533ff)' }} />
          </motion.div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: 800, lineHeight: 1.15, marginBottom: 12,
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #af66ff, #6e00e5, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Узнать UDID
            </span>
          </h1>

          <p style={{
            color: 'var(--text-2)', fontSize: 'clamp(0.88rem, 2vw, 1rem)',
            maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.6,
          }}>
            UDID — уникальный идентификатор вашего Apple устройства. Он нужен для подписи приложений и установки сертификатов.
          </p>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              marginBottom: 32, textAlign: 'left',
            }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Подсказка про Safari (если открыто во встроенном браузере) */}
          <SafariHint />

          {/* CTA button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGetUdid}
            className="btn btn-gradient"
            style={{
              width: '100%', padding: '16px 24px',
              borderRadius: 'var(--r-full)',
              fontSize: '1rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Sparkles size={18} />
            Получить UDID
            <ArrowRight size={18} />
          </motion.button>

          <p style={{
            marginTop: 16, fontSize: '0.75rem', color: 'var(--text-3)',
            lineHeight: 1.5,
          }}>
            Профиль автоматически удалится после установки.
            <br />
            Он не собирает никаких личных данных, кроме UDID.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
