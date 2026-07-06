import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GGSEL_API_KEY = process.env.GGSEL_API_KEY;
const GGSEL_SELLER_ID = process.env.GGSEL_SELLER_ID;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uniquecode = req.query.uniquecode || req.body?.uniquecode;
  
  if (!uniquecode) {
    return res.status(400).json({ error: 'uniquecode is required' });
  }

  // --- МАКЕТ ДЛЯ ТЕСТИРОВАНИЯ ---
  if (uniquecode === 'TEST_CODE') {
    return res.status(200).json({
      success: true,
      uniquecode: 'TEST_CODE',
      item_name: 'Сертификат Apple разработчика (Тест)',
      status: 'pending_udid'
    });
  }
  // -----------------------------

  if (!GGSEL_API_KEY || !GGSEL_SELLER_ID) {
    console.error('GGSEL_API_KEY or GGSEL_SELLER_ID is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = crypto.createHash('sha256').update(GGSEL_API_KEY + timestamp).digest('hex');

    const tokenRes = await fetch('https://api.digiseller.ru/api/apilogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seller_id: GGSEL_SELLER_ID, timestamp, sign })
    });
    
    const tokenData = await tokenRes.json();
    if (tokenData.retval !== 0) {
      return res.status(500).json({ error: 'Failed to auth with GGsel', details: tokenData });
    }
    
    const token = tokenData.token;

    const purchaseRes = await fetch(`https://api.digiseller.ru/api/purchases/unique-code/${uniquecode}?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    const purchaseData = await purchaseRes.json();
    
    if (purchaseData.retval !== 0) {
      return res.status(400).json({ error: 'Invalid unique code', details: purchaseData });
    }

    const itemName = purchaseData.name_goods || 'Apple Certificate';
    const amount = purchaseData.amount || 0;
    
    // Save to Supabase bazzar_orders
    const { error: dbError } = await supabase.from('bazzar_orders').upsert({
      uniquecode: uniquecode,
      item_name: itemName,
      price: amount,
      status: 'pending_udid',
      created_at: new Date().toISOString()
    });

    if (dbError) {
      console.error('Supabase Error:', dbError);
    }

    return res.status(200).json({
      success: true,
      uniquecode,
      item_name: itemName,
      status: 'pending_udid'
    });

  } catch (err) {
    console.error('GGsel Callback Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
