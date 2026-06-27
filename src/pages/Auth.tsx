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
    <div className="flex items-center justify-center min-h-[50vh] text-center">
      <div className="space-y-4">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-white rounded-full animate-spin mx-auto" />
        <h1 className="text-xl font-bold text-white tracking-tight">
          Авторизация...
        </h1>
        <p className="text-zinc-400">Проверяем профиль устройства</p>
      </div>
    </div>
  );
}
