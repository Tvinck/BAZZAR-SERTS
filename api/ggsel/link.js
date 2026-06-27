import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { uniquecode, udid } = req.body;
  
  if (!uniquecode || !udid) {
    return res.status(400).json({ error: 'uniquecode and udid are required' });
  }

  try {
    // 1. Get the order
    const { data: order, error: orderError } = await supabase
      .from('bazzar_orders')
      .select('*')
      .eq('uniquecode', uniquecode)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'linked') {
      return res.status(200).json({ success: true, message: 'Already linked', order });
    }

    // 2. Link the UDID and update status
    await supabase.from('bazzar_orders').update({
      udid: udid,
      status: 'linked'
    }).eq('uniquecode', uniquecode);

    // 3. Update or create the user in bazzar_users
    // Default plan is 'esing' if the name contains esign, else scarlet, etc.
    let plan = 'esing';
    const itemName = order.item_name.toLowerCase();
    if (itemName.includes('scarlet')) plan = 'scarlet';
    if (itemName.includes('vip')) plan = 'vip';

    const { error: userError } = await supabase.from('bazzar_users').upsert({
      udid: udid,
      plan: plan,
      status: 'processing',
      last_purchase: new Date().toISOString()
    });

    if (userError) {
      console.error('Error updating user:', userError);
    }

    // 4. (Optional) Call Digiseller to confirm delivery 
    // Usually done via PUT /purchases/delivery but let's skip it unless needed.
    // If needed, we can implement it here.

    return res.status(200).json({
      success: true,
      message: 'Linked successfully'
    });

  } catch (err) {
    console.error('GGsel Link Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
