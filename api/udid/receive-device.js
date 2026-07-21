import { rateLimit } from '../lib/rate-limit.js';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const limiter = rateLimit({ windowMs: 60_000, max: 10 });

export default async function handler(req, res) {
  const { allowed, retryAfter } = limiter.check(req);
  if (!allowed) {
    res.setHeader('Retry-After', Math.ceil(retryAfter / 1000));
    return res.status(429).send('Too Many Requests');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Read the raw body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const rawData = buffer.toString('utf-8');

    // Extract UDID and PRODUCT from Apple's XML payload
    const match = rawData.match(/<key>UDID<\/key>\s*<string>([^<]+)<\/string>/);
    const udid = match ? match[1] : null;

    const productMatch = rawData.match(/<key>PRODUCT<\/key>\s*<string>([^<]+)<\/string>/);
    const product = productMatch ? productMatch[1] : null;

    if (!udid) {
      console.error('Failed to extract UDID from payload');
      return res.status(400).send('Failed to extract UDID');
    }

    // Get owner UDID from query parameter
    const ownerUdid = req.query?.owner;
    if (!ownerUdid) {
      return res.status(400).send('Missing owner parameter');
    }

    // Save to bazzar_devices in Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('bazzar_devices').upsert({
        owner_udid: ownerUdid,
        device_udid: udid,
        model: product || null,
        display_name: product || 'Apple устройство',
      }, { onConflict: 'owner_udid,device_udid' });
      
      if (error) {
        console.error('Error saving device:', error);
      }
    }

    // Redirect to success page
    const host = req.headers.host || 'bazzar-serts.shop';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}/add-device/success?model=${encodeURIComponent(product || '')}`;

    res.writeHead(302, { Location: redirectUrl });
    res.end();

  } catch (error) {
    console.error('Error processing device UDID:', error);
    res.status(500).send('Internal Server Error');
  }
}
