import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '8.1 Deadlock Overview',      icon: '💀' },
  { id: 'conditions',  title: '8.2 Four Conditions',        icon: '🔒' },
  { id: 'graph',       title: '8.3 Resource Alloc Graph',   icon: '📊' },
  { id: 'prevention',  title: '8.4 Deadlock Prevention',    icon: '🛡️' },
  { id: 'avoidance',   title: '8.5 Deadlock Avoidance',     icon: '🏦' },
  { id: 'detection',   title: '8.6 Deadlock Detection',     icon: '🔍' },
  { id: 'recovery',    title: '8.7 Recovery',               icon: '🔧' },
  { id: 'simulator',   title: '🎮 Banker\'s Algorithm',     icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'Which of the four necessary conditions for deadlock can be broken by allowing resource preemption?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'],
    answer: 2,
    explanation: 'Breaking No Preemption means the OS can forcibly take a resource from a process. If a process holding resources requests another that cannot be immediately allocated, all its resources are preempted and added to the list of resources it is waiting for.'
  },
  {
    q: 'In a Resource Allocation Graph, what does a cycle indicate?',
    options: [
      'A process has completed',
      'Deadlock is definitely present if each resource has exactly one instance',
      'A resource is being shared',
      'The system is in a safe state'
    ],
    answer: 1,
    explanation: 'A cycle in a RAG with single-instance resources means deadlock IS present. With multiple instances per resource, a cycle means deadlock MAY exist — further analysis is needed.'
  },
  {
    q: 'What is a "safe state" in the context of deadlock avoidance?',
    options: [
      'No processes are running',
      'All resources are free',
      'There exists a safe sequence in which all processes can complete',
      'No process is waiting for resources'
    ],
    answer: 2,
    explanation: 'A safe state is one where there exists at least one safe sequence — an ordering of all processes such that each process can be allocated its maximum resources using currently available resources plus resources held by processes that finish before it.'
  },
  {
    q: 'The Banker\'s Algorithm is named after banking because:',
    options: [
      'It was invented by a banker',
      'It manages money allocation',
      'Like a bank that never allocates cash that could cause it to fail to satisfy all customers, it never allocates resources that could cause deadlock',
      'It charges processes for resource usage'
    ],
    answer: 2,
    explanation: 'A bank never gives out so much cash that it cannot satisfy all customers. Similarly, the Banker\'s Algorithm never allocates resources in a way that could lead to deadlock — it only grants requests that keep the system in a safe state.'
  },
  {
    q: 'What is the main disadvantage of deadlock prevention?',
    options: [
      'It is too complex to implement',
      'It requires knowing maximum resource needs in advance',
      'It leads to low device utilization and reduced throughput',
      'It cannot handle circular wait'
    ],
    answer: 2,
    explanation: 'Deadlock prevention works by constraining how resources are requested, which leads to low device utilization and reduced throughput. For example, requiring all resources to be requested upfront (breaking Hold-and-Wait) means resources are held for the entire duration even when not needed.'
  },
  {
    q: 'In deadlock recovery by process termination, which is the safer approach?',
    options: [
      'Abort all deadlocked processes at once',
      'Abort one process at a time until the deadlock cycle is eliminated',
      'Restart the entire system',
      'Ignore the deadlock and hope it resolves'
    ],
    answer: 1,
    explanation: 'Aborting one process at a time allows the detection algorithm to run after each abort to check if deadlock is resolved — avoiding unnecessary termination of processes. Aborting all at once is more drastic but simpler. Both are valid — the choice depends on the system\'s priorities.'
  },
]

function InfoBox({ children, color }) {
  return (
    <div style={{ background: color + '12', border: '1px solid ' + color + '44', borderLeft: '4px solid ' + color, borderRadius: 10, padding: '16px 20px', marginBottom: 24, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      {children}
    </div>
  )
}

function LearnMore({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #f97316', color: '#f97316', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(249,115,22,0.06)', border: '1px solid #f9731633', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function NavButtons({ prev, prevLabel, next, nextLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
      {prev ? <button onClick={prev} style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{prevLabel}</button> : <div />}
      {next && <button onClick={next} style={{ background: '#f97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

// ── Resource Allocation Graph Visualizer ──────────────────────
function RAGVisualizer() {
  const [scenario, setScenario] = useState('safe')

  const scenarios = {
    safe: {
      label: 'No Deadlock',
      color: '#10b981',
      desc: 'P1 holds R1 and requests R2. P2 holds R2. P2 can finish and release R2, then P1 can proceed. No cycle — no deadlock.',
      processes: ['P1', 'P2'],
      resources: ['R1', 'R2'],
      holds: [['P1', 'R1'], ['P2', 'R2']],
      requests: [['P1', 'R2']],
    },
    deadlock: {
      label: 'Deadlock!',
      color: '#ef4444',
      desc: 'P1 holds R1, requests R2. P2 holds R2, requests R1. Circular wait — DEADLOCK! Neither can proceed.',
      processes: ['P1', 'P2'],
      resources: ['R1', 'R2'],
      holds: [['P1', 'R1'], ['P2', 'R2']],
      requests: [['P1', 'R2'], ['P2', 'R1']],
    },
    multi: {
      label: 'Cycle but No Deadlock',
      color: '#f59e0b',
      desc: 'R1 has 2 instances. P1 and P3 hold one each. P2 requests R1. There IS a cycle but P3 can finish and release R1 for P2 — no deadlock.',
      processes: ['P1', 'P2', 'P3'],
      resources: ['R1(x2)', 'R2'],
      holds: [['P1', 'R1(x2)'], ['P3', 'R1(x2)'], ['P2', 'R2']],
      requests: [['P2', 'R1(x2)'], ['P1', 'R2']],
    },
  }

  const s = scenarios[scenario]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Resource Allocation Graph</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Select a scenario to see how cycles relate to deadlock.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.keys(scenarios).map(function(key) {
          const sc = scenarios[key]
          return (
            <button key={key} onClick={function() { setScenario(key) }} style={{ background: scenario === key ? sc.color + '33' : 'var(--bg-secondary)', color: scenario === key ? sc.color : 'var(--text-secondary)', border: '1px solid ' + (scenario === key ? sc.color : 'var(--border)'), padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: scenario === key ? 700 : 400 }}>
              {sc.label}
            </button>
          )
        })}
      </div>

      <div style={{ background: s.color + '15', border: '1px solid ' + s.color + '44', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>PROCESSES (circles)</div>
          {s.processes.map(function(p) {
            return (
              <div key={p} style={{ background: '#3b82f622', border: '2px solid #3b82f6', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>{p}</div>
            )
          })}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>RESOURCES (squares)</div>
          {s.resources.map(function(r) {
            return (
              <div key={r} style={{ background: '#f59e0b22', border: '2px solid #f59e0b', borderRadius: 8, width: 70, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f59e0b', marginBottom: 8, fontSize: 12 }}>{r}</div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Assignment edges (Resource → Process)</div>
          {s.holds.map(function(e, i) {
            return (
              <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{e[1]}</span>
                <span style={{ color: '#10b981', margin: '0 8px' }}>→</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{e[0]}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>({e[0]} holds {e[1]})</span>
              </div>
            )
          })}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Request edges (Process → Resource)</div>
          {s.requests.map(function(e, i) {
            return (
              <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{e[0]}</span>
                <span style={{ color: '#ef4444', margin: '0 8px' }}>→</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{e[1]}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>({e[0]} wants {e[1]})</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, background: scenario === 'deadlock' ? '#ef444418' : '#10b98118', border: '1px solid ' + (scenario === 'deadlock' ? '#ef4444' : '#10b981') + '44', borderRadius: 8, padding: 12, fontSize: 13, color: scenario === 'deadlock' ? '#ef4444' : '#10b981', fontWeight: 700, textAlign: 'center' }}>
        {scenario === 'deadlock' ? 'CYCLE DETECTED — DEADLOCK! (single instance resources)' : scenario === 'multi' ? 'CYCLE EXISTS but NOT deadlock (multiple instances — P3 can finish first)' : 'NO CYCLE — No Deadlock'}
      </div>
    </div>
  )
}

// ── Banker's Algorithm Simulator ──────────────────────────────
function BankersAlgorithm() {
  const initialAlloc  = [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]
  const initialMax    = [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]
  const initialAvail  = [3,3,2]

  const [alloc]  = useState(initialAlloc)
  const [max]    = useState(initialMax)
  const [avail]  = useState(initialAvail)
  const [result, setResult] = useState(null)

  const need = alloc.map(function(row, i) {
    return row.map(function(v, j) { return max[i][j] - v })
  })

  function runBankers() {
    const n = 5, m = 3
    const work    = [...avail]
    const finish  = Array(n).fill(false)
    const safeSeq = []
    let progress  = true

    while (progress) {
      progress = false
      for (let i = 0; i < n; i++) {
        if (!finish[i]) {
          let canRun = true
          for (let j = 0; j < m; j++) {
            if (need[i][j] > work[j]) { canRun = false; break }
          }
          if (canRun) {
            for (let j = 0; j < m; j++) work[j] += alloc[i][j]
            finish[i] = true
            safeSeq.push('P' + i)
            progress = true
          }
        }
      }
    }

    const safe = finish.every(function(f) { return f })
    setResult({ safe, safeSeq })
  }

  const pNames = ['P0', 'P1', 'P2', 'P3', 'P4']
  const rNames = ['A', 'B', 'C']

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Banker's Algorithm Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Classic Banker's Algorithm example from the textbook. 5 processes, 3 resource types (A, B, C). Available: A=3, B=3, C=2.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Process</th>
              {['Allocation (A B C)', 'Maximum (A B C)', 'Need (A B C)'].map(function(h) {
                return <th key={h} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {pNames.map(function(p, i) {
              return (
                <tr key={p} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#f97316' }}>{p}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace', color: '#3b82f6' }}>{alloc[i].join('  ')}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace', color: '#8b5cf6' }}>{max[i].join('  ')}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace', color: '#f59e0b' }}>{need[i].join('  ')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid #10b98144', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Available: </span>
          <span style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>A={avail[0]} B={avail[1]} C={avail[2]}</span>
        </div>
        <button onClick={runBankers} style={{ background: '#f97316', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          Run Banker's Algorithm
        </button>
      </div>

      {result && (
        <div style={{ background: result.safe ? '#10b98118' : '#ef444418', border: '1px solid ' + (result.safe ? '#10b981' : '#ef4444') + '44', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: result.safe ? '#10b981' : '#ef4444', marginBottom: 12 }}>
            {result.safe ? 'SAFE STATE — Safe sequence found!' : 'UNSAFE STATE — Deadlock possible!'}
          </div>
          {result.safe && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Safe sequence:</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {result.safeSeq.map(function(p, i) {
                  return (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ background: '#f9731622', border: '1px solid #f97316', color: '#f97316', padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>{p}</div>
                      {i < result.safeSeq.length - 1 && <span style={{ color: '#10b981', fontSize: 16 }}>→</span>}
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7 }}>
                Each process in the sequence can complete with currently available resources plus resources released by previously completed processes. The system is in a safe state — no deadlock.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Chapter8() {
  const [active, setActive] = useState('overview')
  const [quiz, setQuiz]     = useState({ current: 0, selected: null, answered: false, score: 0, done: false })

  function handleAnswer(i) {
    if (quiz.answered) return
    const correct = i === QUIZ[quiz.current].answer
    setQuiz(function(q) { return { ...q, selected: i, answered: true, score: correct ? q.score + 1 : q.score } })
  }
  function nextQuestion() {
    if (quiz.current + 1 >= QUIZ.length) setQuiz(function(q) { return { ...q, done: true } })
    else setQuiz(function(q) { return { ...q, current: q.current + 1, selected: null, answered: false } })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #f9731644', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#f97316', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 8</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>💀</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Deadlocks</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          When processes get stuck waiting forever — the four conditions, prevention, avoidance with the Banker's Algorithm, detection, and recovery.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Resource Allocation Graph', "Banker's Algorithm", 'Deadlock Prevention', 'Deadlock Detection', 'Recovery'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(249,115,22,0.1)', border: '1px solid #f9731633', color: '#f97316', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#f97316' : 'var(--text-secondary)', background: active === s.id ? 'rgba(249,115,22,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #f97316' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.1 Deadlock Overview</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What deadlock is, how it happens, and the challenge of dealing with it.</p>

              <InfoBox color="#f97316">
                A <strong>deadlock</strong> is a situation where a set of processes are all blocked, each waiting for a resource held by another process in the set. Nobody can proceed — it is a permanent freeze unless the OS intervenes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>A Real-World Analogy</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  Imagine two single-lane roads crossing. Car A is heading north, Car B is heading east. Car A enters the intersection holding the north-south lane and needs the east-west lane. Car B enters holding the east-west lane and needs the north-south lane. Neither can move — <strong style={{ color: '#f97316' }}>DEADLOCK</strong>.
                </p>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Classic System Deadlock Example</h3>
              <div style={{ background: '#0d1117', border: '1px solid #f9731644', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Thread 1 */</div>
                  <div style={{ color: '#3b82f6' }}>pthread_mutex_lock(&amp;mutex_A);  <span style={{ color: '#8b949e' }}>// gets A</span></div>
                  <div style={{ color: '#3b82f6' }}>pthread_mutex_lock(&amp;mutex_B);  <span style={{ color: '#ef4444' }}>// BLOCKED — B held by T2</span></div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Thread 2 */</div>
                  <div style={{ color: '#8b5cf6' }}>pthread_mutex_lock(&amp;mutex_B);  <span style={{ color: '#8b949e' }}>// gets B</span></div>
                  <div style={{ color: '#8b5cf6' }}>pthread_mutex_lock(&amp;mutex_A);  <span style={{ color: '#ef4444' }}>// BLOCKED — A held by T1</span></div>
                  <div></div>
                  <div style={{ color: '#ef4444', fontWeight: 700 }}>/* T1 waits for T2 to release B */</div>
                  <div style={{ color: '#ef4444', fontWeight: 700 }}>/* T2 waits for T1 to release A */</div>
                  <div style={{ color: '#ef4444', fontWeight: 700 }}>/* DEADLOCK — neither can proceed */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>How the OS Can Handle Deadlocks</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { approach: 'Prevention', color: '#10b981', desc: 'Design the system so deadlock is structurally impossible. Break one of the four necessary conditions.' },
                  { approach: 'Avoidance', color: '#3b82f6', desc: 'Dynamically examine resource requests to ensure the system never enters an unsafe state (Banker\'s Algorithm).' },
                  { approach: 'Detection + Recovery', color: '#f59e0b', desc: 'Allow deadlock to occur, detect it, and recover by terminating processes or preempting resources.' },
                  { approach: 'Ignore (Ostrich Algorithm)', color: '#6e7681', desc: 'Pretend deadlock never occurs. Most OSes (Linux, Windows) use this — deadlock is rare, recovery is complex, just reboot.' },
                ].map(function(a) {
                  return (
                    <div key={a.approach} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: a.color, marginBottom: 8 }}>{a.approach}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.desc}</p>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why most OSes ignore deadlocks:</strong> The Ostrich Algorithm — stick your head in the sand. Deadlocks are rare in typical use. Prevention reduces throughput. Avoidance requires advance knowledge of resource needs (impractical for general-purpose OSes). Detection requires periodic scanning. For most desktop/server systems, the user just reboots if something seems stuck. Real-time and safety-critical systems MUST handle deadlocks properly.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Deadlock in databases:</strong> Database systems DO handle deadlocks — they can't afford to ignore them. A long-running transaction holding locks can block others for minutes. Most database systems (MySQL InnoDB, PostgreSQL) run deadlock detection every 50ms-1s. When detected, they choose a "victim" transaction (usually the cheapest to roll back) and abort it, automatically releasing all its locks.
              </LearnMore>

              <NavButtons next={function() { setActive('conditions') }} nextLabel="8.2 Four Conditions →" />
            </div>
          )}

          {active === 'conditions' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.2 Four Necessary Conditions</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Deadlock can only occur if ALL four conditions hold simultaneously.</p>

              <InfoBox color="#ef4444">
                Deadlock can arise if and only if the following <strong>four conditions hold simultaneously</strong>. If ANY one condition is absent — no deadlock is possible.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {[
                  {
                    n: 1, name: 'Mutual Exclusion', color: '#ef4444',
                    desc: 'At least one resource must be held in a non-sharable mode. Only one process at a time can use the resource. If another process requests it, it must wait.',
                    example: 'A printer can only be used by one process at a time.',
                    break: 'Cannot be broken for inherently non-sharable resources (printers, tape drives). Can be broken for sharable resources (read-only files).',
                  },
                  {
                    n: 2, name: 'Hold and Wait', color: '#f59e0b',
                    desc: 'A process must be holding at least one resource and waiting to acquire additional resources that are currently held by other processes.',
                    example: 'P1 holds mutex_A and is waiting for mutex_B.',
                    break: 'Require processes to request all resources before execution. Or: a process may request resources only when it has none.',
                  },
                  {
                    n: 3, name: 'No Preemption', color: '#8b5cf6',
                    desc: 'Resources cannot be forcibly removed from a process holding them. They can only be released voluntarily by the process after it has completed its task.',
                    example: 'A process holding a mutex cannot have it taken away.',
                    break: 'If a process holding resources requests another that cannot be allocated, preempt (take away) all its resources. Re-allocate when all can be obtained.',
                  },
                  {
                    n: 4, name: 'Circular Wait', color: '#3b82f6',
                    desc: 'A set {P0, P1, ..., Pn} of processes must exist such that P0 waits for P1, P1 waits for P2, ..., and Pn waits for P0. A cycle of waiting.',
                    example: 'P1→P2→P3→P1 (each waiting for the next).',
                    break: 'Impose a total ordering of all resource types. Require each process to request resources in increasing order of enumeration.',
                  },
                ].map(function(c) {
                  return (
                    <div key={c.n} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '44', borderLeft: '4px solid ' + c.color, borderRadius: 10, padding: 20 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>{c.n}</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: c.color }}>{c.name}</div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{c.desc}</p>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 8 }}>Example: {c.example}</div>
                      <div style={{ background: c.color + '11', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        <strong style={{ color: c.color }}>How to break:</strong> {c.break}
                      </div>
                    </div>
                  )
                })}
              </div>

              <InfoBox color="#10b981">
                <strong>Key insight:</strong> These are NECESSARY conditions — all four must hold for deadlock. If you prevent even ONE condition, deadlock cannot occur. This is the basis of deadlock prevention strategies.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Circular wait is the most practical to break:</strong> Impose a total ordering on all resource types (R1, R2, ..., Rn). Require that processes always request resources in increasing order. If a process needs Ri and Rj where i less than j, it must request Ri before Rj. This guarantees no circular wait can form. Linux kernel uses this extensively — lock ordering is documented and enforced with tools like lockdep.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Lock ordering in practice:</strong> Linux lockdep is a runtime lock validator that tracks lock acquisition order. If a lock ordering inconsistency is detected (potential circular wait), it prints a warning with the full chain. This has caught hundreds of potential deadlocks in Linux kernel code before they became real deadlocks in production.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 8.1 Overview" next={function() { setActive('graph') }} nextLabel="8.3 Resource Alloc Graph →" />
            </div>
          )}

          {active === 'graph' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.3 Resource Allocation Graph</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>A visual tool for representing and detecting deadlock.</p>

              <InfoBox color="#3b82f6">
                A <strong>Resource Allocation Graph (RAG)</strong> precisely describes a deadlock. It has two types of nodes and two types of edges that together show the state of resource allocation in the system.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Graph Components</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Nodes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 8, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f622', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#3b82f6', flexShrink: 0 }}>Pi</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong style={{ color: '#3b82f6' }}>Process node</strong> — circle. Represents a process in the system.</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 8, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 30, background: '#f59e0b22', border: '2px solid #f59e0b', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>Rj</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong style={{ color: '#f59e0b' }}>Resource node</strong> — rectangle. Dots inside show number of instances.</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Edges</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 4, fontSize: 13 }}>Request Edge: Pi → Rj</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Process Pi is waiting for an instance of resource Rj. Pi is blocked.</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 4, fontSize: 13 }}>Assignment Edge: Rj → Pi</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>An instance of resource Rj is currently allocated to process Pi.</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Cycle Detection Rules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Single Instance Resources</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    If a cycle exists in the graph → <strong>deadlock is guaranteed</strong>. The cycle is both necessary AND sufficient for deadlock.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Multiple Instance Resources</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    If a cycle exists → <strong>deadlock MAY exist</strong>. No cycle → <strong>no deadlock</strong>. Need further analysis (Banker's) to determine.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive RAG Visualizer</h3>
              <RAGVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>RAG algorithm for detection:</strong> To detect deadlock in a RAG with single instances: find all cycles using DFS. Mark each node visited. If we reach a node that is already in the current DFS path — cycle detected — deadlock. Time complexity: O(V + E) where V = processes + resources, E = edges.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Claim edges:</strong> In deadlock avoidance using RAG, a third type of edge is added — the claim edge (dashed line from Pi to Rj) indicating Pi may request Rj in the future. Before granting a request, check if converting the claim edge to a request edge and then assignment edge would create a cycle. If yes — deny the request. This is only practical for single-instance resources.
              </LearnMore>

              <NavButtons prev={function() { setActive('conditions') }} prevLabel="← 8.2 Four Conditions" next={function() { setActive('prevention') }} nextLabel="8.4 Prevention →" />
            </div>
          )}

          {active === 'prevention' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.4 Deadlock Prevention</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Structurally guarantee deadlock cannot occur by breaking one of the four conditions.</p>

              <InfoBox color="#10b981">
                Deadlock prevention constrains how requests can be made to ensure that at least one of the four necessary conditions cannot hold. This <strong>eliminates deadlock entirely</strong> but at the cost of reduced utilization or throughput.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {[
                  {
                    condition: 'Break Mutual Exclusion',
                    color: '#ef4444',
                    method: 'Allow resources to be shared. Sharable resources (read-only files) do not require mutual exclusion.',
                    problem: 'Some resources are inherently non-sharable (printers, tape drives). Cannot eliminate mutual exclusion entirely.',
                    practical: 'Low — cannot be applied to most real resources.',
                  },
                  {
                    condition: 'Break Hold and Wait',
                    color: '#f59e0b',
                    method: 'Protocol 1: Process must request all resources before it begins execution. Protocol 2: Process can only request resources when it has none currently.',
                    problem: 'Protocol 1: resources held but unused for entire duration — low utilization. Protocol 2: requires releasing and re-acquiring resources — starvation possible.',
                    practical: 'Moderate — used in some database and batch systems.',
                  },
                  {
                    condition: 'Break No Preemption',
                    color: '#8b5cf6',
                    method: 'If a process holding resources requests one that cannot be allocated immediately: preempt all its resources. Resources added to the waiting list. Process restarts when it can get all needed resources at once.',
                    problem: 'Only works for resources whose state can be easily saved and restored (CPU registers, memory). Cannot preempt printers, tape drives.',
                    practical: 'Moderate — works for CPU scheduling and memory management.',
                  },
                  {
                    condition: 'Break Circular Wait',
                    color: '#3b82f6',
                    method: 'Impose a total ordering on all resource types. Each process must request resources in increasing order of enumeration. If a process holds resource Ri and wants Rj, it must have i less than j.',
                    problem: 'May prevent a process from acquiring resources in the order it needs them. Difficult to design a good ordering for complex systems.',
                    practical: 'HIGH — most commonly used in practice. Linux kernel uses this.',
                  },
                ].map(function(c) {
                  return (
                    <div key={c.condition} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '33', borderRadius: 10, padding: 20 }}>
                      <div style={{ fontWeight: 700, color: c.color, marginBottom: 10, fontSize: 15 }}>{c.condition}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}><strong style={{ color: 'var(--text-primary)' }}>Method:</strong> {c.method}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}><strong style={{ color: '#ef4444' }}>Problem:</strong> {c.problem}</div>
                      <div style={{ fontSize: 12, background: c.color + '11', borderRadius: 6, padding: '6px 12px', color: c.color, fontWeight: 600 }}>Practical usefulness: {c.practical}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Resource ordering example:</strong> Suppose a system has resources: network (1), file system (2), memory (3), printer (4). Any process needing network and printer must acquire network first (lower number), then printer. A process can never hold printer and then request network — preventing circular wait. This requires careful system design but adds no runtime overhead.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Two-phase locking in databases:</strong> A protocol that breaks Hold-and-Wait for database transactions. Phase 1 (Growing): acquire all needed locks. Phase 2 (Shrinking): release locks, no new ones acquired. Transactions that cannot acquire all locks in phase 1 release everything and retry. Prevents deadlock at the cost of potential starvation (a transaction may repeatedly fail to acquire all locks).
              </LearnMore>

              <NavButtons prev={function() { setActive('graph') }} prevLabel="← 8.3 RAG" next={function() { setActive('avoidance') }} nextLabel="8.5 Avoidance →" />
            </div>
          )}

          {active === 'avoidance' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.5 Deadlock Avoidance</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Dynamically ensure the system never enters an unsafe state — the Banker's Algorithm.</p>

              <InfoBox color="#f97316">
                Deadlock avoidance requires that processes declare their <strong>maximum resource needs</strong> in advance. The OS uses this information to decide whether granting a request could lead to deadlock. The key concept is <strong>safe state</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Safe State</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>
                  A state is <strong style={{ color: '#10b981' }}>safe</strong> if there exists a <strong>safe sequence</strong> — an ordering of all processes such that each process's resource needs can be satisfied using currently available resources plus resources released by previously finished processes.
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>Safe State</div>
                  <span style={{ color: 'var(--text-muted)' }}>⊃</span>
                  <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>Unsafe State</div>
                  <span style={{ color: 'var(--text-muted)' }}>⊃</span>
                  <div style={{ background: '#ef444418', border: '1px solid #ef444444', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#ef4444', fontWeight: 700 }}>Deadlocked State</div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Unsafe state does not mean deadlock will occur — just that it MIGHT. Safe state guarantees deadlock will NOT occur.</p>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The Banker's Algorithm</h3>
              <InfoBox color="#f97316">
                Named after a bank that never gives out cash in a way that could prevent it from satisfying all customers. The algorithm only grants resource requests that leave the system in a safe state.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Data Structures</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { name: 'Available[m]', color: '#10b981', desc: 'Number of available resources of each type. Available[j] = k means k instances of type Rj are available.' },
                  { name: 'Max[n][m]', color: '#3b82f6', desc: 'Maximum demand of each process. Max[i][j] = k means Pi may request at most k instances of Rj.' },
                  { name: 'Allocation[n][m]', color: '#8b5cf6', desc: 'Currently allocated resources. Allocation[i][j] = k means Pi currently holds k instances of Rj.' },
                  { name: 'Need[n][m]', color: '#f59e0b', desc: 'Remaining need. Need[i][j] = Max[i][j] - Allocation[i][j]. Resources Pi may still request.' },
                ].map(function(ds) {
                  return (
                    <div key={ds.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + ds.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: ds.color, marginBottom: 6, fontSize: 13 }}>{ds.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ds.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Safety Algorithm</h3>
              <div style={{ background: '#0d1117', border: '1px solid #f9731644', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Safety Algorithm — O(m x n^2) */</div>
                  <div>Work = Available; Finish[i] = false for all i</div>
                  <div></div>
                  <div style={{ color: '#3b82f6' }}>Find i such that:</div>
                  <div style={{ paddingLeft: 16 }}>Finish[i] == false AND</div>
                  <div style={{ paddingLeft: 16 }}>Need[i] &lt;= Work</div>
                  <div></div>
                  <div style={{ color: '#10b981' }}>If found:</div>
                  <div style={{ paddingLeft: 16 }}>Work = Work + Allocation[i]</div>
                  <div style={{ paddingLeft: 16 }}>Finish[i] = true</div>
                  <div style={{ paddingLeft: 16 }}>Go back to Find step</div>
                  <div></div>
                  <div style={{ color: '#f59e0b' }}>If all Finish[i] == true: SAFE STATE</div>
                  <div style={{ color: '#ef4444' }}>Otherwise: UNSAFE STATE</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Resource Request Algorithm:</strong> When process Pi requests resources Request[i]: (1) If Request[i] greater than Need[i] — error. (2) If Request[i] greater than Available — Pi must wait. (3) Pretend to allocate: Available -= Request[i], Allocation[i] += Request[i], Need[i] -= Request[i]. (4) Run safety algorithm. If safe — grant. If unsafe — rollback and make Pi wait.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Why Banker's Algorithm is rarely used in practice:</strong> It requires processes to declare maximum resource needs in advance — most processes don't know this. It assumes a fixed number of processes and resources — real systems have dynamic processes. It has O(m*n^2) overhead per request — too slow for systems with thousands of processes. It works well for batch systems and embedded systems with known workloads.
              </LearnMore>

              <NavButtons prev={function() { setActive('prevention') }} prevLabel="← 8.4 Prevention" next={function() { setActive('detection') }} nextLabel="8.6 Detection →" />
            </div>
          )}

          {active === 'detection' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.6 Deadlock Detection</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Allow deadlock to occur, then find and eliminate it.</p>

              <InfoBox color="#3b82f6">
                If a system uses neither prevention nor avoidance, deadlock may occur. The system must provide a <strong>detection algorithm</strong> and a <strong>recovery scheme</strong>. Detection algorithms examine the state of resource allocation to determine if deadlock exists.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Single Instance — Wait-for Graph</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                For single-instance resources, maintain a <strong style={{ color: 'var(--text-primary)' }}>wait-for graph</strong> — a simplified RAG with resource nodes removed. An edge Pi → Pj means Pi is waiting for Pj to release a resource. Deadlock exists if and only if there is a cycle.
              </p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16, marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>RAG vs Wait-for Graph:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#3b82f6', marginBottom: 6 }}>RAG:</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                      <div>P1 → R1 (requests)</div>
                      <div>R1 → P2 (assigned to)</div>
                      <div>P2 → R2 (requests)</div>
                      <div>R2 → P1 (assigned to)</div>
                    </div>
                  </div>
                  <div style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#10b981', marginBottom: 6 }}>Wait-for graph (simplified):</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                      <div>P1 → P2 (waits for)</div>
                      <div>P2 → P1 (waits for)</div>
                      <div style={{ color: '#ef4444', marginTop: 4 }}>Cycle: DEADLOCK!</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Multiple Instances — Detection Algorithm</h3>
              <InfoBox color="#8b5cf6">
                Similar to Banker's Algorithm but without the Max matrix — we only track current state, not future needs. Uses Work and Finish arrays to find processes that can complete with available resources.
              </InfoBox>
              <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Detection Algorithm */</div>
                  <div>Work = Available</div>
                  <div>Finish[i] = (Allocation[i] == 0) for all i</div>
                  <div></div>
                  <div style={{ color: '#3b82f6' }}>Find i: Finish[i]==false AND Request[i] &lt;= Work</div>
                  <div style={{ color: '#10b981' }}>If found: Work += Allocation[i]; Finish[i] = true; goto Find</div>
                  <div></div>
                  <div style={{ color: '#ef4444' }}>If Finish[i]==false for some i: Pi is DEADLOCKED</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>When to Run Detection?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Frequently (every request)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Detects deadlock immediately</li>
                    <li>Can identify which process caused it</li>
                    <li>High overhead — O(m*n^2) per request</li>
                    <li>Suitable for interactive systems</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Periodically (every hour)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Lower overhead</li>
                    <li>Deadlock may exist for a while undetected</li>
                    <li>Hard to identify which process caused it</li>
                    <li>Or: when CPU utilization drops below 40%</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Deadlock detection in real systems:</strong> MySQL InnoDB runs deadlock detection after every lock wait (when a transaction tries to acquire a lock already held). PostgreSQL uses a more expensive but thorough algorithm. Oracle Database tracks wait chains and runs detection every 3 seconds. The victim selection policy varies: MySQL picks the transaction that has done the least work (cheapest rollback).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Graph-based detection complexity:</strong> For wait-for graphs (single instance), DFS-based cycle detection runs in O(V+E) — very fast. For multiple instances, the detection algorithm runs in O(m*n^2) where m = resource types and n = processes. With n=1000 processes and m=100 resource types, that is 100 million operations — expensive if run every second.
              </LearnMore>

              <NavButtons prev={function() { setActive('avoidance') }} prevLabel="← 8.5 Avoidance" next={function() { setActive('recovery') }} nextLabel="8.7 Recovery →" />
            </div>
          )}

          {active === 'recovery' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>8.7 Recovery from Deadlock</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Two approaches: terminate processes or preempt resources.</p>

              <InfoBox color="#ef4444">
                When the detection algorithm determines deadlock exists, the system must <strong>recover</strong>. There are two main options: terminate one or more deadlocked processes, or preempt resources from deadlocked processes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Option 1: Process Termination</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Abort ALL deadlocked processes</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Definitely breaks the deadlock cycle</li>
                    <li>High cost — all partial computations lost</li>
                    <li>Simple to implement</li>
                    <li>May waste a lot of completed work</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Abort ONE process at a time</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Run detection after each abort</li>
                    <li>Less waste — stop when deadlock resolved</li>
                    <li>Higher overhead — run detection repeatedly</li>
                    <li>Need to choose victim wisely</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Victim Selection Criteria</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { criterion: 'Process priority', desc: 'Abort lowest priority process first — less important work lost.' },
                  { criterion: 'Resources used', desc: 'Abort process that has used fewest resources — less computation lost.' },
                  { criterion: 'Resources needed', desc: 'Abort process that needs most resources to complete — hardest to complete anyway.' },
                  { criterion: 'Time running', desc: 'Abort process that has run the least time — least work lost.' },
                  { criterion: 'Number of processes to abort', desc: 'Minimize the number of terminations needed to break the cycle.' },
                  { criterion: 'Interactive vs batch', desc: 'Prefer aborting batch processes over interactive ones — less user impact.' },
                ].map(function(c) {
                  return (
                    <div key={c.criterion} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 12 }}>
                      <div style={{ fontWeight: 700, color: '#f97316', fontSize: 13, minWidth: 160 }}>{c.criterion}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Option 2: Resource Preemption</h3>
              <InfoBox color="#8b5cf6">
                Preempt resources from some processes and give them to others to break the deadlock. Three issues must be addressed.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { issue: 'Selecting a victim', color: '#8b5cf6', desc: 'Which process and which resources to preempt? Minimize cost — consider resources held and time of execution.' },
                  { issue: 'Rollback', color: '#3b82f6', desc: 'Process must be rolled back to a safe state. Simplest: total rollback — restart from beginning. Or: checkpoint-based rollback.' },
                  { issue: 'Starvation', color: '#ef4444', desc: 'Same process may always be picked as victim. Must ensure a process can only be rolled back a finite number of times — include rollback count in cost factor.' },
                ].map(function(issue) {
                  return (
                    <div key={issue.issue} style={{ background: 'var(--bg-card)', border: '1px solid ' + issue.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: issue.color, marginBottom: 8, fontSize: 13 }}>{issue.issue}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{issue.desc}</p>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Checkpointing for rollback:</strong> Modern database systems use write-ahead logging (WAL) — every change is logged before being applied. To rollback, replay the log in reverse. UNDO records in the log describe how to reverse each operation. This allows precise rollback to any previous consistent state without losing all work.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Combined approach in practice:</strong> Most systems use a combination. Databases: detection + process termination (rollback cheapest transaction). Operating systems: mostly ignore deadlock, or detection + process termination (kill hanging process). Real-time systems: prevention through careful design (resource ordering, no hold-and-wait). The right approach depends on the cost of deadlock vs the cost of prevention.
              </LearnMore>

              <NavButtons prev={function() { setActive('detection') }} prevLabel="← 8.6 Detection" next={function() { setActive('simulator') }} nextLabel="Banker's Simulator →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Deadlock Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for understanding deadlock concepts.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Resource Allocation Graph</h3>
              <RAGVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Banker's Algorithm</h3>
              <BankersAlgorithm />

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>How to trace through manually:</h4>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <div>Step 1: Work = [3,3,2]. Check each process: can Need[i] &lt;= Work?</div>
                  <div>Step 2: P1 needs [1,2,2] &lt;= [3,3,2] ✓ → P1 runs. Work = [3,3,2]+[2,0,0] = [5,3,2]</div>
                  <div>Step 3: P3 needs [0,1,0] &lt;= [5,3,2] ✓ → P3 runs. Work = [5,3,2]+[3,0,2] = [8,3,4]</div>
                  <div>Step 4: P4 needs [1,1,0] &lt;= [8,3,4] ✓ → P4 runs. Work = [8,3,4]+[2,1,1] = [10,4,5]</div>
                  <div>Step 5: P0 needs [7,4,3] &lt;= [10,4,5] ✓ → P0 runs. Work = [10,4,5]+[0,1,0] = [10,5,5]</div>
                  <div>Step 6: P2 needs [6,0,0] &lt;= [10,5,5] ✓ → P2 runs.</div>
                  <div style={{ color: '#10b981', fontWeight: 700 }}>Safe sequence: P1 → P3 → P4 → P0 → P2</div>
                </div>
              </div>

              <NavButtons prev={function() { setActive('recovery') }} prevLabel="← 8.7 Recovery" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Deadlocks in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore deadlock concepts through code and the terminal.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f97316' }}>Lab 1 — Python Deadlock Demo</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Python's threading module can demonstrate deadlock. Two threads acquire locks in opposite order — classic circular wait.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Banker's Algorithm in Python</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Implement the Banker's Algorithm safety check in Python.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#10b981' }}>Lab 3 — Explore in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['cat /proc/locks',             'Show all file locks in the system'],
                  ['lsof | grep POSIX',           'Show POSIX locks held by processes'],
                  ['ps aux | grep D',             'Find processes in uninterruptible sleep (waiting for I/O)'],
                  ['dmesg | grep -i deadlock',    'Check kernel log for deadlock messages'],
                  ['cat /proc/1/wchan',           'Show what process 1 is waiting for'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', minWidth: 200, flexShrink: 0 }}>{item[0]}</code>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item[1]}</span>
                    </div>
                  )
                })}
              </div>
              <Terminal />

              <NavButtons prev={function() { setActive('simulator') }} prevLabel="← Simulator" next={function() { setActive('quiz') }} nextLabel="Take the Quiz →" />
            </div>
          )}

          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 8.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#f97316' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#f97316', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, lineHeight: 1.5 }}>{QUIZ[quiz.current].q}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      {QUIZ[quiz.current].options.map(function(opt, i) {
                        let bg = 'var(--bg-secondary)', border = 'var(--border)', color = 'var(--text-primary)'
                        if (quiz.answered) {
                          if (i === QUIZ[quiz.current].answer) { bg = '#10b98118'; border = '#10b981'; color = '#10b981' }
                          else if (i === quiz.selected && i !== QUIZ[quiz.current].answer) { bg = '#ef444418'; border = '#ef4444'; color = '#ef4444' }
                        }
                        return (
                          <div key={i} onClick={function() { handleAnswer(i) }} style={{ padding: '14px 20px', borderRadius: 10, cursor: quiz.answered ? 'default' : 'pointer', background: bg, border: '1px solid ' + border, color: color, fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}>
                            {['A', 'B', 'C', 'D'][i]}. {opt}
                          </div>
                        )
                      })}
                    </div>
                    {quiz.answered && (
                      <div>
                        <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          Explanation: {QUIZ[quiz.current].explanation}
                        </div>
                        <button onClick={nextQuestion} style={{ background: '#f97316', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                          {quiz.current + 1 >= QUIZ.length ? 'See Results' : 'Next Question →'}
                        </button>
                      </div>
                    )}
                  </div>
                )
                : (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>{quiz.score === 6 ? '🏆' : quiz.score >= 4 ? '👍' : '📚'}</div>
                    <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>You scored {quiz.score} / {QUIZ.length}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 8!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/9' }} style={{ background: '#f97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 9 →</button>
                    </div>
                  </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}