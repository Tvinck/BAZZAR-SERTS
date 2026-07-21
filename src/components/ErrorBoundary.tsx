import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   ErrorBoundary — Ловит JS ошибки, показывает красивый экран
   ═══════════════════════════════════════════════════════════ */

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          padding: 24,
        }}>
          {/* Gradient mesh background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(149,51,255,0.12) 0%, transparent 55%),' +
              'radial-gradient(ellipse at 70% 80%, rgba(255,33,33,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'relative',
            maxWidth: 420,
            width: '100%',
            background: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 0.5px 0 rgba(255,255,255,0.06)',
          }}>
            {/* Icon */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(255, 33, 33, 0.1)',
              border: '1px solid rgba(255, 33, 33, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <AlertTriangle size={32} style={{ color: '#ff4444' }} />
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}>
              Что-то пошло не так
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>

            {/* Error details (dev mode) */}
            {this.state.error && (
              <div style={{
                background: 'rgba(255, 33, 33, 0.06)',
                border: '1px solid rgba(255, 33, 33, 0.12)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 28,
                textAlign: 'left',
                maxHeight: 100,
                overflow: 'auto',
              }}>
                <code style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.message}
                </code>
              </div>
            )}

            {/* Reload button */}
            <button
              onClick={this.handleReload}
              className="btn btn-gradient"
              style={{
                padding: '14px 32px',
                borderRadius: 'var(--r-md)',
                fontSize: '0.92rem',
                fontWeight: 700,
                gap: 8,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <RefreshCcw size={16} />
              Обновить
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
