import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '20.1 Linux History',         icon: '🐧' },
  { id: 'design',      title: '20.2 Design Principles',     icon: '📐' },
  { id: 'kernel',      title: '20.3 Kernel Modules',        icon: '🧩' },
  { id: 'process',     title: '20.4 Process Management',    icon: '⚙️' },
  { id: 'scheduling',  title: '20.5 Scheduling',            icon: '📊' },
  { id: 'memory',      title: '20.6 Memory Management',     icon: '💾' },
  { id: 'fs',          title: '20.7 File Systems',          icon: '📁' },
  { id: 'io',          title: '20.8 I/O and Devices',       icon: '🔌' },
  { id: 'ipc',         title: '20.9 IPC',                   icon: '🔗' },
  { id: 'simulator',   title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the Linux kernel written in and what is significant about this choice?',
    options: [
      'Java — for portability across platforms',
      'C and assembly — C provides low-level hardware access with reasonable portability; assembly for CPU-specific optimizations',
      'C++ — for object-oriented kernel design',
      'Rust — for memory safety'
    ],
    answer: 1,
    explanation: 'Linux is written primarily in C with some architecture-specific assembly. C provides direct hardware access (pointers, memory-mapped I/O), predictable performance, and compiles to efficient machine code. Assembly is used for CPU-specific operations like context switching, interrupt entry, and SIMD optimizations. Rust is increasingly being added to Linux (since 5.20/6.1) but C remains dominant.'
  },
  {
    q: 'What is the Completely Fair Scheduler (CFS)?',
    options: [
      'A scheduler that gives every process exactly equal CPU time',
      'Linux\'s default scheduler that models an ideal multi-tasking CPU by tracking virtual runtime and always running the process with the least virtual runtime',
      'A scheduler designed for real-time processes',
      'A batch scheduling algorithm for server workloads'
    ],
    answer: 1,
    explanation: 'CFS models an "ideal, precise multi-tasking CPU" where every process gets an equal share simultaneously. It tracks each process\'s virtual runtime (vruntime) — how long it has run weighted by its nice value. The scheduler always picks the process with the smallest vruntime from a red-black tree. Lower nice value = slower vruntime increase = more CPU time. Higher nice = faster vruntime increase = less CPU time.'
  },
  {
    q: 'What is a Linux kernel module?',
    options: [
      'A user-space library that extends the kernel',
      'Object code that can be dynamically loaded into and unloaded from the running kernel without rebooting',
      'A configuration file for the kernel',
      'A hardware abstraction layer'
    ],
    answer: 1,
    explanation: 'Kernel modules are pieces of code that can be inserted into and removed from the kernel at runtime using insmod/modprobe/rmmod. They run in kernel space with full privileges. Used for device drivers, file systems, network protocols, and security modules. This allows Linux to support new hardware without rebuilding the kernel — just load the appropriate module.'
  },
  {
    q: 'How does Linux implement threads?',
    options: [
      'Threads are completely separate from processes in Linux',
      'Linux uses clone() with shared resources — threads are processes that share address space, file descriptors, and other resources with their parent',
      'Linux threads are implemented entirely in user space',
      'Linux only supports single-threaded processes'
    ],
    answer: 1,
    explanation: 'Linux has no separate "thread" concept in the kernel — both processes and threads are represented by task_struct. The clone() system call creates a new task that can selectively share resources with the parent: CLONE_VM (share address space), CLONE_FILES (share file descriptors), CLONE_SIGHAND (share signal handlers). pthread_create() calls clone() with all these flags set, creating what we call a thread.'
  },
  {
    q: 'What is the Linux page cache?',
    options: [
      'A CPU cache for page table entries (same as TLB)',
      'A unified in-memory cache for file data — recently read/written file blocks are kept in RAM to avoid repeated disk I/O',
      'A cache for virtual memory page mappings',
      'A kernel cache for process page tables'
    ],
    answer: 1,
    explanation: 'The Linux page cache stores file data in RAM pages. When a file is read, its data is cached. Subsequent reads are served from cache — no disk I/O. Writes go to cache first (dirty pages), written to disk asynchronously. The page cache can use all available free RAM and is released under memory pressure. It is why Linux systems show most RAM as "cached" in free -h — that cached RAM is being productively used.'
  },
  {
    q: 'What is the purpose of the Linux Virtual File System (VFS)?',
    options: [
      'To create virtual files in /proc',
      'An abstraction layer that provides a uniform file system interface, allowing the same system calls to work on ext4, NFS, FAT32, tmpfs, and any other file system',
      'To manage virtual memory file mappings',
      'To virtualize file systems for containers'
    ],
    answer: 1,
    explanation: 'VFS defines a common set of objects (superblock, inode, dentry, file) and operations that every file system must implement. User-space calls open(), read(), write() — VFS dispatches to the correct file system implementation based on which mount point the file is on. This is why "everything is a file" in Linux — /proc, /sys, block devices, sockets all use the same interface via VFS.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #f97316aa', color: '#f97316', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
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

function LinuxArchDiagram() {
  const [selected, setSelected] = useState(null)

  const components = [
    { id: 'user', name: 'User Applications', color: '#3b82f6', y: 0, desc: 'Regular programs: bash, gcc, nginx, Python scripts. Run in user space (ring 3). Access kernel via system calls only.' },
    { id: 'libc', name: 'GNU libc / System Libraries', color: '#8b5cf6', y: 1, desc: 'Wrappers around system calls. printf(), malloc(), pthread_create(). Provides POSIX-compliant interface. Every C program links against libc.' },
    { id: 'syscall', name: 'System Call Interface', color: '#f59e0b', y: 2, desc: '~350 system calls. The kernel boundary. User space cannot cross this without using syscall instruction. Each syscall is validated and dispatched.' },
    { id: 'kernel', name: 'Linux Kernel Core', color: '#f97316', y: 3, desc: 'Process management, scheduling, memory management, VFS, networking, IPC. Runs in ring 0 with full hardware access.', bold: true },
    { id: 'modules', name: 'Kernel Modules (drivers, fs, net)', color: '#10b981', y: 4, desc: 'Dynamically loadable kernel code. Device drivers, file systems, network protocols. Loaded with insmod/modprobe. Run at ring 0.' },
    { id: 'hardware', name: 'Hardware (CPU, RAM, Disk, NIC)', color: '#6e7681', y: 5, desc: 'Physical hardware. CPU, RAM, storage devices, network cards, GPU. Accessed via device drivers and kernel abstractions.' },
  ]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Linux Architecture Diagram</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Click any layer to see its role.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {components.map(function(c) {
            return (
              <div key={c.id} onClick={function() { setSelected(selected === c.id ? null : c.id) }} style={{ background: selected === c.id ? c.color + '33' : c.color + '18', border: '2px solid ' + (selected === c.id ? c.color : c.color + '44'), borderRadius: 8, padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontWeight: c.bold ? 800 : 600, color: c.color, fontSize: 13 }}>{c.name}</div>
              </div>
            )
          })}
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          {selected
            ? (function() {
                const c = components.find(function(x) { return x.id === selected })
                return (
                  <div>
                    <div style={{ fontWeight: 700, color: c.color, fontSize: 15, marginBottom: 10 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.desc}</div>
                  </div>
                )
              })()
            : <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Click a layer to see details</div>
          }
        </div>
      </div>
    </div>
  )
}

function CFSVisualizer() {
  const [processes, setProcesses] = useState([
    { name: 'chrome', nice: 0, vruntime: 0, color: '#3b82f6' },
    { name: 'gcc', nice: 10, vruntime: 0, color: '#f59e0b' },
    { name: 'bash', nice: 0, vruntime: 0, color: '#10b981' },
    { name: 'vim', nice: -5, vruntime: 0, color: '#8b5cf6' },
  ])
  const [tick, setTick] = useState(0)
  const [log, setLog] = useState([])

  function runTick() {
    setProcesses(function(procs) {
      const sorted = [...procs].sort(function(a, b) { return a.vruntime - b.vruntime })
      const chosen = sorted[0]
      const weight = Math.pow(1.25, -chosen.nice)
      const delta = Math.round(10 / weight)
      const updated = procs.map(function(p) {
        if (p.name === chosen.name) return { ...p, vruntime: p.vruntime + delta }
        return p
      })
      setLog(function(l) { return [...l.slice(-6), { process: chosen.name, delta, color: chosen.color }] })
      return updated
    })
    setTick(function(t) { return t + 1 })
  }

  function reset() {
    setProcesses(function(procs) { return procs.map(function(p) { return { ...p, vruntime: 0 } }) })
    setTick(0)
    setLog([])
  }

  const maxVruntime = Math.max(...processes.map(function(p) { return p.vruntime })) || 1

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>CFS (Completely Fair Scheduler) Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        CFS always runs the process with the lowest vruntime. Nice value affects how fast vruntime grows.
      </p>

      <div style={{ marginBottom: 20 }}>
        {processes.map(function(p) {
          return (
            <div key={p.name} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ minWidth: 60, fontSize: 12, fontWeight: 700, color: p.color }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 60 }}>nice={p.nice}</div>
              <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: p.color, borderRadius: 4, width: (p.vruntime / maxVruntime * 100) + '%', transition: 'width 0.3s', opacity: 0.8 }} />
              </div>
              <div style={{ minWidth: 60, fontSize: 12, fontFamily: 'monospace', color: p.color, textAlign: 'right' }}>vrt={p.vruntime}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={runTick} style={{ background: '#f97316', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          Run 1 Tick (tick #{tick + 1})
        </button>
        <button onClick={reset} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>

      {log.length > 0 && (
        <div style={{ background: '#0d1117', borderRadius: 8, padding: 10, maxHeight: 120, overflowY: 'auto' }}>
          {log.map(function(entry, i) {
            return (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: entry.color, lineHeight: 1.8 }}>
                Scheduled: <strong>{entry.process}</strong> (vruntime +{entry.delta}) — had lowest vruntime
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Note: vim (nice=-5) gets more CPU — its vruntime grows slower. gcc (nice=10) gets less — vruntime grows faster. CFS balances naturally.
      </div>
    </div>
  )
}

export default function Chapter20() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #f9731644', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#f97316', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 20</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🐧</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>The Linux System</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          A deep dive into the Linux kernel — history, design, process management, CFS scheduling, memory, file systems, I/O, and IPC.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Linux Architecture Diagram', 'CFS Simulator', 'task_struct', 'VFS / ext4', 'Kernel Modules'].map(function(f) {
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
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.1 Linux History</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>From a student hobby project to the world's dominant OS kernel.</p>

              <InfoBox color="#f97316">
                Linux was created by <strong>Linus Torvalds</strong> in 1991 as a free Unix-like kernel for his Intel 386 PC. What started as a personal project grew into the most widely used OS kernel in the world — running on phones, servers, supercomputers, and embedded devices.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { year: '1969', event: 'Unix created at Bell Labs by Thompson and Ritchie', color: '#6e7681' },
                  { year: '1983', event: 'GNU Project started by Richard Stallman — free software tools (gcc, bash, glibc) but no kernel', color: '#8b5cf6' },
                  { year: '1991', event: 'Linus Torvalds posts to comp.os.minix: "I\'m doing a (free) operating system..." — Linux 0.01', color: '#f97316', bold: true },
                  { year: '1992', event: 'Linux kernel released under GPL license — truly free and open source', color: '#f59e0b' },
                  { year: '1994', event: 'Linux 1.0 released. First stable version. ~10,000 lines of code', color: '#10b981' },
                  { year: '1996', event: 'Linux 2.0 — SMP support (multiple CPUs)', color: '#10b981' },
                  { year: '2003', event: 'Linux 2.6 — O(1) scheduler, NPTL threads, improved VM', color: '#3b82f6' },
                  { year: '2007', event: 'Android uses Linux kernel — Linux on billions of phones', color: '#10b981', bold: true },
                  { year: '2011', event: 'Linux 3.0 — 20th anniversary release. 15 million lines of code', color: '#3b82f6' },
                  { year: '2015', event: 'Linux 4.0 — live kernel patching (no reboot for security patches)', color: '#3b82f6' },
                  { year: '2022', event: 'Linux 6.1 — first Rust code merged into mainline kernel', color: '#ef4444' },
                  { year: '2024', event: 'Linux 6.x — 35+ million lines, 4000+ contributors, powers 96% of top 1M web servers', color: '#f97316', bold: true },
                ].map(function(t) {
                  return (
                    <div key={t.year} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color, fontSize: 12, minWidth: 50, flexShrink: 0 }}>{t.year}</div>
                      <div style={{ fontSize: 13, color: t.bold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: t.bold ? 600 : 400, lineHeight: 1.5 }}>{t.event}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Linux Today — Where It Runs</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { domain: 'Servers', pct: '96%', color: '#3b82f6', note: 'Top 1M websites' },
                  { domain: 'Supercomputers', pct: '100%', color: '#10b981', note: 'Top 500 list' },
                  { domain: 'Android devices', pct: '~73%', color: '#f59e0b', note: 'Mobile OS market' },
                  { domain: 'Cloud (AWS/GCP/Azure)', pct: '~90%', color: '#8b5cf6', note: 'VM workloads' },
                  { domain: 'Embedded/IoT', pct: 'Billions', color: '#ef4444', note: 'Routers, TVs, cars' },
                  { domain: 'Developer desktops', pct: 'Growing', color: '#f97316', note: 'WSL2, native Linux' },
                ].map(function(d) {
                  return (
                    <div key={d.domain} style={{ background: d.color + '18', border: '1px solid ' + d.color + '44', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: d.color, marginBottom: 4 }}>{d.pct}</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{d.domain}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{d.note}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Linux Architecture</h3>
              <LinuxArchDiagram />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>The GPL and Linux's growth:</strong> Linus chose the GNU GPL (General Public License) — anyone who distributes Linux (or modifications) must release their source code under the same license. This created a virtuous cycle: companies that improved Linux had to share their improvements, benefiting everyone. IBM, Google, Red Hat, Intel, and hundreds of companies contribute millions of lines of code. The Linux kernel has more corporate contributors than volunteer contributors today.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Linux vs GNU/Linux:</strong> The GNU Project provided the tools (gcc, bash, glibc, coreutils) but not the kernel. Linux provided the kernel but not the tools. Together they form a complete OS. Richard Stallman insists on the name "GNU/Linux" to give GNU credit. Linus Torvalds prefers just "Linux." Most people say "Linux" but technically they mean "Linux-based GNU/Linux distribution." The debate continues...
              </LearnMore>

              <NavButtons next={function() { setActive('design') }} nextLabel="20.2 Design Principles →" />
            </div>
          )}

          {active === 'design' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.2 Linux Design Principles</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The philosophy and architecture decisions that shape the Linux kernel.</p>

              <InfoBox color="#3b82f6">
                Linux follows the Unix philosophy: <strong>write programs that do one thing well, write programs to work together, write programs that handle text streams</strong>. The kernel is monolithic but modular — a large single binary with the ability to load/unload modules dynamically.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Monolithic vs Microkernel</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f9731644', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontWeight: 700, color: '#f97316', marginBottom: 8 }}>Linux: Monolithic Kernel</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    All kernel services (process management, memory, FS, network, drivers) run in one large program in kernel space. Direct function calls between subsystems — very fast. A bug in any part can crash the whole kernel.
                  </p>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Performance: direct function calls, shared memory</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Reliability: any kernel bug = system crash</div>
                  <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>Used by: Linux, Windows, macOS</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Microkernel (e.g., seL4, Minix)</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Only essential services in kernel (IPC, memory, scheduling). Everything else (drivers, FS) in user space processes. More robust — a crashed driver does not crash the kernel.
                  </p>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Reliability: faults contained in user space</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Performance: IPC overhead for every service call</div>
                  <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>Used by: seL4, Minix, Mach, QNX</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Key Linux Design Principles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { principle: 'Everything is a file', color: '#f97316', desc: 'Devices (/dev/sda), processes (/proc/1234), kernel parameters (/proc/sys), hardware topology (/sys) — all accessible via the file system interface. Uniform API: open, read, write, close.' },
                  { principle: 'Portability', color: '#3b82f6', desc: 'Written in C to run on 30+ CPU architectures: x86, ARM, RISC-V, MIPS, PowerPC, s390. Architecture-specific code isolated in arch/ directory. Same kernel source compiles for all.' },
                  { principle: 'Modularity', color: '#10b981', desc: 'Monolithic kernel with loadable modules. New hardware support added without rebuilding. Distribution kernels ship with hundreds of modules, loading them on demand.' },
                  { principle: 'Preemptibility', color: '#f59e0b', desc: 'Since 2.6: fully preemptible kernel. Even while running kernel code, a higher-priority task can preempt. Critical for real-time responsiveness. PREEMPT_RT patch makes Linux a hard real-time OS.' },
                  { principle: 'SMP support', color: '#8b5cf6', desc: 'Symmetric multiprocessing: multiple CPUs run kernel code simultaneously. Fine-grained locking (spinlocks, mutexes, RCU) protects shared data. Scales to hundreds of CPUs.' },
                ].map(function(p) {
                  return (
                    <div key={p.principle} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + p.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: p.color, fontSize: 13, minWidth: 160 }}>{p.principle}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux kernel size:</strong> Linux 1.0 (1994) had ~176,000 lines of code. Linux 6.x has over 35 million lines. Growth driven by: more device drivers (the biggest chunk), more file systems, more network protocols, more architectures. The drivers/ directory alone is over 60% of the kernel source. Despite size, the core kernel remains relatively lean — much of the size is in seldom-loaded drivers.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Linus's development model:</strong> "Release early, release often." Linux follows a merging window (2 weeks after each release where new features are merged), then release candidates (rc1, rc2...) for bug fixes, then a final release. Major release every 9-10 weeks. Subsystem maintainers (networking, storage, etc.) manage their trees and send pull requests to Linus. All communication is via email on public mailing lists — every decision is documented and searchable.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 20.1 History" next={function() { setActive('kernel') }} nextLabel="20.3 Kernel Modules →" />
            </div>
          )}

          {active === 'kernel' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.3 Kernel Modules</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Dynamically extending the Linux kernel without rebooting.</p>

              <InfoBox color="#10b981">
                A <strong>kernel module</strong> is object code that can be inserted into and removed from the running kernel without rebooting. Modules extend the kernel with device drivers, file systems, network protocols, and security mechanisms. They run in kernel space with full privilege.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Module Lifecycle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { step: 'Write', color: '#3b82f6', desc: 'Write C code implementing init_module() and cleanup_module() functions. Use kernel APIs (printk, kmalloc, etc.).' },
                  { step: 'Compile', color: '#8b5cf6', desc: 'Compile against kernel headers with Kbuild system. Produces a .ko (kernel object) file.' },
                  { step: 'Load', color: '#10b981', desc: 'insmod module.ko or modprobe module. Kernel verifies, resolves symbols, runs init_module(). Module is active.' },
                  { step: 'Use', color: '#f97316', desc: 'Module hooks into kernel via function pointers. Device driver registers with appropriate subsystem. File system registers with VFS.' },
                  { step: 'Unload', color: '#f59e0b', desc: 'rmmod module. Kernel calls cleanup_module(). Resources freed. Module removed from kernel.' },
                ].map(function(s, i) {
                  return (
                    <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ fontWeight: 700, color: s.color, minWidth: 70, fontSize: 13 }}>{s.step}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Hello World Kernel Module</h3>
              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* hello.c — minimal kernel module */</div>
                  <div>#include &lt;linux/module.h&gt;</div>
                  <div>#include &lt;linux/kernel.h&gt;</div>
                  <div>#include &lt;linux/init.h&gt;</div>
                  <div></div>
                  <div>static int __init hello_init(void) {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>printk(KERN_INFO "Hello, kernel!\\n");</div>
                  <div style={{ paddingLeft: 16 }}>return 0;</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>static void __exit hello_exit(void) {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>printk(KERN_INFO "Goodbye, kernel!\\n");</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>module_init(hello_init);</div>
                  <div>module_exit(hello_exit);</div>
                  <div>MODULE_LICENSE("GPL");</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Module Management Commands</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { cmd: 'lsmod', color: '#3b82f6', desc: 'List currently loaded modules' },
                  { cmd: 'modinfo module', color: '#10b981', desc: 'Show module metadata (author, description, parameters)' },
                  { cmd: 'insmod module.ko', color: '#f59e0b', desc: 'Load a module from a file (no dependency resolution)' },
                  { cmd: 'modprobe module', color: '#f97316', desc: 'Load a module with automatic dependency resolution' },
                  { cmd: 'rmmod module', color: '#ef4444', desc: 'Remove a loaded module' },
                  { cmd: 'modprobe -r module', color: '#8b5cf6', desc: 'Remove module and unneeded dependencies' },
                ].map(function(c) {
                  return (
                    <div key={c.cmd} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '33', borderRadius: 8, padding: '8px 12px' }}>
                      <code style={{ fontFamily: 'monospace', color: c.color, fontWeight: 700, fontSize: 12 }}>{c.cmd}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Module signing and security:</strong> Unsigned kernel modules are a major security risk — they run in ring 0 with full kernel privileges. Linux supports module signing: modules are signed with a private key, and the kernel verifies the signature with a public key at load time. UEFI Secure Boot requires signed bootloader, signed kernel, and signed modules. This prevents rootkits that inject malicious kernel modules. Most Linux distributions sign their official modules.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Out-of-tree modules and DKMS:</strong> Modules not in the mainline kernel tree (e.g., proprietary Nvidia drivers, VirtualBox drivers) must be recompiled for each new kernel version. DKMS (Dynamic Kernel Module Support) automates this — it stores module source and rebuilds automatically when the kernel updates. Nvidia, VMware, and other hardware vendors use DKMS for their proprietary drivers.
              </LearnMore>

              <NavButtons prev={function() { setActive('design') }} prevLabel="← 20.2 Design" next={function() { setActive('process') }} nextLabel="20.4 Process Management →" />
            </div>
          )}

          {active === 'process' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.4 Process Management</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How Linux represents and manages processes — the task_struct.</p>

              <InfoBox color="#f59e0b">
                In Linux, both processes and threads are represented by the same kernel structure: <strong>task_struct</strong>. Linux has no separate concept of a "thread" — threads are just processes that share certain resources (address space, file descriptors) with their parent.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>task_struct — The Process Descriptor</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Every process has a task_struct in kernel memory. The kernel maintains all task_structs in a doubly-linked list and a hash table keyed by PID. The current macro points to the task_struct of the currently running process.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { field: 'pid / tgid', color: '#3b82f6', desc: 'Process ID and thread group ID. tgid is the same for all threads of one process.' },
                  { field: 'state', color: '#10b981', desc: 'TASK_RUNNING, TASK_INTERRUPTIBLE, TASK_UNINTERRUPTIBLE, TASK_STOPPED, TASK_ZOMBIE' },
                  { field: 'mm_struct', color: '#f59e0b', desc: 'Pointer to memory management info — page tables, virtual memory areas (VMAs), heap/stack bounds.' },
                  { field: 'files_struct', color: '#8b5cf6', desc: 'Open file descriptor table. Shared between threads of the same process.' },
                  { field: 'fs_struct', color: '#ef4444', desc: 'File system info — current working directory, root directory.' },
                  { field: 'signal_struct', color: '#f97316', desc: 'Signal handlers table. Shared between threads. Pending signals.' },
                  { field: 'sched_entity', color: '#34d399', desc: 'CFS scheduling entity — vruntime, load weight, run queue node.' },
                  { field: 'cred', color: '#14b8a6', desc: 'Credentials: UID, GID, effective UID/GID, capabilities, security context (SELinux label).' },
                ].map(function(f) {
                  return (
                    <div key={f.field} style={{ background: 'var(--bg-card)', border: '1px solid ' + f.color + '33', borderRadius: 8, padding: '8px 12px' }}>
                      <code style={{ fontFamily: 'monospace', color: f.color, fontWeight: 700, fontSize: 12 }}>{f.field}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Process Creation — fork() and clone()</h3>
              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* fork() — creates a new process */</div>
                  <div>pid_t pid = fork();</div>
                  <div>if (pid == 0) {'{'} <span style={{ color: '#8b949e' }}>/* child process */</span> {'}'}</div>
                  <div>else {'{'} <span style={{ color: '#8b949e' }}>/* parent, pid = child's PID */</span> {'}'}</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* clone() — creates thread or process */</div>
                  <div>clone(fn, stack, CLONE_VM | CLONE_FILES | CLONE_SIGHAND, arg);</div>
                  <div style={{ color: '#8b949e' }}>/* CLONE_VM: share address space → thread */</div>
                  <div style={{ color: '#8b949e' }}>/* No CLONE_VM: separate address space → process */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Process States in Linux</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { state: 'RUNNING', color: '#10b981', desc: 'Running on CPU or ready to run (in run queue)' },
                  { state: 'INTERRUPTIBLE', color: '#3b82f6', desc: 'Sleeping, waiting for event. Can be woken by signals.' },
                  { state: 'UNINTERRUPTIBLE', color: '#f59e0b', desc: 'Sleeping, cannot be interrupted. Waiting for I/O. D state in ps.' },
                  { state: 'STOPPED', color: '#8b5cf6', desc: 'Stopped by SIGSTOP or SIGTSTP. Resumed by SIGCONT.' },
                  { state: 'ZOMBIE', color: '#ef4444', desc: 'Exited but parent has not called wait(). Resources freed except task_struct.' },
                ].map(function(s) {
                  return (
                    <div key={s.state} style={{ background: s.color + '18', border: '1px solid ' + s.color + '44', borderRadius: 8, padding: '6px 12px', flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 700, color: s.color, fontSize: 11 }}>{s.state}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Copy-on-Write in fork():</strong> When fork() is called, Linux does NOT immediately copy the parent's memory pages. Instead, both parent and child point to the same physical pages marked copy-on-write. Only when one of them writes to a page is that page actually copied — creating a private copy. This makes fork() nearly instantaneous even for processes with gigabytes of memory. If the child immediately calls exec(), no pages are ever copied (vfork() is even more aggressive about this).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Process namespaces and containers:</strong> Linux namespaces (Chapter 18) are implemented at the task_struct level. Each task_struct has pointers to its namespace structures: nsproxy containing pid_namespace, net_namespace, mnt_namespace, etc. When a new container is created with unshare() or clone() with CLONE_NEWPID etc., new namespace objects are created and the task's nsproxy is updated. All subsequent child processes inherit the new namespaces.
              </LearnMore>

              <NavButtons prev={function() { setActive('kernel') }} prevLabel="← 20.3 Modules" next={function() { setActive('scheduling') }} nextLabel="20.5 Scheduling →" />
            </div>
          )}

          {active === 'scheduling' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.5 Linux Scheduling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The Completely Fair Scheduler and real-time scheduling in Linux.</p>

              <InfoBox color="#34d399">
                Linux uses multiple scheduling classes with priorities. The <strong>CFS (Completely Fair Scheduler)</strong> handles normal processes. Real-time classes (SCHED_FIFO, SCHED_RR) handle time-critical tasks. The scheduler always picks the highest-priority runnable task.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Scheduling Classes (highest to lowest priority)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { cls: 'stop_sched_class', color: '#ef4444', desc: 'Highest priority. Used internally to stop CPUs for hotplug/migration. Cannot be used by applications.' },
                  { cls: 'dl_sched_class', color: '#f97316', desc: 'SCHED_DEADLINE. Earliest Deadline First. Process specifies runtime, deadline, period. Hard real-time. For audio/video processing.' },
                  { cls: 'rt_sched_class', color: '#f59e0b', desc: 'SCHED_FIFO and SCHED_RR. Real-time processes. Priority 1-99. Always preempt normal processes. SCHED_FIFO: run until blocked. SCHED_RR: round-robin at same priority.' },
                  { cls: 'fair_sched_class (CFS)', color: '#10b981', desc: 'SCHED_NORMAL and SCHED_BATCH. Most processes. Red-black tree sorted by vruntime. Always runs task with lowest vruntime. Nice value -20 to 19 adjusts weight.', bold: true },
                  { cls: 'idle_sched_class', color: '#6e7681', desc: 'SCHED_IDLE. Runs only when nothing else can run. Lower priority than even nice=19. Background tasks that should not impact system.' },
                ].map(function(c) {
                  return (
                    <div key={c.cls} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '33', borderLeft: '4px solid ' + c.color, borderRadius: 8, padding: 12 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: c.bold ? 800 : 700, color: c.color, fontSize: 12, marginBottom: 4 }}>{c.cls}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>CFS Deep Dive</h3>
              <InfoBox color="#10b981">
                CFS uses a <strong>red-black tree</strong> (self-balancing BST) as its run queue, sorted by vruntime. Insertion and removal are O(log n). The leftmost node (minimum vruntime) is cached — picking the next process is O(1). When a process runs, its vruntime increases proportionally to wall-clock time, divided by its weight. When blocked, vruntime stops increasing — so it gets priority when it wakes up.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #10b98144', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* CFS vruntime update */</div>
                  <div>delta_exec = now - se-&gt;exec_start;</div>
                  <div>delta_exec_weighted = delta_exec * NICE_0_WEIGHT / se-&gt;weight;</div>
                  <div style={{ color: '#10b981' }}>se-&gt;vruntime += delta_exec_weighted;</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Nice -20: weight=88761, vruntime grows slowly → more CPU */</div>
                  <div style={{ color: '#8b949e' }}>/* Nice 0:   weight=1024,  vruntime grows normally */</div>
                  <div style={{ color: '#8b949e' }}>/* Nice +19: weight=15,    vruntime grows fast → less CPU */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>CFS Simulator</h3>
              <CFSVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>CFS and multicore (SMP):</strong> On multicore systems, CFS maintains per-CPU run queues. Processes are generally kept on the same CPU (CPU affinity) to maximize cache reuse. Periodic load balancing migrates tasks between CPUs to keep them balanced. The scheduler uses NUMA awareness to prefer running tasks on the same NUMA node as their memory. The complexity of SMP scheduling is one of the most challenging parts of the Linux kernel.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Energy-aware scheduling (EAS):</strong> Modern mobile devices (ARM big.LITTLE) have a mix of powerful and efficient CPU cores. Linux EAS places tasks on the most energy-efficient core that can handle the workload — light tasks go to small efficient cores, heavy tasks go to big powerful cores. This extends battery life significantly. Android phones heavily rely on EAS for battery efficiency.
              </LearnMore>

              <NavButtons prev={function() { setActive('process') }} prevLabel="← 20.4 Processes" next={function() { setActive('memory') }} nextLabel="20.6 Memory →" />
            </div>
          )}

          {active === 'memory' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.6 Linux Memory Management</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How Linux manages physical and virtual memory.</p>

              <InfoBox color="#8b5cf6">
                Linux uses a sophisticated virtual memory system: every process has a 64-bit virtual address space, physical memory is managed in pages (4KB), and the page cache recycles unused memory for file caching. The kernel has its own non-swappable memory region.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Linux Memory Layout (64-bit)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, marginBottom: 24 }}>
                {[
                  { region: 'Kernel space (128TB)', color: '#ef4444', addr: 'ffff800000000000+', desc: 'Kernel code, data, modules. Not accessible from user space.' },
                  { region: '--- Non-canonical ---', color: '#1c2128', addr: '', desc: '' },
                  { region: 'Stack (grows down)', color: '#3b82f6', addr: '~7fff...', desc: 'Process stack. Grows downward.' },
                  { region: 'mmap / shared libs', color: '#8b5cf6', addr: 'variable', desc: 'Shared libraries, mmap()\'d files, anonymous mmap.' },
                  { region: 'Heap (grows up)', color: '#f59e0b', addr: 'variable', desc: 'malloc() allocations. Grows upward via brk().' },
                  { region: 'BSS / Data / Text', color: '#10b981', addr: '0x400000+', desc: 'Executable code and static data.' },
                  { region: 'Unmapped (null guard)', color: '#1c2128', addr: '0x0', desc: 'Unmapped — catches null pointer dereferences.' },
                ].map(function(r) {
                  if (!r.addr) return <div key={r.region} style={{ height: 20, background: '#1c2128', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#484f58' }}>{r.region}</div>
                  return (
                    <div key={r.region} style={{ background: r.color === '#1c2128' ? '#0d1117' : r.color + '22', border: '1px solid ' + (r.color === '#1c2128' ? '#1c2128' : r.color + '44'), borderRadius: 4, padding: '6px 12px' }}>
                      <div style={{ fontWeight: 600, color: r.color === '#1c2128' ? '#484f58' : r.color, fontSize: 12 }}>{r.region}</div>
                      {r.desc && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.desc}</div>}
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Physical Memory Management</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { system: 'Buddy Allocator', color: '#3b82f6', desc: 'Manages physical pages. Allocates blocks of 1, 2, 4, 8...1024 contiguous pages. Merges adjacent free blocks into larger ones. Fast O(log n) allocation/deallocation. Used for large allocations.' },
                  { system: 'Slab Allocator (SLUB)', color: '#10b981', desc: 'Caches frequently allocated kernel objects (task_struct, inode, dentry). Pre-allocates slabs of same-size objects. Eliminates per-object alloc/free overhead. SLUB is the modern Linux slab implementation.' },
                  { system: 'vmalloc', color: '#f59e0b', desc: 'Allocates virtually contiguous but physically non-contiguous memory. Used for large allocations where physical contiguity is not needed. More flexible than buddy allocator but slower due to page table manipulation.' },
                  { system: 'Page Cache', color: '#8b5cf6', desc: 'Caches file data in RAM. Reads check cache first. Writes go to cache (dirty pages). Background writeback daemon flushes dirty pages. Can use all free RAM — freed when needed.' },
                ].map(function(s) {
                  return (
                    <div key={s.system} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: s.color, fontSize: 13, minWidth: 160 }}>{s.system}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>OOM Killer:</strong> When Linux runs out of memory and cannot free any more, the Out-Of-Memory killer activates. It calculates an oom_score for each process (based on memory usage, run time, nice value) and kills the highest-scoring process. You can adjust oom_score_adj (-1000 to +1000) to protect critical processes. Chrome sets high oom_score_adj on renderer processes so they get killed before the browser UI. Containers set high oom_score_adj on less important services.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Huge pages and THP:</strong> Linux supports 2MB and 1GB huge pages. Transparent Huge Pages (THP) automatically promotes 4KB page regions to 2MB huge pages when possible. Reduces TLB pressure significantly for memory-intensive applications. Some databases (PostgreSQL, Redis) disable THP because the background defragmentation causes latency spikes. Use /sys/kernel/mm/transparent_hugepage/enabled to control THP behavior.
              </LearnMore>

              <NavButtons prev={function() { setActive('scheduling') }} prevLabel="← 20.5 Scheduling" next={function() { setActive('fs') }} nextLabel="20.7 File Systems →" />
            </div>
          )}

          {active === 'fs' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.7 Linux File Systems</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>VFS, ext4, and the rich ecosystem of Linux file systems.</p>

              <InfoBox color="#14b8a6">
                Linux supports dozens of file systems through the <strong>VFS (Virtual File System)</strong> abstraction layer. The same open/read/write system calls work on ext4, NTFS, FAT32, NFS, tmpfs, and even /proc. VFS defines the interface; each file system implements it.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>ext4 — The Default Linux File System</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { feature: 'Journaling', color: '#3b82f6', desc: 'Write-ahead log prevents corruption. Three modes: journal (safest, slowest), ordered (default, safe), writeback (fastest, less safe).' },
                  { feature: 'Extents', color: '#10b981', desc: 'Groups contiguous blocks as (start, length) pairs instead of block lists. One extent = up to 128MB contiguous. Reduces fragmentation and metadata size.' },
                  { feature: 'Delayed allocation', color: '#f59e0b', desc: 'Delays block allocation until data is actually written to disk. Allows better placement decisions. Reduces fragmentation. Slight data loss risk on crash without proper fsync.' },
                  { feature: 'Dir indexing (HTree)', color: '#8b5cf6', desc: 'Directories with many files use a hash tree (B-tree of hash values) instead of linear list. O(log n) lookup for millions of files per directory.' },
                  { feature: 'Max file size', color: '#ef4444', desc: '16 TB (with 4KB blocks). Max volume: 1 EB. Max files: ~4 billion. Sufficient for most use cases.' },
                  { feature: 'Checksums', color: '#f97316', desc: 'Metadata checksums (ext4) detect corruption in superblock, block group descriptors, journal. Data checksums via separate tools (dm-integrity).' },
                ].map(function(f) {
                  return (
                    <div key={f.feature} style={{ background: 'var(--bg-card)', border: '1px solid ' + f.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: f.color, marginBottom: 6, fontSize: 13 }}>{f.feature}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Linux File System Ecosystem</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { fs: 'ext4', color: '#3b82f6', desc: 'Default. Stable, mature, widely supported. Good all-around choice.' },
                  { fs: 'XFS', color: '#10b981', desc: 'High performance, especially for large files and parallel I/O. Default on RHEL. Excellent for databases and file servers.' },
                  { fs: 'Btrfs', color: '#f59e0b', desc: 'Copy-on-write, snapshots, checksums, RAID, compression built-in. Default on SUSE. Still maturing but feature-rich.' },
                  { fs: 'ZFS on Linux', color: '#8b5cf6', desc: 'Excellent data integrity, snapshots, compression, RAID-Z. Popular for NAS. Licensing incompatibility with GPL requires separate module.' },
                  { fs: 'tmpfs', color: '#ef4444', desc: 'RAM-based file system. /tmp, /run, /dev/shm. Fastest possible I/O. Lost on reboot. Size limited by RAM + swap.' },
                  { fs: 'procfs (/proc)', color: '#f97316', desc: 'Virtual FS exposing kernel and process info. Not on disk — generated on read. /proc/cpuinfo, /proc/meminfo, /proc/[pid]/maps.' },
                  { fs: 'sysfs (/sys)', color: '#34d399', desc: 'Virtual FS exposing device tree and kernel subsystems. Used by udev for device management. Replaces older /proc entries.' },
                ].map(function(f) {
                  return (
                    <div key={f.fs} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + f.color + '33', borderRadius: 8, padding: '8px 14px' }}>
                      <code style={{ fontFamily: 'monospace', fontWeight: 700, color: f.color, fontSize: 12, minWidth: 60 }}>{f.fs}</code>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>VFS implementation:</strong> VFS defines four key objects: superblock (mounted FS instance), inode (file metadata), dentry (directory entry in cache), file (open file instance). Each has an operations struct with function pointers that the file system implements. When you call read(), VFS calls file-&gt;f_op-&gt;read(). The beauty: user-space code never needs to know if it is reading from ext4, NFS, or /proc — VFS dispatches automatically.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>io_uring and the future of Linux I/O:</strong> Traditional POSIX I/O (read/write/pread) requires a syscall per I/O operation. io_uring (Linux 5.1+) uses two ring buffers shared between kernel and user space: a submission queue and a completion queue. Applications submit hundreds of I/O requests with a single syscall (or even no syscall with SQPOLL mode). Completions are polled from the completion queue. io_uring achieves near-NVMe speeds from application code and is being adopted by databases (PostgreSQL, ScyllaDB), web servers, and storage systems.
              </LearnMore>

              <NavButtons prev={function() { setActive('memory') }} prevLabel="← 20.6 Memory" next={function() { setActive('io') }} nextLabel="20.8 I/O →" />
            </div>
          )}

          {active === 'io' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.8 Linux I/O and Device Management</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How Linux manages hardware devices and I/O operations.</p>

              <InfoBox color="#f97316">
                Linux abstracts hardware devices through a layered system: device files in /dev, device drivers in the kernel, udev for dynamic device management, and sysfs for hardware topology. The block I/O layer handles storage I/O scheduling.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Device Types</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { type: 'Block devices', color: '#3b82f6', files: '/dev/sda, /dev/nvme0n1', desc: 'Random access in fixed-size blocks (sectors). Has a request queue and I/O scheduler. Used for storage.' },
                  { type: 'Character devices', color: '#10b981', files: '/dev/tty, /dev/random', desc: 'Sequential byte stream. No buffering at block layer. Used for terminals, serial ports, input devices.' },
                  { type: 'Network devices', color: '#8b5cf6', files: 'eth0, wlan0 (no /dev)', desc: 'Special class — no device file. Accessed via sockets. Managed by network subsystem.' },
                ].map(function(d) {
                  return (
                    <div key={d.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + d.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: d.color, marginBottom: 4, fontSize: 13 }}>{d.type}</div>
                      <code style={{ fontSize: 11, color: d.color, background: d.color + '11', padding: '1px 6px', borderRadius: 4, display: 'block', marginBottom: 6 }}>{d.files}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>udev — Dynamic Device Management</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                <strong>udev</strong> is the Linux device manager. When hardware is plugged in: the kernel detects it and creates a uevent. udev receives the event, matches it against rules, creates the /dev file with correct permissions, loads the appropriate kernel module, and optionally runs scripts. This is why plugging in a USB drive automatically mounts it.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>I/O Schedulers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { sched: 'None / noop', color: '#6e7681', desc: 'No reordering. FIFO. Used for NVMe and SSDs where seek time does not matter. Zero overhead.' },
                  { sched: 'mq-deadline', color: '#3b82f6', desc: 'Merges requests and enforces deadlines. Prevents starvation. Good balance for HDDs and SSDs.' },
                  { sched: 'BFQ (Budget Fair Queuing)', color: '#10b981', desc: 'Per-process I/O bandwidth fairness. Good for interactive systems (desktop, multimedia). Higher overhead.' },
                  { sched: 'Kyber', color: '#8b5cf6', desc: 'Targets specific latency goals for reads and writes. Low overhead. Good for NVMe and high-IOPS SSDs.' },
                ].map(function(s) {
                  return (
                    <div key={s.sched} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: s.color, marginBottom: 6, fontSize: 13 }}>{s.sched}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Device tree (ARM):</strong> x86 uses ACPI for hardware discovery. ARM systems use device trees — a data structure describing the hardware topology (what devices exist, their addresses, interrupt numbers, clock sources). The bootloader passes the device tree blob (DTB) to the kernel. The kernel parses it to discover and initialize hardware. This allows a single kernel binary to run on hundreds of different ARM boards by changing only the device tree file.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>eBPF and kernel extensibility:</strong> eBPF (extended Berkeley Packet Filter) allows running sandboxed programs in the kernel without writing kernel modules. Originally for network packet filtering, eBPF now hooks into hundreds of kernel events: system calls, network packets, scheduler events, memory allocations, hardware performance counters. Used for: performance tracing (bpftrace), network filtering (Cilium in Kubernetes), security monitoring (Falco), and even implementing new network protocols. eBPF has transformed Linux observability.
              </LearnMore>

              <NavButtons prev={function() { setActive('fs') }} prevLabel="← 20.7 File Systems" next={function() { setActive('ipc') }} nextLabel="20.9 IPC →" />
            </div>
          )}

          {active === 'ipc' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>20.9 Linux IPC</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Inter-Process Communication mechanisms in Linux.</p>

              <InfoBox color="#22d3ee">
                Linux provides many IPC mechanisms. The choice depends on: same machine vs network, related vs unrelated processes, performance requirements, and whether streaming or message-based communication is needed.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    name: 'Pipes', color: '#3b82f6',
                    api: 'pipe(), popen(), |',
                    desc: 'Unidirectional byte stream. Anonymous pipes: between related processes. Named pipes (FIFOs): between any processes. Classic Unix IPC.',
                    use: 'Shell pipelines: ls | grep | wc. Parent-child communication.',
                    perf: '~1GB/s on same machine'
                  },
                  {
                    name: 'Unix Domain Sockets', color: '#10b981',
                    api: 'socket(AF_UNIX, ...), bind(), connect()',
                    desc: 'Full-duplex bidirectional communication. Same machine only. Can pass file descriptors between processes (SCM_RIGHTS). Like TCP sockets but in kernel, no network overhead.',
                    use: 'Docker daemon, systemd, X11, PostgreSQL, MySQL.',
                    perf: '~4GB/s. Very fast for large messages'
                  },
                  {
                    name: 'Shared Memory', color: '#f59e0b',
                    api: 'mmap(MAP_SHARED), shm_open(), shmget()',
                    desc: 'Multiple processes map the same physical pages. Direct memory access — no copying. Fastest IPC for large data. Requires separate synchronization (mutex, semaphore).',
                    use: 'Video editors, databases, GPU/CPU data sharing.',
                    perf: 'Memory speed — tens of GB/s'
                  },
                  {
                    name: 'POSIX Message Queues', color: '#8b5cf6',
                    api: 'mq_open(), mq_send(), mq_receive()',
                    desc: 'Kernel-maintained message queues. Messages have priorities. Persistent until explicitly deleted or process exits. Supports notifications via signals or threads.',
                    use: 'Embedded systems, real-time applications.',
                    perf: 'Moderate — kernel involved per message'
                  },
                  {
                    name: 'Signals', color: '#ef4444',
                    api: 'kill(), signal(), sigaction()',
                    desc: 'Asynchronous notifications. Limited information (just a signal number). SIGTERM, SIGKILL, SIGCHLD, SIGUSR1/2 most common. Cannot be used to pass data.',
                    use: 'Process control (stop, terminate, reload config).',
                    perf: 'Very low throughput — for control, not data'
                  },
                  {
                    name: 'Netlink Sockets', color: '#f97316',
                    api: 'socket(AF_NETLINK, ...)',
                    desc: 'Communication between user space and kernel. Used for network configuration (ip, iproute2), audit subsystem, generic netlink for kernel-to-user notifications.',
                    use: 'ip addr, ip route, iptables, auditd.',
                    perf: 'Good for kernel↔userspace messaging'
                  },
                ].map(function(ipc) {
                  return (
                    <div key={ipc.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + ipc.color + '33', borderLeft: '4px solid ' + ipc.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, color: ipc.color, fontSize: 14 }}>{ipc.name}</div>
                        <code style={{ fontSize: 11, color: ipc.color, background: ipc.color + '11', padding: '1px 8px', borderRadius: 6 }}>{ipc.api}</code>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 6 }}>{ipc.desc}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Use: {ipc.use}</span>
                        <span style={{ color: ipc.color, fontWeight: 600 }}>Perf: {ipc.perf}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>D-Bus — desktop IPC:</strong> D-Bus is the standard IPC mechanism for Linux desktop environments (GNOME, KDE). It provides a message bus where services register names and methods. Applications call methods on remote objects using a simple API. systemd uses D-Bus (via sd-bus) for service management. dbus-daemon is the message broker — it routes messages between applications. D-Bus supports introspection, authentication, and activation (starting services on demand).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>io_uring for IPC:</strong> io_uring can be used for zero-copy IPC between processes. By registering shared buffers and using fixed files (registered file descriptors), two processes can exchange data with minimal overhead. This is being used in storage systems and high-performance servers to eliminate copy costs in IPC paths. The kernel's io_uring passthrough feature even allows sending io_uring requests from one process to be executed in another process's context.
              </LearnMore>

              <NavButtons prev={function() { setActive('io') }} prevLabel="← 20.8 I/O" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Linux System Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for Linux architecture and scheduling.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Linux Architecture Diagram</h3>
              <LinuxArchDiagram />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>CFS Scheduler Simulator</h3>
              <CFSVisualizer />

              <NavButtons prev={function() { setActive('ipc') }} prevLabel="← 20.9 IPC" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Linux System in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore Linux internals through code and commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f97316' }}>Lab 1 — Linux System Programming in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore Linux Internals in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['uname -r',                        'Current kernel version'],
                  ['lsmod | head -20',                'List loaded kernel modules'],
                  ['cat /proc/version',               'Kernel version and build info'],
                  ['cat /proc/schedstat',             'Scheduler statistics per CPU'],
                  ['cat /proc/self/status',           'Current process info (memory, state)'],
                  ['ps -eo pid,ni,pri,stat,comm | head -20', 'Processes with nice/priority/state'],
                  ['cat /sys/block/sda/queue/scheduler', 'I/O scheduler for sda'],
                  ['ls /proc/sys/kernel',             'Kernel tunable parameters'],
                  ['sysctl -a 2>/dev/null | grep vm | head', 'VM kernel parameters'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', minWidth: 280, flexShrink: 0 }}>{item[0]}</code>
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 20.</p>
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
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
                    <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>You scored {quiz.score} / {QUIZ.length}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 20 — and the entire OS course!' : quiz.score >= 4 ? 'Great work! Review the sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', borderRadius: 12, padding: 24, marginBottom: 32, textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#000', marginBottom: 4 }}>Course Complete!</div>
                      <div style={{ fontSize: 14, color: '#000', opacity: 0.8 }}>You have completed all 20 chapters of Operating Systems (Silberschatz 10th Ed)</div>
                    </div>
                    <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: '#f97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}