import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { useI18n } from '../hooks/useI18n';

export function Auth() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticate = async () => {
      const udid = searchParams.get('udid');
      const model = searchParams.get('model');

      if (udid) {
        localStorage.setItem('apple_udid', udid);
        localStorage.setItem('bazzar_udid', udid);
        if (model) {
          localStorage.setItem('apple_device_model', model);
        }

        // Auto-register device in bazzar_devices (own device)
        try {
          await supabase.from('bazzar_devices').upsert({
            owner_udid: udid,
            device_udid: udid,
            model: model || null,
            display_name: model || 'Apple устройство',
          }, { onConflict: 'owner_udid,device_udid' });
        } catch (e) {
          console.error('Failed to register device:', e);
        }

        // Manual-registration flow (Авито): привязываем UDID к заявке и возвращаемся
        // на страницу /r/:code для шага оплаты. Имеет приоритет над обычным флоу.
        const pendingReg = localStorage.getItem('pending_registration_code');
        if (pendingReg) {
          try {
            await fetch('https://connect-4va6.vercel.app/api/registration/link-udid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: pendingReg, udid, model }),
            });
          } catch (e) {
            console.error('Failed to link registration udid', e);
          }
          localStorage.removeItem('pending_registration_code');
          navigate(`/r/${pendingReg}`, { replace: true });
          return;
        }
        
        // Check if user exists in Supabase
        const { data, error } = await supabase.from('bazzar_users').select('udid').eq('udid', udid).maybeSingle();
        
        // If not found, create a basic profile.
        // Запись bazzar_users создаётся на сервере в /api/crm/lead (service role) —
        // прямой anon-insert отсюда запрещён RLS и раньше молча падал.
        if (!data && !error) {
          trackEvent('registrations');
          
          // Capture source and create CRM lead
          const pendingOrderStr = localStorage.getItem('pending_shop_order');
          const pendingGGSelLegacyCRM = localStorage.getItem('pending_ggsel_order'); // fallback for CRM source detection
          const storedSource = localStorage.getItem('bazzar_source');
          let leadSource = storedSource || 'Сайт';
          
          if (pendingOrderStr) {
            try {
              const parsed = JSON.parse(pendingOrderStr);
              leadSource = parsed.shop === 'digiseller' ? 'Digiseller' : 'GGsel';
            } catch (e) {}
          } else if (pendingGGSelLegacyCRM) {
            leadSource = 'GGsel';
          }

          try {
            await fetch('/api/crm/lead', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                udid, 
                deviceModel: model,
                source: leadSource 
              })
            });
          } catch (e) {
            console.error('Failed to create CRM lead', e);
          }

          // Track referral if user came from ?ref= link
          if (storedSource && storedSource.length >= 4 && storedSource.length <= 12) {
            try {
              await supabase.from('bazzar_referrals').upsert({
                referrer_code: storedSource,
                referred_udid: udid,
              }, { onConflict: 'referrer_code,referred_udid' });
            } catch (e) {
              console.error('Failed to save referral', e);
            }
          }
        }

        // Link pending shop order if exists
        const pendingOrder = localStorage.getItem('pending_shop_order');
        const pendingGGSelLegacy = localStorage.getItem('pending_ggsel_order'); // Legacy fallback — no longer written but may exist from older sessions
        
        let pendingCodeToLink = null;
        let pendingShopToLink = 'ggsel';
        
        if (pendingOrder) {
          try {
            const parsed = JSON.parse(pendingOrder);
            pendingCodeToLink = parsed.code;
            pendingShopToLink = parsed.shop;
          } catch (e) {}
        } else if (pendingGGSelLegacy) {
          pendingCodeToLink = pendingGGSelLegacy;
        }

        if (pendingCodeToLink) {
          try {
            const linkRes = await fetch(`https://connect-4va6.vercel.app/api/shop/${pendingShopToLink}/link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uniquecode: pendingCodeToLink, udid })
            });
            const linkData = await linkRes.json().catch(() => ({ success: false }));
            if (linkRes.ok && linkData.success !== false) {
              localStorage.removeItem('pending_shop_order');
              localStorage.removeItem('pending_ggsel_order');
              navigate('/cabinet', { replace: true });
              return;
            } else {
              console.error('Link API returned error:', linkData);
              // Don't remove pending order — user can retry from cabinet
            }
          } catch (e) {
            console.error('Failed to link order', e);
          }
        }
        
        // Возобновление покупки приложения (пользователь нажал «Купить» на /apps без UDID)
        const pendingApp = localStorage.getItem('pending_app_purchase');
        if (pendingApp) {
          localStorage.removeItem('pending_app_purchase');
          try {
            const { appId } = JSON.parse(pendingApp);
            if (appId) {
              navigate(`/catalog?category=apps&buy=${encodeURIComponent(appId)}`, { replace: true });
              return;
            }
          } catch { /* ignore malformed intent */ }
        }

        // Redirect to personal cabinet
        navigate('/cabinet', { replace: true });
      } else {
        // If no UDID, redirect back home
        navigate('/', { replace: true });
      }
    };
    
    authenticate();
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--hair-strong)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
          {t('auth.title')}
        </h1>
        <p style={{ color: 'var(--text-2)' }}>{t('auth.desc')}</p>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
