import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '14.1 FS Implementation',    icon: '🏗️' },
  { id: 'layered',     title: '14.2 Layered Structure',    icon: '📚' },
  { id: 'allocation',  title: '14.3 Allocation Methods',   icon: '📦' },
  { id: 'free',        title: '14.4 Free Space Management',icon: '🆓' },
  { id: 'efficiency',  title: '14.5 Efficiency & Perf',    icon: '⚡' },
  { id: 'recovery',    title: '14.6 Recovery',             icon: '🔧' },
  { id: 'simulator',   title: '🎮 Simulators',             icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                    icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                   icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What does the on-disk boot control block contain?',
    options: [
      'The file allocation table',
      'Information needed to boot the OS from that volume — boot code, partition info, kernel location',
      'The root directory inode',
      'The free space bitmap'
    ],
    answer: 1,
    explanation: 'The boot control block (UFS: boot block, NTFS: partition boot sector) contains the information needed to boot the OS from that partition — bootloader code, partition table details, and the location of the OS kernel. Only partitions with an OS have meaningful boot blocks.'
  },
  {
    q: 'What is the main advantage of indexed allocation over linked allocation?',
    options: [
      'Indexed uses less disk space',
      'Indexed supports efficient direct access — any block can be found in O(1) via the index block, no need to traverse a linked list',
      'Indexed is simpler to implement',
      'Indexed eliminates external fragmentation'
    ],
    answer: 1,
    explanation: 'Linked allocation requires following pointers sequentially to reach block n — O(n) time. Indexed allocation stores all block pointers in an index block — any block can be found in O(1) by reading index_block[n]. This makes random access efficient. The trade-off: the index block itself takes up space.'
  },
  {
    q: 'What is a key disadvantage of contiguous allocation?',
    options: [
      'It does not support sequential access',
      'External fragmentation — finding contiguous free space becomes difficult as the disk fills up and files are deleted',
      'It requires too many disk accesses',
      'It cannot support large files'
    ],
    answer: 1,
    explanation: 'Contiguous allocation requires each file to occupy contiguous disk blocks. As files are created and deleted, free space becomes fragmented into small holes. New files may not fit even if total free space is sufficient. The solution (compaction) is expensive. This is why most file systems use indexed or linked allocation.'
  },
  {
    q: 'What does a bitmap (bit vector) free space list store?',
    options: [
      'The size of each free block',
      'One bit per block — 0 = allocated, 1 = free (or vice versa). Easy to find contiguous free blocks.',
      'A linked list of free block numbers',
      'The inode number of the file using each block'
    ],
    answer: 1,
    explanation: 'A free space bitmap has one bit per disk block. 0 = block is allocated, 1 = block is free (convention varies). To find a free block, scan for a 1 bit. To find N contiguous free blocks, scan for N consecutive 1 bits. Simple and efficient — for a 1TB disk with 4KB blocks, the bitmap is only 32MB.'
  },
  {
    q: 'What is journaling (write-ahead logging) in file systems?',
    options: [
      'Logging all file access times',
      'Recording changes to a log before applying them to the file system — ensures consistency can be restored after a crash',
      'Creating backup copies of important files',
      'Tracking user file operations for auditing'
    ],
    answer: 1,
    explanation: 'Journaling records intended file system changes to a log (journal) BEFORE applying them. After a crash, the OS replays or discards incomplete journal entries to restore consistency — no need for a full fsck scan. This reduces recovery time from minutes to seconds. Used by ext3/4, NTFS, HFS+, APFS, XFS, Btrfs.'
  },
  {
    q: 'What is the purpose of the inode table in a Unix file system?',
    options: [
      'To store file names',
      'To store file metadata (permissions, timestamps, block pointers) for every file — each file has exactly one inode',
      'To manage free disk space',
      'To cache recently accessed files'
    ],
    answer: 1,
    explanation: 'The inode table is an array of inode structures, one per file. Each inode stores: file type, permissions, owner, size, timestamps, and pointers to data blocks. The directory entry maps a filename to an inode number. By separating names (in directories) from metadata (in inodes), Unix supports hard links — multiple names for one inode.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #f59e0b55', color: '#f59e0b', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid #f59e0b33', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

// ── Allocation Method Visualizer ──────────────────────────────
function AllocationVisualizer() {
  const [method, setMethod] = useState('contiguous')
  const BLOCKS = 20

  const examples = {
    contiguous: {
      label: 'Contiguous',
      color: '#10b981',
      files: [
        { name: 'FileA', start: 0, length: 4, color: '#3b82f6' },
        { name: 'FileB', start: 6, length: 3, color: '#10b981' },
        { name: 'FileC', start: 11, length: 5, color: '#8b5cf6' },
      ],
      free: [4, 5, 9, 10, 16, 17, 18, 19],
      desc: 'Each file occupies contiguous blocks. FileA: blocks 0-3, FileB: blocks 6-8, FileC: blocks 11-15. Gaps (4-5, 9-10, 16-19) are external fragmentation.',
    },
    linked: {
      label: 'Linked',
      color: '#f59e0b',
      files: [
        { name: 'FileA', blocks: [0, 5, 12, 17], color: '#3b82f6' },
        { name: 'FileB', blocks: [2, 8, 15], color: '#10b981' },
      ],
      free: [1, 3, 4, 6, 7, 9, 10, 11, 13, 14, 16, 18, 19],
      desc: 'Each file is a linked list of blocks scattered across disk. FileA: 0→5→12→17→null. FileB: 2→8→15→null. No external fragmentation but random access is slow.',
    },
    indexed: {
      label: 'Indexed',
      color: '#a855f7',
      files: [
        { name: 'FileA', index: 3, blocks: [0, 5, 12, 17], color: '#3b82f6' },
        { name: 'FileB', index: 9, blocks: [2, 8, 15], color: '#10b981' },
      ],
      free: [1, 4, 6, 7, 10, 11, 13, 14, 16, 18, 19],
      desc: 'Each file has an index block containing all its block pointers. FileA: index at block 3 → [0,5,12,17]. FileB: index at block 9 → [2,8,15]. Supports efficient direct access.',
    },
  }

  const ex = examples[method]

  function getBlockInfo(blockNum) {
    if (method === 'contiguous') {
      for (const f of ex.files) {
        if (blockNum >= f.start && blockNum < f.start + f.length) return { file: f.name, color: f.color, type: 'data' }
      }
    } else if (method === 'linked') {
      for (const f of ex.files) {
        if (f.blocks.includes(blockNum)) return { file: f.name, color: f.color, type: 'data', next: f.blocks[f.blocks.indexOf(blockNum) + 1] }
      }
    } else {
      for (const f of ex.files) {
        if (blockNum === f.index) return { file: f.name, color: f.color, type: 'index' }
        if (f.blocks.includes(blockNum)) return { file: f.name, color: f.color, type: 'data' }
      }
    }
    if (ex.free.includes(blockNum)) return { file: null, color: '#1c2128', type: 'free' }
    return { file: null, color: '#30363d', type: 'unknown' }
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Allocation Method Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>See how files are laid out on disk for each allocation method.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.keys(examples).map(function(key) {
          return (
            <button key={key} onClick={function() { setMethod(key) }} style={{ background: method === key ? examples[key].color + '33' : 'var(--bg-secondary)', color: method === key ? examples[key].color : 'var(--text-secondary)', border: '1px solid ' + (method === key ? examples[key].color : 'var(--border)'), padding: '6px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: method === key ? 700 : 400 }}>
              {examples[key].label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
        {Array.from({ length: BLOCKS }, function(_, i) {
          const info = getBlockInfo(i)
          return (
            <div key={i} style={{ width: 48, height: 48, background: info.color === '#1c2128' ? 'var(--bg-secondary)' : info.color + '44', border: '2px solid ' + (info.color === '#1c2128' ? 'var(--border)' : info.color), borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: info.color === '#1c2128' ? 'var(--text-muted)' : info.color, fontWeight: 700 }}>
              <div>{i}</div>
              {info.type === 'index' && <div style={{ fontSize: 8 }}>IDX</div>}
              {info.file && <div style={{ fontSize: 8 }}>{info.file}</div>}
              {info.type === 'free' && <div style={{ fontSize: 8 }}>free</div>}
            </div>
          )
        })}
      </div>

      <div style={{ background: ex.color + '15', border: '1px solid ' + ex.color + '44', borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{ex.desc}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {method !== 'contiguous' && ex.files && ex.files.map(function(f) {
          return (
            <div key={f.name} style={{ background: f.color + '18', border: '1px solid ' + f.color + '44', borderRadius: 8, padding: '6px 14px', fontSize: 12 }}>
              <span style={{ color: f.color, fontWeight: 700 }}>{f.name}</span>
              {method === 'indexed' && <span style={{ color: 'var(--text-muted)' }}> index:{f.index} data:[{f.blocks.join(',')}]</span>}
              {method === 'linked' && <span style={{ color: 'var(--text-muted)' }}> blocks:{f.blocks.join(' → ')}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Free Space Visualizer ─────────────────────────────────────
function FreeSpaceVisualizer() {
  const [method, setMethod] = useState('bitmap')
  const BLOCKS = 24
  const [allocated, setAllocated] = useState(new Set([0,1,2,3,5,6,9,12,13,14,17,20]))

  function toggleBlock(i) {
    setAllocated(function(prev) {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const freeBlocks = Array.from({ length: BLOCKS }, function(_, i) { return i }).filter(function(i) { return !allocated.has(i) })

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Free Space Management</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Click blocks to toggle allocated/free. See how different methods track free space.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['bitmap', 'linked', 'grouping'].map(function(m) {
          return (
            <button key={m} onClick={function() { setMethod(m) }} style={{ background: method === m ? '#f59e0b33' : 'var(--bg-secondary)', color: method === m ? '#f59e0b' : 'var(--text-secondary)', border: '1px solid ' + (method === m ? '#f59e0b' : 'var(--border)'), padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: method === m ? 700 : 400, textTransform: 'capitalize' }}>
              {m}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
        {Array.from({ length: BLOCKS }, function(_, i) {
          const isFree = !allocated.has(i)
          return (
            <div key={i} onClick={function() { toggleBlock(i) }} style={{ width: 44, height: 44, background: isFree ? '#10b98122' : '#ef444418', border: '2px solid ' + (isFree ? '#10b981' : '#ef4444'), borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: isFree ? '#10b981' : '#ef4444' }}>
              <div>{i}</div>
              <div style={{ fontSize: 8 }}>{isFree ? 'free' : 'used'}</div>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#0d1117', borderRadius: 8, padding: 14 }}>
        {method === 'bitmap' && (
          <div>
            <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 8, fontWeight: 700 }}>Bitmap representation (1=free, 0=allocated):</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', letterSpacing: 2, lineHeight: 2 }}>
              {Array.from({ length: BLOCKS }, function(_, i) { return allocated.has(i) ? '0' : '1' }).join('')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Free blocks: {freeBlocks.length} | Allocated: {allocated.size} | Bitmap size: {Math.ceil(BLOCKS / 8)} bytes
            </div>
          </div>
        )}
        {method === 'linked' && (
          <div>
            <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 8, fontWeight: 700 }}>Linked free list:</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.8 }}>
              {freeBlocks.length === 0
                ? <span style={{ color: '#ef4444' }}>No free blocks!</span>
                : freeBlocks.map(function(b, i) {
                  return <span key={b}>{b}{i < freeBlocks.length - 1 ? ' → ' : ' → null'}</span>
                })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Head pointer stored in superblock. Each free block stores pointer to next free block.</div>
          </div>
        )}
        {method === 'grouping' && (
          <div>
            <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 8, fontWeight: 700 }}>Grouping (addresses stored in blocks of free blocks):</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e6edf3', lineHeight: 1.8 }}>
              {freeBlocks.length === 0
                ? <span style={{ color: '#ef4444' }}>No free blocks!</span>
                : (function() {
                    const groups = []
                    for (let i = 0; i < freeBlocks.length; i += 4) groups.push(freeBlocks.slice(i, i + 4))
                    return groups.map(function(g, i) {
                      return <div key={i}>Block {g[0]}: [{g.join(', ')}{i < groups.length - 1 ? ', →next_group' : ''}]</div>
                    })
                  })()
              }
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>First free block stores n-1 addresses + pointer to next group block. Efficient for large free space.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Chapter14() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #f59e0b44', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 14</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🗄️</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>File-System Implementation</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How file systems are actually built — on-disk structures, allocation methods, free space management, performance, and recovery.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Allocation Visualizer', 'Free Space Simulator', 'Journaling', 'inode Structure', 'FAT vs ext4'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b33', color: '#f59e0b', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#f59e0b' : 'var(--text-secondary)', background: active === s.id ? 'rgba(245,158,11,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #f59e0b' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>14.1 File-System Implementation Overview</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The on-disk and in-memory structures that make file systems work.</p>

              <InfoBox color="#f59e0b">
                File systems are stored on disk in several on-disk structures. When mounted, key structures are loaded into memory. Understanding these structures explains how the OS can find any file quickly, allocate space, and recover from crashes.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>On-Disk Structures</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { name: 'Boot Control Block', color: '#3b82f6', location: 'Block 0 of volume', desc: 'Contains info needed to boot OS from this volume — bootloader, kernel location. Empty/null if not a boot partition. Called "boot block" in UFS, "partition boot sector" in NTFS.' },
                  { name: 'Volume Control Block (Superblock)', color: '#10b981', location: 'Block 1 of volume', desc: 'Volume details: total blocks, free blocks, block size, free block count, free inode count. Called "superblock" in UFS/ext4, "master file table" metadata in NTFS. Critical — often replicated.' },
                  { name: 'Directory Structure', color: '#f59e0b', location: 'Throughout volume', desc: 'Organizes files. In UFS: directory is a file containing (name, inode#) pairs. In NTFS: B-tree in the Master File Table. In FAT: fixed-size directory entries with file metadata.' },
                  { name: 'Inode Table', color: '#8b5cf6', location: 'Dedicated area', desc: 'Array of inodes — one per file. Each inode: file type, permissions, size, timestamps, block pointers. In FAT: no inodes — metadata stored in directory entries instead.' },
                  { name: 'Data Blocks', color: '#ef4444', location: 'Bulk of volume', desc: 'Actual file and directory content. Organized by allocation method (contiguous, linked, indexed). Free blocks tracked by free space list.' },
                ].map(function(s) {
                  return (
                    <div key={s.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderLeft: '4px solid ' + s.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, color: s.color, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, background: s.color + '22', color: s.color, padding: '1px 8px', borderRadius: 8 }}>{s.location}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>In-Memory Structures</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { name: 'Mount Table', color: '#3b82f6', desc: 'One entry per mounted volume. Contains volume info, file system type, root inode. Used when resolving paths that cross mount points.' },
                  { name: 'Directory Cache (dcache)', color: '#10b981', desc: 'Recently accessed directory entries. Speeds up repeated path lookups — no need to re-read directory from disk. Linux dcache is very large and is a major source of performance.' },
                  { name: 'System-wide Open File Table', color: '#8b5cf6', desc: 'One entry per unique open file. Contains in-memory inode (vnode), open count, file type, lock status. Shared across processes opening same file.' },
                  { name: 'Per-Process File Table', color: '#f59e0b', desc: 'File descriptor table — one entry per fd. Contains current file offset, access mode, pointer to system open-file table entry. Inherited by child processes via fork().' },
                ].map(function(s) {
                  return (
                    <div key={s.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: s.color, marginBottom: 6, fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Virtual File System (VFS):</strong> Linux uses VFS — a generic kernel layer above all specific file systems (ext4, NTFS, FAT, NFS, tmpfs). VFS defines a common set of objects: superblock, inode, dentry, file. Each specific file system implements these interfaces. This allows the kernel to treat all file systems uniformly — the same open/read/write system calls work on ext4, NFS, and /proc files.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>ext4 disk layout:</strong> An ext4 volume is divided into block groups. Each block group has its own: superblock copy (backup), block group descriptor, block bitmap, inode bitmap, inode table, and data blocks. This locality keeps inode and data blocks close together, improving performance. The first 1024 bytes of block 0 are reserved for the BIOS boot sector.
              </LearnMore>

              <NavButtons next={function() { setActive('layered') }} nextLabel="14.2 Layered Structure →" />
            </div>
          )}

          {active === 'layered' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>14.2 Layered File System Structure</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How the OS decomposes file system complexity into abstraction layers.</p>

              <InfoBox color="#3b82f6">
                File system complexity is managed through <strong>layering</strong>. Each layer handles a specific part of the problem and uses services from the layer below. This separation allows different file system types to share common layers.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24, maxWidth: 500 }}>
                {[
                  { layer: 'Application Programs', color: '#3b82f6', note: 'read(), write(), open()' },
                  { layer: 'Logical File System', color: '#10b981', note: 'FCB (inode), protection, metadata' },
                  { layer: 'File Organization Module', color: '#8b5cf6', note: 'logical → physical block mapping' },
                  { layer: 'Basic File System', color: '#f59e0b', note: 'issue read/write block commands' },
                  { layer: 'I/O Control (Device Drivers)', color: '#ef4444', note: 'device-specific commands' },
                  { layer: 'Devices (HDD, SSD)', color: '#6e7681', note: 'physical storage hardware' },
                ].map(function(l, i) {
                  return (
                    <div key={l.layer} style={{ background: l.color + '22', border: '1px solid ' + l.color + '44', borderRadius: 6, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: l.color, fontSize: 13 }}>{l.layer}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.note}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>What Each Layer Does</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { layer: 'Logical File System', color: '#10b981', desc: 'Manages metadata. Maintains file control blocks (FCBs / inodes). Handles directory management, protection, naming. Calls file-organization module to get physical block numbers.' },
                  { layer: 'File Organization Module', color: '#8b5cf6', desc: 'Knows about files and their logical/physical blocks. Translates logical block numbers to physical disk block numbers. Manages free space. Different modules for contiguous, linked, indexed.' },
                  { layer: 'Basic File System', color: '#f59e0b', desc: 'Issues generic commands to the device driver: "read physical block 234", "write physical block 567". Manages I/O request buffers and caches. Does not know about files — just block addresses.' },
                  { layer: 'I/O Control', color: '#ef4444', desc: 'Device drivers. Translates generic block commands into device-specific hardware commands. Handles interrupts from devices. Knows specific register sequences for each device.' },
                ].map(function(l) {
                  return (
                    <div key={l.layer} style={{ background: 'var(--bg-card)', border: '1px solid ' + l.color + '33', borderLeft: '4px solid ' + l.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: l.color, marginBottom: 6, fontSize: 13 }}>{l.layer}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{l.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>File Control Block (FCB / inode)</h3>
              <InfoBox color="#8b5cf6">
                Each file is represented by a <strong>File Control Block (FCB)</strong> — called an <strong>inode</strong> in Unix. The FCB contains: file permissions, dates (created, accessed, modified), owner ID, size, data block locations. The directory maps file name to FCB number. When a file is opened, the FCB is loaded into the in-memory open-file table.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why layering matters for portability:</strong> The VFS layer allows mounting different file systems at different points in the directory tree. /home might be ext4 on a local disk, /mnt/nas might be NFS (network file system), /proc is a virtual file system with no actual disk backing, /tmp might be tmpfs (RAM-based). All use the same open/read/write interface because VFS provides a common abstraction layer above all of them.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>FUSE (Filesystem in Userspace):</strong> FUSE allows implementing file systems in user space. Instead of writing kernel code, you implement a set of callback functions (open, read, write, readdir) and register them with the FUSE kernel module. Used for: SSHFS (mount remote SSH directories), encfs (encrypted file system), Google Drive/Dropbox desktop apps, and many others. Much easier to develop and debug than kernel file systems.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 14.1 Overview" next={function() { setActive('allocation') }} nextLabel="14.3 Allocation Methods →" />
            </div>
          )}

          {active === 'allocation' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>14.3 Allocation Methods</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How disk blocks are assigned to files — contiguous, linked, and indexed.</p>

              <InfoBox color="#10b981">
                The main problem: how to allocate disk blocks to files so that disk space is utilized effectively and files can be accessed quickly. Three major methods: <strong>contiguous</strong>, <strong>linked</strong>, and <strong>indexed</strong>.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 10 }}>Contiguous Allocation</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Each file occupies a set of <strong>contiguous blocks</strong> on disk. The directory entry stores only the starting block and length. Simple and fast — sequential AND random access both efficient (block n is at start+n).
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                    <div>Directory: file="count" start=0 length=2</div>
                    <div>Disk:       [0: count] [1: count] [2: tr] [3: tr] [4: tr] [5: mail] ...</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginBottom: 4 }}>Advantages</div>
                      {['Excellent read performance', 'Simple — just start + length', 'Both sequential and random access', 'Minimal disk seeks'].map(function(p) { return <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✓ {p}</div> })}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>Disadvantages</div>
                      {['External fragmentation', 'File size must be known at creation', 'Compaction needed eventually', 'Dynamic growth difficult'].map(function(p) { return <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✗ {p}</div> })}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 10 }}>Linked Allocation</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Each file is a <strong>linked list of disk blocks</strong>. Each block has a pointer to the next block. Directory entry stores only the first and last block. No external fragmentation — any free block can be used.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                    <div>Directory: file="jeep" start=9 end=25</div>
                    <div>Block 9:  [data | next=16]  →  Block 16: [data | next=1]  →  Block 1: [data | next=10]  → ...</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginBottom: 4 }}>Advantages</div>
                      {['No external fragmentation', 'File can grow dynamically', 'Simple free space management', 'No need to know file size upfront'].map(function(p) { return <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✓ {p}</div> })}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>Disadvantages</div>
                      {['Random access is O(n) — must follow chain', 'Space wasted for pointers in each block', 'Pointer corruption loses rest of file', 'Poor locality — blocks scattered'].map(function(p) { return <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✗ {p}</div> })}
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                    FAT (File Allocation Table) is a variation — pointers stored in a separate table in memory, not in each block. Enables faster random access.
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', marginBottom: 10 }}>Indexed Allocation</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Each file has an <strong>index block</strong> containing pointers to all its data blocks. The directory entry points to the index block. Supports efficient direct access — find block n in O(1) via index_block[n].
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 10 }}>
                    <div>Directory: file="jeep" index_block=19</div>
                    <div>Block 19 (index): [1, 8, 3, 14, 28, ...]  ← pointers to data blocks</div>
                    <div>To read block 2: read index_block[19][2] = block 3, then read block 3</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginBottom: 4 }}>Advantages</div>
                      {['No external fragmentation', 'Efficient direct access O(1)', 'File can grow dynamically', 'Used by Unix (inode with block pointers)'].map(function(p) { return <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✓ {p}</div> })}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>Disadvantages</div>
                      {['Index block wastes space for small files', 'Large files need multi-level index', 'Extra disk access to read index block', 'Maximum file size limited by index size'].map(function(p) { return <div key={p} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✗ {p}</div> })}
                    </div>
                  </div>
                </div>

              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Unix Inode — Multi-level Indexing</h3>
              <InfoBox color="#f59e0b">
                Unix solves the large file problem with a multi-level index in the inode:
                <br />• <strong>12 direct block pointers</strong> — for small files (up to 48KB with 4KB blocks)
                <br />• <strong>1 single indirect pointer</strong> — points to a block of 1024 pointers (4MB more)
                <br />• <strong>1 double indirect pointer</strong> — points to block of blocks of pointers (4GB more)
                <br />• <strong>1 triple indirect pointer</strong> — points to 3 levels of pointer blocks (4TB more)
                <br /><br />
                Small files use only direct pointers — very fast. Large files pay extra indirection cost only as needed.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Visualizer</h3>
              <AllocationVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>FAT file system details:</strong> FAT (File Allocation Table) uses linked allocation but stores all the pointers in a single table in memory at the start of the volume. FAT entry for block n contains either: NEXT (the next block in the file), EOF (end of file), BAD (bad block), or FREE (unallocated). Since the entire FAT is in memory, random access is fast — follow links without disk I/O. FAT12/16/32 differ in the size of each FAT entry (12/16/32 bits).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Extents:</strong> Modern file systems (ext4, NTFS, XFS, Btrfs) use extents — a contiguous range of blocks described by (start_block, length). A file is described by a list of extents. Large contiguous files need only one extent entry. Fragmented files have many extents. This combines the performance benefits of contiguous allocation with the flexibility of linked/indexed allocation.
              </LearnMore>

              <NavButtons prev={function() { setActive('layered') }} prevLabel="← 14.2 Layered Structure" next={function() { setActive('free') }} nextLabel="14.4 Free Space →" />
            </div>
          )}

          {active === 'free' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>14.4 Free Space Management</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How the file system tracks which disk blocks are available.</p>

              <InfoBox color="#10b981">
                The file system must track free disk blocks to allocate them to new files. Several data structures are used, each with different trade-offs for speed, space, and functionality.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Bit Vector (Bitmap)</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    One bit per block. 0 = allocated, 1 = free (or vice versa). Easy to find contiguous free blocks by scanning for patterns. For a 1TB disk with 4KB blocks: bitmap = 32MB — fits in memory.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div style={{ color: '#8b949e' }}>/* Find first free block */</div>
                    <div>for (i = 0; i &lt; n; i++)</div>
                    <div style={{ paddingLeft: 16 }}>if (bitmap[i] == 1) return i;</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Easy to find contiguous blocks</span>
                    <span style={{ color: '#10b981' }}>✓ Simple implementation</span>
                    <span style={{ color: '#ef4444' }}>✗ Must fit in memory for efficiency</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Linked Free List</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Link all free blocks together. The first free block contains a pointer to the next, and so on. The superblock stores a pointer to the first free block. No wasted space — free blocks store their own links. But finding contiguous space is slow.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div>superblock.free_head = 3</div>
                    <div>block[3].next = 7, block[7].next = 12, block[12].next = null</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ No extra space needed</span>
                    <span style={{ color: '#ef4444' }}>✗ Traversal requires disk I/O per block</span>
                    <span style={{ color: '#ef4444' }}>✗ Hard to find contiguous space</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Grouping</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Modification of linked list. The first free block stores n free block addresses plus a pointer to the next "group block." Each group block stores n-1 free addresses + next group pointer. Retrieving many free blocks requires fewer disk reads.
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Retrieve many free blocks quickly</span>
                    <span style={{ color: '#10b981' }}>✓ Better than simple linked list</span>
                    <span style={{ color: '#ef4444' }}>✗ Still needs disk I/O for groups</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Counting</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Keep a list of (first_free_block, count) pairs. Each entry represents a contiguous run of free blocks. When files are contiguously allocated or deleted, runs are common. More compact than a list of individual block numbers.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8 }}>
                    <div style={{ color: '#8b949e' }}>/* Free list with counting */</div>
                    <div>(block=4, count=2), (block=9, count=1), (block=16, count=4)</div>
                    <div style={{ color: '#8b949e' }}>/* Blocks 4-5, 9, 16-19 are free */</div>
                  </div>
                </div>

              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Free Space Simulator</h3>
              <FreeSpaceVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Space maps in ZFS:</strong> ZFS uses a sophisticated metaslab and space map structure. Each disk is divided into metaslabs (large regions). Each metaslab has a space map — a log of allocations and frees. To find free space, replay the log. ZFS writes the space map as a log rather than updating a bitmap — this is more efficient for SSDs (fewer random writes) and provides better crash consistency.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Trim/Discard for SSDs:</strong> When a file is deleted, the OS marks its blocks as free but does NOT write zeros to them. On HDDs this is fine. On SSDs, the controller doesn't know blocks are free until the OS explicitly tells it via the TRIM command (ATA) or UNMAP (SCSI). Without TRIM, the SSD treats old data as valid and must do garbage collection before reusing those blocks — slowing writes over time. Linux sends TRIM via fstrim or with the discard mount option.
              </LearnMore>

              <NavButtons prev={function() { setActive('allocation') }} prevLabel="← 14.3 Allocation" next={function() { setActive('efficiency') }} nextLabel="14.5 Efficiency →" />
            </div>
          )}

          {active === 'efficiency' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>14.5 Efficiency and Performance</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Techniques that make file systems fast in practice.</p>

              <InfoBox color="#ef4444">
                Disk I/O is the dominant performance bottleneck in most systems. File system designers use many techniques to minimize disk accesses and maximize throughput.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Key Performance Techniques</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    tech: 'Buffer Cache / Page Cache',
                    color: '#3b82f6',
                    desc: 'Cache recently accessed disk blocks in memory. Cache hit = no disk I/O needed. Linux unified page cache holds file data, directory entries, and inode data. Can use all available free RAM. Dramatically improves repeated access to hot data.',
                    impact: '10-1000x speedup for hot data'
                  },
                  {
                    tech: 'Read-ahead (Prefetching)',
                    color: '#10b981',
                    desc: 'When a sequential read pattern is detected, prefetch additional blocks beyond what was requested. Hides latency — next blocks are already in cache when needed. Linux uses adaptive read-ahead that increases prefetch window for large sequential reads.',
                    impact: '2-4x throughput improvement for sequential I/O'
                  },
                  {
                    tech: 'Write Buffering (Write-back)',
                    color: '#f59e0b',
                    desc: 'Writes go to cache first — acknowledged immediately. Dirty pages written to disk by background writeback daemon (pdflush). Multiple writes to same block coalesced. Risk: data loss if crash before writeback. Configurable via dirty_writeback_centisecs.',
                    impact: '5-20x write throughput improvement'
                  },
                  {
                    tech: 'Clustering / Block Groups',
                    color: '#8b5cf6',
                    desc: 'Keep related data close together on disk. ext4 places inode and first data blocks in the same block group. New files in a directory go in the same group as the directory. Reduces seek time for directory traversal.',
                    impact: '2-3x improvement for directory-heavy workloads'
                  },
                  {
                    tech: 'Large Block Size',
                    color: '#ef4444',
                    desc: 'Larger blocks (4KB vs 512B) mean fewer metadata entries, fewer seeks, better sequential throughput. Trade-off: more internal fragmentation for small files. Modern systems use 4KB blocks matching CPU page size.',
                    impact: 'Better throughput, more internal fragmentation'
                  },
                ].map(function(t) {
                  return (
                    <div key={t.tech} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '33', borderLeft: '4px solid ' + t.color, borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, color: t.color, fontSize: 14 }}>{t.tech}</div>
                        <div style={{ fontSize: 11, background: t.color + '22', color: t.color, padding: '2px 8px', borderRadius: 8 }}>{t.impact}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Synchronous vs Asynchronous I/O</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Synchronous (sync)</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Process blocks until I/O completes. Simple to program. Poor performance — CPU idle during I/O. Default for most read() calls. Some write() calls use O_SYNC for durability.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Asynchronous (async)</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Process continues after issuing I/O. Notified when done (callback, signal, io_uring). Complex programming. Much better performance for I/O-bound applications. Used by databases, web servers.</p>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux page cache statistics:</strong> Run "cat /proc/meminfo" and look for: Cached (file page cache), Buffers (metadata cache), Dirty (pages waiting to be written), Writeback (pages being written). A healthy system with plenty of RAM shows most free memory as "cached" — Linux uses all available RAM for cache and frees it when applications need it. The "available" field shows how much is truly available for new allocations.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Copy-on-write file systems (Btrfs, ZFS, APFS):</strong> Instead of overwriting data in place (which risks corruption during a crash), COW file systems write new data to new blocks and atomically update the metadata to point to the new blocks. Old blocks remain valid until the update is confirmed. This eliminates the need for journaling since metadata is always consistent. Enables cheap snapshots — a snapshot just keeps references to old blocks.
              </LearnMore>

              <NavButtons prev={function() { setActive('free') }} prevLabel="← 14.4 Free Space" next={function() { setActive('recovery') }} nextLabel="14.6 Recovery →" />
            </div>
          )}

          {active === 'recovery' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>14.6 Recovery</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Ensuring file system consistency after crashes.</p>

              <InfoBox color="#8b5cf6">
                System crashes can leave a file system in an <strong>inconsistent state</strong> — a partially completed operation may have updated some data structures but not others. Recovery mechanisms ensure the file system returns to a consistent state.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>The Consistency Problem</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Creating a file requires multiple separate disk writes: allocate inode, write directory entry, update free space bitmap, write data blocks. If a crash occurs between any two steps, the file system is inconsistent — e.g., an inode is allocated but not pointed to by any directory.
              </p>
              <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Creating a file — multiple disk writes */</div>
                  <div>1. Allocate inode <span style={{ color: '#10b981' }}>✓ done</span></div>
                  <div>2. Write directory entry <span style={{ color: '#10b981' }}>✓ done</span></div>
                  <div>3. Update free space bitmap <span style={{ color: '#ef4444' }}>✗ CRASH HERE</span></div>
                  <div>4. Write data blocks <span style={{ color: '#6e7681' }}>— never reached</span></div>
                  <div style={{ color: '#ef4444', marginTop: 4 }}>Result: inode allocated but not marked as used → inconsistency!</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Solution 1: fsck (File System Check)</h3>
              <InfoBox color="#3b82f6">
                <strong>fsck</strong> scans the entire file system after a crash, checking all consistency invariants. It is run at boot time if the file system was not cleanly unmounted. Checks: inode reference counts match directory links, all inode blocks are in either the inode table or free list, no block is both allocated and free, etc. Very slow — can take minutes to hours for large disks.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Solution 2: Journaling (Write-Ahead Log)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'Before making any change, write a journal entry describing the intended change. Include a commit record.' },
                  { n: 2, color: '#3b82f6', text: 'Apply the actual changes to the file system (checkpoint).' },
                  { n: 3, color: '#10b981', text: 'Mark the journal entry as complete (remove or mark committed).' },
                  { n: 4, color: '#f59e0b', text: 'On crash recovery: find incomplete journal entries. Re-apply (redo) or discard (undo) them to restore consistency.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Metadata journaling</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Only journal metadata (inodes, directory entries, superblock). Data blocks written directly. Faster — most writes are data. Risk: data blocks may not match metadata after crash. Default in ext3/4.</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Full journaling</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Journal both metadata AND data. Complete consistency guarantee — no data loss. Slower — all writes go through journal first. Data written twice (journal + final location). Used by ext4 with data=journal option.</p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Journaling File Systems</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { fs: 'ext3/ext4', os: 'Linux', color: '#3b82f6' },
                  { fs: 'NTFS', os: 'Windows', color: '#10b981' },
                  { fs: 'HFS+/APFS', os: 'macOS', color: '#8b5cf6' },
                  { fs: 'XFS', os: 'Linux', color: '#f59e0b' },
                  { fs: 'Btrfs', os: 'Linux', color: '#ef4444' },
                  { fs: 'ZFS', os: 'Solaris/BSD', color: '#f97316' },
                ].map(function(fs) {
                  return (
                    <div key={fs.fs} style={{ background: fs.color + '18', border: '1px solid ' + fs.color + '44', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: fs.color }}>
                      {fs.fs} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 11 }}>({fs.os})</span>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>ARIES recovery algorithm:</strong> Used by most enterprise databases (IBM DB2, SQL Server, PostgreSQL). ARIES uses Write-Ahead Logging with three phases of recovery: Analysis (scan log from last checkpoint to find dirty pages and active transactions), Redo (replay all logged operations to bring database to crash state), Undo (rollback incomplete transactions). ARIES guarantees transaction atomicity and durability even with multiple concurrent crashes.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Snapshots:</strong> Copy-on-write file systems (ZFS, Btrfs, APFS) support instant snapshots — a read-only point-in-time view of the file system. Taking a snapshot is O(1) — just record the current root pointer. Modified blocks get new copies; unchanged blocks are shared. Rolling back to a snapshot is also fast. ZFS send/receive can efficiently transfer only changed blocks between snapshots — the basis of ZFS-based backup systems.
              </LearnMore>

              <NavButtons prev={function() { setActive('efficiency') }} prevLabel="← 14.5 Efficiency" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>File System Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Visualize allocation methods and free space management.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Allocation Method Visualizer</h3>
              <AllocationVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Free Space Management</h3>
              <FreeSpaceVisualizer />

              <NavButtons prev={function() { setActive('recovery') }} prevLabel="← 14.6 Recovery" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — File System Internals</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore file system structures through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f59e0b' }}>Lab 1 — File System Operations in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore FS Internals in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['df -h',                         'Disk usage per file system'],
                  ['dumpe2fs /dev/sda1',             'ext4 superblock and block group info'],
                  ['tune2fs -l /dev/sda1',           'ext4 file system parameters'],
                  ['debugfs /dev/sda1',              'Interactive ext4 debugger'],
                  ['stat -f /',                      'File system stats for root'],
                  ['cat /proc/filesystems',          'List supported file system types'],
                  ['mount | column -t',              'Show all mounted file systems'],
                  ['findmnt',                        'Show mount tree'],
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 14.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#f59e0b' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#f59e0b', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 14!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/15' }} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 15 →</button>
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