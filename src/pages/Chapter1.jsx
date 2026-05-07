import { useState } from 'react'
import { Link } from 'react-router-dom'

const sections = [
  { id: 'what', title: '1.1 What is an Operating System?', icon: '🖥️' },
  { id: 'structure', title: '1.2 Computer System Structure', icon: '🏗️' },
  { id: 'operations', title: '1.3 OS Operations & Modes', icon: '⚙️' },
  { id: 'resource', title: '1.4 Resource Management', icon: '📦' },
  { id: 'types', title: '1.5 Types of Operating Systems', icon: '🗂️' },
  { id: 'history', title: '1.6 History of OS', icon: '📜' },
  { id: 'quiz', title: '🧠 Quiz Yourself', icon: '✅' },
]

const quizQuestions = [
  {
    q: 'What is the main role of an Operating System?',
    options: ['Play games', 'Act as intermediary between user and hardware', 'Connect to the internet', 'Store files only'],
    answer: 1,
    explanation: 'The OS acts as an intermediary — it manages hardware resources and provides services to programs and users.'
  },
  {
    q: 'Which mode allows direct access to hardware?',
    options: ['User mode', 'Safe mode', 'Kernel mode', 'Guest mode'],
    answer: 2,
    explanation: 'Kernel mode (also called privileged mode) allows the OS to execute any CPU instruction and access any hardware directly.'
  },
  {
    q: 'What is a kernel?',
    options: ['A type of file', 'The core program of the OS that runs at all times', 'A hardware component', 'A user application'],
    answer: 1,
    explanation: 'The kernel is the one program always running on the computer — it is the core of the OS and manages everything.'
  },
  {
    q: 'What happens during a context switch?',
    options: ['The screen changes color', 'OS saves one process state and loads another', 'A file gets deleted', 'The CPU shuts down'],
    answer: 1,
    explanation: 'A context switch saves the current process state (registers, PC, etc.) and loads the saved state of another process so it can run.'
  },
]

function LearnMore({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: '12px' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: '1px solid #3b82f655', color: '#3b82f6',
        padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
        fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s'
      }}>
        {open ? '▲ Show Less' : '▼ Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{
          marginTop: '12px', background: 'rgba(59,130,246,0.06)',
          border: '1px solid #3b82f633', borderRadius: '10px', padding: '20px',
          fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.9'
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

function InfoBox({ children, color }) {
  return (
    <div style={{
      background: `${color}12`, border: `1px solid ${color}44`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '10px', padding: '16px 20px', marginBottom: '24px',
      fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8'
    }}>
      {children}
    </div>
  )
}

function NavButtons({ prev, prevLabel, next, nextLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
      {prev ? (
        <button onClick={prev} style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          {prevLabel}
        </button>
      ) : <div />}
      {next && (
        <button onClick={next} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          {nextLabel}
        </button>
      )}
    </div>
  )
}

export default function Chapter1() {
  const [active, setActive] = useState('what')
  const [quiz, setQuiz] = useState({ current: 0, selected: null, answered: false, score: 0, done: false })

  const handleAnswer = (i) => {
    if (quiz.answered) return
    const correct = i === quizQuestions[quiz.current].answer
    setQuiz(q => ({ ...q, selected: i, answered: true, score: correct ? q.score + 1 : q.score }))
  }

  const nextQuestion = () => {
    if (quiz.current + 1 >= quizQuestions.length) setQuiz(q => ({ ...q, done: true }))
    else setQuiz(q => ({ ...q, current: q.current + 1, selected: null, answered: false }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
        borderBottom: '1px solid #3b82f644', padding: '48px 60px'
      }}>
        <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Chapter 1</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '48px' }}>🖥️</span>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>Introduction to Operating Systems</h1>
        </div>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: '1.7' }}>
          Everything you need to know — explained clearly with visuals. Click <strong style={{color:'#3b82f6'}}>Learn More</strong> on any topic for a deep technical dive.
        </p>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Section nav */}
        <div style={{ width: '240px', minWidth: '240px', padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(s => (
            <div key={s.id} onClick={() => setActive(s.id)} style={{
              padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: '10px',
              alignItems: 'center', fontSize: '13px', fontWeight: '500',
              color: active === s.id ? '#3b82f6' : 'var(--text-secondary)',
              background: active === s.id ? 'rgba(59,130,246,0.1)' : 'transparent',
              borderLeft: active === s.id ? '3px solid #3b82f6' : '3px solid transparent',
              transition: 'all 0.2s'
            }}>
              <span>{s.icon}</span>
              <span>{s.title.split(' ').slice(0, 4).join(' ')}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '48px 60px', maxWidth: '900px' }}>

          {/* ── 1.1 ── */}
          {active === 'what' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>1.1 What is an Operating System?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>The foundation of every computer you've ever used.</p>

              <InfoBox color="#3b82f6">
                An <strong>Operating System (OS)</strong> is a software program that acts as an <strong>intermediary between the user and the computer hardware</strong>. It manages all hardware resources and provides a platform for application programs to run.
              </InfoBox>

              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Technical Definition:</strong> An OS is a resource allocator and control program. As a <em>resource allocator</em> it manages CPU time, memory space, file storage, and I/O devices — deciding between conflicting requests to ensure efficient and fair use. As a <em>control program</em> it controls the execution of user programs to prevent errors and improper use of the computer.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>The Kernel:</strong> There is no universally agreed definition of what is part of the OS. A common definition is that the OS is the one program running at all times on the computer — usually called the <strong>kernel</strong>. Along with the kernel there are two types of programs: <em>system programs</em> (associated with the OS but not part of the kernel) and <em>application programs</em> (all other programs). On mobile systems like Android, the OS includes not just the kernel but also middleware — a set of software frameworks providing additional services to app developers.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Why do we need an OS at all?</strong> Early computers had no OS. Each programmer had to write code to control every piece of hardware directly. If you wanted to read from a disk, you had to write hundreds of lines of low-level code just to spin the disk, position the head, and read raw bytes. The OS abstracts all of this — you just call <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>read(file)</code> and the OS handles everything.
              </LearnMore>

              <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', margin: '24px 0', fontSize: '15px' }}>
                When you open a browser, play music, or save a file, the <strong style={{ color: 'var(--text-primary)' }}>OS does all the hardware talking for you</strong>. It's the invisible manager running everything behind the scenes.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', marginTop: '32px' }}>The 4 Layers of a Computer System</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px' }}>
                {[
                  { label: '👤 Users', sub: 'People who use the computer', color: '#8b5cf6', bg: '#8b5cf618' },
                  { label: '📱 Application Programs', sub: 'Browser, Word, Games, Spotify', color: '#3b82f6', bg: '#3b82f618' },
                  { label: '⚡ Operating System', sub: 'Manages and coordinates everything below', color: '#10b981', bg: '#10b98118' },
                  { label: '🔧 Hardware', sub: 'CPU, RAM, Hard Drive, GPU', color: '#f59e0b', bg: '#f59e0b18' },
                ].map((l, i) => (
                  <div key={i} style={{ background: l.bg, border: `1px solid ${l.color}44`, borderRadius: '10px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: l.color }}>{l.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{l.sub}</div>
                  </div>
                ))}
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Deeper look at each layer:</strong>
                <br/><br/>
                <strong style={{color:'#8b5cf6'}}>Users</strong> — Can be humans, other computers, or automated scripts. A web server "user" is actually another program making requests. The OS doesn't discriminate — it serves all users equally based on permissions.
                <br/><br/>
                <strong style={{color:'#3b82f6'}}>Application Programs</strong> — These run in <em>user space</em> and cannot directly touch hardware. They request services from the OS via <em>system calls</em>. Examples: your browser calls the OS to open a network socket; your music app calls the OS to write audio data to the sound card.
                <br/><br/>
                <strong style={{color:'#10b981'}}>Operating System</strong> — The only software running in <em>kernel space</em> with full hardware access. It implements abstractions (files, processes, sockets) that applications use. The OS kernel is typically 10–30 million lines of code in modern systems (Linux kernel is ~27 million lines).
                <br/><br/>
                <strong style={{color:'#f59e0b'}}>Hardware</strong> — The physical layer. The CPU executes instructions at 3–5 GHz (3–5 billion cycles per second). RAM access takes ~100 nanoseconds. An SSD takes ~100 microseconds. A network packet across the world takes ~150 milliseconds. The OS must handle these vast speed differences gracefully using buffers, caches, and queues.
              </LearnMore>

              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', marginTop: '32px' }}>Two Views of an OS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                  <div style={{ fontWeight: '700', marginBottom: '8px', color: '#3b82f6' }}>User View</div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>The OS should be <strong style={{color:'var(--text-primary)'}}>easy to use</strong>. A personal computer OS focuses on making the interface friendly. Ease of use matters more than resource utilization.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖥️</div>
                  <div style={{ fontWeight: '700', marginBottom: '8px', color: '#10b981' }}>System View</div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>The OS is a <strong style={{color:'var(--text-primary)'}}>resource allocator and manager</strong>. It decides who gets the CPU, how much memory each program gets, and manages all I/O devices.</p>
                </div>
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>The embedded/IoT view:</strong> On embedded systems (like a thermostat or smart fridge), there may be little to no user interface. The OS focus shifts entirely to reliability, real-time response, and minimal resource usage. Some embedded systems run on as little as 4KB of RAM — the entire OS must fit in that space.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>The server view:</strong> On servers, the OS must maximize resource utilization and serve hundreds or thousands of concurrent users. No one cares about ease of use — performance, stability, and security are everything. This is why servers run Linux: it's highly configurable, lean, and extremely stable.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>The mobile view:</strong> On smartphones, the OS must balance three competing demands: performance, battery life, and user experience. Android and iOS make different trade-offs. iOS tightly controls what apps can do (better battery, security) while Android gives apps more freedom (more flexibility, more risk).
              </LearnMore>

              <NavButtons next={() => setActive('structure')} nextLabel="1.2 Computer System Structure →" />
            </div>
          )}

          {/* ── 1.2 ── */}
          {active === 'structure' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>1.2 Computer System Structure</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>What's physically inside your computer and how the pieces communicate.</p>

              <InfoBox color="#06b6d4">
                A computer system has four main components: <strong>Hardware</strong>, <strong>Operating System</strong>, <strong>Application Programs</strong>, and <strong>Users</strong>. The hardware provides the basic computing resources — CPU, memory, and I/O devices.
              </InfoBox>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 16px' }}>Hardware Components</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                {[
                  { icon: '🧠', name: 'CPU (Processor)', color: '#3b82f6', desc: 'The brain of the computer. Executes instructions — billions per second. Every calculation goes through here.' },
                  { icon: '💾', name: 'RAM (Main Memory)', color: '#10b981', desc: 'Temporary fast storage. Programs load into RAM to run. Lost when power is off — this is called volatile memory.' },
                  { icon: '💿', name: 'Storage (HDD/SSD)', color: '#f59e0b', desc: 'Permanent storage. Your files and OS live here permanently, even when power is off — non-volatile memory.' },
                  { icon: '🔌', name: 'I/O Devices', color: '#8b5cf6', desc: 'Everything else — keyboard, mouse, screen, printer. The OS controls them via device drivers.' },
                  { icon: '🚌', name: 'System Bus', color: '#06b6d4', desc: 'The communication highway connecting CPU, memory, and I/O devices. Data travels through the bus.' },
                  { icon: '🎮', name: 'Device Controllers', color: '#ef4444', desc: 'Small chips that control each device. Disk controller manages the disk, USB controller manages USB.' },
                ].map(h => (
                  <div key={h.name} style={{ background: 'var(--bg-card)', border: `1px solid ${h.color}33`, borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{h.icon}</div>
                    <div style={{ fontWeight: '700', marginBottom: '6px', color: h.color }}>{h.name}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{h.desc}</p>
                  </div>
                ))}
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>CPU Deep Dive:</strong> Modern CPUs have multiple cores (2, 4, 8, 16, 32+). Each core is an independent processor that can execute instructions simultaneously. A CPU also has multiple levels of cache memory — L1 (fastest, ~32KB, ~1ns), L2 (~256KB, ~5ns), L3 (shared, ~8MB, ~20ns) — because RAM (~100ns) is too slow for the CPU to wait for constantly. The OS is responsible for scheduling work across all cores efficiently.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Memory Hierarchy (from fastest to slowest):</strong>
                <br/>Registers (inside CPU) → L1 Cache → L2 Cache → L3 Cache → RAM → SSD → HDD → Network Storage
                <br/>Each level is slower but larger and cheaper. The OS and hardware work together to keep frequently used data in faster levels (caching).
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>DMA — Direct Memory Access:</strong> For large data transfers (like reading a file from disk), it would be wasteful for the CPU to copy each byte manually. Instead, a <em>DMA controller</em> does the transfer directly between the device and memory, freeing the CPU to do other work. When done, the DMA controller sends an interrupt to tell the CPU the transfer is complete.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>System Bus Types:</strong> The <em>data bus</em> carries actual data. The <em>address bus</em> carries memory addresses (where to read/write). The <em>control bus</em> carries signals like read/write commands. Modern systems use PCIe (PCI Express) for GPU and NVMe drives — it can transfer data at 64 GB/s on PCIe 5.0.
              </LearnMore>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '32px 0 16px' }}>How the Computer Starts — Bootstrap Process</h3>
              <InfoBox color="#8b5cf6">
                When you press the power button, the computer runs a <strong>bootstrap program</strong> stored in ROM/EEPROM (firmware — BIOS or UEFI). This initializes hardware and loads the OS kernel into memory.
              </InfoBox>
              <div style={{ marginBottom: '12px' }}>
                {[
                  { step: '1', text: 'Power button pressed → Electricity flows to motherboard', color: '#f59e0b' },
                  { step: '2', text: 'CPU wakes up → Runs bootstrap program from ROM (BIOS/UEFI)', color: '#f59e0b' },
                  { step: '3', text: 'Bootstrap checks all hardware — RAM, CPU, keyboard, disk (POST)', color: '#10b981' },
                  { step: '4', text: 'Bootstrap finds the OS on disk and loads the kernel into RAM', color: '#10b981' },
                  { step: '5', text: 'OS kernel starts running → Initializes all device drivers', color: '#3b82f6' },
                  { step: '6', text: 'OS starts system processes → Shows login screen to user', color: '#3b82f6' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#000', flexShrink: 0 }}>{s.step}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingTop: '4px', lineHeight: '1.6' }}>{s.text}</div>
                  </div>
                ))}
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>BIOS vs UEFI:</strong> BIOS (Basic Input/Output System) is the old standard, limited to 16-bit mode and 1MB of addressable memory — it can't boot from disks larger than 2TB. UEFI (Unified Extensible Firmware Interface) is the modern replacement — runs in 32/64-bit mode, supports disks up to 9.4 zettabytes, has a graphical interface, supports Secure Boot (prevents malware from loading before the OS), and boots significantly faster.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Bootloader details:</strong> After the firmware, a <em>bootloader</em> runs (GRUB on Linux, Windows Boot Manager on Windows). The bootloader's job is to locate the OS kernel on disk, load it into memory, and transfer control to it. GRUB (Grand Unified Bootloader) can boot multiple different OS kernels and lets you choose at startup — this is how dual-boot systems work.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>What the kernel does at startup:</strong> The kernel initializes data structures (process table, memory tables, file system), mounts the root file system, starts the first process (PID 1 — called <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>init</code> or <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>systemd</code> on Linux), which then starts all other system services (networking, display manager, etc.).
              </LearnMore>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '32px 0 12px' }}>Interrupts — How Hardware Talks to the CPU</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
                Hardware devices get the CPU's attention through <strong style={{ color: 'var(--text-primary)' }}>interrupts</strong> — signals sent to the CPU saying "stop what you're doing, I need attention."
              </p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #06b6d444', borderRadius: '10px', padding: '20px', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <strong style={{ color: '#06b6d4' }}>Example:</strong> You press a key → keyboard controller sends an interrupt → CPU pauses current task, saves state → runs interrupt handler (reads the key) → returns to previous task. This happens thousands of times per second.
                </p>
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Interrupt vs Trap vs Exception:</strong>
                <br/>• <strong>Hardware Interrupt</strong> — generated by a hardware device (keyboard press, disk read complete, network packet arrived). Asynchronous — can happen at any time.
                <br/>• <strong>Trap (Software Interrupt)</strong> — generated deliberately by a program, usually to invoke an OS service (system call). Synchronous — happens at a specific point in code.
                <br/>• <strong>Exception</strong> — generated by the CPU itself when something goes wrong (division by zero, illegal memory access, stack overflow). The OS decides how to handle it — usually by terminating the offending process.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Interrupt Vector Table:</strong> The CPU knows what to do for each interrupt because of the <em>Interrupt Vector Table (IVT)</em> — an array stored at a fixed memory location. Each entry points to the <em>Interrupt Service Routine (ISR)</em> — the code that handles that specific interrupt. When interrupt #14 fires (page fault), the CPU looks up entry 14 in the IVT and jumps to that handler code.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Interrupt overhead:</strong> Handling an interrupt requires: saving all CPU registers, switching to kernel mode, looking up the ISR, executing it, then restoring all registers and switching back. This takes ~1–5 microseconds. On a busy server receiving millions of network packets per second, interrupt handling can consume significant CPU time — which is why modern systems use techniques like interrupt coalescing and NAPI (New API) in Linux to batch interrupt handling.
              </LearnMore>

              <NavButtons prev={() => setActive('what')} prevLabel="← 1.1 What is an OS?" next={() => setActive('operations')} nextLabel="1.3 OS Operations →" />
            </div>
          )}

          {/* ── 1.3 ── */}
          {active === 'operations' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>1.3 OS Operations & Dual Mode</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>How the OS protects itself and the hardware from buggy or malicious programs.</p>

              <InfoBox color="#ef4444">
                The OS must protect itself using <strong>dual-mode operation</strong> — the CPU runs in either <strong>User Mode</strong> (restricted) or <strong>Kernel Mode</strong> (full access). A hardware bit called the <strong>mode bit</strong> tracks which mode the CPU is in.
              </InfoBox>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 16px' }}>Dual-Mode Operation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div style={{ background: '#3b82f618', border: '2px solid #3b82f644', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👤</div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', marginBottom: '12px' }}>User Mode (mode bit = 1)</h4>
                  <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '2', listStyle: 'none' }}>
                    <li>✅ Where your apps run</li>
                    <li>✅ Limited hardware access</li>
                    <li>✅ Cannot access other programs' memory</li>
                    <li>✅ Cannot run privileged instructions</li>
                    <li>✅ If app crashes, OS is safe</li>
                  </ul>
                </div>
                <div style={{ background: '#ef444418', border: '2px solid #ef444444', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444', marginBottom: '12px' }}>Kernel Mode (mode bit = 0)</h4>
                  <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '2', listStyle: 'none' }}>
                    <li>✅ Where the OS kernel runs</li>
                    <li>✅ Full hardware access</li>
                    <li>✅ Can execute ANY CPU instruction</li>
                    <li>✅ Can access any memory address</li>
                    <li>✅ Also called privileged / supervisor mode</li>
                  </ul>
                </div>
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>What are "privileged instructions"?</strong> Some CPU instructions are so powerful they could damage the system or compromise security if any program could run them. These are only allowed in kernel mode. Examples:
                <br/>• Directly accessing I/O ports (could let a program hijack devices)
                <br/>• Modifying memory protection registers (could let a program access all memory)
                <br/>• Halting the CPU (would freeze the system)
                <br/>• Disabling interrupts (would make the OS unable to regain control)
                <br/>• Loading/modifying the page table base register (controls virtual memory mapping)
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>What happens if user mode code tries a privileged instruction?</strong> The CPU detects the violation and raises an exception (a "privileged instruction" exception). The OS exception handler runs, and typically terminates the offending program immediately. This is why a buggy app cannot crash your whole system — its damage is contained.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Multi-level protection rings (x86):</strong> Intel x86 CPUs actually have 4 rings (0–3). Ring 0 = kernel (most privileged). Ring 3 = user applications (least privileged). Rings 1 and 2 were intended for device drivers but modern OSes use only rings 0 and 3 for simplicity. Virtualization added a new "Ring -1" (VMX root mode) for hypervisors to run even more privileged than the OS kernel.
              </LearnMore>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '32px 0 12px' }}>System Calls</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
                A <strong style={{ color: 'var(--text-primary)' }}>system call</strong> is how a user program asks the OS to do something. Since user programs can't directly access hardware, they ask the OS through system calls — which trigger a switch to kernel mode.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { type: 'Process', calls: ['fork()', 'exec()', 'exit()', 'wait()'], color: '#3b82f6' },
                  { type: 'File', calls: ['open()', 'read()', 'write()', 'close()'], color: '#10b981' },
                  { type: 'Device', calls: ['ioctl()', 'read()', 'write()', 'seek()'], color: '#8b5cf6' },
                  { type: 'Memory', calls: ['mmap()', 'brk()', 'mprotect()', 'munmap()'], color: '#f59e0b' },
                  { type: 'Network', calls: ['socket()', 'connect()', 'send()', 'recv()'], color: '#06b6d4' },
                  { type: 'Info', calls: ['getpid()', 'alarm()', 'sleep()', 'time()'], color: '#ef4444' },
                ].map(sc => (
                  <div key={sc.type} style={{ background: 'var(--bg-card)', border: `1px solid ${sc.color}44`, borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: sc.color, marginBottom: '10px', textTransform: 'uppercase' }}>{sc.type}</div>
                    {sc.calls.map(c => (
                      <div key={c} style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', marginBottom: '4px' }}>{c}</div>
                    ))}
                  </div>
                ))}
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>How a system call works step by step:</strong>
                <br/>1. Application calls a library function like <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>printf()</code>
                <br/>2. The C library (glibc) prepares the system call number and parameters in CPU registers
                <br/>3. Executes a special CPU instruction: <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>syscall</code> (x86-64) or <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>svc</code> (ARM)
                <br/>4. CPU automatically switches to kernel mode (mode bit = 0) and jumps to the system call handler
                <br/>5. OS validates parameters, performs the requested operation (e.g., writes to screen)
                <br/>6. OS puts the return value in a register, switches back to user mode (mode bit = 1)
                <br/>7. Application receives the return value and continues executing
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Performance cost of system calls:</strong> A system call is expensive compared to a regular function call — ~100–1000ns due to the mode switch, register saving, kernel execution, and return. This is why programs try to minimize system calls. For example, the C library buffers <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>printf()</code> output and only calls the <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>write()</code> system call when the buffer is full.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Windows vs Linux system calls:</strong> Linux has ~350 system calls. Windows has ~400+ (but many are undocumented). Windows applications typically don't call the kernel directly — they call Win32 API functions (in DLLs like kernel32.dll) which internally make the actual system calls. Linux applications can call the kernel directly or through glibc.
              </LearnMore>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '32px 0 12px' }}>Timer — Preventing Infinite Loops</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
                A <strong style={{ color: 'var(--text-primary)' }}>hardware timer</strong> generates an interrupt after a set time, forcing a return to the OS kernel so it can decide what runs next. This prevents any single program from monopolizing the CPU forever.
              </p>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>How the timer works in practice:</strong> The OS sets the hardware timer (e.g., to fire every 10ms). When a process is given the CPU, the timer starts counting. If the process doesn't voluntarily give up the CPU before 10ms, the timer fires an interrupt, switching to kernel mode. The OS scheduler then decides whether to continue this process or switch to another. This is called <em>preemptive scheduling</em>.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>The timer quantum:</strong> The time slice given to each process is called a <em>quantum</em> or <em>time slice</em>. Linux uses ~4ms on desktops (to feel responsive) and ~100ms on servers (to reduce context switch overhead). Windows uses ~15ms. Shorter quanta feel more responsive but waste more CPU time on context switches.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>What if the OS gets into an infinite loop?</strong> A <em>watchdog timer</em> — a separate hardware timer that the OS must periodically reset ("pet the watchdog"). If the OS hangs and stops petting it, the watchdog resets the entire system. This is critical in embedded systems and servers where human intervention may not be available.
              </LearnMore>

              <NavButtons prev={() => setActive('structure')} prevLabel="← 1.2 System Structure" next={() => setActive('resource')} nextLabel="1.4 Resource Management →" />
            </div>
          )}

          {/* ── 1.4 ── */}
          {active === 'resource' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>1.4 Resource Management</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>The OS is essentially a resource manager — fair, efficient, always in control.</p>

              <InfoBox color="#10b981">
                The OS manages four key resources: <strong>CPU</strong>, <strong>Memory</strong>, <strong>File System</strong>, and <strong>I/O Devices</strong>. Every decision it makes is about using these resources efficiently and fairly.
              </InfoBox>

              {[
                {
                  icon: '🧠', title: 'Process Management', color: '#3b82f6',
                  desc: 'A process is a program in execution — it\'s the unit of work in the OS. The OS creates, schedules, suspends, resumes, and terminates processes. It also handles communication between them.',
                  points: ['Creating and terminating processes', 'Scheduling processes on the CPU', 'Inter-process communication (IPC)', 'Process synchronization'],
                  deep: `<strong style="color:var(--text-primary)">Process vs Program:</strong> A program is a passive entity — code sitting on disk. A process is an active entity — that code loaded into memory and running. One program can create many processes (e.g., open Chrome 3 times = 3+ processes).\n\n<strong style="color:var(--text-primary)">Process Control Block (PCB):</strong> Each process is represented in the OS by a PCB — a data structure containing: process state (running/waiting/ready), program counter (next instruction), CPU registers, memory limits, list of open files, scheduling information, and more. When a context switch happens, the OS saves the current process's CPU state into its PCB and loads another process's PCB.\n\n<strong style="color:var(--text-primary)">Context Switch cost:</strong> During a context switch, no useful work happens — it's pure overhead. A context switch takes ~1–10 microseconds. On a system doing 1000 switches/second, that's 1–10ms of wasted CPU time per second (~1% overhead). This is why the OS tries to balance responsiveness (small quanta, frequent switches) with efficiency (large quanta, fewer switches).`
                },
                {
                  icon: '💾', title: 'Memory Management', color: '#8b5cf6',
                  desc: 'RAM is fast but limited. The OS tracks every byte — which parts are used, by which process, and allocates/deallocates memory as programs start and finish.',
                  points: ['Track which memory is used/free', 'Allocate and deallocate memory', 'Decide which processes to load when memory fills', 'Virtual memory — using disk as extra RAM'],
                  deep: `<strong style="color:var(--text-primary)">Why memory management is hard:</strong> Multiple processes run simultaneously, each needing memory. If process A can read process B's memory, that's a security disaster. If two processes write to the same address, corruption occurs. The OS uses hardware (the MMU — Memory Management Unit) to give each process its own private address space, making it impossible for one process to access another's memory without permission.\n\n<strong style="color:var(--text-primary)">Virtual vs Physical memory:</strong> Each process sees its own "virtual" address space starting at address 0. The MMU translates virtual addresses to physical RAM addresses transparently. Process A's virtual address 0x1000 might map to physical address 0x45000, while Process B's virtual address 0x1000 maps to 0x89000 — completely separate.\n\n<strong style="color:var(--text-primary)">Virtual memory:</strong> The OS can use disk space as "overflow" memory. Pages of memory not recently used are saved to disk (the "swap space"). When accessed again, they're loaded back into RAM. This lets you run programs that need more RAM than you physically have — at the cost of speed (disk is 1000x slower than RAM).`
                },
                {
                  icon: '📁', title: 'File-System Management', color: '#10b981',
                  desc: 'The OS abstracts physical storage into a clean, organized file system. Files can be organized in directories, with access controlled by permissions.',
                  points: ['Creating and deleting files/directories', 'Read, write, seek operations', 'Mapping files to physical storage', 'Access control and permissions'],
                  deep: `<strong style="color:var(--text-primary)">What is a file system?</strong> Without a file system, a disk is just billions of raw bits — meaningless. A file system imposes structure: it divides the disk into blocks, keeps a table of where each file's blocks are located, tracks free space, stores file metadata (name, size, owner, permissions, timestamps), and organizes files into directories.\n\n<strong style="color:var(--text-primary)">Common file systems:</strong> NTFS (Windows — supports large files, permissions, encryption, journaling), ext4 (Linux — fast, reliable, most common Linux FS), APFS (Apple — optimized for SSDs, snapshots, encryption), FAT32/exFAT (USB drives — compatible with everything but limited features), ZFS (servers — self-healing, RAID built-in, checksums everything).\n\n<strong style="color:var(--text-primary)">Journaling:</strong> If the computer loses power mid-write, the file system could be corrupted. Journaling fixes this — before making changes, the FS writes what it's about to do to a journal. If power is lost, on restart it can replay or roll back the journal to restore consistency. This is why modern file systems (ext4, NTFS) can check themselves in seconds rather than hours.`
                },
                {
                  icon: '🔌', title: 'I/O Management', color: '#f59e0b',
                  desc: 'The I/O subsystem hides the quirks of each hardware device. Device drivers know their specific device so the rest of the OS doesn\'t have to.',
                  points: ['Buffering (temporary data storage during transfer)', 'Caching (keeping frequent data in faster storage)', 'Spooling (overlapping output for slow devices)', 'Device driver interface'],
                  deep: `<strong style="color:var(--text-primary)">Device drivers:</strong> Each hardware device needs a driver — software that knows how to talk to that specific device. Your GPU has a driver (from NVIDIA/AMD), your network card has a driver, your keyboard has a driver. The OS provides a standard interface and the driver implements it for the specific hardware. This is the "plug and play" model — you plug in a new device, the OS loads its driver, and it just works.\n\n<strong style="color:var(--text-primary)">Buffering:</strong> Data produced and consumed at different rates needs buffering. When you stream a video, data arrives from the network faster than you watch it — it's buffered. When you type, keystrokes are buffered and sent to the app in batches. Buffers smooth out speed differences between fast producers and slow consumers.\n\n<strong style="color:var(--text-primary)">Spooling (Simultaneous Peripheral Operations On-Line):</strong> Classic example — printing. Many processes want to print simultaneously, but the printer is slow and can only handle one job at a time. The OS spooler accepts print jobs from all processes, stores them in a queue, and feeds them to the printer one at a time. Processes think their print finished immediately but actually it's just been queued.`
                },
              ].map(r => (
                <div key={r.title} style={{ background: 'var(--bg-card)', border: `1px solid ${r.color}33`, borderRadius: '12px', padding: '24px', marginBottom: '20px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{r.icon}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: r.color }}>{r.title}</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>{r.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {r.points.map(p => (
                      <span key={p} style={{ fontSize: '12px', background: `${r.color}18`, color: r.color, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${r.color}33` }}>✓ {p}</span>
                    ))}
                  </div>
                  <LearnMore>
                    <span dangerouslySetInnerHTML={{ __html: r.deep.replace(/\n\n/g, '<br/><br/>') }} />
                  </LearnMore>
                </div>
              ))}

              <NavButtons prev={() => setActive('operations')} prevLabel="← 1.3 OS Operations" next={() => setActive('types')} nextLabel="1.5 Types of OS →" />
            </div>
          )}

          {/* ── 1.5 ── */}
          {active === 'types' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>1.5 Types of Operating Systems</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>Different environments need different OS designs.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {[
                  {
                    icon: '🖥️', name: 'Batch Systems', color: '#3b82f6',
                    desc: 'Jobs are collected, grouped (batched), and executed one after another without user interaction. Like a factory assembly line — efficient but no interactivity.',
                    example: 'Early 1950s–60s mainframes. Modern: payroll/billing batch jobs overnight.',
                    deep: `<strong style="color:var(--text-primary)">How batch systems worked:</strong> Programmers submitted jobs on punch cards to a human operator. The operator collected a batch of cards, fed them into a card reader, and the computer ran them sequentially. Output was printed and returned to the programmer — hours or days later. There was zero interaction while the job ran.\n\n<strong style="color:var(--text-primary)">Why they were efficient:</strong> With no user interaction, the CPU was always busy. No waiting for human input. Jobs were sorted to minimize device changes (e.g., all tape jobs together). Throughput (jobs completed per hour) was maximized.\n\n<strong style="color:var(--text-primary)">Modern batch systems:</strong> Batch processing still exists today — cron jobs (scheduled Linux tasks), Hadoop MapReduce jobs on big data, overnight bank transaction processing, end-of-month billing runs. The principles are identical — jobs queued, executed without interaction, results logged.`
                  },
                  {
                    icon: '⏱️', name: 'Time-Sharing (Multitasking)', color: '#10b981',
                    desc: 'Multiple users/programs share the CPU by switching between them every few milliseconds. Each user feels they have the whole computer to themselves.',
                    example: 'UNIX, Linux, Windows, macOS — all modern operating systems.',
                    deep: `<strong style="color:var(--text-primary)">The illusion of parallelism:</strong> A single-core CPU can only do one thing at a time. But by switching between processes every 4–15ms, the OS creates the illusion that all programs run simultaneously. Because humans can't perceive intervals shorter than ~100ms, everything feels instant.\n\n<strong style="color:var(--text-primary)">Response time vs throughput trade-off:</strong> Time-sharing optimizes for response time (how long until you get a response) at the cost of throughput (total work done per hour). A batch system maximizes throughput. An interactive system minimizes response time. The OS scheduler must balance both — giving background tasks CPU time while keeping the UI responsive.\n\n<strong style="color:var(--text-primary)">True parallelism with multi-core:</strong> Modern CPUs have 4–64 cores. With 8 cores, 8 processes genuinely run simultaneously — real parallelism, not just illusion. The OS scheduler must now distribute processes across cores, handle cache coherency, and manage non-uniform memory access (NUMA) on multi-socket servers.`
                  },
                  {
                    icon: '⚡', name: 'Real-Time Systems', color: '#ef4444',
                    desc: 'Must respond to events within a guaranteed time limit. Missing a deadline is a system failure — potentially catastrophic.',
                    example: 'Pacemakers, ABS brakes, aircraft control, industrial robots, missile guidance.',
                    deep: `<strong style="color:var(--text-primary)">Hard vs Soft real-time:</strong>\n• <strong>Hard real-time</strong>: Missing a deadline is catastrophic. Pacemaker must deliver pulse within exact microseconds. Airbag must deploy within 30ms of crash detection. These systems often have no OS or a very minimal RTOS (Real-Time OS).\n• <strong>Soft real-time</strong>: Missing deadlines degrades quality but isn't catastrophic. Video playback must render frames every 33ms (30fps) — dropped frames are annoying but not dangerous. Audio must process in real-time or you hear pops and glitches.\n\n<strong style="color:var(--text-primary)">What makes an OS real-time?</strong> A real-time OS (RTOS) uses priority-based preemptive scheduling — high priority tasks always preempt lower priority ones immediately. Interrupt latency is guaranteed (worst case, not average). Memory allocation is deterministic (no unpredictable garbage collection). Examples: VxWorks (used in NASA rovers), FreeRTOS (open source, used in IoT), QNX (used in cars).\n\n<strong style="color:var(--text-primary)">Linux as RTOS:</strong> Standard Linux is NOT real-time — the kernel can delay tasks unpredictably. The PREEMPT_RT patch makes Linux near-real-time by making most kernel code preemptible. Used in industrial automation and medical devices.`
                  },
                  {
                    icon: '📱', name: 'Mobile OS', color: '#8b5cf6',
                    desc: 'Designed for smartphones and tablets. Must handle limited battery, touchscreens, GPS, cellular radios, and small screens while remaining fast.',
                    example: 'Android (Linux-based), iOS (XNU kernel), HarmonyOS (Huawei).',
                    deep: `<strong style="color:var(--text-primary)">Android architecture:</strong> Android is built on a modified Linux kernel. Above it is the Android Runtime (ART) — apps compile to bytecode and run in a virtual machine. Above that are Java/Kotlin APIs. Unlike iOS, Android allows multiple app stores and "sideloading" (installing apps from files). Over 70% of smartphones run Android.\n\n<strong style="color:var(--text-primary)">iOS/XNU architecture:</strong> iOS uses the XNU kernel (a hybrid of Mach microkernel + BSD). Apps are sandboxed — each runs in an isolated container and can only access its own data. Apple controls the entire stack (hardware + OS + App Store) which enables better performance, security, and battery optimization but less flexibility.\n\n<strong style="color:var(--text-primary)">Mobile-specific OS challenges:</strong> Battery: the OS must aggressively sleep apps and hardware when not needed. Every microsecond of unnecessary CPU activity drains battery. Thermal management: phones have no fans — the OS must throttle CPU/GPU when the chip gets too hot. Cellular modem: a separate processor handles radio — the OS must coordinate data between the main CPU and modem efficiently.`
                  },
                  {
                    icon: '🌐', name: 'Distributed Systems', color: '#06b6d4',
                    desc: 'Multiple computers connected by a network that appear as a single system. Resources are shared across machines. If one fails, others continue.',
                    example: 'Google data centers, Amazon AWS, Hadoop clusters, Kubernetes.',
                    deep: `<strong style="color:var(--text-primary)">Key challenges in distributed OS:</strong>\n• <strong>Transparency</strong>: Users shouldn't know or care which physical machine handles their request.\n• <strong>Fault tolerance</strong>: If one server fails, the system continues. Google runs thousands of servers, knowing some will fail daily.\n• <strong>Consistency</strong>: If user A updates data on server 1, user B on server 2 must see the update. This is the famous CAP theorem — you can only guarantee 2 of: Consistency, Availability, Partition tolerance.\n• <strong>Scalability</strong>: Adding more machines should linearly increase capacity.\n\n<strong style="color:var(--text-primary)">Google's Approach:</strong> Google doesn't use traditional distributed OS software — they use commodity Linux servers and build distributed coordination in software (GFS for files, Bigtable for databases, Chubby for locking, Borg/Kubernetes for container scheduling). This approach proved more scalable than academic distributed OS designs.`
                  },
                  {
                    icon: '📦', name: 'Virtualized Systems', color: '#f59e0b',
                    desc: 'A hypervisor runs multiple OS instances simultaneously on the same hardware. Each virtual machine thinks it has dedicated hardware.',
                    example: 'VMware, VirtualBox, Docker, Microsoft Hyper-V, AWS EC2.',
                    deep: `<strong style="color:var(--text-primary)">Type 1 vs Type 2 Hypervisors:</strong>\n• <strong>Type 1 (Bare-metal)</strong>: Runs directly on hardware, no host OS underneath. VMware ESXi, Microsoft Hyper-V, Xen. Used in data centers — most efficient.\n• <strong>Type 2 (Hosted)</strong>: Runs on top of a regular OS. VirtualBox, VMware Workstation. Your OS runs, then the hypervisor runs as an app, then guest OSes run inside that. More overhead but easier to use.\n\n<strong style="color:var(--text-primary)">Containers vs VMs:</strong> VMs virtualize entire hardware. Containers (Docker, Kubernetes) share the host OS kernel but isolate the user space. Containers start in milliseconds (VMs take minutes), use MBs of RAM (VMs use GBs), but provide weaker isolation. For web services, containers are preferred; for strong security isolation, VMs are used.\n\n<strong style="color:var(--text-primary)">Hardware-assisted virtualization:</strong> Early hypervisors had to intercept and emulate every privileged instruction — very slow. Intel VT-x and AMD-V added hardware support for virtualization (CPU-level VM mode), making VMs nearly as fast as native execution. Modern VMs run at 95–99% of native performance.`
                  },
                ].map(t => (
                  <div key={t.name} style={{ background: 'var(--bg-card)', border: `1px solid ${t.color}33`, borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '36px', flexShrink: 0 }}>{t.icon}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '17px', fontWeight: '700', color: t.color, marginBottom: '6px' }}>{t.name}</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '6px' }}>{t.desc}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📌 {t.example}</p>
                      </div>
                    </div>
                    <LearnMore>
                      <span dangerouslySetInnerHTML={{ __html: t.deep.replace(/\n\n/g, '<br/><br/>').replace(/\n•/g, '<br/>•') }} />
                    </LearnMore>
                  </div>
                ))}
              </div>

              <NavButtons prev={() => setActive('resource')} prevLabel="← 1.4 Resource Management" next={() => setActive('history')} nextLabel="1.6 History →" />
            </div>
          )}

          {/* ── 1.6 ── */}
          {active === 'history' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>1.6 History of Operating Systems</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>From room-sized machines with no OS to your phone running billions of instructions per second.</p>

              <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '2px solid var(--border)' }}>
                {[
                  {
                    year: '1940s', title: 'No OS at All', color: '#94a3b8',
                    desc: 'Early computers like ENIAC had no OS. Programmers manually set switches and wired circuits. One program, one machine, one programmer at a time.',
                    deep: `<strong style="color:var(--text-primary)">ENIAC (1945):</strong> Weighed 30 tons, used 18,000 vacuum tubes, consumed 150kW of power. Programming meant physically rewiring the machine. There was no concept of software as we know it — the machine's hardware configuration WAS the program.\n\n<strong style="color:var(--text-primary)">Von Neumann Architecture (1945):</strong> John von Neumann proposed storing programs in memory alongside data — the stored-program concept. This is the foundation of every modern computer. Before this, changing the program meant physically rewiring the machine.`
                  },
                  {
                    year: '1950s', title: 'Batch Systems & Punch Cards', color: '#f59e0b',
                    desc: 'Operators collected batches of punch card jobs and ran them sequentially. A simple "resident monitor" automatically loaded the next job.',
                    deep: `<strong style="color:var(--text-primary)">The resident monitor:</strong> This was the first OS. A small program that remained in memory and automatically loaded and ran the next job from the input queue. It could detect when a job finished (normally or due to error) and load the next one — eliminating the need for human operators between jobs.\n\n<strong style="color:var(--text-primary)">IBM 704 and FORTRAN (1957):</strong> The first high-level programming language, FORTRAN, was created for the IBM 704. Before FORTRAN, every program was written in assembly language — extremely tedious. FORTRAN let scientists write something like "X = A + B" and the compiler translated it to machine code.`
                  },
                  {
                    year: '1960s', title: 'Time-Sharing & Multiprogramming', color: '#10b981',
                    desc: 'CTSS (1961) and Multics (1969) introduced time-sharing. Multiple users could use the same machine simultaneously via terminals.',
                    deep: `<strong style="color:var(--text-primary)">CTSS (Compatible Time-Sharing System, 1961):</strong> Developed at MIT. The first true time-sharing system. Ran on a modified IBM 7094. Could support up to 30 simultaneous users. Users worked at typewriter terminals — typed commands, got responses. Revolutionary — for the first time, multiple people could use a computer interactively at the same time.\n\n<strong style="color:var(--text-primary)">Multics (1969):</strong> A joint project between MIT, Bell Labs, and GE. Incredibly ambitious — dynamic linking, hierarchical file system, virtual memory, security rings. Too complex to work well, but all its ideas were eventually implemented in UNIX and later Windows NT. Every modern OS owes a huge debt to Multics.\n\n<strong style="color:var(--text-primary)">IBM OS/360 (1964):</strong> One of the most important OSes ever. Had to run on all IBM hardware (from tiny to huge). This forced IBM to design a truly general-purpose OS. Frederick Brooks managed the project — his experiences led to "The Mythical Man-Month", the most influential software engineering book ever written.`
                  },
                  {
                    year: '1970s', title: 'UNIX Born', color: '#3b82f6',
                    desc: 'Ken Thompson and Dennis Ritchie created UNIX at Bell Labs. Written in C, portable, elegant. Introduced pipes, the file hierarchy, and shell scripting.',
                    deep: `<strong style="color:var(--text-primary)">The story of UNIX:</strong> After Multics became too complex, Ken Thompson at Bell Labs wrote a simpler OS for a spare PDP-7 minicomputer — initially to run a game he'd written (Space Travel). Dennis Ritchie joined and together they created UNIX. In 1973, they rewrote it in C (which Ritchie created) — making it the first OS written in a high-level language, thus portable to different hardware.\n\n<strong style="color:var(--text-primary)">UNIX philosophy:</strong> "Do one thing and do it well." Small programs that each do one thing, connected by pipes. This philosophy of composability shaped all of computing. The command line and shell scripting we use today come directly from UNIX.\n\n<strong style="color:var(--text-primary)">UNIX variants:</strong> Bell Labs licensed UNIX to universities cheaply. UC Berkeley created BSD (Berkeley Software Distribution) with significant improvements including TCP/IP networking. The "UNIX wars" of the 80s had AT&T System V vs BSD. Both lineages survive today: Linux/macOS/iOS/Android all trace back to UNIX ideas.`
                  },
                  {
                    year: '1980s', title: 'Personal Computers & GUI', color: '#8b5cf6',
                    desc: 'MS-DOS for IBM PCs (1981). Apple Lisa/Macintosh brought GUI to consumers. Windows 1.0 launched 1985. Computers entered every home.',
                    deep: `<strong style="color:var(--text-primary)">MS-DOS (1981):</strong> Microsoft bought QDOS ("Quick and Dirty OS") for $50,000 and licensed it to IBM as PC-DOS. MS-DOS was a single-user, single-tasking, 16-bit OS with no memory protection and no GUI. Yet it ran on 100+ million PCs because IBM's PC became the standard.\n\n<strong style="color:var(--text-primary)">The GUI revolution:</strong> Xerox PARC invented the GUI in the early 1970s. Apple licensed the ideas for the Lisa (1983, $10,000 — failed) and then the Macintosh (1984, $2,495 — revolutionary). Steve Jobs saw the Macintosh as bringing computing to everyone. The 1984 Macintosh commercial, directed by Ridley Scott, remains one of the greatest ads ever made.\n\n<strong style="color:var(--text-primary)">Windows 1.0 (1985):</strong> Microsoft's GUI ran on top of MS-DOS and was largely ignored. Windows 3.0 (1990) finally got traction. Windows 95 (1995) was a genuine OS with 32-bit support, preemptive multitasking, and the Start menu — it sold 7 million copies in 5 weeks.`
                  },
                  {
                    year: '1990s', title: 'Linux & the Internet', color: '#06b6d4',
                    desc: 'Linus Torvalds released the Linux kernel in 1991. Windows 95 transformed PCs. The internet explosion drove OS networking forward.',
                    deep: `<strong style="color:var(--text-primary)">Linux's birth (1991):</strong> Linus Torvalds, a 21-year-old Finnish student, posted on a newsgroup: "I'm doing a (free) operating system (just a hobby, won't be big and professional like gnu)." He was wrong. Linux today runs 96.4% of the world's top 1 million web servers, all 500 of the world's fastest supercomputers, and Android phones used by 3 billion people.\n\n<strong style="color:var(--text-primary)">Open source model:</strong> Linux is licensed under GPL — anyone can use, modify, and distribute it, but must share changes. This created a global community of thousands of developers. Today the Linux kernel receives ~70,000 patches per year from over 4,000 developers at companies like Google, Intel, Red Hat, and Samsung.\n\n<strong style="color:var(--text-primary)">Windows NT (1993):</strong> Microsoft's professional OS, designed by Dave Cutler (who also designed VMS for DEC). Unlike MS-DOS based Windows, NT was a from-scratch 32-bit OS with real security, memory protection, and multi-user support. Windows NT's architecture evolved into Windows 2000, XP, Vista, 7, 8, 10, 11 — the Windows line you use today.`
                  },
                  {
                    year: '2000s', title: 'Mobile & Virtualization', color: '#ef4444',
                    desc: 'Windows XP (2001), Mac OS X (2001). VMware virtualization. Smartphones: iPhone OS (2007) and Android (2008) changed everything.',
                    deep: `<strong style="color:var(--text-primary)">Mac OS X (2001):</strong> Apple was struggling with aging classic Mac OS. Steve Jobs brought NeXT (his other company) back to Apple — NeXTSTEP became the foundation of Mac OS X. A UNIX-certified OS with a beautiful interface. Led to iOS (2007), watchOS, tvOS — all sharing the same XNU kernel.\n\n<strong style="color:var(--text-primary)">The iPhone (2007):</strong> Steve Jobs announced "an iPod, a phone, and an internet communicator" — it was all one device. iPhone OS ran a full UNIX-based kernel on a phone. The App Store (2008) turned the phone into a platform. Overnight, mobile OS became more important than desktop OS.\n\n<strong style="color:var(--text-primary)">Android (2008):</strong> Google acquired Android Inc. in 2005. Based on Linux kernel + Java-based middleware. Open source and free for manufacturers. Samsung, HTC, Motorola adopted it. By 2011, Android was the world's best-selling smartphone platform. The OS competition today: Android vs iOS has replaced the old Windows vs Mac OS battle.`
                  },
                  {
                    year: '2010s+', title: 'Cloud, Containers & Beyond', color: '#f97316',
                    desc: 'AWS/Azure/GCP cloud computing. Docker containers. Apple Silicon. AI accelerators. The OS must now manage heterogeneous hardware.',
                    deep: `<strong style="color:var(--text-primary)">Cloud computing changed everything:</strong> Amazon Web Services (2006) let anyone rent servers by the hour. Applications moved from "runs on your computer" to "runs somewhere in Amazon/Google/Microsoft data centers." The OS running on those servers is almost always Linux. This is why learning Linux is more important than ever — cloud = Linux.\n\n<strong style="color:var(--text-primary)">Containers and Kubernetes:</strong> Docker (2013) packaged applications with all their dependencies into containers. Kubernetes (2014, from Google) orchestrates thousands of containers across thousands of servers. A modern web app might run as 100+ microservices in separate containers, all managed by Kubernetes. The OS abstraction layer shifted from "physical server" to "container".\n\n<strong style="color:var(--text-primary)">Apple Silicon (2020):</strong> Apple replaced Intel CPUs with their own ARM-based chips (M1, M2, M3, M4). macOS had to be rewritten to support both x86 (Intel) and ARM (Apple Silicon) with Rosetta 2 for translation. Apple Silicon is 2–3x faster and 3x more power efficient than equivalent Intel. This is the most significant CPU architecture transition since the 68k→PowerPC→Intel migrations.\n\n<strong style="color:var(--text-primary)">AI and OS:</strong> Modern ML workloads run on GPUs and specialized chips (Google TPU, Apple Neural Engine, NVIDIA H100). The OS must schedule work across heterogeneous processors (CPU + GPU + NPU), manage high-bandwidth memory, and handle the enormous data throughput ML requires. OS research today is increasingly focused on these challenges.`
                  },
                ].map((h, i) => (
                  <div key={h.year} style={{ position: 'relative', marginBottom: '28px' }}>
                    <div style={{ position: 'absolute', left: '-40px', width: '16px', height: '16px', borderRadius: '50%', background: h.color, border: '3px solid var(--bg-primary)', top: '4px' }} />
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: h.color, minWidth: '50px', paddingTop: '2px' }}>{h.year}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>{h.title}</div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '8px' }}>{h.desc}</p>
                        <LearnMore>
                          <span dangerouslySetInnerHTML={{ __html: h.deep.replace(/\n\n/g, '<br/><br/>') }} />
                        </LearnMore>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <NavButtons prev={() => setActive('types')} prevLabel="← 1.5 Types of OS" next={() => setActive('quiz')} nextLabel="Take the Quiz →" />
            </div>
          )}

          {/* ── Quiz ── */}
          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>🧠 Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>4 questions on Chapter 1. Take your time.</p>

              {!quiz.done ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {quizQuestions.length}</span>
                    <span style={{ fontSize: '13px', color: '#10b981' }}>Score: {quiz.score}</span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', height: '6px' }}>
                    <div style={{ height: '100%', background: '#3b82f6', borderRadius: '8px', width: `${(quiz.current / quizQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', lineHeight: '1.5' }}>{quizQuestions[quiz.current].q}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {quizQuestions[quiz.current].options.map((opt, i) => {
                      let bg = 'var(--bg-secondary)', border = 'var(--border)', color = 'var(--text-primary)'
                      if (quiz.answered) {
                        if (i === quizQuestions[quiz.current].answer) { bg = '#10b98118'; border = '#10b981'; color = '#10b981' }
                        else if (i === quiz.selected && i !== quizQuestions[quiz.current].answer) { bg = '#ef444418'; border = '#ef4444'; color = '#ef4444' }
                      }
                      return (
                        <div key={i} onClick={() => handleAnswer(i)} style={{
                          padding: '14px 20px', borderRadius: '10px', cursor: quiz.answered ? 'default' : 'pointer',
                          background: bg, border: `1px solid ${border}`, color,
                          fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
                        }}>
                          {['A', 'B', 'C', 'D'][i]}. {opt}
                        </div>
                      )
                    })}
                  </div>
                  {quiz.answered && (
                    <div>
                      <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: '10px', padding: '16px', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        💡 <strong style={{ color: '#10b981' }}>Explanation:</strong> {quizQuestions[quiz.current].explanation}
                      </div>
                      <button onClick={nextQuestion} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                        {quiz.current + 1 >= quizQuestions.length ? 'See Results' : 'Next Question →'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>{quiz.score === 4 ? '🏆' : quiz.score >= 2 ? '👍' : '📚'}</div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>You scored {quiz.score} / {quizQuestions.length}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    {quiz.score === 4 ? 'Perfect! You mastered Chapter 1!' : quiz.score >= 2 ? 'Good work! Review the sections you missed.' : 'Keep studying — go back and re-read the sections.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false })} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
                      Retry Quiz
                    </button>
                    <Link to="/chapter/2" style={{ textDecoration: 'none' }}>
                      <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
                        Next: Chapter 2 →
                      </button>
                    </Link>
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