import { motion } from 'framer-motion'
import { Link } from '../ui/nav'
import { StarIcon, BoltIcon } from '../ui/Icons'
import type { Product } from '../data/catalog'

const badgeMap = {
  hot: { cls: 'badge-hot', text: '🔥 Хит' },
  new: { cls: 'badge-new', text: 'Новинка' },
  sale: { cls: 'badge-sale', text: 'Скидка' }
}

export function ProductCard({ product }: { product: Product }) {
  const b = product.badge ? badgeMap[product.badge] : null
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4 }}>
      <Link to={`/product/${product.id}`} className="card card-hover" style={{ display: 'block', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 160, background: 'var(--bg)', borderBottom: '1px solid var(--hair)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {product.image ? (
            <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
          ) : (
            <span style={{ fontSize: '3rem', zIndex: 1 }}>{product.emoji || '🛍️'}</span>
          )}
          {b && <span className={`badge ${b.cls}`} style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>{b.text}</span>}
          {discount > 0 && <span className="badge badge-sale" style={{ position: 'absolute', top: 12, right: 12, background: 'var(--bg)', color: 'var(--red)', zIndex: 2 }}>−{discount}%</span>}
        </div>
        {/* Тело */}
        <div style={{ padding: '14px 15px 16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.02rem', color: 'var(--text)' }}>{product.title}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 2 }}>{product.subtitle}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 14px', fontSize: '0.8rem', color: 'var(--text-2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}><StarIcon size={13} /> <span style={{ color: 'var(--text-2)' }}>{product.rating.toFixed(1)}</span></span>
            <span style={{ color: 'var(--text-3)' }}>{product.sold.toLocaleString('ru-RU')} продаж</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>{product.price > 0 ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Бесплатно'}</span>
                {product.oldPrice && <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>{product.oldPrice.toLocaleString('ru-RU')}</span>}
              </div>
            </div>
            <span className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 4 }}>Выбрать</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
