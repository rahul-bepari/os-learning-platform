import { useState, useEffect, useRef } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'background',  title: '6.1 Background',           icon: '📖' },
  { id: 'critical',    title: '6.2 Critical Section',      icon: '🚧' },
  { id: 'peterson',    title: '6.3 Peterson\'s Solution',  icon: '🔬' },
  { id: 'hardware',    title: '6.4 Hardware Support',      icon: '⚙️' },
  { id: 'mutex',       title: '6.5 Mutex Locks',           icon: '🔒' },
  { id: 'semaphores',  title: '6.6 Semaphores',            icon: '🚦' },
  { id: 'monitors',    title: '6.7 Monitors',              icon: '📊' },
  { id: 'liveness',    title: '6.8 Liveness',              icon: '💀' },
  { id: 'simulator',   title: '🎮 Simulator',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                    icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                   icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is a race condition?',
    options: [
      'When two processes run at the same speed',
      'When several processes access and manipulate shared data concurrently and the outcome depends on the order of execution',
      'When a process runs faster than expected',
      'When the CPU scheduler makes poor decisions'
    ],
    answer: 1,
    explanation: 'A race condition occurs when multiple processes access shared data concurrently and the final result depends on the execution order. This leads to inconsistent and unpredictable results.'
  },
  {
    q: 'What are the three requirements for a solution to the Critical Section Problem?',
    options: [
      'Speed, Memory, Priority',
      'Mutual Exclusion, Progress, Bounded Waiting',
      'Fairness, Safety, Liveness',
      'Atomicity, Consistency, Isolation'
    ],
    answer: 1,
    explanation: 'A correct solution must satisfy: (1) Mutual Exclusion — only one process in critical section at a time, (2) Progress — if no process is in CS, selection cannot be postponed indefinitely, (3) Bounded Waiting — a bound exists on how many times others can enter before a waiting process gets in.'
  },
  {
    q: 'What is the initial value of a binary semaphore used as a mutex?',
    options: ['0', '1', '-1', 'Undefined'],
    answer: 1,
    explanation: 'A mutex semaphore is initialized to 1. wait() decrements it to 0 (lock acquired). signal() increments it back to 1 (lock released). If another process calls wait() when it is 0, it blocks.'
  },
  {
    q: 'What is the key advantage of monitors over semaphores?',
    options: [
      'Monitors are faster',
      'Monitors use less memory',
      'Monitors provide higher-level abstraction — mutual exclusion is automatic, reducing programmer errors',
      'Monitors work on distributed systems'
    ],
    answer: 2,
    explanation: 'Monitors provide a higher-level abstraction. Only one process can be active within a monitor at a time — mutual exclusion is enforced automatically by the language/runtime. With semaphores, programmers must manually call wait/signal correctly, which is error-prone.'
  },
  {
    q: 'What is a spinlock?',
    options: [
      'A lock that spins the disk',
      'A lock where the waiting process continuously checks if the lock is available (busy waiting)',
      'A lock used only in the kernel',
      'A deadlock involving spinning threads'
    ],
    answer: 1,
    explanation: 'A spinlock uses busy waiting — the process loops (spins) continuously checking if the lock is available. Wasteful on single-CPU systems (wastes CPU cycles) but efficient on multiprocessors for very short critical sections (no context switch overhead).'
  },
  {
    q: 'What causes deadlock with semaphores?',
    options: [
      'Using too many semaphores',
      'Two processes each waiting for a signal that only the other can send',
      'Initializing a semaphore to the wrong value',
      'Using binary semaphores instead of counting semaphores'
    ],
    answer: 1,
    explanation: 'Deadlock occurs when P0 calls wait(S) and P1 calls wait(Q), then P0 calls wait(Q) and P1 calls wait(S). Each is waiting for the other to release. Since neither can proceed, both are deadlocked forever.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #ef444455', color: '#ef4444', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid #ef444433', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

// ── Race Condition Visualizer ──────────────────────────────────
function RaceConditionVisualizer() {
  const [running, setRunning]   = useState(false)
  const [counter, setCounter]   = useState(5)
  const [p0reg, setP0reg]       = useState(null)
  const [p1reg, setP1reg]       = useState(null)
  const [step, setStep]         = useState(0)
  const [log, setLog]           = useState([])
  const [final, setFinal]       = useState(null)

  const steps = [
    { process: 'P0', action: 'register1 = counter',     desc: 'P0 reads counter into register1', reg: 'p0', val: 5 },
    { process: 'P0', action: 'register1 = register1+1', desc: 'P0 increments register1 to 6',    reg: 'p0', val: 6 },
    { process: 'P1', action: 'register2 = counter',     desc: 'P1 reads counter (still 5!)',      reg: 'p1', val: 5 },
    { process: 'P1', action: 'register2 = register2-1', desc: 'P1 decrements register2 to 4',    reg: 'p1', val: 4 },
    { process: 'P0', action: 'counter = register1',     desc: 'P0 writes 6 back to counter',     reg: 'counter', val: 6 },
    { process: 'P1', action: 'counter = register2',     desc: 'P1 writes 4 back — RACE! Expected 5, got 4', reg: 'counter', val: 4 },
  ]

  function runStep() {
    if (step >= steps.length) return
    const s = steps[step]
    setLog(function(l) { return [...l, s.process + ': ' + s.action + ' → ' + s.desc] })
    if (s.reg === 'p0') setP0reg(s.val)
    else if (s.reg === 'p1') setP1reg(s.val)
    else if (s.reg === 'counter') {
      setCounter(s.val)
      if (step === steps.length - 1) setFinal(s.val)
    }
    setStep(function(st) { return st + 1 })
  }

  function reset() {
    setCounter(5); setP0reg(null); setP1reg(null)
    setStep(0); setLog([]); setFinal(null); setRunning(false)
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Race Condition Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        counter starts at 5. P0 does counter++ and P1 does counter-- concurrently. Expected result: 5. See what actually happens.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'P0 register1', value: p0reg, color: '#3b82f6' },
          { label: 'Shared counter', value: counter, color: final === 4 ? '#ef4444' : '#10b981' },
          { label: 'P1 register2', value: p1reg, color: '#8b5cf6' },
        ].map(function(box) {
          return (
            <div key={box.label} style={{ background: 'var(--bg-secondary)', border: '2px solid ' + box.color + '44', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{box.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: box.color }}>{box.value !== null ? box.value : '—'}</div>
            </div>
          )
        })}
      </div>

      {final !== null && (
        <div style={{ background: '#ef444418', border: '1px solid #ef444444', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 14, color: '#ef4444', fontWeight: 600 }}>
          RACE CONDITION! Expected counter = 5, got {final}. P1 overwrote P0's update!
        </div>
      )}

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 100, maxHeight: 160, overflowY: 'auto' }}>
        {log.length === 0
          ? <div style={{ color: '#484f58', fontSize: 13 }}>Click "Next Step" to see the race condition unfold...</div>
          : log.map(function(line, i) {
            const isP0 = line.startsWith('P0')
            const isRace = line.includes('RACE')
            return (
              <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: isRace ? '#ef4444' : isP0 ? '#3b82f6' : '#8b5cf6', lineHeight: 1.8, fontWeight: isRace ? 700 : 400 }}>
                {line}
              </div>
            )
          })}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={runStep} disabled={step >= steps.length} style={{ background: step >= steps.length ? '#21262d' : '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: step >= steps.length ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: step >= steps.length ? 0.5 : 1 }}>
          {step >= steps.length ? 'Complete' : 'Next Step (' + (step + 1) + '/' + steps.length + ')'}
        </button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

// ── Peterson's Solution Visualizer ────────────────────────────
function PetersonVisualizer() {
  const [step, setStep]   = useState(0)
  const [flag, setFlag]   = useState([false, false])
  const [turn, setTurn]   = useState(0)
  const [inCS, setInCS]   = useState([false, false])
  const [log, setLog]     = useState([])

  const steps = [
    { proc: 0, desc: 'P0: flag[0] = true  (I want to enter)',     action: function() { setFlag([true, false]) } },
    { proc: 0, desc: 'P0: turn = 1  (I give priority to P1)',     action: function() { setTurn(1) } },
    { proc: 1, desc: 'P1: flag[1] = true  (I want to enter)',     action: function() { setFlag([true, true]) } },
    { proc: 1, desc: 'P1: turn = 0  (I give priority to P0)',     action: function() { setTurn(0) } },
    { proc: 0, desc: 'P0: checks while(flag[1] && turn==1) → FALSE (turn=0, P0 enters!)', action: function() { setInCS([true, false]) } },
    { proc: 0, desc: 'P0: INSIDE critical section — executing',   action: function() {} },
    { proc: 0, desc: 'P0: exits CS, flag[0] = false',             action: function() { setFlag([false, true]); setInCS([false, false]) } },
    { proc: 1, desc: 'P1: while loop exits (flag[0]=false) → P1 enters!', action: function() { setInCS([false, true]) } },
    { proc: 1, desc: 'P1: INSIDE critical section — executing',   action: function() {} },
    { proc: 1, desc: 'P1: exits CS, flag[1] = false',             action: function() { setFlag([false, false]); setInCS([false, false]) } },
  ]

  function nextStep() {
    if (step >= steps.length) return
    const s = steps[step]
    s.action()
    setLog(function(l) { return [...l, { proc: s.proc, desc: s.desc }] })
    setStep(function(st) { return st + 1 })
  }

  function reset() {
    setStep(0); setFlag([false, false]); setTurn(0)
    setInCS([false, false]); setLog([])
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Peterson's Solution Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Step through Peterson's solution for 2 processes — see how flag[] and turn guarantee mutual exclusion.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'flag[0]', value: flag[0] ? 'true' : 'false', color: flag[0] ? '#3b82f6' : '#6e7681' },
          { label: 'flag[1]', value: flag[1] ? 'true' : 'false', color: flag[1] ? '#8b5cf6' : '#6e7681' },
          { label: 'turn',    value: turn,                        color: '#f59e0b' },
          { label: 'In CS',   value: inCS[0] ? 'P0' : inCS[1] ? 'P1' : 'None', color: inCS[0] || inCS[1] ? '#ef4444' : '#10b981' },
        ].map(function(b) {
          return (
            <div key={b.label} style={{ background: 'var(--bg-secondary)', border: '2px solid ' + b.color + '44', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{b.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: b.color }}>{String(b.value)}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[0, 1].map(function(i) {
          const color = i === 0 ? '#3b82f6' : '#8b5cf6'
          return (
            <div key={i} style={{ background: inCS[i] ? color + '22' : 'var(--bg-secondary)', border: '2px solid ' + (inCS[i] ? color : 'var(--border)'), borderRadius: 10, padding: 14 }}>
              <div style={{ fontWeight: 700, color: color, marginBottom: 8 }}>Process P{i}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div>flag[{i}] = true;</div>
                <div>turn = {1 - i};</div>
                <div>while (flag[{1 - i}] && turn == {1 - i});</div>
                <div style={{ color: inCS[i] ? color : 'inherit', fontWeight: inCS[i] ? 700 : 400 }}>{'/* critical section */'}</div>
                <div>flag[{i}] = false;</div>
              </div>
              {inCS[i] && <div style={{ marginTop: 8, fontSize: 12, color: color, fontWeight: 700 }}>IN CRITICAL SECTION</div>}
            </div>
          )
        })}
      </div>

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 80, maxHeight: 140, overflowY: 'auto' }}>
        {log.length === 0
          ? <div style={{ color: '#484f58', fontSize: 13 }}>Click Next Step to begin...</div>
          : log.map(function(line, i) {
            return (
              <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: line.proc === 0 ? '#3b82f6' : '#8b5cf6', lineHeight: 1.8 }}>
                {line.desc}
              </div>
            )
          })}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={nextStep} disabled={step >= steps.length} style={{ background: step >= steps.length ? '#21262d' : '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: step >= steps.length ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: step >= steps.length ? 0.5 : 1 }}>
          {step >= steps.length ? 'Complete' : 'Next Step (' + (step + 1) + '/' + steps.length + ')'}
        </button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

// ── Semaphore Simulator ────────────────────────────────────────
function SemaphoreSimulator() {
  const [semValue, setSemValue] = useState(1)
  const [initVal, setInitVal]   = useState(1)
  const [waitQueue, setWaitQueue] = useState([])
  const [log, setLog]           = useState([])
  const [nextPid, setNextPid]   = useState(3)

  function doWait(pid) {
    if (semValue > 0) {
      setSemValue(function(v) { return v - 1 })
      addLog(pid + ': wait() — semaphore was ' + semValue + ' → ' + (semValue - 1) + '. Lock acquired!', '#10b981')
    } else {
      setWaitQueue(function(q) { return [...q, pid] })
      addLog(pid + ': wait() — semaphore is 0. ' + pid + ' BLOCKED and added to wait queue.', '#ef4444')
    }
  }

  function doSignal(pid) {
    if (waitQueue.length > 0) {
      const next = waitQueue[0]
      setWaitQueue(function(q) { return q.slice(1) })
      addLog(pid + ': signal() — waking up ' + next + ' from wait queue.', '#f59e0b')
    } else {
      setSemValue(function(v) { return v + 1 })
      addLog(pid + ': signal() — semaphore was ' + semValue + ' → ' + (semValue + 1) + '. Lock released.', '#3b82f6')
    }
  }

  function addLog(msg, color) {
    setLog(function(l) { return [...l, { msg, color }] })
  }

  function reset() {
    setSemValue(initVal)
    setWaitQueue([])
    setLog([])
  }

  function addProcess() {
    const pid = 'P' + nextPid
    setNextPid(function(n) { return n + 1 })
    addLog(pid + ' arrived and wants to enter critical section.', '#8b5cf6')
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Semaphore Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Interactively call wait() and signal() on a semaphore and see how blocking works.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Initial value:</div>
        {[0, 1, 2, 3].map(function(v) {
          return (
            <button key={v} onClick={function() { setInitVal(v); setSemValue(v); setWaitQueue([]); setLog([]) }} style={{ background: initVal === v ? '#ef4444' : 'var(--bg-secondary)', color: initVal === v ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (initVal === v ? '#ef4444' : 'var(--border)'), padding: '4px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {v}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: semValue > 0 ? '#10b98118' : '#ef444418', border: '2px solid ' + (semValue > 0 ? '#10b981' : '#ef4444'), borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Semaphore Value</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: semValue > 0 ? '#10b981' : '#ef4444' }}>{semValue}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: semValue > 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
            {semValue > 0 ? 'AVAILABLE' : 'LOCKED'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Wait Queue ({waitQueue.length} blocked)</div>
          {waitQueue.length === 0
            ? <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty — no blocked processes</div>
            : waitQueue.map(function(pid) {
              return (
                <div key={pid} style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 6, padding: '4px 12px', marginBottom: 6, fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                  {pid} — BLOCKED
                </div>
              )
            })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {['P1', 'P2'].map(function(pid) {
          return (
            <div key={pid} style={{ display: 'flex', gap: 8 }}>
              <button onClick={function() { doWait(pid) }} style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                {pid}: wait()
              </button>
              <button onClick={function() { doSignal(pid) }} style={{ background: '#10b98122', color: '#10b981', border: '1px solid #10b98144', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                {pid}: signal()
              </button>
            </div>
          )
        })}
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, minHeight: 80, maxHeight: 160, overflowY: 'auto' }}>
        {log.length === 0
          ? <div style={{ color: '#484f58', fontSize: 13 }}>Click wait() or signal() to see what happens...</div>
          : log.map(function(line, i) {
            return (
              <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: line.color, lineHeight: 1.8 }}>
                {line.msg}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default function Chapter6() {
  const [active, setActive] = useState('background')
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

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #ef444444', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 6</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🔒</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Synchronization Tools</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How to coordinate concurrent processes safely — from race conditions to mutexes, semaphores, and monitors. Aligned with your lecture slides.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Race Condition Visualizer', 'Peterson\'s Solution', 'Semaphore Simulator', 'Mutex Locks', 'Monitors'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef444433', color: '#ef4444', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#ef4444' : 'var(--text-secondary)', background: active === s.id ? 'rgba(239,68,68,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #ef4444' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'background' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.1 Background</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Why synchronization is needed — the problem with concurrent access to shared data.</p>

              <InfoBox color="#ef4444">
                Processes can execute <strong>concurrently</strong> and may be interrupted at any time. Concurrent access to shared data may result in <strong>data inconsistency</strong>. We need mechanisms to ensure the <strong>orderly execution</strong> of cooperating processes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The Producer-Consumer Problem</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Suppose we want to count the number of full buffers using an integer <strong style={{ color: 'var(--text-primary)' }}>counter</strong>. The producer increments it after producing, the consumer decrements it after consuming. Both operations seem simple — but they are NOT atomic.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Producer</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>while (true) {'{'}</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* produce item */</div>
                    <div style={{ paddingLeft: 16 }}>while (counter == BUFFER_SIZE)</div>
                    <div style={{ paddingLeft: 32, color: '#8b949e' }}>; /* do nothing */</div>
                    <div style={{ paddingLeft: 16 }}>buffer[in] = next_produced;</div>
                    <div style={{ paddingLeft: 16 }}>in = (in+1) % BUFFER_SIZE;</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>counter++;</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Consumer</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>while (true) {'{'}</div>
                    <div style={{ paddingLeft: 16 }}>while (counter == 0)</div>
                    <div style={{ paddingLeft: 32, color: '#8b949e' }}>; /* do nothing */</div>
                    <div style={{ paddingLeft: 16 }}>next_consumed = buffer[out];</div>
                    <div style={{ paddingLeft: 16 }}>out = (out+1) % BUFFER_SIZE;</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>counter--;</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* consume item */</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Why counter++ is NOT Atomic</h3>
              <InfoBox color="#f59e0b">
                counter++ looks like one operation but compiles to THREE machine instructions:
                <br /><br />
                <strong>register1 = counter</strong> (read)<br />
                <strong>register1 = register1 + 1</strong> (increment)<br />
                <strong>counter = register1</strong> (write)
                <br /><br />
                If a context switch happens between any of these steps — disaster!
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Race Condition — Step by Step</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Initial value: counter = 5</div>
                {[
                  { step: 'S0', proc: 'Producer', action: 'register1 = counter', result: 'register1 = 5', color: '#3b82f6' },
                  { step: 'S1', proc: 'Producer', action: 'register1 = register1 + 1', result: 'register1 = 6', color: '#3b82f6' },
                  { step: 'S2', proc: 'Consumer', action: 'register2 = counter', result: 'register2 = 5 (stale!)', color: '#8b5cf6' },
                  { step: 'S3', proc: 'Consumer', action: 'register2 = register2 - 1', result: 'register2 = 4', color: '#8b5cf6' },
                  { step: 'S4', proc: 'Producer', action: 'counter = register1', result: 'counter = 6', color: '#3b82f6' },
                  { step: 'S5', proc: 'Consumer', action: 'counter = register2', result: 'counter = 4 ← WRONG! Expected 5', color: '#ef4444' },
                ].map(function(s) {
                  return (
                    <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
                      <span style={{ background: s.color + '22', color: s.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{s.step}</span>
                      <span style={{ fontSize: 12, color: s.color, fontWeight: 600, minWidth: 70 }}>{s.proc}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{s.action}</span>
                      <span style={{ fontSize: 12, color: s.step === 'S5' ? '#ef4444' : 'var(--text-muted)', fontWeight: s.step === 'S5' ? 700 : 400 }}>{s.result}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Interactive Race Condition Demo</h3>
              <RaceConditionVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Race conditions in real systems:</strong> The Therac-25 radiation therapy machine (1985-87) had a race condition in its software. When an operator typed fast enough, the race condition disabled safety checks. Six patients received massive radiation overdoses; at least three died. This is one of the most cited software safety failures in history.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Why are race conditions hard to find?</strong> They only manifest when a context switch happens at exactly the wrong moment. In testing, this may never happen. In production with heavier load, it happens regularly. The bug is non-deterministic — it may appear once a day, once a week, or only under specific hardware/load conditions. This makes it nearly impossible to reproduce and debug.
              </LearnMore>

              <NavButtons next={function() { setActive('critical') }} nextLabel="6.2 Critical Section →" />
            </div>
          )}

          {active === 'critical' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.2 The Critical Section Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Defining the problem formally and the three requirements for a correct solution.</p>

              <InfoBox color="#3b82f6">
                Consider a system of n processes. Each process has a <strong>critical section</strong> — a segment of code where it accesses shared data. The <strong>Critical Section Problem</strong> is to design a protocol so that processes can cooperate safely.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Structure of a Process</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e6edf3', lineHeight: 2 }}>
                  <div>do {'{'}</div>
                  <div style={{ paddingLeft: 20, color: '#3b82f6' }}>entry section</div>
                  <div style={{ paddingLeft: 20, background: '#ef444422', borderRadius: 4, padding: '4px 16px', margin: '4px 0' }}>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>critical section</span>
                    <span style={{ color: '#8b949e', marginLeft: 16 }}>{'/* shared data accessed here */'}</span>
                  </div>
                  <div style={{ paddingLeft: 20, color: '#10b981' }}>exit section</div>
                  <div style={{ paddingLeft: 20, color: '#8b949e' }}>remainder section</div>
                  <div>{'}'} while (true);</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Three Requirements for a Correct Solution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {[
                  {
                    n: 1, name: 'Mutual Exclusion', color: '#ef4444',
                    desc: 'If process Pi is executing in its critical section, then NO other processes can be executing in their critical sections.',
                    example: 'Only one person in the bathroom at a time.',
                  },
                  {
                    n: 2, name: 'Progress', color: '#f59e0b',
                    desc: 'If no process is executing in its critical section AND some processes wish to enter, then the selection of which process enters CANNOT be postponed indefinitely. Only processes not in their remainder section can participate in the decision.',
                    example: 'If nobody is in the bathroom, someone waiting must be allowed in.',
                  },
                  {
                    n: 3, name: 'Bounded Waiting', color: '#10b981',
                    desc: 'A BOUND must exist on the number of times other processes can enter their critical sections after a process has made a request to enter, before that request is granted. No starvation.',
                    example: 'You can\'t be made to wait forever while others keep cutting in line.',
                  },
                ].map(function(r) {
                  return (
                    <div key={r.n} style={{ background: 'var(--bg-card)', border: '1px solid ' + r.color + '44', borderLeft: '4px solid ' + r.color, borderRadius: 10, padding: 20 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>{r.n}</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: r.color }}>{r.name}</div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{r.desc}</p>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Analogy: {r.example}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Preemptive vs Non-preemptive Kernels</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Preemptive Kernel</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Allows preemption in kernel mode</li>
                    <li>More complex — must handle race conditions in kernel</li>
                    <li>Better responsiveness for real-time</li>
                    <li>Linux 2.6+, Windows</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Non-preemptive Kernel</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Runs until exits kernel mode, blocks, or yields</li>
                    <li>Essentially free of race conditions in kernel</li>
                    <li>Simpler but less responsive</li>
                    <li>Windows XP kernel mode</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why mutual exclusion alone is not enough:</strong> Consider two processes P0 and P1 both trying to enter their critical sections. If we just check "is anyone in the CS?" before entering, we can have: P0 checks — no one in CS. P1 checks — no one in CS. P0 enters CS. P1 enters CS. Both in CS simultaneously — mutual exclusion violated. The entry section must be atomic.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Livelock vs deadlock:</strong> Deadlock = processes stuck, not moving. Livelock = processes keep changing state in response to each other but make no progress. Example: two people in a corridor, both stepping aside the same direction repeatedly. Both keep moving but never pass. Livelock satisfies "progress" (processes can change state) but violates "bounded waiting" (they never enter the CS).
              </LearnMore>

              <NavButtons prev={function() { setActive('background') }} prevLabel="← 6.1 Background" next={function() { setActive('peterson') }} nextLabel="6.3 Peterson's Solution →" />
            </div>
          )}

          {active === 'peterson' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.3 Peterson's Solution</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>A classic software solution for two processes — elegant but limited.</p>

              <InfoBox color="#8b5cf6">
                Peterson's Solution is a classic software-only solution for the critical section problem for <strong>two processes</strong>. It uses two shared variables: <strong>int turn</strong> (whose turn it is) and <strong>boolean flag[2]</strong> (whether each process wants to enter). Not guaranteed to work on modern architectures due to instruction reordering.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The Algorithm</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[0, 1].map(function(i) {
                  const color = i === 0 ? '#3b82f6' : '#8b5cf6'
                  const j = 1 - i
                  return (
                    <div key={i} style={{ background: '#0d1117', border: '1px solid ' + color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Process P{i}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                        <div>while (true) {'{'}</div>
                        <div style={{ paddingLeft: 16, color: '#f59e0b' }}>flag[{i}] = true;</div>
                        <div style={{ paddingLeft: 16, color: '#f59e0b' }}>turn = {j};</div>
                        <div style={{ paddingLeft: 16 }}>while (flag[{j}] {'&&'} turn == {j})</div>
                        <div style={{ paddingLeft: 32, color: '#8b949e' }}>; /* busy wait */</div>
                        <div style={{ paddingLeft: 16, color: '#ef4444' }}>{'/* critical section */'}</div>
                        <div style={{ paddingLeft: 16, color: '#10b981' }}>flag[{i}] = false;</div>
                        <div style={{ paddingLeft: 16, color: '#8b949e' }}>{'/* remainder */'}</div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Why It Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { req: 'Mutual Exclusion', color: '#ef4444', proof: 'Pi enters CS only if flag[j]=false OR turn=i. If both want to enter: flag[0]=flag[1]=true. P0 enters CS only if turn=0, P1 only if turn=1. turn can only be 0 or 1 — so only one enters.' },
                  { req: 'Progress', color: '#f59e0b', proof: 'If P0 wants to enter and P1 doesn\'t (flag[1]=false), P0 exits the while loop immediately. Progress is satisfied.' },
                  { req: 'Bounded Waiting', color: '#10b981', proof: 'After P0 sets turn=1 and waits, P1 can enter at most once before P0 gets in (when P1 exits and sets flag[1]=false, or when turn changes).' },
                ].map(function(r) {
                  return (
                    <div key={r.req} style={{ background: 'var(--bg-card)', border: '1px solid ' + r.color + '33', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: r.color, marginBottom: 6, fontSize: 13 }}>{r.req}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.proof}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Interactive Peterson's Solution</h3>
              <PetersonVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Why It Fails on Modern CPUs</h3>
              <InfoBox color="#ef4444">
                Modern CPUs and compilers <strong>reorder instructions</strong> for performance. Peterson's relies on strict instruction ordering. If the CPU reorders flag=true and turn=j, both processes might see no one wants to enter and both proceed into the CS simultaneously. Memory barriers (fences) can fix this but add overhead.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>The reordering problem in detail:</strong> Processors use out-of-order execution and store buffers. When P0 writes flag[0]=true and then turn=1, these writes may not be visible to P1 in that order. P1 might see turn=1 but flag[0]=false, and think P0 doesn't want to enter — violating mutual exclusion. This is why hardware synchronization primitives (test-and-set, compare-and-swap) are needed.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Memory barriers:</strong> A memory barrier (fence) instruction forces all previous memory operations to complete before any subsequent ones begin. Adding memory_barrier() between the flag and turn assignments in Peterson's Solution fixes the reordering problem but with performance cost. Modern x86 CPUs have MFENCE, LFENCE, SFENCE instructions for this.
              </LearnMore>

              <NavButtons prev={function() { setActive('critical') }} prevLabel="← 6.2 Critical Section" next={function() { setActive('hardware') }} nextLabel="6.4 Hardware Support →" />
            </div>
          )}

          {active === 'hardware' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.4 Hardware Support for Synchronization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Atomic hardware instructions that make synchronization reliable and fast.</p>

              <InfoBox color="#06b6d4">
                Many systems provide <strong>hardware support</strong> for implementing critical sections. We will look at three forms: <strong>Memory Barriers</strong>, <strong>Hardware Instructions</strong> (test-and-set, compare-and-swap), and <strong>Atomic Variables</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>1. Memory Barriers</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                A <strong style={{ color: 'var(--text-primary)' }}>memory barrier</strong> (fence) forces any change in memory to be propagated (made visible) to all other processors before the barrier. Ensures ordering of memory operations.
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #06b6d444', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Thread 1 — with memory barrier */</div>
                  <div>while (!flag)</div>
                  <div style={{ paddingLeft: 20, color: '#06b6d4' }}>memory_barrier(); <span style={{ color: '#8b949e' }}>/* ensure flag is fresh */</span></div>
                  <div>print x; <span style={{ color: '#8b949e' }}>/* guaranteed to see latest x */</span></div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Thread 2 — with memory barrier */</div>
                  <div>x = 100;</div>
                  <div style={{ color: '#06b6d4' }}>memory_barrier(); <span style={{ color: '#8b949e' }}>/* ensure x written before flag */</span></div>
                  <div>flag = true;</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>2. Hardware Instructions</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8, fontSize: 14 }}>test_and_set()</div>
                  <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                      <div>boolean test_and_set(boolean *target) {'{'}</div>
                      <div style={{ paddingLeft: 16 }}>boolean rv = *target;</div>
                      <div style={{ paddingLeft: 16 }}>*target = true;</div>
                      <div style={{ paddingLeft: 16 }}>return rv;</div>
                      <div>{'}'}</div>
                    </div>
                  </div>
                  <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>Usage (lock=false initially):</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                      <div>do {'{'}</div>
                      <div style={{ paddingLeft: 16 }}>while (test_and_set(&lock))</div>
                      <div style={{ paddingLeft: 32 }}>; /* busy wait */</div>
                      <div style={{ paddingLeft: 16, color: '#ef4444' }}>/* critical section */</div>
                      <div style={{ paddingLeft: 16 }}>lock = false;</div>
                      <div>{'}'} while (true);</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8, fontSize: 14 }}>compare_and_swap()</div>
                  <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                      <div>int compare_and_swap(</div>
                      <div style={{ paddingLeft: 16 }}>int *value, int expected, int new_val) {'{'}</div>
                      <div style={{ paddingLeft: 16 }}>int temp = *value;</div>
                      <div style={{ paddingLeft: 16 }}>if (*value == expected)</div>
                      <div style={{ paddingLeft: 32 }}>*value = new_val;</div>
                      <div style={{ paddingLeft: 16 }}>return temp;</div>
                      <div>{'}'}</div>
                    </div>
                  </div>
                  <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>Usage (lock=0 initially):</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                      <div>while (true) {'{'}</div>
                      <div style={{ paddingLeft: 16 }}>while (compare_and_swap(</div>
                      <div style={{ paddingLeft: 32 }}>&lock, 0, 1) != 0)</div>
                      <div style={{ paddingLeft: 32 }}>; /* busy wait */</div>
                      <div style={{ paddingLeft: 16, color: '#ef4444' }}>/* critical section */</div>
                      <div style={{ paddingLeft: 16 }}>lock = 0;</div>
                      <div>{'}'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>3. Atomic Variables</h3>
              <InfoBox color="#10b981">
                Atomic variables provide atomic (uninterruptible) updates on basic data types. Built on compare-and-swap. The increment() operation on atomic variable <strong>sequence</strong> ensures it is incremented without interruption.
              </InfoBox>
              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Atomic increment using CAS */</div>
                  <div>void increment(atomic_int *v) {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>int temp;</div>
                  <div style={{ paddingLeft: 20 }}>do {'{'}</div>
                  <div style={{ paddingLeft: 40 }}>temp = *v;</div>
                  <div style={{ paddingLeft: 20 }}>{'}'} while (temp != compare_and_swap(v, temp, temp+1));</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why CAS is more powerful than TAS:</strong> test-and-set can only set a boolean. compare-and-swap can atomically update any value if it matches an expected value. CAS is the foundation of all modern lock-free data structures — lock-free queues, stacks, hash maps. CAS is available as a single CPU instruction on x86 (CMPXCHG) and ARM (STREX/LDREX).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>The ABA problem with CAS:</strong> CAS checks if a value equals "expected." But what if the value changed from A to B and back to A? CAS would succeed even though the data was modified. This is the ABA problem. Solutions: stamped references (add a version counter), hazard pointers, RCU (Read-Copy-Update). Lock-free programming is subtle and difficult to get right.
              </LearnMore>

              <NavButtons prev={function() { setActive('peterson') }} prevLabel="← 6.3 Peterson's" next={function() { setActive('mutex') }} nextLabel="6.5 Mutex Locks →" />
            </div>
          )}

          {active === 'mutex' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.5 Mutex Locks</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The simplest and most common synchronization tool.</p>

              <InfoBox color="#f59e0b">
                A <strong>mutex lock</strong> (mutual exclusion lock) is the simplest synchronization tool. Protect a critical section by first <strong>acquire()</strong> the lock, then <strong>release()</strong> it. A boolean variable indicates if the lock is available. Calls to acquire() and release() must be <strong>atomic</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Mutex Operations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>acquire()</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>acquire() {'{'}</div>
                    <div style={{ paddingLeft: 20 }}>while (!available)</div>
                    <div style={{ paddingLeft: 40, color: '#8b949e' }}>; /* busy wait */</div>
                    <div style={{ paddingLeft: 20 }}>available = false;</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>release()</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>release() {'{'}</div>
                    <div style={{ paddingLeft: 20 }}>available = true;</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#8b949e', marginBottom: 8 }}>Usage pattern:</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div>while (true) {'{'}</div>
                  <div style={{ paddingLeft: 20, color: '#f59e0b' }}>acquire lock</div>
                  <div style={{ paddingLeft: 20, background: '#ef444422', borderRadius: 4, padding: '2px 16px', margin: '2px 0', color: '#ef4444' }}>critical section</div>
                  <div style={{ paddingLeft: 20, color: '#10b981' }}>release lock</div>
                  <div style={{ paddingLeft: 20, color: '#8b949e' }}>remainder section</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Spinlock — Busy Waiting</h3>
              <InfoBox color="#ef4444">
                The mutex above uses <strong>busy waiting</strong> — the process loops continuously checking the lock. This is called a <strong>spinlock</strong>. It wastes CPU cycles on a single processor but can be efficient on multiprocessors for very short critical sections (no context switch overhead).
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Spinlock — Good for:</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Multiprocessor systems</li>
                    <li>Very short critical sections (microseconds)</li>
                    <li>When context switch cost exceeds wait time</li>
                    <li>Kernel code where blocking is not allowed</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Spinlock — Bad for:</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Single processor systems</li>
                    <li>Long critical sections</li>
                    <li>When waiting process wastes a whole CPU core</li>
                    <li>User-space applications (OS sleep is better)</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>POSIX Mutex in C</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>#include &lt;pthread.h&gt;</div>
                  <div></div>
                  <div>pthread_mutex_t mutex;</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* create and initialize */</div>
                  <div>pthread_mutex_init(&mutex, NULL);</div>
                  <div></div>
                  <div style={{ color: '#f59e0b' }}>/* acquire the lock */</div>
                  <div>pthread_mutex_lock(&mutex);</div>
                  <div></div>
                  <div style={{ color: '#ef4444' }}>/* critical section */</div>
                  <div></div>
                  <div style={{ color: '#10b981' }}>/* release the lock */</div>
                  <div>pthread_mutex_unlock(&mutex);</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Mutex vs Spinlock in Linux:</strong> Linux provides both. pthread_mutex_lock() in user space uses futex (fast userspace mutex) — first tries to acquire in user space (spinlock), if contended then calls the kernel to block (sleep). This gives the best of both worlds: fast path when uncontended, sleep when contended. spin_lock() in kernel space is a pure spinlock used when sleeping is not allowed (interrupt handlers, atomic contexts).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Recursive mutexes:</strong> A regular mutex deadlocks if the same thread tries to acquire it twice. A recursive mutex (PTHREAD_MUTEX_RECURSIVE) allows the same thread to acquire it multiple times — it counts acquisitions and requires the same number of releases. Used in recursive functions that need locking. But they can hide design flaws — usually avoid if possible.
              </LearnMore>

              <NavButtons prev={function() { setActive('hardware') }} prevLabel="← 6.4 Hardware" next={function() { setActive('semaphores') }} nextLabel="6.6 Semaphores →" />
            </div>
          )}

          {active === 'semaphores' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.6 Semaphores</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>A more powerful synchronization tool that can solve a wider range of problems.</p>

              <InfoBox color="#3b82f6">
                A <strong>semaphore</strong> S is an integer variable accessed only via two atomic operations: <strong>wait()</strong> (originally P()) and <strong>signal()</strong> (originally V()). More powerful than mutex — can control access to a pool of resources, not just one.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Semaphore Operations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>wait(S) — also called P()</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>wait(S) {'{'}</div>
                    <div style={{ paddingLeft: 20 }}>while (S {'<'}= 0)</div>
                    <div style={{ paddingLeft: 40, color: '#8b949e' }}>; // busy wait</div>
                    <div style={{ paddingLeft: 20 }}>S--;</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>signal(S) — also called V()</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>signal(S) {'{'}</div>
                    <div style={{ paddingLeft: 20 }}>S++;</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Two Types of Semaphores</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Counting Semaphore</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Integer value can range over an unrestricted domain. Used to control access to a resource with multiple instances (e.g., 5 database connections).
                  </p>
                  <div style={{ fontSize: 12, color: '#3b82f6' }}>Init to: number of available resources</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Binary Semaphore (Mutex)</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Value can only be 0 or 1. Same as a mutex lock. Used for mutual exclusion.
                  </p>
                  <div style={{ fontSize: 12, color: '#8b5cf6' }}>Init to: 1 (available)</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Semaphore Usage — Ordering</h3>
              <InfoBox color="#f59e0b">
                Semaphores can enforce <strong>ordering</strong> between statements. If S1 must happen before S2 across two processes, create a semaphore synch=0. P1 executes S1 then signal(synch). P2 executes wait(synch) then S2. S2 cannot proceed until S1 is done.
              </InfoBox>
              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Semaphore synch initialized to 0 */</div>
                  <div></div>
                  <div style={{ color: '#3b82f6' }}>P1:                    P2:</div>
                  <div>S1;                    wait(synch);</div>
                  <div>signal(synch);         S2;</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* S2 will always execute AFTER S1 */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Semaphore with No Busy Waiting</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Instead of busy waiting, associate a <strong style={{ color: 'var(--text-primary)' }}>waiting queue</strong> with each semaphore. When wait() finds S {'<'}= 0, add process to waiting queue and <strong>block</strong> (sleep). When signal() runs, remove a process from queue and <strong>wakeup</strong>.
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Semaphore with waiting queue */</div>
                  <div>typedef struct {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>int value;</div>
                  <div style={{ paddingLeft: 20 }}>struct process *list; <span style={{ color: '#8b949e' }}>/* waiting queue */</span></div>
                  <div>{'}'} semaphore;</div>
                  <div></div>
                  <div>wait(semaphore *S) {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>S-{'>'} value--;</div>
                  <div style={{ paddingLeft: 20 }}>if (S-{'>'} value {'<'} 0) {'{'}</div>
                  <div style={{ paddingLeft: 40 }}>add this process to S-{'>'} list;</div>
                  <div style={{ paddingLeft: 40, color: '#ef4444' }}>block(); <span style={{ color: '#8b949e' }}>/* sleep */</span></div>
                  <div style={{ paddingLeft: 20 }}>{'}'}</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>signal(semaphore *S) {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>S-{'>'} value++;</div>
                  <div style={{ paddingLeft: 20 }}>if (S-{'>'} value {'<'}= 0) {'{'}</div>
                  <div style={{ paddingLeft: 40 }}>remove process P from S-{'>'} list;</div>
                  <div style={{ paddingLeft: 40, color: '#10b981' }}>wakeup(P); <span style={{ color: '#8b949e' }}>/* resume */</span></div>
                  <div style={{ paddingLeft: 20 }}>{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Interactive Semaphore Simulator</h3>
              <SemaphoreSimulator />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Problems with Semaphores</h3>
              <InfoBox color="#ef4444">
                Incorrect use leads to bugs that are hard to detect:
                <br />• <strong>signal(mutex) ... wait(mutex)</strong> — wrong order, mutual exclusion violated
                <br />• <strong>wait(mutex) ... wait(mutex)</strong> — deadlock, process blocks on its own lock
                <br />• <strong>Omitting wait() or signal()</strong> — either no mutual exclusion or permanent blocking
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>POSIX semaphores:</strong> POSIX provides named semaphores (sem_open, can be shared between unrelated processes) and unnamed semaphores (sem_init, shared via shared memory or between threads). sem_wait() = wait(S), sem_post() = signal(S). Named semaphores appear as files in /dev/shm on Linux.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Semaphore value can be negative:</strong> In the implementation with waiting queue, the semaphore value can go negative. The magnitude of a negative value represents the number of processes waiting. If S=-3, three processes are blocked on this semaphore. This is useful for monitoring system load.
              </LearnMore>

              <NavButtons prev={function() { setActive('mutex') }} prevLabel="← 6.5 Mutex" next={function() { setActive('monitors') }} nextLabel="6.7 Monitors →" />
            </div>
          )}

          {active === 'monitors' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.7 Monitors</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>A high-level abstraction that makes synchronization safer and easier.</p>

              <InfoBox color="#8b5cf6">
                A <strong>monitor</strong> is a high-level abstraction providing a convenient and effective mechanism for process synchronization. It is an abstract data type where <strong>only one process may be active within the monitor at a time</strong> — mutual exclusion is automatic.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Monitor Structure</h3>
              <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div>monitor monitor-name {'{'}</div>
                  <div style={{ paddingLeft: 20, color: '#8b949e' }}>// shared variable declarations</div>
                  <div style={{ paddingLeft: 20, color: '#3b82f6' }}>condition x, y; // condition variables</div>
                  <div></div>
                  <div style={{ paddingLeft: 20 }}>function P1 (...) {'{'}</div>
                  <div style={{ paddingLeft: 40, color: '#8b949e' }}>// only one process active at a time</div>
                  <div style={{ paddingLeft: 20 }}>{'}'}</div>
                  <div></div>
                  <div style={{ paddingLeft: 20 }}>function P2 (...) {'{'} ... {'}'}</div>
                  <div></div>
                  <div style={{ paddingLeft: 20 }}>initialization_code (...) {'{'} ... {'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Condition Variables</h3>
              <InfoBox color="#3b82f6">
                Monitors use <strong>condition variables</strong> to allow processes to wait for specific conditions. Two operations:
                <br /><br />
                <strong>x.wait()</strong> — suspends the calling process. It releases the monitor lock and waits until x.signal() is called.
                <br />
                <strong>x.signal()</strong> — resumes ONE suspended process waiting on x. If no process is waiting, it has no effect.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>x.wait()</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Suspends the calling process</li>
                    <li>Releases the monitor lock</li>
                    <li>Process placed in condition queue</li>
                    <li>Another process can now enter monitor</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>x.signal()</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Resumes ONE waiting process</li>
                    <li>If none waiting — no effect (differs from semaphore!)</li>
                    <li>Signaling process must wait or exit</li>
                    <li>Implementation choice: signal-and-wait vs signal-and-continue</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Monitor vs Semaphore</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Semaphore (error-prone)</div>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div style={{ color: '#8b949e' }}>/* programmer must do this */</div>
                    <div>wait(mutex);</div>
                    <div style={{ color: '#ef4444' }}>/* critical section */</div>
                    <div>signal(mutex);</div>
                    <div style={{ color: '#8b949e' }}>/* easy to forget signal! */</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Monitor (automatic)</div>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div style={{ color: '#8b949e' }}>/* mutual exclusion automatic */</div>
                    <div>monitor M {'{'}</div>
                    <div style={{ paddingLeft: 16 }}>function f() {'{'}</div>
                    <div style={{ paddingLeft: 32, color: '#10b981' }}>/* only 1 process here */</div>
                    <div style={{ paddingLeft: 16 }}>{'}'}</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Java Synchronized — Monitor in Practice</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Java implements monitors through <strong style={{ color: 'var(--text-primary)' }}>synchronized</strong> methods. Every Java object has an associated lock. If a method is synchronized, a calling thread must own the object's lock. Locks are released when the method exits.
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div>public class BoundedBuffer{'<'}E{'>'} {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>private static final int BUFFER_SIZE = 5;</div>
                  <div style={{ paddingLeft: 20 }}>private int count, in, out;</div>
                  <div style={{ paddingLeft: 20 }}>private Object[] buffer = new Object[BUFFER_SIZE];</div>
                  <div></div>
                  <div style={{ paddingLeft: 20, color: '#f59e0b' }}>public synchronized void insert(E item) {'{'}</div>
                  <div style={{ paddingLeft: 40 }}>while (count == BUFFER_SIZE)</div>
                  <div style={{ paddingLeft: 60, color: '#3b82f6' }}>try {'{'} wait(); {'}'} catch (InterruptedException ie) {'{'} {'}'}</div>
                  <div style={{ paddingLeft: 40 }}>buffer[in] = item;</div>
                  <div style={{ paddingLeft: 40 }}>in = (in+1) % BUFFER_SIZE;</div>
                  <div style={{ paddingLeft: 40 }}>count++;</div>
                  <div style={{ paddingLeft: 40, color: '#10b981' }}>notify();</div>
                  <div style={{ paddingLeft: 20 }}>{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Signal-and-wait vs signal-and-continue:</strong> When P calls x.signal() and Q is waiting: Signal-and-wait — P waits until Q either leaves the monitor or waits for another condition. Signal-and-continue — Q waits until P either leaves or waits. Java uses signal-and-continue. Concurrent Pascal uses a compromise: P immediately leaves the monitor, Q is resumed.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Monitor implementation using semaphores:</strong> Variables: mutex (=1) for mutual exclusion, next (=0) for signaling threads, next_count (=0). Each function f is wrapped: wait(mutex); body of f; if (next_count{'>'} 0) signal(next) else signal(mutex). For condition variable x: x_sem (=0), x_count (=0). x.wait(): x_count++; if (next_count{'>'} 0) signal(next) else signal(mutex); wait(x_sem); x_count--. x.signal(): if (x_count{'>'} 0) {next_count++; signal(x_sem); wait(next); next_count--}.
              </LearnMore>

              <NavButtons prev={function() { setActive('semaphores') }} prevLabel="← 6.6 Semaphores" next={function() { setActive('liveness') }} nextLabel="6.8 Liveness →" />
            </div>
          )}

          {active === 'liveness' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>6.8 Liveness</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>When synchronization goes wrong — deadlock, starvation, and priority inversion.</p>

              <InfoBox color="#ef4444">
                <strong>Liveness</strong> refers to a set of properties a system must satisfy to ensure processes make progress. Failing liveness means processes are stuck — either forever or for an unacceptably long time.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Deadlock</h3>
              <InfoBox color="#ef4444">
                <strong>Deadlock</strong>: Two or more processes are waiting indefinitely for an event that can only be caused by one of the waiting processes. Nobody can proceed — permanent freeze.
              </InfoBox>
              <div style={{ background: '#0d1117', border: '1px solid #ef444444', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Classic deadlock with two semaphores S and Q (both initialized to 1):</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3b82f6', lineHeight: 1.8 }}>
                    <div>P0:</div>
                    <div>wait(S);  ← gets S</div>
                    <div>wait(Q);  ← BLOCKED (P1 has Q)</div>
                    <div>...</div>
                    <div>signal(S);</div>
                    <div>signal(Q);</div>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#8b5cf6', lineHeight: 1.8 }}>
                    <div>P1:</div>
                    <div>wait(Q);  ← gets Q</div>
                    <div>wait(S);  ← BLOCKED (P0 has S)</div>
                    <div>...</div>
                    <div>signal(Q);</div>
                    <div>signal(S);</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#ef4444', fontWeight: 700 }}>
                  P0 waits for P1 to release Q. P1 waits for P0 to release S. Neither can proceed — DEADLOCK!
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Starvation</h3>
              <InfoBox color="#f59e0b">
                <strong>Starvation</strong> (indefinite blocking): A process may never be removed from the semaphore queue in which it is suspended. Example: LIFO (last-in-first-out) semaphore queue — the oldest waiting process never gets to run because newer ones always jump ahead.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Priority Inversion</h3>
              <InfoBox color="#8b5cf6">
                <strong>Priority Inversion</strong>: A scheduling problem where a lower-priority process holds a lock needed by a higher-priority process. A medium-priority process preempts the low-priority one, indirectly blocking the high-priority process — effectively M has higher priority than H!
              </InfoBox>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Priority Inversion Scenario:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { n: 1, color: '#ef4444', text: 'P3 (low priority) acquires resource R' },
                    { n: 2, color: '#3b82f6', text: 'P1 (high priority) needs R — must wait for P3' },
                    { n: 3, color: '#f59e0b', text: 'P2 (medium priority) preempts P3 (P2 > P3)' },
                    { n: 4, color: '#ef4444', text: 'P2 runs to completion — P3 still has R' },
                    { n: 5, color: '#ef4444', text: 'P3 finally runs and releases R' },
                    { n: 6, color: '#3b82f6', text: 'P1 finally gets R — but waited for P2 which has lower priority!' },
                  ].map(function(s) {
                    return (
                      <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.text}</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 16, background: '#8b5cf618', border: '1px solid #8b5cf644', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#8b5cf6' }}>Solution: Priority Inheritance Protocol</strong> — P3 temporarily inherits P1's priority while it holds the resource. P3 now has high priority, runs quickly, releases R, and P1 gets it. P3 returns to its original low priority.
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Mars Pathfinder priority inversion (1997):</strong> The spacecraft experienced repeated resets after landing. Root cause: priority inversion between a high-priority meteorological data task and a low-priority communications task, with a medium-priority information bus task blocking the low-priority task. The fix: enable priority inheritance in VxWorks (the RTOS). The same bug existed in the ground testing software but was never triggered because conditions were different. This is why priority inversion is taken seriously in real-time systems.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Deadlock vs Livelock:</strong> Deadlock — processes are blocked, not running at all. Livelock — processes are running but not making progress (like two people in a corridor both stepping aside the same way). Livelock is harder to detect than deadlock. Starvation — one process never makes progress while others do. All three violate liveness but in different ways.
              </LearnMore>

              <NavButtons prev={function() { setActive('monitors') }} prevLabel="← 6.7 Monitors" next={function() { setActive('simulator') }} nextLabel="Simulator →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Synchronization Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interact with race conditions, Peterson's solution, and semaphores.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Race Condition Demo</h3>
              <RaceConditionVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Peterson's Solution Step-by-Step</h3>
              <PetersonVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Semaphore Operations</h3>
              <SemaphoreSimulator />

              <NavButtons prev={function() { setActive('liveness') }} prevLabel="← 6.8 Liveness" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Synchronization in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Write and run synchronization code. Copy and run in any online compiler.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>Lab 1 — Python Threading and Locks</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Python's threading module shows both the race condition problem and the mutex solution.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Java Synchronized</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Java's synchronized keyword implements monitors automatically.
              </p>
              <CodeEditor defaultLang="java" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#06b6d4' }}>Lab 3 — Explore Synchronization in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['cat /proc/locks',          'Show kernel file locks currently held'],
                  ['ls /dev/shm',              'List shared memory segments'],
                  ['ipcs -s',                  'List all semaphore sets in system'],
                  ['ipcs -m',                  'List shared memory segments'],
                  ['ps aux | grep Z',          'Find zombie processes'],
                  ['cat /proc/1/fdinfo/0',     'File descriptor info for process 1'],
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

          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 6.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#ef4444' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#ef4444', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 6!' : quiz.score >= 4 ? 'Good work! Review the sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/7' }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 7 →</button>
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