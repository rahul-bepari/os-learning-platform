import { useParams, Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import Chapter1 from './Chapter1'
import Chapter2 from './Chapter2'
import Chapter3 from './Chapter3'
import Chapter4 from './Chapter4'
import Chapter5 from './Chapter5'
import Chapter6 from './Chapter6'
import Chapter7 from './Chapter7'
import Chapter8 from './Chapter8'

export default function Chapter() {
  const { id } = useParams()
  const ch = chapters.find(c => c.id === parseInt(id))
  if (!ch) return <div style={{ padding: '60px', color: 'var(--text-secondary)' }}>Chapter not found.</div>

  if (ch.id === 1) return <Chapter1 />
  if (ch.id === 2) return <Chapter2 />
  if (ch.id === 3) return <Chapter3 />
  if (ch.id === 4) return <Chapter4 />
  if (ch.id === 5) return <Chapter5 />
  if (ch.id === 6) return <Chapter6 />
  if (ch.id === 7) return <Chapter7 />
  if (ch.id === 8) return <Chapter8 />

  const prev = chapters.find(c => c.id === ch.id - 1)
  const next = chapters.find(c => c.id === ch.id + 1)

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid ' + ch.color + '44', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: ch.color, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Chapter {ch.id}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>{ch.icon}</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>{ch.title}</h1>
        </div>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 24 }}>{ch.subtitle}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ch.topics.map(function(t) {
            return (
              <span key={t} style={{ fontSize: 12, color: ch.color, background: ch.color + '18', border: '1px solid ' + ch.color + '33', padding: '4px 12px', borderRadius: 20 }}>
                {t}
              </span>
            )
          })}
        </div>
      </div>

      <div style={{ padding: 60 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🚧</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Full content coming soon
          </div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>
            Building Chapter {ch.id}: <strong style={{ color: ch.color }}>{ch.title}</strong>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            Will include detailed explanations, visualizations, code editor, terminal, and quiz.
          </div>
          <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {ch.topics.map(function(t) {
              return (
                <span key={t} style={{ fontSize: 12, color: ch.color, background: ch.color + '12', border: '1px solid ' + ch.color + '33', padding: '4px 12px', borderRadius: 20 }}>
                  {t}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 60px 60px', gap: 16 }}>
        {prev
          ? (
            <Link to={'/chapter/' + prev.id} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 24px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = prev.color }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Previous Chapter</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prev.icon} Ch {prev.id}: {prev.title}</div>
              </div>
            </Link>
          )
          : <div />}
        {next && (
          <Link to={'/chapter/' + next.id} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 24px', cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s' }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = next.color }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Next Chapter</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{next.icon} Ch {next.id}: {next.title}</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}