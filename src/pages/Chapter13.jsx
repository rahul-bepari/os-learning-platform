import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '13.1 File Concept',          icon: '📄' },
  { id: 'attributes',  title: '13.2 File Attributes',       icon: '🏷️' },
  { id: 'operations',  title: '13.3 File Operations',       icon: '⚙️' },
  { id: 'types',       title: '13.4 File Types & Structure', icon: '🗂️' },
  { id: 'access',      title: '13.5 Access Methods',        icon: '🔍' },
  { id: 'directories', title: '13.6 Directory Structure',   icon: '📁' },
  { id: 'protection',  title: '13.7 Protection',            icon: '🔒' },
  { id: 'simulator',   title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is a file from the OS perspective?',
    options: [
      'A contiguous block of disk sectors',
      'A named collection of related information recorded on secondary storage — the smallest logical storage unit',
      'A kernel data structure for managing processes',
      'A network socket for communication'
    ],
    answer: 1,
    explanation: 'A file is the smallest logical storage unit — a named collection of related information. It is the OS abstraction over physical storage. The OS maps the logical file concept to physical storage devices, hiding the hardware details from users and applications.'
  },
  {
    q: 'What is the purpose of the open-file table in the OS?',
    options: [
      'To list all files on disk',
      'To track all currently opened files — stores file position, access mode, and reference count to avoid repeated directory searches',
      'To manage file permissions',
      'To cache disk blocks'
    ],
    answer: 1,
    explanation: 'The open-file table has two levels: a per-process table (file descriptor table) with the current position and access mode, and a system-wide table with the in-memory inode, reference count, and other shared state. This avoids repeated directory searches for every read/write operation.'
  },
  {
    q: 'What is the difference between sequential access and direct (random) access?',
    options: [
      'Sequential is faster for all files',
      'Sequential reads data in order from beginning; direct access allows reading any block in any order by specifying a position',
      'Direct access is only for databases',
      'Sequential access requires more memory'
    ],
    answer: 1,
    explanation: 'Sequential access reads file data from the beginning, one record after another — like a tape. Direct (random) access allows reading block n directly without reading blocks 0 through n-1 first. Databases, video editors, and virtual memory use direct access heavily.'
  },
  {
    q: 'In Unix/Linux, what does a hard link do?',
    options: [
      'Creates a copy of the file',
      'Creates a new directory entry pointing to the same inode — another name for the same file data',
      'Creates a pointer to another filename',
      'Links two processes together'
    ],
    answer: 1,
    explanation: 'A hard link creates a new directory entry with a different name but the same inode number as the original file. Both names point to the same data blocks. The file is only deleted when ALL hard links are removed (reference count reaches zero). Hard links cannot span file systems.'
  },
  {
    q: 'What is an acyclic-graph directory structure used for?',
    options: [
      'Preventing infinite loops in directory traversal',
      'Allowing files and directories to be shared — the same file can appear in multiple directories',
      'Organizing files alphabetically',
      'Implementing file permissions'
    ],
    answer: 1,
    explanation: 'An acyclic-graph directory structure allows sharing — the same file or subdirectory can appear in multiple parent directories via links. It is "acyclic" (no cycles) to prevent infinite loops during traversal. This is how Unix symbolic and hard links work — a file can be accessed from multiple paths.'
  },
  {
    q: 'In Unix permissions "rwxr-x---", what can the group do?',
    options: [
      'Read, write, and execute',
      'Read and execute only',
      'Only read',
      'Nothing'
    ],
    answer: 1,
    explanation: 'Unix permissions are three groups of 3 bits: owner (rwx = read+write+execute), group (r-x = read+execute, no write), others (--- = no permissions). So the group can read and execute the file but cannot write to it.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #14b8a655', color: '#14b8a6', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(20,184,166,0.06)', border: '1px solid #14b8a633', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function PermissionCalculator() {
  const [owner, setOwner] = useState([true, true, true])
  const [group, setGroup] = useState([true, false, true])
  const [others, setOthers] = useState([false, false, false])

  function toggle(who, idx) {
    if (who === 'owner') setOwner(function(p) { return p.map(function(v, i) { return i === idx ? !v : v }) })
    else if (who === 'group') setGroup(function(p) { return p.map(function(v, i) { return i === idx ? !v : v }) })
    else setOthers(function(p) { return p.map(function(v, i) { return i === idx ? !v : v }) })
  }

  function toOctal(perms) { return perms.reduce(function(acc, v, i) { return acc + (v ? [4, 2, 1][i] : 0) }, 0) }
  function toStr(perms) { return (perms[0] ? 'r' : '-') + (perms[1] ? 'w' : '-') + (perms[2] ? 'x' : '-') }

  const octal = '' + toOctal(owner) + toOctal(group) + toOctal(others)
  const symbolic = toStr(owner) + toStr(group) + toStr(others)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Unix Permission Calculator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Click to toggle permissions. See symbolic and octal notation.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Owner (u)', perms: owner, who: 'owner', color: '#3b82f6' },
          { label: 'Group (g)', perms: group, who: 'group', color: '#10b981' },
          { label: 'Others (o)', perms: others, who: 'others', color: '#f59e0b' },
        ].map(function(row) {
          return (
            <div key={row.who} style={{ background: 'var(--bg-secondary)', border: '1px solid ' + row.color + '44', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: row.color, marginBottom: 12, fontSize: 13 }}>{row.label}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                {['r', 'w', 'x'].map(function(bit, i) {
                  return (
                    <button key={bit} onClick={function() { toggle(row.who, i) }} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid ' + (row.perms[i] ? row.color : 'var(--border)'), background: row.perms[i] ? row.color + '33' : 'var(--bg-primary)', color: row.perms[i] ? row.color : 'var(--text-muted)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      {bit}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: row.color }}>{toOctal(row.perms)}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#14b8a618', border: '1px solid #14b8a644', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Symbolic</div>
          <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: '#14b8a6' }}>{symbolic}</div>
        </div>
        <div style={{ background: '#14b8a618', border: '1px solid #14b8a644', borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Octal</div>
          <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: '#14b8a6' }}>{octal}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>chmod command</div>
          <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>chmod {octal} filename</div>
        </div>
      </div>
    </div>
  )
}

function DirectorySimulator() {
  const [structure] = useState({
    name: '/', type: 'dir', children: [
      { name: 'home', type: 'dir', children: [
        { name: 'alice', type: 'dir', children: [
          { name: 'documents', type: 'dir', children: [
            { name: 'thesis.pdf', type: 'file', size: '2.4MB' },
            { name: 'notes.txt', type: 'file', size: '12KB' },
          ]},
          { name: 'photos', type: 'dir', children: [
            { name: 'vacation.jpg', type: 'file', size: '3.1MB' },
          ]},
          { name: '.bashrc', type: 'file', size: '4KB' },
        ]},
        { name: 'bob', type: 'dir', children: [
          { name: 'projects', type: 'dir', children: [] },
        ]},
      ]},
      { name: 'etc', type: 'dir', children: [
        { name: 'passwd', type: 'file', size: '2KB' },
        { name: 'hosts', type: 'file', size: '1KB' },
      ]},
      { name: 'var', type: 'dir', children: [
        { name: 'log', type: 'dir', children: [
          { name: 'syslog', type: 'file', size: '45MB' },
        ]},
      ]},
    ]
  })

  const [expanded, setExpanded] = useState(new Set(['/', '/home', '/home/alice']))
  const [selected, setSelected] = useState(null)

  function toggleDir(path) {
    setExpanded(function(prev) {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  function renderNode(node, path, depth) {
    const fullPath = path + (path === '/' ? '' : '/') + node.name
    const isExpanded = expanded.has(fullPath) || fullPath === '/'
    const isSelected = selected === fullPath
    const isDir = node.type === 'dir'

    return (
      <div key={fullPath}>
        <div
          onClick={function() { if (isDir) toggleDir(fullPath); setSelected(fullPath) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', paddingLeft: (depth * 16 + 8) + 'px', cursor: 'pointer', borderRadius: 6, background: isSelected ? '#14b8a622' : 'transparent', border: isSelected ? '1px solid #14b8a644' : '1px solid transparent' }}
        >
          <span style={{ fontSize: 14 }}>{isDir ? (isExpanded ? '📂' : '📁') : '📄'}</span>
          <span style={{ fontSize: 13, color: isDir ? '#14b8a6' : 'var(--text-secondary)', fontWeight: isDir ? 600 : 400 }}>{node.name}</span>
          {!isDir && node.size && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{node.size}</span>}
        </div>
        {isDir && isExpanded && node.children && node.children.map(function(child) {
          return renderNode(child, fullPath === '/' ? '' : fullPath, depth + 1)
        })}
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Directory Tree Explorer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Click folders to expand/collapse. Explore a typical Linux directory structure.</p>
      <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 12, maxHeight: 320, overflowY: 'auto' }}>
        {renderNode(structure, '', 0)}
      </div>
      {selected && (
        <div style={{ marginTop: 12, background: '#14b8a618', border: '1px solid #14b8a644', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Selected: </span>
          <span style={{ fontFamily: 'monospace', color: '#14b8a6', fontWeight: 700 }}>{selected || '/'}</span>
        </div>
      )}
    </div>
  )
}

export default function Chapter13() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #14b8a644', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#14b8a6', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 13</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>📁</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>File-System Interface</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How users and applications interact with files — file concepts, attributes, operations, directory structures, access methods, and protection.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Permission Calculator', 'Directory Explorer', 'Hard vs Soft Links', 'Access Control', 'File Operations'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(20,184,166,0.1)', border: '1px solid #14b8a633', color: '#14b8a6', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#14b8a6' : 'var(--text-secondary)', background: active === s.id ? 'rgba(20,184,166,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #14b8a6' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.1 File Concept</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What a file is and why the file abstraction is fundamental to computing.</p>

              <InfoBox color="#14b8a6">
                A <strong>file</strong> is a named collection of related information recorded on secondary storage. It is the <strong>smallest logical storage unit</strong>. The OS maps the logical file concept to physical devices, hiding hardware details. Files can represent programs, data, text, images, audio — any information.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>File as an Abstraction</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                From the user's perspective, a file is a simple named container for data. From the OS perspective, a file is a sequence of logical records — bytes, lines, or records. From the hardware perspective, a file is a collection of physical blocks scattered across a disk. The OS hides the physical complexity.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { view: 'User View', color: '#3b82f6', desc: 'A named file with data. Open, read, write, close. Simple and intuitive.' },
                  { view: 'OS View', color: '#14b8a6', desc: 'A sequence of bytes or records. Managed with inode, permissions, timestamps, block pointers.' },
                  { view: 'Hardware View', color: '#f59e0b', desc: 'Physical disk blocks at various LBA addresses. The OS maps logical file structure to physical blocks.' },
                ].map(function(v) {
                  return (
                    <div key={v.view} style={{ background: 'var(--bg-card)', border: '1px solid ' + v.color + '44', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: v.color, marginBottom: 8, fontSize: 13 }}>{v.view}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Open-File Table</h3>
              <InfoBox color="#8b5cf6">
                When a file is opened, the OS creates an entry in the <strong>open-file table</strong> to avoid repeated directory searches.
                <br /><br />
                <strong>Per-process file table:</strong> file descriptor (fd), current position, access mode (r/w/rw), pointer to system table entry.
                <br />
                <strong>System-wide file table:</strong> in-memory inode, open count, file type, lock status.
                <br /><br />
                open() returns a file descriptor (small integer). read(fd, buf, n) and write(fd, buf, n) use this fd.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* File operations in C */</div>
                  <div>int fd = open("file.txt", O_RDONLY);</div>
                  <div style={{ color: '#8b949e' }}>/* fd = 3 (0=stdin, 1=stdout, 2=stderr) */</div>
                  <div></div>
                  <div>char buf[1024];</div>
                  <div>ssize_t n = read(fd, buf, sizeof(buf));</div>
                  <div></div>
                  <div>lseek(fd, 0, SEEK_SET); <span style={{ color: '#8b949e' }}>/* rewind */</span></div>
                  <div></div>
                  <div>close(fd); <span style={{ color: '#8b949e' }}>/* decrement ref count */</span></div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>File descriptors and inheritance:</strong> When a process calls fork(), the child inherits all open file descriptors with the same positions. Both parent and child share the same system-wide table entry — a write by either advances the shared position. This is how shell pipes work: the shell opens a pipe, forks, the child inherits the pipe fd, and writes/reads are coordinated automatically.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Everything is a file in Unix:</strong> Unix extends the file abstraction to almost everything. Regular files, directories, symbolic links, devices (/dev/sda), pipes (|), sockets, and even /proc entries are all accessed via file descriptors with read/write operations. This uniform interface is a key reason for Unix's power and flexibility.
              </LearnMore>

              <NavButtons next={function() { setActive('attributes') }} nextLabel="13.2 File Attributes →" />
            </div>
          )}

          {active === 'attributes' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.2 File Attributes</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The metadata the OS stores about every file.</p>

              <InfoBox color="#3b82f6">
                Every file has associated <strong>attributes</strong> (metadata) stored separately from the file data itself. In Unix/Linux, this metadata is stored in the <strong>inode</strong>. Attributes are critical for file management, security, and integrity.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>File Attributes Table</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { attr: 'Name', color: '#3b82f6', desc: 'Human-readable identifier. The only information kept in human-readable form. Stored in the directory entry, NOT the inode.' },
                  { attr: 'Identifier (Inode)', color: '#8b5cf6', desc: 'Unique tag (inode number) that identifies the file within the file system. Used internally by the OS — not visible to users normally.' },
                  { attr: 'Type', color: '#10b981', desc: 'Regular file, directory, symbolic link, block device, character device, pipe, socket. Stored in inode mode field.' },
                  { attr: 'Location', color: '#f59e0b', desc: 'Pointer to file data on disk — block pointers in the inode (direct, indirect, double indirect, triple indirect).' },
                  { attr: 'Size', color: '#ef4444', desc: 'Current file size in bytes. Also: number of blocks allocated (may differ due to holes in sparse files).' },
                  { attr: 'Protection', color: '#f97316', desc: 'Access control information — Unix rwxrwxrwx bits, ACLs. Who can read, write, execute.' },
                  { attr: 'Timestamps', color: '#14b8a6', desc: 'atime (last access), mtime (last modification of data), ctime (last change of metadata/inode). All stored in inode.' },
                  { attr: 'Link Count', color: '#6e7681', desc: 'Number of hard links pointing to this inode. File is deleted only when count reaches 0 AND no process has it open.' },
                ].map(function(a) {
                  return (
                    <div key={a.attr} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '33', borderLeft: '4px solid ' + a.color, borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 12 }}>
                      <div style={{ fontWeight: 700, color: a.color, fontSize: 13, minWidth: 120 }}>{a.attr}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Viewing File Attributes in Linux</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>$ stat /etc/passwd</div>
                  <div>  File: /etc/passwd</div>
                  <div>  Size: 2847      Blocks: 8    IO Block: 4096</div>
                  <div>Device: 8,1      <span style={{ color: '#f59e0b' }}>Inode: 394521</span>   Links: 1</div>
                  <div>Access: <span style={{ color: '#3b82f6' }}>-rw-r--r--</span>  Uid: 0   Gid: 0</div>
                  <div>Access: 2025-01-15 09:23:11</div>
                  <div>Modify: 2025-01-10 14:02:55</div>
                  <div>Change: 2025-01-10 14:02:55</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Inode structure in ext4:</strong> An ext4 inode is 256 bytes. It contains: file mode (type + permissions), UID, GID, size, timestamps, link count, 15 block pointers (12 direct + 1 indirect + 1 double-indirect + 1 triple-indirect), and extended attributes. The inode does NOT contain the filename — that lives in the directory entry. This separation allows hard links (multiple names for one inode).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Sparse files:</strong> A sparse file has "holes" — regions that contain no data and are not allocated on disk. lseek() past the end of file and writing creates a hole. Reading the hole returns zeros. A 100GB sparse file with only 1MB of actual data uses only 1MB of disk space. Used for VM disk images, database files, and container images.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 13.1 File Concept" next={function() { setActive('operations') }} nextLabel="13.3 File Operations →" />
            </div>
          )}

          {active === 'operations' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.3 File Operations</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The system calls that manipulate files.</p>

              <InfoBox color="#f59e0b">
                A file is an abstract data type. The OS provides system calls to create, read, write, seek, delete, and control files. All file operations go through the kernel — user processes cannot directly access disk.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Core File System Calls</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { call: 'create(name)', color: '#10b981', desc: 'Allocates a new inode. Creates a directory entry with the given name pointing to the inode. Initializes inode with default attributes.' },
                  { call: 'open(name, flags)', color: '#3b82f6', desc: 'Searches directory to find file, checks permissions, loads inode into memory, creates open-file table entry, returns file descriptor.' },
                  { call: 'read(fd, buf, n)', color: '#8b5cf6', desc: 'Reads n bytes from current position. Updates file position. May cause page fault if data not in page cache — triggers disk read.' },
                  { call: 'write(fd, buf, n)', color: '#f59e0b', desc: 'Writes n bytes at current position. Updates file size if needed. Data goes to page cache first (write-back). Updates mtime.' },
                  { call: 'lseek(fd, offset, whence)', color: '#ef4444', desc: 'Repositions file offset. SEEK_SET = absolute, SEEK_CUR = relative, SEEK_END = from end. No I/O occurs — just updates position in open-file table.' },
                  { call: 'close(fd)', color: '#f97316', desc: 'Releases file descriptor. Decrements system-wide reference count. When count reaches 0, flushes dirty data, releases in-memory inode if link count also 0.' },
                  { call: 'delete(name)', color: '#14b8a6', desc: 'Removes directory entry. Decrements inode link count. If link count reaches 0 AND no open file descriptors: frees inode and data blocks.' },
                  { call: 'truncate(fd, length)', color: '#6e7681', desc: 'Sets file size to length. If shorter, frees disk blocks. If longer, creates a hole. Used to clear file contents efficiently.' },
                ].map(function(op) {
                  return (
                    <div key={op.call} style={{ background: 'var(--bg-card)', border: '1px solid ' + op.color + '33', borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 12 }}>
                      <code style={{ fontFamily: 'monospace', fontWeight: 700, color: op.color, fontSize: 12, minWidth: 200, flexShrink: 0 }}>{op.call}</code>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{op.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>File Locking</h3>
              <InfoBox color="#8b5cf6">
                When multiple processes access the same file simultaneously, data corruption can occur. File locking provides mutual exclusion:
                <br /><br />
                <strong>Mandatory locking:</strong> OS enforces the lock — blocked reads/writes automatically. Windows uses mandatory locking by default.
                <br />
                <strong>Advisory locking:</strong> Processes cooperate by checking for locks before accessing. Unix uses advisory locks (flock, fcntl). Processes that ignore locks can still access the file.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Atomic file operations:</strong> A common pattern for safe file updates: write to a temporary file, then rename() it over the original. rename() is atomic in POSIX — readers always see either the old or new version, never a partial update. This is how most text editors and databases safely update files. SQLite, for example, uses this pattern for its WAL (Write-Ahead Logging) mode.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>O_DIRECT and O_SYNC flags:</strong> O_DIRECT bypasses the page cache — data goes directly between user buffer and disk. Used by databases that manage their own caching. O_SYNC makes write() wait until data is on stable storage — every write is durable. O_DSYNC is like O_SYNC but only waits for data (not metadata). Combining these flags gives fine-grained control over durability vs performance.
              </LearnMore>

              <NavButtons prev={function() { setActive('attributes') }} prevLabel="← 13.2 Attributes" next={function() { setActive('types') }} nextLabel="13.4 File Types →" />
            </div>
          )}

          {active === 'types' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.4 File Types and Structure</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How files are typed, structured internally, and how the OS handles different types.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>File Types</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { type: 'Regular files', ext: '.txt .c .jpg .mp4', color: '#3b82f6', desc: 'Contains user data. Can be text (ASCII/UTF-8) or binary. The OS does not interpret the content — it is up to the application.' },
                  { type: 'Directory files', ext: 'no extension', color: '#f59e0b', desc: 'Contains a list of file names and their inode numbers. A special type of file that the OS interprets to provide the directory abstraction.' },
                  { type: 'Symbolic links', ext: 'no extension', color: '#10b981', desc: 'Contains a pathname (string) pointing to another file. The OS resolves the link transparently. Can span file systems. Can be dangling (target deleted).' },
                  { type: 'Block devices', ext: '/dev/sda', color: '#8b5cf6', desc: 'Represents a block storage device. Accessed in fixed-size blocks. The file interface provides uniform access to hardware.' },
                  { type: 'Character devices', ext: '/dev/tty', color: '#ef4444', desc: 'Represents a character device (serial, keyboard, terminal). Byte-stream access. Accessed like a file but directly talks to device driver.' },
                  { type: 'Pipes (FIFOs)', ext: '/tmp/mypipe', color: '#f97316', desc: 'Named pipe for IPC. Data written to one end readable from the other. Used for inter-process communication.' },
                ].map(function(t) {
                  return (
                    <div key={t.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, color: t.color, fontSize: 13 }}>{t.type}</div>
                        <code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>{t.ext}</code>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Internal File Structure</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { structure: 'No structure', color: '#6e7681', desc: 'Sequence of bytes. OS sees no meaning in content. Application interprets entirely. Most common — text files, images, executables.' },
                  { structure: 'Simple record structure', color: '#3b82f6', desc: 'Fixed-length records (lines, fixed-size records). OS can index by record number. Rare in modern systems.' },
                  { structure: 'Complex structure', color: '#8b5cf6', desc: 'Formatted data like ELF executables, PDF, databases. Understood only by specific applications or the OS loader.' },
                ].map(function(s) {
                  return (
                    <div key={s.structure} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '44', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: s.color, marginBottom: 6, fontSize: 13 }}>{s.structure}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Magic Numbers — How the OS Detects File Type</h3>
              <InfoBox color="#f59e0b">
                Most file formats start with a magic number — a fixed sequence of bytes that identifies the format. The OS and applications use this to determine how to handle the file, independent of the file extension.
              </InfoBox>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Common magic numbers */</div>
                  <div>ELF executable: <span style={{ color: '#10b981' }}>7F 45 4C 46</span> (.ELF)</div>
                  <div>PDF:            <span style={{ color: '#10b981' }}>25 50 44 46</span> (%PDF)</div>
                  <div>PNG image:      <span style={{ color: '#10b981' }}>89 50 4E 47</span> (.PNG)</div>
                  <div>ZIP/JAR:        <span style={{ color: '#10b981' }}>50 4B 03 04</span> (PK..)</div>
                  <div>JPEG:           <span style={{ color: '#10b981' }}>FF D8 FF</span></div>
                  <div style={{ color: '#8b949e' }}>/* file command reads magic numbers */</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>ELF file format (Linux executables):</strong> ELF (Executable and Linkable Format) is the standard binary format on Linux. An ELF file has: ELF header (magic, architecture, entry point), program headers (segments for loading: LOAD, DYNAMIC, INTERP), and section headers (for linking: .text, .data, .bss, .symtab). The OS loader reads the ELF header to determine how to load the executable into memory and which dynamic linker to use.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Windows PE format:</strong> Windows executables use the PE (Portable Executable) format — based on COFF. PE files start with the DOS MZ header (legacy) followed by the PE header. The PE header contains: machine type (x86/x64/ARM), section table (.text, .data, .rdata, .bss), import table (DLLs needed), export table (DLL functions), and resource section (icons, strings, version info).
              </LearnMore>

              <NavButtons prev={function() { setActive('operations') }} prevLabel="← 13.3 Operations" next={function() { setActive('access') }} nextLabel="13.5 Access Methods →" />
            </div>
          )}

          {active === 'access' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.5 Access Methods</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Different ways to access data stored in files.</p>

              <InfoBox color="#10b981">
                Information in a file must be accessed and read into memory. Several access methods exist, each suited to different applications and hardware.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {[
                  {
                    method: 'Sequential Access',
                    color: '#3b82f6',
                    icon: '➡️',
                    desc: 'Information is processed in order, one record after another. A read operation reads the next portion of the file and advances the file pointer. The most common access method — used by text editors, compilers, streaming.',
                    ops: ['read_next()', 'write_next()', 'reset() — go back to beginning'],
                    example: 'Reading a text file line by line. Streaming video. Compiler reading source file.',
                  },
                  {
                    method: 'Direct (Random) Access',
                    color: '#10b981',
                    icon: '🎯',
                    desc: 'File is made of fixed-length logical records. Allow programs to read and write records rapidly in any order. The file is viewed as a numbered sequence of blocks — seek to block n directly.',
                    ops: ['read(n)', 'write(n)', 'seek(n)', 'read_next()'],
                    example: 'Database accessing record by primary key. Virtual memory using file as backing store.',
                  },
                  {
                    method: 'Indexed Access',
                    color: '#8b5cf6',
                    icon: '📑',
                    desc: 'Built on top of direct access. A separate index file contains pointers to blocks. To find a record, first search the index, then use the pointer to access the data directly. Used in large databases.',
                    ops: ['search_index(key)', 'read_record(pointer)'],
                    example: 'Database B-tree index. File system directory (name → inode mapping is an index).',
                  },
                ].map(function(m) {
                  return (
                    <div key={m.method} style={{ background: 'var(--bg-card)', border: '1px solid ' + m.color + '44', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 24 }}>{m.icon}</span>
                        <div style={{ fontWeight: 700, color: m.color, fontSize: 15 }}>{m.method}</div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{m.desc}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        {m.ops.map(function(op) {
                          return <code key={op} style={{ fontSize: 11, background: m.color + '18', color: m.color, padding: '2px 8px', borderRadius: 6 }}>{op}</code>
                        })}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Example: {m.example}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Memory-mapped files (mmap):</strong> mmap() maps a file directly into the process's virtual address space. Reading from the mapped address reads file data (via page cache). Writing to the mapped address writes file data. No explicit read/write calls needed — just use pointers. The OS handles page faults to bring in data on demand. Used for: shared memory IPC, loading shared libraries, database buffer pools, and large file processing. Much faster than read/write for random access patterns.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Relative vs absolute file position:</strong> Each process has its own file offset per open file descriptor. After fork(), parent and child share the same file offset if they inherited the same fd. If both open() the same file independently, they have independent offsets. This distinction is critical for understanding Unix pipe behavior and shell redirections.
              </LearnMore>

              <NavButtons prev={function() { setActive('types') }} prevLabel="← 13.4 File Types" next={function() { setActive('directories') }} nextLabel="13.6 Directory Structure →" />
            </div>
          )}

          {active === 'directories' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.6 Directory Structure</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How files are organized and how linking works.</p>

              <InfoBox color="#f97316">
                A <strong>directory</strong> is a collection of nodes containing information about all files. Both the directory structure and the files reside on disk. The directory maps file names to inode numbers.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Directory Structures</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  { name: 'Single-Level Directory', color: '#6e7681', desc: 'All files in one directory. Simple but limited — name collisions between users. Early CP/M and MS-DOS systems.' },
                  { name: 'Two-Level Directory', color: '#3b82f6', desc: 'Separate directory for each user. Users isolated from each other. Limited sharing between users. Early multi-user systems.' },
                  { name: 'Tree-Structured Directory', color: '#10b981', desc: 'Most common today. Arbitrary depth hierarchy. Each directory can contain files and subdirectories. Absolute path (/home/alice/docs) or relative path (../docs). Unix, Windows, macOS all use this.' },
                  { name: 'Acyclic-Graph Directory', color: '#8b5cf6', desc: 'Extension of tree — allows sharing via links. A file can appear in multiple directories. Hard links (same inode) and symbolic links (pointer to path). Unix implements this.' },
                  { name: 'General Graph Directory', color: '#ef4444', desc: 'Allows cycles — directories can point back to ancestors. Requires garbage collection to find unreachable files. Mostly avoided due to complexity. Can cause infinite loops in traversal.' },
                ].map(function(d) {
                  return (
                    <div key={d.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + d.color + '33', borderLeft: '4px solid ' + d.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: d.color, marginBottom: 6, fontSize: 13 }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Hard Links vs Symbolic Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 10 }}>Hard Link</div>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 11, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                    <div>$ ln file.txt hardlink.txt</div>
                    <div>$ ls -i file.txt hardlink.txt</div>
                    <div style={{ color: '#10b981' }}>394521 file.txt</div>
                    <div style={{ color: '#10b981' }}>394521 hardlink.txt</div>
                    <div style={{ color: '#8b949e' }}>/* same inode! */</div>
                  </div>
                  <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 14 }}>
                    <li>Same inode — same physical file</li>
                    <li>Both names equally valid</li>
                    <li>File persists until all links removed</li>
                    <li>Cannot span file systems</li>
                    <li>Cannot link to directories (usually)</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 10 }}>Symbolic (Soft) Link</div>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 11, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                    <div>$ ln -s file.txt symlink.txt</div>
                    <div>$ ls -i file.txt symlink.txt</div>
                    <div style={{ color: '#10b981' }}>394521 file.txt</div>
                    <div style={{ color: '#f59e0b' }}>394599 symlink.txt</div>
                    <div style={{ color: '#8b949e' }}>/* different inodes */</div>
                  </div>
                  <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 14 }}>
                    <li>Different inode — contains a path string</li>
                    <li>OS resolves path on every access</li>
                    <li>Can span file systems</li>
                    <li>Can link to directories</li>
                    <li>Can be dangling (target deleted)</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Directory Explorer</h3>
              <DirectorySimulator />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Path resolution (namei):</strong> When the OS resolves a path like /home/alice/docs/file.txt, it walks each component: start at root inode, look up "home" in root directory, get inode for home, look up "alice" in home directory, get inode for alice, and so on. Each lookup is a directory read operation. With deep paths and many symlinks, this can be expensive. Linux caches this via the dcache (directory entry cache) — recently resolved path components are cached for fast re-lookup.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>The . and .. entries:</strong> Every directory contains two special entries: . (current directory, points to own inode) and .. (parent directory, points to parent inode). The root directory's .. points back to itself. These are regular directory entries — the "magic" of cd .. is just following the .. link. rm -rf / is dangerous because it follows . and .. to delete everything.
              </LearnMore>

              <NavButtons prev={function() { setActive('access') }} prevLabel="← 13.5 Access Methods" next={function() { setActive('protection') }} nextLabel="13.7 Protection →" />
            </div>
          )}

          {active === 'protection' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>13.7 File Protection</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Controlling who can access files and what they can do.</p>

              <InfoBox color="#ef4444">
                File protection ensures that only authorized users can access files in authorized ways. The OS must ensure that files are used only in allowed ways. Protection mechanisms range from simple owner-based to sophisticated ACLs.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Types of Access</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { op: 'Read (r)', color: '#3b82f6', desc: 'Read file contents' },
                  { op: 'Write (w)', color: '#f59e0b', desc: 'Modify or delete file contents' },
                  { op: 'Execute (x)', color: '#10b981', desc: 'Load file into memory and run it' },
                  { op: 'Append', color: '#8b5cf6', desc: 'Write only at end of file' },
                  { op: 'Delete', color: '#ef4444', desc: 'Remove file from directory' },
                  { op: 'List', color: '#f97316', desc: 'List directory contents' },
                ].map(function(a) {
                  return (
                    <div key={a.op} style={{ background: a.color + '18', border: '1px solid ' + a.color + '44', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: a.color, fontSize: 13 }}>{a.op}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Unix Permission Bits</h3>
              <InfoBox color="#3b82f6">
                Unix uses a simple but effective 9-bit permission system. Three groups of rwx bits: <strong>owner</strong>, <strong>group</strong>, <strong>others</strong>. Each bit controls read, write, execute access for that group. Example: rwxr-x--- means owner can do everything, group can read and execute, others have no access.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div>-rwxr-xr-- 1 alice staff 2048 Jan 15 file.txt</div>
                  <div style={{ color: '#8b949e' }}>  ^^^ ^^^ ^^^</div>
                  <div style={{ color: '#3b82f6' }}>  rwx         = owner (alice): read+write+execute</div>
                  <div style={{ color: '#10b981' }}>      r-x     = group (staff): read+execute</div>
                  <div style={{ color: '#f59e0b' }}>          r-- = others: read only</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Octal: 7=rwx, 5=r-x, 4=r-- → chmod 754 */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Special Permission Bits</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { bit: 'SetUID (s)', color: '#ef4444', octal: '4xxx', desc: 'Execute with owner\'s privileges. Used by /usr/bin/passwd — runs as root to modify /etc/passwd even when called by normal user.' },
                  { bit: 'SetGID (s)', color: '#f59e0b', octal: '2xxx', desc: 'Execute with group\'s privileges. On directories: new files inherit directory\'s group. Used for shared project directories.' },
                  { bit: 'Sticky bit (t)', color: '#8b5cf6', octal: '1xxx', desc: 'On directories: only file owner can delete their own files. Used on /tmp so users cannot delete each other\'s temp files.' },
                ].map(function(b) {
                  return (
                    <div key={b.bit} style={{ background: 'var(--bg-card)', border: '1px solid ' + b.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, color: b.color, fontSize: 13 }}>{b.bit}</div>
                        <code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>{b.octal}</code>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Access Control Lists (ACLs)</h3>
              <InfoBox color="#10b981">
                Unix permission bits are limited — only three classes (owner, group, others). <strong>ACLs</strong> provide fine-grained control: give specific users or groups specific permissions, independent of owner/group. Linux supports POSIX ACLs via setfacl/getfacl. Windows NTFS uses ACLs extensively — every file has a DACL (Discretionary ACL) with per-user/group permissions.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Permission Calculator</h3>
              <PermissionCalculator />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>umask:</strong> When a process creates a file, the default permissions are determined by the requested permissions ANDed with NOT(umask). A umask of 022 (octal) means: subtract write permission from group and others. So creating a file with 666 permissions with umask 022 gives 644 (rw-r--r--). Directories use 777 as base, resulting in 755 (rwxr-xr-x) with umask 022.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Mandatory Access Control (MAC):</strong> Traditional Unix permissions are Discretionary Access Control (DAC) — the owner decides who has access. MAC systems like SELinux and AppArmor add mandatory policies that override DAC. Even root cannot violate MAC policies. Used in high-security environments. SELinux assigns security labels to every file, process, and port — access is only allowed if the policy permits label transitions.
              </LearnMore>

              <NavButtons prev={function() { setActive('directories') }} prevLabel="← 13.6 Directories" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>File System Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for file permissions and directory structure.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Unix Permission Calculator</h3>
              <PermissionCalculator />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Directory Tree Explorer</h3>
              <DirectorySimulator />

              <NavButtons prev={function() { setActive('protection') }} prevLabel="← 13.7 Protection" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — File System in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore file operations through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#14b8a6' }}>Lab 1 — File Operations in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore File System in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ls -la',                  'List files with permissions, owner, size'],
                  ['stat filename',           'Show all file attributes (inode, timestamps)'],
                  ['file filename',           'Detect file type by magic number'],
                  ['ln file hardlink',        'Create a hard link'],
                  ['ln -s file symlink',      'Create a symbolic link'],
                  ['ls -i',                   'Show inode numbers'],
                  ['chmod 755 filename',      'Set permissions (rwxr-xr-x)'],
                  ['find / -name "*.txt"',    'Find all .txt files'],
                  ['getfacl filename',        'Show ACL for file'],
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 13.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#14b8a6' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#14b8a6', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 13!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/14' }} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 14 →</button>
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