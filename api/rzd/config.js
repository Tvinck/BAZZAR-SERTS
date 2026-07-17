export default async function handler(req, res) {
  // Определяем какой конфиг запрашивается
  const { config } = req.query;
  
  const configMap = {
    'ConturConfig.json': '/front/ConturConfig/ConturConfig.json',
    'ConturConfigMobile.json': '/front/ConturConfig/ConturConfigMobile.json',
    'ConturConfigMobileIos.json': '/front/ConturConfig/ConturConfigMobileIos.json',
  };

  const path = configMap[config];
  if (!path) {
    return res.status(404).json({ error: 'Unknown config' });
  }

  try {
    // Загружаем оригинальный конфиг с РЖД
    const response = await fetch(`https://my.rzd.ru${path}`);
    const data = await response.json();

    // Отключаем принудительное обновление
    if (data.updateMobileApp !== undefined) data.updateMobileApp = false;
    if (data.updateMobileIOS !== undefined) data.updateMobileIOS = false;
    if (data.updateMobileAndroid !== undefined) data.updateMobileAndroid = false;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (err) {
    // Если РЖД недоступен — отдаём минимальный конфиг без обновления
    return res.status(200).json({
      updateMobileApp: false,
      updateMobileIOS: false,
      updateMobileAndroid: false,
    });
  }
}
