/** Декоративный фон: мягкие цветные «облака» для глубины секций. */
export function Mesh({ variant = 'a' }: { variant?: 'a' | 'b' | 'hero' }) {
  return (
    <div className="mesh" aria-hidden>
      {variant === 'hero' ? (
        <>
          <div className="blob" style={{ width: 560, height: 560, top: -180, right: -60, background: 'radial-gradient(circle,#7c5cff,transparent 70%)', opacity: 0.45 }} />
          <div className="blob" style={{ width: 460, height: 460, top: 80, left: -140, background: 'radial-gradient(circle,#22d3ee,transparent 70%)', opacity: 0.32 }} />
          <div className="blob" style={{ width: 420, height: 420, bottom: -160, left: '40%', background: 'radial-gradient(circle,#d426d3,transparent 70%)', opacity: 0.3 }} />
        </>
      ) : variant === 'b' ? (
        <>
          <div className="blob" style={{ width: 420, height: 420, top: -120, left: '10%', background: 'radial-gradient(circle,#22d3ee,transparent 70%)', opacity: 0.22 }} />
          <div className="blob" style={{ width: 380, height: 380, bottom: -140, right: -40, background: 'radial-gradient(circle,#7c5cff,transparent 70%)', opacity: 0.25 }} />
        </>
      ) : (
        <>
          <div className="blob" style={{ width: 440, height: 440, top: -140, right: -80, background: 'radial-gradient(circle,#7c5cff,transparent 70%)', opacity: 0.2 }} />
          <div className="blob" style={{ width: 360, height: 360, bottom: -120, left: -60, background: 'radial-gradient(circle,#d426d3,transparent 70%)', opacity: 0.18 }} />
        </>
      )}
    </div>
  )
}
