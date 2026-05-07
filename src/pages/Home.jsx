import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1f3d 50%, #0a0e1a 100%)',
        padding: '80px 60px 60px', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px',
            padding: '4px 14px', fontSize: '12px', color: 'var(--accent-blue)',
            marginBottom: '20px', fontWeight: '500'
          }}>
            Based on Silberschatz, Galvin & Gagne — 10th Edition
          </div>
          <h1 style={{
            fontSize: '52px', fontWeight: '800', lineHeight: '1.1',
            background: 'linear-gradient(135deg, #f1f5f9, #3b82f6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>
            Operating System<br />Concepts
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '32px', maxWidth: '600px' }}>
            Learn every concept from the ground up — with interactive visualizations, simulators, and animations. No prior experience needed.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/chapter/1" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--accent-blue)', color: 'white', border: 'none',
                padding: '12px 28px', borderRadius: '8px', fontSize: '15px',
                fontWeight: '600', cursor: 'pointer'
              }}>
                Start Learning →
              </button>
            </Link>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '48px' }}>
            {[['20', 'Chapters'], ['200+', 'Visualizations'], ['100+', 'Simulators'], ['Free', 'Forever']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-blue)' }}>{n}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter Grid */}
      <div style={{ padding: '60px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>All Chapters</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Click any chapter to start learning</p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'
        }}>
          {chapters.map(ch => (
            <Link key={ch.id} to={`/chapter/${ch.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '24px', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = ch.color
                  e.currentTarget.style.boxShadow = `0 8px 30px ${ch.color}22`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{ch.icon}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', color: ch.color,
                    background: `${ch.color}18`, padding: '3px 10px', borderRadius: '12px'
                  }}>Ch {ch.id}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>{ch.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{ch.subtitle}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ch.topics.slice(0, 3).map(t => (
                    <span key={t} style={{
                      fontSize: '11px', color: 'var(--text-muted)',
                      background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px'
                    }}>{t}</span>
                  ))}
                  {ch.topics.length > 3 && (
                    <span style={{ fontSize: '11px', color: ch.color }}>+{ch.topics.length - 3} more</span>
                  )}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '3px', background: `linear-gradient(90deg, ${ch.color}, transparent)`
                }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}