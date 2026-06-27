/**
 * Мок-данные каталога BAZZAR MARKET (только для дизайна/витрины).
 * Реальные данные позже подключатся с бэкенда.
 */

export interface Category {
  id: string
  title: string
  subtitle: string
  emoji: string
  grad: string
  count: number
}

export interface Product {
  id: string
  title: string
  subtitle: string
  category: string
  emoji: string
  grad: string
  image?: string
  price: number
  oldPrice?: number
  rating: number
  sold: number
  badge?: 'hot' | 'new' | 'sale'
  delivery: string
}

export const CATEGORIES: Category[] = [
  { id: 'certs', title: 'iOS Сертификаты', subtitle: 'Базовый, Продвинутый, VIP', emoji: '📱', grad: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', count: 3 },
  { id: 'apps', title: 'Приложения', subtitle: 'TikTok, Spotify', emoji: '🔥', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', count: 15 },
  { id: 'tools', title: 'Утилиты', subtitle: 'Scarlet, ESing', emoji: '🛠️', grad: 'linear-gradient(135deg,#1b2838,#2a475e)', count: 5 },
]

export const PRODUCTS: Product[] = [
  { id: 'cert-base', title: 'Базовый Сертификат', subtitle: 'Гарантия 40 дней', category: 'certs', emoji: '📃', grad: 'linear-gradient(135deg,#10b981,#1db954)', image: '/img/cert_base.png', price: 400, oldPrice: 490, rating: 4.8, sold: 1240, badge: 'hot', delivery: '1–5 часов' },
  { id: 'cert-pro', title: 'Продвинутый Сертификат', subtitle: 'Гарантия 180 дней', category: 'certs', emoji: '🚀', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', image: '/img/cert_pro.png', price: 990, oldPrice: 1124, rating: 4.9, sold: 430, delivery: '1–5 часов' },
  { id: 'cert-vip', title: 'VIP Сертификат', subtitle: 'Гарантия 330 дней', category: 'certs', emoji: '👑', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', image: '/img/cert_vip.png', price: 1490, oldPrice: 1690, rating: 5.0, sold: 890, badge: 'new', delivery: '1–5 часов' },
  { id: 'app-tiktok', title: 'TikTok Dark', subtitle: 'Мод без ограничений', category: 'apps', emoji: '🎵', grad: 'linear-gradient(135deg,#1b2838,#66c0f4)', image: '/img/tiktok_dark.png', price: 0, rating: 4.9, sold: 15400, delivery: 'Моментально' },
  { id: 'app-spotify', title: 'Spotify++', subtitle: 'Premium бесплатно', category: 'apps', emoji: '🎧', grad: 'linear-gradient(135deg,#10b981,#1db954)', image: '/img/spotify_plus.png', price: 0, rating: 4.8, sold: 9200, delivery: 'Моментально' },
  { id: 'tool-scarlet', title: 'Scarlet', subtitle: 'Установщик IPA', category: 'tools', emoji: '🔴', grad: 'linear-gradient(135deg,#ef4444,#7c1d1d)', image: '/img/scarlet.png', price: 0, rating: 4.7, sold: 21000, badge: 'hot', delivery: 'Моментально' },
  { id: 'tool-esing', title: 'ESign', subtitle: 'Продвинутая подпись', category: 'tools', emoji: '✍️', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', image: '/img/esign.png', price: 0, rating: 4.9, sold: 18500, delivery: 'Моментально' },
  { id: 'app-vk', title: 'VK Сова', subtitle: 'Оффлайн режим', category: 'apps', emoji: '🦉', grad: 'linear-gradient(135deg,#2563eb,#7c3aed)', image: '/img/vk.png', price: 0, rating: 4.6, sold: 5400, delivery: 'Моментально' },
]
