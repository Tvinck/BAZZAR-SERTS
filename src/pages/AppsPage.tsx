import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DownloadIcon } from '../ui/Icons'

type BazzarApp = {
  id: string
  name: string
  version: string
  description: string
  icon_url: string
  ipa_url: string
  bundle_id: string
  size_bytes: number
  created_at: string
}

export function AppsPage() {
  const [apps, setApps] = useState<BazzarApp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApps() {
      const { data } = await supabase
        .from('bazzar_apps')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (data) setApps(data)
      setLoading(false)
    }
    fetchApps()
  }, [])

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 36, paddingBottom: 60 }}>
        <span className="kicker">Приложения</span>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', margin: '8px 0 24px' }}>Библиотека приложений</h1>
        <p style={{ color: 'var(--text-2)', maxWidth: 600, marginBottom: 32 }}>
          Здесь собраны полезные приложения без рекламы и встроенных ограничений. 
          Скачивайте и устанавливайте с помощью вашего сертификата.
        </p>

        {loading ? (
          <div className="grid-products">
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: 200, background: 'var(--surface-2)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : apps.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {apps.map(app => (
              <div key={app.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', background: 'var(--surface-2)' }} />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--surface-2)' }} />
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{app.name}</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-3)', fontSize: '0.85rem' }}>Версия {app.version}</p>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{app.bundle_id}</p>
                  </div>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--hair)', paddingTop: 16, marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{formatBytes(app.size_bytes)}</span>
                  <a href={app.ipa_url} className="btn btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }} download>
                    <DownloadIcon size={16} /> Скачать
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
            Приложения пока не добавлены 🙃
          </div>
        )}
      </div>
    </div>
  )
}
