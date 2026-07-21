import { createClient } from '@supabase/supabase-js';

// Публичные варианты тарифов товара (service role, БЕЗ себестоимости api_cost).
// bazzar_product_variants под anon не читается (RLS), + api_cost чувствителен —
// поэтому отдаём здесь только безопасные поля. Управляются из Connect (Каталог 2.0).

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const { productId } = req.query;
  if (!productId) return res.status(400).json({ error: 'productId required' });
  if (!supabaseKey) return res.status(200).json({ variants: [] });

  try {
    const { data } = await supabase
      .from('bazzar_product_variants')
      .select('id, name, guarantee_months, price, sort_order')
      .eq('product_id', productId)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('price', { ascending: true });

    const variants = (data || []).map((v) => ({
      id: v.id,
      name: v.name,
      guarantee_months: v.guarantee_months,
      price: v.price,
    }));
    return res.status(200).json({ variants });
  } catch (err) {
    console.error('variants error:', err);
    return res.status(200).json({ variants: [] });
  }
}
