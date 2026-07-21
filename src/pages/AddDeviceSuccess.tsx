import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getDeviceDisplayName } from '../lib/device-models'

export function AddDeviceSuccess() {
  usePageTitle('Устройство добавлено')
  const [params] = useSearchParams()
  const model = params.get('model')
  const displayName = getDeviceDisplayName(model)

  return (
    <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 460, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
              background: 'rgba(52,199,89,0.12)', border: '2px solid rgba(52,199,89,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={44} style={{ color: 'var(--success)' }} />
          </motion.div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', fontWeight: 800, marginBottom: 12 }}>
            Устройство добавлено!
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', marginBottom: 8 }}>
            <strong>{displayName}</strong> успешно привязано к кабинету.
          </p>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 32, lineHeight: 1.6 }}>
            Владелец кабинета теперь может покупать сертификаты и приложения для вашего устройства.
          </p>

          <a
            href="/"
            className="btn btn-gradient"
            style={{
              padding: '14px 32px', borderRadius: 'var(--r-md)',
              fontSize: '0.95rem', fontWeight: 700, gap: 8,
              display: 'inline-flex',
            }}
          >
            На главную <ArrowRight size={16} />
          </a>

        </motion.div>
      </div>
    </section>
  )
}
