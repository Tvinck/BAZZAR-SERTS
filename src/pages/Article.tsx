import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useArticle } from '../hooks/useArticles'

/* Страница статьи /blog/:slug. Контент — HTML из БД (авторы — доверенные
   операторы Connect), рендерится напрямую. */

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function Article() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { article, loading } = useArticle(slug)
  usePageTitle(article?.title || 'Статья')

  // SEO: description в мета-теге
  useEffect(() => {
    if (!article) return
    const meta = document.querySelector('meta[name="description"]')
    const prev = meta?.getAttribute('content') || null
    if (meta && article.description) meta.setAttribute('content', article.description)
    return () => { if (meta && prev) meta.setAttribute('content', prev) }
  }, [article])

  if (loading) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--surface-2)', borderTopColor: 'var(--violet)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </section>
    )
  }

  if (!article) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ textAlign: 'center', padding: 'var(--sp-16) 0' }}>
          <h2 style={{ marginBottom: 8 }}>Статья не найдена</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>Возможно, она была удалена или ещё не опубликована.</p>
          <Link to="/blog" className="btn btn-gradient" style={{ gap: 6 }}>В блог <ArrowRight size={16} /></Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
      <div className="container" style={{ maxWidth: 780 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/blog')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: '0.88rem', fontWeight: 500, marginBottom: 'var(--sp-6)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> В блог
          </button>

          <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(149,51,255,0.12)', padding: '4px 12px', borderRadius: 'var(--r-full)', marginBottom: 14 }}>
            {article.category}
          </span>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginBottom: 14 }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 'var(--sp-6)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)' }}>
            {article.read_time && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={14} /> {article.read_time}</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Calendar size={14} /> {fmtDate(article.published_at)}</span>
          </div>

          {/* Контент статьи (HTML из БД) */}
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || '' }} />

          {/* CTA */}
          <div style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-6)', background: 'linear-gradient(135deg, rgba(149,51,255,0.1), rgba(110,0,229,0.05))', border: '1px solid rgba(149,51,255,0.2)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Готовы установить приложения?</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: 18 }}>Выберите сертификат в каталоге — активация за 5–15 минут.</p>
            <Link to="/catalog" className="btn btn-gradient" style={{ gap: 6 }}>В каталог <ArrowRight size={16} /></Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
