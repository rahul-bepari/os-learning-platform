import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',   title: '4.1 Thread Overview',       icon: '🧵' },
  { id: 'multicore',  title: '4.2 Multicore Programming', icon: '💻' },
  { id: 'models',     title: '4.3 Threading Models',      icon: '🏗️' },
  { id: 'libraries',  title: '4.4 Thread Libraries',      icon: '📚' },
  { id: 'implicit',   title: '4.5 Implicit Threading',    icon: '⚡' },
  { id: 'issues',     title: '4.6 Threading Issues',      icon: '⚠️' },
  { id: 'os',         title: '4.7 OS Examples',           icon: '🖥️' },
  { id: 'simulator',  title: '🎮 Thread Simulator',       icon: '🎮' },
  { id: 'lab',        title: '💻 Lab',                    icon: '💻' },
  { id: 'quiz',       title: '🧠 Quiz',                   icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the main advantage of threads over processes?',
    options: [
      'Threads are more secure',
      'Thread creation is lighter weight and threads share memory within a process',
      'Threads can run on more CPUs',
      'Threads have their own memory space'
    ],
    answer: 1,
    explanation: 'Thread creation is lighter weight than process creation. Threads share the code, data, and files of their process — only registers, stack, and program counter are unique per thread.'
  },
  {
    q: 'In the One-to-One threading model, what happens when you create a user thread?',
    options: [
      'Nothing — user threads are invisible to the kernel',
      'A kernel thread is also created',
      'An existing kernel thread is shared',
      'The process is duplicated'
    ],
    answer: 1,
    explanation: 'In One-to-One (used by Linux and Windows), each user-level thread maps to one kernel thread. Creating a user thread creates a kernel thread. More concurrency but more overhead.'
  },
  {
    q: 'What does Amdahl\'s Law tell us?',
    options: [
      'More cores always means more speed',
      'The serial portion of a program limits the maximum speedup from adding cores',
      'Threads are always faster than processes',
      'Memory is the bottleneck in all programs'
    ],
    answer: 1,
    explanation: 'Amdahl\'s Law: if S is the serial fraction, max speedup = 1/S regardless of cores. A program that is 50% serial can never be more than 2x faster no matter how many cores you add.'
  },
  {
    q: 'What is a thread pool?',
    options: [
      'A shared memory region for threads',
      'A group of pre-created threads waiting for work',
      'A kernel data structure for scheduling',
      'A type of mutex lock'
    ],
    answer: 1,
    explanation: 'A thread pool creates threads in advance and keeps them waiting for tasks. When a task arrives, a waiting thread executes it. Faster than creating a new thread per task, and limits total thread count.'
  },
  {
    q: 'What is the difference between data parallelism and task parallelism?',
    options: [
      'Data parallelism uses more memory',
      'Data parallelism distributes data across cores (same operation); task parallelism distributes different operations across cores',
      'Task parallelism is always faster',
      'They are the same thing'
    ],
    answer: 1,
    explanation: 'Data parallelism: same operation on different subsets of data across cores (e.g., applying a filter to different parts of an image). Task parallelism: different operations on data across cores (e.g., one thread compresses while another encrypts).'
  },
  {
    q: 'In Linux, threads are created with which system call?',
    options: ['thread_create()', 'fork()', 'clone()', 'pthread_new()'],
    answer: 2,
    explanation: 'Linux uses clone() to create threads. clone() allows a child task to share the address space of the parent. The flags parameter controls what is shared — file descriptors, memory, signal handlers, etc.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #8b5cf655', color: '#8b5cf6', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(139,92,246,0.06)', border: '1px solid #8b5cf633', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function AmdahlCalculator() {
  const [serial, setSerial] = useState(25)
  const cores = [1, 2, 4, 8, 16, 32, 64]
  const speedup = function(n) {
    const s = serial / 100
    return (1 / (s + (1 - s) / n)).toFixed(2)
  }
  const maxSpeedup = (1 / (serial / 100)).toFixed(2)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Amdahl's Law Calculator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Speedup = 1 / (S + (1-S)/N) where S = serial fraction, N = number of cores
      </p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Serial portion of program:</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{serial}%</span>
        </div>
        <input
          type="range" min="0" max="100" value={serial}
          onChange={function(e) { setSerial(parseInt(e.target.value)) }}
          style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          <span>0% serial (fully parallel)</span>
          <span>100% serial (no parallelism)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
        {cores.map(function(n) {
          const s = parseFloat(speedup(n))
          const max = parseFloat(maxSpeedup)
          const pct = max > 1 ? ((s - 1) / (max - 1)) * 100 : 0
          return (
            <div key={n} style={{ textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 4px', marginBottom: 6, border: '1px solid var(--border)' }}>
                <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
                  <div style={{ width: 24, background: '#8b5cf6', borderRadius: 4, height: Math.max(4, pct * 0.8) + '%', transition: 'height 0.4s', minHeight: 4 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6' }}>{s}x</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n} core{n > 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#8b5cf618', border: '1px solid #8b5cf644', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>
          Maximum possible speedup: {maxSpeedup}x (with infinite cores)
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {serial === 0
            ? 'With 0% serial code, the program is perfectly parallelizable — speedup is linear with cores.'
            : serial >= 50
            ? 'With ' + serial + '% serial code, even infinite cores give only ' + maxSpeedup + 'x speedup. The serial portion is the bottleneck.'
            : 'With ' + serial + '% serial code, maximum speedup is ' + maxSpeedup + 'x. Adding more cores has diminishing returns.'}
        </div>
      </div>
    </div>
  )
}

function ThreadSimulator() {
  const [running, setRunning] = useState(false)
  const [cores, setCores] = useState(4)
  const [threads, setThreads] = useState([])
  const [tick, setTick] = useState(0)

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16']

  function startSim() {
    const ts = Array.from({ length: 8 }, function(_, i) {
      return { id: i, name: 'T' + (i + 1), state: 'ready', core: null, progress: 0, color: COLORS[i] }
    })
    setThreads(ts)
    setRunning(true)
    setTick(0)

    let t = 0
    const interval = setInterval(function() {
      t++
      setTick(t)
      setThreads(function(prev) {
        const next = prev.map(function(th) { return { ...th } })
        const runningThreads = next.filter(function(th) { return th.state === 'running' })
        const readyThreads = next.filter(function(th) { return th.state === 'ready' })
        const busyCores = runningThreads.map(function(th) { return th.core })

        runningThreads.forEach(function(th) {
          th.progress = Math.min(100, th.progress + Math.random() * 15 + 5)
          if (th.progress >= 100) {
            th.state = 'done'
            th.core = null
          }
        })

        for (let c = 0; c < cores; c++) {
          if (!busyCores.includes(c) && readyThreads.length > 0) {
            const idx = readyThreads.findIndex(function(th) { return th.state === 'ready' })
            if (idx >= 0) {
              readyThreads[idx].state = 'running'
              readyThreads[idx].core = c
              busyCores.push(c)
            }
          }
        }

        return next
      })

      setThreads(function(prev) {
        const allDone = prev.every(function(th) { return th.state === 'done' || th.state === 'ready' })
        const anyRunning = prev.some(function(th) { return th.state === 'running' })
        if (!anyRunning && prev.filter(function(th) { return th.state === 'ready' }).length === 0) {
          clearInterval(interval)
          setRunning(false)
        }
        return prev
      })

      if (t > 40) { clearInterval(interval); setRunning(false) }
    }, 300)
  }

  function reset() {
    setThreads([])
    setRunning(false)
    setTick(0)
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Thread Scheduler Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Watch threads get scheduled across CPU cores in real time</p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>CPU Cores:</span>
          {[1, 2, 4, 8].map(function(n) {
            return (
              <button key={n} onClick={function() { setCores(n); reset() }} style={{ background: cores === n ? '#8b5cf6' : 'var(--bg-secondary)', color: cores === n ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (cores === n ? '#8b5cf6' : 'var(--border)'), padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {n}
              </button>
            )
          })}
        </div>
        <button onClick={running ? reset : startSim} style={{ background: running ? '#ef4444' : '#8b5cf6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          {running ? 'Stop' : threads.length > 0 ? 'Restart' : 'Start Simulation'}
        </button>
        {threads.length > 0 && !running && (
          <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
        )}
      </div>

      {threads.length > 0 && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>CPU Cores:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + cores + ', 1fr)', gap: 10 }}>
              {Array.from({ length: cores }, function(_, c) {
                const thread = threads.find(function(th) { return th.state === 'running' && th.core === c })
                return (
                  <div key={c} style={{ background: thread ? thread.color + '22' : 'var(--bg-secondary)', border: '2px solid ' + (thread ? thread.color : 'var(--border)'), borderRadius: 10, padding: 14, textAlign: 'center', transition: 'all 0.3s', minHeight: 80 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Core {c}</div>
                    {thread
                      ? (
                        <div>
                          <div style={{ fontWeight: 700, color: thread.color, marginBottom: 6 }}>{thread.name}</div>
                          <div style={{ background: 'var(--bg-primary)', borderRadius: 4, height: 6 }}>
                            <div style={{ height: '100%', background: thread.color, borderRadius: 4, width: thread.progress + '%', transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{Math.round(thread.progress)}%</div>
                        </div>
                      )
                      : <div style={{ fontSize: 20, color: 'var(--text-muted)' }}>idle</div>}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>All Threads:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {threads.map(function(th) {
                return (
                  <div key={th.id} style={{ background: 'var(--bg-secondary)', border: '1px solid ' + (th.state === 'done' ? '#10b98144' : th.state === 'running' ? th.color + '44' : 'var(--border)'), borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: th.color, fontSize: 13 }}>{th.name}</span>
                      <span style={{ fontSize: 11, color: th.state === 'done' ? '#10b981' : th.state === 'running' ? th.color : 'var(--text-muted)', fontWeight: 600 }}>
                        {th.state === 'done' ? 'DONE' : th.state === 'running' ? 'Core ' + th.core : 'READY'}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 3, height: 4 }}>
                      <div style={{ height: '100%', background: th.state === 'done' ? '#10b981' : th.color, borderRadius: 3, width: th.progress + '%', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            {threads.every(function(th) { return th.state === 'done' })
              ? 'All threads completed!'
              : running
              ? 'Scheduling ' + threads.filter(function(th) { return th.state === 'running' }).length + ' threads across ' + cores + ' cores...'
              : 'Click Start Simulation to begin'}
          </div>
        </div>
      )}

      {threads.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          Select number of CPU cores and click Start Simulation
        </div>
      )}
    </div>
  )
}

export default function Chapter4() {
  const [active, setActive] = useState('overview')
  const [activeModel, setActiveModel] = useState('one-to-one')
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

  const models = {
    'many-to-one': {
      name: 'Many-to-One',
      color: '#f59e0b',
      desc: 'Many user-level threads mapped to a single kernel thread. One thread blocking causes ALL to block. Multiple threads cannot run in parallel on multicore.',
      pros: ['Low overhead — no kernel involvement for thread operations', 'Portable — works on any OS'],
      cons: ['One blocking thread blocks ALL threads', 'Cannot use multiple cores', 'Rarely used today'],
      examples: 'Solaris Green Threads, GNU Portable Threads',
      userThreads: 4, kernelThreads: 1,
    },
    'one-to-one': {
      name: 'One-to-One',
      color: '#3b82f6',
      desc: 'Each user-level thread maps to one kernel thread. Creating a user thread creates a kernel thread. More concurrency — threads can run on different cores.',
      pros: ['True parallelism on multicore systems', 'One blocking thread does not block others', 'Used by Linux and Windows'],
      cons: ['Higher overhead — kernel thread creation is expensive', 'Number of threads per process may be restricted'],
      examples: 'Linux (via clone()), Windows',
      userThreads: 4, kernelThreads: 4,
    },
    'many-to-many': {
      name: 'Many-to-Many',
      color: '#10b981',
      desc: 'Many user threads mapped to a smaller or equal number of kernel threads. OS can create sufficient kernel threads. Best of both worlds.',
      pros: ['True parallelism possible', 'Unlimited user threads', 'More flexible than one-to-one'],
      cons: ['Complex to implement', 'Not commonly used in practice', 'Requires thread library coordination'],
      examples: 'Windows with ThreadFiber package (rare)',
      userThreads: 6, kernelThreads: 3,
    },
    'two-level': {
      name: 'Two-Level Model',
      color: '#8b5cf6',
      desc: 'Similar to Many-to-Many but also allows a user thread to be BOUND to a specific kernel thread. Gives flexibility for both performance-critical and normal threads.',
      pros: ['All benefits of Many-to-Many', 'Critical threads can be bound to dedicated kernel threads', 'Flexible scheduling'],
      cons: ['Most complex model to implement', 'Very rarely used in practice'],
      examples: 'IRIX, HP-UX, Tru64 UNIX (historical)',
      userThreads: 6, kernelThreads: 4,
    },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #8b5cf644', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 4</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🧵</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Threads and Concurrency</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How programs do many things at once — threads, multicore programming, Amdahl's Law, thread models, and thread libraries. Fully aligned with your lecture slides.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Amdahl\'s Law Calculator', 'Thread Scheduler Simulator', 'Threading Models', 'Pthreads Code', 'Thread vs Process'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(139,92,246,0.1)', border: '1px solid #8b5cf633', color: '#8b5cf6', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>

        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#8b5cf6' : 'var(--text-secondary)', background: active === s.id ? 'rgba(139,92,246,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #8b5cf6' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.1 Thread Overview</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What threads are, why we need them, and how they differ from processes.</p>

              <InfoBox color="#8b5cf6">
                A <strong>thread</strong> is a basic unit of CPU utilization. It comprises a thread ID, program counter, register set, and stack. It shares with other threads of the same process the code section, data section, and OS resources (open files, signals).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Thread vs Process</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 12, fontSize: 15 }}>Single-Threaded Process</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {['code', 'data', 'files'].map(function(s) {
                      return <div key={s} style={{ background: '#10b98122', border: '1px solid #10b98144', borderRadius: 4, padding: '6px 12px', fontSize: 12, color: '#10b981', textAlign: 'center' }}>{s}</div>
                    })}
                    <div style={{ background: '#3b82f622', border: '1px solid #3b82f644', borderRadius: 4, padding: '6px 12px', fontSize: 12, color: '#3b82f6', textAlign: 'center' }}>registers | PC | stack</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>One thread = one execution path</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 12, fontSize: 15 }}>Multi-Threaded Process</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                    {['code', 'data', 'files'].map(function(s) {
                      return <div key={s} style={{ background: '#8b5cf622', border: '1px solid #8b5cf644', borderRadius: 4, padding: '6px 12px', fontSize: 12, color: '#8b5cf6', textAlign: 'center' }}>{s} (SHARED)</div>
                    })}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                      {['T1', 'T2', 'T3'].map(function(t) {
                        return <div key={t} style={{ background: '#3b82f622', border: '1px solid #3b82f644', borderRadius: 4, padding: '4px', fontSize: 11, color: '#3b82f6', textAlign: 'center' }}>{t}: regs PC stack</div>
                      })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Multiple execution paths, shared memory</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>What Each Thread Has (Private)</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { item: 'Thread ID', color: '#8b5cf6', desc: 'Unique identifier within the process' },
                  { item: 'Program Counter', color: '#3b82f6', desc: 'Which instruction this thread executes next' },
                  { item: 'Register Set', color: '#10b981', desc: 'CPU register values for this thread' },
                  { item: 'Stack', color: '#f59e0b', desc: 'Local variables and function call frames' },
                ].map(function(t) {
                  return (
                    <div key={t.item} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '44', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, color: t.color, marginBottom: 4, fontSize: 13 }}>{t.item}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Benefits of Multithreading</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { name: 'Responsiveness', color: '#8b5cf6', desc: 'May allow continued execution if part of process is blocked — especially important for user interfaces. While one thread waits for network data, another keeps the UI responsive.' },
                  { name: 'Resource Sharing', color: '#3b82f6', desc: 'Threads share resources of the process — memory, files, code. Easier than shared memory or message passing between processes. No IPC overhead.' },
                  { name: 'Economy', color: '#10b981', desc: 'Cheaper to create and context-switch than processes. Thread creation uses ~10x less time and memory than process creation. Context switch between threads is faster.' },
                  { name: 'Scalability', color: '#f59e0b', desc: 'Process can take advantage of multicore architectures. Threads can run in parallel on different cores — a single-threaded process can only use one core no matter how many exist.' },
                ].map(function(b) {
                  return (
                    <div key={b.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + b.color + '33', borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: b.color, marginBottom: 8 }}>{b.name}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Real-World Multithreaded Applications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { app: 'Web Browser', color: '#3b82f6', threads: ['UI rendering thread', 'JavaScript engine thread', 'Network request threads', 'Plugin/extension threads'] },
                  { app: 'Web Server', color: '#10b981', threads: ['Listener thread (accepts connections)', 'Worker thread per request', 'Cache management thread', 'Logging thread'] },
                  { app: 'Video Game', color: '#8b5cf6', threads: ['Rendering thread (GPU commands)', 'Physics simulation thread', 'Audio thread', 'Input handling thread'] },
                ].map(function(a) {
                  return (
                    <div key={a.app} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: a.color, marginBottom: 10, fontSize: 13 }}>{a.app}</div>
                      {a.threads.map(function(t) {
                        return <div key={t} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>• {t}</div>
                      })}
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Kernels are generally multithreaded:</strong> The Linux kernel itself uses multiple kernel threads for tasks like memory management (kswapd), disk I/O (kblockd), network processing (ksoftirqd), and RCU callbacks (rcuc). You can see them with ps aux — they show up as [kthreadd], [kworker], etc.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Process creation is heavy-weight, thread creation is light-weight:</strong> Creating a process requires: allocating a new PCB, copying the parent's memory space (or setting up copy-on-write), creating new file descriptor tables, setting up new page tables. Creating a thread requires: allocating a thread control block, creating a new stack. That's why threads are ~10x cheaper to create than processes.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Challenges of multithreaded programming:</strong> Dividing activities (which work goes on which thread?), load balancing (keeping all cores equally busy), data splitting (partitioning data for parallel processing), data dependency (thread A needs thread B's result — must synchronize), testing and debugging (race conditions are hard to reproduce).
              </LearnMore>

              <NavButtons next={function() { setActive('multicore') }} nextLabel="4.2 Multicore Programming →" />
            </div>
          )}

          {active === 'multicore' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.2 Multicore Programming</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Using multiple CPU cores effectively — and the fundamental limits of parallelism.</p>

              <InfoBox color="#3b82f6">
                Multicore systems put pressure on programmers. Simply having more cores does not automatically speed up a program — the program must be written to use them, and there are fundamental limits to how much speedup is possible.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Concurrency vs Parallelism</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8, fontSize: 15 }}>Concurrency</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    Supports more than one task making progress. On a single core, the scheduler rapidly switches between tasks — creating the <em>illusion</em> of simultaneous execution.
                  </p>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 60 }}>single core</div>
                    {['T1', 'T2', 'T1', 'T3', 'T1', 'T2', 'T1'].map(function(t, i) {
                      const c = t === 'T1' ? '#8b5cf6' : t === 'T2' ? '#3b82f6' : '#10b981'
                      return <div key={i} style={{ background: c, borderRadius: 3, padding: '3px 6px', fontSize: 10, color: 'white', fontWeight: 700 }}>{t}</div>
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: '#f59e0b' }}>Interleaved on one core — not truly simultaneous</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8, fontSize: 15 }}>Parallelism</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    A system can perform more than one task <em>simultaneously</em>. Requires multiple cores. Tasks truly run at the same time on different hardware.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
                    {[['core 1', 'T1', '#8b5cf6'], ['core 2', 'T2', '#3b82f6']].map(function(row) {
                      return (
                        <div key={row[0]} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 50 }}>{row[0]}</div>
                          {[1, 2, 3, 4, 5, 6, 7].map(function(i) {
                            return <div key={i} style={{ background: row[2], borderRadius: 3, padding: '3px 6px', fontSize: 10, color: 'white', fontWeight: 700 }}>{row[1]}</div>
                          })}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: '#10b981' }}>Truly simultaneous on multiple cores</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Types of Parallelism</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Data Parallelism</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Distribute <strong>subsets of the same data</strong> across multiple cores. Each core performs the <strong>same operation</strong> on its subset.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#e6edf3' }}>
                    <div style={{ color: '#8b949e' }}>// Sum array using data parallelism</div>
                    <div>Core 0: sum(array[0..n/2])</div>
                    <div>Core 1: sum(array[n/2..n])</div>
                    <div>Result: add both partial sums</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Task Parallelism</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Distribute <strong>different tasks (threads)</strong> across cores. Each core performs a <strong>unique operation</strong>.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#e6edf3' }}>
                    <div style={{ color: '#8b949e' }}>// Video processing</div>
                    <div>Core 0: decode video frames</div>
                    <div>Core 1: apply color filters</div>
                    <div>Core 2: encode output</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Amdahl's Law</h3>
              <InfoBox color="#8b5cf6">
                Amdahl's Law identifies the performance gains from adding cores to an application that has both serial and parallel components.
                <br /><br />
                <strong>Speedup = 1 / (S + (1-S)/N)</strong>
                <br />Where <strong>S</strong> = serial portion (fraction that cannot be parallelized) and <strong>N</strong> = number of processing cores.
                <br /><br />
                The <strong>serial portion has a disproportionate effect</strong> on performance. If 25% of a program is serial, max speedup is 4x — regardless of how many cores you add.
              </InfoBox>

              <AmdahlCalculator />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why Amdahl's Law matters in practice:</strong> Many programs have significant serial sections — I/O operations, database queries, initialization code, locks. A program that seems highly parallel might still have a 20-30% serial fraction, limiting speedup to 3-5x no matter how many cores you throw at it.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Gustafson's Law (the optimistic view):</strong> Amdahl assumes a fixed problem size. Gustafson's Law argues that as we get more cores, we tend to solve bigger problems. With more cores, the parallel portion grows while the serial portion stays constant — giving better real-world scaling. This is why cloud computing clusters can be effective even though Amdahl seems pessimistic.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>NUMA (Non-Uniform Memory Access):</strong> On systems with multiple CPU sockets (like servers), each CPU has its own memory bank. Accessing memory on a different CPU's bank is 2-3x slower than local memory. The OS must be NUMA-aware — scheduling threads near their data — to avoid performance penalties.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 4.1 Overview" next={function() { setActive('models') }} nextLabel="4.3 Threading Models →" />
            </div>
          )}

          {active === 'models' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.3 Multithreading Models</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How user-level threads map to kernel-level threads — the fundamental design choice.</p>

              <InfoBox color="#f59e0b">
                There are two types of threads: <strong>User threads</strong> (managed by a thread library in user space — POSIX Pthreads, Java threads, Windows threads) and <strong>Kernel threads</strong> (supported directly by the OS — Linux, Windows, macOS). The relationship between them defines the threading model.
              </InfoBox>

              <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {Object.keys(models).map(function(key) {
                  const m = models[key]
                  return (
                    <button key={key} onClick={function() { setActiveModel(key) }} style={{ background: activeModel === key ? m.color + '33' : 'var(--bg-card)', color: activeModel === key ? m.color : 'var(--text-secondary)', border: '1px solid ' + (activeModel === key ? m.color : 'var(--border)'), padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
                      {m.name}
                    </button>
                  )
                })}
              </div>

              {(function() {
                const m = models[activeModel]
                return (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid ' + m.color + '44', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: m.color, marginBottom: 12 }}>{m.name}</h3>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>{m.desc}</p>

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Architecture Diagram</div>
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>USER SPACE</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                          {Array.from({ length: m.userThreads }, function(_, i) {
                            return (
                              <div key={i} style={{ background: m.color + '33', border: '1px solid ' + m.color, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: m.color }}>
                                T{i + 1}
                              </div>
                            )
                          })}
                        </div>
                        <div style={{ borderTop: '2px dashed var(--border)', paddingTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>KERNEL SPACE</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {Array.from({ length: m.kernelThreads }, function(_, i) {
                              return (
                                <div key={i} style={{ background: '#30363d', border: '1px solid #484f58', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>
                                  KT{i + 1}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Advantages</div>
                        {m.pros.map(function(p) { return <div key={p} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>• {p}</div> })}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Disadvantages</div>
                        {m.cons.map(function(c) { return <div key={c} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>• {c}</div> })}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Examples: {m.examples}</div>
                  </div>
                )
              })()}

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why Linux uses One-to-One:</strong> Linux treats threads as just another kind of process — created with clone() instead of fork(). The clone() call takes flags that specify what to share (memory, file descriptors, signal handlers). A thread is a "process" that shares memory with its parent. This simplifies the kernel and gives true parallelism on multicore systems.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>User-level thread advantages (historical):</strong> Before kernel thread support was widespread, user-level thread libraries (like green threads) could implement thousands of threads without kernel knowledge. Thread switching was just a function call — no kernel mode switch, very fast. The downside: if any thread made a blocking system call, the entire process blocked.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Lightweight Process (LWP):</strong> Many-to-Many models use an intermediate structure called a Lightweight Process (LWP) between user threads and kernel threads. An LWP appears to a user-level thread library as a virtual processor. The library schedules user threads onto LWPs, and the kernel schedules LWPs onto CPU cores. This gives flexibility but adds complexity.
              </LearnMore>

              <NavButtons prev={function() { setActive('multicore') }} prevLabel="← 4.2 Multicore" next={function() { setActive('libraries') }} nextLabel="4.4 Thread Libraries →" />
            </div>
          )}

          {active === 'libraries' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.4 Thread Libraries</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The APIs programmers use to create and manage threads.</p>

              <InfoBox color="#3b82f6">
                A thread library provides the programmer with an API for creating and managing threads. There are three primary thread libraries: <strong>POSIX Pthreads</strong>, <strong>Windows Threads</strong>, and <strong>Java Threads</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>POSIX Pthreads</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Pthreads (POSIX threads) is a <strong style={{ color: 'var(--text-primary)' }}>specification, not implementation</strong> — it defines how thread library should behave. Common in UNIX/Linux/macOS systems.
              </p>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>#include &lt;pthread.h&gt;</div>
                  <div style={{ color: '#8b949e' }}>#include &lt;stdio.h&gt;</div>
                  <div></div>
                  <div>int sum; <span style={{ color: '#8b949e' }}>/* shared data */</span></div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* thread function */</div>
                  <div>void *runner(void *param) {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>int upper = atoi(param);</div>
                  <div style={{ paddingLeft: 20 }}>for (int i = 1; i &lt;= upper; i++)</div>
                  <div style={{ paddingLeft: 40 }}>sum += i;</div>
                  <div style={{ paddingLeft: 20 }}>pthread_exit(0);</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>int main(int argc, char *argv[]) {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>pthread_t tid; <span style={{ color: '#8b949e' }}>/* thread ID */</span></div>
                  <div style={{ paddingLeft: 20 }}>pthread_attr_t attr; <span style={{ color: '#8b949e' }}>/* attributes */</span></div>
                  <div style={{ paddingLeft: 20 }}>pthread_attr_init(&amp;attr);</div>
                  <div style={{ paddingLeft: 20 }}>pthread_create(&amp;tid, &amp;attr, runner, argv[1]);</div>
                  <div style={{ paddingLeft: 20 }}>pthread_join(tid, NULL); <span style={{ color: '#8b949e' }}>/* wait */</span></div>
                  <div style={{ paddingLeft: 20 }}>printf("sum = %d\n", sum);</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Key Pthreads Functions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { fn: 'pthread_create()', desc: 'Create a new thread. Takes thread ID, attributes, function, and argument.' },
                  { fn: 'pthread_join()', desc: 'Wait for a thread to finish. Collects exit status.' },
                  { fn: 'pthread_exit()', desc: 'Terminate the calling thread. Returns a value to pthread_join().' },
                  { fn: 'pthread_attr_init()', desc: 'Initialize thread attributes (stack size, scheduling policy, etc.).' },
                  { fn: 'pthread_mutex_lock()', desc: 'Acquire a mutex lock for critical section protection.' },
                  { fn: 'pthread_cancel()', desc: 'Request cancellation of a thread (deferred or asynchronous).' },
                ].map(function(f) {
                  return (
                    <div key={f.fn} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                      <code style={{ color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, display: 'block', marginBottom: 4 }}>{f.fn}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Java Threads</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Java threads are managed by the JVM. Typically implemented using the OS thread model. Standard practice is to implement the <strong style={{ color: 'var(--text-primary)' }}>Runnable interface</strong>.
              </p>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>// Implement Runnable interface</div>
                  <div>class Task implements Runnable {'{'}</div>
                  <div style={{ paddingLeft: 20 }}>public void run() {'{'}</div>
                  <div style={{ paddingLeft: 40 }}>System.out.println("Thread running!");</div>
                  <div style={{ paddingLeft: 20 }}>{'}'}</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>// Create and start the thread</div>
                  <div>Thread worker = new Thread(new Task());</div>
                  <div>worker.start();</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>// Wait for thread to finish</div>
                  <div>try {'{'} worker.join(); {'}'}</div>
                  <div>catch (InterruptedException ie) {'{'} {'}'}</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Pthreads scheduling:</strong> Pthreads supports two scheduling scopes via pthread_attr_setscope(): PTHREAD_SCOPE_PROCESS (PCS — threads compete within the process) and PTHREAD_SCOPE_SYSTEM (SCS — threads compete with all threads system-wide). Linux and macOS only support PTHREAD_SCOPE_SYSTEM. PCS scheduling is done by the thread library; SCS scheduling is done by the kernel.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Java Executor Framework:</strong> Rather than creating threads explicitly, Java provides the Executor interface. ExecutorService pool = Executors.newFixedThreadPool(4) creates a pool of 4 threads. You submit tasks with pool.submit(task) and the pool assigns them to available threads. This is the recommended way to use threads in modern Java — you define tasks, not threads.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Windows thread API:</strong> Windows uses CreateThread() to create threads. Each thread has a HANDLE (like a file descriptor), a thread ID, a function to run, and a parameter. WaitForSingleObject(handle, INFINITE) waits for a thread to finish. The primary data structures are: ETHREAD (executive thread block in kernel), KTHREAD (kernel thread block), and TEB (thread environment block in user space).
              </LearnMore>

              <NavButtons prev={function() { setActive('models') }} prevLabel="← 4.3 Models" next={function() { setActive('implicit') }} nextLabel="4.5 Implicit Threading →" />
            </div>
          )}

          {active === 'implicit' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.5 Implicit Threading</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Let compilers and runtime libraries manage threads instead of programmers.</p>

              <InfoBox color="#06b6d4">
                As thread counts increase, managing them correctly becomes very difficult. <strong>Implicit threading</strong> transfers the creation and management of threads to compilers and run-time libraries — programmers just identify what can run in parallel.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
                {[
                  {
                    name: 'Thread Pools',
                    color: '#3b82f6',
                    icon: '🏊',
                    desc: 'Create a number of threads at startup and place them in a pool waiting for work. When a request arrives, wake a thread from the pool. When done, return it to the pool.',
                    advantages: [
                      'Faster than creating a new thread per request',
                      'Bounds the number of threads (prevents resource exhaustion)',
                      'Separates task creation from task execution',
                      'Tasks can be scheduled to run periodically',
                    ],
                    example: 'Windows API: PoolFunction. Java: Executors.newFixedThreadPool(n)',
                  },
                  {
                    name: 'Fork-Join',
                    color: '#10b981',
                    icon: '🍴',
                    desc: 'The main thread forks (creates) child threads that run in parallel. After all children complete, the main thread joins (waits for) all children. Then combines results.',
                    advantages: [
                      'Natural for divide-and-conquer algorithms',
                      'Clean synchronization model',
                      'Java ForkJoinPool handles recursion automatically',
                      'Framework decides optimal thread count',
                    ],
                    example: 'Java: ForkJoinPool, RecursiveTask, RecursiveAction',
                  },
                  {
                    name: 'OpenMP',
                    color: '#8b5cf6',
                    icon: '⚡',
                    desc: 'Compiler directives and API for C/C++/Fortran. Add a single pragma line and the compiler parallelizes the loop automatically. Identifies parallel regions.',
                    advantages: [
                      'Minimal code changes needed',
                      'Compiler handles thread creation and synchronization',
                      'Works on shared-memory systems',
                      'Widely supported by GCC, Clang, MSVC',
                    ],
                    example: '#pragma omp parallel for — parallelizes the next for loop',
                  },
                  {
                    name: 'Grand Central Dispatch (GCD)',
                    color: '#f59e0b',
                    icon: '🍎',
                    desc: 'Apple technology for macOS and iOS. Programmer identifies blocks of code that can run in parallel. GCD manages the thread pool and scheduling automatically.',
                    advantages: [
                      'Simple API — just wrap code in a block (^ { })',
                      'System manages optimal number of threads',
                      'Two queue types: serial and concurrent',
                      'Quality-of-service levels for priority',
                    ],
                    example: 'dispatch_async(queue, ^{ /* parallel work */ })',
                  },
                ].map(function(method) {
                  return (
                    <div key={method.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + method.color + '33', borderRadius: 12, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 28 }}>{method.icon}</span>
                        <h4 style={{ fontSize: 17, fontWeight: 700, color: method.color }}>{method.name}</h4>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{method.desc}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {method.advantages.map(function(a) {
                          return <span key={a} style={{ fontSize: 12, background: method.color + '18', color: method.color, padding: '3px 10px', borderRadius: 12, border: '1px solid ' + method.color + '33' }}>{a}</span>
                        })}
                      </div>
                      <div style={{ background: '#0d1117', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#3fb950' }}>{method.example}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>OpenMP Example</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>#include &lt;omp.h&gt;</div>
                  <div style={{ color: '#8b949e' }}>#include &lt;stdio.h&gt;</div>
                  <div></div>
                  <div>int main() {'{'}</div>
                  <div style={{ paddingLeft: 20 }}><span style={{ color: '#8b949e' }}>/* sequential code */</span></div>
                  <div></div>
                  <div style={{ paddingLeft: 20, color: '#f59e0b' }}>#pragma omp parallel</div>
                  <div style={{ paddingLeft: 20 }}>{'{'}</div>
                  <div style={{ paddingLeft: 40 }}>printf(<span style={{ color: '#a5d6ff' }}>"I am a parallel region.\n"</span>);</div>
                  <div style={{ paddingLeft: 20 }}>{'}'}</div>
                  <div></div>
                  <div style={{ paddingLeft: 20 }}><span style={{ color: '#8b949e' }}>/* parallel for loop */</span></div>
                  <div style={{ paddingLeft: 20, color: '#f59e0b' }}>#pragma omp parallel for</div>
                  <div style={{ paddingLeft: 20 }}>for (int i = 0; i &lt; N; i++)</div>
                  <div style={{ paddingLeft: 40 }}>c[i] = a[i] + b[i];</div>
                  <div style={{ paddingLeft: 20 }}><span style={{ color: '#8b949e' }}>/* creates as many threads as there are cores */</span></div>
                  <div>{'}'}</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Intel Threading Building Blocks (TBB):</strong> A C++ template library for parallel programming. parallel_for, parallel_reduce, pipeline — all automatically manage threads. Used in game engines (Intel GPA), video processing, and scientific computing. TBB uses work-stealing — idle threads steal tasks from busy threads' queues.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Thread pool sizing:</strong> How many threads should a pool have? Too few: CPUs sit idle. Too many: context switching overhead and memory waste. A common rule: N_threads = N_cores for CPU-bound work. For I/O-bound work (waiting for network/disk): N_threads = N_cores * (1 + wait_time/compute_time). Modern frameworks like Java ForkJoinPool default to Runtime.getRuntime().availableProcessors().
              </LearnMore>

              <NavButtons prev={function() { setActive('libraries') }} prevLabel="← 4.4 Thread Libraries" next={function() { setActive('issues') }} nextLabel="4.6 Threading Issues →" />
            </div>
          )}

          {active === 'issues' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.6 Threading Issues</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The tricky problems that arise when using threads — from fork() semantics to cancellation.</p>

              <InfoBox color="#ef4444">
                Multithreading introduces complications that don't exist in single-threaded programs. These must be understood and handled carefully or you get bugs that are extremely difficult to reproduce and debug.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>fork() and exec() Semantics</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    If a thread calls fork(), does the new process duplicate <strong style={{ color: 'var(--text-primary)' }}>only the calling thread</strong> or <strong style={{ color: 'var(--text-primary)' }}>all threads</strong>? Some UNIX systems provide two versions of fork.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13, marginBottom: 6 }}>Duplicate all threads</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Used when the new process intends to continue execution in the same multi-threaded manner.</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13, marginBottom: 6 }}>Duplicate only calling thread</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Used when the new process immediately calls exec() — no point copying all threads if they'll be replaced.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>exec() works as normal — replaces the running process including ALL threads with a new program.</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 12 }}>Signal Handling</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    Signals notify a process that an event occurred. A signal handler processes the signal. For multi-threaded processes: which thread receives the signal?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      'Deliver to the thread to which the signal applies',
                      'Deliver to every thread in the process',
                      'Deliver to certain threads in the process',
                      'Assign a specific thread to receive ALL signals',
                    ].map(function(o) {
                      return <div key={o} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>• {o}</div>
                    })}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Thread Cancellation</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    Terminating a thread before it has finished. The thread to be cancelled is the <strong style={{ color: 'var(--text-primary)' }}>target thread</strong>.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 13, marginBottom: 6 }}>Asynchronous Cancellation</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Terminates the target thread immediately. Dangerous if thread holds resources or is in the middle of updating shared data.</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13, marginBottom: 6 }}>Deferred Cancellation</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Thread periodically checks if it should be cancelled at cancellation points. Default in Pthreads. Safer — thread can clean up before terminating.</div>
                    </div>
                  </div>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#e6edf3' }}>
                    <div style={{ color: '#8b949e' }}>/* Pthread cancellation */</div>
                    <div>pthread_t tid;</div>
                    <div>pthread_create(&amp;tid, 0, worker, NULL);</div>
                    <div>pthread_cancel(tid); <span style={{ color: '#8b949e' }}>/* request cancel */</span></div>
                    <div>pthread_join(tid, NULL); <span style={{ color: '#8b949e' }}>/* wait */</span></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #06b6d444', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4', marginBottom: 12 }}>Thread-Local Storage (TLS)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    TLS allows each thread to have its own copy of data. Useful when using thread pools (no control over thread creation). Similar to static data but <strong style={{ color: 'var(--text-primary)' }}>unique to each thread</strong>.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { type: 'Local variables', desc: 'Visible only during one function invocation (on stack)' },
                      { type: 'TLS', desc: 'Visible across function invocations, unique per thread' },
                      { type: 'Global/static', desc: 'Shared across all threads — needs synchronization' },
                    ].map(function(t) {
                      return (
                        <div key={t.type} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 10 }}>
                          <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: 12, marginBottom: 4 }}>{t.type}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.desc}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Scheduler Activations:</strong> Many-to-Many and Two-level models require communication between the user-level thread library and the kernel to maintain the right number of kernel threads. Scheduler activations provide upcalls — a communication mechanism from the kernel to the thread library's upcall handler. When a kernel thread blocks, the kernel notifies the thread library so it can run another user thread on a different LWP.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Cancellation challenges:</strong> Asynchronous cancellation can leave the system in an inconsistent state. If a thread is cancelled while it holds a mutex, the mutex is never released — deadlock. If cancelled while writing to a file, the file is corrupted. This is why deferred cancellation with cleanup handlers (pthread_cleanup_push/pop) is the safe approach.
              </LearnMore>

              <NavButtons prev={function() { setActive('implicit') }} prevLabel="← 4.5 Implicit Threading" next={function() { setActive('os') }} nextLabel="4.7 OS Examples →" />
            </div>
          )}

          {active === 'os' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>4.7 OS Examples — Windows and Linux Threads</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How real operating systems implement threads under the hood.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Windows Threads</h3>
              <InfoBox color="#3b82f6">
                Windows API is the primary API for Windows applications. Windows implements the <strong>one-to-one mapping</strong> — each user thread maps to one kernel thread.
              </InfoBox>

              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '16px 0 12px' }}>Windows Thread Data Structures</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { name: 'ETHREAD', color: '#3b82f6', where: 'Kernel space', desc: 'Executive thread block. Includes pointer to the process it belongs to and pointer to KTHREAD. Entry point for thread.' },
                  { name: 'KTHREAD', color: '#8b5cf6', where: 'Kernel space', desc: 'Kernel thread block. Scheduling and synchronization info, kernel-mode stack, pointer to TEB.' },
                  { name: 'TEB', color: '#10b981', where: 'User space', desc: 'Thread Environment Block. Thread ID, user-mode stack, thread-local storage. Accessible from user mode.' },
                ].map(function(ds) {
                  return (
                    <div key={ds.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + ds.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: ds.color, marginBottom: 4, fontSize: 14 }}>{ds.name}</div>
                      <div style={{ fontSize: 11, color: ds.color + 'aa', marginBottom: 8, background: ds.color + '22', padding: '2px 8px', borderRadius: 10, display: 'inline-block' }}>{ds.where}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ds.desc}</p>
                    </div>
                  )
                })}
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
                Each thread also has: a <strong style={{ color: 'var(--text-primary)' }}>thread ID</strong>, a <strong style={{ color: 'var(--text-primary)' }}>register set</strong> representing CPU state, separate <strong style={{ color: 'var(--text-primary)' }}>user and kernel stacks</strong>, and a <strong style={{ color: 'var(--text-primary)' }}>private data storage area</strong> for run-time libraries and DLLs. Together, register set + stacks + private storage = the <em>context</em> of the thread.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Linux Threads</h3>
              <InfoBox color="#10b981">
                Linux refers to threads as <strong>tasks</strong> rather than threads. Thread creation is done through <strong>clone()</strong> system call. clone() allows a child task to share the address space of the parent task. Flags control what is shared.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Linux clone() flags */</div>
                  <div>CLONE_FS   <span style={{ color: '#8b949e' }}>/* file system info is shared */</span></div>
                  <div>CLONE_VM   <span style={{ color: '#8b949e' }}>/* same memory space shared */</span></div>
                  <div>CLONE_SIGHAND <span style={{ color: '#8b949e' }}>/* signal handlers shared */</span></div>
                  <div>CLONE_FILES <span style={{ color: '#8b949e' }}>/* set of open files shared */</span></div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* thread = all flags set */</div>
                  <div style={{ color: '#8b949e' }}>/* process = no flags set (fork) */</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Thread (clone with all flags)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Shares memory space with parent</li>
                    <li>Shares file descriptors</li>
                    <li>Shares signal handlers</li>
                    <li>Same process ID group</li>
                    <li>Uses pthread_create() internally</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Process (fork = clone with no flags)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Gets a COPY of parent memory (COW)</li>
                    <li>Gets copies of file descriptors</li>
                    <li>Gets copies of signal handlers</li>
                    <li>New process ID</li>
                    <li>Uses fork() internally</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux task_struct for threads:</strong> In Linux, both processes and threads are represented by task_struct. The struct task_struct contains a pointer mm to the memory descriptor. For threads (clone with CLONE_VM), all threads in the same process point to the SAME mm struct. For processes (fork), each has its own copy. This is elegant — one unified structure for both concepts.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Thread IDs in Linux:</strong> Linux gives each thread its own PID (process ID) from the kernel's perspective. But the POSIX standard requires all threads in a process to share the same PID. Linux solves this with TGID (Thread Group ID) — all threads in the same process have the same TGID (equal to the PID of the first thread). getpid() returns TGID; gettid() returns the kernel-level PID.
              </LearnMore>

              <NavButtons prev={function() { setActive('issues') }} prevLabel="← 4.6 Issues" next={function() { setActive('simulator') }} nextLabel="Thread Simulator →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Thread Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>See Amdahl's Law and thread scheduling in action.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Amdahl's Law Interactive Calculator</h3>
              <AmdahlCalculator />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Thread Scheduler on Multiple Cores</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Select the number of CPU cores and watch 8 threads get scheduled. Notice how more cores means more threads running simultaneously — true parallelism.
              </p>
              <ThreadSimulator />

              <NavButtons prev={function() { setActive('os') }} prevLabel="← 4.7 OS Examples" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Threads in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Write and run threaded programs. Copy code and run in any online compiler.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#8b5cf6' }}>Lab 1 — Thread Info in Python</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Python's threading module lets you create and manage threads. Notice how all threads share the same process memory.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Threads in Java</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Java threads using the Runnable interface — the standard approach. The JVM maps these to native OS threads.
              </p>
              <CodeEditor defaultLang="java" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#06b6d4' }}>Lab 3 — Explore Threads in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ps -eLf',                      'Show all threads (LWPs) in system'],
                  ['ps -L -p 1',                   'Show threads of process with PID 1'],
                  ['top -H',                       'Show individual threads in top'],
                  ['cat /proc/1/status',           'See thread count of process 1'],
                  ['ls /proc/1/task/',             'List all threads (tasks) of process 1'],
                  ['pstree -p',                    'Show process tree with PIDs'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', minWidth: 200, flexShrink: 0 }}>{item[0]}</code>
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 4.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#8b5cf6' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#8b5cf6', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, lineHeight: 1.5 }}>{QUIZ[quiz.current].q}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      {QUIZ[quiz.current].options.map(function(opt, i) {
                        let bg = 'var(--bg-secondary)', border = 'var(--border)', color = 'var(--text-primary)'
                        if (quiz.answered) {
                          if (i === QUIZ[quiz.current].answer) { bg = '#8b5cf618'; border = '#8b5cf6'; color = '#8b5cf6' }
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
                        <div style={{ background: '#8b5cf618', border: '1px solid #8b5cf644', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          Explanation: {QUIZ[quiz.current].explanation}
                        </div>
                        <button onClick={nextQuestion} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 4!' : quiz.score >= 4 ? 'Good work! Review the sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                        Retry Quiz
                      </button>
                      <button onClick={function() { window.location.href = '/chapter/5' }} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                        Next: Chapter 5 →
                      </button>
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