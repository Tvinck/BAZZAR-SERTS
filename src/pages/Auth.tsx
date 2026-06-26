import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const udid = searchParams.get('udid');
    const model = searchParams.get('model');

    if (udid) {
      localStorage.setItem('apple_udid', udid);
      if (model) {
        localStorage.setItem('apple_device_model', model);
      }
      
      // Redirect to personal cabinet
      navigate('/cabinet', { replace: true });
    } else {
      // If no UDID, redirect back home
      navigate('/', { replace: true });
    }
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
