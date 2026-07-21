/* ═══════════════════════════════════════════════════════════
   appInstall — как отдать пользователю приложение.

   iOS не умеет устанавливать «сырой» .ipa из Safari — нужен
   OTA-манифест (itms-services://…manifest.plist по HTTPS).
   Пока манифеста нет — отдаём файл на скачивание (импорт в
   ESign / Scarlet / подпись BAZZAR). Функция определяет режим
   по ipa_url и возвращает готовую ссылку.
   ═══════════════════════════════════════════════════════════ */

export type InstallMode = 'ota' | 'download' | 'none'

export interface InstallTarget {
  mode: InstallMode
  href: string
  /** Метка для кнопки */
  label: string
}

export function installTarget(url: string | null | undefined): InstallTarget {
  if (!url) return { mode: 'none', href: '', label: 'Скоро' }

  // Уже готовая OTA-ссылка
  if (url.startsWith('itms-services://')) {
    return { mode: 'ota', href: url, label: 'Установить' }
  }

  // Ссылка на manifest.plist → заворачиваем в itms-services (OTA-установка в один тап)
  if (/\.plist(\?|#|$)/i.test(url)) {
    return {
      mode: 'ota',
      href: `itms-services://?action=download-manifest&url=${encodeURIComponent(url)}`,
      label: 'Установить',
    }
  }

  // Иначе — прямой .ipa: даём скачать
  return { mode: 'download', href: url, label: 'Скачать IPA' }
}
