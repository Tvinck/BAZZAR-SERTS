import { useState, useMemo } from 'react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { SearchIcon, SlidersIcon, CheckIcon, CoinIcon, CATEGORY_ICON } from '../ui/Icons'
import { CATEGORIES } from '../data/catalog'

const SORTS = ['Популярные', 'Сначала дешёвые', 'Сначала дорогие', 'Высокий рейтинг']

export function Catalog() {
  const [active, setActive] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState(0)
  const { products, loading } = useProducts()
  const list = useMemo(() => {
    let r = products.filter(p =>
      (!active || p.category === active) &&
      (!q || (p.title + (p.subtitle || '')).toLowerCase().includes(q.toLowerCase()))
    )
    if (sort === 0) r = [...r].sort((a, b) => b.sold - a.sold)
    if (sort === 1) r = [...r].sort((a, b) => a.price - b.price)
    if (sort === 2) r = [...r].sort((a, b) => b.price - a.price)
    if (sort === 3) r = [...r].sort((a, b) => b.rating - a.rating)
    return r
  }, [active, q, sort, products])

  return (
    <div style={{ position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 36, paddingBottom: 60 }}>
        <span className="kicker">Каталог</span>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', margin: '8px 0 24px' }}>Все цифровые товары</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }} className="cat-grid">
          {/* Фильтры */}
          <aside className="card mobile-hide" style={{ padding: 18, position: 'sticky', top: 90 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 14 }}>
              <span style={{ color: 'var(--violet)', display: 'flex' }}><SlidersIcon size={17} /></span> Категории
            </div>
            <button onClick={() => setActive(null)} style={catBtn(!active)}>
              <span>Все товары</span>{!active && <CheckIcon size={16} />}
            </button>
            {CATEGORIES.map(c => {
              const Icon = CATEGORY_ICON[c.id] ?? CoinIcon
              return (
              <button key={c.id} onClick={() => setActive(c.id)} style={catBtn(active === c.id)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Icon size={17} />{c.title}</span>
                {active === c.id && <CheckIcon size={16} />}
              </button>
              )
            })}
          </aside>

          {/* Контент */}
          <div style={{ minWidth: 0, width: '100%' }}>
            {/* Мобильные категории */}
            <div className="scroll-x-mobile" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
              <button onClick={() => setActive(null)} className="chip" style={{ whiteSpace: 'nowrap', cursor: 'pointer', ...(active === null ? { background: 'var(--text)', color: 'var(--bg)' } : {}) }}>Все</button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setActive(c.id)} className="chip" style={{ whiteSpace: 'nowrap', cursor: 'pointer', ...(active === c.id ? { background: 'var(--text)', color: 'var(--bg)' } : {}) }}>{c.title}</button>
              ))}
            </div>

            <div className="card" style={{ display: 'flex', gap: 12, padding: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 200px)' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex' }}><SearchIcon size={17} /></span>
                <input className="field" value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск…" style={{ paddingLeft: 38, height: 44 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', maxWidth: '100%', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
                {SORTS.map((s, i) => (
                  <button key={s} onClick={() => setSort(i)} className="chip" style={{ whiteSpace: 'nowrap', cursor: 'pointer', ...(sort === i ? { background: 'var(--text)', color: 'var(--bg)' } : {}) }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 14 }}>Найдено: {list.length}</div>
            {loading ? (
              <div className="grid-products">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="card" style={{ height: 320, background: 'var(--surface-2)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : list.length > 0 ? (
              <div className="grid-products">{list.map(p => <ProductCard key={p.id} product={p as any} />)}</div>
            ) : (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>Ничего не найдено 🙃 Попробуйте другой запрос.</div>
            )}
          </div>
        </div>
      </div>
      <style>{`@media (max-width:880px){ .cat-grid{ grid-template-columns:1fr !important } }`}</style>
    </div>
  )
}

function catBtn(activeState: boolean): React.CSSProperties {
  return {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 13px', borderRadius: 6, marginBottom: 4, border: 'none', textAlign: 'left',
    background: activeState ? 'var(--surface-2)' : 'transparent',
    color: activeState ? 'var(--text)' : 'var(--text-2)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer'
  }
}
