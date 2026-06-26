import { motion } from 'framer-motion'
import { Link, useNav } from '../ui/nav'
import { BazzarMark, BazzarWordmark, SearchIcon, CartIcon, WalletIcon, UserIcon, MenuIcon } from '../ui/Icons'

export function Header() {
  const navigate = useNav()
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 0', background: 'var(--bg)', borderBottom: '1px solid var(--hair)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        
        {/* Лого */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BazzarMark size={28} />
          <div className="mobile-hide"><BazzarWordmark size="1.2rem" /></div>
        </Link>

        {/* Поиск */}
        <div className="mobile-hide" style={{ flex: 1, position: 'relative', maxWidth: 420 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><SearchIcon size={18} /></span>
          <input className="field" placeholder="Поиск (TikTok, Scarlet, Сертификаты)…" style={{ paddingLeft: 42, height: 40, borderRadius: 'var(--radius-sm)' }}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/catalog') }} />
        </div>

        {/* Навигация */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/catalog')} className="btn btn-ghost" style={{ padding: '8px 16px', border: 'none' }}>
            Каталог
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/cart')} className="btn btn-ghost" aria-label="Корзина" style={{ padding: '8px 12px' }}>
            <CartIcon size={20} />
          </motion.button>
          <button className="btn btn-primary" onClick={() => navigate('/cabinet')}>
            Кабинет <UserIcon size={16} />
          </button>
        </div>

      </div>
    </header>
  )
}
