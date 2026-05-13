import { useState, useEffect, useRef } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'bounded',    title: '7.1 Bounded-Buffer',        icon: '📦' },
  { id: 'readers',    title: '7.2 Readers-Writers',       icon: '📖' },
  { id: 'dining',     title: '7.3 Dining Philosophers',   icon: '🍽️' },
  { id: 'posix',      title: '7.4 POSIX Sync',            icon: '🐧' },
  { id: 'java',       title: '7.5 Java Sync',             icon: '☕' },
  { id: 'windows',    title: '7.6 Windows & Linux Sync',  icon: '🖥️' },
  { id: 'alt',        title: '7.7 Alternative Approaches',icon: '🔬' },
  { id: 'simulator',  title: '🎮 Simulators',             icon: '🎮' },
  { id: 'lab',        title: '💻 Lab',                    icon: '💻' },
  { id: 'quiz',       title: '🧠 Quiz',                   icon: '🧠' },
]

const QUIZ = [
  {
    q: 'In the Bounded-Buffer problem, what does the semaphore "empty" represent?',
    options: [
      'Number of full slots in the buffer',
      'Number of empty slots available for the producer',
      'Whether the buffer mutex is locked',
      'Number of consumers waiting'
    ],
    answer: 1,
    explanation: 'The "empty" semaphore is initialized to n (buffer size) and represents the number of empty slots. The producer calls wait(empty) before inserting — if no empty slots exist, it blocks. The consumer calls signal(empty) after removing an item.'
  },
  {
    q: 'In the Readers-Writers problem, why does the first reader call wait(rw_mutex)?',
    options: [
      'To count the number of readers',
      'To block writers from accessing the data while any reader is reading',
      'To signal other readers they can enter',
      'To lock the read_count variable'
    ],
    answer: 1,
    explanation: 'The first reader (read_count becomes 1) calls wait(rw_mutex) to block any writers. As long as at least one reader is reading, no writer can access the data. The last reader (read_count becomes 0) calls signal(rw_mutex) to allow writers in.'
  },
  {
    q: 'What is the main problem with the simple semaphore solution to the Dining Philosophers?',
    options: [
      'Philosophers eat too slowly',
      'It can cause deadlock if all philosophers pick up their left chopstick simultaneously',
      'It uses too many semaphores',
      'Philosophers cannot think and eat at the same time'
    ],
    answer: 1,
    explanation: 'If all 5 philosophers pick up their left chopstick simultaneously, each holds one chopstick and waits for the right one (held by their neighbor). Nobody can proceed — circular wait — deadlock!'
  },
  {
    q: 'How does the monitor solution to Dining Philosophers prevent deadlock?',
    options: [
      'It limits the number of philosophers to 4',
      'Philosophers only pick up chopsticks when BOTH are available, using state tracking',
      'It uses a global timer to force philosophers to put down chopsticks',
      'It assigns priorities to philosophers'
    ],
    answer: 1,
    explanation: 'The monitor tracks each philosopher\'s state (THINKING, HUNGRY, EATING). A philosopher only transitions to EATING if both neighbors are NOT eating. If chopsticks are unavailable, the philosopher calls self[i].wait() and blocks — it never holds one chopstick while waiting for the other, preventing circular wait.'
  },
  {
    q: 'What is the difference between POSIX named and unnamed semaphores?',
    options: [
      'Named semaphores are faster',
      'Named semaphores can be shared between unrelated processes; unnamed cannot',
      'Unnamed semaphores have higher initial values',
      'Named semaphores only work on Linux'
    ],
    answer: 1,
    explanation: 'Named semaphores (sem_open) appear as files in /dev/shm and can be accessed by any process that knows the name — even unrelated processes. Unnamed semaphores (sem_init) are created in memory and can only be shared between threads of the same process or related processes via shared memory.'
  },
  {
    q: 'What does the Java ReentrantLock\'s finally clause ensure?',
    options: [
      'The lock is acquired successfully',
      'The lock is always released even if an exception occurs in the try block',
      'The critical section runs atomically',
      'Other threads are notified when the lock is released'
    ],
    answer: 1,
    explanation: 'The finally clause in Java\'s try-finally block guarantees the lock is released even if an exception is thrown inside the critical section. Without it, an exception could leave the lock permanently acquired — causing deadlock for all threads waiting on it.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #06b6d455', color: '#06b6d4', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(6,182,212,0.06)', border: '1px solid #06b6d433', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function BoundedBufferSim() {
  const [bufferSize] = useState(5)
  const [buffer, setBuffer] = useState(Array(5).fill(null))
  const [inPtr, setInPtr] = useState(0)
  const [outPtr, setOutPtr] = useState(0)
  const [full, setFull] = useState(0)
  const [empty, setEmpty] = useState(5)
  const [log, setLog] = useState([])
  const [itemCount, setItemCount] = useState(1)

  function addLog(msg, color) {
    setLog(function(l) { return [...l.slice(-8), { msg, color }] })
  }

  function produce() {
    if (empty === 0) {
      addLog('Producer: wait(empty)=0 — BLOCKED! Buffer is full.', '#ef4444')
      return
    }
    const item = 'Item' + itemCount
    setItemCount(function(c) { return c + 1 })
    setBuffer(function(b) {
      const nb = [...b]
      nb[inPtr] = item
      return nb
    })
    setInPtr(function(p) { return (p + 1) % bufferSize })
    setEmpty(function(e) { return e - 1 })
    setFull(function(f) { return f + 1 })
    addLog('Producer: wait(empty) — produced ' + item + '. empty=' + (empty - 1) + ' full=' + (full + 1), '#10b981')
  }

  function consume() {
    if (full === 0) {
      addLog('Consumer: wait(full)=0 — BLOCKED! Buffer is empty.', '#ef4444')
      return
    }
    const item = buffer[outPtr]
    setBuffer(function(b) {
      const nb = [...b]
      nb[outPtr] = null
      return nb
    })
    setOutPtr(function(p) { return (p + 1) % bufferSize })
    setFull(function(f) { return f - 1 })
    setEmpty(function(e) { return e + 1 })
    addLog('Consumer: wait(full) — consumed ' + item + '. full=' + (full - 1) + ' empty=' + (empty + 1), '#3b82f6')
  }

  function reset() {
    setBuffer(Array(5).fill(null))
    setInPtr(0); setOutPtr(0)
    setFull(0); setEmpty(5)
    setLog([]); setItemCount(1)
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Bounded-Buffer Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Watch producer and consumer interact using semaphores. Buffer size = 5.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'mutex', value: 1, color: '#f59e0b', desc: 'Binary semaphore' },
          { label: 'full', value: full, color: '#10b981', desc: 'Items in buffer' },
          { label: 'empty', value: empty, color: '#3b82f6', desc: 'Empty slots' },
        ].map(function(s) {
          return (
            <div key={s.label} style={{ background: 'var(--bg-secondary)', border: '2px solid ' + s.color + '44', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>semaphore: {s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.desc}</div>
            </div>
          )
        })}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Buffer (circular):</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {buffer.map(function(item, i) {
            const isIn = i === inPtr
            const isOut = i === outPtr
            return (
              <div key={i} style={{ flex: 1, background: item ? '#10b98122' : 'var(--bg-secondary)', border: '2px solid ' + (item ? '#10b981' : 'var(--border)'), borderRadius: 8, padding: '10px 4px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>[{i}]</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: item ? '#10b981' : 'var(--text-muted)' }}>{item || '—'}</div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                  {isIn && <span style={{ fontSize: 9, background: '#f59e0b', color: '#000', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>IN</span>}
                  {isOut && <span style={{ fontSize: 9, background: '#3b82f6', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>OUT</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={produce} style={{ background: '#10b98122', color: '#10b981', border: '1px solid #10b98144', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          Producer: Produce Item
        </button>
        <button onClick={consume} style={{ background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f644', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          Consumer: Consume Item
        </button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, minHeight: 80, maxHeight: 160, overflowY: 'auto' }}>
        {log.length === 0
          ? <div style={{ color: '#484f58', fontSize: 13 }}>Click Produce or Consume to start...</div>
          : log.map(function(line, i) {
            return <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: line.color, lineHeight: 1.8 }}>{line.msg}</div>
          })}
      </div>
    </div>
  )
}

function DiningPhilosophersSim() {
  const [states, setStates] = useState(['thinking', 'thinking', 'thinking', 'thinking', 'thinking'])
  const [chopsticks, setChopsticks] = useState([true, true, true, true, true])
  const [log, setLog] = useState([])
  const [deadlock, setDeadlock] = useState(false)
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
  const NAMES = ['Aristotle', 'Plato', 'Socrates', 'Descartes', 'Kant']

  function addLog(msg, color) {
    setLog(function(l) { return [...l.slice(-8), { msg, color }] })
  }

  function tryEat(i) {
    const left = i
    const right = (i + 1) % 5
    if (states[i] === 'eating') {
      setStates(function(s) { const ns = [...s]; ns[i] = 'thinking'; return ns })
      setChopsticks(function(c) { const nc = [...c]; nc[left] = true; nc[right] = true; return nc })
      addLog(NAMES[i] + ' finished eating — put down chopsticks ' + left + ' and ' + right, COLORS[i])
      setDeadlock(false)
      return
    }
    if (states[i] === 'thinking') {
      setStates(function(s) { const ns = [...s]; ns[i] = 'hungry'; return ns })
      addLog(NAMES[i] + ' is HUNGRY — trying to pick up chopsticks', COLORS[i])
      return
    }
    if (states[i] === 'hungry') {
      if (chopsticks[left] && chopsticks[right]) {
        setChopsticks(function(c) { const nc = [...c]; nc[left] = false; nc[right] = false; return nc })
        setStates(function(s) { const ns = [...s]; ns[i] = 'eating'; return ns })
        addLog(NAMES[i] + ' picked up chopsticks ' + left + ' + ' + right + ' — now EATING!', COLORS[i])
        setDeadlock(false)
      } else if (!chopsticks[left] && !chopsticks[right]) {
        addLog(NAMES[i] + ': BOTH chopsticks ' + left + ' and ' + right + ' are taken — WAITING', COLORS[i])
      } else if (!chopsticks[left]) {
        addLog(NAMES[i] + ': Left chopstick ' + left + ' is taken — WAITING', COLORS[i])
      } else {
        addLog(NAMES[i] + ': Right chopstick ' + right + ' is taken — WAITING', COLORS[i])
      }
    }
  }

  function simulateDeadlock() {
    setStates(['hungry', 'hungry', 'hungry', 'hungry', 'hungry'])
    setChopsticks([false, false, false, false, false])
    setDeadlock(true)
    addLog('DEADLOCK! All philosophers hold left chopstick, waiting for right.', '#ef4444')
  }

  function reset() {
    setStates(['thinking', 'thinking', 'thinking', 'thinking', 'thinking'])
    setChopsticks([true, true, true, true, true])
    setLog([])
    setDeadlock(false)
  }

  const stateIcon = { thinking: '💭', hungry: '😋', eating: '🍜' }
  const stateColor = { thinking: '#6e7681', hungry: '#f59e0b', eating: '#10b981' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Dining Philosophers Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Click a philosopher to cycle: thinking → hungry → try to eat → put down. Try the Deadlock button!
      </p>

      {deadlock && (
        <div style={{ background: '#ef444418', border: '1px solid #ef444444', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 14, color: '#ef4444', fontWeight: 700, textAlign: 'center' }}>
          DEADLOCK! Each philosopher holds one chopstick and waits for the other — circular wait!
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {states.map(function(state, i) {
          return (
            <div key={i} onClick={function() { tryEat(i) }} style={{ background: stateColor[state] + '22', border: '2px solid ' + (deadlock ? '#ef4444' : stateColor[state]), borderRadius: 12, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', minWidth: 100, transition: 'all 0.3s' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stateIcon[state]}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: COLORS[i], marginBottom: 4 }}>P{i}: {NAMES[i].slice(0, 6)}</div>
              <div style={{ fontSize: 11, color: stateColor[state], fontWeight: 600, textTransform: 'uppercase' }}>{state}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                CS {i} {deadlock ? '🔴' : chopsticks[i] ? '✅' : '🔴'} | CS {(i + 1) % 5} {deadlock ? '🔴' : chopsticks[(i + 1) % 5] ? '✅' : '🔴'}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Chopsticks:</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {chopsticks.map(function(available, i) {
            return (
              <div key={i} style={{ flex: 1, background: available ? '#10b98118' : '#ef444418', border: '1px solid ' + (available ? '#10b981' : '#ef4444'), borderRadius: 8, padding: '8px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>{available ? '🥢' : '🔴'}</div>
                <div style={{ fontSize: 10, color: available ? '#10b981' : '#ef4444', fontWeight: 700 }}>CS{i}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{available ? 'free' : 'taken'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={simulateDeadlock} style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          Simulate Deadlock
        </button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, minHeight: 80, maxHeight: 140, overflowY: 'auto' }}>
        {log.length === 0
          ? <div style={{ color: '#484f58', fontSize: 13 }}>Click a philosopher to start...</div>
          : log.map(function(line, i) {
            return <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: line.color, lineHeight: 1.8 }}>{line.msg}</div>
          })}
      </div>
    </div>
  )
}

function ReadersWritersSim() {
  const [readers, setReaders] = useState(0)
  const [rwMutex, setRwMutex] = useState(true)
  const [mutex, setMutex] = useState(true)
  const [writerActive, setWriterActive] = useState(false)
  const [log, setLog] = useState([])

  function addLog(msg, color) {
    setLog(function(l) { return [...l.slice(-8), { msg, color }] })
  }

  function readerEnter() {
    if (!mutex) { addLog('Reader: wait(mutex) — mutex busy, BLOCKED', '#ef4444'); return }
    if (readers === 0) {
      if (!rwMutex) { addLog('Reader: First reader — wait(rw_mutex) BLOCKED (writer active)', '#ef4444'); return }
      setRwMutex(false)
      addLog('Reader 1: First reader — acquired rw_mutex, blocking writers', '#3b82f6')
    } else {
      addLog('Reader ' + (readers + 1) + ': Not first reader — skips rw_mutex wait', '#3b82f6')
    }
    setReaders(function(r) { return r + 1 })
    addLog('Reader ' + (readers + 1) + ' entered — read_count=' + (readers + 1), '#3b82f6')
  }

  function readerExit() {
    if (readers === 0) { addLog('No readers to exit!', '#ef4444'); return }
    const newCount = readers - 1
    setReaders(newCount)
    if (newCount === 0) {
      setRwMutex(true)
      addLog('Last reader exited — released rw_mutex, writers can enter', '#10b981')
    } else {
      addLog('Reader exited — read_count=' + newCount + ', still ' + newCount + ' readers active', '#3b82f6')
    }
  }

  function writerEnter() {
    if (!rwMutex) { addLog('Writer: wait(rw_mutex) — BLOCKED! ' + (readers > 0 ? readers + ' readers active' : 'another writer active'), '#ef4444'); return }
    setRwMutex(false)
    setWriterActive(true)
    addLog('Writer: acquired rw_mutex — now writing (all readers blocked)', '#8b5cf6')
  }

  function writerExit() {
    if (!writerActive) { addLog('No writer to exit!', '#ef4444'); return }
    setRwMutex(true)
    setWriterActive(false)
    addLog('Writer: released rw_mutex — readers and writers can compete', '#10b981')
  }

  function reset() {
    setReaders(0); setRwMutex(true); setMutex(true)
    setWriterActive(false); setLog([])
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Readers-Writers Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Multiple readers can read simultaneously. A writer needs exclusive access.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: readers > 0 ? '#3b82f618' : 'var(--bg-secondary)', border: '2px solid ' + (readers > 0 ? '#3b82f6' : 'var(--border)'), borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Active Readers</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#3b82f6' }}>{readers}</div>
        </div>
        <div style={{ background: writerActive ? '#8b5cf618' : 'var(--bg-secondary)', border: '2px solid ' + (writerActive ? '#8b5cf6' : 'var(--border)'), borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Writer</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>{writerActive ? 'WRITING' : 'idle'}</div>
        </div>
        <div style={{ background: rwMutex ? '#10b98118' : '#ef444418', border: '2px solid ' + (rwMutex ? '#10b981' : '#ef4444'), borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>rw_mutex</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: rwMutex ? '#10b981' : '#ef4444', marginTop: 4 }}>{rwMutex ? 'FREE' : 'LOCKED'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={readerEnter} style={{ background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f644', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Reader Enter</button>
        <button onClick={readerExit} style={{ background: '#3b82f611', color: '#3b82f6', border: '1px solid #3b82f633', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Reader Exit</button>
        <button onClick={writerEnter} style={{ background: '#8b5cf622', color: '#8b5cf6', border: '1px solid #8b5cf644', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Writer Enter</button>
        <button onClick={writerExit} style={{ background: '#8b5cf611', color: '#8b5cf6', border: '1px solid #8b5cf633', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Writer Exit</button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, minHeight: 80, maxHeight: 140, overflowY: 'auto' }}>
        {log.length === 0
          ? <div style={{ color: '#484f58', fontSize: 13 }}>Click Reader/Writer Enter to start...</div>
          : log.map(function(line, i) {
            return <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: line.color, lineHeight: 1.8 }}>{line.msg}</div>
          })}
      </div>
    </div>
  )
}

export default function Chapter7() {
  const [active, setActive] = useState('bounded')
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

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #06b6d444', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#06b6d4', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 7</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🍽️</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Synchronization Examples</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          Classical synchronization problems — Bounded Buffer, Readers-Writers, and Dining Philosophers — plus POSIX, Java, Windows, and Linux sync tools.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Bounded Buffer Sim', 'Readers-Writers Sim', 'Dining Philosophers', 'POSIX API', 'Java Sync'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(6,182,212,0.1)', border: '1px solid #06b6d433', color: '#06b6d4', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#06b6d4' : 'var(--text-secondary)', background: active === s.id ? 'rgba(6,182,212,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #06b6d4' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'bounded' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.1 Bounded-Buffer Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The classic producer-consumer problem solved with three semaphores.</p>

              <InfoBox color="#06b6d4">
                The Bounded-Buffer problem uses <strong>n buffers</strong>, each holding one item. Three semaphores coordinate access:
                <br />• <strong>mutex</strong> — initialized to 1 (mutual exclusion for buffer access)
                <br />• <strong>full</strong> — initialized to 0 (counts full slots)
                <br />• <strong>empty</strong> — initialized to n (counts empty slots)
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Producer and Consumer Code</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Producer Process</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>while (true) {'{'}</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* produce item */</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(empty);</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* add to buffer */</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(full);</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Consumer Process</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>while (true) {'{'}</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(full);</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* remove from buffer */</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(empty);</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* consume item */</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Why This Order Matters</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { q: 'Why wait(empty) before wait(mutex)?', a: 'If producer calls wait(mutex) first while buffer is full, it holds mutex and blocks on wait(empty). Consumer needs mutex to remove an item and signal(empty) — but mutex is held by blocked producer. DEADLOCK!' },
                  { q: 'Why signal(mutex) before signal(full)?', a: 'Release mutual exclusion as soon as buffer manipulation is done. Holding mutex while calling signal(full) is unnecessary and could delay the other side from accessing the buffer.' },
                ].map(function(item) {
                  return (
                    <div key={item.q} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: 13, marginBottom: 6 }}>{item.q}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.a}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Simulator</h3>
              <BoundedBufferSim />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Real-world applications:</strong> The bounded-buffer pattern appears everywhere: network packet buffers (producer = NIC, consumer = TCP stack), print spoolers (producer = applications, consumer = printer driver), pipe implementation in UNIX (the kernel buffer between writer and reader processes), and audio/video streaming buffers.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Buffer sizing:</strong> Too small: producer frequently blocks, throughput drops. Too large: memory waste, increased latency. Optimal size depends on the relative speeds of producer and consumer and the variance in their rates. Network device drivers typically use ring buffers of 256-4096 entries.
              </LearnMore>

              <NavButtons next={function() { setActive('readers') }} nextLabel="7.2 Readers-Writers →" />
            </div>
          )}

          {active === 'readers' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.2 Readers-Writers Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Multiple readers can read simultaneously — but writers need exclusive access.</p>

              <InfoBox color="#3b82f6">
                A data set is shared among concurrent processes. <strong>Readers</strong> only read — they do NOT modify data. <strong>Writers</strong> can both read and write. Multiple readers can read simultaneously, but only ONE writer can access the data at a time.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Shared Data and Semaphores</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { name: 'rw_mutex', init: '1', color: '#8b5cf6', desc: 'Mutual exclusion for writers. First reader acquires it, last reader releases it.' },
                  { name: 'mutex', init: '1', color: '#f59e0b', desc: 'Mutual exclusion for updating read_count. Protects the counter itself.' },
                  { name: 'read_count', init: '0', color: '#3b82f6', desc: 'Tracks how many readers are currently reading. If 0 and writer waiting — writer can enter.' },
                ].map(function(v) {
                  return (
                    <div key={v.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + v.color + '44', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, color: v.color, fontWeight: 700, marginBottom: 4 }}>{v.name} = {v.init}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{v.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Writer and Reader Code</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Writer Process</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>while (true) {'{'}</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(rw_mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* writing */</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(rw_mutex);</div>
                    <div>{'}'}</div>
                  </div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Reader Process</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>while (true) {'{'}</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(mutex);</div>
                    <div style={{ paddingLeft: 16 }}>read_count++;</div>
                    <div style={{ paddingLeft: 16 }}>if (read_count == 1)</div>
                    <div style={{ paddingLeft: 32, color: '#f59e0b' }}>wait(rw_mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* reading */</div>
                    <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(mutex);</div>
                    <div style={{ paddingLeft: 16 }}>read_count--;</div>
                    <div style={{ paddingLeft: 16 }}>if (read_count == 0)</div>
                    <div style={{ paddingLeft: 32, color: '#10b981' }}>signal(rw_mutex);</div>
                    <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(mutex);</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Variations and Starvation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>First Variation (above)</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>No reader is kept waiting unless a writer has already been given permission to use the shared object. Readers have priority. Writers may starve if readers keep arriving.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Second Variation</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Once a writer is ready, it performs its write as soon as possible. Writers have priority. New readers must wait if a writer is waiting. Readers may starve.</p>
                </div>
              </div>

              <InfoBox color="#f59e0b">
                Both variations may involve starvation. The problem is solved on some systems by the kernel providing <strong>reader-writer locks</strong> — a single API that handles the complexity internally with fairness guarantees.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Simulator</h3>
              <ReadersWritersSim />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Reader-writer locks in practice:</strong> POSIX provides pthread_rwlock_t with pthread_rwlock_rdlock() for readers and pthread_rwlock_wrlock() for writers. Linux kernel uses rwlock_t (spinlock version) and rw_semaphore (sleeping version). Java has ReentrantReadWriteLock. These are used extensively in database systems — multiple transactions can read a record simultaneously, but updates require exclusive access.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>RCU (Read-Copy-Update):</strong> Linux kernel's preferred synchronization for read-heavy workloads. Readers never block — they run locklessly. Writers create a new copy of the data, update it, then atomically switch the pointer. Old copy is freed after all current readers finish. Extremely fast for reads but complex to implement correctly. Used for routing tables, process lists, and module loading.
              </LearnMore>

              <NavButtons prev={function() { setActive('bounded') }} prevLabel="← 7.1 Bounded-Buffer" next={function() { setActive('dining') }} nextLabel="7.3 Dining Philosophers →" />
            </div>
          )}

          {active === 'dining' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.3 Dining Philosophers Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Five philosophers, five chopsticks — a classic deadlock and starvation scenario.</p>

              <InfoBox color="#f59e0b">
                Five philosophers sit around a table. Each alternates between <strong>thinking</strong> and <strong>eating</strong>. To eat, a philosopher needs <strong>both</strong> left and right chopsticks. There are only 5 chopsticks total — one between each pair of philosophers.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Semaphore Solution</h3>
              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Semaphore chopstick[5] — all initialized to 1</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>while (true) {'{'}</div>
                  <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(chopstick[i]);</div>
                  <div style={{ paddingLeft: 16, color: '#f59e0b' }}>wait(chopstick[(i+1) % 5]);</div>
                  <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* eat for awhile */</div>
                  <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(chopstick[i]);</div>
                  <div style={{ paddingLeft: 16, color: '#10b981' }}>signal(chopstick[(i+1) % 5]);</div>
                  <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* think for awhile */</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <InfoBox color="#ef4444">
                <strong>Problem with this algorithm:</strong> If all 5 philosophers pick up their LEFT chopstick simultaneously, each holds one chopstick and waits for the right one (held by their neighbor). <strong>Circular wait — DEADLOCK!</strong>
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Solutions to Avoid Deadlock</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { sol: 'Allow at most 4 philosophers at the table simultaneously', color: '#3b82f6' },
                  { sol: 'Allow a philosopher to pick up chopsticks only if BOTH are available (pick up in critical section)', color: '#10b981' },
                  { sol: 'Asymmetric solution: odd philosophers pick left then right; even philosophers pick right then left', color: '#8b5cf6' },
                  { sol: 'Monitor solution: philosopher only picks up when BOTH neighbors are not eating', color: '#f59e0b' },
                ].map(function(s, i) {
                  return (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.sol}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Monitor Solution</h3>
              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>monitor DiningPhilosophers {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>enum {'{'} THINKING, HUNGRY, EATING {'}'} state[5];</div>
                  <div style={{ paddingLeft: 16 }}>condition self[5];</div>
                  <div></div>
                  <div style={{ paddingLeft: 16 }}>void pickup(int i) {'{'}</div>
                  <div style={{ paddingLeft: 32 }}>state[i] = HUNGRY;</div>
                  <div style={{ paddingLeft: 32 }}>test(i);</div>
                  <div style={{ paddingLeft: 32 }}>if (state[i] != EATING) self[i].wait;</div>
                  <div style={{ paddingLeft: 16 }}>{'}'}</div>
                  <div></div>
                  <div style={{ paddingLeft: 16 }}>void putdown(int i) {'{'}</div>
                  <div style={{ paddingLeft: 32 }}>state[i] = THINKING;</div>
                  <div style={{ paddingLeft: 32 }}>test((i+4) % 5); test((i+1) % 5);</div>
                  <div style={{ paddingLeft: 16 }}>{'}'}</div>
                  <div></div>
                  <div style={{ paddingLeft: 16 }}>void test(int i) {'{'}</div>
                  <div style={{ paddingLeft: 32 }}>if (state[(i+4)%5] != EATING &amp;&amp;</div>
                  <div style={{ paddingLeft: 48 }}>state[i] == HUNGRY &amp;&amp;</div>
                  <div style={{ paddingLeft: 48 }}>state[(i+1)%5] != EATING) {'{'}</div>
                  <div style={{ paddingLeft: 64 }}>state[i] = EATING;</div>
                  <div style={{ paddingLeft: 64 }}>self[i].signal();</div>
                  <div style={{ paddingLeft: 32 }}>{'}'}</div>
                  <div style={{ paddingLeft: 16 }}>{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <InfoBox color="#10b981">
                The monitor solution ensures <strong>no deadlock</strong> — a philosopher only picks up chopsticks when BOTH are available. However, <strong>starvation is still possible</strong> — a philosopher could wait indefinitely if both neighbors alternate eating.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Simulator</h3>
              <DiningPhilosophersSim />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why Dining Philosophers matters:</strong> It models any situation where multiple processes need multiple exclusive resources. Database transactions needing multiple locks. Processes needing multiple I/O devices. Network routers needing to lock multiple routing table entries. The circular wait condition for deadlock is precisely what the Dining Philosophers illustrates.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Resource ordering (the real fix):</strong> The most practical deadlock prevention for Dining Philosophers is resource ordering. Number all resources 1 to n. Always acquire resources in increasing order. Never acquire a lower-numbered resource if you hold a higher-numbered one. This breaks circular wait completely. The asymmetric solution (odd philosophers pick left first, even pick right first) implements this idea.
              </LearnMore>

              <NavButtons prev={function() { setActive('readers') }} prevLabel="← 7.2 Readers-Writers" next={function() { setActive('posix') }} nextLabel="7.4 POSIX Sync →" />
            </div>
          )}

          {active === 'posix' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.4 POSIX Synchronization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The standard API for synchronization on UNIX, Linux, and macOS.</p>

              <InfoBox color="#10b981">
                The POSIX API provides <strong>mutex locks</strong>, <strong>semaphores</strong>, and <strong>condition variables</strong>. Widely used on UNIX, Linux, and macOS. Part of the IEEE POSIX 1003.1c standard.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>POSIX Mutex Locks</h3>
              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>#include &lt;pthread.h&gt;</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Creating and initializing */</div>
                  <div>pthread_mutex_t mutex;</div>
                  <div>pthread_mutex_init(&amp;mutex, NULL);</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Acquiring and releasing */</div>
                  <div style={{ color: '#f59e0b' }}>pthread_mutex_lock(&amp;mutex);</div>
                  <div style={{ color: '#ef4444' }}>/* critical section */</div>
                  <div style={{ color: '#10b981' }}>pthread_mutex_unlock(&amp;mutex);</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>POSIX Semaphores</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Named Semaphore</div>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>Can be used by unrelated processes</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>#include &lt;semaphore.h&gt;</div>
                    <div>sem_t *sem;</div>
                    <div></div>
                    <div style={{ color: '#8b949e' }}>/* Create + initialize to 1 */</div>
                    <div>sem = sem_open("SEM", O_CREAT, 0666, 1);</div>
                    <div></div>
                    <div style={{ color: '#f59e0b' }}>sem_wait(sem);</div>
                    <div style={{ color: '#ef4444' }}>/* critical section */</div>
                    <div style={{ color: '#10b981' }}>sem_post(sem);</div>
                  </div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Unnamed Semaphore</div>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>For threads of the same process</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>#include &lt;semaphore.h&gt;</div>
                    <div>sem_t sem;</div>
                    <div></div>
                    <div style={{ color: '#8b949e' }}>/* Create + initialize to 1 */</div>
                    <div>sem_init(&amp;sem, 0, 1);</div>
                    <div></div>
                    <div style={{ color: '#f59e0b' }}>sem_wait(&amp;sem);</div>
                    <div style={{ color: '#ef4444' }}>/* critical section */</div>
                    <div style={{ color: '#10b981' }}>sem_post(&amp;sem);</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>POSIX Condition Variables</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Since POSIX is used in C/C++ (no built-in monitors), condition variables are associated with a POSIX mutex lock to provide mutual exclusion.
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>pthread_mutex_t mutex;</div>
                  <div>pthread_cond_t cond_var;</div>
                  <div></div>
                  <div>pthread_mutex_init(&amp;mutex, NULL);</div>
                  <div>pthread_cond_init(&amp;cond_var, NULL);</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Thread waiting for condition a == b */</div>
                  <div>pthread_mutex_lock(&amp;mutex);</div>
                  <div style={{ color: '#f59e0b' }}>while (a != b)</div>
                  <div style={{ paddingLeft: 16, color: '#f59e0b' }}>pthread_cond_wait(&amp;cond_var, &amp;mutex);</div>
                  <div>pthread_mutex_unlock(&amp;mutex);</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Thread signaling condition */</div>
                  <div>pthread_mutex_lock(&amp;mutex);</div>
                  <div>a = b;</div>
                  <div style={{ color: '#10b981' }}>pthread_cond_signal(&amp;cond_var);</div>
                  <div>pthread_mutex_unlock(&amp;mutex);</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why pthread_cond_wait takes a mutex:</strong> pthread_cond_wait atomically releases the mutex and puts the thread to sleep. When another thread calls pthread_cond_signal, the sleeping thread wakes up and re-acquires the mutex before returning. This atomicity is essential — without it, a signal could be sent between the "check condition" and "wait" steps, causing the thread to sleep forever (missed wakeup).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Spurious wakeups:</strong> pthread_cond_wait can return even without a signal being sent — this is called a spurious wakeup and is allowed by the POSIX standard. This is why condition checks must always be in a while loop, not an if statement. The while loop re-checks the condition after every wakeup.
              </LearnMore>

              <NavButtons prev={function() { setActive('dining') }} prevLabel="← 7.3 Dining Philosophers" next={function() { setActive('java') }} nextLabel="7.5 Java Sync →" />
            </div>
          )}

          {active === 'java' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.5 Java Synchronization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Java's rich synchronization features — monitors, reentrant locks, semaphores, and condition variables.</p>

              <InfoBox color="#f59e0b">
                Java provides a rich set of synchronization features: <strong>Java monitors</strong> (synchronized keyword), <strong>Reentrant locks</strong>, <strong>Semaphores</strong>, and <strong>Condition variables</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Java Monitors (synchronized)</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Every Java object has an associated single lock. If a method is declared <strong style={{ color: 'var(--text-primary)' }}>synchronized</strong>, the calling thread must own the lock. Locks are released when the owning thread exits the synchronized method.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Entry Set</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Threads waiting to acquire the lock. When the lock is released, one thread from the entry set gets to acquire it and enter the synchronized method.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Wait Set</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Threads that called wait() inside a synchronized method. They released the lock and are waiting for notify() to move them back to the entry set.</p>
                </div>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Java notify() flow:</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* When a thread calls notify(): */</div>
                  <div>1. An arbitrary thread T selected from wait set</div>
                  <div>2. T moved from wait set to entry set</div>
                  <div>3. T state set from blocked to runnable</div>
                  <div>4. T can now compete for the lock</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Java ReentrantLock</h3>
              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>Lock key = new ReentrantLock();</div>
                  <div></div>
                  <div>key.lock();</div>
                  <div>try {'{'}</div>
                  <div style={{ paddingLeft: 16, color: '#ef4444' }}>/* critical section */</div>
                  <div>{'}'}</div>
                  <div>finally {'{'}</div>
                  <div style={{ paddingLeft: 16, color: '#10b981' }}>key.unlock(); <span style={{ color: '#8b949e' }}>/* ALWAYS released */</span></div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Java Semaphores</h3>
              <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Constructor */</div>
                  <div>Semaphore sem = new Semaphore(1);</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Usage */</div>
                  <div>try {'{'}</div>
                  <div style={{ paddingLeft: 16, color: '#f59e0b' }}>sem.acquire(); <span style={{ color: '#8b949e' }}>/* wait() */</span></div>
                  <div style={{ paddingLeft: 16, color: '#ef4444' }}>/* critical section */</div>
                  <div>{'}'}</div>
                  <div>catch (InterruptedException ie) {'{'} {'}'}</div>
                  <div>finally {'{'}</div>
                  <div style={{ paddingLeft: 16, color: '#10b981' }}>sem.release(); <span style={{ color: '#8b949e' }}>/* signal() */</span></div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Java Condition Variables</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>
                Condition variables are associated with a ReentrantLock. Created using newCondition(). A thread waits with await() and signals with signal().
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>Lock lock = new ReentrantLock();</div>
                  <div>Condition[] condVars = new Condition[5];</div>
                  <div>for (int i = 0; i &lt; 5; i++)</div>
                  <div style={{ paddingLeft: 16 }}>condVars[i] = lock.newCondition();</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Thread waiting */</div>
                  <div>lock.lock();</div>
                  <div>try {'{'}</div>
                  <div style={{ paddingLeft: 16, color: '#f59e0b' }}>while (threadNumber != turn)</div>
                  <div style={{ paddingLeft: 32, color: '#f59e0b' }}>condVars[threadNumber].await();</div>
                  <div style={{ paddingLeft: 16, color: '#ef4444' }}>/* do work */</div>
                  <div style={{ paddingLeft: 16 }}>turn = (turn + 1) % 5;</div>
                  <div style={{ paddingLeft: 16, color: '#10b981' }}>condVars[turn].signal();</div>
                  <div>{'}'}</div>
                  <div>finally {'{'} lock.unlock(); {'}'}</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>synchronized vs ReentrantLock:</strong> The synchronized keyword is simpler but limited. ReentrantLock adds: tryLock() (non-blocking acquire attempt), lockInterruptibly() (can be interrupted while waiting), fairness parameter (waiting threads served in FIFO order), and multiple condition variables per lock. Use synchronized for simple cases; ReentrantLock for advanced requirements.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Java memory model and volatile:</strong> Java has a defined memory model that specifies when writes by one thread are visible to others. The volatile keyword ensures that a variable is always read from and written to main memory (not a CPU register or cache). volatile provides visibility but not atomicity — it doesn't prevent race conditions on compound operations like count++.
              </LearnMore>

              <NavButtons prev={function() { setActive('posix') }} prevLabel="← 7.4 POSIX Sync" next={function() { setActive('windows') }} nextLabel="7.6 Windows and Linux →" />
            </div>
          )}

          {active === 'windows' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.6 Windows and Linux Kernel Synchronization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How real operating systems implement synchronization at the kernel level.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Windows Kernel Synchronization</h3>
              <InfoBox color="#3b82f6">
                Windows uses <strong>interrupt masks</strong> to protect access to global resources on uniprocessor systems. On multiprocessors it uses <strong>spinlocks</strong> (spinlocking threads are never preempted). Also provides <strong>dispatcher objects</strong> in user space that act as mutexes, semaphores, events, and timers.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { name: 'Mutex Dispatcher Object', color: '#3b82f6', desc: 'Provides mutual exclusion. Thread acquires it before critical section. Owner releases it. State: signaled (available) or non-signaled (owned).' },
                  { name: 'Semaphore Dispatcher', color: '#8b5cf6', desc: 'Counting semaphore in Windows kernel. Wait decrements count, signal increments. Becomes non-signaled when count reaches 0.' },
                  { name: 'Events', color: '#10b981', desc: 'Acts like a condition variable. Notifies one or more threads when an event occurs. Can be auto-reset or manual-reset.' },
                  { name: 'Timers', color: '#f59e0b', desc: 'Notify one or more threads when time expires. Used for implementing timeouts and periodic tasks in kernel code.' },
                ].map(function(obj) {
                  return (
                    <div key={obj.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + obj.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: obj.color, marginBottom: 8, fontSize: 13 }}>{obj.name}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obj.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Linux Kernel Synchronization</h3>
              <InfoBox color="#10b981">
                Prior to kernel version 2.6, Linux disabled interrupts to implement short critical sections. Version 2.6 and later is <strong>fully preemptive</strong>. Linux provides: semaphores, atomic integers, spinlocks, and reader-writer versions of both.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { tool: 'atomic_t', color: '#10b981', desc: 'Atomic integer type. Operations: atomic_set(), atomic_add(), atomic_sub(), atomic_inc(), atomic_read(). Guaranteed atomic on all architectures — no lock needed.' },
                  { tool: 'spinlock_t', color: '#3b82f6', desc: 'Kernel spinlock. spin_lock() / spin_unlock(). Used in interrupt handlers and short kernel critical sections where sleeping is not allowed.' },
                  { tool: 'rwlock_t', color: '#8b5cf6', desc: 'Reader-writer spinlock. read_lock() / read_unlock() for readers. write_lock() / write_unlock() for writers. Multiple readers, single writer.' },
                  { tool: 'struct semaphore', color: '#f59e0b', desc: 'Sleeping semaphore. down() / up(). Process sleeps if semaphore is 0. Used for longer critical sections where sleeping is acceptable.' },
                  { tool: 'mutex_t', color: '#ef4444', desc: 'Sleeping mutex. mutex_lock() / mutex_unlock(). Simpler and faster than semaphore for binary use case. Cannot be used in interrupt context.' },
                ].map(function(t) {
                  return (
                    <div key={t.tool} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '33', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color, fontSize: 13, minWidth: 120 }}>{t.tool}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Linux Atomic Variables Example</h3>
              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>atomic_t counter;</div>
                  <div>int value;</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Atomic operations */</div>
                  <div>atomic_set(&amp;counter, 5);    <span style={{ color: '#8b949e' }}>/* counter = 5 */</span></div>
                  <div>atomic_add(10, &amp;counter);  <span style={{ color: '#8b949e' }}>/* counter = counter + 10 */</span></div>
                  <div>atomic_sub(4, &amp;counter);   <span style={{ color: '#8b949e' }}>/* counter = counter - 4 */</span></div>
                  <div>atomic_inc(&amp;counter);      <span style={{ color: '#8b949e' }}>/* counter = counter + 1 */</span></div>
                  <div>value = atomic_read(&amp;counter); <span style={{ color: '#8b949e' }}>/* value = 12 */</span></div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why Linux needs so many sync primitives:</strong> Different kernel contexts have different constraints. Interrupt handlers cannot sleep — they must use spinlocks. Process context code can sleep — it can use semaphores or mutexes. Bottom halves (softirqs, tasklets) have intermediate constraints. Using the wrong primitive (e.g., mutex in interrupt handler) causes a kernel panic.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Seqlock (sequence lock):</strong> A Linux-specific optimization for read-heavy workloads where writes are rare. Writer increments a sequence counter before and after writing. Reader reads the counter before and after reading — if odd or changed, retry. Readers never block writers. Used for jiffies (timer ticks) and wall clock time in the kernel.
              </LearnMore>

              <NavButtons prev={function() { setActive('java') }} prevLabel="← 7.5 Java Sync" next={function() { setActive('alt') }} nextLabel="7.7 Alternative Approaches →" />
            </div>
          )}

          {active === 'alt' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>7.7 Alternative Approaches</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Transactional memory, OpenMP, and functional programming — new ways to handle synchronization.</p>

              <InfoBox color="#8b5cf6">
                Traditional synchronization (locks, semaphores) is error-prone and can lead to deadlocks. Alternative approaches try to make concurrent programming safer and easier.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>💾</span>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#3b82f6' }}>Transactional Memory</h4>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    A <strong style={{ color: 'var(--text-primary)' }}>memory transaction</strong> is a sequence of read-write operations performed atomically. If any part fails or conflicts, the entire transaction is rolled back and retried — like a database transaction.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 6 }}>With mutex (error-prone):</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                        <div>void update() {'{'}</div>
                        <div style={{ paddingLeft: 16 }}>acquire();</div>
                        <div style={{ paddingLeft: 16, color: '#8b949e' }}>/* modify data */</div>
                        <div style={{ paddingLeft: 16 }}>release();</div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                    <div style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, color: '#10b981', marginBottom: 6 }}>With transactional memory:</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
                        <div>void update() {'{'}</div>
                        <div style={{ paddingLeft: 16, color: '#3b82f6' }}>atomic {'{'}</div>
                        <div style={{ paddingLeft: 32, color: '#8b949e' }}>/* modify data */</div>
                        <div style={{ paddingLeft: 16, color: '#3b82f6' }}>{'}'}</div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>Advantage: no deadlocks possible. System handles conflicts automatically via retry.</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>⚡</span>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#10b981' }}>OpenMP</h4>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    OpenMP is a set of compiler directives and API for C, C++, and Fortran. Code inside a <strong style={{ color: 'var(--text-primary)' }}>#pragma omp critical</strong> directive is treated as a critical section and performed atomically.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                      <div>void update(int value) {'{'}</div>
                      <div style={{ paddingLeft: 16, color: '#f59e0b' }}>#pragma omp critical</div>
                      <div style={{ paddingLeft: 16 }}>{'{'}</div>
                      <div style={{ paddingLeft: 32 }}>count += value;</div>
                      <div style={{ paddingLeft: 16 }}>{'}'}</div>
                      <div>{'}'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>The compiler generates the locking code automatically — programmer only marks the critical region.</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>🔧</span>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#8b5cf6' }}>Functional Programming Languages</h4>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Functional languages (Erlang, Scala, Haskell) offer a different paradigm — they do NOT maintain mutable state. Variables are <strong style={{ color: 'var(--text-primary)' }}>immutable</strong> and cannot change state once assigned. If there is no shared mutable state, there are <strong style={{ color: '#10b981' }}>no race conditions</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    {['No shared mutable state', 'No race conditions', 'No locks needed', 'Pure functions', 'Erlang, Scala, Haskell'].map(function(f) {
                      return <span key={f} style={{ fontSize: 12, background: '#8b5cf618', color: '#8b5cf6', border: '1px solid #8b5cf633', padding: '3px 10px', borderRadius: 12 }}>{f}</span>
                    })}
                  </div>
                </div>

              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Hardware Transactional Memory (HTM):</strong> Modern CPUs (Intel TSX, IBM POWER, ARM TME) support hardware transactional memory. The CPU tracks all memory reads and writes in a transaction. On commit, if no conflicts detected, all writes are made visible atomically. If a conflict is detected, the transaction is aborted and retried. Much faster than software transactional memory with no programmer overhead.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Actor model (Erlang):</strong> Erlang processes communicate only by message passing — no shared memory at all. Each actor has its own private state. This completely eliminates race conditions and deadlocks from shared memory. Erlang powers WhatsApp (2 million connections per server), RabbitMQ, and CouchDB. The trade-off: higher memory use and message serialization overhead.
              </LearnMore>

              <NavButtons prev={function() { setActive('windows') }} prevLabel="← 7.6 Windows and Linux" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Classical Problem Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interact with all three classical synchronization problems.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Bounded-Buffer (Producer-Consumer)</h3>
              <BoundedBufferSim />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Readers-Writers</h3>
              <ReadersWritersSim />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Dining Philosophers</h3>
              <DiningPhilosophersSim />

              <NavButtons prev={function() { setActive('alt') }} prevLabel="← 7.7 Alternatives" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Classical Problems in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Implement the classical problems yourself.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#06b6d4' }}>Lab 1 — Bounded Buffer in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#f59e0b' }}>Lab 2 — Java Synchronization</h3>
              <CodeEditor defaultLang="java" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#10b981' }}>Lab 3 — Explore Sync in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ipcs -s',              'List all semaphores in the system'],
                  ['ipcs -m',              'List all shared memory segments'],
                  ['ipcs -q',              'List all message queues'],
                  ['cat /proc/locks',      'Show all file locks'],
                  ['ls /dev/shm',          'List POSIX shared memory objects'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', minWidth: 160, flexShrink: 0 }}>{item[0]}</code>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item[1]}</span>
                    </div>
                  )
                })}
              </div>
              <Terminal />

              <NavButtons prev={function() { setActive('simulator') }} prevLabel="← Simulators" next={function() { setActive('quiz') }} nextLabel="Take the Quiz →" />
            </div>
          )}

          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 7.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#06b6d4' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#06b6d4', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 7!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/8' }} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 8 →</button>
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