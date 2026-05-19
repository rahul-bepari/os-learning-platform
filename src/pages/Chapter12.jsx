import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',   title: '12.1 I/O Hardware',          icon: '🔌' },
  { id: 'polling',    title: '12.2 Polling & Interrupts',   icon: '⚡' },
  { id: 'dma',        title: '12.3 DMA',                   icon: '🚀' },
  { id: 'kernel',     title: '12.4 Kernel I/O Subsystem',  icon: '⚙️' },
  { id: 'buffering',  title: '12.5 Buffering & Caching',   icon: '📦' },
  { id: 'drivers',    title: '12.6 Device Drivers',        icon: '🔧' },
  { id: 'performance',title: '12.7 Performance',           icon: '📊' },
  { id: 'simulator',  title: '🎮 I/O Simulator',           icon: '🎮' },
  { id: 'lab',        title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',       title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the main advantage of DMA over programmed I/O?',
    options: [
      'DMA is cheaper to implement',
      'DMA transfers data directly between device and memory without CPU involvement, freeing the CPU for other work',
      'DMA is more secure',
      'DMA works with all devices'
    ],
    answer: 1,
    explanation: 'With programmed I/O, the CPU is busy for the entire data transfer — reading/writing each byte/word. With DMA, the CPU just sets up the transfer (source, destination, count) and the DMA controller handles it independently. The CPU only gets interrupted when the entire transfer is complete.'
  },
  {
    q: 'What is the difference between polling and interrupt-driven I/O?',
    options: [
      'Polling is faster for all cases',
      'Polling: CPU continuously checks device status. Interrupts: device signals CPU when ready, CPU does other work meanwhile',
      'Interrupts require special hardware',
      'Polling uses DMA, interrupts do not'
    ],
    answer: 1,
    explanation: 'Polling (busy-waiting) wastes CPU cycles continuously checking if the device is ready. Interrupt-driven I/O lets the CPU do other work while the device operates. When the device is ready, it interrupts the CPU. Polling can be efficient for very fast devices where the wait is extremely short.'
  },
  {
    q: 'What is spooling?',
    options: [
      'Wrapping data in packets for network transmission',
      'Overlapping output of one job with input of other jobs using a buffer — e.g., print spooling',
      'Compressing data before storage',
      'Scheduling CPU and I/O simultaneously'
    ],
    answer: 1,
    explanation: 'Spooling (Simultaneous Peripheral Operations On-Line) holds output for a device that cannot accept interleaved data streams. The classic example is a printer — multiple processes write to a spool directory, and the print daemon sends them to the printer one at a time. Processes never wait for the printer directly.'
  },
  {
    q: 'What is double buffering?',
    options: [
      'Using two CPUs for I/O',
      'Two buffers alternating — one being filled while the other is being drained, allowing producer and consumer to work simultaneously',
      'Storing data in both RAM and cache',
      'Having backup copies of I/O buffers'
    ],
    answer: 1,
    explanation: 'Double buffering uses two buffers. While the CPU processes data in buffer A, the device fills buffer B. When both finish, they swap. This allows the CPU and I/O device to work simultaneously with no wait between transfers — maximum throughput.'
  },
  {
    q: 'What does a device driver do?',
    options: [
      'It physically moves the device',
      'It translates general OS I/O requests into device-specific commands and manages device-specific details',
      'It compresses data for the device',
      'It allocates memory for I/O operations'
    ],
    answer: 1,
    explanation: 'A device driver is kernel code that knows the specific hardware details of a device. It translates abstract I/O requests (read/write) into the specific commands, registers, and protocols the device understands. It also handles device-specific interrupts, errors, and status. Without drivers, the OS cannot communicate with hardware.'
  },
  {
    q: 'Which I/O method is most efficient for transferring large blocks of data?',
    options: [
      'Programmed I/O (polling)',
      'Interrupt-driven I/O',
      'DMA (Direct Memory Access)',
      'Memory-mapped I/O'
    ],
    answer: 2,
    explanation: 'DMA is most efficient for large data transfers. The CPU sets up the transfer once and is free to do other work. The DMA controller handles the entire block transfer autonomously. For small transfers (a few bytes), interrupt overhead may make polling more efficient. For large transfers (disk blocks, network packets), DMA always wins.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #ec489955', color: '#ec4899', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(236,72,153,0.06)', border: '1px solid #ec489933', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#ec4899', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function IOMethodVisualizer() {
  const [method, setMethod] = useState('polling')
  const [step, setStep] = useState(0)

  const methods = {
    polling: {
      label: 'Programmed I/O (Polling)',
      color: '#ef4444',
      steps: [
        { actor: 'CPU', action: 'CPU issues I/O command to device controller', detail: 'Writes command to device register. Starts I/O operation.' },
        { actor: 'CPU', action: 'CPU polls status register in a loop', detail: 'while (status != DONE) { check(); } — CPU is 100% busy doing nothing useful.' },
        { actor: 'CPU', action: 'CPU polls again...', detail: 'Still checking. CPU cannot do any other work. This is "busy waiting".' },
        { actor: 'Device', action: 'Device completes I/O operation', detail: 'Sets status register to DONE.' },
        { actor: 'CPU', action: 'CPU detects completion via polling', detail: 'Reads data from device register. Processes it.' },
        { actor: 'CPU', action: 'Done — but CPU wasted time polling', detail: 'Entire CPU was tied up. Good only for very fast devices.' },
      ]
    },
    interrupt: {
      label: 'Interrupt-driven I/O',
      color: '#10b981',
      steps: [
        { actor: 'CPU', action: 'CPU issues I/O command to device controller', detail: 'Writes command to device register. Enables interrupt.' },
        { actor: 'CPU', action: 'CPU continues doing other useful work', detail: 'Runs other processes, handles other tasks. No polling needed!' },
        { actor: 'CPU', action: 'CPU does more useful work...', detail: 'Complete CPU utilization while device operates independently.' },
        { actor: 'Device', action: 'Device completes I/O — raises interrupt', detail: 'Asserts interrupt request line on the CPU bus.' },
        { actor: 'CPU', action: 'CPU saves state, jumps to interrupt handler', detail: 'Saves registers, looks up interrupt vector, calls ISR.' },
        { actor: 'CPU', action: 'ISR reads data, restores state, resumes', detail: 'Transfers data, wakes waiting process, returns from interrupt.' },
      ]
    },
    dma: {
      label: 'DMA (Direct Memory Access)',
      color: '#3b82f6',
      steps: [
        { actor: 'CPU', action: 'CPU sets up DMA controller', detail: 'Provides: source address, destination address, byte count, direction. Takes microseconds.' },
        { actor: 'CPU', action: 'CPU resumes other work immediately', detail: 'CPU is completely free. DMA controller takes over the bus.' },
        { actor: 'DMA', action: 'DMA controller transfers data block', detail: 'Directly between device buffer and memory. No CPU involvement. Uses memory bus in cycles stolen from CPU.' },
        { actor: 'DMA', action: 'DMA continues transferring entire block', detail: 'Thousands of bytes transferred with zero CPU involvement.' },
        { actor: 'DMA', action: 'Transfer complete — DMA raises interrupt', detail: 'DMA controller signals CPU that the entire block is transferred.' },
        { actor: 'CPU', action: 'CPU handles single interrupt for entire block', detail: 'One interrupt for potentially megabytes of data. Maximum efficiency.' },
      ]
    }
  }

  const m = methods[method]
  const actorColor = { CPU: '#f59e0b', Device: '#10b981', DMA: '#3b82f6' }

  function reset() { setStep(0) }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>I/O Method Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Step through each I/O method and see how the CPU is used.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.keys(methods).map(function(key) {
          return (
            <button key={key} onClick={function() { setMethod(key); setStep(0) }} style={{ background: method === key ? methods[key].color + '33' : 'var(--bg-secondary)', color: method === key ? methods[key].color : 'var(--text-secondary)', border: '1px solid ' + (method === key ? methods[key].color : 'var(--border)'), padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: method === key ? 700 : 400 }}>
              {methods[key].label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {m.steps.map(function(s, i) {
          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? m.color : 'var(--border)', transition: 'all 0.3s' }} />
        })}
      </div>

      <div style={{ background: m.color + '18', border: '1px solid ' + m.color + '44', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ background: actorColor[m.steps[step].actor] + '33', color: actorColor[m.steps[step].actor], padding: '3px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{m.steps[step].actor}</span>
          <span style={{ fontWeight: 700, color: m.color, fontSize: 15 }}>Step {step + 1}: {m.steps[step].action}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{m.steps[step].detail}</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={function() { setStep(function(s) { return Math.max(s - 1, 0) }) }} disabled={step === 0} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 18px', borderRadius: 8, cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: step === 0 ? 0.5 : 1 }}>Previous</button>
        <button onClick={function() { setStep(function(s) { return Math.min(s + 1, m.steps.length - 1) }) }} disabled={step === m.steps.length - 1} style={{ background: m.color, color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: step === m.steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: step === m.steps.length - 1 ? 0.5 : 1 }}>Next</button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

export default function Chapter12() {
  const [active, setActive] = useState('overview')
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #ec489944', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#ec4899', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 12</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🔌</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>I/O Systems</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How the OS manages communication between the CPU and all hardware devices — polling, interrupts, DMA, device drivers, buffering, and performance.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['I/O Method Visualizer', 'DMA vs Polling', 'Device Drivers', 'Buffering Types', 'Spooling'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(236,72,153,0.1)', border: '1px solid #ec489933', color: '#ec4899', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#ec4899' : 'var(--text-secondary)', background: active === s.id ? 'rgba(236,72,153,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #ec4899' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.1 I/O Hardware</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How devices connect to the system and how the CPU communicates with them.</p>

              <InfoBox color="#ec4899">
                I/O devices are incredibly diverse — from keyboards to disks to GPUs to network cards. The OS must manage them all through a <strong>uniform interface</strong> despite their differences. The key abstractions: ports, buses, device controllers, and device drivers.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Hardware Components</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { name: 'Port', color: '#3b82f6', desc: 'A connection point through which a device communicates with the system. Serial ports, USB ports, SATA ports. Each port has registers: data-in, data-out, status, control.' },
                  { name: 'Bus', color: '#10b981', desc: 'A set of wires and a protocol for transmitting messages. PCIe bus (connects GPU, SSD, NIC), SATA bus (connects storage), USB bus (connects peripherals), memory bus (connects RAM).' },
                  { name: 'Device Controller', color: '#f59e0b', desc: 'Electronics that operate the port, bus, or device. Has local buffer and special-purpose registers. CPU communicates by reading/writing these registers. Example: disk controller, UART controller.' },
                  { name: 'Device Driver', color: '#8b5cf6', desc: 'Kernel software that knows the specific protocol of a device controller. Translates OS abstract I/O requests into device-specific commands. One driver per device type.' },
                ].map(function(c) {
                  return (
                    <div key={c.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: c.color, marginBottom: 6, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>I/O Port Registers</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                The CPU communicates with a device controller through four types of registers:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { reg: 'Data-in register', color: '#3b82f6', desc: 'Read by host to get input — data coming FROM the device.' },
                  { reg: 'Data-out register', color: '#10b981', desc: 'Written by host to send output — data going TO the device.' },
                  { reg: 'Status register', color: '#f59e0b', desc: 'Read by host to see device state — busy, error, data-available, etc.' },
                  { reg: 'Control register', color: '#8b5cf6', desc: 'Written by host to start command, change device mode, enable interrupts.' },
                ].map(function(r) {
                  return (
                    <div key={r.reg} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + r.color + '33', borderRadius: 8, padding: '10px 16px', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: r.color, fontSize: 13, minWidth: 160 }}>{r.reg}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Memory-Mapped I/O</h3>
              <InfoBox color="#f59e0b">
                Two ways for CPU to access device registers:
                <br /><strong>Port-mapped I/O:</strong> Separate I/O address space. Special instructions (IN, OUT on x86). Separate from memory addresses.
                <br /><strong>Memory-mapped I/O:</strong> Device registers mapped into the regular memory address space. CPU uses normal load/store instructions. Simpler programming, used by most modern devices.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>PCIe — the modern bus:</strong> PCI Express replaced PCI with a point-to-point serial architecture. Each lane is a pair of wires (transmit + receive). PCIe x16 has 16 lanes — used for GPUs. PCIe 5.0 provides ~4GB/s per lane — 64GB/s for x16. Modern NVMe SSDs use PCIe x4 directly, bypassing the slow SATA interface entirely.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>USB protocol:</strong> USB (Universal Serial Bus) uses a host controller (in the CPU/chipset) and a tree topology with hubs. USB 3.2 Gen 2x2 provides 20 Gbps. USB4 (based on Thunderbolt 3) provides 40 Gbps. The OS enumerates devices by sending "who are you?" requests on the bus — the device responds with its vendor ID, product ID, and class, which the OS uses to load the correct driver.
              </LearnMore>

              <NavButtons next={function() { setActive('polling') }} nextLabel="12.2 Polling and Interrupts →" />
            </div>
          )}

          {active === 'polling' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.2 Polling and Interrupts</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Two fundamental ways for the CPU to know when a device needs attention.</p>

              <InfoBox color="#ef4444">
                After issuing an I/O command, the CPU must know when the device is done. Two approaches: <strong>polling</strong> (CPU keeps checking) and <strong>interrupt-driven</strong> (device signals CPU). The choice depends on device speed and latency requirements.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Polling (Busy-Waiting)</h3>
              <div style={{ background: '#0d1117', border: '1px solid #ef444444', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Polling loop */</div>
                  <div>while ((status_register &amp; BUSY_BIT) != 0)</div>
                  <div style={{ paddingLeft: 20, color: '#8b949e' }}>; /* spin — do nothing */</div>
                  <div style={{ color: '#8b949e' }}>/* device is now ready */</div>
                  <div>read_data = data_register;</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 6, fontSize: 13 }}>Good for:</div>
                  <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 14 }}>
                    <li>Very fast devices (NVMe, high-speed network)</li>
                    <li>When latency matters more than efficiency</li>
                    <li>Embedded systems (no OS overhead)</li>
                    <li>Short predictable wait times</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 6, fontSize: 13 }}>Bad for:</div>
                  <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 14 }}>
                    <li>Slow devices (HDD, keyboard, printer)</li>
                    <li>Multiprogrammed systems</li>
                    <li>Battery-powered devices (wastes power)</li>
                    <li>Unpredictable wait times</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Interrupt-Driven I/O</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'CPU issues I/O command to device controller. Enables device interrupt.' },
                  { n: 2, color: '#3b82f6', text: 'CPU continues executing other processes — full utilization.' },
                  { n: 3, color: '#10b981', text: 'Device completes I/O. Asserts interrupt request line.' },
                  { n: 4, color: '#f59e0b', text: 'CPU detects interrupt at end of current instruction cycle.' },
                  { n: 5, color: '#f59e0b', text: 'CPU saves state (registers, PC) to kernel stack.' },
                  { n: 6, color: '#8b5cf6', text: 'CPU jumps to interrupt handler via interrupt vector table.' },
                  { n: 7, color: '#8b5cf6', text: 'Handler processes I/O, wakes waiting process, restores CPU state, returns.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interrupt Vector Table</h3>
              <InfoBox color="#8b5cf6">
                The interrupt vector table maps interrupt numbers to handler addresses. When interrupt N fires, the CPU looks up vector[N] to find the handler address and jumps to it. x86 has 256 interrupt vectors: 0-31 reserved for CPU exceptions (divide by zero, page fault, etc.), 32-255 for external devices and software interrupts.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Interrupt priority and masking:</strong> Not all interrupts are equal. A timer interrupt may be less urgent than a disk DMA completion. Modern CPUs support interrupt priority levels — higher priority interrupts can preempt lower ones. The OS can also mask (disable) certain interrupts temporarily during critical sections. Linux uses IRQF_DISABLED to run handlers with all interrupts masked.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Top half and bottom half:</strong> Interrupt handlers must be fast — they run with interrupts disabled. Linux splits interrupt handling: the "top half" (hard IRQ) runs immediately with interrupts disabled and handles only urgent work. The "bottom half" (softirq, tasklet, workqueue) runs later with interrupts enabled and handles the bulk of the work. This keeps interrupt latency low.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 12.1 I/O Hardware" next={function() { setActive('dma') }} nextLabel="12.3 DMA →" />
            </div>
          )}

          {active === 'dma' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.3 Direct Memory Access (DMA)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Transferring large blocks of data without CPU involvement.</p>

              <InfoBox color="#3b82f6">
                DMA is used for high-speed I/O devices that can transmit information at close to memory speeds. The <strong>DMA controller</strong> transfers blocks of data from a device buffer directly to/from main memory <strong>without CPU intervention</strong>. Only one interrupt per block (not one per byte).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>DMA Transfer Process</h3>
              <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* CPU sets up DMA transfer */</div>
                  <div>dma_controller.source = device_buffer_address;</div>
                  <div>dma_controller.destination = memory_address;</div>
                  <div>dma_controller.count = bytes_to_transfer;</div>
                  <div>dma_controller.direction = FROM_DEVICE;</div>
                  <div>dma_controller.start = 1; <span style={{ color: '#8b949e' }}>/* GO! */</span></div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* CPU is now FREE — DMA handles transfer */</div>
                  <div style={{ color: '#8b949e' }}>/* CPU gets ONE interrupt when done */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>DMA vs Programmed I/O — Performance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Programmed I/O (1MB transfer)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>CPU copies each 4-byte word: 256,000 iterations</li>
                    <li>CPU is busy 100% during transfer</li>
                    <li>No other work possible</li>
                    <li>1 interrupt per byte = 1,000,000 interrupts</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>DMA (1MB transfer)</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>CPU setup: ~5 register writes</li>
                    <li>CPU free during entire transfer</li>
                    <li>Can run other processes</li>
                    <li>Only 1 interrupt when done</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Cycle Stealing</h3>
              <InfoBox color="#f59e0b">
                The DMA controller and CPU share the same memory bus. When the DMA controller needs the bus to transfer data, it "steals" bus cycles from the CPU. The CPU is briefly paused (not interrupted — just stalled) while the DMA uses the bus. This is called <strong>cycle stealing</strong>. The CPU slows slightly but is still running (unlike polling where it does nothing).
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>IOMMU (I/O Memory Management Unit):</strong> A DMA controller can access any physical memory address — a security risk. If a malicious device (e.g., a Thunderbolt device) were to write to the wrong address, it could overwrite kernel memory. The IOMMU restricts which physical addresses a DMA controller can access — providing memory protection for I/O, similar to how the MMU protects for CPU access. Critical for virtualization (VT-d on Intel, AMD-Vi on AMD).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Scatter-Gather DMA:</strong> Modern DMA controllers support scatter-gather lists — a list of (address, length) pairs. Instead of requiring data to be contiguous in memory, the DMA controller can transfer to/from multiple non-contiguous memory regions in a single operation. This is essential for zero-copy networking — a packet can be assembled from multiple memory regions without copying.
              </LearnMore>

              <NavButtons prev={function() { setActive('polling') }} prevLabel="← 12.2 Polling" next={function() { setActive('kernel') }} nextLabel="12.4 Kernel I/O Subsystem →" />
            </div>
          )}

          {active === 'kernel' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.4 Kernel I/O Subsystem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The OS software layer that manages all I/O operations uniformly.</p>

              <InfoBox color="#10b981">
                The kernel I/O subsystem provides many services: <strong>scheduling</strong>, <strong>buffering</strong>, <strong>caching</strong>, <strong>spooling</strong>, <strong>device reservation</strong>, and <strong>error handling</strong>. It hides device-specific details behind a uniform interface.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>I/O Scheduling</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                The kernel maintains a <strong>wait queue</strong> of I/O requests for each device. The I/O scheduler reorders requests to improve efficiency. For disks: LOOK/C-LOOK algorithm to minimize head movement. For SSDs: NOOP (already covered in Chapter 11). Good scheduling can improve disk throughput by 2-3x.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Error Handling</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { error: 'Transient errors', color: '#f59e0b', action: 'Retry the operation. Many I/O errors (bus noise, temporary device issue) resolve on retry. The kernel retries failed I/O automatically several times before reporting failure.' },
                  { error: 'Permanent device errors', color: '#ef4444', action: 'Report error to the application. The device is removed from service. SMART alerts for disk errors. The OS marks bad sectors for remapping.' },
                  { error: 'Invalid I/O request', color: '#8b5cf6', action: 'Return error code to calling process. E.g., ENODEV (no such device), EIO (I/O error), EBUSY (device busy).' },
                ].map(function(e) {
                  return (
                    <div key={e.error} style={{ background: 'var(--bg-card)', border: '1px solid ' + e.color + '33', borderLeft: '4px solid ' + e.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: e.color, marginBottom: 6, fontSize: 13 }}>{e.error}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{e.action}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Device Reservation</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Some devices can only be used by one process at a time — printers, tape drives, card readers. The kernel provides exclusive access allocation. If a process requests a device already in use, it can either block or receive an error. Must be careful about deadlock with multiple exclusive resources.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>I/O Protection</h3>
              <InfoBox color="#3b82f6">
                All I/O instructions are privileged — only executable in kernel mode. A user process cannot directly issue I/O commands to hardware. It must make system calls (read, write, ioctl) which the kernel validates before performing the I/O. This prevents processes from corrupting each other's data or the OS.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>The I/O request lifecycle:</strong> Application calls read() → system call trap to kernel → VFS layer (virtual file system) → file system specific code → block layer → I/O scheduler → device driver → device controller → physical device → interrupt → device driver → wake up process → return data to application. Each layer adds overhead but provides abstraction and portability.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>STREAMS in UNIX:</strong> STREAMS is a framework in UNIX System V for building modular, stackable I/O device drivers. A stream consists of a user process end, a kernel end, and zero or more processing modules in between. Each module has a read queue and a write queue. Modules can be dynamically pushed and popped. Used for networking (TCP/IP stack), terminal I/O, and audio.
              </LearnMore>

              <NavButtons prev={function() { setActive('dma') }} prevLabel="← 12.3 DMA" next={function() { setActive('buffering') }} nextLabel="12.5 Buffering and Caching →" />
            </div>
          )}

          {active === 'buffering' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.5 Buffering, Caching, and Spooling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Three techniques that dramatically improve I/O performance.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Buffering</h3>
              <InfoBox color="#3b82f6">
                A <strong>buffer</strong> is an area of memory that stores data being transferred between two devices or a device and an application. Buffering handles: speed mismatches between producer and consumer, size mismatches (large blocks vs small chunks), and copy semantics (application can modify data after write() returns).
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    type: 'Single Buffering',
                    color: '#3b82f6',
                    desc: 'One buffer. Producer fills buffer. Consumer drains it. They cannot work simultaneously — one must wait. Simple but slow.',
                    diagram: ['[Producer]', '→', '[Buffer]', '→', '[Consumer]'],
                  },
                  {
                    type: 'Double Buffering',
                    color: '#10b981',
                    desc: 'Two buffers alternate. While consumer drains buffer A, producer fills buffer B. Then swap. Producer and consumer work simultaneously — much better throughput.',
                    diagram: ['[Producer]', '⇄', '[Buffer A / Buffer B]', '⇄', '[Consumer]'],
                  },
                  {
                    type: 'Circular Buffer',
                    color: '#f59e0b',
                    desc: 'Multiple buffers in a ring. Producer fills the next available. Consumer drains the oldest. Most flexible — handles variable rates. Used in audio, video streaming, network packets.',
                    diagram: ['[Producer]', '→', '[B0][B1][B2][B3]', '→', '[Consumer]'],
                  },
                ].map(function(b) {
                  return (
                    <div key={b.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + b.color + '44', borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: b.color, marginBottom: 8, fontSize: 14 }}>{b.type}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{b.desc}</p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {b.diagram.map(function(d, i) {
                          return <span key={i} style={{ fontSize: 12, color: b.color, background: b.color + '18', padding: '3px 10px', borderRadius: 6, fontFamily: 'monospace' }}>{d}</span>
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Caching</h3>
              <InfoBox color="#8b5cf6">
                A <strong>cache</strong> is a region of fast memory holding copies of data. I/O caching: the buffer cache (also called page cache in Linux) stores recently read disk blocks in memory. Subsequent reads to the same block are served from cache — no disk access needed. Write-through: writes go to disk immediately. Write-back: writes stay in cache, written to disk later (faster but risk of data loss on crash).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Spooling</h3>
              <InfoBox color="#f59e0b">
                <strong>Spooling</strong> (Simultaneous Peripheral Operations On-Line): holds output for a device that cannot accept interleaved data. The classic example: printing. Multiple processes write print jobs to a spool directory. The print daemon sends them to the printer one at a time. Processes get their data accepted immediately without waiting for the printer.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Print spooling */</div>
                  <div>Process A: write("Hello") → /var/spool/print/job001</div>
                  <div>Process B: write("World") → /var/spool/print/job002</div>
                  <div>Process C: write("!")    → /var/spool/print/job003</div>
                  <div></div>
                  <div style={{ color: '#10b981' }}>print_daemon: job001 → printer (Hello)</div>
                  <div style={{ color: '#10b981' }}>print_daemon: job002 → printer (World)</div>
                  <div style={{ color: '#10b981' }}>print_daemon: job003 → printer (!)</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux page cache:</strong> Linux combines the buffer cache and page cache into a single unified page cache. All file I/O goes through it — reads check the cache first, writes go to cache first (write-back). The page cache can use all available free RAM and shrinks when applications need memory. Dirty pages (modified but not yet written to disk) are flushed by the pdflush/writeback daemon periodically and under memory pressure.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Copy semantics:</strong> When a process calls write(buf, size), the data is copied to the kernel buffer immediately. The process can then modify buf without affecting the write. This is important for correctness — without copy semantics, modifying the buffer after write() would corrupt in-flight data. The trade-off is an extra copy operation, which zero-copy I/O (sendfile, io_uring) tries to eliminate.
              </LearnMore>

              <NavButtons prev={function() { setActive('kernel') }} prevLabel="← 12.4 Kernel I/O" next={function() { setActive('drivers') }} nextLabel="12.6 Device Drivers →" />
            </div>
          )}

          {active === 'drivers' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.6 Device Drivers</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The software layer between the OS and hardware — understanding drivers.</p>

              <InfoBox color="#f97316">
                A <strong>device driver</strong> is kernel-level code that encapsulates the knowledge needed to control a specific device. It translates abstract OS requests (read N bytes from position X) into device-specific commands (seek to cylinder C, wait for sector S, read 512 bytes). Drivers are typically written by device manufacturers.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Driver Architecture</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 400, marginBottom: 24 }}>
                {[
                  { layer: 'User Application', color: '#3b82f6', note: 'read(), write(), ioctl()' },
                  { layer: 'System Call Interface', color: '#8b5cf6', note: 'kernel boundary' },
                  { layer: 'VFS / Block Layer', color: '#10b981', note: 'generic I/O abstraction' },
                  { layer: 'Device Driver', color: '#f97316', note: 'device-specific code' },
                  { layer: 'Device Controller', color: '#f59e0b', note: 'hardware registers' },
                  { layer: 'Physical Device', color: '#6e7681', note: 'actual hardware' },
                ].map(function(l, i) {
                  return (
                    <div key={l.layer} style={{ background: l.color + '22', border: '1px solid ' + l.color + '44', borderRadius: 6, padding: '8px 14px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: l.color, fontSize: 13 }}>{l.layer}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.note}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>What a Driver Does</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { fn: 'Initialization', desc: 'Detects device, allocates resources (IRQ, DMA channel, I/O ports), initializes hardware to known state.' },
                  { fn: 'I/O Request Handling', desc: 'Translates read/write requests into device commands. Manages queues. Sets up DMA or starts programmed I/O.' },
                  { fn: 'Interrupt Handling', desc: 'Handles device interrupts. Reads status, transfers data, signals completion, handles errors.' },
                  { fn: 'Power Management', desc: 'Handles device sleep/wake. Saves/restores device state. Implements runtime PM for battery life.' },
                  { fn: 'Cleanup/Shutdown', desc: 'Frees resources when device removed (hot-plug). Flushes pending I/O. Disables interrupts.' },
                  { fn: 'ioctl interface', desc: 'Device-specific control operations beyond read/write. Example: set baud rate on serial port, eject CD, format disk.' },
                ].map(function(f) {
                  return (
                    <div key={f.fn} style={{ background: 'var(--bg-card)', border: '1px solid #f9731633', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: '#f97316', marginBottom: 4, fontSize: 12 }}>{f.fn}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Types of Devices</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { type: 'Block Devices', color: '#3b82f6', desc: 'Transfer data in fixed-size blocks (sectors). Random access. Examples: hard disks, SSDs, USB drives. Accessed via block layer with page cache.' },
                  { type: 'Character Devices', color: '#10b981', desc: 'Transfer data byte by byte, sequentially. No random access. Examples: keyboards, serial ports, audio devices. Accessed directly via character device interface.' },
                  { type: 'Network Devices', color: '#8b5cf6', desc: 'A special class — neither block nor character. Use socket interface. Packet-based. Examples: Ethernet NICs, WiFi adapters. Have their own network stack.' },
                ].map(function(t) {
                  return (
                    <div key={t.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: t.color, marginBottom: 8, fontSize: 13 }}>{t.type}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</p>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Driver bugs are catastrophic:</strong> Drivers run in kernel mode — a bug can crash the entire system (kernel panic/BSOD). Studies show 70% of OS crashes are caused by driver bugs. Solutions: driver signing (Windows requires signed drivers), driver isolation (running drivers in user space — microkernel approach), kernel probes (dynamic tracing to detect misbehavior). Linux's DKMS (Dynamic Kernel Module Support) manages out-of-tree drivers through kernel updates.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>User-space drivers (VFIO, UIO):</strong> Modern Linux supports running device drivers in user space using VFIO (for virtualization) and UIO (Userspace I/O). The kernel maps device registers and interrupt notifications to user space. This allows driver bugs to crash only the driver process, not the kernel. Used heavily in DPDK (Data Plane Development Kit) for high-performance networking.
              </LearnMore>

              <NavButtons prev={function() { setActive('buffering') }} prevLabel="← 12.5 Buffering" next={function() { setActive('performance') }} nextLabel="12.7 Performance →" />
            </div>
          )}

          {active === 'performance' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>12.7 I/O Performance</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Why I/O is the bottleneck and how to improve it.</p>

              <InfoBox color="#ec4899">
                I/O is a major factor in system performance. Every I/O operation involves multiple layers: application, OS, driver, controller, device. Each layer adds latency. Reducing I/O overhead is critical for system performance.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>I/O Overhead Sources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { source: 'Context switches', cost: 'High', desc: 'System call trap + interrupt handling + process wakeup. Each I/O involves multiple context switches.' },
                  { source: 'Data copying', cost: 'High', desc: 'Device → kernel buffer → user buffer. Multiple copies. Zero-copy techniques (sendfile, io_uring) eliminate unnecessary copies.' },
                  { source: 'Interrupt handling', cost: 'Medium', desc: 'Each interrupt saves/restores CPU state. High interrupt rates (network 100K+ packets/sec) can saturate the CPU.' },
                  { source: 'Device latency', cost: 'Very High', desc: 'HDD: 10ms. SSD: 100μs. NVMe: 20μs. Network: 1ms LAN, 100ms WAN. Cannot be avoided — physics is the limit.' },
                ].map(function(s) {
                  return (
                    <div key={s.source} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 160 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{s.source}</div>
                        <span style={{ fontSize: 11, background: s.cost === 'Very High' ? '#ef444422' : s.cost === 'High' ? '#f59e0b22' : '#10b98122', color: s.cost === 'Very High' ? '#ef4444' : s.cost === 'High' ? '#f59e0b' : '#10b981', padding: '1px 8px', borderRadius: 8 }}>{s.cost}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Improving I/O Performance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { technique: 'Reduce context switches', color: '#3b82f6', desc: 'Use async I/O (io_uring, AIO). Complete more work per interrupt (interrupt coalescing). Reduce syscall frequency (batch I/O).' },
                  { technique: 'Reduce data copying', color: '#10b981', desc: 'sendfile() for file-to-socket. mmap() for file access. DMA for device transfers. io_uring registered buffers.' },
                  { technique: 'Use larger I/O sizes', color: '#f59e0b', desc: 'One large I/O is cheaper than many small ones. Readahead (prefetch) for sequential access. Write coalescing.' },
                  { technique: 'Use faster storage', color: '#8b5cf6', desc: 'NVMe over HDD is 1000x faster for random I/O. RAM cache (tmpfs) for temporary files. Optane for latency-critical data.' },
                  { technique: 'Parallelize I/O', color: '#ef4444', desc: 'RAID for parallel disk access. Asynchronous I/O for multiple operations simultaneously. io_uring submission queues.' },
                  { technique: 'Cache aggressively', color: '#f97316', desc: 'Linux page cache. Application-level caches (Redis, Memcached). Read-ahead for sequential patterns. Write-back caching.' },
                ].map(function(t) {
                  return (
                    <div key={t.technique} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '33', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: t.color, marginBottom: 6, fontSize: 13 }}>{t.technique}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>io_uring — the modern Linux I/O revolution:</strong> Introduced in Linux 5.1 (2019), io_uring provides a shared ring buffer between kernel and user space for submitting and completing I/O requests without system calls for each operation. Batch hundreds of I/O operations with a single system call. In benchmarks, io_uring achieves close to NVMe's raw IOPS limit — previously impossible with traditional syscalls. Used by databases (PostgreSQL, RocksDB), network servers (nginx, Envoy), and game engines.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Interrupt coalescing in NICs:</strong> At 10 Gbps, a NIC can receive 14.8 million minimum-size packets per second — one interrupt per packet would overwhelm the CPU. Interrupt coalescing delays interrupts by a few microseconds to batch multiple packets into one interrupt. NAPI (New API) in Linux polls the NIC briefly after an interrupt instead of re-enabling interrupts immediately — reducing interrupt rate under load from millions to thousands per second.
              </LearnMore>

              <NavButtons prev={function() { setActive('drivers') }} prevLabel="← 12.6 Device Drivers" next={function() { setActive('simulator') }} nextLabel="I/O Simulator →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>I/O Method Simulator</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Step through each I/O method and compare CPU utilization.</p>
              <IOMethodVisualizer />

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Quick Comparison</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        {['Method', 'CPU during I/O', 'Interrupts', 'Best for'].map(function(h) {
                          return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Polling', 'Busy (100%)', 'None', 'Very fast devices, low latency'],
                        ['Interrupt-driven', 'Free (does other work)', '1 per operation', 'General purpose'],
                        ['DMA', 'Free (max utilization)', '1 per block', 'Large data transfers'],
                      ].map(function(row) {
                        return (
                          <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#ec4899' }}>{row[0]}</td>
                            {row.slice(1).map(function(cell, i) {
                              return <td key={i} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{cell}</td>
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <NavButtons prev={function() { setActive('performance') }} prevLabel="← 12.7 Performance" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — I/O in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore I/O operations through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#ec4899' }}>Lab 1 — Python I/O Operations</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore I/O in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ls /dev',                  'List all device files'],
                  ['ls /dev/sd*',              'List disk devices'],
                  ['cat /proc/interrupts',     'Show interrupt counts per CPU per device'],
                  ['cat /proc/iomem',          'Show memory-mapped I/O regions'],
                  ['cat /proc/ioports',        'Show port-mapped I/O regions'],
                  ['lspci',                    'List PCI devices'],
                  ['lsusb',                    'List USB devices'],
                  ['iostat -d 1 3',           'Disk I/O statistics (1s interval, 3 times)'],
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 12.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#ec4899' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#ec4899', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#ec4899', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 12!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/13' }} style={{ background: '#ec4899', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 13 →</button>
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