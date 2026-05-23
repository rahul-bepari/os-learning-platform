import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '18.1 VM Overview',           icon: '🖥️' },
  { id: 'benefits',    title: '18.2 Benefits of VMs',       icon: '✅' },
  { id: 'types',       title: '18.3 VM Types',              icon: '📦' },
  { id: 'implementation', title: '18.4 Implementation',     icon: '⚙️' },
  { id: 'cpu',         title: '18.5 CPU Virtualization',    icon: '💻' },
  { id: 'memory',      title: '18.6 Memory Virtualization', icon: '💾' },
  { id: 'io',          title: '18.7 I/O Virtualization',    icon: '🔌' },
  { id: 'containers',  title: '18.8 Containers',            icon: '🐳' },
  { id: 'simulator',   title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is a hypervisor (Virtual Machine Monitor)?',
    options: [
      'A program that monitors network traffic',
      'Software (or hardware) that creates and manages virtual machines, abstracting physical hardware into multiple isolated virtual environments',
      'A type of CPU cache',
      'A file system for virtual disks'
    ],
    answer: 1,
    explanation: 'A hypervisor (VMM - Virtual Machine Monitor) sits between hardware and virtual machines. It creates the illusion of dedicated hardware for each VM — each VM thinks it has its own CPU, memory, and devices. The hypervisor multiplexes physical resources among VMs and enforces isolation between them.'
  },
  {
    q: 'What is the difference between Type 1 and Type 2 hypervisors?',
    options: [
      'Type 1 supports more VMs than Type 2',
      'Type 1 runs directly on hardware (bare metal); Type 2 runs on top of a host OS',
      'Type 2 is faster than Type 1',
      'Type 1 is for containers; Type 2 is for VMs'
    ],
    answer: 1,
    explanation: 'Type 1 (bare metal) hypervisors run directly on hardware — VMware ESXi, Microsoft Hyper-V, Xen. They have direct hardware access and are used in data centers. Type 2 (hosted) hypervisors run as an application on top of a host OS — VMware Workstation, VirtualBox, Parallels. Type 1 is more efficient for production; Type 2 is easier to install on a desktop.'
  },
  {
    q: 'What is trap-and-emulate in CPU virtualization?',
    options: [
      'Trapping network packets and emulating responses',
      'Privileged instructions in the guest VM cause a trap to the hypervisor, which emulates their effect without actually executing them on hardware',
      'A debugging technique for catching CPU errors',
      'Emulating old instruction sets on modern CPUs'
    ],
    answer: 1,
    explanation: 'Guest VMs run in user mode, not kernel mode. When a guest OS tries to execute a privileged instruction (like modifying page tables or disabling interrupts), the CPU traps to the hypervisor. The hypervisor inspects the instruction, emulates its effect on the virtual machine state, and returns control. This maintains isolation while allowing guest OSes to think they have full hardware control.'
  },
  {
    q: 'What is the purpose of hardware-assisted virtualization (Intel VT-x / AMD-V)?',
    options: [
      'To speed up graphics in virtual machines',
      'To add a new CPU privilege level for the hypervisor, eliminating the need for binary translation and making virtualization much faster',
      'To provide virtual disk I/O acceleration',
      'To enable GPU passthrough to VMs'
    ],
    answer: 1,
    explanation: 'Without hardware support, some x86 instructions behave differently in user mode and kernel mode without trapping — making pure trap-and-emulate impossible and requiring slow binary translation. Intel VT-x and AMD-V add a new "ring -1" privilege level for the hypervisor. Guest OS runs in ring 0 but in a restricted mode — privileged operations automatically trap to the hypervisor without binary translation, making virtualization much faster.'
  },
  {
    q: 'What is the main difference between a virtual machine and a container?',
    options: [
      'Containers are slower than VMs',
      'VMs virtualize the entire hardware stack including a full OS; containers share the host kernel and only isolate user-space processes',
      'VMs use more network bandwidth',
      'Containers cannot run on Linux'
    ],
    answer: 1,
    explanation: 'A VM includes a full guest OS (kernel + user space) on top of virtualized hardware — heavier but fully isolated. A container shares the host kernel and uses namespaces + cgroups to isolate processes — lighter weight, faster startup (milliseconds vs seconds), but less isolation. Containers are ideal for microservices; VMs are better when you need full OS isolation or run different OSes.'
  },
  {
    q: 'What are Linux namespaces used for in containerization?',
    options: [
      'Naming files in a container',
      'Isolating different aspects of the OS view per process group — PID, network, filesystem, users, etc. each process group sees its own isolated view',
      'Managing container networking',
      'Allocating CPU time to containers'
    ],
    answer: 1,
    explanation: 'Linux namespaces create isolated views of system resources. Each namespace type isolates a different aspect: PID namespace (process IDs), network namespace (network interfaces, routing), mount namespace (file system tree), UTS namespace (hostname), IPC namespace (shared memory, semaphores), user namespace (UIDs/GIDs). A container gets one of each — it sees its own PID 1, its own network interfaces, its own file system root.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #22d3ee55', color: '#22d3ee', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(34,211,238,0.06)', border: '1px solid #22d3ee33', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#22d3ee', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function VMStackVisualizer() {
  const [type, setType] = useState('type1')

  const stacks = {
    type1: {
      label: 'Type 1 Hypervisor (Bare Metal)',
      color: '#22d3ee',
      layers: [
        { name: 'VM1: Guest OS + Apps', color: '#3b82f6', sub: 'Linux + nginx' },
        { name: 'VM2: Guest OS + Apps', color: '#10b981', sub: 'Windows + IIS' },
        { name: 'VM3: Guest OS + Apps', color: '#8b5cf6', sub: 'Linux + MySQL' },
        { name: 'Type 1 Hypervisor (VMM)', color: '#22d3ee', sub: 'VMware ESXi / Hyper-V / Xen', bold: true },
        { name: 'Physical Hardware', color: '#6e7681', sub: 'CPU + RAM + NIC + Disk' },
      ],
      desc: 'Hypervisor runs directly on bare metal. No host OS overhead. Used in data centers. Examples: VMware ESXi, Microsoft Hyper-V, Xen, KVM.'
    },
    type2: {
      label: 'Type 2 Hypervisor (Hosted)',
      color: '#f59e0b',
      layers: [
        { name: 'VM1: Guest OS + Apps', color: '#3b82f6', sub: 'Linux + Apps' },
        { name: 'VM2: Guest OS + Apps', color: '#8b5cf6', sub: 'Windows + Apps' },
        { name: 'Type 2 Hypervisor', color: '#f59e0b', sub: 'VirtualBox / VMware Workstation', bold: true },
        { name: 'Host Operating System', color: '#10b981', sub: 'Windows / macOS / Linux' },
        { name: 'Physical Hardware', color: '#6e7681', sub: 'CPU + RAM + NIC + Disk' },
      ],
      desc: 'Hypervisor runs as an application on a host OS. Easier to install and use. Less efficient — host OS adds overhead. Examples: VirtualBox, VMware Workstation, Parallels.'
    },
    container: {
      label: 'Containers',
      color: '#10b981',
      layers: [
        { name: 'Container 1: App + Libs', color: '#3b82f6', sub: 'nginx + libraries' },
        { name: 'Container 2: App + Libs', color: '#8b5cf6', sub: 'node.js + libraries' },
        { name: 'Container 3: App + Libs', color: '#f59e0b', sub: 'python + libraries' },
        { name: 'Container Runtime', color: '#10b981', sub: 'Docker / containerd / podman', bold: true },
        { name: 'Host OS Kernel (shared)', color: '#22d3ee', sub: 'Linux kernel — namespaces + cgroups' },
        { name: 'Physical Hardware', color: '#6e7681', sub: 'CPU + RAM + NIC + Disk' },
      ],
      desc: 'Containers share the host kernel. No guest OS needed. Very lightweight and fast startup. Isolation via namespaces and cgroups. Examples: Docker, Kubernetes, Podman.'
    }
  }

  const stack = stacks[type]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Virtualization Stack Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Compare how Type 1, Type 2, and containers are stacked.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.keys(stacks).map(function(key) {
          return (
            <button key={key} onClick={function() { setType(key) }} style={{ background: type === key ? stacks[key].color + '33' : 'var(--bg-secondary)', color: type === key ? stacks[key].color : 'var(--text-secondary)', border: '1px solid ' + (type === key ? stacks[key].color : 'var(--border)'), padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: type === key ? 700 : 400 }}>
              {stacks[key].label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 500, marginBottom: 16 }}>
        {stack.layers.map(function(layer, i) {
          return (
            <div key={i} style={{ background: layer.color + '22', border: '2px solid ' + layer.color + (layer.bold ? '' : '66'), borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontWeight: layer.bold ? 800 : 600, color: layer.color, fontSize: 13 }}>{layer.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{layer.sub}</div>
            </div>
          )
        })}
      </div>

      <div style={{ background: stack.color + '15', border: '1px solid ' + stack.color + '44', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {stack.desc}
      </div>
    </div>
  )
}

function ContainerVsVMTable() {
  const comparisons = [
    { aspect: 'Startup time', vm: 'Seconds to minutes', container: 'Milliseconds', winner: 'container' },
    { aspect: 'Image size', vm: 'GB (full OS)', container: 'MB (app + libs only)', winner: 'container' },
    { aspect: 'Isolation', vm: 'Full hardware isolation', container: 'Process isolation (shared kernel)', winner: 'vm' },
    { aspect: 'Security', vm: 'Stronger — separate kernel', container: 'Weaker — kernel exploits affect all', winner: 'vm' },
    { aspect: 'Resource overhead', vm: 'Higher (guest OS memory)', container: 'Near-zero (no guest OS)', winner: 'container' },
    { aspect: 'Run different OSes', vm: 'Yes — Linux VM on Windows', container: 'No — must match host kernel type', winner: 'vm' },
    { aspect: 'Density (per host)', vm: 'Tens of VMs', container: 'Thousands of containers', winner: 'container' },
    { aspect: 'Live migration', vm: 'Yes (vMotion, live migrate)', container: 'Depends on orchestrator', winner: 'vm' },
  ]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>VM vs Container Comparison</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {['Aspect', 'Virtual Machine', 'Container'].map(function(h) {
                return <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {comparisons.map(function(row) {
              return (
                <tr key={row.aspect} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#22d3ee' }}>{row.aspect}</td>
                  <td style={{ padding: '10px 14px', color: row.winner === 'vm' ? '#10b981' : 'var(--text-secondary)', fontWeight: row.winner === 'vm' ? 600 : 400 }}>
                    {row.winner === 'vm' ? '✓ ' : ''}{row.vm}
                  </td>
                  <td style={{ padding: '10px 14px', color: row.winner === 'container' ? '#10b981' : 'var(--text-secondary)', fontWeight: row.winner === 'container' ? 600 : 400 }}>
                    {row.winner === 'container' ? '✓ ' : ''}{row.container}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Chapter18() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #22d3ee44', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 18</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🖥️</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Virtual Machines</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How virtual machines work — hypervisors, CPU/memory/I/O virtualization, hardware assistance, and containers.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['VM Stack Visualizer', 'VM vs Container Table', 'Trap-and-Emulate', 'Shadow Page Tables', 'Docker / Namespaces'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(34,211,238,0.1)', border: '1px solid #22d3ee33', color: '#22d3ee', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#22d3ee' : 'var(--text-secondary)', background: active === s.id ? 'rgba(34,211,238,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #22d3ee' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.1 Virtual Machine Overview</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What virtual machines are and how they abstract hardware.</p>

              <InfoBox color="#22d3ee">
                A <strong>virtual machine (VM)</strong> abstracts the hardware of a single computer into several different execution environments — each believing it has its own hardware. A <strong>hypervisor (VMM)</strong> creates and manages VMs, multiplexing physical resources among them.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The Core Idea</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Without virtualization: one OS has exclusive access to all hardware. With virtualization: a hypervisor presents each VM with a complete set of virtual hardware — virtual CPU, virtual memory, virtual disk, virtual NIC. Each guest OS thinks it owns real hardware but is actually using a software abstraction.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Without Virtualization</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', background: '#0d1117', borderRadius: 6, padding: 10, lineHeight: 1.8 }}>
                    <div>Applications</div>
                    <div>↓</div>
                    <div>Operating System (Linux)</div>
                    <div>↓</div>
                    <div>Physical Hardware</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>One OS, one hardware, no isolation between VMs</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #22d3ee44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#22d3ee', marginBottom: 8 }}>With Virtualization</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', background: '#0d1117', borderRadius: 6, padding: 10, lineHeight: 1.8 }}>
                    <div>Apps | Apps | Apps</div>
                    <div>OS1  | OS2  | OS3</div>
                    <div>VM1  | VM2  | VM3</div>
                    <div style={{ borderTop: '1px solid #22d3ee', marginTop: 4, paddingTop: 4 }}>Hypervisor (VMM)</div>
                    <div>Physical Hardware</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Multiple isolated OSes on one physical machine</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>VM Stack Visualizer</h3>
              <VMStackVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>History of virtualization:</strong> IBM invented virtualization in the 1960s for the IBM System/360 mainframe. Time-sharing allowed multiple users; virtualization allowed multiple complete OS instances. The IBM VM/370 system ran multiple CMS (Conversational Monitor System) instances. Modern x86 virtualization became practical with VMware in 1998 — they solved the challenge of virtualizing x86, which was not designed to be virtualized. Intel VT-x (2005) and AMD-V (2006) added hardware support, making virtualization much faster.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Cloud computing and VMs:</strong> AWS EC2 (2006) made VMs available on demand over the internet — the foundation of cloud computing. Today AWS runs millions of VMs on their physical infrastructure. EC2 instances are VMs — you rent a virtual machine and pay per hour. The hypervisor (AWS uses a customized Xen and their Nitro hypervisor) ensures your VM is isolated from other customers' VMs on the same physical host.
              </LearnMore>

              <NavButtons next={function() { setActive('benefits') }} nextLabel="18.2 Benefits →" />
            </div>
          )}

          {active === 'benefits' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.2 Benefits of Virtual Machines</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Why virtualization transformed computing.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  { benefit: 'Isolation and Protection', color: '#ef4444', icon: '🛡️', desc: 'Each VM is completely isolated from others. A crash, security breach, or malware in one VM cannot affect other VMs or the host. The hypervisor enforces boundaries at the hardware level. Critical for multi-tenant cloud environments.' },
                  { benefit: 'Consolidation', color: '#3b82f6', icon: '📦', desc: 'Run multiple workloads on one physical server instead of many idle servers. A physical server running at 10% utilization can host 8-10 VMs. Reduces hardware costs, power consumption, and data center space by 5-10x.' },
                  { benefit: 'OS Flexibility', color: '#10b981', icon: '🔄', desc: 'Run Linux and Windows side by side on the same hardware. Run old OS versions for legacy applications. Test software on multiple OS versions simultaneously. Developers use VMs to test on different configurations.' },
                  { benefit: 'Snapshots and Cloning', color: '#f59e0b', icon: '📸', desc: 'Capture the complete state of a running VM (disk + memory + CPU state). Restore to any previous state instantly. Clone VMs for testing. Deploy identical VMs from a golden image. Impossible with physical machines.' },
                  { benefit: 'Live Migration', color: '#8b5cf6', icon: '🚀', desc: 'Move a running VM from one physical host to another with zero (or near-zero) downtime. VMware vMotion, KVM live migration. Enables hardware maintenance without service interruption. Enables load balancing across hosts.' },
                  { benefit: 'Development and Testing', color: '#f97316', icon: '🧪', desc: 'Create throwaway test environments in seconds. Test patches or new software without risking production. "Snapshot before, test, restore if broken." Standard practice for sysadmins and developers.' },
                ].map(function(b) {
                  return (
                    <div key={b.benefit} style={{ background: 'var(--bg-card)', border: '1px solid ' + b.color + '33', borderLeft: '4px solid ' + b.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{b.icon}</span>
                        <div style={{ fontWeight: 700, color: b.color, fontSize: 14 }}>{b.benefit}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Live migration in detail:</strong> VMware vMotion (2003) was revolutionary — moving a running VM between hosts. Process: (1) Copy memory pages to destination while VM keeps running (pre-copy). (2) Track pages modified during copy and re-copy them. (3) When remaining dirty pages are small, briefly pause VM, copy last pages + CPU state, resume on destination. Total downtime: milliseconds. Network storage (SAN/NFS) means disk is already accessible from both hosts. This enables zero-downtime maintenance of entire data centers.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>VM sprawl:</strong> The ease of creating VMs leads to "VM sprawl" — hundreds of forgotten test VMs consuming resources. Best practice: VM lifecycle management — track purpose, owner, and expiry date of every VM. Auto-shutdown idle VMs. Regular audits. Cloud providers exacerbate this — it is trivially easy to spin up a new EC2 instance and forget to terminate it, running up the bill indefinitely.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 18.1 Overview" next={function() { setActive('types') }} nextLabel="18.3 VM Types →" />
            </div>
          )}

          {active === 'types' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.3 Types of Hypervisors</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Type 1, Type 2, and paravirtualization.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #22d3ee44', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#22d3ee', marginBottom: 10 }}>Type 1 — Bare Metal Hypervisor</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    Runs directly on physical hardware. No host OS layer. The hypervisor IS the operating system for the physical machine. Most efficient — direct hardware access.
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    {['VMware ESXi', 'Microsoft Hyper-V', 'Xen', 'KVM (Linux kernel)', 'AWS Nitro'].map(function(p) {
                      return <span key={p} style={{ fontSize: 12, background: '#22d3ee18', color: '#22d3ee', border: '1px solid #22d3ee33', padding: '3px 10px', borderRadius: 8 }}>{p}</span>
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Best performance</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Used in production data centers</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Harder to install</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Limited hardware driver support</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 10 }}>Type 2 — Hosted Hypervisor</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    Runs as an application on top of a host OS. Host OS manages hardware; hypervisor uses host OS services. More overhead but easier to install and use.
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    {['VirtualBox', 'VMware Workstation', 'Parallels', 'QEMU'].map(function(p) {
                      return <span key={p} style={{ fontSize: 12, background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b33', padding: '3px 10px', borderRadius: 8 }}>{p}</span>
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Easy to install on desktop</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Uses host OS drivers</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Host OS overhead</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Not for production servers</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 10 }}>Paravirtualization</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    The guest OS is modified to be aware of the hypervisor. Instead of emulating hardware, the guest OS makes <strong>hypercalls</strong> directly to the hypervisor — like system calls to hardware. Faster than full virtualization but requires OS modification.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                    <div style={{ color: '#8b949e' }}>/* Full virtualization: guest thinks it has real hardware */</div>
                    <div>guest: write CR3 register → trap → hypervisor emulates</div>
                    <div></div>
                    <div style={{ color: '#8b949e' }}>/* Paravirtualization: guest knows it's in a VM */</div>
                    <div>guest: hypercall(UPDATE_PAGE_TABLE, ...) → hypervisor handles directly</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['Xen paravirt', 'VMware VMCI', 'VirtIO drivers'].map(function(p) {
                      return <span key={p} style={{ fontSize: 12, background: '#8b5cf618', color: '#8b5cf6', border: '1px solid #8b5cf633', padding: '3px 10px', borderRadius: 8 }}>{p}</span>
                    })}
                  </div>
                </div>

              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>KVM — Linux kernel as hypervisor:</strong> KVM (Kernel-based Virtual Machine) turns the Linux kernel itself into a Type 1 hypervisor by loading a kernel module. The host Linux OS serves double duty — it is both the host OS and the hypervisor. KVM uses hardware virtualization (VT-x/AMD-V) and QEMU for device emulation. Used by major cloud providers (Google Cloud, OpenStack). The guest runs in a special CPU mode (VMX non-root mode on Intel) where privileged operations trap to the KVM module.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>VirtIO — paravirtual device model:</strong> VirtIO is a standardized interface for paravirtual devices. Instead of emulating a specific NIC or disk controller, the hypervisor presents a VirtIO device and the guest uses a VirtIO driver. Much faster than emulating legacy hardware (e.g., emulating an Intel e1000 NIC in software). VirtIO-net, VirtIO-blk, VirtIO-scsi are common. All major Linux distributions include VirtIO drivers. Windows requires VirtIO drivers from a separate package.
              </LearnMore>

              <NavButtons prev={function() { setActive('benefits') }} prevLabel="← 18.2 Benefits" next={function() { setActive('implementation') }} nextLabel="18.4 Implementation →" />
            </div>
          )}

          {active === 'implementation' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.4 Building a Virtual Machine</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Requirements for correct and efficient virtualization.</p>

              <InfoBox color="#10b981">
                For a hypervisor to correctly virtualize a machine, it must satisfy the <strong>Popek and Goldberg virtualization requirements</strong> (1974): equivalence (VM behaves identically to bare metal), resource control (hypervisor controls all resources), efficiency (most instructions run at native speed without hypervisor involvement).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The x86 Virtualization Challenge</h3>
              <InfoBox color="#ef4444">
                x86 was originally NOT designed to be virtualized. The problem: some privileged instructions behave differently in user mode vs kernel mode WITHOUT generating a trap. A hypervisor cannot intercept these — the guest OS thinks it executed them in kernel mode, but silently failed. Popek and Goldberg show: if all sensitive instructions are also privileged (trap in user mode), trap-and-emulate works. x86 had 17 such "non-virtualizable" instructions (POPF, SGDT, etc.).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Solutions to x86 Non-Virtualizability</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    solution: 'Binary Translation',
                    color: '#f59e0b',
                    desc: 'VMware\'s original approach (1998). Hypervisor scans guest code before execution. Replaces problematic instructions with safe equivalents. Just-in-time recompilation of guest binary code. Effective but complex and has overhead.',
                    used: 'Early VMware, QEMU without KVM'
                  },
                  {
                    solution: 'Paravirtualization',
                    color: '#8b5cf6',
                    desc: 'Modify the guest OS to replace problematic instructions with hypercalls. Guest knows it is in a VM. Eliminates the problem at the source. Requires modifying every guest OS — not practical for Windows.',
                    used: 'Xen, VirtIO drivers'
                  },
                  {
                    solution: 'Hardware-Assisted Virtualization (VT-x / AMD-V)',
                    color: '#10b981',
                    desc: 'Intel and AMD added a new CPU mode (VMX root / VMX non-root). Hypervisor runs in VMX root mode. Guest OS runs in VMX non-root mode (ring 0 but restricted). ALL privileged operations in non-root mode generate VM exits to the hypervisor. Eliminates need for binary translation.',
                    used: 'KVM, VMware with VT-x, Hyper-V'
                  },
                ].map(function(s) {
                  return (
                    <div key={s.solution} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderLeft: '4px solid ' + s.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: s.color, fontSize: 14, marginBottom: 8 }}>{s.solution}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{s.desc}</div>
                      <div style={{ fontSize: 12, color: s.color, background: s.color + '11', padding: '3px 10px', borderRadius: 6, display: 'inline-block' }}>Used by: {s.used}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Intel VT-x VMX operation:</strong> VT-x adds VMXON/VMXOFF instructions to enter/exit VMX operation. VMLAUNCH/VMRESUME starts a VM. Each VM has a VMCS (Virtual Machine Control Structure) — a data structure describing the VM's virtual CPU state and the hypervisor's control settings. On a VM exit (trap), the CPU saves guest state to VMCS and restores host (hypervisor) state. The hypervisor reads the exit reason from VMCS, handles it, and does VMRESUME to continue the guest. Modern hardware handles this in microseconds.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>VMCS exit reasons:</strong> Hundreds of events can cause a VM exit: I/O port access, MSR read/write, CPUID instruction, HLT, interrupt window, page fault with certain conditions, and many more. The hypervisor configures which events generate exits via the VMCS control fields — it can choose to handle only the events it cares about, letting others execute natively. Minimizing VM exits is critical for performance.
              </LearnMore>

              <NavButtons prev={function() { setActive('types') }} prevLabel="← 18.3 VM Types" next={function() { setActive('cpu') }} nextLabel="18.5 CPU Virtualization →" />
            </div>
          )}

          {active === 'cpu' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.5 CPU Virtualization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How the hypervisor virtualizes processor execution.</p>

              <InfoBox color="#3b82f6">
                The hypervisor must give each VM the illusion of having its own CPU(s). It multiplexes physical CPUs among VMs using scheduling, and handles privileged operations via trap-and-emulate or hardware assistance.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Trap-and-Emulate</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'Guest OS runs in user mode (ring 3) or restricted mode (VMX non-root ring 0).' },
                  { n: 2, color: '#3b82f6', text: 'Guest executes normal instructions — they run at native speed directly on CPU. No hypervisor involvement.' },
                  { n: 3, color: '#f59e0b', text: 'Guest tries to execute a privileged instruction (e.g., load CR3 to change page table, HLT to halt, IN/OUT for I/O).' },
                  { n: 4, color: '#f59e0b', text: 'CPU TRAPS to hypervisor (VM exit). Saves guest CPU state to VMCS.' },
                  { n: 5, color: '#10b981', text: 'Hypervisor inspects the instruction. Emulates its effect on the virtual CPU state.' },
                  { n: 6, color: '#10b981', text: 'Hypervisor restores guest state and resumes execution (VM entry). Guest continues as if instruction succeeded.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>CPU Scheduling for VMs</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                The hypervisor schedules virtual CPUs (vCPUs) onto physical CPUs (pCPUs). Each VM has one or more vCPUs. The hypervisor runs a scheduler — similar to OS process scheduling — to assign pCPUs to vCPUs. A guest OS running on a vCPU also runs its own scheduler for its processes, unaware of the hypervisor scheduler below it.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { name: 'Credit Scheduler (Xen)', color: '#22d3ee', desc: 'Each VM gets credits proportional to its weight. vCPUs with credits run first. Provides fair sharing and CPU caps.' },
                  { name: 'Proportional Share', color: '#3b82f6', desc: 'Assign shares to each VM (e.g., VM1=2 shares, VM2=1 share). VM1 gets 2/3 of CPU time. Simple and predictable.' },
                  { name: 'Real-time scheduling', color: '#10b981', desc: 'For latency-sensitive VMs (VoIP, video). Guarantee minimum CPU time within each period. Requires careful admission control.' },
                  { name: 'CPU pinning', color: '#f59e0b', desc: 'Dedicate specific physical CPUs to specific VMs. Eliminates scheduling overhead. Reduces cache thrashing between VMs. Used for performance-critical workloads.' },
                ].map(function(s) {
                  return (
                    <div key={s.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: s.color, marginBottom: 6, fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>vCPU vs pCPU overcommit:</strong> A physical host with 32 cores can run VMs with a total of 128 vCPUs — 4:1 overcommit ratio. This works because VMs rarely use 100% CPU simultaneously. The hypervisor scheduler ensures all vCPUs get time. However, if all VMs spike simultaneously (e.g., scheduled batch jobs at midnight), they compete for pCPUs. Noisy neighbor problem — one VM's heavy workload impacts others. Cloud providers use statistical multiplexing to make overcommit work in practice.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Timing in VMs:</strong> VMs can experience time drift because vCPUs are not always running — when a vCPU is not scheduled, time passes on the real clock but the guest's timer interrupts are delayed. Guests use NTP or VM-aware time sync (VMware Tools, KVM's kvmclock) to correct drift. Some latency-sensitive applications (trading systems, databases) require dedicated pCPUs or careful tuning to avoid timing issues.
              </LearnMore>

              <NavButtons prev={function() { setActive('implementation') }} prevLabel="← 18.4 Implementation" next={function() { setActive('memory') }} nextLabel="18.6 Memory Virtualization →" />
            </div>
          )}

          {active === 'memory' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.6 Memory Virtualization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Three levels of memory addressing in virtualized systems.</p>

              <InfoBox color="#8b5cf6">
                With virtualization, there are now THREE levels of addresses: <strong>virtual</strong> (guest process), <strong>physical</strong> (guest OS thinks this is RAM), and <strong>machine</strong> (actual physical RAM). The hypervisor must translate between all three efficiently.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Three-Level Address Translation</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { name: 'Guest Virtual', color: '#3b82f6', desc: 'Process address' },
                  { name: '→ Guest Physical', color: '#8b5cf6', desc: 'Guest OS thinks this is RAM' },
                  { name: '→ Machine Physical', color: '#10b981', desc: 'Real RAM address' },
                ].map(function(a) {
                  return (
                    <div key={a.name} style={{ background: a.color + '22', border: '1px solid ' + a.color + '44', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: a.color, fontSize: 13 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Shadow Page Tables</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  The hypervisor maintains <strong>shadow page tables</strong> that map directly from guest virtual addresses to machine physical addresses — combining both translations into one. The CPU uses the shadow page table directly. The hypervisor keeps shadow tables in sync with guest page tables by write-protecting guest page tables and trapping modifications.
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                  <div>Guest PT:  virtual → guest_physical</div>
                  <div>Host PT:   guest_physical → machine_physical</div>
                  <div>Shadow PT: virtual → machine_physical  (used by hardware MMU)</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Hardware-Assisted Memory Virtualization (EPT / NPT)</h3>
              <InfoBox color="#10b981">
                Intel EPT (Extended Page Tables) and AMD NPT (Nested Page Tables) add hardware support for two-level page table walking. Hardware MMU walks both guest page tables AND host page tables in hardware — no shadow tables needed. 2D page table walk — guest VA → guest PA → machine PA. Major performance improvement: shadow page tables required frequent traps; EPT/NPT eliminate most of them.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Memory Overcommit Techniques</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[
                  { tech: 'Ballooning', color: '#3b82f6', desc: 'A balloon driver in the guest OS allocates memory (inflates), causing the guest to page out its own data. The host reclaims the ballooned pages for other VMs. Guest manages its own memory pressure.' },
                  { tech: 'Memory deduplication (KSM)', color: '#10b981', desc: 'Kernel Samepage Merging: scan all VM memory, find identical pages (e.g., same OS kernel code), merge them into one copy-on-write page. Saves significant memory when running many identical VMs.' },
                  { tech: 'Transparent huge pages', color: '#8b5cf6', desc: 'Use 2MB or 1GB pages instead of 4KB for VM memory. Reduces TLB pressure in both guest and host. Improves performance for memory-intensive workloads.' },
                  { tech: 'Swapping', color: '#f59e0b', desc: 'Hypervisor can swap VM memory pages to disk (at the machine level) just like a process. Last resort — very slow. Guest has no idea its "physical" memory is actually on disk.' },
                ].map(function(t) {
                  return (
                    <div key={t.tech} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + t.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: t.color, fontSize: 13, minWidth: 180 }}>{t.tech}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>KSM in practice:</strong> Kernel Samepage Merging scans pages every 200ms by default. For a host running 10 identical Ubuntu VMs, the kernel text and read-only data pages are identical — easily 200MB of memory saved. VMware calls this "Transparent Page Sharing" (TPS). After Spectre/Meltdown, some cloud providers disabled cross-VM page sharing for security (shared pages create timing side channels). But within the same tenant, deduplication is still valuable.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>NUMA and VM memory placement:</strong> On NUMA systems, a VM's vCPUs should be on the same NUMA node as the VM's memory — otherwise every memory access crosses the NUMA interconnect (2-3x slower). NUMA-aware hypervisors (vNUMA) expose the NUMA topology to VMs and try to keep vCPUs and memory on the same node. For large VMs that span NUMA nodes, this gets complex. NUMA effects can cause a 30-50% performance difference if handled poorly.
              </LearnMore>

              <NavButtons prev={function() { setActive('cpu') }} prevLabel="← 18.5 CPU Virt" next={function() { setActive('io') }} nextLabel="18.7 I/O Virtualization →" />
            </div>
          )}

          {active === 'io' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.7 I/O Virtualization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Virtualizing storage, network, and other devices.</p>

              <InfoBox color="#f97316">
                I/O virtualization allows multiple VMs to share physical I/O devices — NICs, disks, USB controllers. The hypervisor presents each VM with virtual devices and multiplexes access to physical hardware.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Approaches to I/O Virtualization</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    approach: 'Full Device Emulation',
                    color: '#ef4444',
                    desc: 'Hypervisor emulates a complete hardware device in software. Guest uses standard OS drivers for the emulated device. QEMU emulates IDE disk, RTL8139 NIC, etc. Works with any guest OS — no guest modification needed.',
                    pro: 'Universal compatibility',
                    con: 'Slow — every I/O operation traps to hypervisor for emulation'
                  },
                  {
                    approach: 'Paravirtual I/O (VirtIO)',
                    color: '#f59e0b',
                    desc: 'Guest uses special drivers that communicate directly with hypervisor via a shared memory ring buffer. Much more efficient than full emulation — bulk data transfer without per-operation traps. Requires VirtIO drivers in guest.',
                    pro: 'Near-native performance',
                    con: 'Requires guest OS support (VirtIO drivers)'
                  },
                  {
                    approach: 'Direct Assignment (SR-IOV)',
                    color: '#10b981',
                    desc: 'Single Root I/O Virtualization. PCIe hardware creates multiple virtual functions (VFs) from a single physical function (PF). Each VF is assigned directly to a VM. VM accesses hardware directly — no hypervisor in the data path. Near-native performance.',
                    pro: 'Native hardware performance',
                    con: 'Requires SR-IOV capable hardware. Breaks live migration.'
                  },
                ].map(function(a) {
                  return (
                    <div key={a.approach} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '33', borderLeft: '4px solid ' + a.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: a.color, fontSize: 14, marginBottom: 8 }}>{a.approach}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{a.desc}</div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 12, color: '#10b981' }}>✓ {a.pro}</span>
                        <span style={{ fontSize: 12, color: '#ef4444' }}>✗ {a.con}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Virtual Disk Implementation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { format: 'Raw/Flat', color: '#3b82f6', desc: 'One-to-one mapping. File on host = disk for VM. Fastest I/O. Wastes space (pre-allocated). Good for performance-critical VMs.' },
                  { format: 'QCOW2 / VMDK', color: '#10b981', desc: 'Copy-on-write, sparse format. Thin provisioning — only uses actual space. Supports snapshots. Slight I/O overhead for COW. Most flexible.' },
                  { format: 'Storage Backend', color: '#8b5cf6', desc: 'VMs in data centers use shared storage: SAN (FC/iSCSI), NFS, Ceph. All hosts see the same storage. Enables live migration — VM disk is not tied to one host.' },
                  { format: 'Snapshots', color: '#f59e0b', desc: 'Freeze current disk state. Write new changes to a delta file. Multiple snapshots create a chain. Restore instantly by discarding delta. Basis of VM backup.' },
                ].map(function(f) {
                  return (
                    <div key={f.format} style={{ background: 'var(--bg-card)', border: '1px solid ' + f.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: f.color, marginBottom: 6, fontSize: 13 }}>{f.format}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>VirtIO ring buffer protocol:</strong> VirtIO uses a shared memory ring buffer (virtqueue) between guest and hypervisor. Guest adds I/O descriptors to the available ring and notifies the hypervisor via a kick (PIO write). Hypervisor processes descriptors, puts results in the used ring, and sends an interrupt. For bulk transfers, many descriptors can be batched before a kick, and many completions before an interrupt — dramatically reducing trap/interrupt overhead vs per-I/O emulation.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>AWS Nitro System:</strong> Amazon redesigned their hypervisor around 2017-2020. The Nitro hypervisor is extremely lean — it offloads most I/O functions to dedicated hardware (Nitro cards). The Nitro card handles VPC networking, EBS storage, and security monitoring in hardware, freeing the host CPUs entirely for customer VMs. This gives C5 instances dedicated access to nearly all host CPU — almost bare-metal performance with full VM isolation.
              </LearnMore>

              <NavButtons prev={function() { setActive('memory') }} prevLabel="← 18.6 Memory Virt" next={function() { setActive('containers') }} nextLabel="18.8 Containers →" />
            </div>
          )}

          {active === 'containers' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>18.8 Containers</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Lightweight OS-level virtualization using namespaces and cgroups.</p>

              <InfoBox color="#10b981">
                Containers are a form of OS-level virtualization that shares the host kernel but isolates user-space processes using Linux <strong>namespaces</strong> and <strong>cgroups</strong>. Much lighter than VMs — start in milliseconds, use MB not GB. The foundation of Docker and Kubernetes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Linux Namespaces</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { ns: 'PID namespace', color: '#3b82f6', desc: 'Each container has its own PID space. PID 1 inside the container is the init process. Container processes cannot see host PIDs. Prevents killing processes outside the container.' },
                  { ns: 'Network namespace', color: '#10b981', desc: 'Each container has its own network interfaces, routing tables, iptables rules. Container gets its own eth0. Connect containers via virtual Ethernet pairs (veth) and bridges.' },
                  { ns: 'Mount namespace', color: '#f59e0b', desc: 'Each container has its own file system tree. Created from a container image (OverlayFS layers). The container sees only its own filesystem, not the host. Bind mounts inject host directories.' },
                  { ns: 'UTS namespace', color: '#8b5cf6', desc: 'Each container has its own hostname and domain name. Container can set hostname without affecting host or other containers.' },
                  { ns: 'IPC namespace', color: '#ef4444', desc: 'Isolates System V IPC objects (shared memory, semaphores, message queues) and POSIX message queues. Containers cannot interfere with each other\'s IPC.' },
                  { ns: 'User namespace', color: '#f97316', desc: 'Map container UIDs/GIDs to different host UIDs/GIDs. Root (UID 0) inside the container maps to non-root on the host. Rootless containers — run Docker without root privilege.' },
                ].map(function(n) {
                  return (
                    <div key={n.ns} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + n.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <code style={{ fontFamily: 'monospace', fontWeight: 700, color: n.color, fontSize: 12, minWidth: 160, flexShrink: 0 }}>{n.ns}</code>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>cgroups (Control Groups)</h3>
              <InfoBox color="#22d3ee">
                cgroups limit, account for, and isolate resource usage (CPU, memory, disk I/O, network). Without cgroups, one container could starve others by using all CPU or memory. With cgroups: set CPU shares (proportional scheduling), memory limit (hard cap, OOM kill if exceeded), block I/O throttling (MB/s limit), network bandwidth limits.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #22d3ee44', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}># Docker resource limits using cgroups</div>
                  <div>docker run --memory=512m --cpus=1.5 --name=myapp nginx</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Directly via cgroup filesystem</div>
                  <div>echo 536870912 [pipe]&gt; /sys/fs/cgroup/memory/myapp/memory.limit_in_bytes</div>
                  <div>echo 150000 [pipe]&gt; /sys/fs/cgroup/cpu/myapp/cpu.cfs_quota_us</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>VM vs Container Comparison</h3>
              <ContainerVsVMTable />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Container security concerns:</strong> Containers share the host kernel. A kernel exploit (Dirty COW, runc escape) can break out of the container and compromise the host. VMs are more strongly isolated. To improve container security: use seccomp profiles (restrict syscalls), AppArmor/SELinux (MAC policies), rootless containers (user namespaces), read-only container filesystems, and consider gVisor (Google's container sandbox that interposes on syscalls) or Kata Containers (lightweight VMs that look like containers).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Kubernetes architecture:</strong> Kubernetes is a container orchestration platform. It manages containers across a cluster of nodes. Master components: API server (receives requests), scheduler (assigns pods to nodes), controller manager (maintains desired state), etcd (distributed key-value store for cluster state). Worker node components: kubelet (manages containers on the node), kube-proxy (network rules), container runtime (Docker, containerd). Kubernetes handles scaling, rolling updates, service discovery, load balancing, and self-healing automatically.
              </LearnMore>

              <NavButtons prev={function() { setActive('io') }} prevLabel="← 18.7 I/O Virt" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Virtualization Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for understanding VM stacks and comparisons.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Virtualization Stack Visualizer</h3>
              <VMStackVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>VM vs Container Comparison</h3>
              <ContainerVsVMTable />

              <NavButtons prev={function() { setActive('containers') }} prevLabel="← 18.8 Containers" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Virtualization in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore VM and container concepts through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#22d3ee' }}>Lab 1 — Python Virtualization Concepts</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['cat /proc/cpuinfo | grep vmx',       'Check if CPU supports Intel VT-x'],
                  ['cat /proc/cpuinfo | grep svm',       'Check if CPU supports AMD-V'],
                  ['ls /sys/fs/cgroup',                  'List cgroup subsystems'],
                  ['lsns',                               'List all namespaces on the system'],
                  ['cat /proc/self/cgroup',              'Show cgroups of current process'],
                  ['cat /proc/self/ns/pid',              'PID namespace of current process'],
                  ['systemd-detect-virt',                'Detect if running in a VM/container'],
                  ['docker info 2>/dev/null || echo "Docker not installed"', 'Docker system info'],
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 18.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#22d3ee' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#22d3ee', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#22d3ee', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 18!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/19' }} style={{ background: '#22d3ee', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 19 →</button>
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