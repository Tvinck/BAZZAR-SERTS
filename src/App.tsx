import { useState, useEffect, lazy, Suspense, type ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from './hooks/useI18n'
import { motion, AnimatePresence } from 'framer-motion'
import { Home as HomeIcon, ShoppingBag, User } from 'lucide-react'
import { NavProvider } from './ui/nav'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SupportChat } from './components/SupportChat'
import { SplashScreen } from './components/SplashScreen'
import { CookieBanner } from './components/CookieBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LivePurchaseNotification } from './components/LivePurchaseNotification'
import { Home } from './pages/Home' // главная — eager, для мгновенного первого рендера
// Остальные страницы — ленивая загрузка (code-splitting): каждый маршрут в своём чанке
const Catalog = lazy(() => import('./pages/Catalog').then(m => ({ default: m.Catalog })))
const Product = lazy(() => import('./pages/Product').then(m => ({ default: m.Product })))
const Cabinet = lazy(() => import('./pages/Cabinet').then(m => ({ default: m.Cabinet })))
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })))
const AddDevice = lazy(() => import('./pages/AddDevice').then(m => ({ default: m.AddDevice })))
const AddDeviceSuccess = lazy(() => import('./pages/AddDeviceSuccess').then(m => ({ default: m.AddDeviceSuccess })))
const Success = lazy(() => import('./pages/Success').then(m => ({ default: m.Success })))
const OrderCheck = lazy(() => import('./pages/OrderCheck').then(m => ({ default: m.OrderCheck })))
const HowItWorks = lazy(() => import('./pages/HowItWorks').then(m => ({ default: m.HowItWorks })))
const InstallGuide = lazy(() => import('./pages/InstallGuide').then(m => ({ default: m.InstallGuide })))
const Guarantees = lazy(() => import('./pages/Guarantees').then(m => ({ default: m.Guarantees })))
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })))
const Offer = lazy(() => import('./pages/Offer').then(m => ({ default: m.Offer })))
const Registration = lazy(() => import('./pages/Registration').then(m => ({ default: m.Registration })))
const GetUdid = lazy(() => import('./pages/GetUdid').then(m => ({ default: m.GetUdid })))
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })))
const Article = lazy(() => import('./pages/Article').then(m => ({ default: m.Article })))
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })))
import { initAnalytics, trackEvent } from './lib/analytics'

/* ═══════════════════════════════════════════════════════════
   RouteTracker — UTM source capture
   ═══════════════════════════════════════════════════════════ */

function RouteTracker() {
  const location = useLocation()
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const source = searchParams.get('utm_source') || searchParams.get('ref') || searchParams.get('source')
    if (source) {
      localStorage.setItem('bazzar_source', source)
    }
  }, [location])

  return null
}

/* ═══════════════════════════════════════════════════════════
   ScrollTop + Analytics
   ═══════════════════════════════════════════════════════════ */

function ScrollTopWithAnalytics() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    trackEvent('views')
    // VK Pixel (Top.Mail.Ru) SPA pageView
    const _tmr = (window as any)._tmr || ((window as any)._tmr = []);
    _tmr.push({ id: "3781126", type: "pageView", url: window.location.href, referrer: document.referrer });

    // Якорные ссылки (/#faq, /#why, /#cta) — скроллим к секции после монтирования
    if (hash) {
      const id = hash.slice(1)
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo(0, 0)
      }, 80)
      return () => clearTimeout(timer)
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  useEffect(() => {
    initAnalytics()
  }, [])
  
  return null
}

/* ═══════════════════════════════════════════════════════════
   NavBridge — Connects react-router to design system nav
   ═══════════════════════════════════════════════════════════ */

function NavBridge({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return <NavProvider navigate={(to) => navigate(to)}>{children}</NavProvider>
}

/* ═══════════════════════════════════════════════════════════
   PageFallback — заглушка на время загрузки ленивого чанка
   ═══════════════════════════════════════════════════════════ */

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   App — Routing, Layout, Bottom Navigation
   ═══════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { path: '/', labelKey: 'nav.home', icon: HomeIcon },
  { path: '/catalog', labelKey: 'nav.catalog', icon: ShoppingBag },
  { path: '/cabinet', labelKey: 'nav.cabinet', icon: User },
]

export function App() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const [splashDone, setSplashDone] = useState(false)

  return (
    <NavBridge>
      <>
        {/* ── Splash Screen ─────────────────────────────────── */}
        <AnimatePresence>
          {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
        </AnimatePresence>

        <ScrollTopWithAnalytics />
        <RouteTracker />
        <Header />

        {/* Анимированные переходы между страницами */}
        <main style={{ flex: 1 }}>
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <Suspense fallback={<PageFallback />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<Product />} />

                  <Route path="/cabinet" element={<Cabinet />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/add-device/success" element={<AddDeviceSuccess />} />
                  <Route path="/add-device/:ownerUdid" element={<AddDevice />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/order-check" element={<OrderCheck />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/install-guide" element={<InstallGuide />} />
                  <Route path="/guarantees" element={<Guarantees />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/offer" element={<Offer />} />
                  <Route path="/r/:code" element={<Registration />} />
                  {/* /apps объединён с каталогом — редирект на категорию «Приложения» */}
                  <Route path="/apps" element={<Navigate to="/catalog?category=apps" replace />} />
                  <Route path="/get-udid" element={<GetUdid />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<Article />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>

        <Footer />
        <SupportChat />
        <LivePurchaseNotification />
        <CookieBanner />
        

        {/* ── Bottom Navigation (Mobile) ─────────────────────── */}
        <nav className="bottom-nav desktop-hide" role="navigation" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.path === '/'
              ? pathname === '/'
              : pathname.startsWith(item.path)

            return (
              <button
                key={item.path}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Градиентная пилюля для активного таба */}
                {isActive && (
                  <motion.div
                    className="nav-pill"
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{t(item.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </>
    </NavBridge>
  )
}
