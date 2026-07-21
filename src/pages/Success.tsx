import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/analytics';
import { useI18n } from '../hooks/useI18n';
import { useToast } from '../components/Toast';
import { SafariHint } from '../components/SafariHint';

import { ShieldAlert, Lock, ShieldCheck, LifeBuoy, Clock, RefreshCw, Search, Home } from 'lucide-react';

export function Success() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uniquecode = searchParams.get('uniquecode');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false); // заказ ещё не виден в GGSel API (лаг), не жёсткая ошибка
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
          // Запрос к бэкенду Connect для верификации
          let res = await fetch(`https://connect-4va6.vercel.app/api/shop/ggsel/verify?uniquecode=${uniquecode}&format=json`, {
            headers: { 'Accept': 'application/json' }
          });
          let data = await res.json();
          let shop = 'ggsel';

          // Если в GGSel заказ не найден (или вернул ошибку, но API ответил 200), пробуем Digiseller
          if (!res.ok || !data.success) {
            res = await fetch(`https://connect-4va6.vercel.app/api/shop/digiseller/verify?uniquecode=${uniquecode}&format=json`, {
              headers: { 'Accept': 'application/json' }
            });
            data = await res.json();
            shop = 'digiseller';
          }

          if (res.ok && data.success) {
            setOrder(data);
            
            // Проверяем, есть ли уже UDID
            const existingUdid = localStorage.getItem('apple_udid');
            if (existingUdid) {
              // Если есть, сразу привязываем заказ
              const linkRes = await fetch(`https://connect-4va6.vercel.app/api/shop/${shop}/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uniquecode, udid: existingUdid })
              });
              const linkData = await linkRes.json();
              
              if (linkRes.ok && linkData.success) {
                // Заказ привязан, перенаправляем в кабинет
                navigate('/cabinet', { replace: true });
                return;
              } else {
                // Привязка не удалась — сохраняем заказ для повторной попытки
                localStorage.setItem('pending_shop_order', JSON.stringify({ code: uniquecode, shop }));
                setError(linkData.error || 'Ошибка привязки заказа. Попробуйте обновить страницу.');
                setLoading(false);
                return;
              }
            } else {
              // Если UDID нет, сохраняем код заказа в памяти для привязки после получения UDID
              localStorage.setItem('pending_shop_order', JSON.stringify({ code: uniquecode, shop }));
              setLoading(false);
              return;
            }
          }
          
          // Если заказ еще не найден, ждем 3 секунды и пробуем снова.
          // Исчерпали попытки → это, скорее всего, лаг платёжной системы, а не ошибка.
          retries--;
          if (retries === 0) {
            setPending(true);
            setError('Платёжная система ещё передаёт данные о вашей оплате.');
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
    trackEvent('add_to_cart');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      toast(t('cabinet.login.mobileToast'));
      return;
    }
    window.location.href = '/api/udid/generate';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, width: 40, height: 40, border: '4px solid var(--surface-2)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h1 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>{t('success.loading')}</h1>
        <p style={{ color: 'var(--text-2)' }}>{t('success.loadingDesc')}</p>
      </div>
    );
  }

  if (error) {
    const accent = pending ? '#f59e0b' : '#f87171';
    const accentBg = pending ? 'rgba(245,158,11,0.12)' : 'rgba(248,113,113,0.12)';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '80px 16px 40px', maxWidth: 460, margin: '0 auto' }}>
        <div style={{ width: 72, height: 72, background: accentBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          {pending
            ? <Clock size={34} style={{ color: accent }} />
            : <svg style={{ width: 34, height: 34, color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>
          {pending ? 'Оплата обрабатывается' : t('success.errorTitle')}
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.6 }}>
          {pending
            ? 'Платёжная система ещё передаёт данные о вашей оплате — обычно это занимает 1–2 минуты. Нажмите «Проверить ещё раз» через минуту.'
            : error}
        </p>

        {uniquecode && (
          <div style={{ margin: '10px 0 24px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-3)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', wordBreak: 'break-all' }}>
            Код заказа: {uniquecode}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Проверить ещё раз
          </button>
          <Link to={`/order-check${uniquecode ? `?code=${encodeURIComponent(uniquecode)}` : ''}`} className="btn btn-soft" style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
            <Search size={16} /> Проверить по коду заказа
          </Link>
          <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Home size={16} /> На главную
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 20, lineHeight: 1.5 }}>
          Если через несколько минут заказ не появился — напишите в поддержку и пришлите код заказа.
        </p>
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
        {t('success.title')}
      </h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: '1.1rem' }}>
        {t('success.subtitle')}
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 32, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t('success.item')}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{order?.item_name || t('success.defaultItem')}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t('success.orderId')}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1rem', background: 'var(--bg)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--hair)', wordBreak: 'break-all' }}>
            {order?.uniquecode}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--display)' }}>{t('success.bindTitle')}</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-2)' }}>
          {t('success.bindDesc')}
        </p>
        
        {/* Предупреждение о защите устройства */}
        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', marginTop: 8 }}>
          <ShieldAlert size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>{t('success.stolenProtect')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }} dangerouslySetInnerHTML={{ __html: t('success.stolenDesc') }} />
          </div>
        </div>

        {/* Пошаговая инструкция */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--hair-strong)', borderRadius: 12, padding: '16px', marginTop: 8, textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-2)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 20, height: 20, background: 'var(--text)', color: 'var(--bg)', borderRadius: '50%', fontSize: '0.75rem' }}>i</span>
            {t('success.guideTitle')}
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li dangerouslySetInnerHTML={{ __html: t('success.guide1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('success.guide2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('success.guide3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('success.guide4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('success.guide5') }} />
          </ol>
        </div>

        <SafariHint />

        <button
          onClick={handleGetUdid}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8, padding: '16px 24px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
        >
          <Lock size={18} />
          {t('success.getUdid')}
        </button>

        {/* Блок FAQ */}
        <div style={{ marginTop: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <ShieldCheck size={20} style={{ color: 'var(--lime)' }} />
              <div style={{ fontWeight: 700 }}>{t('success.faqTitle')}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', paddingLeft: 32 }} dangerouslySetInnerHTML={{ __html: t('success.faqDesc') }} />
          </div>

          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <LifeBuoy size={20} style={{ color: 'var(--cyan)' }} />
              <div style={{ fontWeight: 700 }}>{t('success.supportTitle')}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', paddingLeft: 32 }} dangerouslySetInnerHTML={{ __html: t('success.supportDesc') }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
