import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldIcon, CartIcon, CreditCardIcon, CheckIcon } from '../ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

export function PaymentModal({ 
  isOpen, 
  onClose, 
  total, 
  hasCert,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  total: number;
  hasCert: boolean;
  onSuccess: () => void;
}) {
  const [udid, setUdid] = useState('');
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    if (hasCert && udid.length < 5) {
      setError('Пожалуйста, укажите корректный UDID');
      return;
    }
    if (card !== '1' || exp !== '1' || cvv !== '1') {
      setError('Тестовая оплата: введите 1 во все поля карты');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Создаем транзакцию в финансах (проект Bazzar Certs)
      await supabase.from('transactions').insert({
        project_id: '664df04a-6e83-4681-8019-49b8e23da317', // Bazzar Certs ID
        type: 'income',
        amount: total,
        description: 'Оплата заказа на сайте Bazzar Market',
        category: 'revenue',
        date: new Date().toISOString().split('T')[0],
      });

      // 2. Отправляем уведомление Артему Кошелеву
      await supabase.from('notifications').insert({
        user_id: '99fc4e1a-e44c-40e1-b2ef-cddb6ec94bf6', // Artem ID
        type: 'info',
        title: 'Новый заказ в Bazzar Market',
        body: `Сумма: ${total} ₽.${hasCert ? ` UDID: ${udid}` : ''}`,
        link: '/projects/bazzar-certs'
      });

      // 3. Записываем юзера, если был куплен сертификат
      if (hasCert) {
        // Создаем заявку на сертификат, чтобы она появилась в "Регистрации сертификатов" и улетела в Пачку
        await supabase.from('apple_certificates').insert({
          udid: udid,
          plan_id: total > 1000 ? 'vip' : 'base',
          source: 'Bazzar Market',
          sale_price: total,
          api_cost: 0,
          status: 'pending',
          crm_status: 'pending'
        });

        // Также сохраняем или обновляем пользователя в базе Bazzar
        await supabase.from('bazzar_users').upsert({
          udid: udid,
          status: 'bought',
          last_purchase: new Date().toISOString(),
          plan: 'Новый сертификат (Из корзины)'
        }, { onConflict: 'udid' });
      }

      // 4. Обновляем аналитику
      const today = new Date().toISOString().split('T')[0];
      const { data: analyticsRow } = await supabase.from('bazzar_analytics').select('*').eq('date', today).single();
      
      if (analyticsRow) {
        await supabase.from('bazzar_analytics').update({ orders: analyticsRow.orders + 1 }).eq('id', analyticsRow.id);
      } else {
        await supabase.from('bazzar_analytics').insert({
          date: today,
          orders: 1,
          unique_visitors: 1,
          registrations: hasCert ? 1 : 0
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Ошибка при оплате');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }} 
          onClick={loading || success ? undefined : onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card" 
          style={{ position: 'relative', width: '100%', maxWidth: 440, padding: 32, overflow: 'hidden' }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#000' }}>
                <CheckIcon size={40} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 10 }}>Оплата прошла!</h2>
              <p style={{ color: 'var(--text-3)' }}>Спасибо за заказ. Ожидайте выдачи.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Оплата заказа</h2>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>{total.toLocaleString()} ₽</div>
              </div>

              {error && (
                <div style={{ background: 'rgba(255,84,112,0.1)', color: 'var(--red)', padding: '12px 16px', borderRadius: 12, fontSize: '0.9rem', marginBottom: 20, border: '1px solid rgba(255,84,112,0.2)' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {hasCert && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 8, fontWeight: 600 }}>Ваш UDID (для сертификата)</label>
                    <input 
                      value={udid} 
                      onChange={e => setUdid(e.target.value)}
                      className="field" 
                      placeholder="Например: 00008110-000A18..." 
                      style={{ height: 48 }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 8, fontWeight: 600 }}>Данные карты (введите 1-1-1)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        value={card} 
                        onChange={e => setCard(e.target.value)}
                        className="field" 
                        placeholder="Номер карты" 
                        style={{ height: 48, paddingLeft: 42 }}
                      />
                      <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-3)', display: 'flex' }}>
                        <CreditCardIcon size={18} />
                      </span>
                    </div>
                    <input 
                      value={exp} 
                      onChange={e => setExp(e.target.value)}
                      className="field" 
                      placeholder="MM/YY" 
                      style={{ height: 48, textAlign: 'center' }}
                    />
                    <input 
                      value={cvv} 
                      onChange={e => setCvv(e.target.value)}
                      className="field" 
                      placeholder="CVV" 
                      type="password"
                      style={{ height: 48, textAlign: 'center' }}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePay} 
                className="btn btn-primary" 
                style={{ width: '100%', height: 54, marginTop: 30, fontSize: '1.05rem' }}
                disabled={loading}
              >
                {loading ? 'Обработка...' : `Оплатить ${total.toLocaleString()} ₽`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, fontSize: '0.8rem', color: 'var(--text-3)' }}>
                <span style={{ color: 'var(--green)', display: 'flex' }}><ShieldIcon size={15} /></span> Безопасная тестовая оплата
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
