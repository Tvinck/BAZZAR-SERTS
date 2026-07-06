import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Lock, ShieldCheck, LifeBuoy } from 'lucide-react';

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
      let retries = 10;
      while (retries > 0) {
        try {
          // Запрос к бэкенду Connect для верификации и сохранения заказа GGSel
          const res = await fetch(`https://connect-4va6.vercel.app/api/shop/ggsel/verify?uniquecode=${uniquecode}`);
          const data = await res.json();

          if (res.ok && data.success) {
            setOrder(data);
            
            // Проверяем, есть ли уже UDID
            const existingUdid = localStorage.getItem('apple_udid');
            if (existingUdid) {
              // Если есть, сразу привязываем заказ
              const linkRes = await fetch('https://connect-4va6.vercel.app/api/shop/ggsel/link', {
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
              return;
            }
          }
          
          // Если заказ еще не найден, ждем 3 секунды и пробуем снова
          retries--;
          if (retries === 0) {
            setError(data.error || 'Ошибка проверки заказа. Пожалуйста, обновите страницу.');
            setLoading(false);
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (err) {
          retries--;
          if (retries === 0) {
            setError('Сетевая ошибка при проверке заказа');
            setLoading(false);
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
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
        
        {/* Предупреждение о защите устройства */}
        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', marginTop: 8 }}>
          <ShieldAlert size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>Защита украденного устройства</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
              Если на вашем iPhone включена «Защита украденного устройства» и вы находитесь вдали от знакомых мест (дома или работы), Apple может попросить <b>подождать 1 час</b> перед установкой профиля. Это нормально. Просто дождитесь окончания таймера и повторите попытку установки профиля.
            </div>
          </div>
        </div>

        <button 
          onClick={handleGetUdid}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8, padding: '16px 24px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
        >
          <Lock size={18} />
          Получить UDID
        </button>

        {/* Блок FAQ */}
        <div style={{ marginTop: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <ShieldCheck size={20} style={{ color: 'var(--lime)' }} />
              <div style={{ fontWeight: 700 }}>Это безопасно? Зачем нужен UDID?</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', paddingLeft: 32 }}>
              UDID — это уникальный идентификатор вашего устройства (как VIN у автомобиля). Он нужен <b>исключительно</b> для того, чтобы добавить ваш iPhone в аккаунт разработчика Apple. Профиль конфигурации собирает только этот номер и ничего больше. Это стандартная и полностью безопасная процедура Apple.
            </div>
          </div>

          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <LifeBuoy size={20} style={{ color: 'var(--cyan)' }} />
              <div style={{ fontWeight: 700 }}>Возникли проблемы?</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', paddingLeft: 32 }}>
              Если у вас что-то не получается, сайт выдает ошибку или вы случайно закрыли нужную вкладку — не переживайте. <br/>
              Напишите в нашу <a href="https://t.me/SUPPORT_TG" target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Службу поддержки</a>, прикрепите код вашего заказа, и мы с радостью поможем вам завершить настройку!
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
