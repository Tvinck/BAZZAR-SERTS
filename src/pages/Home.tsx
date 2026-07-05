import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useProducts } from '../hooks/useProducts'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, Sparkles as SparkIcon } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { BoltIcon, ShieldIcon, PercentIcon, HeadsetIcon, StarIcon, SearchIcon, CoinIcon, CATEGORY_ICON } from '../ui/Icons'
import { CATEGORIES, PRODUCTS } from '../data/catalog'

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 16 } }
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

const trust = [
  { icon: <BoltIcon size={20} />, title: 'Моментально', sub: 'Выдача 24/7 автоматом' },
  { icon: <ShieldIcon size={20} />, title: 'Гарантия', sub: 'Возврат если не подошло' },
  { icon: <PercentIcon size={20} />, title: 'Кэшбэк 5%', sub: 'Баллами на баланс' },
  { icon: <HeadsetIcon size={20} />, title: 'Поддержка', sub: 'Живые люди в чате' }
]



const faqs = [
  { q: 'Для чего нужен сертификат?', a: 'Сертификат разработчика позволяет устанавливать любые приложения (IPA) в обход App Store прямо на вашем устройстве, без использования компьютера.' },
  { q: 'Что делать, если сертификат отзовут?', a: 'При покупке VIP тарифа действует гарантия на бесплатную замену сертификата в течение заявленного срока, если Apple его отзовет.' },
  { q: 'Смогу ли я установить TikTok или Сбербанк?', a: 'Да! С помощью нашего сертификата и утилит вроде Scarlet/ESign вы сможете установить TikTok (с рабочими рекомендациями), удаленные банковские приложения и любые моды.' },
  { q: 'Как быстро выдается сертификат?', a: 'Обычно регистрация устройства и выдача сертификата занимает от 1 до 5 часов (Apple устанавливает ограничения по времени на добавление устройств).' }
]

export function Home() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [dbReviews, setDbReviews] = useState<any[]>([])
  
  const { products, loading } = useProducts()
  const popular = products.slice().sort((a, b) => b.sold - a.sold).slice(0, 10)

  useEffect(() => {
    supabase.from('bazzar_reviews')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setDbReviews(data)
      })
  }, [])

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(40px, 8vw, 100px) 0' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'center' }}>
            
            {/* Текст и поиск */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="chip" style={{ marginBottom: 20, background: 'transparent' }}>
                <SparkIcon size={16} /> Новый способ установки
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                style={{ fontSize: 'clamp(2.2rem,5vw,4.2rem)', margin: '0 0 20px', lineHeight: 1.02, textAlign: 'left', textTransform: 'uppercase' }}>
                Свобода установки<br /><span style={{ background: 'linear-gradient(90deg, var(--violet), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>приложений</span> на iOS
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                style={{ fontSize: '1.15rem', color: 'var(--text-2)', maxWidth: 540, margin: '0 0 32px', lineHeight: 1.6 }}>
                Забудь про ограничения. Устанавливай удалённые из App Store приложения, моды и твики без ПК в два клика.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                style={{ position: 'relative', width: '100%', maxWidth: 540 }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex' }}><SearchIcon size={20} /></span>
                <input className="field" placeholder="Поиск приложений, сертификатов, утилит…" style={{ height: 60, paddingLeft: 50, paddingRight: 140, fontSize: '1rem', background: 'var(--bg-2)' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate('/catalog') }} />
                <button className="btn btn-primary" onClick={() => navigate('/catalog')} style={{ position: 'absolute', right: 7, top: 7, height: 46 }}>Найти</button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginRight: 8, alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Популярное:</span>
                {['VIP Сертификат', 'TikTok Dark', 'Scarlet', 'VK Сова'].map(t => (
                  <Link key={t} to="/catalog" className="chip" style={{ background: 'transparent' }}>{t}</Link>
                ))}
              </motion.div>
            </div>

            {/* Изображение маскота (Кибер-Енот) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="float-mascot"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              <img 
                src="/img/mascot_raccoon.png" 
                style={{ width: 'clamp(200px, 25vw, 320px)', height: 'auto', zIndex: 1 }} 
                alt="Cyber Raccoon Mascot" 
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── КАТЕГОРИИ ── */}
      <section className="section" style={{ paddingTop: 'clamp(30px,4vw,48px)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Категории</span>
              <h2 className="section-title" style={{ marginTop: 8 }}>Выбери, что нужно</h2>
            </div>
            <Link to="/catalog" className="btn btn-ghost" style={{ padding: '10px 16px' }}>Весь каталог <ArrowRight size={15} /></Link>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
            {CATEGORIES.map(c => {
              const Icon = CATEGORY_ICON[c.id] ?? CoinIcon
              return (
              <motion.div key={c.id} variants={fade} whileHover={{ y: -5 }}>
                <Link to="/catalog" className="card card-hover" style={{ display: 'block', padding: 18, position: 'relative', overflow: 'hidden', minHeight: 132 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 15, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 22px rgba(0,0,0,0.4)' }}>
                    <Icon size={64} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.02rem', marginTop: 14 }}>{c.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>{c.subtitle}</div>
                  <span style={{ position: 'absolute', top: 16, right: 16, fontSize: '0.74rem', color: 'var(--text-3)' }}>{c.count}+</span>
                </Link>
              </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── ПОПУЛЯРНОЕ ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Хиты продаж</span>
              <h2 className="section-title" style={{ marginTop: 8 }}>Сейчас берут 🔥</h2>
            </div>
            <Link to="/catalog" className="btn btn-ghost" style={{ padding: '10px 16px' }}>Смотреть всё <ArrowRight size={15} /></Link>
          </div>
          <div className="grid-products">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="card" style={{ height: 320, background: 'var(--surface-2)', animation: 'pulse 1.5s infinite' }} />
              ))
            ) : (
              popular.map(p => <ProductCard key={p.id} product={p as any} />)
            )}
          </div>
        </div>
      </section>

      {/* ── ОТЗЫВЫ ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><span className="kicker">Отзывы</span><h2 className="section-title" style={{ marginTop: 8 }}>Нам доверяют</h2></div></div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {dbReviews.map((r, i) => (
              <motion.div key={i} variants={fade} className="card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12, color: '#fbbf24' }}>{Array.from({ length: r.rating || 5 }).map((_, i) => <StarIcon key={i} size={15} />)}</div>
                <p style={{ color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>«{r.text}»</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{(r.author || 'А')[0]}</div>
                  <div><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.author || 'Пользователь'}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{new Date(r.created_at).toLocaleDateString('ru-RU')}</div></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}><div><span className="kicker">Вопросы</span><h2 className="section-title" style={{ marginTop: 8 }}>Частые вопросы</h2></div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(open ? null : i)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '18px 20px', textAlign: 'left' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>{f.q}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ color: 'var(--violet)', display: 'flex' }}><ChevronDown size={20} /></motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                        <p style={{ padding: '0 20px 20px', color: 'var(--text-2)', lineHeight: 1.65 }}>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <style>{`@media (max-width:880px){ .cashback-grid{ grid-template-columns:1fr !important } }`}</style>
    </div>
  )
}
