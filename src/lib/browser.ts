/* ═══════════════════════════════════════════════════════════
   browser — определение окружения для установки профиля UDID.

   Профиль Apple (.mobileconfig) устанавливается ТОЛЬКО в Safari
   на iPhone/iPad. Частая причина «профиль не работает» — клиент
   открыл ссылку во встроенном браузере (Telegram / GGSel / соцсети)
   или в Chrome/Firefox на iOS. Здесь — эвристика, чтобы вовремя
   показать подсказку «откройте в Safari».
   ═══════════════════════════════════════════════════════════ */

export type ProfileEnv = 'safari-ios' | 'inapp-ios' | 'other-ios' | 'desktop' | 'android' | 'unknown'

export function detectProfileEnv(): ProfileEnv {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent || ''

  const isIOS = /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ маскируется под Mac, но у него тач
    (/Macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)

  if (!isIOS) {
    if (/Android/i.test(ua)) return 'android'
    return 'desktop'
  }

  // Встроенные браузеры мессенджеров/соцсетей
  if (/(FBAN|FBAV|Instagram|Line\/|MicroMessenger|OKApp|VKClient|VKAndroid|Twitter|Snapchat|TikTok|musical_ly|Telegram|WebView|GSA)/i.test(ua)) {
    return 'inapp-ios'
  }
  // Chrome / Firefox / Edge / Opera на iOS — профиль тоже не ставится
  if (/(CriOS|FxiOS|EdgiOS|OPiOS|mercury)/i.test(ua)) {
    return 'other-ios'
  }
  // Настоящий Safari: есть "Safari" и "Version/". Вебвью часто без "Version/".
  if (/Safari/i.test(ua) && /Version\//i.test(ua)) {
    return 'safari-ios'
  }
  // iOS, но не распознан как Safari — вероятнее всего вебвью
  return 'inapp-ios'
}

/** true, если в текущем окружении установка профиля UDID, скорее всего, НЕ сработает */
export function profileNeedsSafari(): boolean {
  const env = detectProfileEnv()
  return env === 'inapp-ios' || env === 'other-ios'
}
