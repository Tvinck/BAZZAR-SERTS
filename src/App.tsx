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

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <SupportChat />
      </NavBridge>
    </BrowserRouter>
  )
}
