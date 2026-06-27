import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '0 16px' }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: 120, height: 120, marginBottom: 32, background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--hair)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
      >
        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)' }}>
          404
        </span>
      </motion.div>
      
      <h1 className="section-title" style={{ marginBottom: 12 }}>Страница не найдена</h1>
      <p style={{ color: 'var(--text-2)', maxWidth: 400, margin: '0 auto 32px', fontSize: '1.1rem' }}>
        Похоже, вы перешли по неверной ссылке или страница была удалена.
      </p>

      <button 
        onClick={() => navigate('/')} 
        className="btn btn-primary"
      >
        На главную
      </button>
    </div>
  );
}
