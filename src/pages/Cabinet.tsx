import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Package, ShieldCheck, Smartphone, Headphones, Copy, Check, Shield, ArrowRight, Send, BookOpen, ChevronDown, ChevronUp, Monitor, Plus, Crown, Download, Star, Calendar, AlertTriangle, CheckCircle2, RotateCw, MessageSquare, Upload, Image as ImageIcon, Clock, Loader2, Eye, Gift, ShoppingBag } from 'lucide-react'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'
import { useProfile } from '../hooks/useProfile'
import { useI18n } from '../hooks/useI18n'
import { supabase } from '../lib/supabase'
import { sanitizeInput } from '../lib/sanitize'
import { getDeviceDisplayName } from '../lib/device-models'
import { installTarget } from '../lib/appInstall'
import { SafariHint } from '../components/SafariHint'

/* ═══════════════════════════════════════════════════════════
   Cabinet — 6 разделов как в оригинале + Обращения
   ═══════════════════════════════════════════════════════════ */

interface Ticket {
  id: string
  udid: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved'
  image_url: string | null
  created_at: string
}



interface Device {
  id: string
  udid: string
  name: string
  model: string
  addedAt: string
  isActive: boolean
  certsCount: number
}

// Devices loaded from apple_certificates in Supabase

/* ── My Apps Tab (loads from user_app_purchases) ── */
function MyAppsTab({ udid }: { udid: string | null }) {
  const [purchases, setPurchases] = useState<Array<{
    id: string; status: string; amount: number; created_at: string;
    app: { id: string; name: string; version: string; icon_url: string | null; ipa_url: string | null; description: string | null } | null
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!udid) { setLoading(false); return }
    ;(async () => {
      const { data, error } = await supabase
        .from('user_app_purchases')
        .select('id, status, amount, created_at, app:bazzar_apps(id, name, version, icon_url, ipa_url, description)')
        .eq('udid', udid)
        .in('status', ['paid', 'free'])
        .order('created_at', { ascending: false })
      if (!error && data) setPurchases(data as any)
      setLoading(false)
    })()
  }, [udid])

  if (loading) {
    return (
      <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Загрузка...</p>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
          <Smartphone size={48} style={{ color: 'var(--text-3)', opacity: 0.3, marginBottom: 16 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Нет установленных приложений</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', maxWidth: 340, margin: '0 auto 20px' }}>
            Установленные и купленные приложения появятся здесь.
          </p>
          <Link to="/catalog?category=apps" className="btn btn-gradient" style={{ padding: '12px 28px', borderRadius: 'var(--r-md)', gap: 8 }}>
            <ShoppingBag size={16} /> Каталог приложений
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 4 }}>
        {purchases.length} {purchases.length === 1 ? 'приложение' : purchases.length < 5 ? 'приложения' : 'приложений'}
      </div>
      {purchases.map((p) => {
        const app = p.app
        if (!app) return null
        return (
          <div key={p.id} className="card" style={{
            padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {app.icon_url ? (
                <img src={app.icon_url} alt="" width={56} height={56} style={{ objectFit: 'cover', borderRadius: 14 }} />
              ) : (
                <Smartphone size={24} style={{ color: 'var(--text-3)' }} />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>{app.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--r-full)',
                  background: 'rgba(149,51,255,0.1)', color: 'var(--accent)',
                }}>
                  v{app.version}
                </span>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--r-full)',
                  background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                  color: p.status === 'paid' ? '#22C55E' : '#3b82f6',
                }}>
                  {p.status === 'paid' ? `Куплено · ${p.amount} ₽` : 'Бесплатно'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                  {new Date(p.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>

            {/* Установка / скачивание */}
            {(() => {
              const inst = installTarget(app.ipa_url)
              if (inst.mode === 'none') return null
              return (
                <a
                  href={inst.href}
                  {...(inst.mode === 'download' ? { download: true } : {})}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--r-md)',
                    background: 'linear-gradient(135deg, #af66ff, #6e00e5)',
                    color: '#fff', textDecoration: 'none',
                    fontSize: '0.8rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <Download size={14} /> {inst.mode === 'ota' ? 'Установить' : 'Скачать'}
                </a>
              )
            })()}
          </div>
        )
      })}

      <Link to="/catalog?category=apps" style={{
        textAlign: 'center', padding: '12px', fontSize: '0.85rem',
        color: 'var(--accent)', textDecoration: 'none', fontWeight: 600,
      }}>
        Каталог приложений →
      </Link>
    </div>
  )
}

export function Cabinet() {
  const { t } = useI18n()
  usePageTitle(t('cabinet.login.title'))

  const TABS = [
    { id: 'profile', label: t('cabinet.tab.profile'), icon: <User size={18} /> },
    { id: 'orders', label: t('cabinet.tab.orders'), icon: <Package size={18} /> },
    { id: 'certs', label: t('cabinet.tab.certs'), icon: <ShieldCheck size={18} /> },
    { id: 'apps', label: t('cabinet.tab.apps'), icon: <Smartphone size={18} /> },
    { id: 'devices', label: t('cabinet.tab.devices'), icon: <Monitor size={18} /> },
    { id: 'subs', label: t('cabinet.tab.subs'), icon: <Crown size={18} /> },
    { id: 'tickets', label: t('cabinet.tab.tickets'), icon: <MessageSquare size={18} /> },
    { id: 'feedback', label: t('cabinet.tab.feedback'), icon: <Headphones size={18} /> },
  ]
  const { toast } = useToast()
  const { udid, profile, orders, logout } = useProfile()
  const [tab, setTab] = useState('profile')
  const [copied, setCopied] = useState(false)
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null)
  const [deviceCerts, setDeviceCerts] = useState<Record<string, { id: string; plan_id: string; status: string; created_at: string }[]>>({})
  const [showShareLink, setShowShareLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Load devices from bazzar_devices
  useEffect(() => {
    if (!udid) return
    async function loadDevices() {
      try {
        const { data, error } = await supabase
          .from('bazzar_devices')
          .select('*')
          .eq('owner_udid', udid)
          .order('created_at', { ascending: true })
        if (error) throw error
        if (data && data.length > 0) {
          // For each device, count certs
          const deviceList: Device[] = []
          for (const d of data) {
            const { count } = await supabase
              .from('apple_certificates')
              .select('*', { count: 'exact', head: true })
              .eq('udid', d.device_udid)
            deviceList.push({
              id: d.id,
              udid: d.device_udid,
              name: getDeviceDisplayName(d.model),
              model: d.model || '',
              addedAt: new Date(d.created_at).toLocaleDateString('ru-RU'),
              isActive: true,
              certsCount: count || 0,
            })
          }
          setDevices(deviceList)
        }
      } catch {
        // fallback to empty
      }
    }
    loadDevices()
  }, [udid])

  // Load certs for expanded device
  const loadDeviceCerts = useCallback(async (deviceUdid: string) => {
    if (deviceCerts[deviceUdid]) return // already loaded
    try {
      const { data } = await supabase
        .from('apple_certificates')
        .select('id, plan_id, status, created_at')
        .eq('udid', deviceUdid)
        .order('created_at', { ascending: false })
      if (data) setDeviceCerts(prev => ({ ...prev, [deviceUdid]: data }))
    } catch { /* ignore */ }
  }, [deviceCerts])

  const [copiedUdid, setCopiedUdid] = useState<string | null>(null)

  // Ticket system state
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketImageUrl, setTicketImageUrl] = useState<string | null>(null)
  const [ticketImageUploading, setTicketImageUploading] = useState(false)
  const [ticketSubmitting, setTicketSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Review form state
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Certificates state
  interface Certificate { id: string; plan_id: string; status: string; crm_status: string; approval_comment: string; created_at: string; updated_at: string; sale_price: number }
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [certsLoading, setCertsLoading] = useState(false)
  const [expandedCert, setExpandedCert] = useState<string | null>(null)

  useEffect(() => {
    if (!udid) return
    setCertsLoading(true)
    supabase
      .from('apple_certificates')
      .select('id, plan_id, status, crm_status, approval_comment, created_at, updated_at, sale_price')
      .eq('udid', udid)
      .order('created_at', { ascending: false })
      .then(
        ({ data }) => { if (data) setCertificates(data as Certificate[]); setCertsLoading(false) },
        () => setCertsLoading(false)
      )
  }, [udid])

  // Subscriptions state
  interface Subscription { id: string; app_name: string; plan: string; price: number; status: string; started_at: string; expires_at: string; auto_renew: boolean }
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subsLoading, setSubsLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'subs' || !udid) return
    setSubsLoading(true)
    supabase
      .from('bazzar_subscriptions')
      .select('*')
      .eq('udid', udid)
      .order('created_at', { ascending: false })
      .then(
        ({ data }) => { if (data) setSubscriptions(data as Subscription[]); setSubsLoading(false) },
        () => setSubsLoading(false)
      )
  }, [tab, udid])

  // Referral system state
  const [referralCode, setReferralCode] = useState('')
  const [referralCopied, setReferralCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(0)

  // Generate referral code from UDID
  useEffect(() => {
    if (!udid) return
    let code = localStorage.getItem('bazzar_referral_code')
    if (!code) {
      // Simple hash of UDID → first 8 hex chars
      let hash = 0
      for (let i = 0; i < udid.length; i++) {
        const char = udid.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash |= 0
      }
      code = Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8).toUpperCase()
      localStorage.setItem('bazzar_referral_code', code)
    }
    setReferralCode(code)
  }, [udid])

  // Fetch referral count from Supabase
  useEffect(() => {
    if (!referralCode) return
    const fetchReferralCount = async () => {
      try {
        const { count, error } = await supabase
          .from('bazzar_referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_code', referralCode)
        if (!error && count !== null) setReferralCount(count)
      } catch {
        // Table may not exist yet, keep default 0
      }
    }
    fetchReferralCount()
  }, [referralCode])

  // Fetch tickets when tab is selected
  useEffect(() => {
    if (tab === 'tickets' && udid) {
      fetchTickets()
    }
  }, [tab, udid])

  const fetchTickets = useCallback(async () => {
    if (!udid) return
    setTicketsLoading(true)
    try {
      const { data: ticketsData, error } = await supabase
        .from('bazzar_tickets')
        .select('*')
        .eq('udid', udid)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTickets(ticketsData || [])
    } catch (err) {
      console.error('Tickets fetch error:', err)
      toast(t('cabinet.tickets.errorLoad'))
    } finally {
      setTicketsLoading(false)
    }
  }, [udid])

  const handleTicketImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !udid) return
    setTicketImageUploading(true)
    try {
      const filePath = `${udid}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket_images')
        .upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('ticket_images').getPublicUrl(uploadData.path)
      setTicketImageUrl(publicUrl)
      toast(t('cabinet.tickets.screenshotUploaded'))
    } catch (err) {
      console.error('Upload error:', err)
      toast(t('cabinet.tickets.error'))
    } finally {
      setTicketImageUploading(false)
    }
  }, [udid])

  const handleCreateTicket = useCallback(async () => {
    if (!udid || !ticketSubject || !ticketMessage.trim()) {
      toast(t('cabinet.tickets.fillFields'))
      return
    }
    setTicketSubmitting(true)
    try {
      const { error: ticketError } = await supabase.from('bazzar_tickets').insert([{
        udid,
        subject: ticketSubject,
        message: sanitizeInput(ticketMessage),
        status: 'open',
        image_url: ticketImageUrl || null
      }])
      if (ticketError) throw ticketError
      toast(t('cabinet.tickets.sent'))
      setTicketSubject('')
      setTicketMessage('')
      setTicketImageUrl(null)
      setShowCreateTicket(false)
      fetchTickets()
    } catch (err) {
      console.error('Create ticket error:', err)
      toast(t('cabinet.tickets.error'))
    } finally {
      setTicketSubmitting(false)
    }
  }, [udid, ticketSubject, ticketMessage, ticketImageUrl, fetchTickets])




  const handleCopy = () => {
    navigator.clipboard?.writeText(udid || '')
    setCopied(true)
    toast(t('cabinet.toast.udidClipboard'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = async () => {
    if (!feedbackMsg.trim()) return
    try {
      const { error } = await supabase.from('bazzar_feedback').insert([{
        udid: udid || null,
        message: feedbackMsg.trim(),
        contact: profile?.telegram || localStorage.getItem('bazzar_contact') || null,
      }])
      if (error) throw error
      setFeedbackSent(true)
      setFeedbackMsg('')
      toast(t('cabinet.toast.messageSent'))
      setTimeout(() => setFeedbackSent(false), 3000)
    } catch (err) {
      console.error('Feedback error:', err)
      toast('Ошибка при отправке сообщения')
    }
  }

  const handleSubmitReview = useCallback(async () => {
    if (!udid || reviewRating === 0 || !reviewText.trim()) return
    setReviewSubmitting(true)
    try {
      const { error } = await supabase.from('bazzar_reviews').insert([{
        author: profile?.name || 'Пользователь',
        rating: reviewRating,
        text: reviewText.trim(),
        status: 'approved',
      }])
      if (error) throw error
      setReviewSubmitted(true)
      setReviewRating(0)
      setReviewText('')
      toast('Отзыв успешно отправлен! ⭐')
    } catch (err) {
      console.error('Review submit error:', err)
      toast('Ошибка при отправке отзыва')
    } finally {
      setReviewSubmitting(false)
    }
  }, [udid, reviewRating, reviewText, profile])

  /* ── Экран входа через UDID ──────────────────────────── */
  if (!udid) {
    return (
      <section className="section" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <div className="container" style={{ maxWidth: 460, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--r-xl)', margin: '0 auto 20px',
              background: 'rgba(149,51,255,0.1)', border: '1px solid rgba(149,51,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={36} style={{ color: 'var(--accent)' }} />
            </div>

            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', marginBottom: 8 }}>
              {t('cabinet.login.title')}
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>
              {t('cabinet.login.subtitle')}
            </p>

            <div className="card" style={{
              padding: 'var(--sp-5)', textAlign: 'left',
              marginBottom: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', gap: 10, fontSize: '0.85rem', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0, fontSize: '0.78rem' }}>{t('cabinet.login.why')}</span>
                <p style={{ color: 'var(--text-2)' }}>
                  {t('cabinet.login.whyText')}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }} />
              <div style={{ display: 'flex', gap: 10, fontSize: '0.85rem', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0, fontSize: '0.78rem' }}>{t('cabinet.login.safe')}</span>
                <p style={{ color: 'var(--text-2)' }}>
                  {t('cabinet.login.safeText')}
                </p>
              </div>
            </div>

            <SafariHint />

            <button
              className="btn btn-gradient"
              onClick={() => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                if (!isMobile) {
                  toast(t('cabinet.login.mobileToast'))
                  return
                }
                window.location.href = '/api/udid/generate'
              }}
              style={{
                width: '100%', padding: '16px 0',
                fontSize: '1rem', fontWeight: 800,
                borderRadius: 'var(--r-md)', gap: 8,
              }}
            >
              <Smartphone size={18} />
              {t('cabinet.login.getUdid')}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 12, lineHeight: 1.5 }}>
              {t('cabinet.login.mobileHint')}
            </p>
          </motion.div>
        </div>
      </section>
    )
  }


  return (
    <section className="section" style={{ paddingTop: 'clamp(80px, 10vw, 100px)' }}>
      <div className="container">
        <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', marginBottom: 'var(--sp-6)' }}>{t('cabinet.login.title')}</h1>

        <style>{`@media (min-width: 769px) { .cabinet-grid { grid-template-columns: 240px 1fr !important; } }`}</style>

        <div className="cabinet-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--sp-5)', alignItems: 'start' }}>
          {/* Sidebar */}
          <nav className="card" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 'var(--r-md)',
                  background: tab === t.id ? 'rgba(149,51,255,0.1)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--text-3)',
                  fontWeight: 600, fontSize: '0.9rem', width: '100%',
                  transition: 'all 150ms', textAlign: 'left',
                  borderLeft: tab === t.id ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <span style={{ color: tab === t.id ? 'var(--accent)' : 'var(--text-3)' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
            <button
              onClick={logout}
              style={{
                padding: '13px 16px', borderRadius: 'var(--r-md)',
                color: '#ff4444', fontSize: '0.88rem', width: '100%',
                fontWeight: 600, transition: 'all 150ms', textAlign: 'left',
                borderLeft: '3px solid transparent',
              }}
            >
              {t('cabinet.logout')}
            </button>
          </nav>

          {/* Content */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={tab}>

            {/* ── Мой профиль ── */}
            {tab === 'profile' && (
              <div className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'var(--sp-6)' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 'var(--r-lg)',
                    background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                  }}>B</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{localStorage.getItem('apple_device_model') || t('cabinet.profile.appleDevice')}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>UDID: {udid ? udid.substring(0, 8) + '...' + udid.substring(udid.length - 4) : 'N/A'}</p>
                  </div>
                </div>

                {/* UDID копирование */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-6)',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', padding: '14px 16px',
                }}>
                  <code style={{
                    flex: 1, fontSize: '0.75rem', color: 'var(--text)',
                    fontFamily: '"SF Mono", "Fira Code", monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {udid || ''}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="btn btn-soft"
                    style={{
                      padding: '6px 12px', fontSize: '0.75rem',
                      borderRadius: 'var(--r-sm)', gap: 4,
                      color: copied ? 'var(--success)' : 'var(--text-2)',
                    }}
                  >
                    {copied ? <><Check size={13} /> {t('cabinet.profile.copied')}</> : <><Copy size={13} /> {t('cabinet.profile.copy')}</>}
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 0 }}>
                  {[
                    [t('cabinet.profile.purchases'), orders.length.toString()],
                    [t('cabinet.profile.certificates'), orders.filter(o => o.title.includes('Серт')).length.toString()],
                    [t('cabinet.profile.apps'), orders.filter(o => !o.title.includes('Серт')).length.toString()],
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '14px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem',
                    }}>
                      <span style={{ color: 'var(--text-2)' }}>{label}</span>
                      <span style={{ fontWeight: 700 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* ── Реферальная программа ── */}
                {referralCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      marginTop: 'var(--sp-6)',
                      padding: 'var(--sp-5)',
                      borderRadius: 'var(--r-lg)',
                      background: 'linear-gradient(135deg, rgba(149,51,255,0.08) 0%, rgba(6,182,212,0.06) 100%)',
                      border: '1px solid rgba(149,51,255,0.18)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Decorative glow */}
                    <div style={{
                      position: 'absolute', top: -40, right: -40,
                      width: 120, height: 120, borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(149,51,255,0.12) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'var(--sp-4)', position: 'relative' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 'var(--r-lg)',
                        background: 'linear-gradient(135deg, rgba(149,51,255,0.2), rgba(6,182,212,0.15))',
                        border: '1px solid rgba(149,51,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Gift size={22} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>Реферальная программа</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.4 }}>
                          Пригласите друга и получите скидку 10% на следующую покупку
                        </p>
                      </div>
                    </div>

                    {/* Referral link */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-3)',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)', padding: '12px 14px',
                    }}>
                      <code style={{
                        flex: 1, fontSize: '0.78rem', color: 'var(--text)',
                        fontFamily: '"SF Mono", "Fira Code", monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        bazzar-serts.shop/?ref={referralCode}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(`https://bazzar-serts.shop/?ref=${referralCode}`)
                          setReferralCopied(true)
                          toast('Ссылка скопирована! 🔗')
                          setTimeout(() => setReferralCopied(false), 2000)
                        }}
                        className="btn btn-soft"
                        style={{
                          padding: '6px 14px', fontSize: '0.75rem',
                          borderRadius: 'var(--r-sm)', gap: 4, flexShrink: 0,
                          color: referralCopied ? 'var(--success)' : 'var(--accent)',
                          background: referralCopied ? 'rgba(34,197,94,0.1)' : 'rgba(149,51,255,0.1)',
                          border: referralCopied ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(149,51,255,0.2)',
                          transition: 'all 200ms',
                        }}
                      >
                        {referralCopied ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Копировать</>}
                      </button>
                    </div>

                    {/* Referral stats */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 'var(--r-md)',
                      background: 'rgba(149,51,255,0.06)', border: '1px solid rgba(149,51,255,0.1)',
                    }}>
                      <User size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                        Приглашено: <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{referralCount}</strong> человек
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}


            {/* ── Мои покупки ── */}
            {tab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {orders.length === 0 ? (
                  <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
                    <Package size={40} style={{ color: 'var(--text-3)', margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem' }}>{t('cabinet.orders.empty')}</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{
                        padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: order.status === 'done' ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {order.status === 'done'
                            ? <Check size={14} style={{ color: 'var(--success)' }} />
                            : <RotateCw size={14} style={{ color: '#f59e0b' }} />
                          }
                          <span style={{
                            fontSize: '0.78rem', fontWeight: 600,
                            color: order.status === 'done' ? 'var(--success)' : '#f59e0b',
                          }}>
                            {order.status === 'done' ? t('cabinet.orders.delivered') : t('cabinet.orders.processing')}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{t('cabinet.orders.orderId')} #{order.id}</span>
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
                            background: order.grad || 'rgba(149,51,255,0.1)',
                            border: '1px solid rgba(149,51,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.3rem',
                          }}>
                            {order.emoji || <Package size={20} style={{ color: 'var(--accent)' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{order.title}</p>
                            {order.approval_comment && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{order.approval_comment}</p>
                            )}
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{order.sum}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-3)', alignItems: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {order.date}</span>
                          {order.ipaUrl && (
                            <a
                              href={order.ipaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-soft"
                              style={{
                                padding: '4px 12px', fontSize: '0.75rem',
                                borderRadius: 'var(--r-sm)', gap: 4,
                                textDecoration: 'none',
                              }}
                            >
                              <Download size={12} /> {t('cabinet.orders.downloadIpa')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Мои сертификаты ── */}
            {tab === 'certs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {certsLoading ? (
                  <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem' }}>Загрузка сертификатов...</p>
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
                    <ShieldCheck size={48} style={{ color: 'var(--text-3)', opacity: 0.3, marginBottom: 16 }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Нет сертификатов</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', maxWidth: 340, margin: '0 auto 20px' }}>
                      Сертификаты появятся здесь после покупки.
                    </p>
                    <Link to="/catalog" className="btn btn-gradient" style={{ padding: '12px 28px', borderRadius: 'var(--r-md)', gap: 8 }}>
                      <ShoppingBag size={16} /> Перейти в каталог
                    </Link>
                  </div>
                ) : (
                  certificates.map((cert) => {
                    // Готовность определяем по crm_status (его выставляет оператор при согласовании),
                    // с запасом на легаси-значения в status. Раньше смотрели только на status,
                    // из-за чего согласованный серт вечно висел «в процессе».
                    const isReady = cert.crm_status === 'approved' || cert.status === 'active' || cert.status === 'ready'
                    const isError = cert.crm_status === 'rejected' || cert.status === 'error' || cert.status === 'revoked'
                    const isInProgress = !isReady && !isError
                    const statusColor = isReady ? 'var(--success)' : isError ? '#ef4444' : '#f59e0b'
                    const statusBg = isReady ? 'rgba(52,199,89,0.1)' : isError ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
                    const statusBorder = isReady ? 'rgba(52,199,89,0.2)' : isError ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'
                    const statusText = isReady ? '✅ Готов' : isError ? '❌ Ошибка' : '⏳ В процессе'

                    return (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                        style={{ padding: 0, overflow: 'hidden' }}
                      >
                        {/* Header */}
                        <div
                          onClick={() => setExpandedCert(expandedCert === cert.id ? null : cert.id)}
                          style={{
                            padding: 'var(--sp-4) var(--sp-5)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 14,
                            transition: 'background 150ms',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 46, height: 46, borderRadius: 'var(--r-lg)',
                            background: 'rgba(149,51,255,0.1)', border: '1px solid rgba(149,51,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <ShieldCheck size={22} style={{ color: 'var(--accent)' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                              {cert.plan_id || 'Сертификат'}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                              Оплачено {new Date(cert.created_at).toLocaleDateString('ru-RU')}
                              {cert.sale_price ? ` · ${cert.sale_price}₽` : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <span style={{
                              padding: '4px 12px', borderRadius: 'var(--r-full)',
                              background: statusBg, border: `1px solid ${statusBorder}`,
                              fontSize: '0.72rem', fontWeight: 700, color: statusColor,
                            }}>
                              {statusText}
                            </span>
                            {expandedCert === cert.id ? <ChevronUp size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {expandedCert === cert.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            style={{ borderTop: '1px solid var(--border)', padding: 'var(--sp-4) var(--sp-5)' }}
                          >
                            {isInProgress ? (
                              /* In progress — show waiting info */
                              <div>
                                <div style={{
                                  padding: '16px 20px', borderRadius: 'var(--r-md)',
                                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                                  marginBottom: 14,
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <Clock size={16} style={{ color: '#f59e0b' }} />
                                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>Сертификат оформляется</p>
                                  </div>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
                                    Среднее время регистрации сертификата — <strong>от 1 до 5 часов</strong>, но чаще всего оформление занимает <strong>менее одного часа</strong>.
                                  </p>
                                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 10, lineHeight: 1.6 }}>
                                    Если ваш сертификат готовится более 5 часов — <button onClick={() => setTab('feedback')} style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>напишите нам в чат</button>.
                                  </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--surface-2)' }}>
                                    <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Статус</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>⏳ В процессе</p>
                                  </div>
                                  <div style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--surface-2)' }}>
                                    <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Оплачено</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{new Date(cert.created_at).toLocaleDateString('ru-RU')}</p>
                                  </div>
                                </div>
                              </div>
                            ) : isReady ? (
                              /* Ready — show approval comment + guide */
                              <div>
                                {cert.approval_comment && (
                                  <div style={{
                                    padding: '16px 20px', borderRadius: 'var(--r-md)',
                                    background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.15)',
                                    marginBottom: 14,
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--success)' }}>Сертификат готов</p>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                      {cert.approval_comment}
                                    </p>
                                  </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                  {[
                                    { label: 'Тариф', value: cert.plan_id || '—' },
                                    { label: 'Оплачено', value: new Date(cert.created_at).toLocaleDateString('ru-RU') },
                                  ].map((m, i) => (
                                    <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--surface-2)' }}>
                                      <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{m.label}</p>
                                      <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.value}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Guide button */}
                                <button
                                  onClick={() => setShowGuide(showGuide ? false : true)}
                                  className="btn btn-soft"
                                  style={{
                                    width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    fontSize: '0.85rem', fontWeight: 700,
                                  }}
                                >
                                  <BookOpen size={15} /> Инструкция
                                  {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                </button>

                                {showGuide && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                                    marginTop: 12, padding: '16px', background: 'var(--surface-2)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                                  }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                      {[
                                        { step: '1', text: t('cabinet.certs.step1') },
                                        { step: '2', text: t('cabinet.certs.step2') },
                                        { step: '3', text: t('cabinet.certs.step3') },
                                        { step: '4', text: t('cabinet.certs.step4') },
                                        { step: '5', text: t('cabinet.certs.step5') },
                                        { step: '6', text: t('cabinet.certs.step6') },
                                        { step: '7', text: t('cabinet.certs.step7') },
                                      ].map(s => (
                                        <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                          <div style={{
                                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                            background: 'rgba(149,51,255,0.12)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent)',
                                          }}>{s.step}</div>
                                          <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{s.text}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            ) : (
                              /* Error state */
                              <div style={{
                                padding: '16px 20px', borderRadius: 'var(--r-md)',
                                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ef4444' }}>Ошибка оформления</p>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 10 }}>
                                  {cert.approval_comment || 'Произошла ошибка при оформлении сертификата. Пожалуйста, свяжитесь с поддержкой.'}
                                </p>
                                <button onClick={() => setTab('feedback')} className="btn btn-soft" style={{ padding: '10px 18px', fontSize: '0.82rem', gap: 6, borderRadius: 'var(--r-md)' }}>
                                  <MessageSquare size={14} /> Написать в поддержку
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}

            {/* ── Мои приложения ── */}
            {tab === 'apps' && <MyAppsTab udid={udid} />}

            {/* ── Мои устройства ── */}
            {tab === 'devices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {/* Header */}
                <div className="card" style={{ padding: 'var(--sp-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{t('cabinet.devices.title')}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                        {devices.length} {devices.length === 1 ? t('cabinet.devices.unit1') : devices.length < 5 ? t('cabinet.devices.unit2') : t('cabinet.devices.unit5')} {t('cabinet.devices.bound')}
                      </p>
                    </div>
                    <button
                      className="btn btn-soft"
                      onClick={() => setShowShareLink(!showShareLink)}
                      style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', gap: 6, fontSize: '0.85rem' }}
                    >
                      <Plus size={14} /> Добавить
                    </button>
                  </div>
                </div>

                {/* Share link block */}
                {showShareLink && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 'var(--sp-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Send size={16} style={{ color: 'var(--accent)' }} />
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Отправьте ссылку другому человеку</h4>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.6 }}>
                      Человек откроет ссылку на своём iPhone, установит профиль — и его устройство автоматически добавится в ваш кабинет.
                    </p>
                    <div style={{
                      display: 'flex', gap: 8, alignItems: 'center',
                      padding: '10px 14px', borderRadius: 'var(--r-md)',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                    }}>
                      <code style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-2)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {`${window.location.origin}/add-device/${udid}`}
                      </code>
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          navigator.clipboard?.writeText(`${window.location.origin}/add-device/${udid}`)
                          setLinkCopied(true)
                          toast('Ссылка скопирована!')
                          setTimeout(() => setLinkCopied(false), 2000)
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 4, flexShrink: 0 }}
                      >
                        {linkCopied ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Скопировать</>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Device list */}
                {devices.length === 0 ? (
                  <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
                    <Smartphone size={48} style={{ color: 'var(--text-3)', opacity: 0.3, marginBottom: 16 }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Нет привязанных устройств</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', maxWidth: 320, margin: '0 auto' }}>
                      Устройство автоматически добавится при регистрации UDID
                    </p>
                  </div>
                ) : (
                  devices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card"
                      style={{ padding: 0, overflow: 'hidden' }}
                    >
                      {/* Device header - clickable */}
                      <div
                        onClick={() => {
                          const next = expandedDevice === device.udid ? null : device.udid
                          setExpandedDevice(next)
                          if (next) loadDeviceCerts(device.udid)
                        }}
                        style={{
                          padding: 'var(--sp-4) var(--sp-5)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 14,
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: 46, height: 46, borderRadius: 'var(--r-lg)',
                          background: device.udid === udid ? 'rgba(149,51,255,0.1)' : 'rgba(100,100,100,0.08)',
                          border: `1px solid ${device.udid === udid ? 'rgba(149,51,255,0.2)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Smartphone size={22} style={{ color: device.udid === udid ? 'var(--accent)' : 'var(--text-3)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{device.name}</h4>
                            {device.udid === udid && (
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                borderRadius: 'var(--r-full)', background: 'rgba(149,51,255,0.12)', color: 'var(--accent)',
                              }}>Моё</span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                            UDID: {device.udid.slice(0, 12)}...{device.udid.slice(-4)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)',
                          }}>
                            {device.certsCount} серт.
                          </span>
                          {expandedDevice === device.udid ? <ChevronUp size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />}
                        </div>
                      </div>

                      {/* Expanded - device info + certs */}
                      {expandedDevice === device.udid && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          style={{ borderTop: '1px solid var(--border)', padding: 'var(--sp-4) var(--sp-5)' }}
                        >
                          {/* Meta info */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                            {[
                              { label: 'Модель', value: device.name },
                              { label: 'Добавлено', value: device.addedAt },
                              { label: 'UDID', value: device.udid, mono: true, full: true },
                            ].map((meta, i) => (
                              <div key={i} style={{
                                gridColumn: meta.full ? '1 / -1' : undefined,
                                padding: '10px 12px', borderRadius: 'var(--r-md)',
                                background: 'var(--surface-2)',
                              }}>
                                <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{meta.label}</p>
                                <p style={{
                                  fontSize: '0.82rem', fontWeight: 600,
                                  fontFamily: meta.mono ? 'monospace' : undefined,
                                  wordBreak: meta.mono ? 'break-all' : undefined,
                                }}>{meta.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Certificates list */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <ShieldCheck size={15} style={{ color: 'var(--accent)' }} />
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Сертификаты</h5>
                          </div>
                          {!deviceCerts[device.udid] ? (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Загрузка...</p>
                          ) : deviceCerts[device.udid].length === 0 ? (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Нет сертификатов для этого устройства</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {deviceCerts[device.udid].map((cert) => (
                                <div key={cert.id} style={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '10px 12px', borderRadius: 'var(--r-md)',
                                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                                }}>
                                  <div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{cert.plan_id?.slice(0, 8) || 'Сертификат'}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                                      {new Date(cert.created_at).toLocaleDateString('ru-RU')}
                                    </p>
                                  </div>
                                  <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                                    borderRadius: 'var(--r-full)',
                                    background: cert.status === 'active' ? 'rgba(52,199,89,0.1)' : 'rgba(255,165,0,0.1)',
                                    color: cert.status === 'active' ? 'var(--success)' : '#f59e0b',
                                  }}>
                                    {cert.status === 'active' ? '✅ Активен' : '⏳ ' + cert.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Copy UDID button */}
                          <button
                            className="btn btn-ghost"
                            onClick={() => {
                              navigator.clipboard?.writeText(device.udid)
                              setCopiedUdid(device.udid)
                              toast('UDID скопирован')
                              setTimeout(() => setCopiedUdid(null), 2000)
                            }}
                            style={{ marginTop: 12, fontSize: '0.78rem', gap: 4, padding: '8px 14px' }}
                          >
                            {copiedUdid === device.udid ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Скопировать UDID</>}
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}


            {/* ── Мои подписки ── */}
            {tab === 'subs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {/* Шапка */}
                <div className="card" style={{ padding: 'var(--sp-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{t('cabinet.subs.title')}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                        {subscriptions.length > 0 ? `${subscriptions.filter(s => s.status === 'active').length} активных` : 'Нет активных подписок'}
                      </p>
                    </div>
                    <Link to="/catalog?category=apps" className="btn btn-soft" style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', gap: 6, fontSize: '0.85rem' }}>
                      {t('cabinet.subs.catalogLink')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {subsLoading ? (
                  <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem' }}>Загрузка подписок...</p>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="card" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
                    <Crown size={48} style={{ color: 'var(--text-3)', opacity: 0.3, marginBottom: 16 }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>У вас пока нет подписок</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
                      Подписки на приложения появятся здесь после покупки. Перейдите в каталог чтобы выбрать.
                    </p>
                    <Link to="/catalog?category=apps" className="btn btn-gradient" style={{ padding: '12px 28px', borderRadius: 'var(--r-md)', gap: 8 }}>
                      <ShoppingBag size={16} /> Перейти в каталог
                    </Link>
                  </div>
                ) : (
                  subscriptions.map((sub) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card"
                      style={{ padding: 0, overflow: 'hidden' }}
                    >
                      {/* Header */}
                      <div style={{
                        background: sub.status === 'active'
                          ? 'linear-gradient(135deg, #9531ff, #6e00e5)'
                          : 'linear-gradient(135deg, #555, #333)',
                        padding: 'var(--sp-5)', color: '#fff',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: 'var(--r-lg)',
                              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Crown size={24} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{sub.app_name}</h4>
                              <p style={{ fontSize: '0.82rem', opacity: 0.85 }}>{sub.plan}</p>
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 12px', borderRadius: 'var(--r-full)',
                            background: sub.status === 'active' ? 'rgba(52,199,89,0.2)' : 'rgba(255,255,255,0.15)',
                            fontSize: '0.75rem', fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            {sub.status === 'active' ? <><CheckCircle2 size={14} /> Активна</> : 'Неактивна'}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ padding: 'var(--sp-5)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                        {[
                          { label: 'Тариф', value: sub.plan, color: 'var(--accent)' },
                          { label: 'Активна до', value: sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('ru-RU') : '—', color: sub.status === 'active' ? 'var(--success)' : 'var(--text-3)' },
                          { label: 'Цена', value: `${sub.price}₽`, color: 'var(--text-2)' },
                          { label: 'Автопродление', value: sub.auto_renew ? 'Вкл' : 'Выкл', color: sub.auto_renew ? 'var(--success)' : 'var(--text-3)' },
                        ].map((stat, i) => (
                          <div key={i} style={{
                            padding: '12px 14px', borderRadius: 'var(--r-md)',
                            background: 'var(--surface-2)', border: '1px solid var(--border)',
                          }}>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{stat.label}</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* ── Обращения (Tickets) ── */}
            {tab === 'tickets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {/* Header */}
                <div className="card" style={{ padding: 'var(--sp-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{t('cabinet.tickets.title')}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{t('cabinet.tickets.subtitle')}</p>
                    </div>
                    <button
                      className="btn btn-gradient"
                      onClick={() => setShowCreateTicket(!showCreateTicket)}
                      style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', gap: 6, fontSize: '0.85rem' }}
                    >
                      <Plus size={16} />
                      {t('cabinet.tickets.createBtn')}
                    </button>
                  </div>

                  {/* Create ticket form */}
                  {showCreateTicket && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex', flexDirection: 'column', gap: 16,
                      }}
                    >
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
                        {t('cabinet.tickets.createTitle')}
                      </h4>

                      {/* Subject select */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {t('cabinet.tickets.subjectLabel')}
                        </label>
                        <select
                          className="field"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          style={{
                            borderRadius: 'var(--r-md)', padding: '12px 14px',
                            appearance: 'none', cursor: 'pointer',
                            background: 'var(--surface-2)', color: ticketSubject ? 'var(--text)' : 'var(--text-3)',
                          }}
                        >
                          <option value="">{t('cabinet.tickets.subjectPlaceholder')}</option>
                          <option value="cert">{t('cabinet.tickets.subject.cert')}</option>
                          <option value="app">{t('cabinet.tickets.subject.app')}</option>
                          <option value="payment">{t('cabinet.tickets.subject.payment')}</option>
                          <option value="install">{t('cabinet.tickets.subject.install')}</option>
                          <option value="revoke">{t('cabinet.tickets.subject.revoke')}</option>
                          <option value="other">{t('cabinet.tickets.subject.other')}</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {t('cabinet.tickets.messageLabel')}
                        </label>
                        <textarea
                          className="field"
                          placeholder={t('cabinet.tickets.messagePlaceholder')}
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          style={{
                            borderRadius: 'var(--r-md)', minHeight: 120, resize: 'vertical',
                            padding: '14px 16px', lineHeight: 1.6,
                          }}
                        />
                      </div>

                      {/* Screenshot upload */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {t('cabinet.tickets.screenshotLabel')}
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleTicketImageUpload}
                          style={{ display: 'none' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-soft"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={ticketImageUploading}
                            style={{
                              padding: '10px 18px', borderRadius: 'var(--r-md)', gap: 8,
                              fontSize: '0.85rem', fontWeight: 600,
                            }}
                          >
                            {ticketImageUploading ? (
                              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('cabinet.tickets.screenshotUploading')}</>
                            ) : ticketImageUrl ? (
                              <><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> {t('cabinet.tickets.screenshotUploaded')}</>
                            ) : (
                              <><Upload size={14} /> {t('cabinet.tickets.screenshotUpload')}</>
                            )}
                          </button>

                          {ticketImageUrl && (
                            <div style={{
                              position: 'relative', width: 56, height: 56,
                              borderRadius: 'var(--r-md)', overflow: 'hidden',
                              border: '2px solid rgba(149,51,255,0.3)',
                            }}>
                              <img src={ticketImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                onClick={() => setTicketImageUrl(null)}
                                style={{
                                  position: 'absolute', top: 2, right: 2,
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer',
                                }}
                              >✕</button>
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 6 }}>
                          <ImageIcon size={12} style={{ opacity: 0.5 }} /> {t('cabinet.tickets.screenshotHint')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="btn btn-gradient"
                          onClick={handleCreateTicket}
                          disabled={ticketSubmitting}
                          style={{ padding: '12px 24px', borderRadius: 'var(--r-md)', gap: 8, fontSize: '0.88rem' }}
                        >
                          {ticketSubmitting ? (
                            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('cabinet.tickets.sending')}</>
                          ) : (
                            <><Send size={16} /> {t('cabinet.tickets.send')}</>
                          )}
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => { setShowCreateTicket(false); setTicketSubject(''); setTicketMessage(''); setTicketImageUrl(null) }}
                          style={{ padding: '12px 18px', borderRadius: 'var(--r-md)', fontSize: '0.88rem' }}
                        >
                          {t('cabinet.tickets.cancel')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Tickets list */}
                {ticketsLoading ? (
                  <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
                    <Loader2 size={32} style={{ color: 'var(--accent)', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem' }}>{t('cabinet.tickets.loading')}</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
                    <MessageSquare size={40} style={{ color: 'var(--text-3)', margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-3)', fontSize: '0.88rem' }}>{t('cabinet.tickets.empty')}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginTop: 4 }}>{t('cabinet.tickets.emptyHint')}</p>
                  </div>
                ) : (
                  tickets.map((ticket, idx) => {
                    const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
                      open: {
                        color: '#3b82f6',
                        bg: 'rgba(59,130,246,0.08)',
                        border: 'rgba(59,130,246,0.2)',
                        icon: <Clock size={14} />,
                      },
                      in_progress: {
                        color: '#f59e0b',
                        bg: 'rgba(245,158,11,0.08)',
                        border: 'rgba(245,158,11,0.2)',
                        icon: <Loader2 size={14} />,
                      },
                      resolved: {
                        color: 'var(--success)',
                        bg: 'rgba(34,197,94,0.08)',
                        border: 'rgba(34,197,94,0.2)',
                        icon: <CheckCircle2 size={14} />,
                      },
                    }
                    const cfg = statusConfig[ticket.status] || statusConfig.open

                    // Map subject key to translation
                    const subjectMap: Record<string, string> = {
                      cert: t('cabinet.tickets.subject.cert'),
                      app: t('cabinet.tickets.subject.app'),
                      payment: t('cabinet.tickets.subject.payment'),
                      install: t('cabinet.tickets.subject.install'),
                      revoke: t('cabinet.tickets.subject.revoke'),
                      other: t('cabinet.tickets.subject.other'),
                    }
                    const displaySubject = subjectMap[ticket.subject] || ticket.subject || t('cabinet.tickets.noSubject')

                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="card"
                        style={{ padding: 0, overflow: 'hidden' }}
                      >
                        {/* Status header */}
                        <div style={{
                          padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: cfg.bg, borderBottom: `1px solid ${cfg.border}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: cfg.color }}>{cfg.icon}</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cfg.color }}>
                              {t(`cabinet.tickets.status.${ticket.status}`)}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>#{ticket.id.substring(0, 8)}</span>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
                              background: 'linear-gradient(135deg, rgba(149,51,255,0.12), rgba(59,130,246,0.08))',
                              border: '1px solid rgba(149,51,255,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 4 }}>{displaySubject}</p>
                              <p style={{
                                fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6,
                                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {ticket.message}
                              </p>
                            </div>
                          </div>

                          {/* Footer meta */}
                          <div style={{
                            display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-3)',
                            alignItems: 'center', flexWrap: 'wrap',
                            paddingTop: 12, borderTop: '1px solid var(--border)',
                          }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} /> {t('cabinet.tickets.date')}: {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                            </span>
                            {ticket.image_url && (
                              <a
                                href={ticket.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-soft"
                                style={{
                                  padding: '4px 12px', fontSize: '0.75rem',
                                  borderRadius: 'var(--r-sm)', gap: 4,
                                  textDecoration: 'none',
                                }}
                              >
                                <Eye size={12} /> {t('cabinet.tickets.viewScreenshot')}
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}

            {/* ── Обратная связь ── */}
            {tab === 'feedback' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                {/* ── Оставить отзыв ── */}
                {udid && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ padding: 'var(--sp-6)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-5)' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--r-md)',
                        background: 'rgba(252,171,20,0.1)', border: '1px solid rgba(252,171,20,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Star size={20} style={{ color: '#fcab14' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Оставить отзыв</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Поделитесь вашим опытом с BAZZAR</p>
                      </div>
                    </div>

                    {reviewSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: 'var(--sp-6)', textAlign: 'center',
                          background: 'rgba(59,179,59,0.06)', borderRadius: 'var(--r-md)',
                          border: '1px solid rgba(59,179,59,0.15)',
                        }}
                      >
                        <CheckCircle2 size={40} style={{ color: '#3bb33b', marginBottom: 12 }} />
                        <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>Спасибо за ваш отзыв!</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Ваш отзыв был успешно отправлен и появится на главной странице.</p>
                      </motion.div>
                    ) : (
                      <>
                        {/* Star Rating */}
                        <div style={{ marginBottom: 'var(--sp-4)' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Ваша оценка
                          </label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <motion.button
                                key={s}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setReviewRating(s)}
                                style={{
                                  width: 44, height: 44,
                                  borderRadius: 'var(--r-md)',
                                  background: s <= reviewRating
                                    ? 'rgba(252,171,20,0.15)'
                                    : 'var(--surface-2)',
                                  border: `1px solid ${s <= reviewRating ? 'rgba(252,171,20,0.4)' : 'var(--border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 200ms',
                                }}
                              >
                                <Star
                                  size={20}
                                  fill={s <= reviewRating ? '#fcab14' : 'transparent'}
                                  stroke={s <= reviewRating ? '#fcab14' : 'var(--text-3)'}
                                />
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Review Text */}
                        <div style={{ marginBottom: 'var(--sp-4)' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Ваш отзыв
                          </label>
                          <textarea
                            className="field"
                            placeholder="Расскажите, что вам понравилось или что можно улучшить..."
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            style={{
                              borderRadius: 'var(--r-md)', minHeight: 100, resize: 'vertical',
                              padding: '14px 16px', lineHeight: 1.6,
                            }}
                          />
                        </div>

                        {/* Submit */}
                        <button
                          className="btn btn-gradient"
                          disabled={reviewSubmitting || reviewRating === 0 || !reviewText.trim()}
                          onClick={handleSubmitReview}
                          style={{
                            padding: '14px 28px', borderRadius: 'var(--r-md)', gap: 8,
                            opacity: (reviewRating === 0 || !reviewText.trim()) ? 0.5 : 1,
                          }}
                        >
                          {reviewSubmitting ? (
                            <><Loader2 size={16} className="spin" /> Отправка...</>
                          ) : (
                            <><Star size={16} /> Отправить отзыв</>
                          )}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── Обратная связь (original) ── */}
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--sp-5)' }}>{t('cabinet.feedback.title')}</h3>

                  {/* Тип обращения */}
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t('cabinet.feedback.typeLabel')}
                    </label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[
                        { id: 'suggestion', label: t('cabinet.feedback.suggestion') },
                        { id: 'problem', label: t('cabinet.feedback.problem') },
                        { id: 'question', label: t('cabinet.feedback.question') },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setFeedbackType(t.id)}
                          style={{
                            padding: '8px 16px', borderRadius: 'var(--r-full)',
                            fontSize: '0.82rem', fontWeight: 600,
                            background: feedbackType === t.id ? 'rgba(149,51,255,0.15)' : 'var(--surface-2)',
                            color: feedbackType === t.id ? 'var(--accent)' : 'var(--text-3)',
                            border: `1px solid ${feedbackType === t.id ? 'rgba(149,51,255,0.3)' : 'var(--border)'}`,
                            transition: 'all 200ms',
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Сообщение */}
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Сообщение
                    </label>
                    <textarea
                      className="field"
                      placeholder="Опишите вашу проблему или предложение..."
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                      style={{
                        borderRadius: 'var(--r-md)', minHeight: 120, resize: 'vertical',
                        padding: '14px 16px', lineHeight: 1.6,
                      }}
                    />
                  </div>

                  {/* Кнопка */}
                  <button
                    className="btn btn-gradient"
                    onClick={handleFeedback}
                    style={{ padding: '14px 28px', borderRadius: 'var(--r-md)', gap: 8 }}
                  >
                    <Send size={16} />
                    {t('cabinet.feedback.send')}
                  </button>

                  {feedbackSent && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: 12, fontWeight: 600 }}
                    >
                      {t('cabinet.feedback.sent')}
                    </motion.p>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </section>
  )
}

