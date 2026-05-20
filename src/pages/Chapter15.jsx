import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',   title: '15.1 File System Structure', icon: '🏗️' },
  { id: 'operations', title: '15.2 File System Operations',icon: '⚙️' },
  { id: 'directory',  title: '15.3 Directory Implementation',icon: '📁' },
  { id: 'shared',     title: '15.4 Shared Files',          icon: '🔗' },
  { id: 'vfs',        title: '15.5 Virtual File System',   icon: '🌐' },
  { id: 'remote',     title: '15.6 Remote File Systems',   icon: '📡' },
  { id: 'consistency',title: '15.7 Consistency Semantics', icon: '🔄' },
  { id: 'nfs',        title: '15.8 NFS Case Study',        icon: '📂' },
  { id: 'simulator',  title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',        title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',       title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the purpose of the Virtual File System (VFS) layer?',
    options: [
      'To store files in virtual memory',
      'To provide a uniform interface above different file system types, allowing the same syscalls to work on ext4, NFS, FAT, and others',
      'To compress files to save space',
      'To encrypt file system data'
    ],
    answer: 1,
    explanation: 'VFS provides an object-oriented abstraction layer. It defines common objects (superblock, inode, dentry, file) and operations that every file system must implement. Application code calls open/read/write — VFS dispatches to the correct file system implementation. This is why the same cp command works on ext4, NFS, and FAT32 partitions.'
  },
  {
    q: 'What is a mount point?',
    options: [
      'The physical location on disk where the OS is stored',
      'A directory in the existing file system tree where another file system is attached, making it accessible as part of the unified tree',
      'The boot sector of a disk',
      'A special file that stores file system metadata'
    ],
    answer: 1,
    explanation: 'Mounting attaches a file system to a directory (mount point) in the existing tree. After mounting, accessing the mount point directory accesses the root of the mounted file system. For example, mounting a USB drive at /mnt/usb makes its contents accessible at /mnt/usb/. The mount point directory itself is hidden while something is mounted on it.'
  },
  {
    q: 'What is the difference between Unix semantics and session semantics for shared file access?',
    options: [
      'Unix semantics are faster',
      'Unix semantics: writes immediately visible to all processes. Session semantics: changes only visible to others after the file is closed',
      'Session semantics use more memory',
      'Unix semantics require network file systems'
    ],
    answer: 1,
    explanation: 'Unix semantics: a write to an open file is immediately visible to any other process that has the same file open — they share a single actual image. Session semantics (used by AFS, some distributed file systems): writes are not visible to other processes until the file is closed. On close, changes propagate. Simpler for caching in distributed systems but can cause stale reads.'
  },
  {
    q: 'What does NFS (Network File System) use to identify files across the network?',
    options: [
      'File names and paths',
      'File handles — opaque identifiers containing file system ID, inode number, and generation count',
      'IP addresses and port numbers',
      'SHA256 hashes of file content'
    ],
    answer: 1,
    explanation: 'NFS uses file handles — server-side opaque identifiers. A file handle contains: file system identifier (which volume), inode number (which file within the volume), and generation count (to detect reused inode numbers). File handles are passed in every NFS operation. They allow stateless server operation — the server does not need to remember which files clients have open.'
  },
  {
    q: 'What is a hard link\'s behavior when the original file is deleted?',
    options: [
      'The hard link becomes a dangling reference',
      'The file data remains accessible through the hard link — data deleted only when all hard links are removed',
      'The hard link is automatically updated to point elsewhere',
      'The hard link also gets deleted'
    ],
    answer: 1,
    explanation: 'A hard link and the "original" are equal — both are just directory entries pointing to the same inode. Deleting one directory entry decrements the inode link count. The inode (and its data blocks) are only freed when the link count reaches zero. So "deleting" the original file just removes one directory entry; the hard link still provides full access to the data.'
  },
  {
    q: 'What is the advantage of a hash table over a linear list for directory implementation?',
    options: [
      'Hash tables use less memory',
      'Hash table lookup is O(1) average vs O(n) for linear search — dramatically faster for large directories',
      'Hash tables support sorted order',
      'Hash tables avoid collisions'
    ],
    answer: 1,
    explanation: 'A linear list directory requires scanning all entries to find a file — O(n). A hash table computes hash(filename) to find the entry directly — O(1) average case. For large directories (thousands of files), this is a dramatic improvement. ext4 uses a hash tree (HTree) — a B-tree of hash values — giving O(log n) worst case with good average performance.'
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

function VFSLayerDiagram() {
  const [highlighted, setHighlighted] = useState(null)

  const layers = [
    {
      id: 'app', label: 'User Applications', color: '#3b82f6',
      desc: 'Applications call POSIX file syscalls: open(), read(), write(), close(), stat(). These are the same regardless of which file system stores the data.',
      examples: ['vim file.txt', 'cp src dst', 'ls -la', 'cat /proc/cpuinfo']
    },
    {
      id: 'syscall', label: 'System Call Interface', color: '#8b5cf6',
      desc: 'Kernel boundary. System call numbers are looked up in the syscall table. Arguments validated. Context switches to kernel mode.',
      examples: ['sys_open', 'sys_read', 'sys_write', 'sys_stat']
    },
    {
      id: 'vfs', label: 'VFS (Virtual File System)', color: '#06b6d4',
      desc: 'The key abstraction layer. Maintains dentry cache, inode cache, and mount table. Dispatches operations to the correct file system based on which mount point the file is on.',
      examples: ['vfs_open()', 'vfs_read()', 'dentry cache', 'inode cache']
    },
    {
      id: 'fs', label: 'File System Implementations', color: '#10b981',
      desc: 'Specific file system code. Each implements the VFS interface (super_operations, inode_operations, file_operations). Can be built-in or loaded as kernel modules.',
      examples: ['ext4', 'NTFS', 'FAT32', 'tmpfs', 'NFS', 'Btrfs', 'XFS']
    },
    {
      id: 'page', label: 'Page Cache / Buffer Cache', color: '#f59e0b',
      desc: 'Caches file data and metadata in RAM. Reads check cache first. Writes go to cache (write-back). Dramatically reduces disk I/O.',
      examples: ['page cache', 'dirty pages', 'readahead', 'writeback']
    },
    {
      id: 'block', label: 'Block Device Layer', color: '#ef4444',
      desc: 'Generic block I/O layer. I/O scheduler. Block device abstraction over different hardware. Handles request merging and reordering.',
      examples: ['bio requests', 'I/O scheduler', 'request queue', 'elevator']
    },
    {
      id: 'driver', label: 'Device Drivers', color: '#f97316',
      desc: 'Hardware-specific code. NVMe driver, SATA driver, USB storage driver. Translates block requests into device commands.',
      examples: ['nvme driver', 'ahci driver', 'usb-storage', 'virtio-blk']
    },
  ]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>VFS Layer Architecture</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Click any layer to see details about its role.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {layers.map(function(l) {
            return (
              <div key={l.id} onClick={function() { setHighlighted(highlighted === l.id ? null : l.id) }} style={{ background: highlighted === l.id ? l.color + '33' : l.color + '18', border: '2px solid ' + (highlighted === l.id ? l.color : l.color + '44'), borderRadius: 8, padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: 700, color: l.color, fontSize: 13 }}>{l.label}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {l.examples.map(function(ex) {
                    return <span key={ex} style={{ fontSize: 10, background: l.color + '22', color: l.color, padding: '1px 6px', borderRadius: 4 }}>{ex}</span>
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {highlighted
            ? (function() {
                const l = layers.find(function(x) { return x.id === highlighted })
                return (
                  <div>
                    <div style={{ fontWeight: 700, color: l.color, fontSize: 16, marginBottom: 12 }}>{l.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{l.desc}</div>
                  </div>
                )
              })()
            : <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Click a layer to see its description</div>
          }
        </div>
      </div>
    </div>
  )
}

function MountSimulator() {
  const [mounts, setMounts] = useState([
    { path: '/', device: '/dev/sda1', fstype: 'ext4', options: 'rw,relatime' },
    { path: '/boot', device: '/dev/sda2', fstype: 'ext4', options: 'rw,relatime' },
    { path: '/proc', device: 'proc', fstype: 'proc', options: 'rw,nosuid' },
    { path: '/sys', device: 'sysfs', fstype: 'sysfs', options: 'rw,nosuid' },
    { path: '/tmp', device: 'tmpfs', fstype: 'tmpfs', options: 'rw,size=2G' },
  ])
  const [newPath, setNewPath] = useState('/mnt/usb')
  const [newDevice, setNewDevice] = useState('/dev/sdb1')
  const [newFs, setNewFs] = useState('vfat')
  const [log, setLog] = useState([])

  function mount() {
    if (!newPath || !newDevice) return
    if (mounts.find(function(m) { return m.path === newPath })) {
      setLog(function(l) { return [...l, { msg: 'mount: ' + newPath + ': already mounted', color: '#ef4444' }] })
      return
    }
    setMounts(function(m) { return [...m, { path: newPath, device: newDevice, fstype: newFs, options: 'rw,relatime' }] })
    setLog(function(l) { return [...l, { msg: 'Mounted ' + newDevice + ' on ' + newPath + ' type ' + newFs, color: '#10b981' }] })
  }

  function umount(path) {
    if (path === '/') { setLog(function(l) { return [...l, { msg: 'umount: /: target is busy', color: '#ef4444' }] }); return }
    setMounts(function(m) { return m.filter(function(x) { return x.path !== path }) })
    setLog(function(l) { return [...l, { msg: 'Unmounted ' + path, color: '#f59e0b' }] })
  }

  const fsColors = { ext4: '#3b82f6', vfat: '#f59e0b', proc: '#8b5cf6', sysfs: '#10b981', tmpfs: '#06b6d4', nfs: '#ef4444', ntfs: '#f97316' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Mount Table Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Mount and unmount file systems. See how the mount table is updated.</p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Currently mounted file systems:</div>
        <div style={{ background: '#0d1117', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 80px', gap: 0, borderBottom: '1px solid #30363d', padding: '6px 12px' }}>
            {['Device', 'Mount Point', 'Type', 'Options', ''].map(function(h) {
              return <div key={h} style={{ fontSize: 11, color: '#8b949e', fontWeight: 700 }}>{h}</div>
            })}
          </div>
          {mounts.map(function(m) {
            const color = fsColors[m.fstype] || '#6e7681'
            return (
              <div key={m.path} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 80px', gap: 0, borderBottom: '1px solid #21262d', padding: '8px 12px', alignItems: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3' }}>{m.device}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#06b6d4' }}>{m.path}</div>
                <div style={{ fontSize: 11, background: color + '22', color: color, padding: '2px 6px', borderRadius: 6, width: 'fit-content', fontWeight: 700 }}>{m.fstype}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6e7681' }}>{m.options}</div>
                <button onClick={function() { umount(m.path) }} style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>umount</button>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Mount Point</div>
          <input value={newPath} onChange={function(e) { setNewPath(e.target.value) }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Device</div>
          <input value={newDevice} onChange={function(e) { setNewDevice(e.target.value) }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>FS Type</div>
          <select value={newFs} onChange={function(e) { setNewFs(e.target.value) }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12 }}>
            {['ext4', 'vfat', 'ntfs', 'nfs', 'tmpfs', 'xfs', 'btrfs'].map(function(f) { return <option key={f} value={f}>{f}</option> })}
          </select>
        </div>
        <button onClick={mount} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>mount</button>
      </div>

      {log.length > 0 && (
        <div style={{ background: '#0d1117', borderRadius: 8, padding: 10, maxHeight: 100, overflowY: 'auto' }}>
          {log.map(function(line, i) {
            return <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: line.color, lineHeight: 1.8 }}>{line.msg}</div>
          })}
        </div>
      )}
    </div>
  )
}

export default function Chapter15() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #06b6d444', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#06b6d4', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 15</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🌐</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>File-System Internals</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          VFS, mounting, directory implementation, shared files, remote file systems, NFS, and consistency semantics.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['VFS Layer Diagram', 'Mount Simulator', 'NFS Protocol', 'Consistency Semantics', 'Directory Hash Tables'].map(function(f) {
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

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.1 File System Structure</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How file systems are organized as layered structures within the OS.</p>

              <InfoBox color="#06b6d4">
                A file system provides the mechanisms for both <strong>online storage</strong> and <strong>access to file contents</strong>. It is organized in layers — each layer uses features from lower layers to provide new features to higher layers.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>File System Layers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, maxWidth: 500 }}>
                {[
                  { layer: 'Application Programs', color: '#3b82f6', detail: 'read(), write(), open(), stat()' },
                  { layer: 'Logical File System', color: '#8b5cf6', detail: 'File Control Blocks, protection, naming' },
                  { layer: 'File Organization Module', color: '#06b6d4', detail: 'logical-to-physical block translation' },
                  { layer: 'Basic File System', color: '#10b981', detail: '"read block 472", "write block 891"' },
                  { layer: 'I/O Control', color: '#f59e0b', detail: 'device drivers, interrupt handlers' },
                  { layer: 'Devices', color: '#6e7681', detail: 'HDD, SSD, NVMe, USB drives' },
                ].map(function(l) {
                  return (
                    <div key={l.layer} style={{ background: l.color + '22', border: '1px solid ' + l.color + '44', borderRadius: 6, padding: '9px 14px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: l.color, fontSize: 13 }}>{l.layer}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.detail}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>File System Types</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { type: 'Disk-based', color: '#3b82f6', examples: 'ext4, NTFS, FAT32, XFS, Btrfs, ZFS', desc: 'Traditional file systems storing data on persistent storage. Survive power loss.' },
                  { type: 'Virtual / In-memory', color: '#10b981', examples: 'tmpfs, /proc, /sys, devtmpfs', desc: 'No physical backing. Data exists only in memory. Fast but non-persistent. /proc exposes kernel data structures as files.' },
                  { type: 'Network', color: '#f59e0b', examples: 'NFS, SMB/CIFS, AFS, SSHFS', desc: 'Access files on remote servers. Transparent to applications. Handle network failures, caching consistency.' },
                  { type: 'Stacked', color: '#8b5cf6', examples: 'OverlayFS, eCryptfs, UnionFS', desc: 'Layers on top of other file systems. OverlayFS used by Docker. eCryptfs provides transparent encryption.' },
                ].map(function(t) {
                  return (
                    <div key={t.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: t.color, marginBottom: 6, fontSize: 13 }}>{t.type}</div>
                      <div style={{ fontSize: 11, color: t.color, marginBottom: 6, background: t.color + '18', padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>{t.examples}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux /proc and /sys:</strong> /proc is a virtual file system that exposes kernel data structures as readable files. /proc/cpuinfo shows CPU details, /proc/meminfo shows memory stats, /proc/[pid]/maps shows a process's memory map. /sys is similar but more structured — exposes device and driver information following a strict hierarchy. These "files" have no disk backing — reading them calls kernel functions that generate the content dynamically.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>OverlayFS and Docker:</strong> OverlayFS layers two directories: a read-only "lower" layer and a writable "upper" layer. Reads check upper first, fall back to lower. Writes go to upper (COW). Docker uses OverlayFS to implement container images: image layers are read-only (shared between containers), the container's writable layer is on top. This is why docker images are small to download — they share base layers.
              </LearnMore>

              <NavButtons next={function() { setActive('operations') }} nextLabel="15.2 FS Operations →" />
            </div>
          )}

          {active === 'operations' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.2 File System Operations</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How file systems are created, mounted, and used.</p>

              <InfoBox color="#10b981">
                Before a file system can be used, it must be <strong>created</strong> (formatted) and <strong>mounted</strong>. The OS maintains a mount table of all active mounts. Path resolution crosses mount points transparently.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Creating a File System</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}># Create a new ext4 file system on /dev/sdb1</div>
                  <div style={{ color: '#3fb950' }}>$ mkfs.ext4 /dev/sdb1</div>
                  <div style={{ color: '#8b949e' }}># Creates: superblock, inode table, block groups, root directory</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Create FAT32 for USB drive</div>
                  <div style={{ color: '#3fb950' }}>$ mkfs.vfat -F 32 /dev/sdc1</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Create XFS for high-performance storage</div>
                  <div style={{ color: '#3fb950' }}>$ mkfs.xfs /dev/sdd1</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Mounting</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Mounting attaches a file system to the directory tree at a <strong>mount point</strong>. After mounting, the mount point directory shows the contents of the mounted file system. The original contents of the mount point directory are hidden while something is mounted on it.
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}># Mount a device</div>
                  <div style={{ color: '#3fb950' }}>$ mount /dev/sdb1 /mnt/data</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Mount with options</div>
                  <div style={{ color: '#3fb950' }}>$ mount -o ro,noexec /dev/sdc1 /mnt/usb</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Mount NFS share</div>
                  <div style={{ color: '#3fb950' }}>$ mount -t nfs server:/export /mnt/nfs</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Unmount</div>
                  <div style={{ color: '#3fb950' }}>$ umount /mnt/data</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Persistent mounts in /etc/fstab</div>
                  <div>/dev/sdb1  /mnt/data  ext4  defaults  0  2</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Mount Table</h3>
              <InfoBox color="#8b5cf6">
                The OS maintains a <strong>mount table</strong> — one entry per mounted file system. Each entry contains: device name, mount point path, file system type, mount options, and a pointer to the in-memory superblock. When resolving a path, the VFS checks the mount table at each directory component — if the current directory is a mount point, switch to the mounted file system's root.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Mount Simulator</h3>
              <MountSimulator />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Bind mounts:</strong> Linux supports bind mounts — mounting a directory on another location in the tree. "mount --bind /home/alice /tmp/alice" makes /home/alice accessible at both paths. Used extensively in containers: bind mount host directories into the container's filesystem namespace. systemd uses bind mounts to implement private /tmp directories per service.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Mount namespaces (containers):</strong> Linux mount namespaces allow each process group to have its own mount table. A container sees its own root filesystem, private /proc, private /tmp — completely isolated from the host. When you run docker run, the container process gets a new mount namespace with the image's OverlayFS as root. The host filesystem is completely invisible to the container (unless explicitly bind-mounted in).
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 15.1 Overview" next={function() { setActive('directory') }} nextLabel="15.3 Directory Implementation →" />
            </div>
          )}

          {active === 'directory' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.3 Directory Implementation</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How directories are stored and searched efficiently on disk.</p>

              <InfoBox color="#f59e0b">
                A directory maps file <strong>names</strong> to <strong>inode numbers</strong>. The data structure used for this mapping dramatically affects performance — especially for directories with many files.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Linear List</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  Directory entries stored as a simple list of (filename, inode_number) pairs. To find a file, scan from the beginning until the name is found.
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                  <div>[file.txt, 394521] [image.png, 394522] [script.sh, 394523] [data.csv, 394524] ...</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Simple to implement</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ O(n) lookup — slow for large dirs</div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Easy to iterate all files</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Requires linear scan for search/delete</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Hash Table</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  Hash the file name to find the bucket. Each bucket is a small linked list for collision handling. O(1) average lookup, O(n) worst case (all collisions).
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                  <div>hash("file.txt") = 3  → bucket[3] → [file.txt, 394521]</div>
                  <div>hash("image.png") = 7 → bucket[7] → [image.png, 394522]</div>
                  <div>hash("data.csv") = 3  → bucket[3] → [file.txt, 394521] → [data.csv, 394524]</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ O(1) average lookup</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Collisions degrade performance</div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Much faster for large directories</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Rehashing when table grows</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>B-Tree / HTree</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  Used by ext4 (HTree — hash tree), NTFS (B-tree), HFS+ (B-tree). O(log n) lookup and insertion. Maintains sorted order. Scales to millions of files per directory.
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                  <div style={{ color: '#8b949e' }}>/* ext4 HTree: hash values organized as B-tree */</div>
                  <div>Root block: [hash_range_1 → leaf1] [hash_range_2 → leaf2] ...</div>
                  <div>Leaf block: [hash1, inode1] [hash2, inode2] ...</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ O(log n) guaranteed</div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Scales to millions of files</div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Used by production file systems</div>
                  <div style={{ fontSize: 12, color: '#ef4444' }}>✗ More complex to implement</div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Structure', 'Lookup', 'Insert', 'Delete', 'Used by'].map(function(h) {
                        return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Linear list', 'O(n)', 'O(1)', 'O(n)', 'FAT, simple FSes'],
                      ['Hash table', 'O(1) avg', 'O(1) avg', 'O(1) avg', 'Early Unix'],
                      ['B-tree/HTree', 'O(log n)', 'O(log n)', 'O(log n)', 'ext4, NTFS, HFS+'],
                    ].map(function(row) {
                      return (
                        <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#06b6d4' }}>{row[0]}</td>
                          {row.slice(1).map(function(cell, i) {
                            return <td key={i} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{cell}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>ext4 large directory support:</strong> By default, ext4 uses a linear list for small directories (faster for few files). When a directory grows beyond a threshold (typically when the directory block fills up), ext4 automatically converts to HTree format. The conversion is transparent. This adaptive approach gives best performance for both small and large directories.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Directory entry format in ext4:</strong> Each directory entry is variable length: inode number (4 bytes), record length (2 bytes), name length (1 byte), file type (1 byte), and name (variable, up to 255 bytes). Entries are aligned to 4-byte boundaries. Deleted entries are merged with the next entry by increasing the previous entry's record length — space is reclaimed lazily.
              </LearnMore>

              <NavButtons prev={function() { setActive('operations') }} prevLabel="← 15.2 Operations" next={function() { setActive('shared') }} nextLabel="15.4 Shared Files →" />
            </div>
          )}

          {active === 'shared' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.4 Shared Files</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Hard links, symbolic links, and the challenges of sharing files.</p>

              <InfoBox color="#8b5cf6">
                Sharing files between users and processes is essential. Unix implements sharing through <strong>hard links</strong> (multiple directory entries pointing to the same inode) and <strong>symbolic links</strong> (a file containing a path string to another file).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Hard Links — Two-Way Consistency</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                  A hard link creates a second directory entry pointing to the same inode. Both names are equal — neither is "the original." The inode has a <strong>link count</strong> that tracks how many directory entries point to it. The file is deleted only when link count reaches zero AND no process has it open.
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.9, marginBottom: 12 }}>
                  <div>$ ln /home/alice/file.txt /home/bob/shared.txt</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>Directory entries:</div>
                  <div>/home/alice/file.txt → inode 394521 (link_count=2)</div>
                  <div>/home/bob/shared.txt → inode 394521 (link_count=2)</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>$ rm /home/alice/file.txt  → link_count=1, data preserved!</div>
                  <div style={{ color: '#8b949e' }}>$ rm /home/bob/shared.txt  → link_count=0, inode freed!</div>
                </div>
                <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                  Limitation: Hard links cannot span file system boundaries (different inodes for each FS). Cannot hard link to directories (would create cycles in the directory graph).
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Symbolic Links — Flexible but Fragile</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                  A symbolic link is a special file containing a pathname string. When accessed, the OS resolves the path and follows it to the target. Can cross file system boundaries. Can point to directories. The downside: can become a dangling link if the target is deleted.
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.9, marginBottom: 12 }}>
                  <div>$ ln -s /home/alice/file.txt /home/bob/shared.txt</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>Inode for symlink: type=symlink, content="/home/alice/file.txt"</div>
                  <div></div>
                  <div>$ cat /home/bob/shared.txt</div>
                  <div style={{ color: '#8b949e' }}># OS reads symlink, resolves to /home/alice/file.txt, reads that</div>
                  <div></div>
                  <div>$ rm /home/alice/file.txt</div>
                  <div>$ cat /home/bob/shared.txt</div>
                  <div style={{ color: '#ef4444' }}>cat: /home/bob/shared.txt: No such file or directory  ← dangling!</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Comparison</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  {
                    type: 'Hard Link', color: '#3b82f6',
                    props: [
                      ['Same inode', true],
                      ['Can span file systems', false],
                      ['Can link to directories', false],
                      ['Dangling links possible', false],
                      ['Extra inode needed', false],
                      ['ls -l shows link count', true],
                    ]
                  },
                  {
                    type: 'Symbolic Link', color: '#10b981',
                    props: [
                      ['Different inode', true],
                      ['Can span file systems', true],
                      ['Can link to directories', true],
                      ['Dangling links possible', true],
                      ['Extra inode needed', true],
                      ['readlink shows target', true],
                    ]
                  }
                ].map(function(t) {
                  return (
                    <div key={t.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: t.color, marginBottom: 10 }}>{t.type}</div>
                      {t.props.map(function(p) {
                        return <div key={p[0]} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{p[1] ? '✓' : '✗'} {p[0]}</div>
                      })}
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Symlink loops:</strong> Symbolic links can create loops — A points to B, B points to A. The OS must detect and handle this. Linux counts symlink resolutions during path traversal — if more than 40 symlinks are followed (MAXSYMLINKS), it returns ELOOP. This prevents infinite loops without requiring cycle detection algorithms.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Fast symlinks in ext4:</strong> If the symlink target path is short enough (up to 60 bytes), ext4 stores the path directly in the inode itself (in the block pointer area) instead of allocating a data block. This makes short symlink resolution extremely fast — no extra disk read needed. Most symlinks in practice (/usr/bin/python → python3.10) are short enough to benefit from this optimization.
              </LearnMore>

              <NavButtons prev={function() { setActive('directory') }} prevLabel="← 15.3 Directories" next={function() { setActive('vfs') }} nextLabel="15.5 Virtual File System →" />
            </div>
          )}

          {active === 'vfs' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.5 Virtual File System (VFS)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The abstraction layer that unifies all file system types under one interface.</p>

              <InfoBox color="#06b6d4">
                The <strong>VFS</strong> provides an object-oriented way to implement file systems. It defines a set of objects (superblock, inode, dentry, file) with standardized operations. Each concrete file system implements these operations. This allows the same system calls to work on any file system type.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>VFS Objects</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { obj: 'superblock', color: '#3b82f6', desc: 'Represents a mounted file system. Contains: file system type, block size, max file size, root inode, operations table pointer. Created on mount, destroyed on unmount.' },
                  { obj: 'inode', color: '#10b981', desc: 'Represents a file (in memory). Contains: inode number, file size, permissions, timestamps, link count, pointer to data blocks. Cached in inode cache. Created on file open, freed when last reference released.' },
                  { obj: 'dentry', color: '#f59e0b', desc: 'Represents a directory entry — maps a name to an inode. Cached in dentry cache (dcache). Used for path resolution. Even negative dentries (files that do NOT exist) are cached to speed up "file not found" lookups.' },
                  { obj: 'file', color: '#8b5cf6', desc: 'Represents an open file. Contains: current file offset, access mode, pointer to dentry, pointer to file operations. One per open file descriptor. Created by open(), destroyed by close().' },
                ].map(function(o) {
                  return (
                    <div key={o.obj} style={{ background: 'var(--bg-card)', border: '1px solid ' + o.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: o.color, marginBottom: 6, fontSize: 14 }}>{o.obj}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{o.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>VFS Operations</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* VFS operations — each file system must implement */</div>
                  <div>struct super_operations {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>read_inode(), write_inode(), put_inode()</div>
                  <div style={{ paddingLeft: 16 }}>statfs(), remount_fs(), umount_begin()</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>struct inode_operations {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>create(), lookup(), link(), unlink()</div>
                  <div style={{ paddingLeft: 16 }}>symlink(), mkdir(), rmdir(), rename()</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>struct file_operations {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>open(), release(), read(), write()</div>
                  <div style={{ paddingLeft: 16 }}>llseek(), mmap(), fsync(), ioctl()</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>VFS Layer Diagram</h3>
              <VFSLayerDiagram />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Dentry cache (dcache):</strong> The dentry cache is one of the most important performance optimizations in Linux. It caches the result of directory lookups so repeated path resolutions do not require disk reads. A lookup of /home/alice/file.txt involves resolving /, home, alice, and file.txt — four directory reads without dcache. With dcache, all four are typically in memory. The dcache can be hundreds of MB on a busy system. You can see its size with "cat /proc/meminfo | grep Slab".
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Implementing a file system in Linux:</strong> To write a Linux kernel file system, you register a file_system_type with register_filesystem(). Implement fill_super() to set up the superblock on mount. Provide inode_operations and file_operations structs with your implementations. For read-only file systems, you only need about 200 lines of C code. The Linux kernel tree has a "simple" file system helper library that handles common operations.
              </LearnMore>

              <NavButtons prev={function() { setActive('shared') }} prevLabel="← 15.4 Shared Files" next={function() { setActive('remote') }} nextLabel="15.6 Remote File Systems →" />
            </div>
          )}

          {active === 'remote' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.6 Remote File Systems</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Accessing files stored on remote servers transparently.</p>

              <InfoBox color="#f97316">
                Remote file systems allow a client machine to access files stored on a server as if they were local. The network adds complexity: <strong>latency</strong>, <strong>failures</strong>, <strong>partial failures</strong>, and <strong>caching consistency</strong> challenges that do not exist for local file systems.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Client-Server Model</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #f9731644', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ background: '#3b82f622', border: '1px solid #3b82f644', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>💻</div>
                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>Client</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mounts remote FS. Issues file operations. Caches data locally.</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#f97316', fontSize: 12, fontWeight: 600 }}>RPC over</div>
                    <div style={{ color: '#f97316', fontSize: 20 }}>⟷</div>
                    <div style={{ color: '#f97316', fontSize: 12, fontWeight: 600 }}>Network</div>
                  </div>
                  <div style={{ background: '#10b98122', border: '1px solid #10b98144', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🖥️</div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>Server</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stores actual files. Handles read/write requests. May be stateless.</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Failure Modes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { failure: 'Network failure', color: '#ef4444', handle: 'Retry with timeout. Mark file system as unavailable. Return ESTALE or EIO to applications.' },
                  { failure: 'Server crash', color: '#f59e0b', handle: 'If stateless (NFS): client just retries. If stateful: need server recovery protocol, replay pending operations.' },
                  { failure: 'Partial failure', color: '#8b5cf6', handle: 'Write may have succeeded on server but acknowledgment lost. Idempotent operations (can retry safely) essential for correctness.' },
                  { failure: 'Network partition', color: '#3b82f6', handle: 'Some clients see server, others do not. Distributed consensus needed for consistency. Most NFS deployments accept temporary inconsistency.' },
                ].map(function(f) {
                  return (
                    <div key={f.failure} style={{ background: 'var(--bg-card)', border: '1px solid ' + f.color + '33', borderLeft: '4px solid ' + f.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: f.color, marginBottom: 6, fontSize: 13 }}>{f.failure}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.handle}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Remote File System Protocols</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { name: 'NFS (Network File System)', color: '#3b82f6', desc: 'Sun Microsystems, 1984. UDP/TCP. Stateless server (NFSv3), stateful (NFSv4). Standard on Unix/Linux.' },
                  { name: 'SMB/CIFS', color: '#10b981', desc: 'Server Message Block. Windows file sharing. Samba implements SMB on Linux. Used for Windows shares accessed from Linux/Mac.' },
                  { name: 'AFS (Andrew File System)', color: '#8b5cf6', desc: 'Carnegie Mellon. Whole-file caching. Session semantics. Scales to large networks. Basis for OpenAFS.' },
                  { name: 'SSHFS', color: '#f59e0b', desc: 'SSH File System. FUSE-based. Mount remote directory over SSH. Easy to use, no server config needed. Slower than NFS.' },
                ].map(function(p) {
                  return (
                    <div key={p.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + p.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: p.color, marginBottom: 6, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>NFS caching dilemma:</strong> NFS clients cache file data locally for performance. But if two clients modify the same file concurrently, their caches become inconsistent. NFSv3 uses "close-to-open" consistency — on open, check if server's mtime is newer than cached version, if so invalidate cache. On close, flush dirty data to server. This gives reasonable consistency for typical workloads but does not prevent all races.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>NFSv4 and stateful operations:</strong> NFSv4 introduced stateful operations including file locking, delegations (client told it can cache file exclusively until revoked), and compound operations (batch multiple RPCs into one network round-trip). NFSv4.1 added pNFS (parallel NFS) — clients can stripe data across multiple storage servers simultaneously, achieving much higher throughput than a single NFS server.
              </LearnMore>

              <NavButtons prev={function() { setActive('vfs') }} prevLabel="← 15.5 VFS" next={function() { setActive('consistency') }} nextLabel="15.7 Consistency →" />
            </div>
          )}

          {active === 'consistency' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.7 Consistency Semantics</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Rules for when writes become visible to other processes or clients.</p>

              <InfoBox color="#10b981">
                When multiple processes or clients share a file, <strong>consistency semantics</strong> specify when writes by one user are visible to other users. Different file systems provide different guarantees — trading off performance for consistency.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Unix Semantics (POSIX)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    A write to an open file is <strong>immediately visible</strong> to any other process that has the same file open. All processes that open the same file share a single actual image of the file. Writes go directly to the shared file image.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>P1: write(fd, "Hello") → immediately visible to P2</div>
                    <div>P2: read(fd, ...) → reads "Hello" immediately</div>
                    <div style={{ color: '#10b981' }}>Strong consistency — used by all local file systems</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Session Semantics (AFS)</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Changes to a file are <strong>not visible to other processes until the file is closed</strong>. On close, changes are written to the server. On subsequent open, the latest version is fetched. Simple to implement with whole-file caching.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>P1: write(fd, "Hello") → only in P1's local cache</div>
                    <div>P2: read(fd, ...)   → reads OLD version (before P1's write)</div>
                    <div>P1: close(fd)       → writes "Hello" to server</div>
                    <div>P2: close+reopen    → now reads "Hello"</div>
                    <div style={{ color: '#f59e0b' }}>Weaker — but enables aggressive caching for performance</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Immutable-Shared-Files Semantics</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Once a file is declared shared, it <strong>cannot be modified</strong>. Creator declares file immutable before sharing. Any write attempt creates a new version. Very simple consistency — shared files never change so no consistency problem. Used in some distributed systems and content-addressed storage.
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Perfect read consistency</span>
                    <span style={{ color: '#10b981' }}>✓ Safe aggressive caching</span>
                    <span style={{ color: '#ef4444' }}>✗ Cannot update shared files</span>
                  </div>
                </div>

              </div>

              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Semantics', 'Write Visibility', 'Caching', 'Used by'].map(function(h) {
                        return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Unix/POSIX', 'Immediate', 'Write-through or write-back with coherence', 'ext4, NTFS, local FSes'],
                      ['Session', 'On close', 'Whole-file caching', 'AFS, some NFS configs'],
                      ['Immutable', 'N/A (no writes)', 'Cache forever', 'Git objects, CAS systems'],
                      ['Transactional', 'On commit', 'Per-transaction', 'Databases, DBFS'],
                    ].map(function(row) {
                      return (
                        <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#06b6d4' }}>{row[0]}</td>
                          {row.slice(1).map(function(cell, i) {
                            return <td key={i} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{cell}</td>
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Content-addressed storage (CAS) and immutability:</strong> Git is built on immutable content-addressed storage. Every object (file, tree, commit) is identified by its SHA-1 hash of its content. Objects are immutable — you never modify an existing object, only create new ones. This gives perfect consistency: the same hash always refers to the same content. Branching and merging are O(1) — just update pointers (branch refs).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Distributed file system consistency challenges:</strong> Google File System (GFS) and HDFS (Hadoop) chose to relax consistency for performance at scale. GFS uses "relaxed consistency" — concurrent writes to the same chunk may interleave. Applications must be designed to tolerate this (e.g., append-only logs). For strong consistency at scale, Google Spanner uses TrueTime (GPS + atomic clocks) to provide globally consistent timestamps for distributed transactions.
              </LearnMore>

              <NavButtons prev={function() { setActive('remote') }} prevLabel="← 15.6 Remote FS" next={function() { setActive('nfs') }} nextLabel="15.8 NFS Case Study →" />
            </div>
          )}

          {active === 'nfs' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>15.8 NFS Case Study</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The Network File System — a real-world distributed file system implementation.</p>

              <InfoBox color="#3b82f6">
                <strong>NFS</strong> (Network File System) was developed by Sun Microsystems in 1984 and is now the de facto standard network file system for Unix/Linux. It allows a remote file system to be mounted and appear as a local directory.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>NFS Design Goals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { goal: 'Machine and OS independence', color: '#3b82f6', desc: 'NFS server can run on any OS. Client can run any OS. Standard protocol over TCP/UDP.' },
                  { goal: 'Crash recovery', color: '#10b981', desc: 'Server is stateless — it does not remember which files clients have open. If server crashes and restarts, clients can simply retry and continue without restarting.' },
                  { goal: 'Transparent access', color: '#f59e0b', desc: 'Client applications see NFS files as local files — same system calls, same semantics (mostly). No application changes needed.' },
                  { goal: 'Reasonable performance', color: '#8b5cf6', desc: 'Client-side caching of file data and attributes. Read-ahead. Write buffering. Typically achieves 80% of local disk performance for many workloads.' },
                ].map(function(g) {
                  return (
                    <div key={g.goal} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + g.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: g.color, fontSize: 13, minWidth: 200 }}>{g.goal}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>NFS Architecture</h3>
              <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* NFS Client Side */</div>
                  <div>Application → VFS → NFS client module → RPC layer → Network</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* NFS Server Side */</div>
                  <div>Network → RPC layer → NFS server module → VFS → Local FS (ext4, etc.)</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* File Handle format (NFSv3) */</div>
                  <div>{'{ fs_id: 42, inode: 394521, generation: 5 }'}</div>
                  <div style={{ color: '#8b949e' }}>/* generation detects inode reuse after deletion */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>NFS Operations (RPC calls)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                {[
                  { op: 'GETATTR', desc: 'Get file attributes (stat)' },
                  { op: 'SETATTR', desc: 'Set file attributes (chmod, chown)' },
                  { op: 'LOOKUP', desc: 'Look up a file in a directory' },
                  { op: 'READ', desc: 'Read data from a file' },
                  { op: 'WRITE', desc: 'Write data to a file' },
                  { op: 'CREATE', desc: 'Create a file' },
                  { op: 'REMOVE', desc: 'Delete a file' },
                  { op: 'READDIR', desc: 'Read directory entries' },
                  { op: 'MKDIR', desc: 'Create a directory' },
                  { op: 'RENAME', desc: 'Rename a file' },
                ].map(function(op) {
                  return (
                    <div key={op.op} style={{ background: 'var(--bg-card)', border: '1px solid #3b82f633', borderRadius: 6, padding: '8px 12px', display: 'flex', gap: 10 }}>
                      <code style={{ fontFamily: 'monospace', color: '#3b82f6', fontWeight: 700, fontSize: 12, minWidth: 80 }}>{op.op}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{op.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>NFS Caching</h3>
              <InfoBox color="#f59e0b">
                NFS clients cache file data and attributes locally. This is essential for performance but creates consistency challenges. NFSv3 uses a simple approach:
                <br />• Cached attributes are considered valid for a few seconds (configurable)
                <br />• Before using cached data, check if server's mtime is newer
                <br />• If newer, invalidate local cache and re-read from server
                <br />• This is called "close-to-open" consistency — weak but practical
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>NFS tuning:</strong> Key mount options: rsize/wsize (read/write buffer sizes — use 1MB for NFS over GigE), actimeo (attribute cache timeout), noatime (don't update atime on reads — reduces server writes), hard vs soft mounts (hard: retry forever on failure — safe but can hang; soft: return error after timeout — responsive but risks data loss). For high-performance NFS, use NFSv4.1 with multiple connections (nconnect=8 mount option).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>NFS security:</strong> NFSv3 traditionally uses AUTH_SYS — the client simply tells the server the user's UID/GID. The server trusts this without verification — anyone with root access on the client can impersonate any user. NFSv4 with Kerberos (sec=krb5) provides real authentication. NFSv4 also supports ACLs compatible with Windows NTFS ACLs, making mixed Unix/Windows environments easier to manage.
              </LearnMore>

              <NavButtons prev={function() { setActive('consistency') }} prevLabel="← 15.7 Consistency" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>File System Internals Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for VFS and mount table.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>VFS Layer Architecture</h3>
              <VFSLayerDiagram />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Mount Table Simulator</h3>
              <MountSimulator />

              <NavButtons prev={function() { setActive('nfs') }} prevLabel="← 15.8 NFS" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — File System Internals</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore VFS, mounts, and NFS through code and terminal.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#06b6d4' }}>Lab 1 — File System Python Operations</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['mount',                       'Show all mounted file systems'],
                  ['findmnt',                      'Show mount tree'],
                  ['cat /proc/mounts',             'Kernel mount table'],
                  ['cat /proc/filesystems',        'Supported file system types'],
                  ['ls -la /proc/self/fd',         'Open file descriptors of current shell'],
                  ['ls -i /etc',                   'Show inode numbers of files in /etc'],
                  ['readlink /proc/self/exe',      'Resolve symlink to current executable'],
                  ['showmount -e localhost',       'Show NFS exports (if NFS running)'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', minWidth: 220, flexShrink: 0 }}>{item[0]}</code>
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 15.</p>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 15!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/16' }} style={{ background: '#06b6d4', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 16 →</button>
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