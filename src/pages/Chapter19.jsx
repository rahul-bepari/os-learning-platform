import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '19.1 Network Overview',      icon: '🌐' },
  { id: 'protocols',   title: '19.2 Network Protocols',     icon: '📡' },
  { id: 'tcpip',       title: '19.3 TCP/IP Stack',          icon: '📚' },
  { id: 'distributed', title: '19.4 Distributed Systems',   icon: '🔗' },
  { id: 'naming',      title: '19.5 Naming & DNS',          icon: '🏷️' },
  { id: 'rpc',         title: '19.6 RPC',                   icon: '⚙️' },
  { id: 'dfs',         title: '19.7 Distributed File Sys',  icon: '📁' },
  { id: 'consistency', title: '19.8 Distributed Sync',      icon: '🔄' },
  { id: 'simulator',   title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the main difference between TCP and UDP?',
    options: [
      'TCP is faster than UDP',
      'TCP provides reliable, ordered, connection-oriented delivery; UDP provides unreliable, connectionless, low-overhead delivery',
      'UDP supports more connections than TCP',
      'TCP is only for web traffic'
    ],
    answer: 1,
    explanation: 'TCP provides guaranteed delivery (retransmits lost packets), ordering (packets delivered in order), and flow/congestion control — at the cost of overhead. UDP sends packets with no guarantees — no retransmission, no ordering, no connection setup. UDP is faster and used for DNS, streaming, gaming where some loss is acceptable.'
  },
  {
    q: 'What does DNS (Domain Name System) do?',
    options: [
      'Encrypts network traffic',
      'Translates human-readable domain names to IP addresses',
      'Routes packets between networks',
      'Assigns IP addresses to devices'
    ],
    answer: 1,
    explanation: 'DNS translates domain names (www.example.com) to IP addresses (93.184.216.34). It is a distributed hierarchical database. Without DNS, users would need to remember IP addresses. DNS is queried before almost every network connection — its performance and reliability are critical to the internet.'
  },
  {
    q: 'What is the key challenge of distributed systems that does not exist in single-machine systems?',
    options: [
      'Lack of CPU power',
      'Partial failures — some nodes fail while others continue, creating inconsistent state across the system',
      'Memory limitations',
      'Operating system compatibility'
    ],
    answer: 1,
    explanation: 'Partial failures are unique to distributed systems. In a single machine, either the whole system works or the whole system fails. In a distributed system, some nodes can fail while others continue. This creates difficult questions: did my message arrive? did the other node crash or is it just slow? should I retry? Handling partial failures correctly is the fundamental challenge of distributed systems.'
  },
  {
    q: 'What does the CAP theorem state?',
    options: [
      'Consistency, Availability, and Partition tolerance can all be achieved simultaneously',
      'A distributed system can guarantee at most two of: Consistency, Availability, Partition tolerance',
      'CAP stands for CPU, Availability, Performance',
      'Distributed systems must choose between consistency and performance'
    ],
    answer: 1,
    explanation: 'CAP theorem (Brewer, 2000): in the presence of a network Partition, a distributed system must choose between Consistency (all nodes see the same data) and Availability (every request receives a response). You cannot have all three simultaneously. CP systems (HBase, ZooKeeper) choose consistency; AP systems (Cassandra, DynamoDB) choose availability; CA is only possible without partitions (single node).'
  },
  {
    q: 'What is RPC (Remote Procedure Call)?',
    options: [
      'A way to call functions on remote servers as if they were local function calls',
      'A protocol for transferring files between servers',
      'A type of database query language',
      'A method for encrypting network traffic'
    ],
    answer: 0,
    explanation: 'RPC allows a program to call a procedure (function) that executes on a different machine, making it appear as a local function call. The RPC framework handles marshalling (serializing) parameters, sending them over the network, executing the function on the remote machine, and returning the result. Used in NFS, gRPC, XML-RPC, CORBA.'
  },
  {
    q: 'What is the purpose of a distributed lock manager?',
    options: [
      'To lock files on a distributed file system',
      'To coordinate exclusive access to shared resources across multiple nodes in a distributed system, preventing concurrent conflicts',
      'To manage user authentication across nodes',
      'To encrypt distributed communications'
    ],
    answer: 1,
    explanation: 'A distributed lock manager (DLM) provides mutual exclusion across nodes in a distributed system. When multiple nodes need exclusive access to a shared resource (e.g., a database record), the DLM ensures only one node holds the lock at a time. Examples: Apache ZooKeeper, Redis Redlock, etcd leases. Much more complex than single-machine locks due to network failures and node crashes.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #34d39955', color: '#34d399', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid #34d39933', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#34d399', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function TCPIPVisualizer() {
  const [activeLayer, setActiveLayer] = useState(null)

  const layers = [
    {
      id: 'app', name: 'Application Layer (L7)', color: '#3b82f6',
      protocols: ['HTTP/HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH', 'DHCP'],
      pdu: 'Message / Data',
      desc: 'Provides network services directly to user applications. Handles high-level protocols, data representation, and application-specific logic. Each protocol defines its own message format and semantics.',
      osRole: 'Implemented in user space (libraries, application code). Kernel provides sockets API.'
    },
    {
      id: 'transport', name: 'Transport Layer (L4)', color: '#10b981',
      protocols: ['TCP', 'UDP', 'SCTP', 'QUIC'],
      pdu: 'Segment (TCP) / Datagram (UDP)',
      desc: 'End-to-end communication between processes. TCP: reliable ordered delivery, flow control, congestion control. UDP: fast unreliable delivery. Adds source and destination port numbers.',
      osRole: 'Implemented in the OS kernel (TCP/IP stack). Sockets API bridges user space and kernel.'
    },
    {
      id: 'network', name: 'Network Layer (L3)', color: '#f59e0b',
      protocols: ['IP (IPv4/IPv6)', 'ICMP', 'IGMP', 'BGP', 'OSPF'],
      pdu: 'Packet',
      desc: 'Logical addressing and routing. IP provides best-effort packet delivery across multiple networks. Routing protocols determine paths. No guarantee of delivery, ordering, or no-duplication.',
      osRole: 'Implemented in kernel. IP routing table managed by kernel. Network namespaces isolate routing per container.'
    },
    {
      id: 'link', name: 'Data Link Layer (L2)', color: '#8b5cf6',
      protocols: ['Ethernet', 'WiFi (802.11)', 'ARP', 'PPP'],
      pdu: 'Frame',
      desc: 'Node-to-node delivery on the same network segment. MAC addressing. Error detection (CRC). ARP resolves IP addresses to MAC addresses. Handles medium access control.',
      osRole: 'Partially in kernel (drivers), partially in hardware (NIC). Network device drivers in kernel.'
    },
    {
      id: 'physical', name: 'Physical Layer (L1)', color: '#6e7681',
      protocols: ['Ethernet cables', 'WiFi radio', 'Fiber optic', 'Bluetooth'],
      pdu: 'Bits',
      desc: 'Physical transmission of raw bits over a medium. Defines electrical signals, optical pulses, or radio waves. Bit encoding, modulation, timing. Completely hardware.',
      osRole: 'Hardware only. NIC firmware. OS has no direct role.'
    },
  ]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>TCP/IP Stack Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Click any layer to see details about its role and protocols.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {layers.map(function(layer) {
            return (
              <div key={layer.id} onClick={function() { setActiveLayer(activeLayer === layer.id ? null : layer.id) }} style={{ background: activeLayer === layer.id ? layer.color + '33' : layer.color + '18', border: '2px solid ' + (activeLayer === layer.id ? layer.color : layer.color + '44'), borderRadius: 8, padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: 700, color: layer.color, fontSize: 13, marginBottom: 4 }}>{layer.name}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {layer.protocols.map(function(p) {
                    return <span key={p} style={{ fontSize: 10, background: layer.color + '22', color: layer.color, padding: '1px 6px', borderRadius: 4 }}>{p}</span>
                  })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PDU: {layer.pdu}</div>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeLayer
            ? (function() {
                const layer = layers.find(function(l) { return l.id === activeLayer })
                return (
                  <div>
                    <div style={{ fontWeight: 700, color: layer.color, fontSize: 15, marginBottom: 10 }}>{layer.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{layer.desc}</div>
                    <div style={{ fontSize: 12, color: '#34d399', background: '#34d39918', padding: '6px 10px', borderRadius: 6 }}>
                      <strong>OS Role:</strong> {layer.osRole}
                    </div>
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

function PacketTracer() {
  const [step, setStep] = useState(0)

  const steps = [
    { title: 'Application creates data', layer: 'Application', color: '#3b82f6', desc: 'Browser calls send() with HTTP request bytes. Data is in user space.', data: 'GET / HTTP/1.1\\nHost: example.com' },
    { title: 'Transport layer adds TCP header', layer: 'Transport', color: '#10b981', desc: 'OS kernel TCP stack adds header: src port 54321, dst port 80, seq number, checksum. Breaks data into segments if large.', data: '[TCP: src=54321 dst=80 seq=1001] GET / HTTP/1.1...' },
    { title: 'Network layer adds IP header', layer: 'Network', color: '#f59e0b', desc: 'Kernel IP layer adds header: src IP 192.168.1.5, dst IP 93.184.216.34, TTL=64, protocol=TCP.', data: '[IP: 192.168.1.5→93.184.216.34][TCP: 54321→80] GET /' },
    { title: 'Data link adds Ethernet frame', layer: 'Data Link', color: '#8b5cf6', desc: 'NIC driver adds Ethernet header: src MAC, dst MAC (router\'s MAC via ARP), type=IPv4. Adds CRC trailer.', data: '[ETH: aa:bb→cc:dd][IP][TCP] GET / ... [CRC]' },
    { title: 'Physical transmission', layer: 'Physical', color: '#6e7681', desc: 'Bits sent as electrical signals over cable or radio waves over WiFi. NIC handles this in hardware.', data: '010110100101010011010...' },
    { title: 'Router strips and re-adds L2', layer: 'Network', color: '#f59e0b', desc: 'Router strips Ethernet frame, reads IP destination, looks up route, adds new Ethernet frame for next hop.', data: '[ETH: new][IP: 192.168.1.5→93.184.216.34][TCP][data]' },
    { title: 'Server receives and strips headers', layer: 'Application', color: '#3b82f6', desc: 'Server kernel strips headers layer by layer, delivers HTTP request bytes to the web server process via socket.', data: 'GET / HTTP/1.1\\nHost: example.com' },
  ]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Packet Journey Tracer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Follow an HTTP request as it travels from browser to web server.</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {steps.map(function(s, i) {
          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#34d399' : 'var(--border)', transition: 'all 0.3s' }} />
        })}
      </div>

      <div style={{ background: steps[step].color + '18', border: '1px solid ' + steps[step].color + '44', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, background: steps[step].color + '33', color: steps[step].color, padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{steps[step].layer}</span>
          <span style={{ fontWeight: 700, color: steps[step].color, fontSize: 15 }}>Step {step + 1}: {steps[step].title}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{steps[step].desc}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#34d399', background: '#0d1117', padding: '8px 12px', borderRadius: 6, wordBreak: 'break-all' }}>{steps[step].data}</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={function() { setStep(function(s) { return Math.max(s - 1, 0) }) }} disabled={step === 0} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 18px', borderRadius: 8, cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: step === 0 ? 0.5 : 1 }}>Previous</button>
        <button onClick={function() { setStep(function(s) { return Math.min(s + 1, steps.length - 1) }) }} disabled={step === steps.length - 1} style={{ background: '#34d399', color: '#000', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: step === steps.length - 1 ? 0.5 : 1 }}>Next</button>
        <button onClick={function() { setStep(0) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

export default function Chapter19() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #34d39944', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 19</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🌐</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Networks and Distributed Systems</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          How networked systems communicate — TCP/IP stack, distributed system challenges, DNS, RPC, distributed file systems, and consistency models.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['TCP/IP Stack Visualizer', 'Packet Tracer', 'CAP Theorem', 'RPC Mechanism', 'DNS Resolution'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(52,211,153,0.1)', border: '1px solid #34d39933', color: '#34d399', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#34d399' : 'var(--text-secondary)', background: active === s.id ? 'rgba(52,211,153,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #34d399' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.1 Network Overview</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Fundamentals of computer networking from an OS perspective.</p>

              <InfoBox color="#34d399">
                A <strong>computer network</strong> is a collection of processors that do not share memory or a clock. Each node communicates by sending messages over a communication link. Networks range from local area networks (LANs) to the global internet.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Network Types</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { type: 'LAN (Local Area Network)', color: '#3b82f6', range: 'Building / Campus', speed: '1-100 Gbps', example: 'Office Ethernet, WiFi', desc: 'High speed, low latency, privately owned. Single broadcast domain.' },
                  { type: 'WAN (Wide Area Network)', color: '#10b981', range: 'City / Country / Globe', speed: '1 Mbps - 100 Gbps', example: 'The Internet, MPLS', desc: 'Spans large geographic areas. Uses routers to connect multiple LANs.' },
                  { type: 'MAN (Metropolitan Area)', color: '#f59e0b', range: 'City', speed: '10 Mbps - 10 Gbps', example: 'City fiber ring, cable TV', desc: 'Larger than LAN, smaller than WAN. Often owned by ISPs or municipalities.' },
                  { type: 'PAN (Personal Area)', color: '#8b5cf6', range: 'Person / Room', speed: '1-100 Mbps', example: 'Bluetooth, USB, NFC', desc: 'Very short range. Personal devices communicating with each other.' },
                ].map(function(n) {
                  return (
                    <div key={n.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + n.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: n.color, marginBottom: 4, fontSize: 13 }}>{n.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{n.range} | {n.speed}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>{n.desc}</div>
                      <div style={{ fontSize: 11, color: n.color, fontStyle: 'italic' }}>Example: {n.example}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Network Topology</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { topo: 'Bus', color: '#3b82f6', desc: 'All devices on one cable. Simple, cheap. Single point of failure. Legacy Ethernet.' },
                  { topo: 'Star', color: '#10b981', desc: 'All devices connect to central switch. Modern Ethernet. Switch failure = total failure.' },
                  { topo: 'Ring', color: '#f59e0b', desc: 'Devices in a circle. Token passes around. FDDI, Token Ring. Rare today.' },
                  { topo: 'Mesh', color: '#8b5cf6', desc: 'Every device connected to every other. Redundant. Used in data center spine-leaf.' },
                  { topo: 'Tree', color: '#ef4444', desc: 'Hierarchical star. Typical enterprise network: core, distribution, access layers.' },
                ].map(function(t) {
                  return (
                    <div key={t.topo} style={{ background: t.color + '18', border: '1px solid ' + t.color + '44', borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 100 }}>
                      <div style={{ fontWeight: 700, color: t.color, fontSize: 13, marginBottom: 4 }}>{t.topo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Circuit switching vs packet switching:</strong> Early telephone networks used circuit switching — a dedicated path was reserved for the entire duration of a call. All bandwidth on that path is reserved even during silence. Packet switching (used by the internet) breaks data into packets that independently route through the network, sharing bandwidth with other packets. Packet switching is much more efficient — idle bandwidth can be used by other communications. The internet's robustness comes from packet switching — packets can route around failed links.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Software-Defined Networking (SDN):</strong> Traditional networking has intelligence distributed in each switch/router. SDN separates the control plane (deciding where traffic goes) from the data plane (actually forwarding packets). A centralized SDN controller programs all switches via OpenFlow protocol. This allows dynamic traffic engineering, rapid deployment of new network policies, and network virtualization. Used extensively in cloud data centers (Google uses it for their WAN, called B4).
              </LearnMore>

              <NavButtons next={function() { setActive('protocols') }} nextLabel="19.2 Network Protocols →" />
            </div>
          )}

          {active === 'protocols' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.2 Network Protocols</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Rules and conventions for communication between network devices.</p>

              <InfoBox color="#3b82f6">
                A <strong>protocol</strong> defines the format and order of messages exchanged between communicating entities, and the actions taken on transmission and/or receipt of a message. Without agreed protocols, communication is impossible.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Key Protocols at Each Layer</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  {
                    layer: 'Application', color: '#3b82f6',
                    protocols: [
                      { name: 'HTTP/HTTPS', desc: 'Web browsing. REST APIs. HTTPS adds TLS encryption. HTTP/2 and HTTP/3 (QUIC) add multiplexing.' },
                      { name: 'DNS', desc: 'Domain name to IP resolution. UDP port 53. Hierarchical distributed database.' },
                      { name: 'SMTP/IMAP/POP3', desc: 'Email sending (SMTP), receiving (IMAP keeps on server, POP3 downloads).' },
                      { name: 'SSH', desc: 'Secure remote shell. Encrypted. Replaces Telnet. Also used for tunneling and SFTP.' },
                    ]
                  },
                  {
                    layer: 'Transport', color: '#10b981',
                    protocols: [
                      { name: 'TCP', desc: 'Reliable ordered delivery. 3-way handshake. Flow control. Congestion control. Most internet traffic.' },
                      { name: 'UDP', desc: 'Best-effort datagram delivery. No connection, no guarantees. DNS, streaming, gaming, VoIP.' },
                      { name: 'QUIC', desc: 'Modern transport by Google. UDP-based but with TCP-like reliability. Encrypted by default. HTTP/3 uses QUIC.' },
                    ]
                  },
                  {
                    layer: 'Network', color: '#f59e0b',
                    protocols: [
                      { name: 'IPv4/IPv6', desc: 'Logical addressing. IPv4: 32-bit addresses. IPv6: 128-bit addresses (needed due to IPv4 exhaustion).' },
                      { name: 'ICMP', desc: 'Control messages: ping (echo request/reply), traceroute, "destination unreachable", "TTL exceeded".' },
                      { name: 'BGP', desc: 'Inter-AS routing. How the internet routes traffic between autonomous systems (ISPs, enterprises).' },
                    ]
                  },
                  {
                    layer: 'Data Link', color: '#8b5cf6',
                    protocols: [
                      { name: 'Ethernet (802.3)', desc: 'Wired LAN. MAC addresses. CSMA/CD. Speeds from 10Mbps to 400Gbps.' },
                      { name: 'WiFi (802.11)', desc: 'Wireless LAN. 802.11ac/ax (WiFi 5/6). CSMA/CA instead of CSMA/CD.' },
                      { name: 'ARP', desc: 'Address Resolution Protocol. Maps IP address to MAC address on local network.' },
                    ]
                  },
                ].map(function(group) {
                  return (
                    <div key={group.layer} style={{ background: 'var(--bg-card)', border: '1px solid ' + group.color + '33', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: group.color, marginBottom: 10, fontSize: 14 }}>{group.layer} Layer</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {group.protocols.map(function(p) {
                          return (
                            <div key={p.name} style={{ display: 'flex', gap: 10 }}>
                              <code style={{ fontFamily: 'monospace', color: group.color, fontWeight: 700, fontSize: 12, minWidth: 120, flexShrink: 0 }}>{p.name}</code>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.desc}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>TCP vs UDP</h3>
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Property', 'TCP', 'UDP'].map(function(h) {
                        return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Connection', 'Connection-oriented (3-way handshake)', 'Connectionless'],
                      ['Reliability', 'Guaranteed delivery (retransmits)', 'Best-effort (no retransmit)'],
                      ['Ordering', 'In-order delivery', 'No ordering guarantee'],
                      ['Speed', 'Slower (overhead)', 'Faster (minimal overhead)'],
                      ['Header size', '20-60 bytes', '8 bytes'],
                      ['Use cases', 'Web, email, file transfer, SSH', 'DNS, streaming, gaming, VoIP'],
                    ].map(function(row) {
                      return (
                        <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#34d399' }}>{row[0]}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{row[1]}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{row[2]}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>TCP 3-way handshake:</strong> SYN (client→server: I want to connect, my seq=x), SYN-ACK (server→client: okay, my seq=y, ack=x+1), ACK (client→server: ack=y+1). After this, both sides have synchronized sequence numbers and can exchange data. The handshake adds one round-trip latency to every new connection — this motivated QUIC which establishes connections with 0 or 1 round trip using TLS 1.3.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>TCP congestion control:</strong> TCP adapts its sending rate to avoid congesting the network. Slow start: begin slowly, double rate each RTT. Congestion avoidance: increase linearly when near the limit. On packet loss (congestion signal): cut rate in half. Modern algorithms: CUBIC (Linux default), BBR (Google — estimates bandwidth and RTT directly). BBR can achieve much higher throughput on high-bandwidth, high-latency links like satellite internet.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 19.1 Overview" next={function() { setActive('tcpip') }} nextLabel="19.3 TCP/IP Stack →" />
            </div>
          )}

          {active === 'tcpip' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.3 The TCP/IP Stack</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How the OS implements network communication as a layered stack.</p>

              <InfoBox color="#10b981">
                The TCP/IP model organizes networking into 4-5 layers. Each layer provides services to the layer above and uses services from the layer below. Data travels down the stack on the sender (adding headers) and up the stack on the receiver (stripping headers) — called <strong>encapsulation</strong>.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>TCP/IP Stack Visualizer</h3>
              <TCPIPVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Packet Journey Tracer</h3>
              <PacketTracer />

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>The OS Role in Networking</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[
                  { role: 'Socket API', color: '#3b82f6', desc: 'The OS provides the socket API (socket, bind, listen, accept, connect, send, recv) as the interface between user-space applications and the kernel TCP/IP stack.' },
                  { role: 'TCP/IP Stack in Kernel', color: '#10b981', desc: 'The transport and network layers are implemented in the OS kernel. The kernel maintains connection state, handles retransmission timers, implements congestion control, and manages routing tables.' },
                  { role: 'Network Device Drivers', color: '#f59e0b', desc: 'The kernel uses device drivers to talk to NICs (Network Interface Cards). Drivers handle DMA, interrupts, ring buffers for RX/TX queues.' },
                  { role: 'Network Namespaces', color: '#8b5cf6', desc: 'Linux network namespaces give each container/process its own network stack (interfaces, routing, iptables). Foundation of container networking.' },
                ].map(function(r) {
                  return (
                    <div key={r.role} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + r.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: r.color, fontSize: 13, minWidth: 180 }}>{r.role}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Linux networking internals:</strong> When a packet arrives at the NIC, it goes into a DMA ring buffer. The NIC raises an interrupt. The driver's interrupt handler processes packets from the ring (using NAPI polling for efficiency). sk_buff (socket buffer) structures carry packets through the kernel. netif_receive_skb() passes the packet up through the protocol stack. ip_rcv() handles IP, tcp_v4_rcv() handles TCP, finally the data is placed in the socket's receive buffer and the waiting process is woken up.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Kernel bypass networking (DPDK, io_uring):</strong> For ultra-low latency networking (trading, CDN, 5G), the kernel's TCP/IP stack adds too much overhead. DPDK (Data Plane Development Kit) allows user-space code to access NIC hardware directly, bypassing the kernel entirely. A single core can process millions of packets per second. Used by cloud providers for virtual networking (AWS VPC, Azure), high-frequency trading, and network function virtualization (NFV).
              </LearnMore>

              <NavButtons prev={function() { setActive('protocols') }} prevLabel="← 19.2 Protocols" next={function() { setActive('distributed') }} nextLabel="19.4 Distributed Systems →" />
            </div>
          )}

          {active === 'distributed' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.4 Distributed Systems</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The unique challenges of systems that span multiple machines.</p>

              <InfoBox color="#f59e0b">
                A <strong>distributed system</strong> is a collection of independent computers that appears to users as a single coherent system. The fundamental challenge: these computers communicate only by passing messages over an unreliable network, and they can fail independently.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Why Distributed Systems are Hard</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { challenge: 'Partial failures', color: '#ef4444', desc: 'Some nodes fail while others continue. The system must detect and handle failures without knowing if a node is slow, crashed, or has a network partition.' },
                  { challenge: 'No shared clock', color: '#f97316', desc: 'Different machines have different clocks that drift. Ordering events across machines is impossible without protocols like logical clocks (Lamport) or vector clocks.' },
                  { challenge: 'No shared memory', color: '#f59e0b', desc: 'Machines cannot directly read each other\'s memory. All sharing must be explicit via message passing. Consistency of shared state requires protocols.' },
                  { challenge: 'Network unreliability', color: '#8b5cf6', desc: 'Messages can be lost, duplicated, reordered, or delayed arbitrarily. Protocols must handle all these cases to be correct.' },
                  { challenge: 'Concurrency', color: '#3b82f6', desc: 'Multiple nodes making changes simultaneously without coordination leads to conflicts and inconsistency.' },
                ].map(function(c) {
                  return (
                    <div key={c.challenge} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + c.color + '33', borderLeft: '4px solid ' + c.color, borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: c.color, fontSize: 13, minWidth: 160 }}>{c.challenge}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>CAP Theorem</h3>
              <InfoBox color="#34d399">
                <strong>CAP Theorem (Brewer, 2000):</strong> In the presence of a network Partition, a distributed system can guarantee at most one of:
                <br /><br />
                <strong>C — Consistency:</strong> Every read receives the most recent write or an error. All nodes see the same data at the same time.
                <br />
                <strong>A — Availability:</strong> Every request receives a (non-error) response — but it might not contain the most recent write.
                <br />
                <strong>P — Partition Tolerance:</strong> The system continues operating even when network partitions (communication failures) occur.
                <br /><br />
                Since network partitions WILL happen, real systems must choose between C and A.
              </InfoBox>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { choice: 'CP (Consistent + Partition Tolerant)', color: '#3b82f6', desc: 'Return error or wait during partition rather than return stale data. Examples: ZooKeeper, HBase, etcd, MongoDB (with write concern majority). Used for: coordination, financial transactions, leader election.' },
                  { choice: 'AP (Available + Partition Tolerant)', color: '#10b981', desc: 'Return possibly stale data during partition rather than return error. Examples: Cassandra, DynamoDB, CouchDB, DNS. Used for: shopping carts, social media feeds, DNS caching — eventual consistency is acceptable.' },
                ].map(function(c) {
                  return (
                    <div key={c.choice} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '44', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: c.color, marginBottom: 8, fontSize: 13 }}>{c.choice}</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</p>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Consistency Models</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { model: 'Strong/Linearizable', color: '#ef4444', desc: 'All operations appear to execute atomically at some point between their start and end. The strongest guarantee. Expensive — requires synchronization.' },
                  { model: 'Sequential Consistency', color: '#f59e0b', desc: 'Operations appear to execute in some sequential order that is consistent with each process\'s program order. Weaker than linearizable but still strong.' },
                  { model: 'Eventual Consistency', color: '#10b981', desc: 'If no new updates, all replicas will eventually converge to the same value. Very weak. Used by DNS, Cassandra, DynamoDB. "Eventually consistent" is often "consistent within seconds."' },
                  { model: 'Causal Consistency', color: '#3b82f6', desc: 'Causally related operations are seen by all processes in the same order. Concurrent operations can be in different orders on different nodes. MongoDB offers this.' },
                ].map(function(m) {
                  return (
                    <div key={m.model} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + m.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: m.color, fontSize: 13, minWidth: 180 }}>{m.model}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Fallacies of distributed computing:</strong> Classic list by Peter Deutsch: (1) The network is reliable. (2) Latency is zero. (3) Bandwidth is infinite. (4) The network is secure. (5) Topology does not change. (6) There is one administrator. (7) Transport cost is zero. (8) The network is homogeneous. Every distributed system developer learns these the hard way. Defensive design assumes all these are false.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Two Generals Problem:</strong> Two armies must coordinate an attack but can only communicate via messengers that may be captured. They cannot achieve certainty — the last confirmation message might not arrive. This proves that 100% reliable agreement is impossible over an unreliable channel. This is why distributed commit protocols (2PC) cannot guarantee completion in the face of failures — they can only make failures less likely.
              </LearnMore>

              <NavButtons prev={function() { setActive('tcpip') }} prevLabel="← 19.3 TCP/IP" next={function() { setActive('naming') }} nextLabel="19.5 Naming and DNS →" />
            </div>
          )}

          {active === 'naming' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.5 Naming and DNS</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How distributed systems locate each other — the Domain Name System.</p>

              <InfoBox color="#8b5cf6">
                In a distributed system, processes must be able to find each other. DNS maps human-readable names to IP addresses. It is one of the most critical pieces of internet infrastructure — queried billions of times per second worldwide.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>DNS Hierarchy</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24, maxWidth: 400 }}>
                {[
                  { level: 'Root DNS servers (.)', color: '#ef4444', desc: '13 root server clusters (A-M). Managed by ICANN/IANA. Know TLD server addresses.' },
                  { level: 'TLD servers (.com, .org, .uk)', color: '#f97316', desc: 'Top-Level Domain servers. Know authoritative servers for each domain.' },
                  { level: 'Authoritative DNS servers', color: '#f59e0b', desc: 'example.com DNS servers. Have the actual A/AAAA records for the domain.' },
                  { level: 'Recursive resolver (ISP/8.8.8.8)', color: '#10b981', desc: 'Your local DNS resolver. Caches results. Does the hierarchical lookup.' },
                  { level: 'Your computer', color: '#3b82f6', desc: 'Local DNS cache. Asks recursive resolver if not cached.' },
                ].map(function(l) {
                  return (
                    <div key={l.level} style={{ background: l.color + '22', border: '1px solid ' + l.color + '44', borderRadius: 6, padding: '8px 14px' }}>
                      <div style={{ fontWeight: 600, color: l.color, fontSize: 12 }}>{l.level}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{l.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>DNS Resolution Process</h3>
              <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Resolving www.example.com */</div>
                  <div>1. Check local cache → not found</div>
                  <div>2. Ask recursive resolver (8.8.8.8): www.example.com?</div>
                  <div>3. Resolver asks root server: who handles .com?</div>
                  <div>   Root: "ask the .com TLD servers at 192.5.6.30"</div>
                  <div>4. Resolver asks .com TLD: who handles example.com?</div>
                  <div>   TLD: "ask ns1.example.com at 205.251.196.1"</div>
                  <div>5. Resolver asks ns1.example.com: www.example.com?</div>
                  <div style={{ color: '#10b981' }}>   Auth: "www.example.com = 93.184.216.34, TTL=3600"</div>
                  <div>6. Resolver returns 93.184.216.34 to your computer</div>
                  <div>7. Browser connects to 93.184.216.34:443</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>DNS Record Types</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { type: 'A', color: '#3b82f6', desc: 'Maps hostname to IPv4 address. Most common record.' },
                  { type: 'AAAA', color: '#3b82f6', desc: 'Maps hostname to IPv6 address.' },
                  { type: 'CNAME', color: '#10b981', desc: 'Alias. www.example.com → example.com' },
                  { type: 'MX', color: '#f59e0b', desc: 'Mail exchange. Where to send email for this domain.' },
                  { type: 'TXT', color: '#8b5cf6', desc: 'Arbitrary text. Used for SPF, DKIM, domain verification.' },
                  { type: 'NS', color: '#ef4444', desc: 'Name server. Which servers are authoritative for this domain.' },
                  { type: 'PTR', color: '#f97316', desc: 'Reverse DNS. IP address to hostname mapping.' },
                  { type: 'SRV', color: '#34d399', desc: 'Service location. Port and hostname for specific services.' },
                ].map(function(r) {
                  return (
                    <div key={r.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + r.color + '33', borderRadius: 8, padding: '8px 12px', display: 'flex', gap: 8 }}>
                      <code style={{ fontFamily: 'monospace', color: r.color, fontWeight: 700, fontSize: 12, minWidth: 40 }}>{r.type}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>DNS caching and TTL:</strong> Every DNS record has a TTL (Time To Live). Resolvers cache responses for the TTL duration — no need to query again. Low TTL (60s) allows fast changes but increases DNS load. High TTL (86400s = 1 day) reduces DNS traffic but means changes propagate slowly. During migrations, temporarily lower TTL to 60s days in advance, make the change, then raise TTL back. This is how "DNS propagation" works.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>DNS over HTTPS (DoH) and DNS over TLS (DoT):</strong> Traditional DNS is unencrypted — your ISP and anyone on the network can see every domain you look up. DoH (RFC 8484) sends DNS queries inside HTTPS — looks like regular web traffic. DoT (RFC 7858) uses TLS on port 853. Both encrypt queries and prevent tampering. Cloudflare (1.1.1.1), Google (8.8.8.8), and most modern browsers support DoH. Privacy benefit: your ISP cannot see your DNS queries. Security benefit: prevents DNS spoofing.
              </LearnMore>

              <NavButtons prev={function() { setActive('distributed') }} prevLabel="← 19.4 Distributed" next={function() { setActive('rpc') }} nextLabel="19.6 RPC →" />
            </div>
          )}

          {active === 'rpc' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.6 Remote Procedure Call (RPC)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Making remote function calls look like local calls.</p>

              <InfoBox color="#f97316">
                <strong>RPC</strong> allows a program to call a procedure on a remote machine as if it were a local call. The RPC framework handles all network communication transparently — marshalling parameters, sending requests, receiving responses, and unmarshalling results.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>How RPC Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { n: 1, color: '#3b82f6', text: 'Client calls a local stub procedure that looks like the real function.' },
                  { n: 2, color: '#3b82f6', text: 'Client stub marshals (serializes) parameters into a message.' },
                  { n: 3, color: '#f59e0b', text: 'Message sent over network to server via socket.' },
                  { n: 4, color: '#10b981', text: 'Server skeleton receives message, unmarshals parameters.' },
                  { n: 5, color: '#10b981', text: 'Server skeleton calls actual server function with the parameters.' },
                  { n: 6, color: '#10b981', text: 'Server function executes and returns result to skeleton.' },
                  { n: 7, color: '#f59e0b', text: 'Skeleton marshals result and sends response back to client.' },
                  { n: 8, color: '#3b82f6', text: 'Client stub receives response, unmarshals result, returns to client.' },
                ].map(function(s) {
                  return (
                    <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.n}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.text}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>RPC Challenges</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { challenge: 'Marshalling/Serialization', color: '#3b82f6', desc: 'Converting data structures to bytes for network transmission. Must handle different data types, byte order (endianness), and structure layouts.' },
                  { challenge: 'At-Least-Once vs At-Most-Once', color: '#f59e0b', desc: 'If no response received, should we retry? Idempotent calls: retry safely. Non-idempotent (e.g., "charge credit card"): retrying could cause double charges. Exactly-once is hard.' },
                  { challenge: 'Failure handling', color: '#ef4444', desc: 'Did the server crash before or after executing? Did the network fail? Cannot distinguish these cases without additional state. Must design for ambiguity.' },
                  { challenge: 'Performance', color: '#8b5cf6', desc: 'Network round-trip adds milliseconds. Batching multiple calls, streaming, and async RPC mitigate latency. gRPC uses HTTP/2 multiplexing for efficiency.' },
                ].map(function(c) {
                  return (
                    <div key={c.challenge} style={{ background: 'var(--bg-card)', border: '1px solid ' + c.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: c.color, marginBottom: 6, fontSize: 13 }}>{c.challenge}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Modern RPC Frameworks</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { name: 'gRPC', color: '#3b82f6', note: 'Google. Protocol Buffers. HTTP/2. Streaming. Most popular.' },
                  { name: 'Thrift', color: '#f59e0b', note: 'Facebook. Multiple languages. Used in Cassandra, HBase.' },
                  { name: 'JSON-RPC', color: '#10b981', note: 'Simple. JSON over HTTP. Easy to debug. Web-friendly.' },
                  { name: 'XML-RPC', color: '#6e7681', note: 'Legacy. XML over HTTP. Basis of SOAP. Verbose.' },
                  { name: 'Cap\'n Proto', color: '#8b5cf6', note: 'Zero-copy. Extremely fast. Used in Cloudflare.' },
                ].map(function(f) {
                  return (
                    <div key={f.name} style={{ background: f.color + '18', border: '1px solid ' + f.color + '44', borderRadius: 8, padding: '8px 14px' }}>
                      <div style={{ fontWeight: 700, color: f.color, fontSize: 13 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.note}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>gRPC and Protocol Buffers:</strong> gRPC uses Protocol Buffers (protobuf) for serialization — a binary format that is 3-10x smaller and faster than JSON. You define a .proto file with message types and service definitions. The protoc compiler generates client and server code in your language. gRPC over HTTP/2 supports bidirectional streaming — the client and server can both send streams of messages on a single connection. Used by Kubernetes, microservices architectures, and many cloud APIs.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>The distributed transaction problem:</strong> A payment requires: debit account A AND credit account B. If the server crashes between debit and credit, money disappears. 2-Phase Commit (2PC) solves this with a prepare phase (both sides vote ready) and commit phase. But 2PC can block indefinitely if the coordinator crashes after prepare. 3-Phase Commit adds a timeout. Saga pattern (distributed): break into compensating transactions — if credit fails, run a refund transaction. Modern distributed databases use Paxos or Raft for consensus.
              </LearnMore>

              <NavButtons prev={function() { setActive('naming') }} prevLabel="← 19.5 Naming" next={function() { setActive('dfs') }} nextLabel="19.7 Distributed FS →" />
            </div>
          )}

          {active === 'dfs' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.7 Distributed File Systems</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Storing and accessing files across multiple machines.</p>

              <InfoBox color="#3b82f6">
                A <strong>distributed file system (DFS)</strong> provides a file system interface to data stored across multiple networked machines. Clients access remote files as if they were local. The DFS handles distribution, replication, and fault tolerance transparently.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>DFS Design Goals</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { goal: 'Transparency', color: '#3b82f6', desc: 'Location transparency — clients do not need to know where files are stored. Access transparency — same API as local file system.' },
                  { goal: 'Fault tolerance', color: '#10b981', desc: 'File system continues operating when servers fail. Replication ensures data survives hardware failures.' },
                  { goal: 'Scalability', color: '#f59e0b', desc: 'Performance scales as more servers are added. No single bottleneck. Supports petabytes of data and millions of files.' },
                  { goal: 'Performance', color: '#8b5cf6', desc: 'Client-side caching reduces network traffic. Parallelism across multiple servers. Latency hidden by prefetching.' },
                ].map(function(g) {
                  return (
                    <div key={g.goal} style={{ background: 'var(--bg-card)', border: '1px solid ' + g.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: g.color, marginBottom: 6, fontSize: 13 }}>{g.goal}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Notable Distributed File Systems</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    name: 'GFS (Google File System)', color: '#3b82f6',
                    desc: 'Designed for large sequential reads/writes of huge files (100MB-GB each). Single master for metadata, multiple chunk servers (64MB chunks). Replication factor 3. Relaxed consistency for performance. Influenced Hadoop HDFS.',
                    use: 'Google web crawl, MapReduce, BigTable'
                  },
                  {
                    name: 'HDFS (Hadoop DFS)', color: '#f59e0b',
                    desc: 'Open source GFS clone. Namenode (metadata) + Datanodes (data blocks, 128MB each). Write-once, read-many model. Designed for batch processing, not low latency. Used with MapReduce for big data.',
                    use: 'Hadoop ecosystem, data warehouses, data lakes'
                  },
                  {
                    name: 'Ceph', color: '#10b981',
                    desc: 'Object, block, and file storage in one. RADOS object store underneath. No single point of failure — CRUSH algorithm eliminates dedicated metadata servers. Used by OpenStack, Kubernetes.',
                    use: 'Cloud storage backends, OpenStack, enterprise storage'
                  },
                  {
                    name: 'NFS (Network File System)', color: '#8b5cf6',
                    desc: 'Classic Unix network file system (covered in Chapter 15). Server exports directories; clients mount them. Stateless server (NFSv3). Standard for enterprise file sharing.',
                    use: 'Enterprise file sharing, home directories, /home over NFS'
                  },
                ].map(function(dfs) {
                  return (
                    <div key={dfs.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + dfs.color + '33', borderLeft: '4px solid ' + dfs.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: dfs.color, fontSize: 14, marginBottom: 8 }}>{dfs.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{dfs.desc}</div>
                      <div style={{ fontSize: 12, color: dfs.color, background: dfs.color + '11', padding: '3px 10px', borderRadius: 6, display: 'inline-block' }}>Used for: {dfs.use}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>GFS design lessons:</strong> Google's 2003 GFS paper revealed surprising design decisions. Component failures are the norm (use commodity hardware, expect failures). Files are huge (multi-GB) and write-once-read-many — no need to optimize for many small files. Sequential reads dominate — random reads are rare. Appending is the primary write pattern (log files, search indices). These observations led to relaxing consistency guarantees that would never matter in practice, enabling much higher performance.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Object storage (S3):</strong> Amazon S3 (2006) pioneered object storage — flat namespace of objects (key-value pairs) rather than hierarchical files. No directories, no inodes, no POSIX. Objects can be terabytes. Simple HTTP API (PUT/GET/DELETE). Eventual consistency (now strong consistency). Infinitely scalable. S3 is now the de facto standard for data lakes, backup, and static content. Most new data systems are designed with "S3-compatible" storage as the backend.
              </LearnMore>

              <NavButtons prev={function() { setActive('rpc') }} prevLabel="← 19.6 RPC" next={function() { setActive('consistency') }} nextLabel="19.8 Distributed Sync →" />
            </div>
          )}

          {active === 'consistency' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>19.8 Distributed Synchronization</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Coordinating actions across multiple nodes — clocks, mutual exclusion, and consensus.</p>

              <InfoBox color="#34d399">
                Distributed systems need coordination: who goes first? what time is it? who is the leader? These problems that are trivial on a single machine become complex challenges when nodes communicate only via unreliable message passing.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Logical Clocks</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  Physical clocks drift. In distributed systems, we cannot rely on wall-clock time for ordering events. <strong>Lamport clocks</strong> provide a logical notion of "happened before."
                </p>
                <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Lamport Clock Rules */</div>
                  <div>1. Before sending a message: increment local clock</div>
                  <div>2. On receiving a message: clock = max(local, received) + 1</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Vector Clocks: track causality per node */</div>
                  <div>Node A: [1,0,0], Node B: [1,2,0], Node C: [1,2,1]</div>
                  <div style={{ color: '#10b981' }}>VC_A before VC_B if every element of VC_A &lt;= VC_B</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Distributed Mutual Exclusion</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { algo: 'Centralized (Token-based)', color: '#3b82f6', desc: 'One coordinator holds the "token" (lock). Processes request the token from the coordinator. Simple but coordinator is a single point of failure and bottleneck. O(3) messages per critical section.' },
                  { algo: 'Ricart-Agrawala (Distributed)', color: '#10b981', desc: 'To enter CS: broadcast REQUEST to all, wait for OK from all. To grant: if not in CS, reply OK; else defer. O(2n) messages. No single point of failure. Complex: all nodes must respond.' },
                  { algo: 'ZooKeeper / etcd (Practical)', color: '#f59e0b', desc: 'Modern distributed lock services. Clients create ephemeral nodes (auto-deleted if client disconnects). Watch notifications for lock acquisition. Highly available, fault tolerant. Used in production.' },
                ].map(function(a) {
                  return (
                    <div key={a.algo} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '33', borderLeft: '4px solid ' + a.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: a.color, marginBottom: 6, fontSize: 13 }}>{a.algo}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Consensus — Paxos and Raft</h3>
              <InfoBox color="#8b5cf6">
                The consensus problem: how do multiple nodes agree on a single value even when some nodes fail? This underlies leader election, distributed transactions, and replicated state machines.
                <br /><br />
                <strong>Paxos</strong> (Lamport, 1989): The foundational consensus algorithm. Notoriously difficult to understand and implement. Two phases: prepare/promise and accept/accepted.
                <br /><br />
                <strong>Raft</strong> (Ongaro and Ousterhout, 2014): Designed to be understandable. Leader election + log replication. Most new systems use Raft. Used by etcd, CockroachDB, TiKV, Consul.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #8b5cf644', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Raft leader election */</div>
                  <div>1. All nodes start as Followers</div>
                  <div>2. If no heartbeat from leader (election timeout): become Candidate</div>
                  <div>3. Candidate increments term, votes for itself, sends RequestVote to all</div>
                  <div>4. If majority votes received: become Leader</div>
                  <div>5. Leader sends heartbeats (AppendEntries) to prevent new elections</div>
                  <div style={{ color: '#10b981' }}>6. Leader handles all writes, replicates to followers</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Raft in production:</strong> etcd is a distributed key-value store using Raft, and is the backbone of Kubernetes — it stores all cluster state (which pods run where, service configs, secrets). etcd requires a quorum (majority) of nodes to be available for writes. With 3 nodes, can tolerate 1 failure. With 5 nodes, can tolerate 2 failures. Adding more nodes reduces write performance but increases fault tolerance. Google's Chubby (similar to ZooKeeper) uses Paxos and handles Google-scale coordination.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Byzantine fault tolerance:</strong> Paxos and Raft assume nodes fail by crashing (fail-stop). Byzantine faults occur when nodes behave arbitrarily — sending incorrect data, lying about their state (could be malicious nodes or hardware errors). Byzantine Fault Tolerant (BFT) consensus requires 3f+1 nodes to tolerate f Byzantine nodes — much more expensive. Blockchain systems use BFT variants (PBFT, Tendermint) when participants are untrusted.
              </LearnMore>

              <NavButtons prev={function() { setActive('dfs') }} prevLabel="← 19.7 Distributed FS" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Network and Distributed Systems Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for TCP/IP and packet tracing.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>TCP/IP Stack Visualizer</h3>
              <TCPIPVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Packet Journey Tracer</h3>
              <PacketTracer />

              <NavButtons prev={function() { setActive('consistency') }} prevLabel="← 19.8 Sync" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Networking in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore networking through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#34d399' }}>Lab 1 — Socket Programming in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Network Commands in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['ip addr show',                'Show network interfaces and IP addresses'],
                  ['ip route show',               'Show routing table'],
                  ['ss -tlnp',                    'Show listening TCP sockets'],
                  ['dig google.com',              'DNS lookup for google.com'],
                  ['ping -c 3 8.8.8.8',          'Ping Google DNS (3 packets)'],
                  ['traceroute 8.8.8.8',          'Trace route to Google DNS'],
                  ['curl -I https://example.com', 'HTTP HEAD request'],
                  ['netstat -s | head -20',        'Network statistics summary'],
                  ['cat /proc/net/tcp',           'Raw TCP connection table'],
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 19.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#34d399' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#34d399', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#34d399', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 19!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/20' }} style={{ background: '#34d399', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 20 →</button>
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