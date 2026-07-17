export default async function handler(req, res) {
  // Прокси для РЖД конфигов — пробрасываем всё кроме флагов обновления
  const fullPath = req.url.replace('/api/rzd-proxy', '');
  const targetUrl = `https://my.rzd.ru${fullPath}`;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    };

    // Для POST/PUT пробрасываем body
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      fetchOptions.headers['Content-Type'] = req.headers['content-type'] || 'application/json';
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Проверяем, это конфиг с обновлениями?
    const isConfigPath = fullPath.includes('ConturConfig');

    if (isConfigPath && response.headers.get('content-type')?.includes('json')) {
      const data = await response.json();

      // Отключаем принудительное обновление
      if (data.updateMobileApp !== undefined) data.updateMobileApp = false;
      if (data.updateMobileIOS !== undefined) data.updateMobileIOS = false;
      if (data.updateMobileAndroid !== undefined) data.updateMobileAndroid = false;

      // Подменяем DOWNLOAD_APP_URL чтобы не перекидывало на мёртвый CDN
      if (data.DOWNLOAD_APP_URL) {
        data.DOWNLOAD_APP_URL = '';
      }

      return res.status(200).json(data);
    }

    // Для остальных запросов — прямой проброс
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const buffer = await response.arrayBuffer();
    return res.status(response.status).send(Buffer.from(buffer));

  } catch (err) {
    // Если РЖД недоступен — отдаём пустой конфиг без обновления
    if (fullPath.includes('ConturConfig')) {
      return res.status(200).json({
        updateMobileApp: false,
        updateMobileIOS: false,
        API: 'https://my.rzd.ru',
      });
    }
    return res.status(502).json({ error: 'Upstream unavailable' });
  }
}
