import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Article {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  cover_url: string | null
  content: string | null
  read_time: string | null
  published_at: string | null
}

/** Список опубликованных статей (без тела content — для списка). */
export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase
      .from('bazzar_articles')
      .select('id, slug, title, description, category, cover_url, read_time, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        if (!mounted) return
        setArticles((data as Article[]) || [])
        setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return { articles, loading }
}

/** Одна статья по slug (с телом content). */
export function useArticle(slug?: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let mounted = true
    setLoading(true)
    supabase
      .from('bazzar_articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return
        setArticle((data as Article) || null)
        setLoading(false)
      })
    return () => { mounted = false }
  }, [slug])

  return { article, loading }
}
