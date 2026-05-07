import { useState } from 'react'
import { Link } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'services', title: '2.1 OS Services', icon: '🛎️' },
  { id: 'interface', title: '2.2 User Interface', icon: '🖥️' },
  { id: 'syscalls', title: '2.3 System Calls', icon: '📞' },
  { id: 'programs', title: '2.4 System Programs', icon: '🔧' },
  { id: 'structure', title: '2.5 OS Structure Types', icon: '🏗️' },
  { id: 'build', title: '2.6 Building & Booting', icon: '🚀' },
  { id: 'lab', title: '💻 Hands-on Lab', icon: '🧪' },
  { id: 'quiz', title: '🧠 Quiz', icon: '✅' },
]

const quizQuestions = [
  {
    q: 'What is the purpose of a system call?',
    options: ['To call another user program', 'To request a service from the OS kernel', 'To connect to the internet', 'To format the disk'],
    answer: 1,
    explanation: 'System calls are the programming interface to the OS. They let user programs request services (file I/O, process creation, memory allocation) from the kernel.'
  },
  {
    q: 'What is the key advantage of a microkernel OS structure?',
    options: ['It is the fastest structure', 'It fits in the smallest memory', 'It is easier to extend and more reliable — kernel failures are isolated', 'It has no user mode'],
    answer: 2,
    explanation: 'Microkernels move most OS services to user space. If a service crashes, only that service fails — not the whole OS. This makes the system more reliable and easier to extend.'
  },
  {
    q: 'Which OS uses a monolithic kernel?',
    options: ['macOS', 'Windows NT', 'Linux', 'QNX'],
    answer: 2,
    explanation: 'Linux uses a monolithic kernel — all OS services run in kernel space. This makes it fast (no message passing overhead) but any kernel bug can crash the whole system.'
  },
  {
    q: 'What does strace do in Linux?',
    options: ['Draws a graph', 'Shows all system calls made by a program', 'Lists files in a directory', 'Compiles C code'],
    answer: 1,
    explanation: 'strace intercepts and records every system call a program makes. It\'s invaluable for debugging — you can see exactly how a program interacts with the OS kernel.'
  },
]

function LearnMore({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: '12px' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: '1px solid #06b6d455', color: '#06b6d4',
        padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
        fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        {open ? '▲ Show Less' : '▼ Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{
          marginTop: '12px', background: 'rgba(6,182,212,0.06)',
          border: '1px solid #06b6d433', borderRadius: '10px', padding: '20px',
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
      borderLeft: `4px solid ${color}`, borderRadius: '10px',
      padding: '16px 20px', marginBottom: '24px',
      fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8'
    }}>
      {children}
    </div>
  )
}

function NavButtons({ prev, prevLabel, next, nextLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
      {prev ? <button onClick={prev} style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{prevLabel}</button> : <div />}
      {next && <button onClick={next} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{nextLabel}</button>}
    </div>
  )
}

export default function Chapter2() {
  const [active, setActive] = useState('services')
  const [quiz, setQuiz] = useState({ current: 0, selected: null, answered: false, score: 0, done: false })
  const [activeStruct, setActiveStruct] = useState('monolithic')

  const handleAnswer = (i) => {
    if (quiz.answered) return
    const correct = i === quizQuestions[quiz.current].answer
    setQuiz(q => ({ ...q, selected: i, answered: true, score: correct ? q.score + 1 : q.score }))
  }
  const nextQuestion = () => {
    if (quiz.current + 1 >= quizQuestions.length) setQuiz(q => ({ ...q, done: true }))
    else setQuiz(q => ({ ...q, current: q.current + 1, selected: null, answered: false }))
  }

  const structures = {
    monolithic: {
      name: 'Monolithic Kernel', color: '#3b82f6',
      desc: 'The entire OS runs as a single large program in kernel space. All services — file system, device drivers, memory management, scheduling — are in one big block of code.',
      pros: ['Very fast — no message passing between components', 'Direct function calls between subsystems', 'Used by Linux and most UNIX systems'],
      cons: ['A bug anywhere can crash the entire OS', 'Hard to maintain as code grows (Linux: 27M lines)', 'Adding features requires recompiling the kernel'],
      examples: 'Linux, FreeBSD, classic UNIX',
      layers: ['User Applications', 'System Call Interface', '← Everything below runs in Kernel Mode →', 'Process Mgmt | Memory Mgmt | File System | Device Drivers | Networking', 'Hardware'],
      colors: ['#8b5cf6', '#3b82f6', '#475569', '#3b82f6', '#f59e0b']
    },
    microkernel: {
      name: 'Microkernel', color: '#10b981',
      desc: 'Only the absolute minimum runs in kernel space (IPC, basic scheduling, memory). Everything else runs as user-space servers — file system server, device driver server, etc.',
      pros: ['More reliable — a crashed service doesn\'t take down the OS', 'More secure — services are isolated from each other', 'Easier to extend — add new services without touching the kernel'],
      cons: ['Slower — message passing between services has overhead', 'Complex IPC (inter-process communication) required', 'Performance-critical systems may suffer'],
      examples: 'macOS (Mach microkernel basis), QNX, MINIX, GNU Hurd',
      layers: ['User Applications', 'File Server | Device Server | Network Server | Process Server (all in USER space)', 'Microkernel: IPC + Basic Scheduling + Memory (KERNEL space)', 'Hardware'],
      colors: ['#8b5cf6', '#10b981', '#10b981', '#f59e0b']
    },
    hybrid: {
      name: 'Hybrid Kernel', color: '#8b5cf6',
      desc: 'A pragmatic compromise — keep performance-critical things in kernel space, but also support running some services in user space. Most modern OSes use this approach.',
      pros: ['Better performance than pure microkernel', 'Better stability than pure monolithic', 'Flexible — can move services in or out of kernel'],
      cons: ['More complex design than either pure approach', 'Security boundary between kernel/user is blurrier', 'Harder to reason about formally'],
      examples: 'Windows NT, macOS (XNU = Mach + BSD), DragonFly BSD',
      layers: ['User Applications', 'Some Services in User Space (drivers, etc.)', 'Core Kernel: Scheduler + Memory + Core Drivers', 'Hardware'],
      colors: ['#8b5cf6', '#8b5cf6', '#8b5cf6', '#f59e0b']
    },
    exokernel: {
      name: 'Exokernel / Unikernel', color: '#f59e0b',
      desc: 'Exokernel: Exposes hardware almost directly to applications — no abstractions. Applications manage their own resources. Unikernel: Bundle one app + just enough OS into one tiny image.',
      pros: ['Maximum performance — no abstraction overhead', 'Applications can optimize for their own workload', 'Unikernels are tiny (MBs) and boot in milliseconds'],
      cons: ['Extremely complex to program for', 'No protection between applications (exokernel)', 'Limited ecosystem and tooling'],
      examples: 'MIT Exokernel (research), MirageOS unikernel, IncludeOS',
      layers: ['Application (contains its own "libOS")', 'Exokernel: Only multiplexes hardware, no abstractions', 'Hardware'],
      colors: ['#f59e0b', '#f59e0b', '#f59e0b']
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #06b6d444', padding: '48px 60px' }}>
        <div style={{ fontSize: '12px', color: '#06b6d4', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Chapter 2</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '48px' }}>🏗️</span>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>Operating System Structures</h1>
        </div>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: '1.7' }}>
          How operating systems are designed and built — with a real <strong style={{color:'#3fb950'}}>Linux terminal</strong> and <strong style={{color:'#1f6feb'}}>code editor</strong> to try everything yourself.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[['🐧', 'Linux Terminal'], ['💻', 'Code Editor'], ['📊', 'OS Structure Diagrams'], ['▼', 'Deep Dives']].map(([icon, label]) => (
            <span key={label} style={{ fontSize: '13px', background: 'rgba(6,182,212,0.1)', border: '1px solid #06b6d433', color: '#06b6d4', padding: '4px 14px', borderRadius: '20px' }}>
              {icon} {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar nav */}
        <div style={{ width: '240px', minWidth: '240px', padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(s => (
            <div key={s.id} onClick={() => setActive(s.id)} style={{
              padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: '10px',
              alignItems: 'center', fontSize: '13px', fontWeight: '500',
              color: active === s.id ? '#06b6d4' : 'var(--text-secondary)',
              background: active === s.id ? 'rgba(6,182,212,0.1)' : 'transparent',
              borderLeft: active === s.id ? '3px solid #06b6d4' : '3px solid transparent',
              transition: 'all 0.2s'
            }}>
              <span>{s.icon}</span><span>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '48px 60px', maxWidth: '900px' }}>

          {/* 2.1 Services */}
          {active === 'services' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>2.1 OS Services</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>What the OS actually does for you and your programs.</p>

              <InfoBox color="#06b6d4">
                An OS provides an environment for programs to execute. It provides <strong>services to programs and to users</strong>. Some services exist for the convenience of the user; others ensure efficient operation of the system itself.
              </InfoBox>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 16px' }}>Services for the User</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                {[
                  { icon: '🖥️', name: 'User Interface', color: '#3b82f6', desc: 'CLI (command line), GUI (graphical), or touch interface. The way users interact with the OS.' },
                  { icon: '▶️', name: 'Program Execution', color: '#10b981', desc: 'Load a program into memory, run it, and handle its normal or abnormal termination.' },
                  { icon: '📁', name: 'File-System Manipulation', color: '#f59e0b', desc: 'Read, write, create, delete files and directories. Search and list. Manage permissions.' },
                  { icon: '🔌', name: 'I/O Operations', color: '#8b5cf6', desc: 'Programs can\'t access hardware directly. The OS provides safe, controlled I/O operations.' },
                  { icon: '📡', name: 'Communications', color: '#06b6d4', desc: 'Processes exchange information — on the same computer (shared memory, pipes) or across a network (sockets).' },
                  { icon: '🚨', name: 'Error Detection', color: '#ef4444', desc: 'Detect and handle errors in CPU, memory, I/O devices, and user programs. Take appropriate action.' },
                ].map(s => (
                  <div key={s.name} style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}33`, borderRadius: '10px', padding: '18px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{s.icon}</span>
                      <div style={{ fontWeight: '700', color: s.color }}>{s.name}</div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 16px' }}>Services for System Efficiency</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                {[
                  { icon: '⚖️', name: 'Resource Allocation', color: '#3b82f6', desc: 'CPU cycles, memory, I/O devices — fairly distributed among concurrent processes.' },
                  { icon: '📝', name: 'Logging', color: '#10b981', desc: 'Track which programs use how much resources — for billing, debugging, optimization.' },
                  { icon: '🛡️', name: 'Protection & Security', color: '#ef4444', desc: 'Control access to all resources. Authenticate users. Defend against external attacks.' },
                ].map(s => (
                  <div key={s.name} style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}33`, borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                    <div style={{ fontWeight: '700', color: s.color, marginBottom: '6px' }}>{s.name}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>How does the OS know which service to call?</strong> Each OS service has a number. When a program needs a service, it puts the service number in a CPU register and executes the <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>syscall</code> instruction. The OS looks up that number in the system call table and jumps to the right handler. Linux has ~350 numbered system calls. Call #1 is <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>write()</code>, #60 is <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>exit()</code>, #57 is <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>fork()</code>.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Service overhead:</strong> Every OS service call has a cost — mode switch to kernel (100–1000 CPU cycles), execute the service, mode switch back. For performance-critical code, programmers minimize service calls. A web server might use <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>sendfile()</code> instead of separate <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>read()+write()</code> calls to reduce overhead by 50%.
              </LearnMore>

              <NavButtons next={() => setActive('interface')} nextLabel="2.2 User Interface →" />
            </div>
          )}

          {/* 2.2 Interface */}
          {active === 'interface' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>2.2 User Interface</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>How humans talk to the OS — command line, graphical, and touch.</p>

              <InfoBox color="#8b5cf6">
                The UI is the part of the OS you actually see. There are three main types: <strong>CLI</strong> (Command Line Interface), <strong>GUI</strong> (Graphical User Interface), and <strong>Touch</strong> interfaces on mobile devices.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                  { icon: '⌨️', name: 'CLI', color: '#3fb950', desc: 'Text commands typed directly. The shell (bash, zsh, PowerShell) reads commands, interprets them, and calls the right OS functions. Fast, scriptable, powerful. Used by developers and servers.', example: 'bash, zsh, PowerShell, cmd.exe' },
                  { icon: '🖱️', name: 'GUI', color: '#3b82f6', desc: 'Windows, icons, menus, and a pointer (mouse/trackpad). The desktop metaphor — files look like papers, folders like folders. Invented at Xerox PARC, popularized by Apple Mac.', example: 'Windows Explorer, macOS Finder, GNOME' },
                  { icon: '👆', name: 'Touch', color: '#8b5cf6', desc: 'Direct manipulation with fingers. Swipe, tap, pinch, zoom. Designed for small screens. The interface paradigm that made smartphones natural to use for everyone.', example: 'iOS SpringBoard, Android Launcher' },
                ].map(ui => (
                  <div key={ui.name} style={{ background: 'var(--bg-card)', border: `1px solid ${ui.color}33`, borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{ui.icon}</div>
                    <div style={{ fontWeight: '700', color: ui.color, marginBottom: '8px', fontSize: '18px' }}>{ui.name}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '10px' }}>{ui.desc}</p>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📌 {ui.example}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 12px' }}>Try the CLI yourself — Linux Terminal</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
                This is a real simulated Linux terminal. Try these commands: <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>ls</code>, <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>pwd</code>, <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>cd /etc</code>, <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>cat os-release</code>, <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>uname -a</code>, <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>ps aux</code>
              </p>
              <Terminal />

              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>The Shell is not the OS:</strong> Many people confuse the shell (bash, zsh) with the OS. The shell is just a regular user-space program that reads your commands and calls system functions. You could replace bash with any other shell (fish, zsh, PowerShell) and the OS underneath doesn't care.<br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Shell scripting power:</strong> The CLI is far more powerful than it looks. You can chain commands with pipes: <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>cat /proc/meminfo | grep MemFree</code>. Redirect output to files: <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>ls -la {'>'} files.txt</code>. Loop over files: <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>for f in *.c; do gcc $f; done</code>. A 10-line bash script can automate tasks that would take hours manually.<br/><br/>
                <strong style={{color:'var(--text-primary)'}}>GUI implementation:</strong> A GUI is implemented as a set of system programs using OS services. On Linux, X11 or Wayland is the display server — it manages windows and input devices. Desktop environments (GNOME, KDE) run on top and provide the full desktop experience. On Windows, the Win32 subsystem handles windowing. On macOS, Quartz Compositor.
              </LearnMore>

              <NavButtons prev={() => setActive('services')} prevLabel="← 2.1 OS Services" next={() => setActive('syscalls')} nextLabel="2.3 System Calls →" />
            </div>
          )}

          {/* 2.3 System Calls */}
          {active === 'syscalls' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>2.3 System Calls</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>The most important interface in all of computing — how programs talk to the OS.</p>

              <InfoBox color="#3b82f6">
                <strong>System calls</strong> provide the programming interface to the services offered by the OS. They are typically written in C/C++. A running program almost always accesses the OS through a high-level <strong>Application Programming Interface (API)</strong> rather than direct system calls.
              </InfoBox>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 12px' }}>The 6 Categories of System Calls</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                {[
                  { cat: 'Process Control', color: '#3b82f6', icon: '⚙️', calls: [['fork()', 'Create a new process (copy of current)'], ['exec()', 'Replace process with new program'], ['exit()', 'Terminate current process'], ['wait()', 'Wait for child process to finish'], ['kill()', 'Send signal to a process']] },
                  { cat: 'File Management', color: '#10b981', icon: '📁', calls: [['open()', 'Open or create a file'], ['read()', 'Read bytes from file descriptor'], ['write()', 'Write bytes to file descriptor'], ['close()', 'Close a file descriptor'], ['lseek()', 'Move file position pointer']] },
                  { cat: 'Device Management', color: '#8b5cf6', icon: '🔌', calls: [['ioctl()', 'Device-specific control'], ['read()', 'Read from device'], ['write()', 'Write to device'], ['mmap()', 'Map device into memory'], ['select()', 'Wait for I/O on multiple fds']] },
                  { cat: 'Information', color: '#f59e0b', icon: '📊', calls: [['getpid()', 'Get current process ID'], ['getuid()', 'Get current user ID'], ['time()', 'Get current time'], ['uname()', 'Get system information'], ['sysinfo()', 'Get memory/load statistics']] },
                  { cat: 'Communication (IPC)', color: '#06b6d4', icon: '📡', calls: [['pipe()', 'Create a pipe for data flow'], ['socket()', 'Create network endpoint'], ['connect()', 'Connect socket to address'], ['send()', 'Send data over socket'], ['shmget()', 'Create shared memory segment']] },
                  { cat: 'Memory Management', color: '#ef4444', icon: '💾', calls: [['brk()', 'Change heap size'], ['mmap()', 'Map memory/files'], ['munmap()', 'Unmap memory'], ['mprotect()', 'Set memory permissions'], ['mlock()', 'Lock memory pages in RAM']] },
                ].map(sc => (
                  <div key={sc.cat} style={{ background: 'var(--bg-card)', border: `1px solid ${sc.color}33`, borderRadius: '10px', padding: '18px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                      <span>{sc.icon}</span>
                      <div style={{ fontWeight: '700', color: sc.color, fontSize: '14px' }}>{sc.cat}</div>
                    </div>
                    {sc.calls.map(([fn, desc]) => (
                      <div key={fn} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'baseline' }}>
                        <code style={{ fontSize: '12px', color: sc.color, fontFamily: 'JetBrains Mono, monospace', minWidth: '90px' }}>{fn}</code>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 12px' }}>System Call Flow — Step by Step</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                {[
                  { n: '1', color: '#8b5cf6', text: 'Your C program calls printf("Hello") — a library function in glibc' },
                  { n: '2', color: '#3b82f6', text: 'glibc prepares syscall number (1 = write) and arguments in CPU registers (rax=1, rdi=1, rsi=buf, rdx=len)' },
                  { n: '3', color: '#3b82f6', text: 'glibc executes syscall instruction — CPU traps into kernel mode (mode bit: 1→0)' },
                  { n: '4', color: '#ef4444', text: 'CPU jumps to kernel syscall handler, saves all user registers to the kernel stack' },
                  { n: '5', color: '#ef4444', text: 'Kernel validates parameters, writes bytes to stdout (the terminal device)' },
                  { n: '6', color: '#10b981', text: 'Kernel puts return value (bytes written) in rax register' },
                  { n: '7', color: '#10b981', text: 'CPU returns to user mode (mode bit: 0→1), restores user registers' },
                  { n: '8', color: '#8b5cf6', text: 'glibc returns to your program with the return value. printf() is done!' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#000', flexShrink: 0 }}>{s.n}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingTop: '3px', lineHeight: '1.6', fontFamily: s.n >= '2' && s.n <= '7' ? 'JetBrains Mono, monospace' : 'inherit' }}>{s.text}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 12px' }}>See System Calls in Action — Code + strace</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Run the code examples below, then use <code style={{background:'var(--bg-card)',padding:'2px 8px',borderRadius:'4px',color:'#3fb950'}}>strace echo hello</code> in the terminal to see every syscall a program makes.
              </p>
              <CodeEditor defaultExample="c_syscall" />
              <Terminal />

              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Why use an API (glibc) instead of calling syscalls directly?</strong> You could call syscalls directly in assembly, and some performance-critical code does. But using the C library (glibc/musl) has huge advantages: portability (same code works on different Linux versions), error handling, buffering (fread buffers many reads), and convenience. The POSIX standard defines a portable API that works on all UNIX systems — Linux, macOS, FreeBSD all implement POSIX.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Windows system calls:</strong> Windows calls its system call layer the "Native API" (ntdll.dll). But Microsoft officially supports the Win32 API (kernel32.dll, user32.dll, etc.) which wraps the native API. The native API is undocumented and changes between Windows versions. Win32 is stable. Most Windows software uses Win32; only very low-level tools use the native API.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>strace and performance:</strong> strace works by using the ptrace() system call to intercept every system call. This doubles execution time — not for production use, but invaluable for debugging. ltrace is similar but traces library calls instead of syscalls. perf is a Linux tool that samples which syscalls are most frequent in a running system.
              </LearnMore>

              <NavButtons prev={() => setActive('interface')} prevLabel="← 2.2 User Interface" next={() => setActive('programs')} nextLabel="2.4 System Programs →" />
            </div>
          )}

          {/* 2.4 System Programs */}
          {active === 'programs' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>2.4 System Programs</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>The tools that come with your OS — compilers, shells, editors, and more.</p>

              <InfoBox color="#f59e0b">
                System programs provide a convenient environment for program development and execution. Most users' view of the OS is defined more by <strong>system programs than by the actual system calls</strong>. They come with the OS — they're not apps you install.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                {[
                  { cat: 'File Management', color: '#3b82f6', icon: '📁', tools: [['ls, dir', 'List files'], ['cp, mv, rm', 'Copy, move, delete'], ['mkdir, rmdir', 'Create/delete dirs'], ['find, locate', 'Search files']] },
                  { cat: 'Status Information', color: '#10b981', icon: '📊', tools: [['ps, top, htop', 'Process info'], ['df, du', 'Disk usage'], ['free, vmstat', 'Memory info'], ['uptime, who', 'System status']] },
                  { cat: 'File Modification', color: '#8b5cf6', icon: '✏️', tools: [['vim, nano', 'Text editors'], ['grep, sed, awk', 'Text processing'], ['diff, patch', 'Compare/patch files'], ['wc, sort', 'Word count, sort']] },
                  { cat: 'Programming Support', color: '#f59e0b', icon: '💻', tools: [['gcc, clang', 'C/C++ compilers'], ['python, node', 'Interpreters'], ['gdb, lldb', 'Debuggers'], ['make, cmake', 'Build systems']] },
                  { cat: 'Communications', color: '#06b6d4', icon: '📡', tools: [['ssh', 'Secure remote shell'], ['curl, wget', 'HTTP client'], ['netstat, ss', 'Network status'], ['ping, traceroute', 'Network diagnostics']] },
                  { cat: 'Background Services', color: '#ef4444', icon: '⚙️', tools: [['systemd', 'Service manager'], ['cron', 'Scheduled tasks'], ['syslogd', 'System logging'], ['sshd, httpd', 'Network daemons']] },
                ].map(sc => (
                  <div key={sc.cat} style={{ background: 'var(--bg-card)', border: `1px solid ${sc.color}33`, borderRadius: '10px', padding: '18px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{sc.icon}</span>
                      <div style={{ fontWeight: '700', color: sc.color }}>{sc.cat}</div>
                    </div>
                    {sc.tools.map(([tool, desc]) => (
                      <div key={tool} style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
                        <code style={{ fontSize: '12px', color: sc.color, fontFamily: 'JetBrains Mono, monospace', minWidth: '100px' }}>{tool}</code>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 12px' }}>Try System Programs in the Terminal</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Try: <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>ps aux</code>, <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>free</code>, <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>df</code>, <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>top</code>, <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>cat /proc/cpuinfo</code>, <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>cat /proc/meminfo</code>
              </p>
              <Terminal />

              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Daemons — the invisible workers:</strong> A daemon is a background process with no terminal, running continuously. On Linux, daemons typically end in 'd': sshd (SSH server), httpd (web server), cron (task scheduler), journald (logging), NetworkManager. When you boot Linux, systemd (PID 1) starts all daemons. On macOS, launchd plays this role. On Windows, these are called "Services" managed by the Service Control Manager.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>The /proc filesystem — magic files:</strong> In Linux, /proc is a virtual filesystem — it has no files on disk. Everything in /proc is generated live by the kernel. /proc/cpuinfo shows your CPU. /proc/1/maps shows memory layout of process 1. /proc/net/tcp shows all TCP connections. Reading /proc/meminfo is how the free command gets memory stats. This is a brilliant design — use the familiar file interface to expose kernel data.
              </LearnMore>

              <NavButtons prev={() => setActive('interface')} prevLabel="← 2.2 User Interface" next={() => setActive('structure')} nextLabel="2.5 OS Structure Types →" />
            </div>
          )}

          {/* 2.5 Structure */}
          {active === 'structure' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>2.5 OS Structure Types</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>The most important design decision in OS development — where do you draw the kernel boundary?</p>

              <InfoBox color="#8b5cf6">
                There is no single correct way to structure an OS. The design choices involve fundamental trade-offs between <strong>performance</strong>, <strong>reliability</strong>, <strong>security</strong>, and <strong>maintainability</strong>. Click each type below to explore.
              </InfoBox>

              {/* Structure selector */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {Object.entries(structures).map(([key, s]) => (
                  <button key={key} onClick={() => setActiveStruct(key)} style={{
                    background: activeStruct === key ? s.color : 'var(--bg-card)',
                    color: activeStruct === key ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${activeStruct === key ? s.color : 'var(--border)'}`,
                    padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
                  }}>{s.name}</button>
                ))}
              </div>

              {/* Active structure */}
              {(() => {
                const s = structures[activeStruct]
                return (
                  <div style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}44`, borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: s.color, marginBottom: '12px' }}>{s.name}</h3>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '24px' }}>{s.desc}</p>

                    {/* Diagram */}
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Architecture Diagram</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '24px' }}>
                      {s.layers.map((layer, i) => (
                        <div key={i} style={{
                          background: `${s.colors[i]}22`, border: `1px solid ${s.colors[i]}55`,
                          borderRadius: '8px', padding: '12px 20px', textAlign: 'center',
                          fontSize: '13px', fontWeight: '600', color: s.colors[i]
                        }}>{layer}</div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>✅ Advantages</div>
                        {s.pros.map(p => <div key={p} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', paddingLeft: '8px' }}>• {p}</div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>⚠️ Disadvantages</div>
                        {s.cons.map(c => <div key={c} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', paddingLeft: '8px' }}>• {c}</div>)}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📌 Real examples: {s.examples}</div>
                  </div>
                )
              })()}

              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Why does Linux use a monolithic kernel despite the disadvantages?</strong> History and pragmatism. Linux started in 1991 when microkernels were theoretically appealing but practically slow. Linus Torvalds had a famous email debate with Andrew Tanenbaum (MINIX microkernel creator) about this. Linus argued that a well-designed monolithic kernel with loadable modules gives the best performance. 30 years later, Linux runs everything from smartwatches to supercomputers — hard to argue with the results.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Linux kernel modules:</strong> Linux monolithic kernel can be extended without recompiling via <em>loadable kernel modules (LKMs)</em>. When you plug in a USB device, Linux dynamically loads the driver module. <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>lsmod</code> shows loaded modules, <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>modprobe</code> loads them, <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>rmmod</code> removes them. This gives flexibility without full microkernel overhead.
                <br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Windows NT kernel design:</strong> Windows NT was designed as a microkernel but evolved into a hybrid. Originally, the subsystems (Win32, POSIX, OS/2) were supposed to be user-space servers communicating with a microkernel. Performance was too slow, so most was pulled into kernel space. The kernel Executive (ntoskrnl.exe) includes memory manager, I/O manager, process manager — all in kernel space. But the HAL (Hardware Abstraction Layer) and graphics drivers are separate components.
              </LearnMore>

              <NavButtons prev={() => setActive('programs')} prevLabel="← 2.4 System Programs" next={() => setActive('build')} nextLabel="2.6 Building & Booting →" />
            </div>
          )}

          {/* 2.6 Build & Boot */}
          {active === 'build' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>2.6 Building & Booting an OS</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>How an OS goes from source code to a running system on your hardware.</p>

              <InfoBox color="#3b82f6">
                An OS is not delivered as one universal binary. It is <strong>configured and compiled specifically for each hardware architecture and use case</strong>. The Linux kernel has 15,000+ configuration options. Building an OS is a complex, multi-stage process.
              </InfoBox>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '24px 0 16px' }}>How Linux is Built</h3>
              {[
                { step: '1', title: 'Get the source code', color: '#3b82f6', code: 'git clone https://github.com/torvalds/linux.git', desc: 'The Linux kernel is ~27 million lines of C code. You download it from Linus\'s git repository. This is 1GB+ of source.' },
                { step: '2', title: 'Configure the kernel', color: '#8b5cf6', code: 'make menuconfig', desc: 'You choose which features, drivers, and modules to include. 15,000+ options. Which filesystems? Which CPU architecture? Which device drivers? This generates a .config file.' },
                { step: '3', title: 'Compile the kernel', color: '#10b981', code: 'make -j$(nproc)', desc: 'The compiler translates all C code into machine code. On a fast machine this takes 20–60 minutes. The output is a compressed kernel image (bzImage on x86).' },
                { step: '4', title: 'Install kernel and modules', color: '#f59e0b', code: 'make modules_install && make install', desc: 'Copy the kernel image to /boot, install loadable modules to /lib/modules, and update the bootloader (GRUB) configuration.' },
                { step: '5', title: 'Reboot and select kernel', color: '#ef4444', code: 'reboot # then select from GRUB menu', desc: 'GRUB presents your new kernel as an option. Select it and Linux boots with your custom-compiled kernel.' },
              ].map(s => (
                <div key={s.step} style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}33`, borderRadius: '10px', padding: '20px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#000', flexShrink: 0 }}>{s.step}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: s.color, marginBottom: '6px' }}>{s.title}</div>
                      <code style={{ display: 'block', background: '#0d1117', padding: '8px 14px', borderRadius: '6px', color: '#3fb950', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '10px' }}>{s.code}</code>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}

              <LearnMore>
                <strong style={{color:'var(--text-primary)'}}>Cross-compilation:</strong> When building an OS for a different CPU architecture (e.g., building an ARM kernel for a Raspberry Pi on your x86 PC), you need a cross-compiler — a compiler that runs on x86 but produces ARM machine code. Android's entire build system is cross-compiled from x86 Linux/Mac machines to ARM phones.<br/><br/>
                <strong style={{color:'var(--text-primary)'}}>Why does compilation take so long?</strong> The kernel has 27M+ lines of C. Every file must be compiled to object code, then linked. C compilers do complex optimization — dead code elimination, loop unrolling, inlining. With <code style={{background:'var(--bg-primary)',padding:'1px 6px',borderRadius:'4px'}}>-j$(nproc)</code> you use all CPU cores in parallel. Incremental builds are much faster — only changed files are recompiled. The build system (Kbuild for Linux, based on Make) tracks dependencies between files.<br/><br/>
                <strong style={{color:'var(--text-primary)'}}>initramfs — the temporary root filesystem:</strong> When the kernel first boots, it needs a root filesystem to mount. But the drivers for the real filesystem may not be loaded yet. Solution: a tiny compressed filesystem (initramfs) is embedded directly in the kernel image. The kernel mounts this virtual FS first, loads the necessary drivers, then switches to the real root filesystem (pivot_root). This is what shows the spinning circle or progress bar during boot.
              </LearnMore>

              <NavButtons prev={() => setActive('structure')} prevLabel="← 2.5 OS Structure" next={() => setActive('lab')} nextLabel="💻 Hands-on Lab →" />
            </div>
          )}

          {/* Lab */}
          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>💻 Hands-on Lab — Chapter 2</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>Write real code, run it, and observe system calls happening live.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#3b82f6' }}>Lab 1 — System Calls in C</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
                    These programs demonstrate direct system call usage. Notice how <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>getpid()</code>, <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>write()</code>, and <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>open()</code> are all system calls that cross the user/kernel boundary.
                  </p>
                  <CodeEditor defaultExample="c_syscall" />
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#10b981' }}>Lab 2 — Process Creation with fork()</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
                    <strong style={{color:'var(--text-primary)'}}>fork()</strong> is one of the most important system calls. It creates an exact copy of the current process. After fork(), both parent and child run independently. The only difference: fork() returns 0 in the child, and the child's PID in the parent.
                  </p>
                  <CodeEditor defaultExample="c_fork" />
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#8b5cf6' }}>Lab 3 — File System Calls</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
                    Every file operation goes through the OS kernel via system calls. <strong style={{color:'var(--text-primary)'}}>open()</strong> returns a file descriptor (a small integer) — the kernel's handle to the file. All subsequent operations use this number, not the filename.
                  </p>
                  <CodeEditor defaultExample="c_fileops" />
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#f59e0b' }}>Lab 4 — Exploring OS with Python</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
                    Python's <code style={{background:'var(--bg-card)',padding:'2px 6px',borderRadius:'4px',color:'#3fb950'}}>os</code> module wraps system calls in a friendly interface. Everything here eventually calls the same kernel functions as the C code above.
                  </p>
                  <CodeEditor defaultExample="python_os" />
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#06b6d4' }}>Lab 5 — Linux Terminal Exploration</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
                    Use the terminal to explore the running OS. Try the commands below to see live system information. Use ↑/↓ arrow keys for command history. Tab for autocomplete.
                  </p>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>🎯 Challenges — try these in the terminal:</div>
                    {[
                      ['1', 'Find your PID', 'echo $$ or ps'],
                      ['2', 'Check memory', 'cat /proc/meminfo'],
                      ['3', 'See the CPU info', 'cat /proc/cpuinfo'],
                      ['4', 'List all processes', 'ps aux'],
                      ['5', 'Trace system calls', 'strace echo hello'],
                      ['6', 'Read a file', 'cat /home/student/notes.txt'],
                    ].map(([n, goal, hint]) => (
                      <div key={n} style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#06b6d4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#000', flexShrink: 0 }}>{n}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{goal}</span>
                        <code style={{ fontSize: '12px', color: '#3fb950', background: '#0d1117', padding: '2px 8px', borderRadius: '4px' }}>{hint}</code>
                      </div>
                    ))}
                  </div>
                  <Terminal />
                </div>
              </div>

              <NavButtons prev={() => setActive('build')} prevLabel="← 2.6 Building & Booting" next={() => setActive('quiz')} nextLabel="🧠 Take the Quiz →" />
            </div>
          )}

          {/* Quiz */}
          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>🧠 Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>4 questions on Chapter 2. Take your time.</p>

              {!quiz.done ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {quizQuestions.length}</span>
                    <span style={{ fontSize: '13px', color: '#10b981' }}>Score: {quiz.score}</span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', height: '6px' }}>
                    <div style={{ height: '100%', background: '#06b6d4', borderRadius: '8px', width: `${(quiz.current / quizQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
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
                        <div key={i} onClick={() => handleAnswer(i)} style={{ padding: '14px 20px', borderRadius: '10px', cursor: quiz.answered ? 'default' : 'pointer', background: bg, border: `1px solid ${border}`, color, fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}>
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
                      <button onClick={nextQuestion} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
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
                    {quiz.score === 4 ? 'Perfect! You mastered Chapter 2!' : quiz.score >= 2 ? 'Good work! Review the sections you missed.' : 'Keep studying — go back and re-read.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false })} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Retry Quiz</button>
                    <Link to="/chapter/3" style={{ textDecoration: 'none' }}>
                      <button style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Next: Chapter 3 →</button>
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