import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-32 h-32 mb-8 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl"
      >
        <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          404
        </span>
      </motion.div>
      
      <h1 className="text-3xl font-bold text-white mb-3">Страница не найдена</h1>
      <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">
        Похоже, вы перешли по неверной ссылке или страница была удалена.
      </p>

      <button 
        onClick={() => navigate('/')} 
        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
      >
        На главную
      </button>
    </div>
  );
}
