import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', textAlign: 'center', padding: '40px 16px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Glow effect behind mascot */}
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, top: '20%' }} />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}
      >
        {/* Animated Mascot Wrapper */}
        <div className="float-mascot" style={{ position: 'relative', marginBottom: 28 }}>
          <img 
            src="/img/mascot_raccoon.png" 
            style={{ width: 180, height: 180, borderRadius: '24px', border: '1px solid var(--hair-strong)', boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)' }} 
            alt="Confused Mascot" 
          />
          <span style={{ position: 'absolute', top: -15, right: -15, background: 'var(--red)', color: '#000', fontSize: '0.85rem', fontWeight: 900, padding: '4px 10px', borderRadius: 100, border: '2px solid var(--bg)', boxShadow: '0 5px 15px rgba(248, 113, 113, 0.4)', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
            Ошибка
          </span>
        </div>

        {/* 404 Code with Neon Glow */}
        <h1 style={{ fontSize: 'clamp(4.5rem, 10vw, 6.5rem)', fontWeight: 900, margin: 0, lineHeight: 0.9, letterSpacing: '-0.05em', color: '#fff', textShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '14px 0 10px', color: '#fff', letterSpacing: '-0.02em' }}>
          СТРАНИЦА ПОТЕРЯЛАСЬ В СЕТИ
        </h2>

        <p style={{ color: 'var(--text-2)', maxWidth: 440, margin: '0 auto 36px', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Енот-саппорт обшарил все закоулки, но этот адрес не существует или был перенесен. Попробуем вернуться назад?
        </p>

        {/* Action Button */}
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255, 255, 255, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')} 
          className="btn btn-primary"
          style={{ padding: '14px 28px', border: '1px solid #fff', background: 'linear-gradient(135deg, #fff 0%, #e4e4e7 100%)', color: '#000', boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)' }}
        >
          На главную
        </motion.button>

      </motion.div>
    </div>
  );
}
