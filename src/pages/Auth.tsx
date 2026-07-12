import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

export function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticate = async () => {
      const udid = searchParams.get('udid');
      const model = searchParams.get('model');

      if (udid) {
        localStorage.setItem('apple_udid', udid);
        if (model) {
          localStorage.setItem('apple_device_model', model);
        }
        
        // Check if user exists in Supabase
        const { data, error } = await supabase.from('bazzar_users').select('udid').eq('udid', udid).maybeSingle();
        
        // If not found, create a basic profile
        if (!data && !error) {
          await supabase.from('bazzar_users').insert([{
            udid,
            status: 'thinking',
            created_at: new Date().toISOString()
          }]);
          trackEvent('registrations');
          
          // Capture source and create CRM lead
          const pendingOrderStr = localStorage.getItem('pending_shop_order');
          const pendingGGSelLegacy = localStorage.getItem('pending_ggsel_order'); // fallback
          const storedSource = localStorage.getItem('bazzar_source');
          let leadSource = storedSource || 'Сайт';
          
          if (pendingOrderStr) {
            try {
              const parsed = JSON.parse(pendingOrderStr);
              leadSource = parsed.shop === 'digiseller' ? 'Digiseller' : 'GGsel';
            } catch (e) {}
          } else if (pendingGGSelLegacy) {
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
        }

        // Link pending shop order if exists
        const pendingOrderStr = localStorage.getItem('pending_shop_order');
        const pendingGGSelLegacy = localStorage.getItem('pending_ggsel_order');
        
        let pendingCodeToLink = null;
        let pendingShopToLink = 'ggsel';
        
        if (pendingOrderStr) {
          try {
            const parsed = JSON.parse(pendingOrderStr);
            pendingCodeToLink = parsed.code;
            pendingShopToLink = parsed.shop;
          } catch (e) {}
        } else if (pendingGGSelLegacy) {
          pendingCodeToLink = pendingGGSelLegacy;
        }

        if (pendingCodeToLink) {
          try {
            await fetch(`https://connect-4va6.vercel.app/api/shop/${pendingShopToLink}/link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uniquecode: pendingCodeToLink, udid })
            });
            localStorage.removeItem('pending_shop_order');
            localStorage.removeItem('pending_ggsel_order');
            navigate('/success?uniquecode=' + pendingCodeToLink, { replace: true });
            return;
          } catch (e) {
            console.error('Failed to link order', e);
          }
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
          Авторизация...
        </h1>
        <p style={{ color: 'var(--text-2)' }}>Проверяем профиль устройства</p>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
