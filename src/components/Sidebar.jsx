import { Link, useLocation } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar() {
  const location = useLocation()
  const { theme, toggle } = useTheme()

  return (
    <div style={{
      width: '260px', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--accent-blue)' }}>⚡ OS Concepts</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Silberschatz 10th Edition</div>
          </div>
          <button onClick={e => { e.preventDefault(); toggle() }} style={{
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
            fontSize: '16px', color: 'var(--text-primary)'
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </Link>

      <nav style={{ padding: '8px 0', flex: 1 }}>
        {chapters.map(ch => {
          const active = location.pathname === `/chapter/${ch.id}`
          return (
            <Link key={ch.id} to={`/chapter/${ch.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 16px', cursor: 'pointer', transition: 'all 0.2s',
                background: active ? 'var(--bg-hover)' : 'transparent',
                borderLeft: active ? `3px solid ${ch.color}` : '3px solid transparent',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-card)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '16px' }}>{ch.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    Ch {ch.id}: {ch.title}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
        20 Chapters · Interactive Learning
      </div>
    </div>
  )
}