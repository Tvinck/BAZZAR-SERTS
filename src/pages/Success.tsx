import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';

export function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uniquecode = searchParams.get('uniquecode');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ item_name: string, uniquecode: string, status: string } | null>(null);

  useEffect(() => {
    if (!uniquecode) {
      setError('Код заказа не найден');
      setLoading(false);
      return;
    }

    const checkOrder = async () => {
      try {
        // Запрос к нашему API для верификации и сохранения заказа
        const res = await fetch(`/api/ggsel/callback?uniquecode=${uniquecode}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setOrder(data);
          
          // Проверяем, есть ли уже UDID
          const existingUdid = localStorage.getItem('apple_udid');
          if (existingUdid) {
            // Если есть, сразу привязываем заказ
            const linkRes = await fetch('/api/ggsel/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uniquecode, udid: existingUdid })
            });
            const linkData = await linkRes.json();
            
            if (linkRes.ok && linkData.success) {
              // Заказ привязан, перенаправляем в кабинет
              navigate('/cabinet', { replace: true });
              return;
            }
          } else {
            // Если UDID нет, сохраняем код заказа в памяти для привязки после получения UDID
            localStorage.setItem('pending_ggsel_order', uniquecode);
            setLoading(false);
          }
        } else {
          setError(data.error || 'Ошибка проверки заказа');
          setLoading(false);
        }
      } catch (err) {
        setError('Сетевая ошибка при проверке заказа');
        setLoading(false);
      }
    };

    checkOrder();
  }, [uniquecode, navigate]);

  const handleGetUdid = () => {
    trackEvent('get_udid_from_success');
    window.location.href = '/api/udid/generate';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-center">
        <div className="space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-white rounded-full animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-white tracking-tight">Обработка заказа...</h1>
          <p className="text-zinc-400">Связываемся с GGsel / Digiseller</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Ошибка активации</h1>
        <p className="text-zinc-400 max-w-sm mb-8">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors">
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-12 text-center"
    >
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
        Спасибо за покупку!
      </h1>
      <p className="text-zinc-400 mb-8">
        Ваш заказ успешно оплачен. Остался всего один шаг.
      </p>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 text-left space-y-4">
        <div>
          <div className="text-sm text-zinc-500 mb-1">Товар</div>
          <div className="text-white font-medium">{order?.item_name || 'Сертификат Apple'}</div>
        </div>
        <div>
          <div className="text-sm text-zinc-500 mb-1">Номер заказа (Уникальный код)</div>
          <div className="text-white font-mono text-sm bg-black/20 p-2 rounded-lg break-all">
            {order?.uniquecode}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Привязка устройства</h3>
        <p className="text-sm text-zinc-400">
          Для оформления сертификата разработчика нам необходим UDID вашего устройства. Нажмите кнопку ниже и установите профиль конфигурации Apple.
        </p>
        <button 
          onClick={handleGetUdid}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 mt-4"
        >
          Получить UDID
        </button>
      </div>
    </motion.div>
  );
}
