import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '17.1 Goals of Protection',   icon: '🎯' },
  { id: 'principles',  title: '17.2 Protection Principles', icon: '📋' },
  { id: 'domain',      title: '17.3 Protection Domains',    icon: '🏰' },
  { id: 'matrix',      title: '17.4 Access Matrix',         icon: '📊' },
  { id: 'implement',   title: '17.5 Implementation',        icon: '⚙️' },
  { id: 'revocation',  title: '17.6 Revocation',            icon: '🚫' },
  { id: 'rbac',        title: '17.7 Role-Based Access',     icon: '👥' },
  { id: 'mandatory',   title: '17.8 Mandatory Protection',  icon: '🔒' },
  { id: 'simulator',   title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is the difference between protection and security?',
    options: [
      'They are the same concept',
      'Protection deals with internal mechanisms controlling access to resources; security deals with defending against external threats',
      'Security is implemented in hardware; protection in software',
      'Protection is for files; security is for networks'
    ],
    answer: 1,
    explanation: 'Protection focuses on the internal OS mechanisms that control access to resources — who can access what objects with what operations. Security focuses on defending the system against external and internal attackers. Protection mechanisms are the tools; security is the broader goal of defending the system.'
  },
  {
    q: 'What does an access matrix represent?',
    options: [
      'A matrix of encryption keys',
      'A table where rows are domains (subjects), columns are objects, and entries define allowed operations for each domain on each object',
      'A network routing table',
      'A matrix of process priorities'
    ],
    answer: 1,
    explanation: 'The access matrix is a conceptual model: rows represent protection domains (subjects/processes), columns represent objects (files, devices, etc.), and each cell access_matrix[domain][object] contains the set of allowed operations (read, write, execute, etc.). It defines the complete access policy of the system.'
  },
  {
    q: 'What is a capability in the context of protection?',
    options: [
      'A measure of CPU performance',
      'A token held by a subject that grants specific rights to a specific object — like a key',
      'The maximum privilege level of a process',
      'A hardware feature for memory protection'
    ],
    answer: 1,
    explanation: 'A capability is an unforgeable token that grants its holder specific access rights to a specific object. Think of it as a key — whoever holds the key can access the lock. Capabilities implement access matrix columns per subject — each process holds a list of (object, rights) pairs. Used in capability-based OS designs like seL4.'
  },
  {
    q: 'What is an Access Control List (ACL)?',
    options: [
      'A list of active processes in the system',
      'Per-object list of (domain, rights) pairs — defines who can access this object and how',
      'A list of system calls available to a process',
      'A list of network access rules'
    ],
    answer: 1,
    explanation: 'An ACL is attached to each object and lists which domains (users, groups, processes) have which access rights to that object. It is a column of the access matrix stored with the object. Unix permission bits are a simplified ACL (owner, group, others). NTFS and Linux POSIX ACLs provide full per-user/group ACLs.'
  },
  {
    q: 'What is role-based access control (RBAC)?',
    options: [
      'Access control based on the time of day',
      'Assigning permissions to roles rather than individual users — users are assigned roles and inherit their permissions',
      'Access control based on the physical location of the user',
      'Granting all permissions to administrators'
    ],
    answer: 1,
    explanation: 'RBAC assigns permissions to roles (admin, developer, auditor) rather than individual users. Users are assigned roles. This simplifies management — to give a new user all developer permissions, just assign them the developer role. Permissions change by modifying the role, not each user individually. Most enterprise systems use RBAC.'
  },
  {
    q: 'What is the Bell-LaPadula model designed to enforce?',
    options: [
      'Integrity — preventing unauthorized modification',
      'Confidentiality — preventing unauthorized reading of classified information (no read up, no write down)',
      'Availability — ensuring resources are always accessible',
      'Authentication — verifying user identity'
    ],
    answer: 1,
    explanation: 'Bell-LaPadula is a mandatory access control model for confidentiality. Two rules: (1) Simple Security (no read up) — a subject cannot read an object at a higher classification level. (2) Star Property (no write down) — a subject cannot write to an object at a lower classification level. This prevents classified information from leaking to lower classifications.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #a78bfa55', color: '#a78bfa', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(167,139,250,0.06)', border: '1px solid #a78bfa33', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#a78bfa', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

// ── Access Matrix Simulator ───────────────────────────────────
function AccessMatrixSim() {
  const [domains] = useState(['D1 (User Alice)', 'D2 (User Bob)', 'D3 (Root)', 'D4 (WebServer)'])
  const [objects]  = useState(['File: passwd', 'File: webroot', 'File: log.txt', 'Printer', 'Socket:80'])
  const [matrix, setMatrix] = useState([
    [['read'], ['read','write'], ['read','write'], [], []],
    [[], ['read'], ['read','write'], ['print'], []],
    [['read','write'], ['read','write'], ['read','write'], ['print'], ['bind','listen']],
    [[], ['read'], ['write'], [], ['bind','listen']],
  ])
  const [selected, setSelected] = useState(null)

  const allRights = ['read', 'write', 'execute', 'print', 'bind', 'listen']

  function toggleRight(di, oi, right) {
    setMatrix(function(m) {
      const nm = m.map(function(row) { return row.map(function(cell) { return [...cell] }) })
      const cell = nm[di][oi]
      const idx = cell.indexOf(right)
      if (idx >= 0) cell.splice(idx, 1)
      else cell.push(right)
      return nm
    })
  }

  const rightColor = { read: '#3b82f6', write: '#ef4444', execute: '#10b981', print: '#f59e0b', bind: '#8b5cf6', listen: '#f97316' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Access Matrix Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Click a cell to select it, then toggle rights. Rows = domains, Columns = objects.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 12px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', textAlign: 'left', border: '1px solid var(--border)' }}>Domain / Object</th>
              {objects.map(function(obj) {
                return <th key={obj} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', color: '#a78bfa', border: '1px solid var(--border)', fontWeight: 700, whiteSpace: 'nowrap' }}>{obj}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {domains.map(function(dom, di) {
              return (
                <tr key={dom}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#10b981', border: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-secondary)' }}>{dom}</td>
                  {objects.map(function(obj, oi) {
                    const isSelected = selected && selected[0] === di && selected[1] === oi
                    const rights = matrix[di][oi]
                    return (
                      <td key={obj} onClick={function() { setSelected(isSelected ? null : [di, oi]) }} style={{ padding: '6px 10px', border: '1px solid var(--border)', cursor: 'pointer', background: isSelected ? '#a78bfa22' : rights.length > 0 ? 'rgba(16,185,129,0.05)' : 'transparent', minWidth: 80 }}>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {rights.length === 0
                            ? <span style={{ fontSize: 10, color: '#484f58' }}>—</span>
                            : rights.map(function(r) {
                              return <span key={r} style={{ fontSize: 10, background: (rightColor[r] || '#6e7681') + '33', color: rightColor[r] || '#6e7681', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>{r}</span>
                            })
                          }
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ background: '#a78bfa18', border: '1px solid #a78bfa44', borderRadius: 10, padding: 16 }}>
          <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 10, fontSize: 14 }}>
            Editing: {domains[selected[0]]} → {objects[selected[1]]}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allRights.map(function(right) {
              const has = matrix[selected[0]][selected[1]].includes(right)
              return (
                <button key={right} onClick={function() { toggleRight(selected[0], selected[1], right) }} style={{ background: has ? (rightColor[right] || '#6e7681') + '33' : 'var(--bg-secondary)', color: has ? rightColor[right] || '#6e7681' : 'var(--text-muted)', border: '1px solid ' + (has ? rightColor[right] || '#6e7681' : 'var(--border)'), padding: '4px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: has ? 700 : 400 }}>
                  {has ? '✓ ' : '+ '}{right}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── RBAC Simulator ────────────────────────────────────────────
function RBACSim() {
  const [roles] = useState({
    admin:     ['read', 'write', 'delete', 'execute', 'manage_users'],
    developer: ['read', 'write', 'execute'],
    auditor:   ['read'],
    operator:  ['read', 'execute'],
  })
  const [userRoles, setUserRoles] = useState({
    alice: ['developer'],
    bob:   ['auditor'],
    carol: ['admin'],
    dave:  ['developer', 'operator'],
  })
  const [resources] = useState(['source_code', 'database', 'server_config', 'audit_logs', 'user_accounts'])
  const [resourcePerms] = useState({
    source_code:   ['read', 'write', 'execute'],
    database:      ['read', 'write', 'delete'],
    server_config: ['read', 'write'],
    audit_logs:    ['read'],
    user_accounts: ['read', 'write', 'delete', 'manage_users'],
  })
  const [checkUser, setCheckUser] = useState('alice')
  const [checkResource, setCheckResource] = useState('source_code')
  const [checkOp, setCheckOp] = useState('write')

  function getUserRights(user) {
    const rights = new Set()
    const uRoles = userRoles[user] || []
    uRoles.forEach(function(role) {
      const roleRights = roles[role] || []
      roleRights.forEach(function(r) { rights.add(r) })
    })
    return rights
  }

  function canAccess(user, resource, op) {
    const rights = getUserRights(user)
    const needed = resourcePerms[resource] || []
    return rights.has(op) && needed.includes(op)
  }

  const result = canAccess(checkUser, checkResource, checkOp)
  const roleColors = { admin: '#ef4444', developer: '#3b82f6', auditor: '#f59e0b', operator: '#10b981' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>RBAC Simulator</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Check if a user can perform an operation on a resource based on their roles.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Users and Roles:</div>
          {Object.keys(userRoles).map(function(user) {
            return (
              <div key={user} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13, minWidth: 50 }}>{user}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {userRoles[user].map(function(role) {
                    return <span key={role} style={{ fontSize: 11, background: (roleColors[role] || '#6e7681') + '22', color: roleColors[role] || '#6e7681', border: '1px solid ' + (roleColors[role] || '#6e7681') + '44', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{role}</span>
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Role Permissions:</div>
          {Object.keys(roles).map(function(role) {
            return (
              <div key={role} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: roleColors[role] || '#6e7681', fontSize: 12, minWidth: 90, display: 'inline-block' }}>{role}:</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{roles[role].join(', ')}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Access Check:</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>User</div>
            <select value={checkUser} onChange={function(e) { setCheckUser(e.target.value) }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13 }}>
              {Object.keys(userRoles).map(function(u) { return <option key={u} value={u}>{u}</option> })}
            </select>
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-muted)', paddingTop: 16 }}>→</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Operation</div>
            <select value={checkOp} onChange={function(e) { setCheckOp(e.target.value) }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13 }}>
              {['read', 'write', 'delete', 'execute', 'manage_users'].map(function(op) { return <option key={op} value={op}>{op}</option> })}
            </select>
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-muted)', paddingTop: 16 }}>→</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Resource</div>
            <select value={checkResource} onChange={function(e) { setCheckResource(e.target.value) }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13 }}>
              {resources.map(function(r) { return <option key={r} value={r}>{r}</option> })}
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: result ? '#10b98118' : '#ef444418', border: '1px solid ' + (result ? '#10b981' : '#ef4444') + '44', borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: result ? '#10b981' : '#ef4444', marginBottom: 8 }}>
          {result ? '✓ ACCESS GRANTED' : '✗ ACCESS DENIED'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong>{checkUser}</strong> has roles: {userRoles[checkUser].join(', ')}
          <br />Combined permissions: {Array.from(getUserRights(checkUser)).join(', ')}
          <br />Resource <strong>{checkResource}</strong> requires: {(resourcePerms[checkResource] || []).join(', ')}
          <br />Operation <strong>{checkOp}</strong>: {result ? 'user has this right AND resource supports it' : 'user lacks this right OR resource does not support it'}
        </div>
      </div>
    </div>
  )
}

export default function Chapter17() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #a78bfa44', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 17</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🛡️</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Protection</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          OS mechanisms for controlling access to resources — protection domains, access matrices, capabilities, ACLs, RBAC, and mandatory protection models.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Access Matrix Simulator', 'RBAC Simulator', 'Capabilities vs ACLs', 'Bell-LaPadula', 'Biba Model'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(167,139,250,0.1)', border: '1px solid #a78bfa33', color: '#a78bfa', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#a78bfa' : 'var(--text-secondary)', background: active === s.id ? 'rgba(167,139,250,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #a78bfa' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.1 Goals of Protection</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Why protection mechanisms are needed and what they aim to achieve.</p>

              <InfoBox color="#a78bfa">
                <strong>Protection</strong> refers to the mechanisms for controlling the access of programs, processes, or users to the resources defined by a computer system. It is the OS's internal policy enforcement layer — separate from security which deals with external threats.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Goals of Protection</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { goal: 'Prevent violations of access restrictions', color: '#ef4444', desc: 'Ensure a process can only access resources it has been explicitly granted access to. Prevent one process from corrupting another.' },
                  { goal: 'Enforce policies', color: '#3b82f6', desc: 'The system must enforce whatever access policy the administrators define. The OS is the enforcement point — policies defined at higher levels are implemented here.' },
                  { goal: 'Separate policy from mechanism', color: '#10b981', desc: 'The protection mechanisms should be flexible enough to enforce a variety of policies. The specific policy is separate from the mechanism that enforces it.' },
                  { goal: 'Support least privilege', color: '#f59e0b', desc: 'Processes should have only the minimum permissions needed. Limits damage from bugs, exploits, and malicious code.' },
                  { goal: 'Provide controlled sharing', color: '#8b5cf6', desc: 'Allow controlled sharing of resources between processes and users — the right resources shared with the right entities under the right conditions.' },
                ].map(function(g) {
                  return (
                    <div key={g.goal} style={{ background: 'var(--bg-card)', border: '1px solid ' + g.color + '33', borderLeft: '4px solid ' + g.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: g.color, marginBottom: 4, fontSize: 13 }}>{g.goal}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Protection vs Security</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #a78bfa44', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>Protection</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Internal OS mechanism</li>
                    <li>Controls resource access</li>
                    <li>Deals with authorized users behaving incorrectly</li>
                    <li>Enforces policies within the system</li>
                    <li>Access matrix, capabilities, ACLs</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Security</div>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 16 }}>
                    <li>Broader defensive goal</li>
                    <li>Defends against external threats</li>
                    <li>Deals with malicious external attackers</li>
                    <li>Cryptography, firewalls, authentication</li>
                    <li>Chapter 16 topic</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Why protection matters even without attackers:</strong> Protection is needed even in a system with no malicious users. Bugs in one program should not corrupt another program's data. A crashed process should not affect other processes. A program should not accidentally write to a file it should only read. Protection provides containment — limiting the blast radius of software failures, not just attacks.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Policy vs mechanism:</strong> The Saltzer and Schroeder principles (1975) are still fundamental. "Separation of privilege" and "economy of mechanism" mean protection systems should be simple and separable. Linux separates the mechanism (kernel permission checks) from the policy (what rules to apply). SELinux provides a flexible policy language to define rules that the kernel enforces — changing policy doesn't require changing the kernel.
              </LearnMore>

              <NavButtons next={function() { setActive('principles') }} nextLabel="17.2 Principles →" />
            </div>
          )}

          {active === 'principles' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.2 Protection Principles</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Foundational principles that guide the design of protection systems.</p>

              <InfoBox color="#3b82f6">
                The Saltzer and Schroeder design principles (1975) remain the gold standard for protection system design. These principles guide how to build systems that are secure by design, not just by configuration.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { n: 1, principle: 'Principle of Least Privilege', color: '#ef4444', desc: 'Every program and every user should operate with the minimum set of privileges necessary to complete the job. Limits damage from accident, error, or attack. The most important protection principle.' },
                  { n: 2, principle: 'Principle of Fail-Safe Defaults', color: '#f97316', desc: 'Base access decisions on permission rather than exclusion. Default state should be no access. Explicitly grant permissions rather than explicitly denying them. A new user starts with no access.' },
                  { n: 3, principle: 'Principle of Economy of Mechanism', color: '#f59e0b', desc: 'Keep the design as simple and small as possible. Complexity is the enemy of security. A simple, verifiable protection system is better than a complex, feature-rich one with unknown bugs.' },
                  { n: 4, principle: 'Principle of Complete Mediation', color: '#10b981', desc: 'Every access to every object must be checked against the authority. No bypasses, no cache that might be stale. Every single resource access, every time.' },
                  { n: 5, principle: 'Principle of Open Design', color: '#3b82f6', desc: 'The design should not be secret. Security should not depend on the ignorance of potential attackers. Kerckhoffs principle: assume the attacker knows the algorithm — only the key should be secret.' },
                  { n: 6, principle: 'Principle of Separation of Privilege', color: '#8b5cf6', desc: 'Where feasible, require two keys to unlock rather than one. Two-person integrity — two separate entities must cooperate to perform sensitive operations. Prevents single point of compromise.' },
                  { n: 7, principle: 'Principle of Least Common Mechanism', color: '#a78bfa', desc: 'Minimize the amount of mechanism common to more than one user and depended on by all users. Shared mechanisms (especially shared variables) represent potential security risks.' },
                  { n: 8, principle: 'Principle of Psychological Acceptability', color: '#14b8a6', desc: 'Security mechanisms should not make the resource more difficult to access than if they were not present. Users who find security burdensome will circumvent it, reducing actual security.' },
                ].map(function(p) {
                  return (
                    <div key={p.n} style={{ background: 'var(--bg-card)', border: '1px solid ' + p.color + '33', borderLeft: '4px solid ' + p.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>{p.n}</div>
                        <div style={{ fontWeight: 700, color: p.color, fontSize: 13 }}>{p.principle}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Principle of least privilege in practice:</strong> Linux implements least privilege with user/group separation, setuid programs (runs as owner, not caller), capabilities (split root privilege into 40+ fine-grained capabilities), namespaces (isolate what processes can see), and seccomp (restrict which syscalls a process can use). Containers implement all of these. A Docker container running nginx should not need CAP_SYS_ADMIN or access to /etc/shadow.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Complete mediation and performance:</strong> Complete mediation requires checking every access. This is expensive — every file read would require checking permissions from scratch. OSes use caching: when a file is opened, permissions are checked once and the result cached in the file descriptor. Subsequent reads are not re-checked — trades complete mediation for performance. Problem: if permissions change after open, the cached result is stale. Linux's approach: check on open() but not on read(). Closing and reopening gets fresh permissions.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 17.1 Goals" next={function() { setActive('domain') }} nextLabel="17.3 Protection Domains →" />
            </div>
          )}

          {active === 'domain' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.3 Protection Domains</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Defining the scope of access rights for processes and users.</p>

              <InfoBox color="#10b981">
                A <strong>protection domain</strong> specifies the set of resources a process may access and the operations it may perform on each resource. A domain is a set of (object, rights) pairs. Processes execute within a domain — they can only access objects listed in their domain.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Domain Structure</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Domain D1 (user alice) */</div>
                  <div>D1 = {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>(File F1, {'{'} read, write {'}'}),</div>
                  <div style={{ paddingLeft: 16 }}>(File F2, {'{'} read {'}'}),</div>
                  <div style={{ paddingLeft: 16 }}>(Printer P1, {'{'} print {'}'})</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Domain D2 (process webserver) */</div>
                  <div>D2 = {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>(File webroot/*, {'{'} read {'}'}),</div>
                  <div style={{ paddingLeft: 16 }}>(Socket 80, {'{'} bind, listen, accept {'}'})</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Domain Association</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Static Association</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    A process is permanently bound to a single domain for its entire lifetime. Simple but inflexible — a process that needs different permissions at different times must have the union of all permissions always (violates least privilege).
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Dynamic Association</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    A process can switch between domains during execution. Better supports least privilege — a process holds a powerful domain only when needed and switches to a limited domain otherwise. Unix setuid is a form of domain switching.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Unix Domain Model</h3>
              <InfoBox color="#f59e0b">
                In Unix, a domain is associated with a user ID (UID) and group ID (GID). A process switches domain by changing its UID. The <strong>setuid</strong> bit allows a program to run with the file owner's UID instead of the caller's UID. Example: /usr/bin/passwd runs as root (UID=0) even when called by a normal user — it needs root to modify /etc/shadow, but only for that specific file, and the program itself enforces the policy.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #f59e0b44', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>$ ls -la /usr/bin/passwd</div>
                  <div style={{ color: '#f59e0b' }}>-rwsr-xr-x 1 root root 68208 ... /usr/bin/passwd</div>
                  <div style={{ color: '#8b949e' }}>      ^ setuid bit — runs as root</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* In kernel: when alice runs passwd */</div>
                  <div>effective_uid = 0  <span style={{ color: '#8b949e' }}>/* root — from setuid bit */</span></div>
                  <div>real_uid = 1000    <span style={{ color: '#8b949e' }}>/* alice — actual caller */</span></div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Capability-based systems:</strong> In a pure capability system, a process has no ambient authority — it can only access objects for which it explicitly holds capabilities (tokens). This naturally implements least privilege. Examples: seL4 microkernel, Google Fuchsia (uses Zircon kernel handles). Capability systems prevent confused deputy attacks — a privileged program cannot be tricked into using its privileges on behalf of an attacker because the attacker cannot access the capability without explicit transfer.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Confused deputy problem:</strong> A classic security problem. A compiler was given billing rights (to charge users for CPU time). Users discovered they could name their output file the billing file — the compiler, acting as the user's deputy, would write billing data to the user-specified location, overwriting the real billing records. The compiler had both the user's authority (to access user files) and its own authority (to access billing file) — users could abuse the compiler's authority. Capability systems solve this by requiring the caller to provide the capability, not just a name.
              </LearnMore>

              <NavButtons prev={function() { setActive('principles') }} prevLabel="← 17.2 Principles" next={function() { setActive('matrix') }} nextLabel="17.4 Access Matrix →" />
            </div>
          )}

          {active === 'matrix' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.4 The Access Matrix</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>A formal model for specifying and enforcing protection policies.</p>

              <InfoBox color="#a78bfa">
                The <strong>access matrix</strong> is a conceptual model for representing protection state. Rows represent <strong>domains</strong> (subjects), columns represent <strong>objects</strong>, and each cell contains the set of allowed operations. It is the complete specification of who can do what to what.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Access Matrix Structure</h3>
              <div style={{ background: '#0d1117', border: '1px solid #a78bfa44', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>         F1          F2        Printer   D1-domain  D2-domain</div>
                  <div>D1 Alice: [r,w]       [r]       [print]   [switch]   []</div>
                  <div>D2 Bob:   []          [r,w]     []        []         [switch]</div>
                  <div>D3 Root:  [r,w,x]     [r,w,x]   [print]   [switch]   [switch]</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Domain itself is an object — enables domain switching */</div>
                  <div style={{ color: '#8b949e' }}>/* "switch" right on Di means can switch to domain Di */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Special Rights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { right: 'copy (*)', color: '#3b82f6', desc: 'A right marked with * can be copied to another domain. Propagation of access rights. An asterisk after a right means "can copy this right to others".' },
                  { right: 'owner', color: '#10b981', desc: 'Domain that owns an object can add or remove rights for that object from any domain — full control over the object\'s row in the matrix.' },
                  { right: 'control', color: '#f59e0b', desc: 'Domain Di has control over Dj means Di can remove access rights from Dj. Used to revoke permissions.' },
                  { right: 'switch', color: '#8b5cf6', desc: 'Di has switch right on Dj means Di can switch to (execute in) domain Dj. Enables domain transitions.' },
                ].map(function(r) {
                  return (
                    <div key={r.right} style={{ background: 'var(--bg-card)', border: '1px solid ' + r.color + '44', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: r.color, marginBottom: 6, fontSize: 13 }}>{r.right}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive Access Matrix</h3>
              <AccessMatrixSim />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Safety problem:</strong> The access matrix safety problem asks: given an initial protection state and a set of commands that can modify the matrix, can a right r ever appear in a cell that does not initially have it? This is undecidable in general (Harrison-Ruzzo-Ullman theorem, 1976). For restricted command sets, it becomes decidable. This theoretical result explains why it is impossible to prove a general protection system is "safe" — real systems rely on careful design and verification instead.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Take-grant model:</strong> A more tractable protection model than the full access matrix. Only four operations: take (acquire a right from an object), grant (give a right to an object), create (create a new object with rights), remove. The take-grant model is decidable — you can determine if a subject can ever acquire a given right. Useful for analyzing whether information flow is possible in a system.
              </LearnMore>

              <NavButtons prev={function() { setActive('domain') }} prevLabel="← 17.3 Domains" next={function() { setActive('implement') }} nextLabel="17.5 Implementation →" />
            </div>
          )}

          {active === 'implement' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.5 Implementation of the Access Matrix</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How to efficiently store and enforce the access matrix in practice.</p>

              <InfoBox color="#f59e0b">
                The access matrix is conceptually elegant but impractical to store directly — a system with 1000 domains and 10000 objects needs a 10 million cell matrix, mostly empty. Two practical implementations: <strong>Access Control Lists (ACLs)</strong> store columns, <strong>Capability Lists</strong> store rows.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', marginBottom: 10 }}>Access Control Lists (ACLs) — Column-based</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Each <strong>object</strong> stores a list of (domain, rights) pairs. Attach the column of the access matrix to the object itself. To check if domain D can access object O with right r: look up D in O's ACL.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.9, marginBottom: 10 }}>
                    <div style={{ color: '#8b949e' }}>/* File /etc/passwd ACL */</div>
                    <div>ACL = [</div>
                    <div style={{ paddingLeft: 16 }}>(root, {'{'} read, write {'}'}),</div>
                    <div style={{ paddingLeft: 16 }}>(alice, {'{'} read {'}'}),</div>
                    <div style={{ paddingLeft: 16 }}>(group:staff, {'{'} read {'}'})</div>
                    <div>]</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Easy to see who can access an object</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Easy to revoke all rights to an object</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Hard to find all objects a domain can access</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Check requires searching the list</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 22 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>Capability Lists — Row-based</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                    Each <strong>domain (process)</strong> holds a list of capabilities — (object, rights) pairs. A capability is an unforgeable token. To access an object, present the capability. Like a key: whoever holds it can use it.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.9, marginBottom: 10 }}>
                    <div style={{ color: '#8b949e' }}>/* Alice's capability list */</div>
                    <div>Caps = [</div>
                    <div style={{ paddingLeft: 16 }}>(cap_file_F1, {'{'} read, write {'}'}),</div>
                    <div style={{ paddingLeft: 16 }}>(cap_printer_P1, {'{'} print {'}'}),</div>
                    <div style={{ paddingLeft: 16 }}>(cap_socket_80, {'{'} connect {'}'})</div>
                    <div>]</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Fast access check — just present capability</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>✓ Easy to see all objects a domain can access</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Hard to revoke — capability may be copied</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>✗ Hard to find all domains with access to an object</div>
                  </div>
                </div>

              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Lock-Key Mechanism</h3>
              <InfoBox color="#8b5cf6">
                A compromise between ACLs and capabilities. Each object has a set of <strong>locks</strong> (bit patterns). Each domain has a set of <strong>keys</strong>. A domain can access an object if it has a key that matches one of the object's locks. More flexible than pure ACLs or capabilities. Used in some hardware protection systems.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Unix file permissions as a simplified ACL:</strong> Unix rwxrwxrwx is a very compressed ACL — only three entries: owner, group, others. Real POSIX ACLs (setfacl) add arbitrary user and group entries. Windows NTFS DACL (Discretionary ACL) allows per-user, per-group, inherited, and denied ACEs (Access Control Entries) in any combination. The NTFS DACL is evaluated in order: explicit deny overrides explicit allow; inherited entries are checked last.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>File descriptors as capabilities:</strong> Unix file descriptors are a form of capability. open() checks permissions and returns an fd. The fd can be passed to child processes (fork inheritance) or other processes (Unix domain socket sendmsg with SCM_RIGHTS). The receiving process can use the fd without re-checking permissions — it just has the capability. This enables privilege separation: a privileged process opens a file and passes the fd to an unprivileged worker that does the actual processing.
              </LearnMore>

              <NavButtons prev={function() { setActive('matrix') }} prevLabel="← 17.4 Access Matrix" next={function() { setActive('revocation') }} nextLabel="17.6 Revocation →" />
            </div>
          )}

          {active === 'revocation' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.6 Revocation of Access Rights</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>How to take back access rights that have been granted.</p>

              <InfoBox color="#ef4444">
                Revoking access rights is essential — a user may leave an organization, a file may become confidential, or a process may be compromised. The mechanism for revocation depends on whether the system uses ACLs or capabilities.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Revocation in ACL Systems</h3>
              <InfoBox color="#3b82f6">
                ACL revocation is straightforward: find the entry in the ACL and remove or modify it. The next access attempt will fail because the ACL check will not find the entry. Simple and immediate — O(ACL size) to revoke. This is why ACLs are preferred in most practical systems.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #3b82f644', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Revoke alice's write access to file.txt */</div>
                  <div>/* Before: ACL = [(alice, r,w), (bob, r)] */</div>
                  <div>remove_from_acl(file.txt, alice, write)</div>
                  <div>/* After:  ACL = [(alice, r), (bob, r)] */</div>
                  <div style={{ color: '#10b981' }}>/* Immediate effect on next access attempt */</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Revocation in Capability Systems</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Capability revocation is harder — capabilities may have been copied to many processes. Several approaches:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { approach: 'Immediate vs Delayed', color: '#3b82f6', desc: 'Immediate revocation takes effect right away. Delayed revocation is applied at some later time — simpler to implement but creates a window where access is still possible.' },
                  { approach: 'Selective vs General', color: '#10b981', desc: 'Selective: revoke only specific domain\'s capability. General: revoke all capabilities for an object simultaneously. General is easier but may over-revoke.' },
                  { approach: 'Partial vs Total', color: '#f59e0b', desc: 'Partial: revoke specific rights (remove write, keep read). Total: revoke all rights — destroy the capability entirely.' },
                  { approach: 'Indirect Capabilities (via table)', color: '#8b5cf6', desc: 'Capabilities point to a global table entry, not the object directly. To revoke, invalidate the table entry. All capabilities pointing to that entry are instantly revoked. Used in modern capability systems.' },
                ].map(function(a) {
                  return (
                    <div key={a.approach} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + a.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: a.color, fontSize: 13, minWidth: 180 }}>{a.approach}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Revocation in Practice</h3>
              <InfoBox color="#f59e0b">
                In practice, most systems use ACLs (or a combination). Unix: changing file permissions takes effect immediately on the next open() call. Note: already-open file descriptors are NOT affected — a process that opened a file before revocation can continue using it. This is the "cached capability" problem. To force immediate revocation, the file must be closed by all processes holding it open.
              </InfoBox>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Revocation challenges in distributed systems:</strong> In a distributed system, capabilities may be cached on remote clients. Revoking access requires contacting all clients — but what if a client is offline? NFS uses time-limited leases — the client's cached access is only valid for a short period and must be renewed. If the server revokes access, it simply refuses to renew the lease. The client loses access when its lease expires. This provides "eventual revocation" — not immediate but bounded.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>OAuth token revocation:</strong> OAuth 2.0 access tokens are like capabilities. Revoking an access token should immediately prevent API access. But if the resource server caches token validation, revoked tokens remain valid until the cache expires (typically 5-60 minutes). OAuth 2.0 Token Revocation (RFC 7009) defines a revocation endpoint — but resource servers must check it. The industry is moving toward short-lived tokens (minutes) + refresh tokens rather than relying on revocation.
              </LearnMore>

              <NavButtons prev={function() { setActive('implement') }} prevLabel="← 17.5 Implementation" next={function() { setActive('rbac') }} nextLabel="17.7 Role-Based Access →" />
            </div>
          )}

          {active === 'rbac' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.7 Role-Based Access Control (RBAC)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Managing permissions through roles rather than individual users.</p>

              <InfoBox color="#10b981">
                <strong>RBAC</strong> assigns permissions to <strong>roles</strong>, and users are assigned to roles. Instead of managing permissions per-user (which scales poorly), you manage permissions per-role and user-to-role assignments. Most enterprise systems use RBAC.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>RBAC Components</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24, maxWidth: 450 }}>
                {[
                  { comp: 'Users', color: '#3b82f6', desc: 'Human users or processes that need access' },
                  { comp: '↓ assigned to', color: '#6e7681', desc: '' },
                  { comp: 'Roles', color: '#a78bfa', desc: 'Job functions: admin, developer, auditor' },
                  { comp: '↓ have', color: '#6e7681', desc: '' },
                  { comp: 'Permissions', color: '#10b981', desc: 'Operations allowed on specific objects' },
                  { comp: '↓ apply to', color: '#6e7681', desc: '' },
                  { comp: 'Objects', color: '#f59e0b', desc: 'Files, databases, services being protected' },
                ].map(function(c, i) {
                  if (!c.desc) return <div key={i} style={{ fontSize: 13, color: '#6e7681', paddingLeft: 20 }}>{c.comp}</div>
                  return (
                    <div key={i} style={{ background: c.color + '22', border: '1px solid ' + c.color + '44', borderRadius: 6, padding: '8px 14px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: c.color, fontSize: 13 }}>{c.comp}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.desc}</span>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>RBAC Benefits</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { benefit: 'Scalability', color: '#3b82f6', desc: 'With 1000 users and 100 resource types: without RBAC = 100,000 permission entries. With RBAC = perhaps 10 roles + 1000 user-role assignments = 10x less management.' },
                  { benefit: 'Easier administration', color: '#10b981', desc: 'New employee: assign role. Employee changes job: change role assignment. Employee leaves: remove all role assignments. One operation instead of many.' },
                  { benefit: 'Separation of duties', color: '#f59e0b', desc: 'No user should have roles that conflict. A user should not be both "create purchase order" and "approve purchase order" — prevents fraud.' },
                  { benefit: 'Audit and compliance', color: '#8b5cf6', desc: 'Easily answer: who can access X? What can role Y do? Who has been assigned role Z? Essential for compliance (SOX, HIPAA, PCI-DSS).' },
                ].map(function(b) {
                  return (
                    <div key={b.benefit} style={{ background: 'var(--bg-card)', border: '1px solid ' + b.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: b.color, marginBottom: 6, fontSize: 13 }}>{b.benefit}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Interactive RBAC Simulator</h3>
              <RBACSim />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>RBAC levels (NIST model):</strong> RBAC0 (flat RBAC): basic user-role-permission model. RBAC1 (hierarchical RBAC): roles can inherit from other roles (senior_developer inherits developer permissions). RBAC2 (constrained RBAC): adds separation of duty constraints (cannot have conflicting roles). RBAC3: combines RBAC1 + RBAC2. Most enterprise systems implement at least RBAC1 with some RBAC2 constraints.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Attribute-Based Access Control (ABAC):</strong> Next evolution beyond RBAC. Access decisions based on attributes of the user (department, clearance), resource (classification, owner), and environment (time of day, location, IP). Extremely flexible — "allow read if user.department == resource.department AND time is 9am-5pm AND user.clearance is greater than or equal to resource.classification". Used in AWS IAM policies, Azure RBAC, and fine-grained data governance systems. More powerful than RBAC but harder to manage and audit.
              </LearnMore>

              <NavButtons prev={function() { setActive('revocation') }} prevLabel="← 17.6 Revocation" next={function() { setActive('mandatory') }} nextLabel="17.8 Mandatory Protection →" />
            </div>
          )}

          {active === 'mandatory' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>17.8 Mandatory Protection — MAC Models</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Formal models for enforcing information flow policies — Bell-LaPadula and Biba.</p>

              <InfoBox color="#ef4444">
                <strong>Mandatory Access Control (MAC)</strong> enforces system-wide policies that users and even administrators cannot override. Based on security labels. Originally developed for military systems. Now used in commercial systems via SELinux, AppArmor.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Bell-LaPadula Model — Confidentiality</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                  Designed for military classification levels (Unclassified, Confidential, Secret, Top Secret). Subjects and objects have classification levels. Two main rules prevent classified information from leaking to lower levels.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div style={{ background: '#3b82f618', border: '1px solid #3b82f644', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 6 }}>Simple Security (no read up)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>A subject at level L cannot read an object at level L' if L' is strictly higher than L. A Secret-cleared user cannot read Top Secret documents.</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#3b82f6', marginTop: 6 }}>read only if subject.level &gt;= object.level</div>
                  </div>
                  <div style={{ background: '#ef444418', border: '1px solid #ef444444', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>Star Property (no write down)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>A subject at level L cannot write to an object at level L' if L' is strictly lower than L. A Top Secret process cannot write to a Secret file (would leak TS info to lower level).</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#ef4444', marginTop: 6 }}>write only if subject.level &lt;= object.level</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {['Unclassified (0)', 'Confidential (1)', 'Secret (2)', 'Top Secret (3)'].map(function(level, i) {
                    const colors = ['#6e7681', '#3b82f6', '#f59e0b', '#ef4444']
                    return (
                      <div key={level} style={{ background: colors[i] + '22', border: '1px solid ' + colors[i] + '44', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: colors[i], fontWeight: 700 }}>{level}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Biba Model — Integrity</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                  Biba is the dual of Bell-LaPadula, focused on <strong>integrity</strong> rather than confidentiality. Prevents untrusted data from corrupting trusted data.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 6 }}>Simple Integrity (no read down)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>A subject cannot read an object at lower integrity — prevents reading untrusted data into a trusted context.</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#10b981', marginTop: 6 }}>read only if subject.integrity &lt;= object.integrity</div>
                  </div>
                  <div style={{ background: '#f59e0b18', border: '1px solid #f59e0b44', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>Star Integrity (no write up)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>A subject cannot write to an object at higher integrity — prevents untrusted process from corrupting trusted data.</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#f59e0b', marginTop: 6 }}>write only if subject.integrity &gt;= object.integrity</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Comparison</h3>
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Model', 'Goal', 'Read Rule', 'Write Rule', 'Use case'].map(function(h) {
                        return <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Bell-LaPadula', 'Confidentiality', 'No read up', 'No write down', 'Military, government'],
                      ['Biba', 'Integrity', 'No read down', 'No write up', 'Financial, medical records'],
                      ['Clark-Wilson', 'Integrity', 'Via transactions', 'Well-formed only', 'Commercial, banking'],
                    ].map(function(row) {
                      return (
                        <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#a78bfa' }}>{row[0]}</td>
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
                <strong style={{ color: 'var(--text-primary)' }}>Clark-Wilson model:</strong> Designed for commercial integrity. Focuses on well-formed transactions (only specific programs can modify specific data) and separation of duty (no single user can execute a complete transaction alone). Uses Constrained Data Items (CDI — data that must maintain integrity), Unconstrained Data Items (UDI — input from untrusted sources), Transformation Procedures (TP — the only programs allowed to modify CDIs), and Integrity Verification Procedures (IVP — verify CDI integrity). Better matches commercial security needs than Bell-LaPadula.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Chinese Wall model (Brewer-Nash):</strong> Designed for conflict of interest in financial/legal settings. A consultant who has seen information about Company A should be denied access to competing Company B's information. The "wall" grows dynamically — the first access determines which companies are off-limits. Used in financial institutions to prevent insider trading and conflicts of interest between clients.
              </LearnMore>

              <NavButtons prev={function() { setActive('rbac') }} prevLabel="← 17.7 RBAC" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Protection Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for access matrix and RBAC.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Access Matrix Simulator</h3>
              <AccessMatrixSim />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>RBAC Simulator</h3>
              <RBACSim />

              <NavButtons prev={function() { setActive('mandatory') }} prevLabel="← 17.8 MAC Models" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Protection in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore protection mechanisms through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#a78bfa' }}>Lab 1 — Protection in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Explore Protection in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['id',                           'Show current user UID, GID, groups'],
                  ['ls -la /usr/bin/passwd',        'See setuid bit on passwd'],
                  ['getfacl /etc/passwd',           'Show ACL for /etc/passwd'],
                  ['setfacl -m u:alice:r file.txt', 'Add ACL entry for alice'],
                  ['cat /proc/self/status',         'Show UID/GID/capability info'],
                  ['capsh --print',                 'Show current process capabilities'],
                  ['sestatus',                      'Show SELinux status'],
                  ['ls -Z /etc/passwd',             'Show SELinux security context'],
                  ['ps -eZ | head',                 'Show SELinux context of processes'],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
                      <code style={{ background: '#0d1117', color: '#3fb950', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', minWidth: 240, flexShrink: 0 }}>{item[0]}</code>
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 17.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#a78bfa' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#a78bfa', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#a78bfa', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 17!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/18' }} style={{ background: '#a78bfa', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 18 →</button>
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