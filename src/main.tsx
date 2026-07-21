import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'
import { ToastProvider } from './components/Toast'
import { I18nProvider } from './hooks/useI18n'

// Auto-reload on chunk load failure (stale deploy)
// After a new Vercel deploy, old JS chunk filenames no longer exist.
// This catches the error and forces a clean reload once.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('chunk_reload')) {
    sessionStorage.setItem('chunk_reload', '1')
    window.location.reload()
  }
})

// Fallback for generic chunk errors (non-Vite)
window.addEventListener('error', (e) => {
  if (
    e.message?.includes('Failed to fetch dynamically imported module') ||
    e.message?.includes('Loading chunk') ||
    e.message?.includes('ERR_CONNECTION_RESET')
  ) {
    if (!sessionStorage.getItem('chunk_reload')) {
      sessionStorage.setItem('chunk_reload', '1')
      window.location.reload()
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
)
