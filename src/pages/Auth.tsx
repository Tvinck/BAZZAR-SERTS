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
          const pendingOrder = localStorage.getItem('pending_ggsel_order');
          const storedSource = localStorage.getItem('bazzar_source');
          const leadSource = pendingOrder ? 'GGsel' : (storedSource || 'Сайт');

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

        // Link pending GGsel order if exists
        const pendingOrder = localStorage.getItem('pending_ggsel_order');
        if (pendingOrder) {
          try {
            await fetch('/api/ggsel/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uniquecode: pendingOrder, udid })
            });
            localStorage.removeItem('pending_ggsel_order');
            navigate('/success?uniquecode=' + pendingOrder, { replace: true });
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
