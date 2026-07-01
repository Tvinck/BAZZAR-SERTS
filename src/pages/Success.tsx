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

      try {
        // Запрос к бэкенду Connect для верификации и сохранения заказа GGSel
        const res = await fetch(`https://connect.tvinck.ru/api/shop/ggsel/verify?uniquecode=${uniquecode}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setOrder(data);
          
          // Проверяем, есть ли уже UDID
          const existingUdid = localStorage.getItem('apple_udid');
          if (existingUdid) {
            // Если есть, сразу привязываем заказ
            const linkRes = await fetch('https://connect.tvinck.ru/api/shop/ggsel/link', {
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, width: 40, height: 40, border: '4px solid var(--surface-2)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h1 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Обработка заказа...</h1>
        <p style={{ color: 'var(--text-2)' }}>Связываемся с GGsel / Digiseller</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', padding: '0 16px' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(248, 113, 113, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg style={{ width: 32, height: 32, color: 'var(--red)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 12 }}>Ошибка активации</h1>
        <p style={{ color: 'var(--text-2)', maxWidth: 400, marginBottom: 32 }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 480, margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}
    >
      <div style={{ width: 80, height: 80, background: 'rgba(163, 230, 53, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg style={{ width: 40, height: 40, color: 'var(--lime)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: 12 }}>
        Спасибо за покупку!
      </h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: '1.1rem' }}>
        Ваш заказ успешно оплачен. Остался всего один шаг.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 32, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Товар</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{order?.item_name || 'Сертификат Apple'}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Номер заказа (Код)</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1rem', background: 'var(--bg)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--hair)', wordBreak: 'break-all' }}>
            {order?.uniquecode}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Привязка устройства</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-2)' }}>
          Для оформления сертификата разработчика нам необходим UDID вашего устройства. Нажмите кнопку ниже и установите профиль конфигурации Apple.
        </p>
        <button 
          onClick={handleGetUdid}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16, padding: '16px 24px', fontSize: '1rem' }}
        >
          Получить UDID
        </button>
      </div>
    </motion.div>
  );
}
