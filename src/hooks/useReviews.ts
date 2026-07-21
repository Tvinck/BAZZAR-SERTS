import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Review {
  id: string
  name: string
  rating: number
  text: string
  verified: boolean
  created_at: string
  /** Formatted relative date like "2 дня назад" */
  relativeDate: string
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) {
    const m = diffMinutes
    if (m === 1) return '1 минуту назад'
    if (m >= 2 && m <= 4) return `${m} минуты назад`
    return `${m} минут назад`
  }
  if (diffHours < 24) {
    const h = diffHours
    if (h === 1) return '1 час назад'
    if (h >= 2 && h <= 4) return `${h} часа назад`
    return `${h} часов назад`
  }
  if (diffDays < 7) {
    const d = diffDays
    if (d === 1) return '1 день назад'
    if (d >= 2 && d <= 4) return `${d} дня назад`
    return `${d} дней назад`
  }
  if (diffWeeks < 5) {
    const w = diffWeeks
    if (w === 1) return '1 неделю назад'
    if (w >= 2 && w <= 4) return `${w} недели назад`
    return `${w} недель назад`
  }
  const mo = diffMonths
  if (mo === 1) return '1 месяц назад'
  if (mo >= 2 && mo <= 4) return `${mo} месяца назад`
  return `${mo} месяцев назад`
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('bazzar_reviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        if (!cancelled && data) {
          setReviews(
            data.map((r: any) => ({
              id: r.id || '',
              name: r.author || r.name || 'Клиент',
              rating: r.rating || 5,
              text: r.text || '',
              verified: r.status === 'approved' || r.verified === true,
              created_at: r.created_at || new Date().toISOString(),
              relativeDate: formatRelativeDate(r.created_at || new Date().toISOString()),
            }))
          )
        }
      } catch {
        // Table may not exist yet — fallback to hardcoded reviews in components
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReviews()
    return () => { cancelled = true }
  }, [])

  return { reviews, loading }
}
