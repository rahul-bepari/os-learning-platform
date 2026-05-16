import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '11.1 Storage Overview',      icon: '💿' },
  { id: 'hdd',         title: '11.2 HDD Structure',         icon: '🖴' },
  { id: 'nvm',         title: '11.3 NVM / SSD',             icon: '⚡' },
  { id: 'scheduling',  title: '11.4 Disk Scheduling',       icon: '📊' },
  { id: 'raid',        title: '11.5 RAID',                  icon: '🛡️' },
  { id: 'management',  title: '11.6 Storage Management',    icon: '🔧' },
  { id: 'simulator',   title: '🎮 Disk Scheduler Sim',      icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the correct order of disk access time components from largest to smallest?',
    options: [
      'Transfer time > Rotational latency > Seek time',
      'Seek time > Rotational latency > Transfer time',
      'Rotational latency > Seek time > Transfer time',
      'Transfer time > Seek time > Rotational latency'
    ],
    answer: 1,
    explanation: 'Seek time (moving the arm) is the dominant cost — typically 5-20ms. Rotational latency (waiting for the sector to spin under the head) averages half a rotation — about 4ms at 7200 RPM. Transfer time (actually reading data) is the smallest — just microseconds for a sector.'
  },
  {
    q: 'Which disk scheduling algorithm can cause starvation?',
    options: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'],
    answer: 1,
    explanation: 'SSTF (Shortest Seek Time First) always services the request closest to the current head position. If requests keep arriving near the current position, requests at the far end of the disk may wait indefinitely — starvation. SCAN and C-SCAN prevent starvation by always moving in one direction.'
  },
  {
    q: 'What is the main advantage of C-SCAN over SCAN?',
    options: [
      'C-SCAN is faster overall',
      'C-SCAN provides more uniform wait times — it always sweeps in one direction',
      'C-SCAN uses less disk bandwidth',
      'C-SCAN handles more requests per sweep'
    ],
    answer: 1,
    explanation: 'SCAN services requests in both directions — requests near the ends wait longer because the head turns around at the end. C-SCAN only sweeps in one direction and jumps back to the beginning without servicing on the return. This gives more uniform wait times across all cylinders.'
  },
  {
    q: 'RAID 1 provides:',
    options: [
      'Striping without redundancy',
      'Mirroring — exact duplicate of all data on two drives',
      'Block striping with distributed parity',
      'Striping with double parity'
    ],
    answer: 1,
    explanation: 'RAID 1 is disk mirroring — every write goes to two drives simultaneously. If one fails, the other has the complete data. Provides excellent read performance (can read from either drive) and can survive one drive failure. Costs 50% storage efficiency — need 2x storage for your data.'
  },
  {
    q: 'What does NVM (like SSD) use for storage?',
    options: [
      'Magnetic platters',
      'NAND flash memory cells that trap electrons in floating gates',
      'Phase-change material',
      'Optical pits and lands'
    ],
    answer: 1,
    explanation: 'SSDs use NAND flash memory. Data is stored by trapping electrons in the floating gate of a transistor. A charge = 0, no charge = 1 (or vice versa). Multi-level cell (MLC) SSDs store 2 bits per cell by using different charge levels. No moving parts means much faster random access than HDDs.'
  },
  {
    q: 'What is wear leveling in SSDs?',
    options: [
      'Making all writes the same size',
      'Distributing writes evenly across all flash cells to prevent any cell from wearing out prematurely',
      'Reducing write amplification',
      'Balancing read and write performance'
    ],
    answer: 1,
    explanation: 'Flash cells can only be written/erased a limited number of times (typically 3,000-100,000 P/E cycles). Wear leveling distributes writes across all cells evenly so no single cell wears out first. The SSD controller remaps logical blocks to physical cells to achieve this distribution transparently.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #0ea5e955', color: '#0ea5e9', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(14,165,233,0.06)', border: '1px solid #0ea5e933', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function DiskSchedulerSim() {
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [headStart, setHeadStart] = useState(53)
  const [requests, setRequests] = useState('98 183 37 122 14 124 65 67')
  const [result, setResult] = useState(null)
  const TOTAL = 200

  function runFCFS(reqs, head) {
    const order = [head, ...reqs]
    let movement = 0
    for (let i = 1; i < order.length; i++) movement += Math.abs(order[i] - order[i - 1])
    return { order, movement }
  }

  function runSSTF(reqs, head) {
    const remaining = [...reqs]
    const order = [head]
    let movement = 0
    let current = head
    while (remaining.length > 0) {
      let closest = remaining.reduce(function(a, b) { return Math.abs(a - current) <= Math.abs(b - current) ? a : b })
      movement += Math.abs(closest - current)
      current = closest
      order.push(closest)
      remaining.splice(remaining.indexOf(closest), 1)
    }
    return { order, movement }
  }

  function runSCAN(reqs, head) {
    const sorted = [...reqs].sort(function(a, b) { return a - b })
    const left  = sorted.filter(function(r) { return r < head }).reverse()
    const right = sorted.filter(function(r) { return r >= head })
    const order = [head, ...right, TOTAL - 1, ...left]
    let movement = 0
    for (let i = 1; i < order.length; i++) movement += Math.abs(order[i] - order[i - 1])
    return { order, movement }
  }

  function runCSCAN(reqs, head) {
    const sorted = [...reqs].sort(function(a, b) { return a - b })
    const right = sorted.filter(function(r) { return r >= head })
    const left  = sorted.filter(function(r) { return r < head })
    const order = [head, ...right, TOTAL - 1, 0, ...left]
    let movement = 0
    for (let i = 1; i < order.length; i++) movement += Math.abs(order[i] - order[i - 1])
    return { order, movement }
  }

  function runLOOK(reqs, head) {
    const sorted = [...reqs].sort(function(a, b) { return a - b })
    const left  = sorted.filter(function(r) { return r < head }).reverse()
    const right = sorted.filter(function(r) { return r >= head })
    const order = [head, ...right, ...left]
    let movement = 0
    for (let i = 1; i < order.length; i++) movement += Math.abs(order[i] - order[i - 1])
    return { order, movement }
  }

  function calculate() {
    const reqs = requests.trim().split(/\s+/).map(Number).filter(function(n) { return !isNaN(n) && n >= 0 && n < TOTAL })
    if (reqs.length === 0) return
    let res
    if (algorithm === 'fcfs')       res = runFCFS(reqs, headStart)
    else if (algorithm === 'sstf')  res = runSSTF(reqs, headStart)
    else if (algorithm === 'scan')  res = runSCAN(reqs, headStart)
    else if (algorithm === 'cscan') res = runCSCAN(reqs, headStart)
    else                            res = runLOOK(reqs, headStart)
    setResult({ ...res, reqs })
  }

  const COLORS = ['#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#f97316','#06b6d4','#84cc16','#ec4899']

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Disk Scheduling Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Watch the disk head move across cylinders 0-199. Compare total head movement for each algorithm.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'fcfs',  label: 'FCFS' },
          { key: 'sstf',  label: 'SSTF' },
          { key: 'scan',  label: 'SCAN' },
          { key: 'cscan', label: 'C-SCAN' },
          { key: 'look',  label: 'LOOK' },
        ].map(function(a) {
          return (
            <button key={a.key} onClick={function() { setAlgorithm(a.key); setResult(null) }} style={{ background: algorithm === a.key ? '#0ea5e933' : 'var(--bg-secondary)', color: algorithm === a.key ? '#0ea5e9' : 'var(--text-secondary)', border: '1px solid ' + (algorithm === a.key ? '#0ea5e9' : 'var(--border)'), padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: algorithm === a.key ? 700 : 400 }}>
              {a.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Initial Head Position (0-199)</div>
          <input type="number" min="0" max="199" value={headStart} onChange={function(e) { setHeadStart(parseInt(e.target.value) || 0); setResult(null) }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 14, width: 80 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Request Queue (space-separated, 0-199)</div>
          <input value={requests} onChange={function(e) { setRequests(e.target.value); setResult(null) }} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <button onClick={calculate} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          Run
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ background: '#0ea5e918', border: '1px solid #0ea5e944', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0ea5e9' }}>{result.movement}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Head Movement (cylinders)</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{result.order.length - 1}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Requests Serviced</div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Service Order:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {result.order.map(function(pos, i) {
              const isHead  = i === 0
              const isEdge  = pos === 0 || pos === TOTAL - 1
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ background: isHead ? '#f59e0b33' : isEdge ? '#6e767133' : COLORS[i % COLORS.length] + '33', border: '1px solid ' + (isHead ? '#f59e0b' : isEdge ? '#6e7681' : COLORS[i % COLORS.length]), color: isHead ? '#f59e0b' : isEdge ? '#6e7681' : COLORS[i % COLORS.length], padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    {pos}{isHead ? ' (start)' : isEdge ? ' (end)' : ''}
                  </div>
                  {i < result.order.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>→</span>}
                </div>
              )
            })}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Disk Head Movement Visualization:</div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', overflowX: 'auto' }}>
            <div style={{ position: 'relative', height: (result.order.length * 24) + 20, minWidth: 500 }}>
              {result.order.map(function(pos, i) {
                if (i === result.order.length - 1) return null
                const next = result.order[i + 1]
                const x1 = (pos / TOTAL) * 100
                const x2 = (next / TOTAL) * 100
                const color = COLORS[i % COLORS.length]
                return (
                  <div key={i} style={{ position: 'absolute', top: i * 24 + 10, left: Math.min(x1, x2) + '%', width: Math.abs(x2 - x1) + '%', height: 2, background: color, opacity: 0.7 }}>
                    <div style={{ position: 'absolute', left: x1 > x2 ? '100%' : '0%', top: -4, width: 10, height: 10, borderRadius: '50%', background: color }} />
                  </div>
                )
              })}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, display: 'flex', justifyContent: 'space-between' }}>
                {[0, 50, 100, 150, 199].map(function(n) {
                  return <span key={n} style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n}</span>
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Chapter11() {
  const [active, setActive] = useState('overview')
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

      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #0ea5e944', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 11</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>💿</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Mass Storage</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          Hard disk drives, SSDs, disk scheduling algorithms, RAID, and storage management — everything about persistent storage.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Disk Scheduling Sim', 'HDD vs SSD', 'RAID Levels', 'FCFS/SSTF/SCAN', 'Wear Leveling'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(14,165,233,0.1)', border: '1px solid #0ea5e933', color: '#0ea5e9', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#0ea5e9' : 'var(--text-secondary)', background: active === s.id ? 'rgba(14,165,233,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #0ea5e9' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>11.1 Storage Overview</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The storage hierarchy and types of mass storage devices.</p>

              <InfoBox color="#0ea5e9">
                Mass storage provides large, non-volatile storage at low cost per byte. It is orders of magnitude slower than RAM but retains data without power. Modern systems use a combination of HDDs (capacity) and SSDs (speed).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Storage Hierarchy Recap</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24, maxWidth: 500 }}>
                {[
                  { name: 'Registers', speed: '< 1ns', cost: 'Highest', color: '#ef4444' },
                  { name: 'L1/L2/L3 Cache', speed: '1-10ns', cost: 'Very High', color: '#f97316' },
                  { name: 'Main Memory (RAM)', speed: '100ns', cost: 'High', color: '#f59e0b' },
                  { name: 'NVM / SSD', speed: '100μs', cost: 'Medium', color: '#10b981' },
                  { name: 'Hard Disk Drive (HDD)', speed: '10ms', cost: 'Low', color: '#0ea5e9' },
                  { name: 'Optical / Tape', speed: 'seconds', cost: 'Lowest', color: '#6e7681' },
                ].map(function(s) {
                  return (
                    <div key={s.name} style={{ background: s.color + '18', border: '1px solid ' + s.color + '44', borderRadius: 6, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: s.color, fontSize: 13 }}>{s.name}</span>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.speed}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.cost}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>HDD vs NVM (SSD) Comparison</h3>
              <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Property', 'HDD', 'SSD/NVM'].map(function(h) {
                        return <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Technology', 'Magnetic platters + read/write head', 'NAND flash memory cells'],
                      ['Random Read', '5-20ms (seek + rotation)', '0.1ms (no movement)'],
                      ['Sequential R/W', '100-200 MB/s', '500-7000 MB/s'],
                      ['Moving Parts', 'Yes (arm, platters)', 'None — solid state'],
                      ['Durability', 'Sensitive to shock/vibration', 'Shock resistant'],
                      ['Write Endurance', 'Essentially unlimited', 'Limited P/E cycles per cell'],
                      ['Capacity per $', 'Higher (TB for low cost)', 'Lower but improving'],
                      ['Power Usage', 'Higher (motors)', 'Lower'],
                      ['Noise', 'Audible (spinning, seeking)', 'Silent'],
                      ['Best For', 'Bulk storage, backups', 'OS drive, databases, speed'],
                    ].map(function(row) {
                      return (
                        <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 600, color: '#0ea5e9' }}>{row[0]}</td>
                          <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>{row[1]}</td>
                          <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>{row[2]}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>The shift to NVM:</strong> SSDs have gone from niche to mainstream. In 2010, a 256GB SSD cost over $500. Today 1TB SSDs cost under $80. NVMe SSDs over PCIe can reach 7GB/s sequential read — 35x faster than SATA SSDs. The bottleneck has shifted from storage to the CPU processing the data.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Persistent Memory (NVDIMM / Optane):</strong> Intel Optane (3D XPoint) was a new type of non-volatile memory — faster than NAND flash, can be used in DIMM slots. It blurred the line between RAM and storage. While Optane has been discontinued, the concept of byte-addressable persistent memory (PMEM) remains important for future storage architectures.
              </LearnMore>

              <NavButtons next={function() { setActive('hdd') }} nextLabel="11.2 HDD Structure →" />
            </div>
          )}

          {active === 'hdd' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>11.2 Hard Disk Drive Structure</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How HDDs store data magnetically — and why they are slow for random access.</p>

              <InfoBox color="#3b82f6">
                An HDD stores data on <strong>magnetic platters</strong> that spin at 5400-15000 RPM. A <strong>read/write head</strong> on a movable arm reads/writes data as the platter spins beneath it. The fundamental challenge: the head must physically move to the right location.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>HDD Components</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { name: 'Platter', color: '#3b82f6', desc: 'Rigid disk coated with magnetic material. Modern HDDs have multiple platters stacked on a spindle. Data stored on both surfaces of each platter.' },
                  { name: 'Track', color: '#10b981', desc: 'Concentric circle on the platter surface. A platter has thousands of tracks. Track 0 is at the outermost edge.' },
                  { name: 'Sector', color: '#f59e0b', desc: 'The smallest unit of storage — typically 512 bytes or 4096 bytes (4K sectors). A track is divided into sectors. Logical Block Addressing (LBA) numbers sectors sequentially.' },
                  { name: 'Cylinder', color: '#8b5cf6', desc: 'All tracks at the same radius across all platters. Tracks in the same cylinder can be read without moving the arm — sequential reads across platters are fast.' },
                  { name: 'Read/Write Head', color: '#ef4444', desc: 'Electromagnetic sensor that reads and writes data. One head per platter surface. Heads on all platters move together on the same actuator arm.' },
                  { name: 'Actuator Arm', color: '#f97316', desc: 'The mechanism that moves all read/write heads simultaneously across the platters. Moving this arm is the seek operation — the most time-consuming part.' },
                ].map(function(c) {
                  return (
                    <div key={c.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: c.color, marginBottom: 6, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Disk Access Time Components</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { component: 'Seek Time', color: '#ef4444', typical: '5-20ms', desc: 'Time to move the actuator arm to the correct track. The dominant cost for random I/O. Depends on how far the head must travel. Average seek time = 1/3 of full stroke time.' },
                  { component: 'Rotational Latency', color: '#f59e0b', typical: '0-8ms avg ~4ms', desc: 'Time waiting for the desired sector to rotate under the read/write head. At 7200 RPM, one rotation takes 8.3ms — average wait is half a rotation = ~4ms.' },
                  { component: 'Transfer Time', color: '#10b981', typical: '~0.1ms/sector', desc: 'Time to actually transfer data between disk and memory. The platter spins and data passes under the head. Very fast compared to seek and rotation.' },
                  { component: 'Controller Overhead', color: '#3b82f6', typical: '0.1-2ms', desc: 'Time for the disk controller to process the I/O request, handle DMA setup, and communicate with the OS driver.' },
                ].map(function(c) {
                  return (
                    <div key={c.component} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '33', borderLeft: '4px solid ' + c.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, color: c.color, fontSize: 13 }}>{c.component}</div>
                        <div style={{ background: c.color + '22', color: c.color, padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{c.typical}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <InfoBox color="#f59e0b">
                <strong>Total access time = Seek time + Rotational latency + Transfer time</strong>
                <br />Example: Seek = 9ms + Rotation = 4ms + Transfer = 0.1ms = 13.1ms
                <br />For comparison, RAM access = 100 nanoseconds. HDD is 100,000x slower for random access!
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why sequential reads are much faster:</strong> After reading one sector, the next sector is already under the head (or arrives very quickly). No seek time needed — just transfer time. Sequential HDD throughput can reach 200MB/s while random IOPS may be only 100-200 operations/second. Database systems are designed around this — they use large sequential scans rather than random access wherever possible.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Zone Bit Recording (ZBR):</strong> Outer tracks of an HDD are physically longer. Modern HDDs use more sectors per track on outer tracks (ZBR). Sequential writes to outer tracks are faster than inner tracks. This is why a hard drive's "formatted capacity" rating is based on average performance across all zones, and why disk benchmarks show higher throughput at the start of the drive.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 11.1 Overview" next={function() { setActive('nvm') }} nextLabel="11.3 NVM / SSD →" />
            </div>
          )}

          {active === 'nvm' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>11.3 Non-Volatile Memory (NVM / SSD)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Flash-based storage — faster, silent, and fundamentally different from HDDs.</p>

              <InfoBox color="#10b981">
                NVM devices use <strong>NAND flash memory</strong> — transistors that trap electrons to store data. No moving parts — random access is nearly as fast as sequential. Fundamentally different write characteristics from HDDs require special management.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>NAND Flash Types</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { type: 'SLC', bits: '1 bit/cell', endurance: '100K P/E', speed: 'Fastest', color: '#10b981' },
                  { type: 'MLC', bits: '2 bits/cell', endurance: '10K P/E', speed: 'Fast', color: '#3b82f6' },
                  { type: 'TLC', bits: '3 bits/cell', endurance: '3K P/E', speed: 'Medium', color: '#f59e0b' },
                  { type: 'QLC', bits: '4 bits/cell', endurance: '1K P/E', speed: 'Slower', color: '#ef4444' },
                ].map(function(t) {
                  return (
                    <div key={t.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '44', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: t.color, fontSize: 18, marginBottom: 6 }}>{t.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <div>{t.bits}</div>
                        <div>{t.endurance}</div>
                        <div style={{ color: t.color, fontWeight: 600 }}>{t.speed}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Flash Write Characteristics</h3>
              <InfoBox color="#ef4444">
                Flash memory has a critical limitation: <strong>you cannot overwrite data directly</strong>. You must erase a block before writing. Erase operates on large blocks (128KB-4MB). Write operates on smaller pages (4KB-16KB). This creates a fundamental challenge: write amplification.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'Read: very fast — microseconds. Read page directly from flash cell.' },
                  { n: 2, color: '#f59e0b', text: 'Write: must write to a clean (erased) page. If no clean pages available...' },
                  { n: 3, color: '#ef4444', text: 'Erase: must erase an entire block before any page in it can be rewritten. Erase is slow (~2ms) and wears cells.' },
                  { n: 4, color: '#8b5cf6', text: 'Garbage collection: copy valid pages from a partially-used block to a new block, then erase the old block. Background process.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3 }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>SSD Controller — Key Functions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { fn: 'Flash Translation Layer (FTL)', color: '#10b981', desc: 'Maps logical block addresses (what the OS sees) to physical flash locations. Hides flash complexity from OS. Enables wear leveling and bad block management.' },
                  { fn: 'Wear Leveling', color: '#3b82f6', desc: 'Distributes writes evenly across all cells. Both dynamic (for frequently written data) and static (occasionally moves rarely-written data to let cold cells get used). Maximizes SSD lifespan.' },
                  { fn: 'Garbage Collection', color: '#f59e0b', desc: 'Background process that consolidates valid pages from partially-erased blocks, erasing old blocks to maintain free space. Can cause performance spikes ("write cliff").' },
                  { fn: 'ECC (Error Correction)', color: '#8b5cf6', desc: 'Flash cells degrade over time and can flip bits. SSD controller uses ECC (BCH, LDPC) to detect and correct errors. More correction needed as drives age.' },
                ].map(function(f) {
                  return (
                    <div key={f.fn} style={{ background: 'var(--bg-card)', border: '1px solid ' + f.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: f.color, marginBottom: 6, fontSize: 13 }}>{f.fn}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Over-provisioning:</strong> SSDs reserve 7-28% of raw NAND capacity as over-provisioning — invisible to the user. This extra space absorbs write bursts, provides room for garbage collection, and replaces bad blocks. Enterprise SSDs with more over-provisioning (28%) have much better sustained write performance and longer lifespan than consumer drives (7%).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>NVMe vs SATA:</strong> SATA interface was designed for HDDs — its command queue depth of 32 is limiting for SSDs. NVMe (Non-Volatile Memory Express) over PCIe is designed for flash — 65535 queues with 65535 commands each, much lower latency. NVMe SSDs are 5-10x faster than SATA SSDs. Modern M.2 slots on motherboards use NVMe.
              </LearnMore>

              <NavButtons prev={function() { setActive('hdd') }} prevLabel="← 11.2 HDD Structure" next={function() { setActive('scheduling') }} nextLabel="11.4 Disk Scheduling →" />
            </div>
          )}

          {active === 'scheduling' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>11.4 Disk Scheduling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Ordering disk I/O requests to minimize total head movement.</p>

              <InfoBox color="#f59e0b">
                The OS receives multiple disk I/O requests simultaneously. The order in which they are serviced affects performance dramatically. <strong>Disk scheduling algorithms</strong> try to minimize total head movement (seek time), which is the dominant cost.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Example Setup</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Request queue: 98, 183, 37, 122, 14, 124, 65, 67</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Initial head position: cylinder 53. Disk has cylinders 0-199.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>FCFS — First Come, First Served</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Service requests in the order they arrive. Simple, fair, but potentially very high head movement if requests are scattered.</p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3' }}>
                    53 → 98 → 183 → 37 → 122 → 14 → 124 → 65 → 67
                    <span style={{ color: '#ef4444', marginLeft: 8 }}>= 640 cylinders total movement</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Fair, no starvation</span>
                    <span style={{ color: '#ef4444' }}>✗ Wild head movement</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>SSTF — Shortest Seek Time First</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Service the request closest to the current head position. Greedy approach — minimizes each individual seek but not total movement.</p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3' }}>
                    53 → 65 → 67 → 37 → 14 → 98 → 122 → 124 → 183
                    <span style={{ color: '#10b981', marginLeft: 8 }}>= 236 cylinders</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Much better than FCFS</span>
                    <span style={{ color: '#ef4444' }}>✗ Starvation possible for far requests</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>SCAN (Elevator Algorithm)</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Head sweeps from one end of disk to the other, servicing requests in order. At the end, reverses direction. Like an elevator — picks up everyone going in the same direction.</p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3' }}>
                    53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → 37 → 14
                    <span style={{ color: '#8b5cf6', marginLeft: 8 }}>= 331 cylinders</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ No starvation</span>
                    <span style={{ color: '#ef4444' }}>✗ Requests near recently-visited end wait longest</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>C-SCAN (Circular SCAN)</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Like SCAN but only services requests in one direction. When it reaches the end, jumps back to the beginning without servicing requests on return. More uniform wait times.</p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3' }}>
                    53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → 0 → 14 → 37
                    <span style={{ color: '#f59e0b', marginLeft: 8 }}>= 382 cylinders</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Uniform wait times</span>
                    <span style={{ color: '#ef4444' }}>✗ Slightly more total movement than SCAN</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>LOOK and C-LOOK</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>Like SCAN/C-SCAN but the head only goes as far as the last request in each direction — does NOT go all the way to the physical end. More efficient than SCAN.</p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3' }}>
                    LOOK: 53 → 65 → 67 → 98 → 122 → 124 → 183 → 37 → 14
                    <span style={{ color: '#ef4444', marginLeft: 8 }}>= 299 cylinders</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: '#10b981' }}>✓ Best balance of performance and fairness</span>
                    <span style={{ color: '#10b981' }}>✓ Used in Linux (deadline scheduler)</span>
                  </div>
                </div>

              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux I/O schedulers:</strong> Linux has multiple I/O schedulers selectable per device. The Completely Fair Queuing (CFQ/BFQ) scheduler gives each process a fair share of I/O bandwidth. The Deadline scheduler merges nearby requests and enforces time deadlines to prevent starvation. The NOOP/None scheduler does no reordering — used for SSDs (where seek time doesn't matter) and NVMe drives. You can set the scheduler: echo deadline /sys/block/sda/queue/scheduler.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>SSDs and scheduling:</strong> Disk scheduling algorithms were designed for HDDs. For SSDs, seek time is nearly zero — the order of requests matters much less. Modern Linux uses the NVMe or None scheduler for SSDs, which simply passes requests to the device with minimal overhead. The SSD's internal controller does its own command reordering for optimal performance.
              </LearnMore>

              <NavButtons prev={function() { setActive('nvm') }} prevLabel="← 11.3 NVM / SSD" next={function() { setActive('raid') }} nextLabel="11.5 RAID →" />
            </div>
          )}

          {active === 'raid' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>11.5 RAID</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Redundant Array of Independent Disks — combining multiple drives for performance, capacity, or reliability.</p>

              <InfoBox color="#8b5cf6">
                <strong>RAID</strong> uses multiple disks to improve reliability (redundancy) and/or performance (parallelism). Key concepts: <strong>striping</strong> (spreading data across disks for speed), <strong>mirroring</strong> (duplicating data for reliability), and <strong>parity</strong> (storing error-correction information).
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {[
                  {
                    level: 'RAID 0', name: 'Striping', color: '#3b82f6',
                    drives: 2, minDrives: 2, overhead: '0%', canFail: 0,
                    desc: 'Data striped across all disks — no redundancy. A 4-disk RAID 0 can read/write 4x as fast. If ANY disk fails, ALL data is lost.',
                    pros: ['Maximum performance', 'Full capacity utilization'],
                    cons: ['Zero fault tolerance', 'One disk failure = total data loss'],
                    use: 'Temporary/scratch data, video editing workstations',
                  },
                  {
                    level: 'RAID 1', name: 'Mirroring', color: '#10b981',
                    drives: 2, minDrives: 2, overhead: '50%', canFail: 1,
                    desc: 'Exact duplicate of all data on two or more disks. If one disk fails, the mirror takes over immediately — no data loss. Reads can come from either disk.',
                    pros: ['Excellent read performance', 'Simple recovery — just replace failed disk', 'Can survive 1+ failures'],
                    cons: ['50% storage efficiency', 'Write performance not improved'],
                    use: 'OS drives, critical databases, boot drives',
                  },
                  {
                    level: 'RAID 5', name: 'Striping + Distributed Parity', color: '#f59e0b',
                    drives: 3, minDrives: 3, overhead: '1 disk worth', canFail: 1,
                    desc: 'Data and parity striped across all disks. Parity rotates so no single disk holds all parity. Can reconstruct data if ONE disk fails. Good balance of performance, capacity, and reliability.',
                    pros: ['Good read performance', 'Only 1 disk overhead', 'Can survive 1 failure'],
                    cons: ['Write penalty (must calculate parity)', 'Slow rebuild time', 'Vulnerable during rebuild'],
                    use: 'NAS devices, file servers, general storage',
                  },
                  {
                    level: 'RAID 6', name: 'Striping + Double Distributed Parity', color: '#ef4444',
                    drives: 4, minDrives: 4, overhead: '2 disks worth', canFail: 2,
                    desc: 'Like RAID 5 but with TWO parity blocks — can survive TWO simultaneous disk failures. Important for large drive arrays where multiple failures during rebuild are a real risk.',
                    pros: ['Survives 2 simultaneous failures', 'Safe during rebuild'],
                    cons: ['2 disks overhead', 'Higher write penalty than RAID 5'],
                    use: 'Large storage arrays, archival systems, cloud storage',
                  },
                  {
                    level: 'RAID 10', name: 'Mirror + Stripe (RAID 1+0)', color: '#a855f7',
                    drives: 4, minDrives: 4, overhead: '50%', canFail: 1,
                    desc: 'Striped array of mirrored pairs. Combines RAID 1 reliability with RAID 0 performance. Best performance and reliability but highest cost.',
                    pros: ['Excellent read AND write performance', 'Can survive multiple failures (one per mirror pair)', 'Fast rebuild — just copy mirror'],
                    cons: ['50% storage efficiency', 'Most expensive per GB'],
                    use: 'Databases, high-traffic servers, enterprise storage',
                  },
                ].map(function(r) {
                  return (
                    <div key={r.level} style={{ background: 'var(--bg-card)', border: '1px solid ' + r.color + '44', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 800, color: r.color, fontSize: 16 }}>{r.level}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>— {r.name}</div>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, background: '#10b98118', color: '#10b981', padding: '2px 8px', borderRadius: 8 }}>Min: {r.minDrives} drives</span>
                          <span style={{ fontSize: 11, background: '#f59e0b18', color: '#f59e0b', padding: '2px 8px', borderRadius: 8 }}>Overhead: {r.overhead}</span>
                          <span style={{ fontSize: 11, background: r.canFail > 0 ? '#10b98118' : '#ef444418', color: r.canFail > 0 ? '#10b981' : '#ef4444', padding: '2px 8px', borderRadius: 8 }}>Survives: {r.canFail} failure{r.canFail !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{r.desc}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          {r.pros.map(function(p) { return <div key={p} style={{ fontSize: 12, color: '#10b981' }}>✓ {p}</div> })}
                        </div>
                        <div>
                          {r.cons.map(function(c) { return <div key={c} style={{ fontSize: 12, color: '#ef4444' }}>✗ {c}</div> })}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Best for: {r.use}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>RAID is not a backup:</strong> RAID protects against disk hardware failure but not against accidental deletion, ransomware, corruption, or fire/flood. A RAID 1 array with ransomware encryption encrypts both mirrors simultaneously. Always maintain separate backups following the 3-2-1 rule: 3 copies, 2 different media types, 1 offsite.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Software RAID vs hardware RAID:</strong> Hardware RAID uses a dedicated controller with its own processor and battery-backed cache — fast, transparent to the OS, but expensive and creates single point of failure (controller failure). Software RAID (Linux md, Windows Storage Spaces, ZFS) uses the CPU — flexible, cheaper, no vendor lock-in, and ZFS adds checksumming to detect silent data corruption. ZFS RAIDZ is popular in NAS systems.
              </LearnMore>

              <NavButtons prev={function() { setActive('scheduling') }} prevLabel="← 11.4 Disk Scheduling" next={function() { setActive('management') }} nextLabel="11.6 Storage Management →" />
            </div>
          )}

          {active === 'management' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>11.6 Storage Device Management</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Formatting, boot blocks, bad blocks, and swap space.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Disk Formatting</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { step: 'Low-level (Physical) Format', color: '#3b82f6', desc: 'Divides the disk into sectors. Each sector has a header, data area, and error-correction code (ECC). Done by the manufacturer. Creates the track/sector structure. Also called "factory format".' },
                  { step: 'Partition', color: '#10b981', desc: 'Divide the disk into groups of cylinders treated as independent disks. Partition table recorded at fixed location (MBR or GPT). OS can treat each partition as a separate device.' },
                  { step: 'Logical (High-level) Format', color: '#f59e0b', desc: 'Creates a file system in the partition. Records initial file-system data structures (inode tables, FAT, free space bitmap). Also installs boot block if this is the boot partition.' },
                ].map(function(s, i) {
                  return (
                    <div key={s.step} style={{ background: 'var(--bg-card)', border: '1px solid ' + s.color + '33', borderLeft: '4px solid ' + s.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontWeight: 700, color: s.color, fontSize: 13 }}>{s.step}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Boot Block</h3>
              <InfoBox color="#8b5cf6">
                At power-on, the CPU executes code from a fixed ROM location — the <strong>bootstrap loader</strong> (BIOS/UEFI). This finds and loads the <strong>boot block</strong> from disk (typically the first sector of the boot partition). The boot block loads the OS kernel. Modern systems use UEFI which can read FAT partitions and load more sophisticated bootloaders (GRUB).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Bad Block Management</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Simple approach</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Scan for bad sectors during format. Mark them in a bad block table. OS avoids allocating these sectors. The FAT filesystem uses cluster chaining — bad clusters are marked with a special value (0xFFF7 in FAT32).</p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Sector sparing (remapping)</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Modern drives maintain spare sectors in reserve. When a bad sector is detected, the controller automatically remaps it to a spare — transparent to the OS. SMART (Self-Monitoring Analysis and Reporting Technology) tracks reallocated sectors count.</p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Swap Space Management</h3>
              <InfoBox color="#f59e0b">
                Swap space extends RAM using disk. When physical memory is full, the OS moves inactive pages to swap space. Two approaches: a dedicated swap partition (faster — no file system overhead, sequential allocation) or a swap file within an existing file system (more flexible, easier to resize).
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Linux Swap</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Dedicated swap partition or swapfile</li>
                    <li>Multiple swap areas with priorities</li>
                    <li>swappiness kernel parameter (0-100)</li>
                    <li>zswap: compressed in-memory swap cache</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Windows Page File</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>pagefile.sys on NTFS volume</li>
                    <li>Auto-managed or manually sized</li>
                    <li>Compressed memory (MemCompression)</li>
                    <li>Multiple page files on different drives</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>GPT vs MBR partitioning:</strong> MBR (Master Boot Record) is the legacy standard — limited to 4 primary partitions, max 2TB disk size. GPT (GUID Partition Table) is the modern standard — supports 128 partitions, disks up to 9.4 ZB, includes checksums for corruption detection, and stores two copies of the partition table for redundancy. All modern systems use GPT with UEFI. MBR is only used for legacy BIOS compatibility.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>SMART monitoring:</strong> SMART attributes to watch: Reallocated Sectors Count (bad sectors replaced with spares — increasing = drive failing), Pending Sector Count (sectors waiting to be reallocated — data may be lost), Uncorrectable Sector Count (sectors that could not be recovered — data loss occurred). Tools: smartctl -a /dev/sda on Linux, CrystalDiskInfo on Windows.
              </LearnMore>

              <NavButtons prev={function() { setActive('raid') }} prevLabel="← 11.5 RAID" next={function() { setActive('simulator') }} nextLabel="Disk Scheduler Sim →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Disk Scheduling Simulator</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Compare FCFS, SSTF, SCAN, C-SCAN, and LOOK on the same request queue.</p>
              <DiskSchedulerSim />

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Algorithm Comparison Summary</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        {['Algorithm', 'Performance', 'Starvation?', 'Best For'].map(function(h) {
                          return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['FCFS', 'Poor', 'No', 'Light load, simple systems'],
                        ['SSTF', 'Good', 'Yes (far requests)', 'Single user, balanced loads'],
                        ['SCAN', 'Good', 'No', 'Heavy loads, multiple users'],
                        ['C-SCAN', 'Good', 'No', 'Uniform service requirements'],
                        ['LOOK', 'Best', 'No', 'General purpose (Linux default)'],
                      ].map(function(row) {
                        return (
                          <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0ea5e9' }}>{row[0]}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{row[1]}</td>
                            <td style={{ padding: '8px 12px', color: row[2] === 'No' ? '#10b981' : '#ef4444' }}>{row[2]}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{row[3]}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <NavButtons prev={function() { setActive('management') }} prevLabel="← 11.6 Management" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Storage in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore storage devices, disks, and scheduling through code and the terminal.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0ea5e9' }}>Lab 1 — Disk Scheduling in Python</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>Implement SSTF disk scheduling algorithm — find the closest request each time.</p>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#10b981' }}>Lab 2 — Explore Storage in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['lsblk',                       'List block devices (disks, partitions)'],
                  ['df -h',                        'Disk space usage (human readable)'],
                  ['fdisk -l /dev/sda',            'Show partition table of sda'],
                  ['cat /proc/diskstats',          'Disk I/O statistics'],
                  ['iostat -x 1 3',               'Extended I/O stats every 1s (3 times)'],
                  ['hdparm -I /dev/sda',          'HDD info and features'],
                  ['cat /sys/block/sda/queue/scheduler', 'Current I/O scheduler for sda'],
                  ['smartctl -a /dev/sda',        'SMART health info for drive'],
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

              <NavButtons prev={function() { setActive('simulator') }} prevLabel="← Disk Scheduler" next={function() { setActive('quiz') }} nextLabel="Take the Quiz →" />
            </div>
          )}

          {active === 'quiz' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 11.</p>

              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#0ea5e9' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#0ea5e9', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 11!' : quiz.score >= 4 ? 'Good work! Review the sections you missed.' : 'Keep studying — re-read the sections.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/12' }} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 12 →</button>
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