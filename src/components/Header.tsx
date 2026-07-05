import { motion } from 'framer-motion'
import { Link, useNav } from '../ui/nav'
import { BazzarMark, BazzarWordmark, SearchIcon, UserIcon, MenuIcon } from '../ui/Icons'

export function Header() {
  const navigate = useNav()

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        
        {/* Лого */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <img src="/img/mascot_raccoon.png" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--hair-strong)', boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }} alt="Mascot" />
            <span style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--bg)', borderRadius: '50%', padding: 2, display: 'flex' }}><BazzarMark size={14} /></span>
          </div>
          <div className="mobile-hide"><BazzarWordmark size="1.2rem" /></div>
        </Link>

        {/* Поиск */}
        <div className="mobile-hide" style={{ flex: 1, position: 'relative', maxWidth: 420 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><SearchIcon size={18} /></span>
          <input className="field" placeholder="Поиск (TikTok, Scarlet, Сертификаты)…" style={{ paddingLeft: 42, height: 40, borderRadius: 'var(--radius-sm)' }}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/catalog') }} />
        </div>

        {/* Навигация */}
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/catalog')} className="btn btn-ghost" style={{ padding: '8px 16px', border: 'none' }}>
            Каталог
          </motion.button>
          <button className="btn btn-primary" onClick={() => navigate('/cabinet')}>
            Кабинет <UserIcon size={16} />
          </button>
        </div>

      </div>
    </header>
  )
}
