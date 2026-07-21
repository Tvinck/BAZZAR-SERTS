import { rateLimit } from '../lib/rate-limit.js';
import crypto from 'crypto';

const limiter = rateLimit({ windowMs: 60_000, max: 10 });

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

  const ownerUdid = req.query?.owner;
  if (!ownerUdid || typeof ownerUdid !== 'string' || ownerUdid.length < 10) {
    return res.status(400).send('Missing or invalid owner parameter');
  }

  const host = req.headers.host || 'bazzar-serts.shop';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const receiveUrl = `${protocol}://${host}/api/udid/receive-device?owner=${encodeURIComponent(ownerUdid)}`;

  // Generate unique UUID for each request
  const uuid = crypto.randomUUID();

  // Apple OTA Profile Service enrollment profile.
  // Only UDID + PRODUCT. No IMEI, ICCID, SERIAL.
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
    '  <string>BAZZAR — Добавление устройства</string>',
    '  <key>PayloadVersion</key>',
    '  <integer>1</integer>',
    '  <key>PayloadUUID</key>',
    `  <string>${uuid}</string>`,
    '  <key>PayloadIdentifier</key>',
    '  <string>shop.bazzar-serts.add-device</string>',
    '  <key>PayloadDescription</key>',
    '  <string>Временный профиль для привязки устройства. Запрашивает только идентификатор (UDID) и модель. Можно удалить сразу после установки.</string>',
    '  <key>PayloadType</key>',
    '  <string>Profile Service</string>',
    '  <key>PayloadRemovalDisallowed</key>',
    '  <false/>',
    '</dict>',
    '</plist>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/x-apple-aspen-config');
  res.setHeader('Content-Disposition', 'attachment; filename="bazzar-add-device.mobileconfig"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(xml);
}
