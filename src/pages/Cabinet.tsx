import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PackageIcon, UserIcon, SettingsIcon, CheckIcon, StarIcon, ClockIcon, VerifyIcon, LogOutIcon } from '../ui/Icons'
import { supabase } from '../lib/supabase'

const statusMap: Record<string, { text: string; color: string; bg: string }> = {
  done: { text: 'Выдан', color: 'var(--green)', bg: 'transparent' },
  progress: { text: 'В обработке', color: 'var(--amber)', bg: 'transparent' },
  'в работе': { text: 'В обработке', color: 'var(--amber)', bg: 'transparent' },
  'выдан': { text: 'Выдан', color: 'var(--green)', bg: 'transparent' }
}

const TABS = [
  { id: 'orders', label: 'Заказы', icon: <PackageIcon size={17} /> },
  { id: 'profile', label: 'Профиль', icon: <UserIcon size={17} /> }
]

export function Cabinet() {
  const [tab, setTab] = useState('orders')
  const [udid, setUdid] = useState<string | null>(null)
  
  const [userProfile, setUserProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [telegramInput, setTelegramInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    const savedUdid = localStorage.getItem('apple_udid')
    setUdid(savedUdid)
    if (savedUdid) {
      loadData(savedUdid)
    }
  }, [])

  const loadData = async (currentUdid: string) => {
    setLoading(true)
    let { data: user } = await supabase.from('bazzar_users').select('*').eq('udid', currentUdid).single()
    if (!user) {
      const { data: newUser } = await supabase.from('bazzar_users').insert([{ udid: currentUdid, status: 'thinking' }]).select().single()
      user = newUser
    }
    setUserProfile(user)
    if (user?.telegram) setTelegramInput(user.telegram)

    const { data: ordersData } = await supabase
      .from('bazzar_orders')
      .select('id, status, created_at, bazzar_products (title, image)')
      .eq('udid', currentUdid)
      .order('created_at', { ascending: false })
      
    if (ordersData) {
      setOrders(ordersData.map((o: any) => ({
        id: o.id.split('-')[0].toUpperCase() + '-' + o.id.split('-')[1].substring(0,4),
        rawId: o.id,
        title: o.bazzar_products?.title || 'Неизвестный товар',
        image: o.bazzar_products?.image || '',
        date: new Date(o.created_at).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }),
        status: o.status,
        sum: 0
      })))
    }
    
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!userProfile) return
    setSavingProfile(true)
    await supabase.from('bazzar_users').update({ telegram: telegramInput }).eq('id', userProfile.id)
    setSavingProfile(false)
    alert('Профиль сохранен!')
  }

  const handleLogout = () => {
    localStorage.removeItem('apple_udid')
    localStorage.removeItem('apple_device_model')
    setUdid(null)
  }

  if (!udid) {
    return (
      <div style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: 40, position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--text)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)' }}>
            <UserIcon size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Вход в личный кабинет</h2>
          
          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--hair)', padding: '16px', borderRadius: '14px', marginBottom: 24 }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.5 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Зачем это нужно?</span> UDID — это уникальный номер вашего iPhone. Он необходим для регистрации сертификата разработчика Apple, с помощью которого вы сможете устанавливать любые приложения в обход App Store.
            </p>
          </div>

          <a href="/api/udid/generate" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            Получить UDID
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '32px 0 60px' }}>
        {/* Профиль-хедер */}
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--bg)' }}>
            {telegramInput ? telegramInput.substring(0, 1).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <h1 style={{ fontSize: '1.5rem', textTransform: 'none' }}>{telegramInput || 'Пользователь'}</h1>
              {orders.length > 0 && <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: 'none' }}><VerifyIcon size={13} /> Покупатель</span>}
            </div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.86rem', marginTop: 2 }}>UDID: {udid.substring(0, 10)}...{udid.substring(udid.length - 4)}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '11px 16px' }}><LogOutIcon size={16} /> Выйти</button>
        </div>

        {/* Метрики */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 22 }}>
          <MetricCard icon={<PackageIcon size={19} />} label="Заказов" value={orders.length.toString()} accent="var(--violet)" />
          <MetricCard icon={<StarIcon size={19} />} label="Уровень" value={orders.length > 2 ? 'Продвинутый' : 'Начальный'} accent="var(--amber)" />
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="btn" style={{ padding: '11px 18px', whiteSpace: 'nowrap', ...(tab === t.id ? { background: 'var(--text)', color: 'var(--bg)' } : { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--hair)' }) }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {tab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)' }}>Загрузка заказов...</div> :
                 orders.length === 0 ? <div className="card" style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)' }}>У вас пока нет заказов</div> :
                 orders.map(o => {
                  const s = statusMap[o.status] || statusMap['progress']
                  return (
                    <div key={o.id} className="card" style={{ padding: 16, display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {o.image ? <img src={o.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <PackageIcon size={24} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{o.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 3 }}>
                          <span>{o.id}</span><span>·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ClockIcon size={13} /> {o.date}</span>
                        </div>
                      </div>
                      <span className="badge" style={{ borderColor: s.color, color: s.color }}>{s.text}</span>
                      <button className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: '0.82rem' }}>Инструкция</button>
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'profile' && (
              <div className="card" style={{ padding: 24, maxWidth: 560 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                  <span style={{ color: 'var(--violet)', display: 'flex' }}><SettingsIcon size={19} /></span>
                  <h3 style={{ fontSize: '1.15rem' }}>Настройки профиля</h3>
                </div>
                
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 6 }}>UDID (Только для чтения)</div>
                  <input className="field" value={udid || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 6 }}>Telegram Username (без @)</div>
                  <input className="field" value={telegramInput} onChange={e => setTelegramInput(e.target.value)} placeholder="Например: artem_gamer" />
                </div>

                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary" style={{ marginTop: 6 }}>
                  {savingProfile ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Link to="/catalog" className="btn btn-ghost" style={{ display: 'inline-flex' }}>Перейти в каталог</Link>
        </div>
      </div>

      {/* Модалка Инструкции */}
      <AnimatePresence>
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 24, zIndex: 101 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Как получить {selectedOrder.title}?</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 20 }}>
                Для получения товара, пожалуйста, свяжитесь с нашей поддержкой. Обязательно укажите ваш UDID и номер заказа: <b>{selectedOrder.id}</b>.
              </p>
              <div style={{ background: 'var(--surface-2)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: 20, color: 'var(--violet)' }}>
                {udid}
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => window.open('https://t.me/artem_gamer_support', '_blank')}>
                Написать в поддержку
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{label}</div>
    </div>
  )
}
