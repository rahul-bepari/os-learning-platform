import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'concept',    title: '3.1 Process Concept',      icon: '⚙️' },
  { id: 'memory',     title: '3.2 Process in Memory',    icon: '💾' },
  { id: 'states',     title: '3.3 Process States',       icon: '🔄' },
  { id: 'pcb',        title: '3.4 PCB',                  icon: '📋' },
  { id: 'scheduling', title: '3.5 Process Scheduling',   icon: '📅' },
  { id: 'operations', title: '3.6 Process Operations',   icon: '🔧' },
  { id: 'ipc',        title: '3.7 IPC',                  icon: '📡' },
  { id: 'sockets',    title: '3.8 Sockets & RPC',        icon: '🌐' },
  { id: 'simulator',  title: '🎮 Simulator',             icon: '🎮' },
  { id: 'lab',        title: '💻 Lab',                   icon: '💻' },
  { id: 'quiz',       title: '🧠 Quiz',                  icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is a process?',
    options: ['A program stored on disk', 'A program in execution', 'A file in memory', 'A CPU instruction'],
    answer: 1,
    explanation: 'A process is a program in execution. A program is passive (on disk). A process is active — it has a program counter, stack, heap, and data section.',
  },
  {
    q: 'Which data structure represents a process in the OS?',
    options: ['File Control Block', 'Process Control Block (PCB)', 'Interrupt Vector', 'Page Table'],
    answer: 1,
    explanation: 'The PCB (Process Control Block) stores all information about a process — state, program counter, CPU registers, memory limits, open files, and scheduling info.',
  },
  {
    q: 'What does fork() return in the child process?',
    options: ['The parent PID', 'A random number', '0', '-1'],
    answer: 2,
    explanation: 'fork() returns 0 in the child process and the child PID in the parent. This is how you distinguish parent from child in code.',
  },
  {
    q: 'Which IPC method is fastest after initial setup?',
    options: ['Message passing', 'Pipes', 'Shared memory', 'Sockets'],
    answer: 2,
    explanation: 'Shared memory requires kernel involvement only during setup. After that, processes read and write directly — no kernel calls — making it the fastest IPC method.',
  },
  {
    q: 'What is a zombie process?',
    options: [
      'A process that uses too much CPU',
      'A process that has finished but its PCB still exists because parent has not called wait()',
      'A process waiting for I/O',
      'A process in the New state'
    ],
    answer: 1,
    explanation: 'A zombie process has finished execution but its PCB still exists because the parent has not called wait() to collect its exit status. It occupies a slot in the process table.',
  },
  {
    q: 'In Android, which process type gets terminated LAST when memory is low?',
    options: ['Background process', 'Empty process', 'Service process', 'Foreground process'],
    answer: 3,
    explanation: 'Android terminates processes from least to most important. Foreground processes (visible to user, actively interacting) are the last to be terminated.',
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #10b98155', color: '#10b981', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid #10b98133', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function NavButtons({ prev, prevLabel, next, nextLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
      {prev
        ? <button onClick={prev} style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{prevLabel}</button>
        : <div />}
      {next && (
        <button onClick={next} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>
      )}
    </div>
  )
}

const STATE_COLORS = {
  New: '#8b5cf6', Ready: '#3b82f6', Running: '#10b981',
  Waiting: '#f59e0b', Terminated: '#6e7681',
}
const STATE_DESC = {
  New: 'Process is being created. PCB is allocated. Resources are assigned.',
  Ready: 'Process is waiting to be assigned to the CPU. Has everything it needs.',
  Running: 'Instructions are being executed by the CPU right now.',
  Waiting: 'Process is waiting for an event — I/O completion or a signal.',
  Terminated: 'Process has finished. OS deallocates resources.',
}
const TRANSITIONS = {
  New: [{ to: 'Ready', label: 'admitted' }],
  Ready: [{ to: 'Running', label: 'scheduler dispatch' }],
  Running: [{ to: 'Ready', label: 'interrupt' }, { to: 'Waiting', label: 'I/O or event wait' }, { to: 'Terminated', label: 'exit' }],
  Waiting: [{ to: 'Ready', label: 'I/O or event complete' }],
  Terminated: [],
}

function ProcessSimulator() {
  const [state, setState] = useState('New')
  const [history, setHistory] = useState(['New'])
  const [pid] = useState(Math.floor(Math.random() * 9000) + 1000)

  function transition(to) {
    setState(to)
    setHistory(function(h) { return [...h, to] })
  }
  function reset() { setState('New'); setHistory(['New']) }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Process State Machine</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>PID: {pid} — Click a transition to move the process</p>
        </div>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Reset</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['New', 'Ready', 'Running', 'Waiting', 'Terminated'].map(function(s) {
          const active = state === s
          const visited = history.includes(s)
          return (
            <div key={s} style={{ flex: 1, minWidth: 110, background: active ? STATE_COLORS[s] + '22' : visited ? 'var(--bg-secondary)' : 'var(--bg-primary)', border: '2px solid ' + (active ? STATE_COLORS[s] : visited ? STATE_COLORS[s] + '44' : 'var(--border)'), borderRadius: 12, padding: '16px 8px', textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: active ? STATE_COLORS[s] : 'var(--text-secondary)' }}>{s}</div>
              {active && <div style={{ fontSize: 10, color: STATE_COLORS[s], marginTop: 4, fontWeight: 600 }}>CURRENT</div>}
            </div>
          )
        })}
      </div>

      <div style={{ background: STATE_COLORS[state] + '15', border: '1px solid ' + STATE_COLORS[state] + '44', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: STATE_COLORS[state], marginBottom: 6 }}>Current: {state}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{STATE_DESC[state]}</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Available transitions:</div>
        {TRANSITIONS[state].length === 0
          ? <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No transitions — process terminated.</div>
          : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {TRANSITIONS[state].map(function(t) {
                return (
                  <button key={t.to} onClick={function() { transition(t.to) }} style={{ background: STATE_COLORS[t.to] + '22', color: STATE_COLORS[t.to], border: '1px solid ' + STATE_COLORS[t.to] + '55', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    {t.label} → {t.to}
                  </button>
                )
              })}
            </div>
          )}
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>History:</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {history.map(function(s, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: STATE_COLORS[s] + '22', color: STATE_COLORS[s], border: '1px solid ' + STATE_COLORS[s] + '44', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
                {i < history.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ForkVisualizer() {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Before fork()', desc: 'Only the parent process exists. It is about to call fork().' },
    { label: 'fork() called', desc: 'The OS creates an exact copy of the parent. Both have the same code, data, and file descriptors.' },
    { label: 'fork() returns', desc: 'fork() returns 0 in the child. It returns the child PID (1338) in the parent.' },
    { label: 'Processes run independently', desc: 'Parent and child run independently. They run different code based on the fork() return value.' },
  ]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>fork() Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Step through how a child process is created</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {steps.map(function(s, i) {
          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#10b981' : 'var(--border)', transition: 'all 0.3s' }} />
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: '#3b82f618', border: '2px solid #3b82f6', borderRadius: 12, padding: '16px 28px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700, marginBottom: 4 }}>PARENT PROCESS</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PID: 1337</div>
            {step >= 2 && <div style={{ fontSize: 12, color: '#10b981', marginTop: 6, fontWeight: 600 }}>fork() returned 1338</div>}
          </div>
          {step >= 1 && <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{step === 1 ? 'calling fork()...' : 'running'}</div>}
        </div>

        {step >= 1 && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#10b981' }}>
            {step === 1 ? '→' : '⑂'}
          </div>
        )}

        {step >= 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#10b98118', border: '2px solid #10b981', borderRadius: 12, padding: '16px 28px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700, marginBottom: 4 }}>CHILD PROCESS</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PID: 1338</div>
              <div style={{ fontSize: 12, color: '#10b981', marginTop: 6, fontWeight: 600 }}>fork() returned 0</div>
            </div>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>running</div>
          </div>
        )}
      </div>

      <div style={{ background: '#10b98115', border: '1px solid #10b98144', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 6 }}>Step {step + 1}: {steps[step].label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{steps[step].desc}</div>
      </div>

      {step >= 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Parent sees:</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
              <div>pid = fork();</div>
              <div style={{ color: '#8b949e' }}>// pid = 1338</div>
              <div>if (pid {'>'} 0) {'{'}</div>
              <div style={{ paddingLeft: 16, color: '#f59e0b' }}>// parent runs here</div>
              <div>{'}'}</div>
            </div>
          </div>
          <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Child sees:</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
              <div>pid = fork();</div>
              <div style={{ color: '#8b949e' }}>// pid = 0</div>
              <div>if (pid == 0) {'{'}</div>
              <div style={{ paddingLeft: 16, color: '#f59e0b' }}>// child runs here</div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={function() { setStep(function(s) { return Math.max(s - 1, 0) }) }} disabled={step === 0} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: 8, cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: step === 0 ? 0.5 : 1 }}>Previous</button>
        <button onClick={function() { setStep(function(s) { return Math.min(s + 1, steps.length - 1) }) }} disabled={step === steps.length - 1} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: step === steps.length - 1 ? 0.5 : 1 }}>Next Step</button>
        <button onClick={function() { setStep(0) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

export default function Chapter3() {
  const [active, setActive] = useState('concept')
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

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #10b98144', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 3</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>⚙️</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Processes</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          The heart of every running system — from process concept and PCB to IPC, sockets, and RPC. Fully aligned with your lecture slides.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Process States', 'PCB', 'fork() Visualizer', 'IPC', 'Sockets & RPC', 'Android Hierarchy'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(16,185,129,0.1)', border: '1px solid #10b98133', color: '#10b981', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>

        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#10b981' : 'var(--text-secondary)', background: active === s.id ? 'rgba(16,185,129,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #10b981' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'concept' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.1 Process Concept</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What exactly is a process and what makes it different from a program?</p>

              <InfoBox color="#10b981">
                A <strong>process</strong> is a program in execution. A program is a passive entity stored on disk. A process is active — it has a program counter, registers, stack, heap, and data section in memory.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Program vs Process</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💿</div>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Program (Passive)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2, listStyle: 'none', padding: 0 }}>
                    <li>Stored on disk (executable file)</li>
                    <li>Just a file with instructions</li>
                    <li>Does nothing by itself</li>
                    <li>One program can create many processes</li>
                    <li>Example: chrome.exe on your disk</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Process (Active)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2, listStyle: 'none', padding: 0 }}>
                    <li>Loaded into memory, running</li>
                    <li>Has its own Program Counter</li>
                    <li>Has stack, heap, data, text sections</li>
                    <li>Uses CPU, memory, files, I/O</li>
                    <li>Example: Chrome window you opened</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Multiple Parts of a Process</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { name: 'Text Section', color: '#3b82f6', desc: 'The executable code — the actual program instructions. Read-only.' },
                  { name: 'Program Counter', color: '#8b5cf6', desc: 'Register pointing to the next instruction to execute.' },
                  { name: 'Stack', color: '#10b981', desc: 'Temporary data — function parameters, return addresses, local variables. Grows downward.' },
                  { name: 'Data Section', color: '#f59e0b', desc: 'Global variables — initialized and uninitialized.' },
                  { name: 'Heap', color: '#ef4444', desc: 'Memory dynamically allocated at runtime (malloc/new). Grows upward.' },
                ].map(function(p) {
                  return (
                    <div key={p.name} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '4px solid ' + p.color, borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ background: p.color + '22', color: p.color, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, minWidth: 120, textAlign: 'center' }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Memory layout of a C program:</strong> At the bottom is the text section (code). Above it is the data section (global vars). Then the heap grows upward as you call malloc(). At the top is the stack, which grows downward as functions are called. If the heap and stack meet, you get a segmentation fault (stack overflow).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>One program, many processes:</strong> When you open Chrome 3 times, you have 3 processes all running the same program. Each has its own stack, heap, and program counter — completely independent. A crash in one does not affect the others.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Process in Linux — task_struct:</strong> In Linux, every process is represented by a C structure called task_struct. It contains: pid (process ID), state, time_slice, parent pointer, children list, open files list, and mm (memory map). You can see this for any process via /proc/PID/status.
              </LearnMore>

              <NavButtons next={function() { setActive('memory') }} nextLabel="3.2 Process in Memory →" />
            </div>
          )}

          {active === 'memory' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.2 Process in Memory</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How a process is laid out in memory — from text to stack.</p>

              <InfoBox color="#8b5cf6">
                When a program is loaded into memory, the OS creates a process with a specific memory layout. Understanding this layout is essential for understanding how programs work and why bugs like stack overflows occur.
              </InfoBox>

              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ background: '#6e767122', border: '1px solid #6e767144', borderRadius: '8px 8px 0 0', padding: '10px 16px', fontSize: 13, color: '#6e7681', textAlign: 'center', fontWeight: 600 }}>max address</div>
                    <div style={{ background: '#3b82f622', border: '1px solid #3b82f644', padding: '16px', textAlign: 'center', fontWeight: 700, color: '#3b82f6', fontSize: 14 }}>Stack (grows down)</div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>↓ free space ↑</div>
                    <div style={{ background: '#ef444422', border: '1px solid #ef444444', padding: '16px', textAlign: 'center', fontWeight: 700, color: '#ef4444', fontSize: 14 }}>Heap (grows up)</div>
                    <div style={{ background: '#f59e0b22', border: '1px solid #f59e0b44', padding: '12px', textAlign: 'center', fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>Data (global vars)</div>
                    <div style={{ background: '#10b98122', border: '1px solid #10b98144', padding: '12px', textAlign: 'center', fontWeight: 700, color: '#10b981', fontSize: 13 }}>Text (code)</div>
                    <div style={{ background: '#6e767122', border: '1px solid #6e767144', borderRadius: '0 0 8px 8px', padding: '10px 16px', fontSize: 13, color: '#6e7681', textAlign: 'center', fontWeight: 600 }}>0 (low address)</div>
                  </div>
                </div>
                <div style={{ flex: 2, minWidth: 260 }}>
                  {[
                    { name: 'Stack', color: '#3b82f6', items: ['Function call frames', 'Local variables', 'Return addresses', 'Function parameters', 'Grows toward lower addresses'] },
                    { name: 'Heap', color: '#ef4444', items: ['Dynamically allocated memory', 'malloc() / new in C/C++', 'Managed by programmer', 'Must be freed manually', 'Grows toward higher addresses'] },
                    { name: 'Data', color: '#f59e0b', items: ['Initialized globals: int x = 5;', 'Uninitialized globals: int y;', 'Static variables', 'Fixed size at compile time'] },
                    { name: 'Text', color: '#10b981', items: ['Machine code instructions', 'Read-only (protected)', 'Shared if same program runs twice', 'Loaded from executable file'] },
                  ].map(function(s) {
                    return (
                      <div key={s.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: s.color, marginBottom: 8, fontSize: 14 }}>{s.name} Section</div>
                        <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
                          {s.items.map(function(item) {
                            return <li key={item} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{item}</li>
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Stack overflow explained:</strong> Every function call pushes a "frame" onto the stack (local variables, return address, parameters). If you have infinite recursion or very deep recursion, the stack grows until it hits the heap — this is a stack overflow. The OS detects this (segfault) and kills the process.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Memory-mapped files:</strong> Modern OSes can map files directly into a process's address space using mmap(). Reading from the mapped address reads from the file. This is how shared libraries work — multiple processes map the same library file into their address space, but each has its own data.
              </LearnMore>

              <NavButtons prev={function() { setActive('concept') }} prevLabel="← 3.1 Process Concept" next={function() { setActive('states') }} nextLabel="3.3 Process States →" />
            </div>
          )}

          {active === 'states' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.3 Process States</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Every process moves through a defined set of states during its lifetime.</p>

              <InfoBox color="#3b82f6">
                As a process executes, it changes state. The OS tracks the state of every process and uses it to make scheduling decisions.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The 5 Basic States</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { state: 'New', color: '#8b5cf6', desc: 'The process is being created. PCB is being allocated and resources assigned.' },
                  { state: 'Ready', color: '#3b82f6', desc: 'Process is waiting to be assigned to the CPU. Has everything it needs to run.' },
                  { state: 'Running', color: '#10b981', desc: 'Instructions are being executed. Only ONE process per CPU core can be Running at any time.' },
                  { state: 'Waiting', color: '#f59e0b', desc: 'Process is waiting for an event — I/O completion, a semaphore, a timer, or a signal.' },
                  { state: 'Terminated', color: '#6e7681', desc: 'Process has finished execution. OS deallocates resources and removes PCB.' },
                ].map(function(s) {
                  return (
                    <div key={s.state} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ background: s.color, color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, minWidth: 90, textAlign: 'center' }}>{s.state}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Suspended Process States</h3>
              <InfoBox color="#f97316">
                The CPU is much faster than I/O. All processes could end up waiting for I/O, leaving the CPU idle. Solution: <strong>swap processes to disk</strong> to free memory and use the CPU on other processes. This creates two additional states.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f97316', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#f97316', marginBottom: 8 }}>Blocked/Suspend</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Process was waiting for I/O and was also swapped out to disk. It is waiting for both I/O completion AND to be swapped back into memory.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #06b6d4', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#06b6d4', marginBottom: 8 }}>Ready/Suspend</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Process is ready to run but is stored on disk rather than in memory. Must be swapped back into memory before it can run.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Reasons for Process Suspension</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { reason: 'Swapping', desc: 'OS needs to release memory to bring in a process that is ready to execute.' },
                  { reason: 'Other OS Reason', desc: 'OS suspects the process of causing a problem.' },
                  { reason: 'Interactive User Request', desc: 'User requests debugging, or pauses the process.' },
                  { reason: 'Timing', desc: 'Process executes periodically (e.g., monitoring) and is suspended between runs.' },
                  { reason: 'Parent Process Request', desc: 'Parent wants to examine or modify the child process.' },
                ].map(function(r) {
                  return (
                    <div key={r.reason} style={{ display: 'flex', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#f97316', fontSize: 13, minWidth: 160 }}>{r.reason}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Zombie and Orphan Processes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Zombie Process</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Process has finished (called exit()) but its PCB still exists because the parent has NOT called wait() to collect the exit status. If no parent is waiting, it becomes a zombie.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Orphan Process</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Parent process terminated without calling wait(). The child is now an orphan. Linux reassigns orphans to init/systemd (PID 1) which periodically calls wait() to clean them up.
                  </p>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>UNIX Process States (more detailed):</strong> Linux actually has more states than the basic 5: TASK_RUNNING (running or ready), TASK_INTERRUPTIBLE (sleeping, can be woken by signal), TASK_UNINTERRUPTIBLE (sleeping, cannot be interrupted — like waiting for disk I/O), TASK_STOPPED (stopped by signal, e.g., Ctrl+Z), TASK_ZOMBIE (terminated, waiting for parent to call wait()).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Cascading termination:</strong> Some OSes do not allow a child to exist if its parent has terminated. If a parent exits, all its children are also terminated — this is called cascading termination. The OS initiates the termination of all descendants. Windows and some UNIX systems implement this.
              </LearnMore>

              <NavButtons prev={function() { setActive('memory') }} prevLabel="← 3.2 Process in Memory" next={function() { setActive('pcb') }} nextLabel="3.4 PCB →" />
            </div>
          )}

          {active === 'pcb' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.4 Process Control Block (PCB)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The data structure that represents a process in the OS kernel.</p>

              <InfoBox color="#f59e0b">
                Each process is represented in the OS by a <strong>Process Control Block (PCB)</strong> — also called a Task Control Block. The PCB contains all information the OS needs to manage the process.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>PCB Contents</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { field: 'Process State', color: '#8b5cf6', desc: 'New, Ready, Running, Waiting, or Terminated. The OS uses this to schedule processes.' },
                  { field: 'Process Number (PID)', color: '#3b82f6', desc: 'Unique identifier for the process. Used by the OS and user programs to refer to the process.' },
                  { field: 'Program Counter', color: '#10b981', desc: 'Address of the next instruction to execute. Saved/restored during context switches.' },
                  { field: 'CPU Registers', color: '#f59e0b', desc: 'All register values (accumulator, index, stack pointer, general purpose). Saved/restored on context switch.' },
                  { field: 'CPU Scheduling Info', color: '#ef4444', desc: 'Process priority, pointers to scheduling queues, and other scheduling parameters.' },
                  { field: 'Memory Management Info', color: '#06b6d4', desc: 'Base/limit registers, page tables, or segment tables — defines the process memory boundaries.' },
                  { field: 'Accounting Info', color: '#f97316', desc: 'CPU time used, clock time since start, time limits, account numbers for billing.' },
                  { field: 'I/O Status Info', color: '#84cc16', desc: 'List of I/O devices allocated to the process, list of open files and their file descriptors.' },
                ].map(function(f) {
                  return (
                    <div key={f.field} style={{ background: 'var(--bg-card)', border: '1px solid ' + f.color + '33', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: f.color, marginBottom: 6, fontSize: 13 }}>{f.field}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Context Switch</h3>
              <InfoBox color="#ef4444">
                When the CPU switches from one process to another, the OS must <strong>save the state of the old process</strong> (into its PCB) and <strong>load the saved state of the new process</strong> (from its PCB). This is a context switch. <strong>No useful work is done during a context switch</strong> — it is pure overhead.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'Process A is running. Timer interrupt fires (or I/O request made).' },
                  { n: 2, color: '#f59e0b', text: 'OS saves Process A state (all registers, PC, stack pointer) into Process A PCB.' },
                  { n: 3, color: '#f59e0b', text: 'OS scheduler picks Process B from the Ready queue.' },
                  { n: 4, color: '#10b981', text: 'OS loads Process B state from its PCB into CPU registers.' },
                  { n: 5, color: '#10b981', text: 'Process B resumes running from exactly where it left off.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Process Representation in Linux</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Linux task_struct — the PCB */</div>
                  <div>pid_t pid;              <span style={{ color: '#8b949e' }}>/* process identifier */</span></div>
                  <div>long state;             <span style={{ color: '#8b949e' }}>/* state of the process */</span></div>
                  <div>unsigned int time_slice;<span style={{ color: '#8b949e' }}>/* scheduling info */</span></div>
                  <div>struct task_struct *parent; <span style={{ color: '#8b949e' }}>/* parent process */</span></div>
                  <div>struct list_head children;  <span style={{ color: '#8b949e' }}>/* children list */</span></div>
                  <div>struct files_struct *files; <span style={{ color: '#8b949e' }}>/* open files */</span></div>
                  <div>struct mm_struct *mm;    <span style={{ color: '#8b949e' }}>/* address space */</span></div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Context switch cost:</strong> A context switch takes 1–10 microseconds. On a system doing 1000 switches/second, that is 1–10ms of wasted CPU time per second (about 1% overhead). Linux uses a 4ms time quantum on desktops — so potentially 1% of CPU time is wasted on context switches. This is why the OS tries to balance responsiveness (small quanta, frequent switches) with efficiency (large quanta, fewer switches).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Threads and PCB:</strong> A multi-threaded process has one PCB but multiple thread control blocks (TCBs) — one per thread. The PCB stores shared state (memory map, open files), while each TCB stores thread-specific state (registers, stack, program counter).
              </LearnMore>

              <NavButtons prev={function() { setActive('states') }} prevLabel="← 3.3 Process States" next={function() { setActive('scheduling') }} nextLabel="3.5 Scheduling →" />
            </div>
          )}

          {active === 'scheduling' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.5 Process Scheduling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How the OS maximizes CPU usage by quickly switching processes.</p>

              <InfoBox color="#3b82f6">
                The <strong>process scheduler</strong> selects among available processes for next execution on a CPU core. Its goal is to maximize CPU utilization and keep a process running at all times.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Scheduling Queues</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { name: 'Ready Queue', color: '#3b82f6', desc: 'All processes in memory that are ready and waiting to execute. The CPU scheduler picks from here. Implemented as a linked list of PCBs.' },
                  { name: 'Wait Queues', color: '#f59e0b', desc: 'Processes waiting for a specific event. One queue per device type (disk I/O queue, keyboard queue, network queue). When event completes, process moves to Ready queue.' },
                  { name: 'Job Queue', color: '#8b5cf6', desc: 'All processes in the system — in memory, on disk, or running. Managed by the long-term scheduler.' },
                ].map(function(q) {
                  return (
                    <div key={q.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + q.color + '44', borderRadius: 10, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ background: q.color + '22', color: q.color, padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13, minWidth: 110, textAlign: 'center', flexShrink: 0 }}>{q.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Multitasking in Mobile Systems</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>iOS</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>One foreground process (user interface)</li>
                    <li>Multiple background processes with limits</li>
                    <li>Background: single short task only</li>
                    <li>Can receive event notifications</li>
                    <li>Specific tasks like audio playback allowed</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Android</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Runs both foreground and background</li>
                    <li>Fewer restrictions than iOS</li>
                    <li>Background process uses a Service</li>
                    <li>Service can keep running even if app is suspended</li>
                    <li>Service has no user interface, small memory</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Three types of schedulers:</strong>
                <br />The <strong>short-term scheduler</strong> (CPU scheduler) picks which Ready process gets the CPU next — runs every few milliseconds. The most frequent and critical scheduler.
                <br />The <strong>medium-term scheduler</strong> handles swapping — moves processes between memory and disk to improve the process mix.
                <br />The <strong>long-term scheduler</strong> (job scheduler) decides which jobs are admitted into the system from the job pool — controls the degree of multiprogramming. Runs infrequently (seconds to minutes).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>I/O-bound vs CPU-bound processes:</strong> An I/O-bound process spends more time doing I/O than computation (e.g., file copying). A CPU-bound process spends more time computing (e.g., video encoding). The long-term scheduler should select a good mix — too many CPU-bound processes starves I/O-bound ones and vice versa.
              </LearnMore>

              <NavButtons prev={function() { setActive('pcb') }} prevLabel="← 3.4 PCB" next={function() { setActive('operations') }} nextLabel="3.6 Process Operations →" />
            </div>
          )}

          {active === 'operations' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.6 Operations on Processes</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How processes are created, run, and terminated — with real system calls.</p>

              <InfoBox color="#8b5cf6">
                The OS provides system calls for process operations: <strong>fork()</strong> to create, <strong>exec()</strong> to run a new program, <strong>wait()</strong> to synchronize, and <strong>exit()</strong> to terminate.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Process Creation</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                A parent process creates children processes, which in turn create other processes, forming a <strong style={{ color: 'var(--text-primary)' }}>tree of processes</strong>. Each process has a unique PID (Process Identifier).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8, fontSize: 13 }}>Resource Sharing Options</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Parent and children share ALL resources</li>
                    <li>Children share SUBSET of parent resources</li>
                    <li>Parent and child share NO resources</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8, fontSize: 13 }}>Execution Options</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Parent and children execute concurrently</li>
                    <li>Parent waits until children terminate</li>
                    <li>UNIX: fork() then exec() pattern</li>
                  </ul>
                </div>
              </div>

              <ForkVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>The fork + exec Pattern</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
                  <div style={{ color: '#8b949e' }}>/* Classic shell pattern - how bash runs commands */</div>
                  <div>pid_t pid = <span style={{ color: '#79c0ff' }}>fork</span>();       <span style={{ color: '#8b949e' }}>/* create child */</span></div>
                  <div>if (pid {'<'} 0) {'{'}</div>
                  <div style={{ paddingLeft: 20, color: '#f85149' }}>fprintf(stderr, "Fork failed");</div>
                  <div>{'}'} else if (pid == 0) {'{'} <span style={{ color: '#8b949e' }}>/* child process */</span></div>
                  <div style={{ paddingLeft: 20 }}><span style={{ color: '#79c0ff' }}>execlp</span>(<span style={{ color: '#a5d6ff' }}>"/bin/ls"</span>, <span style={{ color: '#a5d6ff' }}>"ls"</span>, NULL);</div>
                  <div>{'}'} else {'{'} <span style={{ color: '#8b949e' }}>/* parent process */</span></div>
                  <div style={{ paddingLeft: 20 }}><span style={{ color: '#79c0ff' }}>wait</span>(NULL); <span style={{ color: '#8b949e' }}>/* wait for child */</span></div>
                  <div style={{ paddingLeft: 20 }}>printf(<span style={{ color: '#a5d6ff' }}>"Child complete"</span>);</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Process Termination</h3>
              <InfoBox color="#ef4444">
                A process executes its last statement and calls <strong>exit()</strong>. It returns status data to its parent via wait(). The OS deallocates all resources. A parent can also terminate a child using <strong>abort()</strong> if the child exceeded resources, the task is no longer needed, or the parent is exiting.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Android Process Importance Hierarchy</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Android must terminate processes to reclaim memory. It terminates from <strong style={{ color: '#ef4444' }}>least important</strong> to <strong style={{ color: '#10b981' }}>most important</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {[
                  { level: '1. Foreground Process', color: '#10b981', desc: 'Currently interacting with user. LAST to be terminated. Examples: app in foreground, active BroadcastReceiver.' },
                  { level: '2. Visible Process', color: '#3b82f6', desc: 'Not foreground but still visible to user. Example: activity behind a dialog.' },
                  { level: '3. Service Process', color: '#8b5cf6', desc: 'Running a background service (music playback, file download). Important but not visible.' },
                  { level: '4. Background Process', color: '#f59e0b', desc: 'Activity not currently visible to user. Can be terminated when memory is needed.' },
                  { level: '5. Empty Process', color: '#ef4444', desc: 'No active components. Kept only for caching. FIRST to be terminated when memory is needed.' },
                ].map(function(p) {
                  return (
                    <div key={p.level} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '4px solid ' + p.color, borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: p.color, fontSize: 12, minWidth: 160 }}>{p.level}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Chrome Multiprocess Architecture</h3>
              <InfoBox color="#06b6d4">
                Google Chrome uses multiple processes to improve stability and security. If one tab crashes, the others keep running.
              </InfoBox>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { type: 'Browser Process', color: '#3b82f6', desc: 'Manages the user interface, disk I/O, and network I/O. One per browser.' },
                  { type: 'Renderer Process', color: '#10b981', desc: 'Renders web pages — handles HTML, CSS, JavaScript. New renderer for EACH website. Runs in sandbox.' },
                  { type: 'Plugin Process', color: '#8b5cf6', desc: 'One per plugin type (Flash, PDF, etc.). Isolated so a plugin crash does not crash the browser.' },
                ].map(function(p) {
                  return (
                    <div key={p.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + p.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: p.color, marginBottom: 8, fontSize: 13 }}>{p.type}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</p>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Copy-on-Write (COW):</strong> When fork() is called, Linux does NOT immediately copy all the parent memory. Instead, it marks all pages as copy-on-write. Only when either process writes to a page does the OS actually copy it. This makes fork() very fast — especially since most fork() calls are immediately followed by exec() which replaces the memory anyway.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Creating processes on Windows:</strong> Windows uses CreateProcess() instead of fork(). It creates a new process from scratch with a new address space rather than copying the parent. It takes 10 parameters including executable path, command line args, security attributes, and environment block. More complex but avoids the fork+exec pattern.
              </LearnMore>

              <NavButtons prev={function() { setActive('scheduling') }} prevLabel="← 3.5 Scheduling" next={function() { setActive('ipc') }} nextLabel="3.7 IPC →" />
            </div>
          )}

          {active === 'ipc' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.7 Interprocess Communication (IPC)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How processes share data and coordinate with each other.</p>

              <InfoBox color="#06b6d4">
                Processes within a system may be <strong>independent</strong> (cannot affect each other) or <strong>cooperating</strong> (can share data and affect each other). Cooperating processes need IPC. There are two fundamental IPC models: <strong>Shared Memory</strong> and <strong>Message Passing</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Why Cooperate?</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                {['Information sharing', 'Computation speedup', 'Modularity', 'Convenience'].map(function(r) {
                  return <span key={r} style={{ background: '#06b6d418', border: '1px solid #06b6d444', color: '#06b6d4', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{r}</span>
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Two IPC Models</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '2px solid #10b981', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💾</div>
                  <h4 style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Shared Memory</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    A region of memory is shared between cooperating processes. After initial setup by the OS, processes communicate by reading/writing directly — no kernel involvement.
                  </p>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Faster — no kernel overhead after setup</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Requires synchronization (Ch 6)</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '2px solid #3b82f6', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📨</div>
                  <h4 style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Message Passing</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    Processes communicate by sending and receiving messages via the OS kernel. No shared variables. The OS mediates all communication.
                  </p>
                  <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Safer — no race conditions</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Slower — kernel involved every time</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Producer-Consumer Problem</h3>
              <InfoBox color="#f59e0b">
                A classic IPC paradigm. A <strong>producer</strong> process produces information consumed by a <strong>consumer</strong> process. The buffer between them can be <strong>unbounded</strong> (no limit) or <strong>bounded</strong> (fixed size — producer must wait if full, consumer must wait if empty).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Pipes</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                A pipe is a unidirectional data channel. One process writes to the write-end, another reads from the read-end. When you type <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, color: '#3fb950' }}>ls | grep txt</code>, a pipe connects ls output to grep input.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Ordinary Pipes</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Unidirectional (one-way)</li>
                    <li>Require parent-child relationship</li>
                    <li>Cannot be accessed outside creating process</li>
                    <li>Called anonymous pipes in Windows</li>
                    <li>Exist only while processes use them</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Named Pipes (FIFOs)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Bidirectional communication</li>
                    <li>No parent-child relationship needed</li>
                    <li>Multiple processes can use the same pipe</li>
                    <li>Appear as files in the filesystem</li>
                    <li>Persist beyond process lifetime</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Message Passing Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8, fontSize: 13 }}>Direct Communication</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Processes name each other explicitly:
                    <br /><code style={{ color: '#3fb950' }}>send(P, message)</code> — send to process P
                    <br /><code style={{ color: '#3fb950' }}>receive(Q, message)</code> — receive from Q
                    <br />Exactly one link between each pair.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8, fontSize: 13 }}>Indirect Communication (Mailboxes)</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Messages go through a mailbox (port). Each mailbox has a unique ID. Multiple processes can share a mailbox.
                    <br /><code style={{ color: '#3fb950' }}>send(A, message)</code> — send to mailbox A
                    <br /><code style={{ color: '#3fb950' }}>receive(A, message)</code> — receive from A
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Synchronization</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { type: 'Blocking (Synchronous)', color: '#10b981', items: ['Blocking send — sender waits until message received', 'Blocking receive — receiver waits until message available', 'Both blocking = rendezvous'] },
                  { type: 'Non-blocking (Asynchronous)', color: '#f59e0b', items: ['Non-blocking send — sender sends and continues', 'Non-blocking receive — gets message or null', 'More complex to program correctly'] },
                ].map(function(s) {
                  return (
                    <div key={s.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: s.color, marginBottom: 10, fontSize: 13 }}>{s.type}</div>
                      {s.items.map(function(item) {
                        return <div key={item} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>• {item}</div>
                      })}
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>POSIX Shared Memory:</strong> In POSIX, shared memory is created with shm_open(), sized with ftruncate(), and mapped into address space with mmap(). The process then reads/writes the pointer returned by mmap() to communicate with other processes. Must use semaphores or mutexes to synchronize access.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Mach IPC:</strong> Mach (basis of macOS) uses message-based IPC for everything — even system calls are messages. Each task gets two ports at creation: Kernel and Notify. Messages are sent/received using mach_msg(). This design makes Mach highly modular — OS services are just processes that respond to messages.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Windows LPC:</strong> Windows uses Advanced Local Procedure Call (LPC) for IPC between processes on the same system. Uses connection ports and communication ports. The client opens a handle to the server's connection port, sends a request, and the server creates private communication ports for the session.
              </LearnMore>

              <NavButtons prev={function() { setActive('operations') }} prevLabel="← 3.6 Operations" next={function() { setActive('sockets') }} nextLabel="3.8 Sockets and RPC →" />
            </div>
          )}

          {active === 'sockets' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>3.8 Sockets and Remote Procedure Calls</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Client-server communication — the foundation of all network programming.</p>

              <InfoBox color="#06b6d4">
                Client-server systems use two main communication mechanisms: <strong>Sockets</strong> (low-level, flexible) and <strong>Remote Procedure Calls (RPC)</strong> (high-level abstraction that makes network calls look like local function calls).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Sockets</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                A <strong style={{ color: 'var(--text-primary)' }}>socket</strong> is an endpoint for communication. It is defined by an IP address + port number. The socket <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, color: '#3fb950' }}>161.25.19.8:1625</code> refers to port 1625 on host 161.25.19.8.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { type: 'TCP (Connection-oriented)', color: '#3b82f6', desc: 'Reliable, ordered delivery. Server listens, client connects, data flows. Used for HTTP, FTP, SSH.' },
                  { type: 'UDP (Connectionless)', color: '#f59e0b', desc: 'Unreliable but fast. No connection setup. Used for DNS, video streaming, gaming.' },
                  { type: 'Loopback (127.0.0.1)', color: '#10b981', desc: 'Special address to refer to the same machine. Used for local inter-process communication via network API.' },
                ].map(function(s) {
                  return (
                    <div key={s.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: s.color, marginBottom: 8, fontSize: 12 }}>{s.type}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Well-Known Port Numbers</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {[
                  ['HTTP', '80'], ['HTTPS', '443'], ['SSH', '22'], ['FTP', '21'],
                  ['SMTP (Email)', '25'], ['DNS', '53'], ['MySQL', '3306'], ['MongoDB', '27017'],
                ].map(function(p) {
                  return (
                    <div key={p[0]} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
                      <span style={{ color: '#06b6d4', fontWeight: 700 }}>{p[0]}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>:{p[1]}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Remote Procedure Calls (RPC)</h3>
              <InfoBox color="#8b5cf6">
                RPC abstracts procedure calls between processes on networked systems. It makes a function call on a remote machine look like a local function call. The programmer calls a function — the RPC system handles all the networking.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#8b5cf6', text: 'Client calls a local stub function as if it were local: result = add(3, 4)' },
                  { n: 2, color: '#3b82f6', text: 'Client stub marshals (packs) parameters into a message: {function: "add", args: [3, 4]}' },
                  { n: 3, color: '#3b82f6', text: 'Message is sent over the network to the server' },
                  { n: 4, color: '#10b981', text: 'Server stub unmarshals (unpacks) the message and calls the real function: add(3, 4)' },
                  { n: 5, color: '#10b981', text: 'Server executes the function, marshals the result (7), sends it back' },
                  { n: 6, color: '#8b5cf6', text: 'Client stub receives result and returns it to the caller: result = 7' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontSize: 14 }}>RPC Key Concepts</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { term: 'Stub', def: 'Client-side proxy for the actual procedure on the server. Hides all networking details from the programmer.' },
                    { term: 'Marshalling', def: 'Packing function parameters into a network message. Must handle different data formats (big/little endian).' },
                    { term: 'XDR', def: 'External Data Representation — standard format for marshalling that handles architecture differences.' },
                    { term: 'Rendezvous Service', def: 'A matchmaker service that helps clients find which port a server is listening on (like a phone book).' },
                  ].map(function(c) {
                    return (
                      <div key={c.term} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: '#8b5cf6', fontSize: 12, marginBottom: 4 }}>{c.term}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.def}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Modern RPC frameworks:</strong> gRPC (Google) uses Protocol Buffers for serialization and HTTP/2 for transport. Used by Netflix, Dropbox, and Square. REST (not technically RPC) uses HTTP verbs and JSON. GraphQL lets clients specify exactly what data they need. All of these are built on the same fundamental idea as RPC — abstracting network communication.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>RPC failure modes:</strong> Unlike local calls, RPC can fail in many ways — network failure, server crash, message loss, timeout. Messages should be delivered exactly once (not at-most-once or at-least-once). Achieving exactly-once semantics requires acknowledgements and duplicate detection, which is complex to implement correctly.
              </LearnMore>

              <NavButtons prev={function() { setActive('ipc') }} prevLabel="← 3.7 IPC" next={function() { setActive('simulator') }} nextLabel="Process Simulator →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Interactive Process Simulator</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Click transitions to move the process through its lifecycle.</p>

              <ProcessSimulator />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>All State Transitions Explained</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { from: 'New', to: 'Ready', event: 'admitted', color: '#8b5cf6', desc: 'OS accepts the process. PCB created, resources allocated, added to Ready queue.' },
                  { from: 'Ready', to: 'Running', event: 'scheduler dispatch', color: '#3b82f6', desc: 'CPU scheduler picks this process. Loads PCB registers, begins execution.' },
                  { from: 'Running', to: 'Waiting', event: 'I/O or event wait', color: '#f59e0b', desc: 'Process requests I/O (read file, network call). Must wait for device.' },
                  { from: 'Running', to: 'Ready', event: 'interrupt', color: '#10b981', desc: 'Timer interrupt fires. OS preempts the process. Goes back to Ready queue.' },
                  { from: 'Running', to: 'Terminated', event: 'exit()', color: '#ef4444', desc: 'Process calls exit() or main() returns. OS reclaims all resources.' },
                  { from: 'Waiting', to: 'Ready', event: 'I/O complete', color: '#06b6d4', desc: 'I/O finished. Process moved back to Ready queue to wait for CPU.' },
                ].map(function(t) {
                  return (
                    <div key={t.from + t.to} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ background: STATE_COLORS[t.from] + '22', color: STATE_COLORS[t.from], padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{t.from}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>--{t.event}--</span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span style={{ background: STATE_COLORS[t.to] + '22', color: STATE_COLORS[t.to], padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{t.to}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{t.desc}</span>
                    </div>
                  )
                })}
              </div>

              <NavButtons prev={function() { setActive('sockets') }} prevLabel="← 3.8 Sockets" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Processes in Code</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Write and run real process code. Copy and run in any online compiler.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#10b981' }}>Lab 1 — Process Info in Python</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                Use Python's os module to inspect process information — same as what the PCB stores.
              </p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — fork() in C</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                fork() creates a child process. Parent and child run different code based on what fork() returns.
              </p>
              <CodeEditor defaultLang="c" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#06b6d4' }}>Lab 3 — Explore Processes in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ps aux',                  'List all running processes with details'],
                  ['ps aux | grep python',     'Find all Python processes'],
                  ['top',                      'Live process monitor (like Task Manager)'],
                  ['pstree',                   'Show process tree (parent-child relationships)'],
                  ['cat /proc/meminfo',        'Check memory info from /proc filesystem'],
                  ['cat /proc/cpuinfo',        'Check CPU info'],
                  ['strace echo hello',        'Trace all system calls made by echo'],
                  ['cat /home/student/programs/fork_demo.c', 'View fork demo source code'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', minWidth: 240, flexShrink: 0 }}>{item[0]}</code>
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 3.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#10b981' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#10b981', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 3!' : quiz.score >= 4 ? 'Good work! Review the sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                        Retry Quiz
                      </button>
                      <button onClick={function() { window.location.href = '/chapter/4' }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                        Next: Chapter 4 →
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