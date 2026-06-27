import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { NavProvider } from './ui/nav'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SupportChat } from './components/SupportChat'
import { Home } from './pages/Home'
import { Catalog } from './pages/Catalog'
import { Product } from './pages/Product'
import { Cart } from './pages/Cart'
import { Cabinet } from './pages/Cabinet'
import { Auth } from './pages/Auth'
import { Success } from './pages/Success'

import { initAnalytics, trackEvent } from './lib/analytics'

function ScrollTop() {
  const { pathname } = useLocation()
  
  useEffect(() => { 
    window.scrollTo(0, 0)
    trackEvent('views')
  }, [pathname])

  useEffect(() => {
    initAnalytics()
  }, [])
  
  return null
}

/**
 * Мост: берёт navigate из react-router (доступен только внутри Router) и отдаёт
 * его библиотеке компонентов через NavProvider — так компоненты остаются
 * роутер-независимыми, но в приложении сохраняют SPA-навигацию.
 */
function NavBridge({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return <NavProvider navigate={(to) => navigate(to)}>{children}</NavProvider>
}

import { HomeIcon, ListIcon, CartIcon, UserIcon as TabUserIcon } from './ui/Icons'

import { motion } from 'framer-motion'

function MobileNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  
  const navItems = [
    { path: '/', label: 'Главная', icon: HomeIcon },
    { path: '/catalog', label: 'Каталог', icon: ListIcon },
    { path: '/cart', label: 'Корзина', icon: CartIcon },
    { path: '/cabinet', label: 'Кабинет', icon: TabUserIcon },
  ]
  
  return (
    <div className="desktop-hide bottom-nav">
      {navItems.map(item => {
        const isActive = pathname === item.path
        return (
          <motion.button 
            key={item.path}
            whileTap={{ scale: 0.88 }}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`} 
            onClick={() => navigate(item.path)}
          >
            <item.icon size={22} />
            {isActive && <motion.span layoutId="nav-pill" className="nav-active-bg" />}
            <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <NavBridge>
        <Header />
        <main style={{ minHeight: '70vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/success" element={<Success />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
        <SupportChat />
      </NavBridge>
    </BrowserRouter>
  )
}

