import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'concepts',   title: '5.1 Basic Concepts',        icon: '💡' },
  { id: 'criteria',   title: '5.2 Scheduling Criteria',   icon: '📊' },
  { id: 'fcfs',       title: '5.3 FCFS',                  icon: '1️⃣' },
  { id: 'sjf',        title: '5.4 SJF & SRTF',            icon: '⚡' },
  { id: 'rr',         title: '5.5 Round Robin',           icon: '🔄' },
  { id: 'priority',   title: '5.6 Priority Scheduling',   icon: '⭐' },
  { id: 'multilevel', title: '5.7 Multilevel Queue',      icon: '📚' },
  { id: 'realtime',   title: '5.8 Real-Time Scheduling',  icon: '⏱️' },
  { id: 'os',         title: '5.9 OS Examples',           icon: '🖥️' },
  { id: 'simulator',  title: '🎮 Scheduler Simulator',    icon: '🎮' },
  { id: 'lab',        title: '💻 Lab',                    icon: '💻' },
  { id: 'quiz',       title: '🧠 Quiz',                   icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the convoy effect in FCFS scheduling?',
    options: [
      'Short processes get priority over long ones',
      'Short processes get stuck waiting behind one long CPU-bound process',
      'All processes arrive at the same time',
      'The CPU is always busy'
    ],
    answer: 1,
    explanation: 'The convoy effect occurs when short processes pile up behind one long CPU-bound process. All the short I/O-bound processes wait while the long process runs, leaving I/O devices idle.'
  },
  {
    q: 'Which scheduling algorithm gives the minimum average waiting time?',
    options: ['FCFS', 'Round Robin', 'SJF (non-preemptive)', 'Priority Scheduling'],
    answer: 2,
    explanation: 'SJF is provably optimal — it gives the minimum average waiting time for a given set of processes. By always running the shortest job next, it minimizes the time other jobs wait.'
  },
  {
    q: 'In Round Robin with a very large time quantum, it behaves like:',
    options: ['SJF', 'FCFS', 'Priority Scheduling', 'SRTF'],
    answer: 1,
    explanation: 'With a very large time quantum, each process runs to completion before the next one starts — exactly like FCFS. With a very small quantum, overhead from context switching becomes too high.'
  },
  {
    q: 'What is aging in priority scheduling?',
    options: [
      'Reducing priority of old processes',
      'Gradually increasing the priority of waiting processes to prevent starvation',
      'Removing old processes from the queue',
      'Increasing burst time estimates over time'
    ],
    answer: 1,
    explanation: 'Aging solves starvation by gradually increasing the priority of processes that have been waiting for a long time. Eventually even the lowest priority process will have high enough priority to run.'
  },
  {
    q: 'What does the Linux CFS (Completely Fair Scheduler) use to decide which process to run next?',
    options: [
      'Process priority only',
      'Arrival time (FCFS)',
      'Virtual runtime — the process with the lowest vruntime runs next',
      'Burst time estimate'
    ],
    answer: 2,
    explanation: 'CFS tracks virtual runtime (vruntime) for each process. The process with the lowest vruntime gets the CPU next. This ensures each process gets a fair share of CPU time proportional to its priority.'
  },
  {
    q: 'What is the key difference between preemptive and non-preemptive scheduling?',
    options: [
      'Preemptive scheduling is faster',
      'In preemptive scheduling, the OS can forcibly take the CPU from a running process; in non-preemptive it cannot',
      'Non-preemptive scheduling uses priorities',
      'Preemptive scheduling only works on multicore systems'
    ],
    answer: 1,
    explanation: 'In non-preemptive scheduling, once a process gets the CPU it keeps it until it voluntarily gives it up (I/O or exit). In preemptive scheduling, the OS can interrupt a running process and assign the CPU to another process.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #f59e0b55', color: '#f59e0b', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid #f59e0b33', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

// ── Gantt Chart Component ──────────────────────────────────────
function GanttChart({ schedule, totalTime }) {
  const COLORS = {
    P1: '#3b82f6', P2: '#10b981', P3: '#8b5cf6',
    P4: '#f59e0b', P5: '#ef4444', idle: '#374151'
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', marginBottom: 4 }}>
        {schedule.map(function(block, i) {
          const width = ((block.end - block.start) / totalTime) * 100
          return (
            <div key={i} style={{
              width: width + '%',
              background: COLORS[block.process] || '#6b7280',
              padding: '8px 4px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
              borderRight: '1px solid rgba(0,0,0,0.2)',
              minWidth: 20,
              overflow: 'hidden',
            }}>
              {block.process}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', position: 'relative', height: 20 }}>
        {schedule.map(function(block, i) {
          const left = (block.start / totalTime) * 100
          return (
            <div key={i} style={{
              position: 'absolute',
              left: left + '%',
              fontSize: 11,
              color: 'var(--text-muted)',
              transform: 'translateX(-50%)',
            }}>
              {block.start}
            </div>
          )
        })}
        <div style={{
          position: 'absolute',
          right: 0,
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          {totalTime}
        </div>
      </div>
    </div>
  )
}

// ── Scheduler Simulator ────────────────────────────────────────
function SchedulerSimulator() {
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [quantum, setQuantum] = useState(4)
  const [processes, setProcesses] = useState([
    { id: 'P1', arrival: 0, burst: 10, priority: 3 },
    { id: 'P2', arrival: 1, burst: 4,  priority: 1 },
    { id: 'P3', arrival: 2, burst: 9,  priority: 4 },
    { id: 'P4', arrival: 3, burst: 5,  priority: 2 },
    { id: 'P5', arrival: 4, burst: 3,  priority: 5 },
  ])
  const [results, setResults] = useState(null)

  function addProcess() {
    if (processes.length >= 8) return
    const id = 'P' + (processes.length + 1)
    setProcesses(function(prev) {
      return [...prev, { id, arrival: 0, burst: 5, priority: 3 }]
    })
    setResults(null)
  }

  function removeProcess(idx) {
    if (processes.length <= 2) return
    setProcesses(function(prev) {
      return prev.filter(function(_, i) { return i !== idx })
    })
    setResults(null)
  }

  function updateProcess(idx, field, val) {
    setProcesses(function(prev) {
      return prev.map(function(p, i) {
        if (i !== idx) return p
        return { ...p, [field]: parseInt(val) || 0 }
      })
    })
    setResults(null)
  }

  function runFCFS(procs) {
    const sorted = [...procs].sort(function(a, b) { return a.arrival - b.arrival })
    const schedule = []
    let time = 0
    const stats = []
    sorted.forEach(function(p) {
      if (time < p.arrival) {
        schedule.push({ process: 'idle', start: time, end: p.arrival })
        time = p.arrival
      }
      const start = time
      time += p.burst
      schedule.push({ process: p.id, start, end: time })
      stats.push({ id: p.id, arrival: p.arrival, burst: p.burst, start, finish: time, waiting: start - p.arrival, turnaround: time - p.arrival })
    })
    return { schedule, stats, totalTime: time }
  }

  function runSJF(procs) {
    const ps = procs.map(function(p) { return { ...p, remaining: p.burst, done: false } })
    const schedule = []
    const stats = []
    let time = 0
    const totalBurst = ps.reduce(function(s, p) { return s + p.burst }, 0)
    const maxTime = totalBurst + Math.max(...ps.map(function(p) { return p.arrival })) + 5
    let completed = 0

    while (completed < ps.length && time < maxTime) {
      const available = ps.filter(function(p) { return !p.done && p.arrival <= time })
      if (available.length === 0) {
        const nextArrival = Math.min(...ps.filter(function(p) { return !p.done }).map(function(p) { return p.arrival }))
        schedule.push({ process: 'idle', start: time, end: nextArrival })
        time = nextArrival
        continue
      }
      const shortest = available.reduce(function(a, b) { return a.burst < b.burst ? a : b })
      const start = time
      time += shortest.burst
      shortest.done = true
      completed++
      schedule.push({ process: shortest.id, start, end: time })
      stats.push({ id: shortest.id, arrival: shortest.arrival, burst: shortest.burst, start, finish: time, waiting: start - shortest.arrival, turnaround: time - shortest.arrival })
    }
    return { schedule, stats, totalTime: time }
  }

  function runSRTF(procs) {
    const ps = procs.map(function(p) { return { ...p, remaining: p.burst, done: false, startTime: -1 } })
    const schedule = []
    const stats = []
    let time = 0
    const totalBurst = ps.reduce(function(s, p) { return s + p.burst }, 0)
    let completed = 0
    let lastProcess = null

    while (completed < ps.length) {
      const available = ps.filter(function(p) { return !p.done && p.arrival <= time })
      if (available.length === 0) {
        const next = Math.min(...ps.filter(function(p) { return !p.done }).map(function(p) { return p.arrival }))
        if (lastProcess !== 'idle') schedule.push({ process: 'idle', start: time, end: next })
        else if (schedule.length > 0) schedule[schedule.length - 1].end = next
        time = next
        lastProcess = 'idle'
        continue
      }
      const shortest = available.reduce(function(a, b) { return a.remaining < b.remaining ? a : b })
      if (shortest.startTime === -1) shortest.startTime = time
      if (lastProcess !== shortest.id) {
        schedule.push({ process: shortest.id, start: time, end: time + 1 })
        lastProcess = shortest.id
      } else if (schedule.length > 0) {
        schedule[schedule.length - 1].end = time + 1
      }
      shortest.remaining--
      time++
      if (shortest.remaining === 0) {
        shortest.done = true
        completed++
        stats.push({ id: shortest.id, arrival: shortest.arrival, burst: shortest.burst, start: shortest.startTime, finish: time, waiting: time - shortest.arrival - shortest.burst, turnaround: time - shortest.arrival })
      }
    }
    return { schedule, stats, totalTime: time }
  }

  function runRR(procs, q) {
    const ps = procs.map(function(p) { return { ...p, remaining: p.burst, done: false } })
    const queue = []
    const schedule = []
    const stats = []
    let time = 0
    let completed = 0
    const arrived = new Set()

    ps.sort(function(a, b) { return a.arrival - b.arrival })

    function enqueueArrivals() {
      ps.forEach(function(p) {
        if (!p.done && p.arrival <= time && !arrived.has(p.id)) {
          queue.push(p)
          arrived.add(p.id)
        }
      })
    }

    enqueueArrivals()
    const maxIter = ps.reduce(function(s, p) { return s + p.burst }, 0) + 50

    let iter = 0
    while (completed < ps.length && iter < maxIter) {
      iter++
      if (queue.length === 0) {
        const next = ps.filter(function(p) { return !p.done }).map(function(p) { return p.arrival })
        if (next.length === 0) break
        const nextTime = Math.min(...next)
        schedule.push({ process: 'idle', start: time, end: nextTime })
        time = nextTime
        enqueueArrivals()
        continue
      }

      const p = queue.shift()
      const runTime = Math.min(q, p.remaining)
      const start = time
      time += runTime
      p.remaining -= runTime
      schedule.push({ process: p.id, start, end: time })
      enqueueArrivals()

      if (p.remaining === 0) {
        p.done = true
        completed++
        stats.push({ id: p.id, arrival: p.arrival, burst: p.burst, start: start - (p.burst - runTime), finish: time, waiting: time - p.arrival - p.burst, turnaround: time - p.arrival })
      } else {
        queue.push(p)
      }
    }
    return { schedule, stats, totalTime: time }
  }

  function runPriority(procs) {
    const ps = procs.map(function(p) { return { ...p, remaining: p.burst, done: false } })
    const schedule = []
    const stats = []
    let time = 0
    let completed = 0
    const maxTime = ps.reduce(function(s, p) { return s + p.burst }, 0) + 20

    while (completed < ps.length && time < maxTime) {
      const available = ps.filter(function(p) { return !p.done && p.arrival <= time })
      if (available.length === 0) {
        const next = Math.min(...ps.filter(function(p) { return !p.done }).map(function(p) { return p.arrival }))
        schedule.push({ process: 'idle', start: time, end: next })
        time = next
        continue
      }
      const highest = available.reduce(function(a, b) { return a.priority < b.priority ? a : b })
      const start = time
      time += highest.burst
      highest.done = true
      completed++
      schedule.push({ process: highest.id, start, end: time })
      stats.push({ id: highest.id, arrival: highest.arrival, burst: highest.burst, start, finish: time, waiting: start - highest.arrival, turnaround: time - highest.arrival })
    }
    return { schedule, stats, totalTime: time }
  }

  function calculate() {
    let result
    if (algorithm === 'fcfs')     result = runFCFS(processes)
    else if (algorithm === 'sjf') result = runSJF(processes)
    else if (algorithm === 'srtf') result = runSRTF(processes)
    else if (algorithm === 'rr')  result = runRR(processes, quantum)
    else if (algorithm === 'priority') result = runPriority(processes)
    else result = runFCFS(processes)
    setResults(result)
  }

  const avgWaiting    = results ? (results.stats.reduce(function(s, p) { return s + p.waiting }, 0) / results.stats.length).toFixed(2) : null
  const avgTurnaround = results ? (results.stats.reduce(function(s, p) { return s + p.turnaround }, 0) / results.stats.length).toFixed(2) : null

  const ALGO_COLORS = {
    P1: '#3b82f6', P2: '#10b981', P3: '#8b5cf6',
    P4: '#f59e0b', P5: '#ef4444', P6: '#06b6d4',
    P7: '#f97316', P8: '#84cc16', idle: '#374151'
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>CPU Scheduling Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Add processes, choose an algorithm, and see the Gantt chart</p>

      {/* Algorithm selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'fcfs',     label: 'FCFS' },
          { key: 'sjf',      label: 'SJF' },
          { key: 'srtf',     label: 'SRTF (Preemptive SJF)' },
          { key: 'rr',       label: 'Round Robin' },
          { key: 'priority', label: 'Priority' },
        ].map(function(a) {
          return (
            <button key={a.key} onClick={function() { setAlgorithm(a.key); setResults(null) }} style={{ background: algorithm === a.key ? '#f59e0b33' : 'var(--bg-secondary)', color: algorithm === a.key ? '#f59e0b' : 'var(--text-secondary)', border: '1px solid ' + (algorithm === a.key ? '#f59e0b' : 'var(--border)'), padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: algorithm === a.key ? 700 : 400 }}>
              {a.label}
            </button>
          )
        })}
      </div>

      {/* RR quantum */}
      {algorithm === 'rr' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Time Quantum:</span>
          <input type="range" min="1" max="10" value={quantum} onChange={function(e) { setQuantum(parseInt(e.target.value)); setResults(null) }} style={{ accentColor: '#f59e0b', cursor: 'pointer' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', minWidth: 20 }}>{quantum}</span>
        </div>
      )}

      {/* Process table */}
      <div style={{ marginBottom: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Process', 'Arrival Time', 'Burst Time', algorithm === 'priority' ? 'Priority (lower=higher)' : '', 'Remove'].filter(Boolean).map(function(h) {
                return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {processes.map(function(p, i) {
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ background: (ALGO_COLORS[p.id] || '#6b7280') + '33', color: ALGO_COLORS[p.id] || '#6b7280', padding: '2px 10px', borderRadius: 12, fontWeight: 700, fontSize: 12 }}>{p.id}</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input type="number" min="0" max="20" value={p.arrival} onChange={function(e) { updateProcess(i, 'arrival', e.target.value) }} style={{ width: 60, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 13 }} />
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input type="number" min="1" max="20" value={p.burst} onChange={function(e) { updateProcess(i, 'burst', e.target.value) }} style={{ width: 60, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 13 }} />
                  </td>
                  {algorithm === 'priority' && (
                    <td style={{ padding: '8px 12px' }}>
                      <input type="number" min="1" max="10" value={p.priority} onChange={function(e) { updateProcess(i, 'priority', e.target.value) }} style={{ width: 60, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 13 }} />
                    </td>
                  )}
                  <td style={{ padding: '8px 12px' }}>
                    <button onClick={function() { removeProcess(i) }} style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={addProcess} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add Process</button>
        <button onClick={calculate} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>▶ Run Scheduler</button>
      </div>

      {/* Results */}
      {results && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Gantt Chart:</div>
          <GanttChart schedule={results.schedule} totalTime={results.totalTime} />

          <div style={{ marginTop: 20, fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Process Statistics:</div>
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  {['Process', 'Arrival', 'Burst', 'Start', 'Finish', 'Waiting', 'Turnaround'].map(function(h) {
                    return <th key={h} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {results.stats.sort(function(a, b) { return a.id.localeCompare(b.id) }).map(function(p) {
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{ background: (ALGO_COLORS[p.id] || '#6b7280') + '33', color: ALGO_COLORS[p.id] || '#6b7280', padding: '2px 10px', borderRadius: 12, fontWeight: 700, fontSize: 12 }}>{p.id}</span>
                      </td>
                      {[p.arrival, p.burst, p.start, p.finish].map(function(v, i) {
                        return <td key={i} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                      })}
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>{p.waiting}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>{p.turnaround}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{avgWaiting}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Waiting Time</div>
            </div>
            <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{avgTurnaround}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Turnaround Time</div>
            </div>
            <div style={{ background: '#3b82f618', border: '1px solid #3b82f644', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{results.totalTime}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Chapter5() {
  const [active, setActive] = useState('concepts')
  const [quiz, setQuiz] = useState({ current: 0, selected: null, answered: false, score: 0, done: false })

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

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #f59e0b44', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 5</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>📊</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>CPU Scheduling</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How the OS decides which process gets the CPU and when — with a full interactive scheduler simulator covering all major algorithms.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Interactive Gantt Charts', 'FCFS', 'SJF', 'Round Robin', 'Priority', 'Linux CFS'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b33', color: '#f59e0b', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#f59e0b' : 'var(--text-secondary)', background: active === s.id ? 'rgba(245,158,11,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #f59e0b' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {/* 5.1 Basic Concepts */}
          {active === 'concepts' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.1 Basic Concepts</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Why CPU scheduling exists and how the CPU burst cycle drives it.</p>

              <InfoBox color="#f59e0b">
                The objective of multiprogramming is to have some process running at all times — to maximize CPU utilization. The <strong>CPU scheduler</strong> selects from among the processes in the Ready queue and allocates a CPU core to one of them.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>CPU-I/O Burst Cycle</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Process execution consists of a cycle of <strong style={{ color: '#f59e0b' }}>CPU execution</strong> and <strong style={{ color: '#3b82f6' }}>I/O wait</strong>. A process runs on the CPU (CPU burst), then waits for I/O (I/O burst), then runs again. This pattern repeats until termination.
              </p>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                {['CPU burst', 'I/O wait', 'CPU burst', 'I/O wait', 'CPU burst', '...', 'exit'].map(function(s, i) {
                  const isCPU = s === 'CPU burst'
                  const isIO  = s === 'I/O wait'
                  return (
                    <div key={i} style={{ background: isCPU ? '#f59e0b33' : isIO ? '#3b82f633' : 'var(--bg-card)', border: '1px solid ' + (isCPU ? '#f59e0b' : isIO ? '#3b82f6' : 'var(--border)'), color: isCPU ? '#f59e0b' : isIO ? '#3b82f6' : 'var(--text-muted)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600 }}>
                      {s}
                    </div>
                  )
                })}
              </div>

              <InfoBox color="#3b82f6">
                Process execution has a <strong>large number of short CPU bursts</strong> and a small number of longer ones. This distribution is important — it means the CPU is frequently available for other processes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>When Does Scheduling Happen?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { n: 1, event: 'Running → Waiting', type: 'Non-preemptive', color: '#10b981', desc: 'Process requests I/O or calls wait(). Process voluntarily gives up CPU.' },
                  { n: 2, event: 'Running → Ready', type: 'Preemptive', color: '#ef4444', desc: 'Timer interrupt fires. OS forcibly takes CPU from the running process.' },
                  { n: 3, event: 'Waiting → Ready', type: 'Preemptive', color: '#ef4444', desc: 'I/O completes. A newly ready process might preempt the current one.' },
                  { n: 4, event: 'Process terminates', type: 'Non-preemptive', color: '#10b981', desc: 'Process calls exit(). CPU becomes free — must choose next process.' },
                ].map(function(e) {
                  return (
                    <div key={e.n} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', alignItems: 'center' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{e.n}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{e.event}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.desc}</div>
                      </div>
                      <span style={{ background: e.color + '22', color: e.color, border: '1px solid ' + e.color + '44', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{e.type}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>The Dispatcher</h3>
              <InfoBox color="#8b5cf6">
                The <strong>dispatcher</strong> is the module that gives control of the CPU to the process selected by the scheduler. It handles: context switching, switching to user mode, and jumping to the right location in the program to restart it. <strong>Dispatch latency</strong> is the time to stop one process and start another — it should be minimized.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Preemptive vs Non-preemptive:</strong> Non-preemptive (cooperative) scheduling was used by Windows 3.1 and early Mac OS. Processes ran until they voluntarily gave up the CPU. One buggy or malicious process could freeze the entire system. Modern OSes use preemptive scheduling — the OS can always take back the CPU via a timer interrupt, ensuring fairness and responsiveness.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>CPU bound vs I/O bound processes:</strong> A CPU-bound process does mostly computation — long CPU bursts, rare I/O (e.g., video encoding, scientific simulation). An I/O-bound process does mostly I/O — short CPU bursts, frequent I/O waits (e.g., web server, database). Good scheduling must balance both types to keep the CPU and I/O devices busy simultaneously.
              </LearnMore>

              <NavButtons next={function() { setActive('criteria') }} nextLabel="5.2 Scheduling Criteria →" />
            </div>
          )}

          {/* 5.2 Criteria */}
          {active === 'criteria' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.2 Scheduling Criteria</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How we measure whether a scheduling algorithm is good or bad.</p>

              <InfoBox color="#3b82f6">
                Different scheduling algorithms have different properties. The choice of algorithm depends on which criteria matter most for the workload. There are often trade-offs — optimizing one metric may worsen another.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { metric: 'CPU Utilization', goal: 'MAXIMIZE', color: '#10b981', desc: 'Keep the CPU as busy as possible. In practice, ranges from 40% (lightly loaded) to 90% (heavily loaded). Idle CPU = wasted money.' },
                  { metric: 'Throughput', goal: 'MAXIMIZE', color: '#10b981', desc: 'Number of processes that complete execution per time unit. Higher is better. Measured in processes per second or per hour.' },
                  { metric: 'Turnaround Time', goal: 'MINIMIZE', color: '#ef4444', desc: 'Total time from process submission to completion. Includes waiting in Ready queue + executing + doing I/O. Turnaround = Finish time - Arrival time.' },
                  { metric: 'Waiting Time', goal: 'MINIMIZE', color: '#ef4444', desc: 'Total time a process spends waiting in the Ready queue. The scheduler only affects waiting time — not execution or I/O time. Waiting = Start time - Arrival time (for simple cases).' },
                  { metric: 'Response Time', goal: 'MINIMIZE', color: '#f59e0b', desc: 'Time from request submission until the FIRST response is produced. Important for interactive systems. A process may still be running when it gives its first response.' },
                ].map(function(m) {
                  return (
                    <div key={m.metric} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 100 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginBottom: 4 }}>{m.metric}</div>
                        <span style={{ background: m.color + '22', color: m.color, border: '1px solid ' + m.color + '44', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{m.goal}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{m.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Key Formulas</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e6edf3', lineHeight: 2 }}>
                  <div><span style={{ color: '#f59e0b' }}>Turnaround time</span>  = Finish time - Arrival time</div>
                  <div><span style={{ color: '#3b82f6' }}>Waiting time</span>     = Turnaround time - Burst time</div>
                  <div><span style={{ color: '#10b981' }}>Response time</span>    = First CPU time - Arrival time</div>
                  <div><span style={{ color: '#8b5cf6' }}>CPU Utilization</span>  = (Busy time / Total time) x 100%</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why minimize waiting time specifically?</strong> The scheduling algorithm only controls how long processes wait in the Ready queue — it cannot control I/O time or actual execution time. So waiting time is the direct measure of scheduling quality. Minimizing average waiting time is equivalent to maximizing CPU utilization in most analyses.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Response time for interactive systems:</strong> For time-sharing systems, minimizing response time is more important than minimizing average turnaround. A user typing commands expects immediate feedback — even if the total job takes longer. This is why desktop OSes use short time quanta (4-15ms) rather than FCFS.
              </LearnMore>

              <NavButtons prev={function() { setActive('concepts') }} prevLabel="← 5.1 Concepts" next={function() { setActive('fcfs') }} nextLabel="5.3 FCFS →" />
            </div>
          )}

          {/* 5.3 FCFS */}
          {active === 'fcfs' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.3 First-Come, First-Served (FCFS)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The simplest scheduling algorithm — processes run in the order they arrive.</p>

              <InfoBox color="#3b82f6">
                FCFS is the simplest CPU scheduling algorithm. The process that requests the CPU first is allocated the CPU first. Implemented with a FIFO queue. <strong>Non-preemptive</strong> — once a process gets the CPU, it keeps it until it finishes or requests I/O.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Example — Arrival order P1, P2, P3</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Process', 'Burst Time'].map(function(h) {
                        return <th key={h} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[['P1', 24], ['P2', 3], ['P3', 3]].map(function(r) {
                      return (
                        <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          {r.map(function(v, i) {
                            return <td key={i} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Gantt Chart (P1 arrives first):</div>
                <GanttChart
                  schedule={[{ process: 'P1', start: 0, end: 24 }, { process: 'P2', start: 24, end: 27 }, { process: 'P3', start: 27, end: 30 }]}
                  totalTime={30}
                />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Waiting time: P1=0, P2=24, P3=27
                  <br />
                  <strong style={{ color: '#ef4444' }}>Average waiting time = (0+24+27)/3 = 17ms</strong>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Better order — P2, P3, P1</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Gantt Chart (P2 arrives first):</div>
                <GanttChart
                  schedule={[{ process: 'P2', start: 0, end: 3 }, { process: 'P3', start: 3, end: 6 }, { process: 'P1', start: 6, end: 30 }]}
                  totalTime={30}
                />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Waiting time: P1=6, P2=0, P3=3
                  <br />
                  <strong style={{ color: '#10b981' }}>Average waiting time = (6+0+3)/3 = 3ms — much better!</strong>
                </div>
              </div>

              <InfoBox color="#ef4444">
                <strong>Convoy Effect:</strong> Short processes get stuck waiting behind one long CPU-bound process. Consider one CPU-bound process (burst=100) and many I/O-bound processes (burst=1). The I/O-bound processes all wait behind the CPU-bound one — leaving I/O devices idle during that time. Very inefficient.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why FCFS is still used:</strong> FCFS is used in batch systems where arrival order is the natural fairness criterion. It's also used as a secondary criterion — when multiple processes have the same priority, FCFS breaks the tie. And it's the basis of most queue data structures in OS internals.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>FCFS and I/O device utilization:</strong> In the convoy example, while P1 (CPU-bound) runs for 100ms, all I/O-bound processes wait. Their I/O devices sit idle. After P1 finishes, all I/O-bound processes run quickly (1ms each) then go back to I/O. Then P1 runs again. The I/O devices alternate between idle and very busy — poor overall system utilization.
              </LearnMore>

              <NavButtons prev={function() { setActive('criteria') }} prevLabel="← 5.2 Criteria" next={function() { setActive('sjf') }} nextLabel="5.4 SJF →" />
            </div>
          )}

          {/* 5.4 SJF */}
          {active === 'sjf' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.4 SJF and SRTF</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Shortest Job First — the optimal algorithm, and its preemptive version.</p>

              <InfoBox color="#10b981">
                <strong>SJF</strong> associates each process with its next CPU burst length. When the CPU is free, it assigns the CPU to the process with the <strong>shortest next CPU burst</strong>. SJF is <strong>provably optimal</strong> — it gives the minimum average waiting time for a given set of processes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>SJF Example</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Process', 'Arrival', 'Burst'].map(function(h) {
                        return <th key={h} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[['P1', '0.0', 6], ['P2', '2.0', 8], ['P3', '4.0', 7], ['P4', '5.0', 3]].map(function(r) {
                      return (
                        <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          {r.map(function(v, i) {
                            return <td key={i} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Gantt Chart:</div>
                <GanttChart
                  schedule={[
                    { process: 'P1', start: 0, end: 6 },
                    { process: 'P4', start: 6, end: 9 },
                    { process: 'P3', start: 9, end: 16 },
                    { process: 'P2', start: 16, end: 24 },
                  ]}
                  totalTime={24}
                />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Average waiting time = (3 + 16 + 9 + 0) / 4 = <strong style={{ color: '#10b981' }}>7ms</strong>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Predicting the Next CPU Burst</h3>
              <InfoBox color="#8b5cf6">
                The main difficulty with SJF is knowing the length of the next CPU request. We can only <strong>estimate</strong> it using the length of previous CPU bursts via <strong>exponential averaging</strong>:
                <br /><br />
                <strong>τ(n+1) = α × t(n) + (1-α) × τ(n)</strong>
                <br />
                Where t(n) = actual last burst, τ(n) = predicted last burst, α = weight (commonly 0.5)
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>SRTF — Preemptive SJF</h3>
              <InfoBox color="#ef4444">
                <strong>Shortest Remaining Time First (SRTF)</strong> is the preemptive version of SJF. If a new process arrives with a CPU burst length shorter than the remaining time of the current process, preempt the current process. Also called <strong>Shortest-Remaining-Time-First</strong>.
              </InfoBox>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Process', 'Arrival', 'Burst'].map(function(h) {
                        return <th key={h} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[['P1', 0, 8], ['P2', 1, 4], ['P3', 2, 9], ['P4', 3, 5]].map(function(r) {
                      return (
                        <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          {r.map(function(v, i) {
                            return <td key={i} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>SRTF Gantt Chart (preemptive):</div>
                <GanttChart
                  schedule={[
                    { process: 'P1', start: 0,  end: 1  },
                    { process: 'P2', start: 1,  end: 5  },
                    { process: 'P4', start: 5,  end: 10 },
                    { process: 'P1', start: 10, end: 17 },
                    { process: 'P3', start: 17, end: 26 },
                  ]}
                  totalTime={26}
                />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Average waiting time = [(10-1)+(1-1)+(17-2)+(5-3)] / 4 = <strong style={{ color: '#ef4444' }}>6.5ms</strong>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why SJF is optimal but not always used:</strong> SJF minimizes average waiting time — provably. But it requires knowing the future (next CPU burst length). In practice, we estimate using exponential averaging. Also, SJF can cause starvation — a long process may wait indefinitely if short processes keep arriving. Aging fixes this.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Exponential averaging explained:</strong> With α=0.5, τ(n+1) = 0.5×t(n) + 0.5×τ(n). Each successive term has less weight: recent burst counts 50%, previous prediction 25% of actual, 12.5% before that, etc. If α=0, recent history doesn't matter (τ stays constant). If α=1, only the most recent burst matters.
              </LearnMore>

              <NavButtons prev={function() { setActive('fcfs') }} prevLabel="← 5.3 FCFS" next={function() { setActive('rr') }} nextLabel="5.5 Round Robin →" />
            </div>
          )}

          {/* 5.5 Round Robin */}
          {active === 'rr' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.5 Round Robin (RR)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The most widely used algorithm — time sharing made real.</p>

              <InfoBox color="#f59e0b">
                Each process gets a small unit of CPU time called a <strong>time quantum (q)</strong>, usually 10-100ms. After the quantum expires, the process is preempted and added to the end of the ready queue. Designed specifically for time-sharing systems.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>How Round Robin Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, text: 'n processes in ready queue, time quantum = q' },
                  { n: 2, text: 'Each process gets 1/n of CPU time in chunks of at most q units' },
                  { n: 3, text: 'No process waits more than (n-1) × q time units' },
                  { n: 4, text: 'Timer interrupts every quantum to force context switch' },
                  { n: 5, text: 'If process finishes before quantum expires, CPU given to next process immediately' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>RR Example with q=4</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Process', 'Burst Time'].map(function(h) {
                        return <th key={h} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[['P1', 24], ['P2', 3], ['P3', 3]].map(function(r) {
                      return (
                        <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          {r.map(function(v, i) {
                            return <td key={i} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Gantt Chart (q=4):</div>
                <GanttChart
                  schedule={[
                    { process: 'P1', start: 0,  end: 4 },
                    { process: 'P2', start: 4,  end: 7 },
                    { process: 'P3', start: 7,  end: 10 },
                    { process: 'P1', start: 10, end: 14 },
                    { process: 'P1', start: 14, end: 18 },
                    { process: 'P1', start: 18, end: 22 },
                    { process: 'P1', start: 22, end: 26 },
                    { process: 'P1', start: 26, end: 30 },
                  ]}
                  totalTime={30}
                />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Waiting: P1=6, P2=4, P3=7. Average = <strong style={{ color: '#f59e0b' }}>5.67ms</strong>
                  <br />
                  Typically higher average turnaround than SJF, but <strong style={{ color: '#10b981' }}>better response time</strong>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Time Quantum Trade-off</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>q too small</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Many context switches</li>
                    <li>High overhead from switching</li>
                    <li>CPU spends too much time switching</li>
                    <li>System feels slower despite responsiveness</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>q too large</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Degenerates into FCFS</li>
                    <li>Poor response time for short processes</li>
                    <li>Interactive feel is lost</li>
                    <li>Long processes monopolize CPU</li>
                  </ul>
                </div>
              </div>

              <InfoBox color="#10b981">
                Rule of thumb: <strong>80% of CPU bursts should be shorter than the time quantum</strong>. In practice: Linux uses ~4ms on desktops, ~100ms on servers. Windows uses ~15ms. Context switch itself takes ~1-10 microseconds — must be much smaller than the quantum.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why RR has higher average turnaround than SJF:</strong> SJF always runs the shortest job, finishing it quickly. RR gives everyone equal time slices, so short jobs wait for long jobs to use their quanta. Example: 3 jobs of burst 10, quantum 1. RR finishes them at t=28, 29, 30. FCFS finishes at 10, 20, 30. SJF (same as FCFS here) also 10, 20, 30. Average turnaround: RR=29, FCFS/SJF=20.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Turnaround time varies with quantum:</strong> There is a sweet spot. As quantum increases from very small: turnaround decreases (less switching overhead). But at some point it increases again (approaching FCFS behavior for large q). The optimal quantum depends on the workload. This is why Linux's CFS doesn't use a fixed quantum but adjusts dynamically.
              </LearnMore>

              <NavButtons prev={function() { setActive('sjf') }} prevLabel="← 5.4 SJF" next={function() { setActive('priority') }} nextLabel="5.6 Priority →" />
            </div>
          )}

          {/* 5.6 Priority */}
          {active === 'priority' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.6 Priority Scheduling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Assigning importance levels to processes — and preventing starvation.</p>

              <InfoBox color="#8b5cf6">
                A priority number (integer) is associated with each process. The CPU is allocated to the process with the <strong>highest priority</strong> (smallest integer = highest priority in most systems). Can be <strong>preemptive</strong> or <strong>non-preemptive</strong>. SJF is a special case where priority = inverse of burst time.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Priority Example</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Process', 'Burst Time', 'Priority'].map(function(h) {
                        return <th key={h} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[['P1', 10, 3], ['P2', 1, 1], ['P3', 2, 4], ['P4', 1, 5], ['P5', 5, 2]].map(function(r) {
                      return (
                        <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          {r.map(function(v, i) {
                            return <td key={i} style={{ padding: '6px 12px', textAlign: 'center', color: i === 2 ? '#8b5cf6' : 'var(--text-secondary)', fontWeight: i === 2 ? 700 : 400 }}>{v}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Gantt Chart (lower number = higher priority):</div>
                <GanttChart
                  schedule={[
                    { process: 'P2', start: 0,  end: 1  },
                    { process: 'P5', start: 1,  end: 6  },
                    { process: 'P1', start: 6,  end: 16 },
                    { process: 'P3', start: 16, end: 18 },
                    { process: 'P4', start: 18, end: 19 },
                  ]}
                  totalTime={19}
                />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Average waiting time = <strong style={{ color: '#8b5cf6' }}>8.2ms</strong>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>The Starvation Problem</h3>
              <InfoBox color="#ef4444">
                <strong>Starvation</strong> (indefinite blocking): Low priority processes may never execute if high priority processes keep arriving. A process submitted in 1973 at MIT was found in 1974 — still waiting to run, priority too low. This is not theoretical — it happens in real systems.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Solution: Aging</h3>
              <InfoBox color="#10b981">
                <strong>Aging</strong>: Gradually increase the priority of processes that wait for a long time. If priority increases by 1 every 15 minutes, a process with priority 127 would have priority 0 (highest) in 32 hours — guaranteed to run eventually. Simple, effective, widely used.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Priority + Round Robin</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Combine both: run the highest priority process. If multiple processes have the <strong style={{ color: 'var(--text-primary)' }}>same priority</strong>, use Round Robin among them. This gives both priority-based selection AND fair sharing within a priority level.
              </p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Process', 'Burst', 'Priority'].map(function(h) {
                        return <th key={h} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[['P1', 4, 3], ['P2', 5, 2], ['P3', 8, 2], ['P4', 7, 1], ['P5', 3, 3]].map(function(r) {
                      return (
                        <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          {r.map(function(v, i) {
                            return <td key={i} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  P4 (priority 1) runs first. Then P2 and P3 (priority 2) share via RR with q=2. Then P1 and P5 (priority 3).
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Internal vs External priority:</strong> Internal priorities are computed by the OS based on measurable quantities — time limits, memory requirements, number of open files, ratio of average I/O burst to average CPU burst. External priorities are set by criteria outside the OS — importance to the user, type of work, politics. Most real systems use a combination.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Priority inversion:</strong> A classic problem in real-time systems. High-priority process H needs a resource held by low-priority process L. Medium-priority process M preempts L. Now M (not H) runs, even though H has higher priority. Mars Pathfinder (1997) experienced this bug — the spacecraft repeatedly rebooted due to priority inversion between tasks. Fixed with the priority inheritance protocol: L temporarily inherits H's priority.
              </LearnMore>

              <NavButtons prev={function() { setActive('rr') }} prevLabel="← 5.5 Round Robin" next={function() { setActive('multilevel') }} nextLabel="5.7 Multilevel Queue →" />
            </div>
          )}

          {/* 5.7 Multilevel */}
          {active === 'multilevel' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.7 Multilevel Queue and Feedback Queue</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Separating processes by type — and adapting to their behavior dynamically.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Multilevel Queue</h3>
              <InfoBox color="#3b82f6">
                With priority scheduling, have <strong>separate queues for each priority level</strong>. Schedule from the highest priority queue first. Each queue can have its own scheduling algorithm. Processes are <strong>permanently assigned</strong> to a queue based on process type.
              </InfoBox>

              <div style={{ marginBottom: 24 }}>
                {[
                  { queue: 'Real-time Processes',   priority: 'Highest', color: '#ef4444', algo: 'Preemptive priority' },
                  { queue: 'System Processes',       priority: 'High',    color: '#f97316', algo: 'Priority + FCFS' },
                  { queue: 'Interactive Processes',  priority: 'Medium',  color: '#f59e0b', algo: 'Round Robin (small q)' },
                  { queue: 'Interactive Editing',    priority: 'Medium',  color: '#10b981', algo: 'Round Robin' },
                  { queue: 'Batch Processes',        priority: 'Low',     color: '#3b82f6', algo: 'FCFS' },
                  { queue: 'Student Processes',      priority: 'Lowest',  color: '#6e7681', algo: 'FCFS' },
                ].map(function(q, i) {
                  return (
                    <div key={q.queue} style={{ background: 'var(--bg-card)', border: '1px solid ' + q.color + '44', borderLeft: '4px solid ' + q.color, borderRadius: 8, padding: '12px 16px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: q.color, fontSize: 13 }}>{q.queue}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Algorithm: {q.algo}</span>
                      </div>
                      <span style={{ fontSize: 11, background: q.color + '22', color: q.color, padding: '2px 10px', borderRadius: 12, fontWeight: 700 }}>{q.priority}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Multilevel Feedback Queue</h3>
              <InfoBox color="#8b5cf6">
                The most general CPU scheduling algorithm. Processes can <strong>move between queues</strong>. Aging can be implemented this way. A process that uses too much CPU moves to a lower priority queue. A process that waits too long moves to a higher priority queue. The algorithm adapts to process behavior.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Classic Example — 3 Queues</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { q: 'Q0', desc: 'RR with quantum = 8ms. All new jobs enter here.', color: '#ef4444' },
                  { q: 'Q1', desc: 'RR with quantum = 16ms. Jobs that don\'t finish in Q0 move here.', color: '#f59e0b' },
                  { q: 'Q2', desc: 'FCFS. Jobs that don\'t finish in Q1 move here.', color: '#3b82f6' },
                ].map(function(q) {
                  return (
                    <div key={q.q} style={{ background: 'var(--bg-card)', border: '1px solid ' + q.color + '44', borderRadius: 8, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ background: q.color, color: 'white', padding: '4px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{q.q}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{q.desc}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontSize: 14 }}>Scheduling behavior:</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  1. New job enters Q0 (RR, q=8). Gets 8ms of CPU.
                  <br />
                  2. If it finishes in 8ms — done. Short interactive job handled quickly.
                  <br />
                  3. If not finished — moves to Q1 (RR, q=16). Gets 16ms more.
                  <br />
                  4. If still not finished — moves to Q2 (FCFS). Runs to completion when CPU available.
                  <br />
                  5. Q0 has absolute priority over Q1, Q1 over Q2.
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>MLFQ parameters:</strong> A MLFQ is defined by: number of queues, scheduling algorithm for each queue, method to upgrade a process (aging), method to demote a process (too much CPU), and which queue a process enters initially. Different choices produce very different behaviors.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Gaming the scheduler:</strong> In early UNIX systems, processes could game the scheduler by voluntarily giving up the CPU just before their quantum expired. This made them look I/O-bound, so they got boosted to higher priority queues and got more CPU. Modern schedulers (Linux CFS) track actual CPU usage to prevent gaming.
              </LearnMore>

              <NavButtons prev={function() { setActive('priority') }} prevLabel="← 5.6 Priority" next={function() { setActive('realtime') }} nextLabel="5.8 Real-Time →" />
            </div>
          )}

          {/* 5.8 Real-Time */}
          {active === 'realtime' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.8 Real-Time CPU Scheduling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Scheduling where missing a deadline is a system failure.</p>

              <InfoBox color="#ef4444">
                Real-time systems must respond to events within a <strong>guaranteed time limit</strong>. There are two types: <strong>Soft real-time</strong> (critical tasks have highest priority but no guarantee of when they run) and <strong>Hard real-time</strong> (task MUST be serviced by its deadline — missing = system failure).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Event Latency</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Interrupt Latency</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Time from arrival of interrupt to start of the interrupt service routine (ISR). Must be minimized and bounded for hard real-time systems.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Dispatch Latency</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Time for the dispatcher to stop one process and start another. Conflict phase: preempt running process, release resources needed by high-priority process.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Periodic Processes</h3>
              <InfoBox color="#8b5cf6">
                Real-time processes have new characteristics: <strong>periodic</strong> processes require the CPU at constant intervals. Each periodic process has: processing time t, deadline d, and period p, where 0 ≤ t ≤ d ≤ p. The rate of a periodic task is 1/p.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Rate Monotonic Scheduling</h3>
              <InfoBox color="#3b82f6">
                Priority is assigned based on the inverse of the period. <strong>Shorter period = higher priority. Longer period = lower priority.</strong> P1 with period 50ms gets higher priority than P2 with period 100ms. Simple and widely used. Can miss deadlines if CPU utilization is too high.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Earliest Deadline First (EDF)</h3>
              <InfoBox color="#10b981">
                Priorities are assigned according to deadlines: <strong>earlier deadline = higher priority, later deadline = lower priority</strong>. Dynamic — priorities change as deadlines approach. Theoretically optimal — can achieve 100% CPU utilization. More complex than Rate Monotonic.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Rate Monotonic</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Static priorities (set at start)</li>
                    <li>Simple to implement</li>
                    <li>Max utilization: ~69% for many tasks</li>
                    <li>Can miss deadlines near 100% util</li>
                    <li>Used: VxWorks, embedded systems</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Earliest Deadline First (EDF)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Dynamic priorities (change over time)</li>
                    <li>More complex to implement</li>
                    <li>Theoretically optimal: 100% utilization</li>
                    <li>Never misses deadlines if feasible</li>
                    <li>Used: Linux with SCHED_DEADLINE</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>POSIX Real-Time Scheduling:</strong> POSIX defines two scheduling classes for real-time: SCHED_FIFO (threads scheduled FCFS within priority, no time-slicing) and SCHED_RR (like SCHED_FIFO but with time-slicing for equal priorities). Linux adds SCHED_DEADLINE which implements EDF. Real-time tasks on Linux can set their deadline, period, and runtime using sched_setattr().
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Hard real-time examples:</strong> Pacemaker: must deliver pulse within exact microseconds. ABS brakes: must respond within 30ms of wheel lockup. Aircraft fly-by-wire: must respond to control inputs within 10ms. Industrial robot arm: must complete each step of a weld within tight time windows. In all cases, missing the deadline = potential catastrophic failure.
              </LearnMore>

              <NavButtons prev={function() { setActive('multilevel') }} prevLabel="← 5.7 Multilevel" next={function() { setActive('os') }} nextLabel="5.9 OS Examples →" />
            </div>
          )}

          {/* 5.9 OS Examples */}
          {active === 'os' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>5.9 OS Scheduling Examples</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How Linux, Windows, and Solaris actually implement scheduling.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Linux — Completely Fair Scheduler (CFS)</h3>
              <InfoBox color="#10b981">
                Linux 2.6.23+ uses <strong>CFS (Completely Fair Scheduler)</strong>. Rather than fixed time quanta, CFS gives each process a <strong>proportion of CPU time</strong> based on its nice value. Uses a red-black tree ordered by virtual runtime (vruntime). Always picks the leftmost node (lowest vruntime).
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { concept: 'vruntime', color: '#10b981', desc: 'Virtual run time — tracks how long each process has run, weighted by priority. Lower vruntime = process has had less CPU time = should run next.' },
                  { concept: 'nice value', color: '#3b82f6', desc: 'Range -20 to +19. Lower = higher priority. nice=-20 is highest priority (gets most CPU). nice=+19 is lowest. Default is 0.' },
                  { concept: 'Target latency', color: '#8b5cf6', desc: 'Interval during which each runnable task should run at least once. Typically 6ms. Minimum granularity prevents too-small time slices.' },
                  { concept: 'Scheduling classes', color: '#f59e0b', desc: 'CFS supports multiple scheduling classes with priorities. Real-time tasks (SCHED_FIFO, SCHED_RR) always preempt normal tasks (SCHED_NORMAL/CFS).' },
                ].map(function(c) {
                  return (
                    <div key={c.concept} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '33', borderRadius: 8, padding: 14, display: 'flex', gap: 12 }}>
                      <div style={{ fontWeight: 700, color: c.color, fontSize: 13, minWidth: 120 }}>{c.concept}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Linux Priority Ranges:</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div>Real-time:  0  - 99  (higher number = higher priority)</div>
                  <div>Normal:     100 - 139 (nice -20 to +19)</div>
                  <div>nice=-20 maps to global priority 100 (highest normal)</div>
                  <div>nice=+19 maps to global priority 139 (lowest normal)</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Windows Scheduling</h3>
              <InfoBox color="#3b82f6">
                Windows uses <strong>priority-based preemptive scheduling</strong>. Highest-priority thread always runs next. 32 priority levels. Variable class (1-15) and real-time class (16-31). Priority 0 is the memory-management thread.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { name: 'REALTIME_PRIORITY_CLASS', desc: 'Highest. Used for time-critical applications. Can preempt OS processes.' },
                  { name: 'HIGH_PRIORITY_CLASS', desc: 'For time-sensitive tasks. Like Task Manager — must respond quickly.' },
                  { name: 'ABOVE_NORMAL_PRIORITY_CLASS', desc: 'Slightly above normal. Foreground window gets 3x boost.' },
                  { name: 'NORMAL_PRIORITY_CLASS', desc: 'Default. Base priority is NORMAL. Most applications.' },
                  { name: 'BELOW_NORMAL_PRIORITY_CLASS', desc: 'Background tasks that shouldn\'t interfere with normal work.' },
                  { name: 'IDLE_PRIORITY_CLASS', desc: 'Lowest. Runs only when system is idle. Screensavers, indexing.' },
                ].map(function(p) {
                  return (
                    <div key={p.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 11, marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Solaris Scheduling</h3>
              <InfoBox color="#f59e0b">
                Solaris uses priority-based scheduling with 6 classes: <strong>Time sharing (TS)</strong>, Interactive (IA), Real time (RT), System (SYS), Fair Share (FSS), and Fixed priority (FP). Each class has its own scheduling algorithm. Time sharing uses a multilevel feedback queue with a configurable dispatch table.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux CFS implementation detail:</strong> CFS uses a red-black tree (self-balancing BST) keyed by vruntime. The leftmost node is always the process with the least vruntime. Insertion is O(log n). Finding the next process to run is O(1) — just go left. This is elegant and efficient for systems with hundreds of runnable processes.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Linux load balancing:</strong> Linux is also NUMA-aware. A scheduling domain is a set of CPU cores that can be balanced against each other. The goal is to keep threads from migrating between NUMA domains — a thread's memory is likely near the CPU it was running on. Load balancing within a domain is cheap; across domains is expensive (the remote memory access penalty).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Windows 7 User-Mode Scheduling (UMS):</strong> Applications can create and manage threads independent of the kernel. For large numbers of threads, this is much more efficient than kernel thread management. UMS schedulers come from programming language libraries like the C++ Concurrent Runtime (ConcRT) framework.
              </LearnMore>

              <NavButtons prev={function() { setActive('realtime') }} prevLabel="← 5.8 Real-Time" next={function() { setActive('simulator') }} nextLabel="Scheduler Simulator →" />
            </div>
          )}

          {/* Simulator */}
          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>CPU Scheduler Simulator</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
                Add processes, choose an algorithm, click Run — and see the Gantt chart and statistics instantly.
              </p>
              <SchedulerSimulator />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Challenges to Try</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { n: 1, challenge: 'Reproduce the convoy effect', hint: 'Set P1 burst=20, P2 burst=2, P3 burst=2, all arrive at 0. Run FCFS. See the high waiting time.' },
                  { n: 2, challenge: 'Prove SJF is optimal', hint: 'Use same processes above with SJF. Compare average waiting times. SJF should be much lower.' },
                  { n: 3, challenge: 'See how quantum affects RR', hint: 'Run RR with quantum=1, then quantum=10, then quantum=20. See how turnaround changes.' },
                  { n: 4, challenge: 'Starvation with priority', hint: 'Add 5 processes with priority 1 and 1 process with priority 5. See how the low priority process waits.' },
                ].map(function(c) {
                  return (
                    <div key={c.n} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, display: 'flex', gap: 12 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{c.n}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{c.challenge}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.hint}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <NavButtons prev={function() { setActive('os') }} prevLabel="← 5.9 OS Examples" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {/* Lab */}
          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — CPU Scheduling in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore scheduling concepts through code and the terminal.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f59e0b' }}>Lab 1 — Process Scheduling Info in Python</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Python lets you inspect and change process scheduling properties — nice values, priorities, and CPU affinity.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#06b6d4' }}>Lab 2 — Explore Scheduling in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ps -o pid,ni,pri,cmd',   'Show nice value and priority of processes'],
                  ['top',                     'Live view — includes %CPU, priority, nice value'],
                  ['ps aux --sort=-%cpu',     'Sort processes by CPU usage (highest first)'],
                  ['cat /proc/1/sched',       'Scheduling info for process 1 (systemd)'],
                  ['uptime',                  'Load average — average ready queue length'],
                  ['ps -eLo pid,tid,class,rtprio,ni,pri,psr,pcpu,comm', 'Full scheduling detail'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', minWidth: 200, flexShrink: 0 }}>{item[0]}</code>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item[1]}</span>
                    </div>
                  )
                })}
              </div>
              <Terminal />

              <NavButtons prev={function() { setActive('simulator') }} prevLabel="← Simulator" next={function() { setActive('quiz') }} nextLabel="Take the Quiz →" />
            </div>
          )}

          {/* Quiz */}
          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 5.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#f59e0b' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#f59e0b', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 5!' : quiz.score >= 4 ? 'Good work! Review the sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/6' }} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 6 →</button>
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