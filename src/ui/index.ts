/**
 * Публичная поверхность дизайн-системы BAZZAR MARKET.
 *
 * Единый источник правды для переиспользуемых компонентов: их использует и само
 * приложение (страницы импортируют отсюда), и внешние потребители (например,
 * claude.ai/design через design-sync). Компоненты роутер-независимы (см. ./nav).
 *
 * Стили/токены живут в src/index.css (CSS-переменные --bg, --violet, --grad и
 * классы .card/.btn-primary/.glass/.chip/.grad-text). Импортируйте index.css один раз.
 *
 * Здесь — только library-grade сущности. Страницы (Home/Catalog/Product/Cart/
 * Cabinet) НЕ часть библиотеки: это экраны приложения.
 */

export { ProductCard } from '../components/ProductCard'
export { Header } from '../components/Header'
export { Footer } from '../components/Footer'
export { Mesh } from '../components/Mesh'
export { Link, NavProvider, useNav } from './nav'

// Фирменный логотип + набор иконок (единый стиль, currentColor)
export * from './Icons'

export type { Product, Category } from '../data/catalog'
