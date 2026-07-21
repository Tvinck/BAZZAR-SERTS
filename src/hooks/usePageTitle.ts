import { useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════
   usePageTitle — Динамический заголовок страницы в браузере
   ═══════════════════════════════════════════════════════════ */

const BASE_TITLE = 'Bazzar Certs'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — ${BASE_TITLE}`
      : `${BASE_TITLE} — Свобода установки приложений на iOS`
  }, [title])
}
