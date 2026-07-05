import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'
import { PackageIcon, UserIcon, SettingsIcon, CheckIcon, StarIcon, ClockIcon, VerifyIcon, LogOutIcon } from '../ui/Icons'

const statusMap: Record<string, { text: string; color: string; bg: string }> = {
  done: { text: 'Выдан', color: 'var(--green)', bg: 'transparent' },
  progress: { text: 'В обработке', color: 'var(--amber)', bg: 'transparent' }
}

const TABS = [
  { id: 'orders', label: 'Заказы', icon: <PackageIcon size={17} /> },
  { id: 'profile', label: 'Профиль', icon: <UserIcon size={17} /> }
]

export function Cabinet() {
  const { udid, profile, orders: userOrders, loading, logout } = useProfile()
  const [tab, setTab] = useState('orders')
  const [copied, setCopied] = useState(false)
  
  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewStatus, setReviewStatus] = useState('')

  const copyRef = () => { navigator.clipboard?.writeText('bazzar-serts.shop/r/artem'); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  const handleLogout = logout

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setReviewStatus('loading')

    let targetProductId = userOrders[0]?.productId;
    if (!targetProductId) {
       const { data } = await supabase.from('bazzar_products').select('id').eq('category', 'certs').eq('active', true).limit(1).single();
       targetProductId = data?.id;
    }
    
    if (!targetProductId) {
       setReviewStatus('error');
       return;
    }

    const { error } = await supabase.from('bazzar_reviews').insert([{
      product_id: targetProductId,
      author: 'Клиент ' + udid?.substring(udid.length - 4),
      rating: reviewRating,
      text: reviewText,
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    if (!error) {
      setReviewStatus('success')
      setTimeout(() => { setIsReviewOpen(false); setReviewStatus(''); setReviewText(''); setReviewRating(5) }, 2000)
    } else {
      setReviewStatus('error')
    }
  }

  if (loading) {
    return (
      <div style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>ЗАГРУЗКА...</div>
      </div>
    )
  }

  if (!udid) {
    return (
      <div style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: 40, position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 400 }}>
          <img 
            src="/img/login_graphic.png" 
            style={{ width: 140, height: 140, objectFit: 'contain', margin: '0 auto 16px', display: 'block', borderRadius: 16 }} 
            alt="Secure Keycard" 
          />
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Вход в личный кабинет</h2>
          
          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--hair)', padding: '16px', borderRadius: '14px', marginBottom: 24 }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.5 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Зачем это нужно?</span> UDID — это уникальный номер вашего iPhone. Он необходим для регистрации сертификата разработчика Apple, с помощью которого вы сможете устанавливать любые приложения в обход App Store.
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.5 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Это безопасно?</span> Да, абсолютно. Мы получаем исключительно базовую техническую информацию об устройстве (UDID и модель). Мы не имеем доступа к вашим личным данным или паролям.
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Внимание:</span> Если у вас включена «Защита украденного устройства» (Stolen Device Protection) от Apple, установка профиля может потребовать задержку в 1 час. Просто подождите этот час и повторите попытку установки профиля.
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
        <div className="glass" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 20, border: '1px solid var(--hair-strong)' }}>
          <img src="/img/mascot_raccoon.png" style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', border: '1px solid var(--hair-strong)', boxShadow: '0 0 15px rgba(255, 255, 255, 0.08)', objectFit: 'cover' }} alt="User" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <h1 style={{ fontSize: '1.5rem', textTransform: 'none' }}>Пользователь</h1>
              <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: 'none' }}><VerifyIcon size={13} /> {profile?.status === 'bought' ? 'PRO' : 'Client'}</span>
            </div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.86rem', marginTop: 2 }}>UDID: {udid.substring(0, 10)}...{udid.substring(udid.length - 4)}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '11px 16px' }}><LogOutIcon size={16} /> Выйти</button>
        </div>

        {/* Инфо-облако от Маскота */}
        <div className="glass" style={{ padding: 18, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--hair-strong)', marginBottom: 22 }}>
          <img src="/img/mascot_raccoon.png" className="float-mascot" style={{ width: 56, height: 'auto', display: 'block', flexShrink: 0 }} alt="Mascot Helper" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Енот-Саппорт:</div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-2)', marginTop: 2, lineHeight: 1.45 }}>
              Привет! Я слежу за статусом твоих сертификатов Apple Developer. Если заказ «В обработке» — мы уже отправляем запрос в Apple, это обычно занимает от 1 до 5 часов. Всё под контролем! 🤝
            </p>
          </div>
        </div>

        {/* Метрики */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 22 }}>
          <MetricCard icon={<PackageIcon size={19} />} label="Заказов" value={String(userOrders.length)} accent="var(--violet)" />
          <MetricCard icon={<StarIcon size={19} />} label="Уровень" value={profile?.status === 'bought' ? 'Продвинутый' : 'Начальный'} accent="var(--amber)" />
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
                {userOrders.length > 0 ? userOrders.map(o => {
                  const s = statusMap[o.status] || statusMap.progress
                  return (
                    <div key={o.id} className="card" style={{ padding: 16, display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0 }}>{o.emoji}</div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{o.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 3 }}>
                          <span>{o.id}</span><span>·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ClockIcon size={13} /> {o.date}</span>
                        </div>
                      </div>
                      <span className="badge" style={{ borderColor: s.color, color: s.color }}>{s.text}</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', minWidth: 80, textAlign: 'right' }}>{o.sum > 0 ? `${o.sum.toLocaleString('ru-RU')} ₽` : 'Бесплатно'}</div>
                      {o.ipaUrl ? (
                        <a href={o.ipaUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '9px 14px', fontSize: '0.82rem', display: 'inline-flex' }}>Скачать IPA</a>
                      ) : (
                        <a href="https://t.me/bazzar_support" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: '0.82rem', display: 'inline-flex' }}>В поддержку</a>
                      )}
                    </div>
                  )
                }) : (
                  <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
                    У вас пока нет заказов. <br/><br/>
                    <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
                  </div>
                )}
              </div>
            )}

            {/* Вкладка Баланс удалена */}

            {tab === 'profile' && (
              <div className="card" style={{ padding: 24, maxWidth: 560 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                  <span style={{ color: 'var(--violet)', display: 'flex' }}><SettingsIcon size={19} /></span>
                  <h3 style={{ fontSize: '1.15rem' }}>Настройки профиля</h3>
                </div>
                {[['UDID', udid]].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 6 }}>{k}</div>
                    <input className="field" defaultValue={v || ''} readOnly={k === 'UDID'} />
                  </div>
                ))}
                <button className="btn btn-primary" style={{ marginTop: 6 }}>Сохранить изменения</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 28, textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/catalog" className="btn btn-ghost" style={{ display: 'inline-flex' }}>Перейти в каталог</Link>
          <button onClick={() => setIsReviewOpen(true)} className="btn btn-primary" style={{ display: 'inline-flex' }}>Оставить отзыв</button>
        </div>
      </div>
      
      {/* Review Modal */}
      <AnimatePresence>
        {isReviewOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 24, zIndex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Ваш отзыв</h3>
              
              {reviewStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ color: 'var(--green)', display: 'inline-flex', marginBottom: 12 }}><CheckIcon size={48} /></div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Спасибо!</h4>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Ваш отзыв отправлен на модерацию и скоро появится на сайте.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#fbbf24' : 'var(--text-3)' }}>
                        <StarIcon size={32} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="field" 
                    placeholder="Расскажите о вашем опыте..." 
                    value={reviewText} 
                    onChange={e => setReviewText(e.target.value)}
                    style={{ minHeight: 100, resize: 'none', marginBottom: 16 }}
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsReviewOpen(false)}>Отмена</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitReview} disabled={!reviewText.trim() || reviewStatus === 'loading'}>
                      {reviewStatus === 'loading' ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width:880px){ .bal-grid{ grid-template-columns:1fr !important } }`}</style>
    </div>
  )
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="glass" style={{ padding: '20px 24px', border: '1px solid var(--hair-strong)', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, filter: 'blur(10px)' }} />
      <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)', background: 'var(--bg-2)', border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 14, boxShadow: `0 0 15px ${accent}15` }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 850, fontSize: '1.75rem', color: '#fff' }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  )
}
