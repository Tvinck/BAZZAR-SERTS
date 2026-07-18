import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, LifeBuoy, Lock, CheckCircle, CreditCard } from 'lucide-react';

const CONNECT = 'https://connect-4va6.vercel.app';

interface RegData {
  platform: string;
  guaranteeMonths: number;
  price: number;
  status: string;
  hasUdid: boolean;
  extraInfo: string | null;
}

/**
 * Страница спец-ссылки «Ручной регистрации» под Авито: /r/:code
 * Шаг 1 — получить UDID (установка профиля), Шаг 2 — оплата через Т-Банк.
 */
export function Registration() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<RegData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [email, setEmail] = useState('');

  const localUdid = typeof window !== 'undefined' ? localStorage.getItem('apple_udid') : null;

  useEffect(() => {
    if (!code) {
      setError('Ссылка недействительна');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`${CONNECT}/api/registration/${code}`, { headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || 'Заявка не найдена');
        } else {
          setData(json.data as RegData);
        }
      } catch {
        setError('Ошибка сети. Обновите страницу.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  const handleGetUdid = () => {
    if (code) localStorage.setItem('pending_registration_code', code);
    window.location.href = '/api/udid/generate';
  };

  const handlePay = async () => {
    if (!code) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Укажите корректный email — на него придёт чек.');
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`${CONNECT}/api/registration/${code}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), returnUrl: `${window.location.origin}/success?code=${code}` }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        setError(json.error || 'Не удалось перейти к оплате. Попробуйте позже.');
        setPaying(false);
      }
    } catch {
      setError('Ошибка сети при переходе к оплате.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, width: 40, height: 40, border: '4px solid var(--surface-2)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-2)' }}>Загружаем заявку…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', padding: '0 16px' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(248, 113, 113, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg style={{ width: 32, height: 32, color: 'var(--red)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 12 }}>Ссылка недействительна</h1>
        <p style={{ color: 'var(--text-2)', maxWidth: 400, marginBottom: 32 }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">На главную</button>
      </div>
    );
  }

  const reg = data!;
  const hasUdid = !!localUdid || reg.hasUdid;
  const isPaid = reg.status === 'paid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px' }}
    >
      {/* Карточка тарифа */}
      <div className="card" style={{ padding: 24, marginBottom: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Ваш заказ</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Сертификат Apple</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>Гарантия {reg.guaranteeMonths} мес.</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{reg.price} ₽</div>
        </div>
        {reg.extraInfo && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', borderTop: '1px solid var(--hair)', paddingTop: 12 }}>
            {reg.extraInfo}
          </div>
        )}
      </div>

      {/* Прогресс: шаги */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <StepPill n={1} label="Устройство" active={!hasUdid} done={hasUdid} />
        <StepPill n={2} label="Оплата" active={hasUdid && !isPaid} done={isPaid} />
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {isPaid ? (
        // ── Оплачено ────────────────────────────────────────────────────────
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(163, 230, 53, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={40} style={{ color: 'var(--lime)' }} />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.8rem' }}>Оплачено!</h1>
          <p style={{ color: 'var(--text-2)' }}>
            Сертификат готовится. Мы уведомим вас, как только он будет выпущен. Статус можно отслеживать в личном кабинете.
          </p>
          <button onClick={() => navigate('/cabinet')} className="btn btn-primary" style={{ width: '100%' }}>Личный кабинет</button>
        </div>
      ) : !hasUdid ? (
        // ── Шаг 1: UDID ─────────────────────────────────────────────────────
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Шаг 1. Регистрация устройства</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-2)' }}>
            Для выпуска сертификата нам нужен UDID вашего iPhone. Нажмите кнопку и установите профиль конфигурации Apple — номер соберётся автоматически.
          </p>

          <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <ShieldAlert size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>Защита украденного устройства</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                Если включена «Защита украденного устройства» и вы вдали от дома/работы, Apple может попросить <b>подождать 1 час</b>. Это нормально — дождитесь таймера и повторите.
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--hair-strong)', borderRadius: 12, padding: 16, textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Краткая инструкция:</div>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Нажмите <b>«Получить UDID»</b> ниже.</li>
              <li>В окне браузера нажмите <b>«Разрешить»</b>.</li>
              <li>Откройте <b>«Настройки»</b> iPhone → <b>«Профиль загружен»</b> → <b>«Установить»</b>.</li>
              <li>После установки вас вернёт сюда для оплаты.</li>
            </ol>
          </div>

          <button onClick={handleGetUdid} className="btn btn-primary" style={{ width: '100%', marginTop: 4, padding: '16px 24px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <Lock size={18} /> Получить UDID
          </button>

          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <ShieldCheck size={20} style={{ color: 'var(--lime)' }} />
              <div style={{ fontWeight: 700 }}>Это безопасно?</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', paddingLeft: 32 }}>
              UDID — уникальный идентификатор устройства. Он нужен только для добавления вашего iPhone в аккаунт разработчика Apple. Профиль собирает лишь этот номер.
            </div>
          </div>
        </div>
      ) : (
        // ── Шаг 2: Оплата ───────────────────────────────────────────────────
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Шаг 2. Оплата</h3>
          <div style={{ background: 'rgba(163, 230, 53, 0.08)', border: '1px solid rgba(163,230,53,0.25)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <CheckCircle size={22} style={{ color: 'var(--lime)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>Устройство зарегистрировано. Осталось оплатить заказ.</div>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-2)' }}>
            Оплата проходит через защищённый шлюз Т-Банка. После оплаты сертификат будет выпущен, а статус появится в личном кабинете.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 600, marginBottom: 6 }}>Email для чека</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--hair)', color: 'var(--text)', padding: '12px 14px', borderRadius: 12, outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <button onClick={handlePay} disabled={paying} className="btn btn-primary" style={{ width: '100%', padding: '16px 24px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, opacity: paying ? 0.6 : 1 }}>
            <CreditCard size={18} /> {paying ? 'Переходим к оплате…' : `Оплатить ${reg.price} ₽`}
          </button>

          <div className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <LifeBuoy size={20} style={{ color: 'var(--cyan)' }} />
              <div style={{ fontWeight: 700 }}>Возникли проблемы?</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', paddingLeft: 32 }}>
              Напишите в <a href="https://t.me/SUPPORT_TG" target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>поддержку</a> — поможем завершить заказ.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StepPill({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  const color = done ? 'var(--lime)' : active ? 'var(--text)' : 'var(--text-3)';
  const bg = done ? 'rgba(163,230,53,0.12)' : active ? 'var(--surface-2)' : 'transparent';
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: bg, border: '1px solid var(--hair)' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: done ? 'var(--lime)' : 'var(--surface-3)', color: done ? '#000' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
        {done ? '✓' : n}
      </span>
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color }}>{label}</span>
    </div>
  );
}
