import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Smartphone, Shield, ArrowRight, Monitor } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export function AddDevice() {
  usePageTitle('Добавить устройство')
  const { ownerUdid } = useParams<{ ownerUdid: string }>()

  const isMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const handleGetUdid = () => {
    if (!isMobile) return
    window.location.href = `/api/udid/generate-for-owner?owner=${encodeURIComponent(ownerUdid || '')}`
  }

  return (
    <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 480, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Icon */}
          <div style={{
            width: 88, height: 88, borderRadius: 'var(--r-xl)', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(149,51,255,0.15), rgba(100,0,230,0.1))',
            border: '1px solid rgba(149,51,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Smartphone size={40} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', fontWeight: 800, marginBottom: 12 }}>
            Добавление устройства
          </h1>

          {/* Description */}
          <div style={{
            padding: '20px 24px', borderRadius: 'var(--r-lg)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            marginBottom: 24, textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Shield size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                Что произойдёт?
              </p>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>
              Пользователь Bazzar Serts хочет добавить ваше устройство в свой личный кабинет, 
              чтобы иметь возможность покупать для вас сертификаты и приложения.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
              Мы получим только <strong>идентификатор устройства (UDID)</strong> и модель. 
              Никакие личные данные не передаются.
            </p>
          </div>

          {/* Steps */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28,
            textAlign: 'left',
          }}>
            {[
              'Нажмите кнопку ниже',
              'Установите профиль в настройках',
              'Устройство будет автоматически добавлено',
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(149,51,255,0.12)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{step}</span>
              </div>
            ))}
          </div>

          {isMobile ? (
            <button
              className="btn btn-gradient"
              onClick={handleGetUdid}
              style={{
                width: '100%', padding: '16px 0',
                fontSize: '1rem', fontWeight: 800,
                borderRadius: 'var(--r-md)', gap: 8,
              }}
            >
              <Smartphone size={18} />
              Получить и отправить UDID
              <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{
              padding: '20px', borderRadius: 'var(--r-lg)',
              background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.2)',
            }}>
              <Monitor size={28} style={{ color: '#f59e0b', marginBottom: 10 }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>
                Откройте эту страницу на iPhone или iPad
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Регистрация устройства работает только с мобильного Apple устройства.
              </p>
            </div>
          )}

          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 16, lineHeight: 1.5 }}>
            Это безопасная процедура. Профиль автоматически удалится после получения UDID.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
