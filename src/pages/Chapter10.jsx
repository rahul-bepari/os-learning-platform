import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'background',   title: '10.1 Background',           icon: '📖' },
  { id: 'demand',       title: '10.2 Demand Paging',        icon: '📄' },
  { id: 'cow',          title: '10.3 Copy-on-Write',        icon: '🔀' },
  { id: 'replacement',  title: '10.4 Page Replacement',     icon: '🔄' },
  { id: 'algorithms',   title: '10.5 PR Algorithms',        icon: '📊' },
  { id: 'allocation',   title: '10.6 Frame Allocation',     icon: '📦' },
  { id: 'thrashing',    title: '10.7 Thrashing',            icon: '🔥' },
  { id: 'simulator',    title: '🎮 Simulators',             icon: '🎮' },
  { id: 'lab',          title: '💻 Lab',                    icon: '💻' },
  { id: 'quiz',         title: '🧠 Quiz',                   icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is demand paging?',
    options: [
      'Loading all pages of a process before it starts',
      'Loading pages only when they are needed (on demand)',
      'Allocating fixed frames to each process',
      'Swapping entire processes to disk'
    ],
    answer: 1,
    explanation: 'Demand paging loads pages only when they are accessed — not at process startup. If a page is not in memory when accessed, a page fault occurs and the OS loads it from disk. This allows processes to start faster and use less memory.'
  },
  {
    q: 'What happens during a page fault?',
    options: [
      'The process is terminated',
      'The OS traps, loads the missing page from disk into a free frame, updates the page table, and restarts the instruction',
      'The CPU generates an error signal',
      'The page is permanently removed from the address space'
    ],
    answer: 1,
    explanation: 'On a page fault: (1) OS traps, (2) save process state, (3) find the page on disk, (4) find a free frame, (5) load page into frame, (6) update page table, (7) restart the faulting instruction. The process is blocked during I/O but then resumes transparently.'
  },
  {
    q: 'Which page replacement algorithm is provably optimal but impossible to implement in practice?',
    options: ['FIFO', 'LRU', 'Optimal (OPT)', 'Clock'],
    answer: 2,
    explanation: 'The Optimal algorithm replaces the page that will not be used for the longest time in the future. It gives the minimum page fault rate. It cannot be implemented because it requires future knowledge of page references. It is used as a benchmark to evaluate other algorithms.'
  },
  {
    q: 'What is Belady\'s Anomaly?',
    options: [
      'LRU performs worse than FIFO',
      'Adding more frames can sometimes INCREASE the page fault rate for FIFO',
      'Optimal algorithm causes more page faults than LRU',
      'Page faults increase when processes share pages'
    ],
    answer: 1,
    explanation: "Belady's Anomaly: for FIFO replacement, increasing the number of frames can actually increase the number of page faults. This seems counterintuitive — more memory causing more faults. LRU and Optimal do NOT suffer from Belady's Anomaly (they are stack algorithms)."
  },
  {
    q: 'What is thrashing?',
    options: [
      'When a process uses too much CPU',
      'When a process spends more time paging (loading/unloading pages) than executing',
      'When too many processes are in the ready queue',
      'When page tables become too large'
    ],
    answer: 1,
    explanation: 'Thrashing occurs when a process does not have enough frames for its working set. It constantly page faults, loads a page, which displaces another needed page, causing another fault. CPU utilization drops to near zero — the system is just doing I/O for page swapping.'
  },
  {
    q: 'What does the Working Set Model track?',
    options: [
      'The total number of frames in the system',
      'The set of pages actively used by a process in the recent past (within a window delta)',
      'The number of page faults per second',
      'The CPU utilization of each process'
    ],
    answer: 1,
    explanation: 'The Working Set Model tracks the set of pages referenced in the last delta time units (the working set window). If a process has enough frames for its entire working set, it will not thrash. The OS monitors working sets and suspends processes if total demand exceeds available frames.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #a855f755', color: '#a855f7', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(168,85,247,0.06)', border: '1px solid #a855f733', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#a855f7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

// ── Page Replacement Simulator ────────────────────────────────
function PageReplacementSim() {
  const [algorithm, setAlgorithm] = useState('fifo')
  const [frames, setFrames] = useState(3)
  const [refString, setRefString] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2')
  const [result, setResult] = useState(null)

  function runFIFO(refs, n) {
    const memory = []
    const queue  = []
    let faults   = 0
    const steps  = []

    refs.forEach(function(page) {
      let fault = false
      if (!memory.includes(page)) {
        fault = true
        faults++
        if (memory.length < n) {
          memory.push(page)
          queue.push(page)
        } else {
          const victim = queue.shift()
          const idx = memory.indexOf(victim)
          memory[idx] = page
          queue.push(page)
        }
      }
      steps.push({ page, memory: [...memory], fault })
    })
    return { faults, steps }
  }

  function runLRU(refs, n) {
    const memory = []
    let faults   = 0
    const steps  = []

    refs.forEach(function(page, i) {
      let fault = false
      if (!memory.includes(page)) {
        fault = true
        faults++
        if (memory.length < n) {
          memory.push(page)
        } else {
          let lruIdx = 0, lruTime = Infinity
          memory.forEach(function(p, j) {
            let lastUse = -1
            for (let k = i - 1; k >= 0; k--) {
              if (refs[k] === p) { lastUse = k; break }
            }
            if (lastUse < lruTime) { lruTime = lastUse; lruIdx = j }
          })
          memory[lruIdx] = page
        }
      }
      steps.push({ page, memory: [...memory], fault })
    })
    return { faults, steps }
  }

  function runOptimal(refs, n) {
    const memory = []
    let faults   = 0
    const steps  = []

    refs.forEach(function(page, i) {
      let fault = false
      if (!memory.includes(page)) {
        fault = true
        faults++
        if (memory.length < n) {
          memory.push(page)
        } else {
          let replaceIdx = 0, farthest = -1
          memory.forEach(function(p, j) {
            let nextUse = Infinity
            for (let k = i + 1; k < refs.length; k++) {
              if (refs[k] === p) { nextUse = k; break }
            }
            if (nextUse > farthest) { farthest = nextUse; replaceIdx = j }
          })
          memory[replaceIdx] = page
        }
      }
      steps.push({ page, memory: [...memory], fault })
    })
    return { faults, steps }
  }

  function calculate() {
    const refs = refString.trim().split(/\s+/).map(Number).filter(function(n) { return !isNaN(n) })
    if (refs.length === 0) return
    let res
    if (algorithm === 'fifo')    res = runFIFO(refs, frames)
    else if (algorithm === 'lru') res = runLRU(refs, frames)
    else res = runOptimal(refs, frames)
    setResult({ ...res, refs })
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Page Replacement Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Enter a reference string and see page faults for FIFO, LRU, and Optimal.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'fifo',    label: 'FIFO' },
          { key: 'lru',     label: 'LRU' },
          { key: 'optimal', label: 'Optimal' },
        ].map(function(a) {
          return (
            <button key={a.key} onClick={function() { setAlgorithm(a.key); setResult(null) }} style={{ background: algorithm === a.key ? '#a855f733' : 'var(--bg-secondary)', color: algorithm === a.key ? '#a855f7' : 'var(--text-secondary)', border: '1px solid ' + (algorithm === a.key ? '#a855f7' : 'var(--border)'), padding: '6px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: algorithm === a.key ? 700 : 400 }}>
              {a.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Number of Frames</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(function(n) {
              return (
                <button key={n} onClick={function() { setFrames(n); setResult(null) }} style={{ background: frames === n ? '#a855f7' : 'var(--bg-secondary)', color: frames === n ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (frames === n ? '#a855f7' : 'var(--border)'), padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {n}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Reference String (space-separated)</div>
          <input value={refString} onChange={function(e) { setRefString(e.target.value); setResult(null) }} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <button onClick={calculate} style={{ background: '#a855f7', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          Run
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: '#ef444418', border: '1px solid #ef444444', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{result.faults}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page Faults</div>
            </div>
            <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{result.refs.length - result.faults}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hits</div>
            </div>
            <div style={{ background: '#a855f718', border: '1px solid #a855f744', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#a855f7' }}>{((result.refs.length - result.faults) / result.refs.length * 100).toFixed(1)}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hit Rate</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <td style={{ padding: '6px 10px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Step</td>
                  {result.steps.map(function(s, i) {
                    return (
                      <td key={i} style={{ padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)', background: s.fault ? '#ef444418' : 'transparent', color: s.fault ? '#ef4444' : 'var(--text-secondary)', fontWeight: s.fault ? 700 : 400 }}>
                        {s.page}
                        {s.fault && <div style={{ fontSize: 9, color: '#ef4444' }}>FAULT</div>}
                      </td>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: frames }, function(_, f) {
                  return (
                    <tr key={f} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>F{f}</td>
                      {result.steps.map(function(s, i) {
                        return (
                          <td key={i} style={{ padding: '6px 10px', textAlign: 'center', color: '#a855f7', fontWeight: 600, background: s.fault && s.memory[f] !== undefined ? '#a855f711' : 'transparent' }}>
                            {s.memory[f] !== undefined ? s.memory[f] : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page Fault Steps Visualizer ───────────────────────────────
function PageFaultVisualizer() {
  const [step, setStep] = useState(0)

  const steps = [
    { title: 'Process accesses page', desc: 'The CPU generates a logical address. The MMU checks the page table for this page number.', highlight: 'cpu' },
    { title: 'Page table lookup', desc: 'The valid-invalid bit for this page is 0 (invalid). The page is NOT in memory. The MMU generates a trap — a page fault interrupt.', highlight: 'pagetable' },
    { title: 'OS trap handler', desc: 'The OS traps to page fault handler. Check: is this a valid reference? If invalid (bad address) → terminate process. If valid but not in memory → continue.', highlight: 'os' },
    { title: 'Find a free frame', desc: 'OS finds a free frame in physical memory (or selects a victim frame using a replacement algorithm if no free frames exist).', highlight: 'memory' },
    { title: 'Load page from disk', desc: 'OS schedules a disk I/O operation to read the page from the swap space (or file system). The process is BLOCKED during this I/O.', highlight: 'disk' },
    { title: 'Update page table', desc: 'I/O completes. OS updates the page table: set valid bit to 1, set frame number to the new frame. Process moved to ready queue.', highlight: 'pagetable' },
    { title: 'Restart instruction', desc: 'Process gets CPU again. The faulting instruction is RESTARTED from the beginning. This time the page IS in memory — execution continues normally.', highlight: 'cpu' },
  ]

  const icons = { cpu: '💻', pagetable: '📋', os: '⚙️', memory: '💾', disk: '💿' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Page Fault Handler Steps</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Step through exactly what happens when a page fault occurs.</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {steps.map(function(s, i) {
          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#a855f7' : 'var(--border)', transition: 'all 0.3s' }} />
        })}
      </div>

      <div style={{ background: '#a855f718', border: '1px solid #a855f744', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{icons[steps[step].highlight]}</span>
          <div style={{ fontWeight: 700, color: '#a855f7', fontSize: 16 }}>Step {step + 1}: {steps[step].title}</div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{steps[step].desc}</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={function() { setStep(function(s) { return Math.max(s - 1, 0) }) }} disabled={step === 0} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 18px', borderRadius: 8, cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: step === 0 ? 0.5 : 1 }}>Previous</button>
        <button onClick={function() { setStep(function(s) { return Math.min(s + 1, steps.length - 1) }) }} disabled={step === steps.length - 1} style={{ background: '#a855f7', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: step === steps.length - 1 ? 0.5 : 1 }}>Next</button>
        <button onClick={function() { setStep(0) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

export default function Chapter10() {
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

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #a855f744', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#a855f7', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 10</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🌀</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Virtual Memory</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          Running processes larger than physical memory — demand paging, page replacement algorithms, frame allocation, and thrashing.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Demand Paging', 'Page Fault Visualizer', 'FIFO vs LRU vs Optimal', 'Thrashing', 'Working Set'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f733', color: '#a855f7', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#a855f7' : 'var(--text-secondary)', background: active === s.id ? 'rgba(168,85,247,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #a855f7' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'background' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.1 Background</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Why virtual memory — the key insight that unlocks modern computing.</p>

              <InfoBox color="#a855f7">
                <strong>Virtual memory</strong> separates logical memory from physical memory. A process's logical address space can be much larger than physical memory. Only the <strong>currently needed parts</strong> of a process need to be in memory. The rest stays on disk.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Benefits of Virtual Memory</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { benefit: 'Programs larger than RAM', color: '#a855f7', desc: 'A process with a 4GB address space can run on a machine with 1GB of RAM. Only active pages need to be in memory at any time.' },
                  { benefit: 'More processes in memory', color: '#3b82f6', desc: 'Since each process only uses part of its logical space, more processes can fit simultaneously. Increased CPU utilization and throughput.' },
                  { benefit: 'Less I/O for loading', color: '#10b981', desc: 'Programs start faster — only the first few pages needed to start execution are loaded. Rest loaded on demand as needed.' },
                  { benefit: 'Efficient sharing', color: '#f59e0b', desc: 'Shared libraries and shared memory regions can be mapped into multiple process address spaces without duplication.' },
                ].map(function(b) {
                  return (
                    <div key={b.benefit} style={{ background: 'var(--bg-card)', border: '1px solid ' + b.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: b.color, marginBottom: 8, fontSize: 13 }}>{b.benefit}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Virtual Address Space</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                The virtual address space of a process typically looks like this — code at the bottom, stack at the top growing down, heap growing up. The large hole in the middle is virtual address space that is NOT backed by any physical memory unless used. Only pages actually accessed need frames.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, marginBottom: 24 }}>
                {[
                  { label: 'max', color: '#6e7681', text: 'max virtual address' },
                  { label: 'Stack', color: '#3b82f6', text: 'Stack (grows downward)' },
                  { label: '↑ hole ↓', color: '#1c2128', text: 'Unused virtual space (no physical backing)' },
                  { label: 'Heap', color: '#f59e0b', text: 'Heap (grows upward)' },
                  { label: 'Data', color: '#8b5cf6', text: 'BSS + Data sections' },
                  { label: 'Code', color: '#10b981', text: 'Text (code) — read only' },
                  { label: '0', color: '#6e7681', text: 'address 0 (unmapped — null pointer protection)' },
                ].map(function(r) {
                  return (
                    <div key={r.label} style={{ background: r.color === '#1c2128' ? '#1c2128' : r.color + '22', border: '1px solid ' + r.color + '44', borderRadius: 4, padding: '6px 12px', fontSize: 12, color: r.color === '#1c2128' ? '#484f58' : r.color, fontWeight: 600 }}>
                      {r.text}
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Sparse address spaces:</strong> Modern 64-bit processes have 128TB of virtual address space but might only use a few GB. The vast majority of the address space is unused — no physical memory or disk space is consumed for these unused regions. Multi-level page tables (Chapter 9) handle this efficiently by only allocating page table nodes for used regions.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Virtual memory implementation requires:</strong> Hardware support (MMU with valid-invalid bit in page table entries), OS support (page fault handler, swap space management, page replacement policy), and disk I/O system (to bring pages in and out). Without hardware support, virtual memory is impossible to implement efficiently.
              </LearnMore>

              <NavButtons next={function() { setActive('demand') }} nextLabel="10.2 Demand Paging →" />
            </div>
          )}

          {active === 'demand' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.2 Demand Paging</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Load pages only when they are needed — the core of virtual memory.</p>

              <InfoBox color="#3b82f6">
                <strong>Demand paging</strong>: bring a page into memory only when it is needed. Pages are loaded on demand — when a process accesses a page that is not in memory, a <strong>page fault</strong> occurs and the OS loads it. Never loaded pages = never loaded into memory.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Valid-Invalid Bit</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Each page table entry has a <strong style={{ color: '#a855f7' }}>valid-invalid bit</strong>:
                <br />• <strong style={{ color: '#10b981' }}>valid (1)</strong>: page is in memory and legally in the process's address space
                <br />• <strong style={{ color: '#ef4444' }}>invalid (0)</strong>: page is either not in the address space OR is in the address space but currently on disk (swapped out)
              </p>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Page table with valid-invalid bits */</div>
                  <div>Page 0: frame=5, <span style={{ color: '#10b981' }}>valid=1</span>  <span style={{ color: '#8b949e' }}>← in memory, accessible</span></div>
                  <div>Page 1: frame=3, <span style={{ color: '#10b981' }}>valid=1</span>  <span style={{ color: '#8b949e' }}>← in memory, accessible</span></div>
                  <div>Page 2: frame=?, <span style={{ color: '#ef4444' }}>valid=0</span>  <span style={{ color: '#8b949e' }}>← on disk, page fault if accessed</span></div>
                  <div>Page 3: frame=7, <span style={{ color: '#10b981' }}>valid=1</span>  <span style={{ color: '#8b949e' }}>← in memory, accessible</span></div>
                  <div>Page 4: frame=?, <span style={{ color: '#ef4444' }}>valid=0</span>  <span style={{ color: '#8b949e' }}>← on disk, page fault if accessed</span></div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Page Fault Handling — Step by Step</h3>
              <PageFaultVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Performance of Demand Paging</h3>
              <InfoBox color="#f59e0b">
                Page fault rate p (0 ≤ p ≤ 1). If p = 0 — no faults. If p = 1 — every access is a fault.
                <br /><br />
                <strong>EAT = (1-p) × memory_access + p × page_fault_time</strong>
                <br /><br />
                Page fault time ≈ 8ms (disk seek + rotational latency + transfer). Memory access ≈ 200ns.
                <br />If p = 1/1000: EAT = 0.999 × 200ns + 0.001 × 8ms = 8.2μs — 40x slower than no paging!
                <br />Must keep p very small — usually less than 1/100,000.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Pure demand paging:</strong> Start a process with NO pages in memory. The very first instruction causes a page fault. Load that page. Execute. Fault again. Eventually the working set is in memory and faults become rare. In practice, most systems use a combination: pre-fetch a few pages at startup (prepaging) to reduce initial faults, then switch to pure demand paging.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Swap space vs file system:</strong> Pages can be brought from a dedicated swap partition (faster — sequential I/O, no file system overhead) or from the file system (for memory-mapped files, executables). Linux uses both: text/code segments are demand-paged from the executable file; anonymous memory (heap, stack) is swapped to the swap partition. This is why deleting a running executable does not crash it — the code is already memory-mapped.
              </LearnMore>

              <NavButtons prev={function() { setActive('background') }} prevLabel="← 10.1 Background" next={function() { setActive('cow') }} nextLabel="10.3 Copy-on-Write →" />
            </div>
          )}

          {active === 'cow' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.3 Copy-on-Write</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Making fork() fast — share pages until one process writes to them.</p>

              <InfoBox color="#10b981">
                <strong>Copy-on-Write (COW)</strong> allows parent and child processes to initially share the same pages. A page is copied only when one of them writes to it. This makes fork() extremely fast — no copying at all until actually needed.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>How COW Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'Parent calls fork(). OS creates child process with a new page table.' },
                  { n: 2, color: '#3b82f6', text: 'Instead of copying all pages, both page tables point to the SAME physical frames. Pages marked as copy-on-write (read-only for both).' },
                  { n: 3, color: '#f59e0b', text: 'Either process reads a page → no copy needed, just use the shared frame. Fast!' },
                  { n: 4, color: '#ef4444', text: 'Either process WRITES to a page → page fault! OS detects COW flag.' },
                  { n: 5, color: '#10b981', text: 'OS makes a copy of that page frame. Updates the writing process\'s page table to point to the new copy. Clears COW flag on both.' },
                  { n: 6, color: '#10b981', text: 'Write proceeds on the private copy. Other process still uses the original. Only changed pages are ever copied!' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>After fork() — shared pages</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>Parent PT: Page 0 → Frame 3 (COW)</div>
                    <div>Child PT:  Page 0 → Frame 3 (COW)</div>
                    <div style={{ color: '#8b949e' }}>Both share same frame!</div>
                    <div style={{ color: '#10b981', marginTop: 4 }}>0 pages copied</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>After child writes to Page 0</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                    <div>Parent PT: Page 0 → Frame 3 (orig)</div>
                    <div>Child PT:  Page 0 → Frame 9 (copy)</div>
                    <div style={{ color: '#8b949e' }}>Child gets private copy</div>
                    <div style={{ color: '#f59e0b', marginTop: 4 }}>1 page copied on demand</div>
                  </div>
                </div>
              </div>

              <InfoBox color="#f59e0b">
                <strong>vfork()</strong> is an even more aggressive optimization. It does NOT copy the page table at all — the child shares the parent's address space until exec(). The parent is suspended while the child runs. Used specifically for the fork-exec pattern where the child immediately calls exec(). Extremely fast.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>COW in containers (Docker):</strong> Docker uses COW extensively at multiple levels. The UnionFS/OverlayFS filesystems use COW — a container starts with read-only image layers and a writable COW layer on top. Reading a file uses the read-only layer. Writing a file copies it to the COW layer first. This is why container startup is instant — no data is actually copied until the container writes something.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Zero-fill-on-demand:</strong> When a process requests new memory (malloc calls brk/mmap), the OS doesn't actually allocate physical frames immediately. Instead, all new pages are mapped to a single shared "zero page" (read-only). When the process first writes, COW triggers and a zeroed frame is allocated. This makes malloc nearly free for memory you never actually use.
              </LearnMore>

              <NavButtons prev={function() { setActive('demand') }} prevLabel="← 10.2 Demand Paging" next={function() { setActive('replacement') }} nextLabel="10.4 Page Replacement →" />
            </div>
          )}

          {active === 'replacement' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.4 Page Replacement</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What to do when there are no free frames — choosing a victim.</p>

              <InfoBox color="#ef4444">
                When a page fault occurs and there are <strong>no free frames</strong>, the OS must <strong>replace</strong> an existing page. It selects a victim page, writes it to disk if dirty (modified), loads the new page, and updates both page table entries. This adds significant overhead — up to 2 extra disk I/Os.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Page Replacement Steps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, text: 'Find the location of the needed page on disk.' },
                  { n: 2, text: 'Find a free frame. If one exists, use it. If not, use a page replacement algorithm to select a victim frame.' },
                  { n: 3, text: 'If the victim frame is dirty (modified bit = 1), write it to disk. Set its valid bit to 0 in the page table.' },
                  { n: 4, text: 'Read the desired page into the (now free) frame. Update its page table entry: frame number + valid = 1.' },
                  { n: 5, text: 'Restart the process from the faulting instruction.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>The Dirty (Modify) Bit</h3>
              <InfoBox color="#f59e0b">
                The <strong>dirty bit (modify bit)</strong> is set by hardware whenever a page is written. If dirty=0 when evicted, no disk write needed — the disk copy is still valid. If dirty=1, must write to disk before eviction. This optimization reduces I/O — clean pages are simply discarded and reloaded from disk if needed again.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Two Sub-Problems</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Frame Allocation</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>How many frames to give each process? Minimum needed for correctness, maximum is all available. More frames = fewer page faults.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #a855f744', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#a855f7', marginBottom: 8 }}>Page Replacement Policy</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Which page to evict when all frames are full? Goal: minimize page faults. FIFO, LRU, Optimal, Clock, etc.</p>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Global vs local replacement:</strong> Local replacement: each process can only replace its own pages — isolated from other processes but may not use available frames efficiently. Global replacement: process can steal frames from other processes — higher overall throughput but one process can cause others to thrash. Linux uses global replacement with priority aging.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Page buffering:</strong> To reduce the penalty of replacement, maintain a pool of free frames. When a page fault occurs, immediately load the new page into a free frame from the pool (no wait). In the background, write dirty victim pages and add their frames back to the pool. Also: keep a list of recently evicted clean pages — if re-requested before overwritten, just restore (no disk I/O needed).
              </LearnMore>

              <NavButtons prev={function() { setActive('cow') }} prevLabel="← 10.3 Copy-on-Write" next={function() { setActive('algorithms') }} nextLabel="10.5 PR Algorithms →" />
            </div>
          )}

          {active === 'algorithms' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.5 Page Replacement Algorithms</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Comparing FIFO, Optimal, LRU, and LRU approximations.</p>

              <InfoBox color="#a855f7">
                Goal: minimize the number of page faults. We evaluate algorithms by running them on a <strong>reference string</strong> (sequence of page accesses) with a fixed number of frames.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>FIFO (First-In, First-Out)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Replace the page that has been in memory the longest. Simple queue — when a frame is needed, evict the oldest page. Easy to implement with a queue.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ fontSize: 13, color: '#10b981' }}>✓ Simple to implement</div>
                    <div style={{ fontSize: 13, color: '#10b981' }}>✓ Low overhead</div>
                    <div style={{ fontSize: 13, color: '#ef4444' }}>✗ Old page may be frequently used</div>
                    <div style={{ fontSize: 13, color: '#ef4444' }}>✗ Suffers from Belady's Anomaly</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Optimal Algorithm (OPT)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Replace the page that will NOT be used for the longest time in the future. Provably optimal — gives the minimum possible page fault rate. CANNOT be implemented — requires future knowledge. Used as a benchmark.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ fontSize: 13, color: '#10b981' }}>✓ Minimum page faults possible</div>
                    <div style={{ fontSize: 13, color: '#10b981' }}>✓ No Belady's Anomaly</div>
                    <div style={{ fontSize: 13, color: '#ef4444' }}>✗ Impossible to implement</div>
                    <div style={{ fontSize: 13, color: '#ef4444' }}>✗ Only useful as a benchmark</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>LRU (Least Recently Used)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Replace the page that has not been used for the longest time. Uses the recent past as an approximation of the near future (locality principle). Good approximation of Optimal. No Belady's Anomaly.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#10b981' }}>✓ Good performance</div>
                    <div style={{ fontSize: 13, color: '#10b981' }}>✓ No Belady's Anomaly</div>
                    <div style={{ fontSize: 13, color: '#ef4444' }}>✗ Expensive to implement exactly</div>
                    <div style={{ fontSize: 13, color: '#ef4444' }}>✗ Requires hardware support</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Implementation: Counter (timestamp each access), or Stack (most recently used on top). Both require hardware support to update on every memory access — expensive!</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 12, padding: 24 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>LRU Approximation — Clock Algorithm (Second Chance)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Uses a reference bit (set by hardware when page is accessed). Clock hand sweeps frames in circular order. If reference bit = 1: clear it and move on (give it a second chance). If reference bit = 0: replace this page. Simple, efficient, widely used in practice.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.9 }}>
                    <div style={{ color: '#8b949e' }}>/* Clock algorithm */</div>
                    <div>while (frame[hand].ref_bit == 1) {'{'}</div>
                    <div style={{ paddingLeft: 16 }}>frame[hand].ref_bit = 0;</div>
                    <div style={{ paddingLeft: 16 }}>hand = (hand + 1) % num_frames;</div>
                    <div>{'}'}</div>
                    <div style={{ color: '#10b981' }}>replace frame[hand]; <span style={{ color: '#8b949e' }}>/* ref_bit was 0 */</span></div>
                  </div>
                </div>

              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Belady's Anomaly</h3>
              <InfoBox color="#ef4444">
                For FIFO: with 3 frames and reference string 1,2,3,4,1,2,5,1,2,3,4,5 → 9 page faults. With 4 frames → 10 page faults! More frames caused MORE faults. This is Belady's Anomaly. LRU and Optimal are <strong>stack algorithms</strong> — adding frames never increases page faults.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Simulator</h3>
              <PageReplacementSim />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Enhanced second chance (Linux):</strong> Linux uses a variant with two bits: reference bit and dirty bit. Pages are categorized: (0,0) not recently used and clean — best to replace; (0,1) not recently used but dirty — needs write; (1,0) recently used and clean; (1,1) recently used and dirty — worst to replace. This gives priority to clean pages to avoid write I/O.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Linux's actual page replacement (kswapd):</strong> Linux uses an active/inactive list approach (not classic clock). Pages move from active to inactive list based on reference bits. kswapd daemon scans inactive list and reclaims cold pages. Pages can be promoted back to active if accessed again. This gives a two-level approximation of LRU with much lower overhead than exact LRU.
              </LearnMore>

              <NavButtons prev={function() { setActive('replacement') }} prevLabel="← 10.4 Replacement" next={function() { setActive('allocation') }} nextLabel="10.6 Frame Allocation →" />
            </div>
          )}

          {active === 'allocation' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.6 Frame Allocation</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How to distribute available frames among competing processes.</p>

              <InfoBox color="#3b82f6">
                With multiple processes, how many frames should each get? The OS must balance: give too few and a process thrashes, give too many to one and others suffer. There is a <strong>minimum number</strong> of frames required for correctness (based on instruction complexity).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Minimum Number of Frames</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                The minimum number of frames per process is determined by the instruction set architecture. An instruction must be able to complete — if it spans multiple pages and references multiple memory locations, all those pages must be available.
              </p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
                {[
                  { arch: 'Simple load/store', min: 2, desc: '1 for instruction page + 1 for data page' },
                  { arch: 'Two-operand instruction', min: 3, desc: '1 instruction + 2 data pages (source + destination)' },
                  { arch: 'Indirect addressing', min: 4, desc: '1 instruction + 1 address page + 1 address page + 1 data page' },
                  { arch: 'IBM 370 MVC instruction', min: 6, desc: 'Can span pages — needs up to 6 frames to guarantee completion' },
                ].map(function(r) {
                  return (
                    <div key={r.arch} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 12, minWidth: 180 }}>{r.arch}</div>
                      <div style={{ background: '#3b82f622', color: '#3b82f6', padding: '2px 10px', borderRadius: 10, fontWeight: 700, fontSize: 12, minWidth: 60, textAlign: 'center' }}>min: {r.min}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Allocation Algorithms</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { name: 'Equal Allocation', color: '#3b82f6', desc: 'If 100 frames and 5 processes, give each 20 frames. Simple but ignores that processes have very different memory needs. A small utility gets same frames as a large database.' },
                  { name: 'Proportional Allocation', color: '#10b981', desc: 'Allocate according to process size or priority. If process i has size s_i and total size S, then frames_i = (s_i / S) * total_frames. Better utilization.' },
                  { name: 'Priority Allocation', color: '#f59e0b', desc: 'High priority processes get more frames. If P1 has higher priority than P2, P1 gets more frames, resulting in fewer page faults and better performance for P1.' },
                  { name: 'Working Set', color: '#a855f7', desc: 'Each process gets exactly enough frames for its working set. If total working set exceeds available frames, suspend some processes. Prevents thrashing.' },
                ].map(function(a) {
                  return (
                    <div key={a.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: a.color, marginBottom: 8, fontSize: 13 }}>{a.name}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Global vs Local Replacement</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Global Replacement</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Can steal frames from any process</li>
                    <li>Better overall throughput</li>
                    <li>One process can cause another to thrash</li>
                    <li>More common in practice (Linux)</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Local Replacement</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Each process only replaces its own pages</li>
                    <li>More predictable per-process performance</li>
                    <li>A process can't steal frames from others</li>
                    <li>May underutilize available frames</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>NUMA and frame allocation:</strong> On NUMA systems, allocating frames from the same NUMA node as the CPU running the process is critical for performance. A remote memory access can be 2-3x slower. Linux's NUMA-aware allocator tries to allocate memory on the same node as the running CPU. The numactl command lets you control NUMA memory policy for applications.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Memory pressure and OOM killer:</strong> When Linux runs out of memory and swap, the OOM (Out-of-Memory) killer activates. It scores each process (oom_score) based on memory usage, run time, and nice value. The process with the highest score gets killed. You can adjust oom_score_adj (-1000 to 1000) to protect important processes from being killed. Chrome's sandbox processes set a high oom_score_adj to be killed first if memory runs low.
              </LearnMore>

              <NavButtons prev={function() { setActive('algorithms') }} prevLabel="← 10.5 Algorithms" next={function() { setActive('thrashing') }} nextLabel="10.7 Thrashing →" />
            </div>
          )}

          {active === 'thrashing' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>10.7 Thrashing</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>When paging overhead overwhelms useful work — and how to prevent it.</p>

              <InfoBox color="#ef4444">
                <strong>Thrashing</strong> occurs when a process does not have enough frames for its working set. It immediately page faults. Replaces a page it will need again soon. Page faults again. The process is almost always waiting for I/O — CPU utilization collapses.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Why Thrashing Happens</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'CPU utilization is low → OS thinks: add more processes to improve utilization' },
                  { n: 2, color: '#f59e0b', text: 'More processes → each gets fewer frames (frames are split more ways)' },
                  { n: 3, color: '#ef4444', text: 'Processes with too few frames start thrashing → spend all time on page I/O' },
                  { n: 4, color: '#ef4444', text: 'CPU utilization drops even more → OS adds EVEN MORE processes' },
                  { n: 5, color: '#ef4444', text: 'Death spiral — CPU utilization near 0%, disk I/O at maximum, system appears frozen' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Working Set Model</h3>
              <InfoBox color="#a855f7">
                The <strong>Working Set Model</strong> is based on the locality assumption. The working set of process i at time t with window delta is: WS(t, delta) = set of pages referenced in the last delta time units.
                <br /><br />
                If a process has all its working set pages in memory, it will not thrash. The OS tracks working sets and ensures total demand does not exceed available frames. If demand exceeds supply, suspend some processes.
              </InfoBox>

              <div style={{ background: 'var(--bg-card)', border: '1px solid #a855f744', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: '#a855f7', marginBottom: 12 }}>Working Set Example</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9, background: '#0d1117', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ color: '#8b949e' }}>Reference string: ... 2 6 1 5 7 7 7 5 1 6 2 3 4 1 2 3 4 3 4 4 ...</div>
                  <div style={{ color: '#8b949e' }}>Window delta = 10 time units</div>
                  <div></div>
                  <div>At t=10: WS = {'{'} 1, 2, 5, 6, 7 {'}'} → 5 frames needed</div>
                  <div>At t=14: WS = {'{'} 1, 2, 3, 4, 5, 6 {'}'} → 6 frames needed</div>
                  <div>At t=20: WS = {'{'} 1, 2, 3, 4 {'}'} → 4 frames needed (locality shift)</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total frames needed = sum of all working sets. If this exceeds available frames → suspend a process.</div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Page Fault Frequency (PFF) Strategy</h3>
              <InfoBox color="#10b981">
                More directly control thrashing using Page Fault Frequency. Set upper and lower bounds on desired page fault rate. If rate too high — process needs more frames, allocate more. If rate too low — process has too many frames, take some away. Keeps all processes in the optimal range.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Fault rate above upper bound</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Process is thrashing — give it more frames. If no frames available, suspend a process and redistribute its frames.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Fault rate below lower bound</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Process has more frames than its working set needs. Remove some frames and give them to other processes.</p>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Locality of reference — why virtual memory works:</strong> Programs do not access memory randomly. They exhibit temporal locality (recently accessed locations will be accessed again) and spatial locality (locations near recently accessed ones will be accessed). A process's working set is typically a small fraction of its total address space. Without locality, every access would be a page fault — virtual memory would be unusable.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Prepaging vs demand paging:</strong> Pure demand paging: start with 0 pages, fault on each needed page — many faults at startup. Prepaging: load the working set of suspended/started processes all at once — fewer initial faults but wasted I/O if pages not used. Balance: some OSes use a startup prefetch (bringing in a few pages ahead of the fault) combined with demand paging for steady-state.
              </LearnMore>

              <NavButtons prev={function() { setActive('allocation') }} prevLabel="← 10.6 Frame Allocation" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Virtual Memory Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for page faults and page replacement.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Page Fault Handler</h3>
              <PageFaultVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Page Replacement Algorithms</h3>
              <PageReplacementSim />

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginTop: 16 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Challenges to Try</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { n: 1, text: 'Reproduce Belady\'s Anomaly: use reference string "1 2 3 4 1 2 5 1 2 3 4 5" with 3 frames (FIFO), then 4 frames. See more faults with 4 frames!' },
                    { n: 2, text: 'Compare algorithms: run "7 0 1 2 0 3 0 4 2 3 0 3 2" with 3 frames under FIFO, LRU, and Optimal. Optimal should have fewest faults.' },
                    { n: 3, text: 'See locality: create a reference string that loops (1 2 3 1 2 3 1 2 3). With 3 frames, LRU should have 0 faults after loading — perfect hit rate.' },
                  ].map(function(c) {
                    return (
                      <div key={c.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.n}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.text}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <NavButtons prev={function() { setActive('thrashing') }} prevLabel="← 10.7 Thrashing" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Virtual Memory in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Observe virtual memory in action through code and the terminal.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#a855f7' }}>Lab 1 — Observe Page Faults in Python</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Allocate large memory blocks and observe how the OS handles them with demand paging.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore Virtual Memory in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['cat /proc/vmstat',           'Virtual memory stats (pgfault, pgmajfault)'],
                  ['cat /proc/meminfo',           'Memory info including swap usage'],
                  ['cat /proc/self/status',       'VmRSS (physical), VmSize (virtual) of shell'],
                  ['free -h',                     'RAM and swap usage summary'],
                  ['vmstat 1 5',                  'Virtual memory stats every 1 second (5 times)'],
                  ['cat /proc/self/maps',         'Virtual memory map of current process'],
                  ['getconf PAGE_SIZE',           'Page size in bytes'],
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

              <NavButtons prev={function() { setActive('simulator') }} prevLabel="← Simulators" next={function() { setActive('quiz') }} nextLabel="Take the Quiz →" />
            </div>
          )}

          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 10.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#a855f7' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#a855f7', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#a855f7', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 10!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/11' }} style={{ background: '#a855f7', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 11 →</button>
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