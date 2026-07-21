import { createClient } from '@supabase/supabase-js';

// Публичная витринная статистика (service role): счётчик «довольных клиентов»
// = база + реальные заказы, и последние реальные покупки (анонимно) для
// «социального доказательства». Anon-ключ читать заказы не может (RLS), поэтому
// считаем здесь, на сервере.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_CLIENTS = 1757; // стартовая база, чтобы «0» не подрывал доверие

function cleanProductName(planId) {
  if (!planId) return 'Сертификат Apple';
  // UUID → generic
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId)) return 'Сертификат Apple';
  return planId;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (!supabaseKey) {
    return res.status(200).json({ clients: BASE_CLIENTS, recent: [] });
  }

  try {
    const [{ count }, { data: rows }] = await Promise.all([
      supabase.from('apple_certificates').select('*', { count: 'exact', head: true }),
      supabase.from('apple_certificates').select('plan_id, created_at').order('created_at', { ascending: false }).limit(12),
    ]);

    const recent = (rows || []).map((r) => ({
      product: cleanProductName(r.plan_id),
      at: r.created_at,
    }));

    return res.status(200).json({ clients: BASE_CLIENTS + (count || 0), recent });
  } catch (err) {
    console.error('stats error:', err);
    return res.status(200).json({ clients: BASE_CLIENTS, recent: [] });
  }
}
