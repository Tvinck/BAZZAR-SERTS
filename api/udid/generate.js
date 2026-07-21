import { rateLimit } from '../lib/rate-limit.js';
import crypto from 'crypto';

const limiter = rateLimit({ windowMs: 60_000, max: 15 });

export default function handler(req, res) {
  // Rate limit
  const { allowed, retryAfter } = limiter.check(req);
  if (!allowed) {
    res.setHeader('Retry-After', Math.ceil(retryAfter / 1000));
    return res.status(429).send('Too Many Requests');
  }

  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const host = req.headers.host || 'bazzar-serts.shop';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const receiveUrl = `${protocol}://${host}/api/udid/receive`;

  // Generate unique UUID for each request to avoid profile caching issues
  const uuid = crypto.randomUUID();

  // Apple OTA Profile Service enrollment profile.
  // IMPORTANT:
  //  - Only request UDID and PRODUCT (model). iOS 15+ blocks IMEI/ICCID/SERIAL requests.
  //  - PayloadRemovalDisallowed must be false (temporary profile).
  //  - Content-Type must be application/x-apple-aspen-config
  //  - Profile is unsigned but valid — iOS will show "not verified" warning, 
  //    but user can proceed in Settings > General > VPN & Device Management.
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '  <key>PayloadContent</key>',
    '  <dict>',
    '    <key>URL</key>',
    `    <string>${receiveUrl}</string>`,
    '    <key>DeviceAttributes</key>',
    '    <array>',
    '      <string>UDID</string>',
    '      <string>PRODUCT</string>',
    '    </array>',
    '  </dict>',
    '  <key>PayloadOrganization</key>',
    '  <string>BAZZAR Certs</string>',
    '  <key>PayloadDisplayName</key>',
    '  <string>BAZZAR — Получение UDID</string>',
    '  <key>PayloadVersion</key>',
    '  <integer>1</integer>',
    '  <key>PayloadUUID</key>',
    `  <string>${uuid}</string>`,
    '  <key>PayloadIdentifier</key>',
    '  <string>shop.bazzar-serts.udid-enrollment</string>',
    '  <key>PayloadDescription</key>',
    '  <string>Временный профиль для определения UDID вашего устройства. Запрашивает только идентификатор устройства (UDID) и модель. Профиль можно удалить сразу после установки.</string>',
    '  <key>PayloadType</key>',
    '  <string>Profile Service</string>',
    '  <key>PayloadRemovalDisallowed</key>',
    '  <false/>',
    '</dict>',
    '</plist>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/x-apple-aspen-config');
  res.setHeader('Content-Disposition', 'attachment; filename="bazzar-udid.mobileconfig"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(xml);
}
