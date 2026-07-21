import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Clock, Calendar, BookOpen, ChevronRight } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useArticles } from '../hooks/useArticles'

/* ═══════════════════════════════════════════════════════════
   Blog — список статей (из БД, управляется в Connect → Блог)
   ═══════════════════════════════════════════════════════════ */

const CATEGORIES = ['Все', 'Гайд', 'Обзор', 'FAQ']

const CAT_COLOR: Record<string, string> = {
  Гайд: '#9533ff',
  Обзор: '#22c55e',
  FAQ: '#3b82f6',
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function Blog() {
  usePageTitle('Блог и гайды')
  const { articles, loading } = useArticles()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Все')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return articles.filter((a) => {
      const matchCat = activeCategory === 'Все' || a.category === activeCategory
      const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [articles, search, activeCategory])

  return (
    <section className="section" style={{ paddingTop: 'clamp(90px, 12vw, 120px)' }}>
      <div className="container" style={{ maxWidth: 1080 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--sp-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            Блог и гайды
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', maxWidth: 560 }}>
            Инструкции по установке приложений, сертификатам Apple и UDID — просто и по делу.
          </p>
        </motion.div>

        {/* Поиск + категории */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по статьям"
              style={{ width: '100%', height: 44, paddingLeft: 40, paddingRight: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                style={{
                  padding: '10px 16px', borderRadius: 'var(--r-full)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${activeCategory === c ? 'var(--accent)' : 'var(--border)'}`,
                  background: activeCategory === c ? 'rgba(149,51,255,0.1)' : 'var(--surface-2)',
                  color: activeCategory === c ? 'var(--text)' : 'var(--text-2)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Список */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-16) 0', color: 'var(--text-3)' }}>Загрузка статей…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-16) 0', color: 'var(--text-3)' }}>Статьи не найдены.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-5)' }}>
            {filtered.map((a, i) => {
              const color = CAT_COLOR[a.category] || 'var(--accent)'
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    to={`/blog/${a.slug}`}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'border-color 200ms, transform 200ms' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                  >
                    <div style={{ height: 120, background: a.cover_url ? `center/cover no-repeat url(${a.cover_url})` : `linear-gradient(135deg, ${color}22, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!a.cover_url && <BookOpen size={30} style={{ color }} />}
                    </div>
                    <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ alignSelf: 'flex-start', fontSize: '0.72rem', fontWeight: 700, color, background: `${color}18`, padding: '3px 10px', borderRadius: 'var(--r-full)', marginBottom: 10 }}>{a.category}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, marginBottom: 8 }}>{a.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 14, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {a.read_time && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {a.read_time}</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {fmtDate(a.published_at)}</span>
                        <ChevronRight size={15} style={{ marginLeft: 'auto', color }} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
