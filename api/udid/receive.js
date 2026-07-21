import { rateLimit } from '../lib/rate-limit.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const limiter = rateLimit({ windowMs: 60_000, max: 10 });

export default async function handler(req, res) {
  // Rate limit: 10 requests per minute per IP
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

    // Extract UDID and PRODUCT from the device plist response
    const match = rawData.match(/<key>UDID<\/key>\s*<string>([^<]+)<\/string>/);
    const udid = match ? match[1] : null;

    const productMatch = rawData.match(/<key>PRODUCT<\/key>\s*<string>([^<]+)<\/string>/);
    const product = productMatch ? productMatch[1] : null;

    if (!udid) {
      console.error('Failed to extract UDID from payload:', rawData.substring(0, 500));
      return res.status(400).send('Failed to extract UDID');
    }

    // Build redirect URL — use 301 as required by Apple Profile Service spec
    const host = req.headers.host || 'bazzar-serts.shop';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}/auth?udid=${encodeURIComponent(udid)}&model=${encodeURIComponent(product || '')}`;

    // 301 Moved Permanently — Apple requires this for Profile Service responses
    res.writeHead(301, { Location: redirectUrl });
    res.end();

  } catch (error) {
    console.error('Error processing UDID payload:', error);
    res.status(500).send('Internal Server Error');
  }
}
