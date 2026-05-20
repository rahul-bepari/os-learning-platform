import { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import Terminal from '../components/Terminal'

const sections = [
  { id: 'overview',    title: '16.1 Security Problem',      icon: '🔐' },
  { id: 'threats',     title: '16.2 Program Threats',       icon: '🦠' },
  { id: 'system',      title: '16.3 System Threats',        icon: '🌐' },
  { id: 'crypto',      title: '16.4 Cryptography',          icon: '🔑' },
  { id: 'auth',        title: '16.5 Authentication',        icon: '👤' },
  { id: 'defenses',    title: '16.6 OS Defenses',           icon: '🛡️' },
  { id: 'firewall',    title: '16.7 Firewalling',           icon: '🧱' },
  { id: 'simulator',   title: '🎮 Simulators',              icon: '🎮' },
  { id: 'lab',         title: '💻 Lab',                     icon: '💻' },
  { id: 'quiz',        title: '🧠 Quiz',                    icon: '🧠' },
]

const QUIZ = [
  {
    q: 'What is a buffer overflow attack?',
    options: [
      'Filling a hard disk completely',
      'Writing data beyond the end of a buffer to overwrite adjacent memory — including return addresses — to hijack control flow',
      'Sending too many network packets to crash a server',
      'Overloading a CPU with too many processes'
    ],
    answer: 1,
    explanation: 'A buffer overflow occurs when a program writes more data to a buffer than it can hold. The excess data overwrites adjacent memory — including the saved return address on the stack. An attacker crafts input so the return address points to their injected shellcode, hijacking execution. C functions like gets(), strcpy() without bounds checking are classic sources.'
  },
  {
    q: 'What is the difference between a virus and a worm?',
    options: [
      'Viruses are more dangerous than worms',
      'A virus requires a host program and user action to spread; a worm self-replicates across networks autonomously',
      'Worms only affect Windows systems',
      'Viruses spread through networks; worms spread through files'
    ],
    answer: 1,
    explanation: 'A virus attaches itself to a host program and spreads when the infected program is executed or a file is shared — requires human action. A worm is a standalone program that replicates itself across networks by exploiting vulnerabilities — no human action needed. The Morris Worm (1988) was one of the first internet worms, exploiting Unix vulnerabilities to spread autonomously.'
  },
  {
    q: 'What does the principle of least privilege state?',
    options: [
      'Users should have the minimum password length requirements',
      'Every program and user should operate with the minimum privileges necessary to perform their function',
      'Privileged operations should require two users to authorize',
      'Least-used features should be disabled by default'
    ],
    answer: 1,
    explanation: 'The principle of least privilege: every program, user, and system component should have only the minimum access rights necessary to perform its function. This limits the damage if a component is compromised. If a web server only needs to read files in /var/www, it should not run as root. Violations of this principle are a major source of security vulnerabilities.'
  },
  {
    q: 'What is symmetric encryption?',
    options: [
      'Encryption that uses the same key for both encryption and decryption',
      'Encryption that uses a public key to encrypt and private key to decrypt',
      'Encryption applied twice with different keys',
      'Encryption that is symmetric around a mathematical function'
    ],
    answer: 0,
    explanation: 'Symmetric encryption uses the SAME key for both encryption and decryption. Both parties must share the secret key securely beforehand. Examples: AES, DES, 3DES. Very fast — suitable for bulk data encryption. The key distribution problem (how to securely share the key) is its main challenge, which asymmetric cryptography solves.'
  },
  {
    q: 'What is a SQL injection attack?',
    options: [
      'Injecting malicious code into SQL Server software',
      'Inserting malicious SQL code into user input fields that gets executed by the database — allowing data theft or modification',
      'A type of database corruption attack',
      'Overflowing a database buffer'
    ],
    answer: 1,
    explanation: 'SQL injection occurs when user input is incorporated into SQL queries without proper sanitization. For example, if login checks: SELECT * FROM users WHERE name=\'INPUT\', an attacker enters: \' OR 1=1 --, making the query always true and bypassing authentication. Prevention: use parameterized queries/prepared statements — never concatenate user input into SQL strings.'
  },
  {
    q: 'What does Address Space Layout Randomization (ASLR) protect against?',
    options: [
      'Denial of service attacks',
      'Buffer overflows that rely on knowing the exact memory addresses of stack, heap, or libraries',
      'Password brute force attacks',
      'Network packet sniffing'
    ],
    answer: 1,
    explanation: 'ASLR randomizes the base addresses of the stack, heap, and loaded libraries on each program execution. Buffer overflow exploits often need to jump to a specific address (e.g., system() in libc). With ASLR, the attacker cannot predict these addresses, making reliable exploitation much harder. Combined with non-executable stack (NX/DEP), it significantly raises the bar for exploit development.'
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
      <button onClick={function() { setOpen(function(o) { return !o }) }} style={{ background: 'none', border: '1px solid #ef444455', color: '#ef4444', padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {open ? 'Show Less' : 'Learn More (Deep Dive)'}
      </button>
      {open && (
        <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid #ef444433', borderRadius: 10, padding: 20, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
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
      {next && <button onClick={next} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{nextLabel}</button>}
    </div>
  )
}

function CryptoVisualizer() {
  const [mode, setMode] = useState('symmetric')
  const [message, setMessage] = useState('Hello OS World!')
  const [key, setKey] = useState('SecretKey123')
  const [step, setStep] = useState(0)

  function simpleEncrypt(text, k) {
    const shift = k.split('').reduce(function(a, c) { return a + c.charCodeAt(0) }, 0) % 26
    return text.split('').map(function(c) {
      if (c.match(/[a-zA-Z]/)) {
        const base = c === c.toUpperCase() ? 65 : 97
        return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base)
      }
      return c
    }).join('')
  }

  const encrypted = simpleEncrypt(message, key)

  const symmetricSteps = [
    { title: 'Plaintext', desc: 'Original message to encrypt', data: message, color: '#10b981' },
    { title: 'Shared Secret Key', desc: 'Same key held by both sender and receiver', data: key, color: '#f59e0b' },
    { title: 'Encryption (AES)', desc: 'Apply cipher with key to produce ciphertext', data: encrypted, color: '#ef4444' },
    { title: 'Transmit Ciphertext', desc: 'Send over insecure channel — looks like noise to attacker', data: encrypted, color: '#6e7681' },
    { title: 'Decryption (AES)', desc: 'Receiver applies same key to reverse cipher', data: message, color: '#3b82f6' },
    { title: 'Recovered Plaintext', desc: 'Original message restored', data: message, color: '#10b981' },
  ]

  const asymmetricSteps = [
    { title: 'Key Generation', desc: 'Bob generates public/private key pair (RSA: two large primes)', data: 'Public: e,n | Private: d,n', color: '#8b5cf6' },
    { title: 'Public Key Published', desc: 'Bob shares public key with everyone — no secret needed', data: 'Public Key: (65537, n)', color: '#10b981' },
    { title: 'Alice Encrypts', desc: 'Alice encrypts with Bob\'s PUBLIC key', data: simpleEncrypt(message, 'pub'), color: '#3b82f6' },
    { title: 'Ciphertext Transmitted', desc: 'Even if intercepted, only Bob\'s private key can decrypt', data: simpleEncrypt(message, 'pub'), color: '#6e7681' },
    { title: 'Bob Decrypts', desc: 'Bob uses his PRIVATE key to decrypt', data: message, color: '#f59e0b' },
    { title: 'Recovered Plaintext', desc: 'Only Bob could decrypt — private key never shared', data: message, color: '#10b981' },
  ]

  const steps = mode === 'symmetric' ? symmetricSteps : asymmetricSteps
  const currentStep = steps[Math.min(step, steps.length - 1)]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Cryptography Visualizer</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Step through symmetric and asymmetric encryption processes.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'symmetric', label: 'Symmetric (AES)' },
          { key: 'asymmetric', label: 'Asymmetric (RSA)' },
        ].map(function(m) {
          return (
            <button key={m.key} onClick={function() { setMode(m.key); setStep(0) }} style={{ background: mode === m.key ? '#ef444433' : 'var(--bg-secondary)', color: mode === m.key ? '#ef4444' : 'var(--text-secondary)', border: '1px solid ' + (mode === m.key ? '#ef4444' : 'var(--border)'), padding: '6px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: mode === m.key ? 700 : 400 }}>
              {m.label}
            </button>
          )
        })}
      </div>

      {mode === 'symmetric' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Message</div>
            <input value={message} onChange={function(e) { setMessage(e.target.value); setStep(0) }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, width: 160 }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Key</div>
            <input value={key} onChange={function(e) { setKey(e.target.value); setStep(0) }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, width: 140 }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {steps.map(function(s, i) {
          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#ef4444' : 'var(--border)', transition: 'all 0.3s' }} />
        })}
      </div>

      <div style={{ background: currentStep.color + '18', border: '1px solid ' + currentStep.color + '44', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: currentStep.color, fontSize: 15, marginBottom: 6 }}>Step {step + 1}: {currentStep.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{currentStep.desc}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 14, color: currentStep.color, background: '#0d1117', padding: '8px 12px', borderRadius: 6 }}>{currentStep.data}</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={function() { setStep(function(s) { return Math.max(s - 1, 0) }) }} disabled={step === 0} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '8px 18px', borderRadius: 8, cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: step === 0 ? 0.5 : 1 }}>Previous</button>
        <button onClick={function() { setStep(function(s) { return Math.min(s + 1, steps.length - 1) }) }} disabled={step === steps.length - 1} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: step === steps.length - 1 ? 0.5 : 1 }}>Next</button>
        <button onClick={function() { setStep(0) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reset</button>
      </div>
    </div>
  )
}

function ThreatScanner() {
  const [code, setCode] = useState('// Paste suspicious code here\nchar buf[64];\ngets(buf); // scan me!')
  const [results, setResults] = useState(null)

  const patterns = [
    { pattern: 'gets(', severity: 'CRITICAL', desc: 'gets() has no bounds checking — classic buffer overflow source. Use fgets() instead.' },
    { pattern: 'strcpy(', severity: 'HIGH', desc: 'strcpy() does not check destination buffer size. Use strncpy() or strlcpy().' },
    { pattern: 'sprintf(', severity: 'HIGH', desc: 'sprintf() can overflow destination buffer. Use snprintf() with size limit.' },
    { pattern: 'scanf("%s"', severity: 'HIGH', desc: 'scanf %s reads unlimited input. Use scanf("%63s", buf) with size limit.' },
    { pattern: 'system(', severity: 'MEDIUM', desc: 'system() invokes a shell — dangerous if argument contains user input (shell injection).' },
    { pattern: 'eval(', severity: 'MEDIUM', desc: 'eval() executes arbitrary code. Never pass user input to eval().' },
    { pattern: 'exec(', severity: 'MEDIUM', desc: 'exec() family runs external programs. Validate and sanitize all arguments.' },
    { pattern: 'malloc(', severity: 'LOW', desc: 'Check return value of malloc() — returns NULL on failure. Use-after-free if not careful.' },
    { pattern: 'free(', severity: 'LOW', desc: 'Ensure no use-after-free. Set pointer to NULL after free(). Avoid double-free.' },
  ]

  function scan() {
    const found = patterns.filter(function(p) { return code.toLowerCase().includes(p.pattern.toLowerCase()) })
    setResults(found)
  }

  const severityColor = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#3b82f6' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Vulnerability Pattern Scanner</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Paste C code to scan for common security vulnerabilities.</p>

      <textarea value={code} onChange={function(e) { setCode(e.target.value); setResults(null) }} style={{ width: '100%', height: 120, background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 12, color: '#e6edf3', fontSize: 12, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }} />

      <button onClick={scan} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
        Scan for Vulnerabilities
      </button>

      {results !== null && (
        <div>
          {results.length === 0
            ? <div style={{ background: '#10b98118', border: '1px solid #10b98144', borderRadius: 8, padding: 12, fontSize: 13, color: '#10b981', fontWeight: 700 }}>No known vulnerable patterns detected!</div>
            : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>{results.length} vulnerability pattern{results.length > 1 ? 's' : ''} found:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.map(function(r) {
                    return (
                      <div key={r.pattern} style={{ background: severityColor[r.severity] + '18', border: '1px solid ' + severityColor[r.severity] + '44', borderLeft: '4px solid ' + severityColor[r.severity], borderRadius: 8, padding: 12 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <code style={{ color: severityColor[r.severity], fontWeight: 700, fontSize: 13 }}>{r.pattern}</code>
                          <span style={{ fontSize: 11, background: severityColor[r.severity] + '33', color: severityColor[r.severity], padding: '1px 8px', borderRadius: 8, fontWeight: 700 }}>{r.severity}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

export default function Chapter16() {
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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))', borderBottom: '1px solid #ef444444', padding: '48px 60px' }}>
        <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapter 16</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>🔐</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)' }}>Security</h1>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          Protecting systems from threats — program attacks, cryptography, authentication, OS security mechanisms, and firewalls.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['Crypto Visualizer', 'Vulnerability Scanner', 'Buffer Overflow', 'ASLR & DEP', 'Firewalls'].map(function(f) {
            return <span key={f} style={{ fontSize: 13, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef444433', color: '#ef4444', padding: '4px 14px', borderRadius: 20 }}>{f}</span>
          })}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 240, minWidth: 240, padding: '24px 0', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: 'fit-content' }}>
          {sections.map(function(s) {
            return (
              <div key={s.id} onClick={function() { setActive(s.id) }} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontWeight: 500, color: active === s.id ? '#ef4444' : 'var(--text-secondary)', background: active === s.id ? 'rgba(239,68,68,0.1)' : 'transparent', borderLeft: active === s.id ? '3px solid #ef4444' : '3px solid transparent', transition: 'all 0.2s' }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, padding: '48px 60px', maxWidth: 900 }}>

          {active === 'overview' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.1 The Security Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>What security means for an OS and why it is challenging.</p>

              <InfoBox color="#ef4444">
                A system is <strong>secure</strong> if its resources are used and accessed only as intended under all circumstances. Security requires preventing <strong>malicious misuse</strong> of the computer system. A system can be compromised at any layer — hardware, OS, application, or user.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Security Violations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { type: 'Breach of Confidentiality', color: '#ef4444', desc: 'Unauthorized reading of data. Examples: stealing passwords, reading private files, wiretapping.' },
                  { type: 'Breach of Integrity', color: '#f97316', desc: 'Unauthorized modification of data. Examples: modifying bank records, changing grades, altering logs.' },
                  { type: 'Breach of Availability', color: '#f59e0b', desc: 'Unauthorized destruction or denial of service. Examples: deleting files, DoS attacks, ransomware.' },
                  { type: 'Theft of Service', color: '#8b5cf6', desc: 'Unauthorized use of resources. Examples: cryptomining on someone\'s servers, spam relay, botnet.' },
                  { type: 'Denial of Service (DoS)', color: '#3b82f6', desc: 'Preventing legitimate use. Flood server with requests so it cannot serve real users.' },
                  { type: 'Masquerading', color: '#10b981', desc: 'Pretending to be an authorized user (impersonation). Examples: phishing, session hijacking.' },
                ].map(function(v) {
                  return (
                    <div key={v.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + v.color + '44', borderLeft: '4px solid ' + v.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: v.color, marginBottom: 6, fontSize: 13 }}>{v.type}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Security Levels</h3>
              <InfoBox color="#8b5cf6">
                Security must be maintained at multiple levels — a chain is only as strong as its weakest link:
                <br />• <strong>Physical</strong>: lock the server room, secure hardware
                <br />• <strong>Network</strong>: firewalls, VPNs, encrypted traffic
                <br />• <strong>Operating System</strong>: access controls, privilege separation, patching
                <br />• <strong>Application</strong>: input validation, secure coding, least privilege
                <br />• <strong>Human</strong>: social engineering is the most common attack vector
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Security Principles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { principle: 'Principle of Least Privilege', color: '#ef4444', desc: 'Every program and user should operate with only the minimum privileges necessary. Limits damage from compromise.' },
                  { principle: 'Defense in Depth', color: '#f97316', desc: 'Multiple layers of security. If one layer fails, others still protect. No single point of failure.' },
                  { principle: 'Fail-Safe Defaults', color: '#f59e0b', desc: 'Default state should be secure. Deny access by default; explicitly grant permissions.' },
                  { principle: 'Economy of Mechanism', color: '#10b981', desc: 'Keep security mechanisms simple. Complex mechanisms are hard to verify and more likely to have bugs.' },
                  { principle: 'Open Design', color: '#3b82f6', desc: 'Security should not depend on secrecy of design (no security through obscurity). Assume attacker knows the algorithm.' },
                ].map(function(p) {
                  return (
                    <div key={p.principle} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', border: '1px solid ' + p.color + '33', borderRadius: 8, padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: p.color, fontSize: 13, minWidth: 200 }}>{p.principle}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.desc}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>The human factor:</strong> According to security researchers, over 90% of successful cyberattacks begin with phishing. Technical security is often bypassed by tricking humans into revealing credentials or running malware. The most sophisticated OS security cannot protect against a user who clicks a malicious email attachment. Security awareness training is as important as technical controls.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Security vs usability trade-off:</strong> Every security measure reduces usability. Multi-factor authentication is more secure but less convenient. Strict least privilege means more permission prompts. The goal is finding the right balance — security controls that protect against real threats without making the system unusable. Overly strict security often leads to users finding workarounds that are even less secure.
              </LearnMore>

              <NavButtons next={function() { setActive('threats') }} nextLabel="16.2 Program Threats →" />
            </div>
          )}

          {active === 'threats' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.2 Program Threats</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Malicious code and exploitation techniques that attack through programs.</p>

              <InfoBox color="#f97316">
                Program threats exploit vulnerabilities in software to gain unauthorized access or cause damage. They range from malicious software (malware) to exploitation of programming errors like buffer overflows.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Types of Malware</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { name: 'Virus', color: '#ef4444', icon: '🦠', desc: 'Code that attaches itself to legitimate programs. Spreads when the infected program runs or file is shared. Requires human action to propagate. Can be file infectors, boot sector viruses, macro viruses.' },
                  { name: 'Worm', color: '#f97316', icon: '🐛', desc: 'Self-replicating program that spreads across networks autonomously. Exploits vulnerabilities to infect systems without user action. Famous: Morris Worm (1988), Blaster, Conficker, WannaCry.' },
                  { name: 'Trojan Horse', color: '#f59e0b', icon: '🐴', desc: 'Legitimate-looking program that contains hidden malicious code. User voluntarily installs it. Creates backdoors, steals data, installs ransomware. Named after the Trojan Horse of Greek mythology.' },
                  { name: 'Spyware/Adware', color: '#8b5cf6', icon: '👁️', desc: 'Secretly monitors user activity, steals credentials, records keystrokes. Often bundled with free software. Sends data to attacker without user knowledge.' },
                  { name: 'Ransomware', color: '#3b82f6', icon: '💰', desc: 'Encrypts user files and demands payment for decryption key. WannaCry (2017) affected 200,000+ computers. Prevention: backups, patching. Never guaranteed to work if paid.' },
                  { name: 'Rootkit', color: '#10b981', icon: '🔑', desc: 'Hides itself and other malware from the OS and security tools. Modifies kernel, file system, or system calls to be invisible. Very hard to detect and remove — often requires OS reinstall.' },
                ].map(function(m) {
                  return (
                    <div key={m.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + m.color + '33', borderLeft: '4px solid ' + m.color, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                        <div style={{ fontWeight: 700, color: m.color, fontSize: 14 }}>{m.name}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Buffer Overflow Attack</h3>
              <InfoBox color="#ef4444">
                The most classic and dangerous program vulnerability. C/C++ do not automatically check array bounds. Writing past the end of a stack buffer overwrites the return address. Attacker crafts input to place shellcode in the buffer and overwrite the return address to point to it.
              </InfoBox>

              <div style={{ background: '#0d1117', border: '1px solid #ef444444', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* Vulnerable function */</div>
                  <div>void vulnerable(char *input) {'{'}</div>
                  <div style={{ paddingLeft: 16 }}>char buf[64]; <span style={{ color: '#8b949e' }}>/* small buffer */</span></div>
                  <div style={{ paddingLeft: 16, color: '#ef4444' }}>strcpy(buf, input); <span style={{ color: '#8b949e' }}>/* no bounds check! */</span></div>
                  <div>{'}'}</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Stack layout */</div>
                  <div>[buf: 64 bytes][saved_rbp][return_addr][...]</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* Attack: input = 64 bytes junk + new_return_addr */</div>
                  <div style={{ color: '#ef4444' }}>strcpy overwrites return_addr → jumps to attacker code!</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Other Code Injection Attacks</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                {[
                  { name: 'SQL Injection', color: '#8b5cf6', code: "SELECT * FROM users WHERE name='" + "' OR 1=1 --", desc: 'User input injected into SQL query. Bypass login, dump database, drop tables.' },
                  { name: 'Cross-Site Scripting (XSS)', color: '#f59e0b', code: '<script>steal_cookies()</script>', desc: 'Inject JS into web page. Steal session cookies, redirect users, deface pages.' },
                  { name: 'Command Injection', color: '#ef4444', code: 'filename; rm -rf /', desc: 'Inject shell commands into system() calls. Execute arbitrary OS commands.' },
                  { name: 'Format String Attack', color: '#3b82f6', code: 'printf(user_input) // no format string!', desc: 'Use %n format specifier to write arbitrary values to memory.' },
                ].map(function(a) {
                  return (
                    <div key={a.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + a.color + '44', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 700, color: a.color, marginBottom: 6, fontSize: 13 }}>{a.name}</div>
                      <code style={{ display: 'block', fontSize: 11, background: '#0d1117', color: a.color, padding: '4px 8px', borderRadius: 4, marginBottom: 6, fontFamily: 'monospace', wordBreak: 'break-all' }}>{a.code}</code>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Vulnerability Scanner</h3>
              <ThreatScanner />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Return-oriented programming (ROP):</strong> Modern systems have non-executable stacks (NX/DEP) — injected shellcode cannot run. ROP bypasses this by chaining "gadgets" — small sequences of existing code ending in RET instructions. By controlling the stack, the attacker chains gadgets to perform arbitrary computations using only existing code. Requires ASLR defeat to find gadget addresses. Tools like ROPgadget automatically find gadgets in binaries.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>CVE and CVSS:</strong> Common Vulnerabilities and Exposures (CVE) is a public database of security vulnerabilities. Each has a CVE number (CVE-2021-44228 = Log4Shell). CVSS (Common Vulnerability Scoring System) rates severity 0-10. Score 9-10 = Critical. Log4Shell was rated 10.0 — affected millions of Java applications by allowing remote code execution via a log message. Understanding CVE tracking is essential for security operations.
              </LearnMore>

              <NavButtons prev={function() { setActive('overview') }} prevLabel="← 16.1 Overview" next={function() { setActive('system') }} nextLabel="16.3 System Threats →" />
            </div>
          )}

          {active === 'system' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.3 System and Network Threats</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Attacks that target the system and network rather than individual programs.</p>

              <InfoBox color="#3b82f6">
                System threats exploit vulnerabilities at the OS or network level — port scanning, denial of service, man-in-the-middle attacks, and more. These attacks often leverage program vulnerabilities but target the system as a whole.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    name: 'Port Scanning',
                    color: '#3b82f6',
                    desc: 'Attacker probes which ports are open on a target system to identify running services and potential vulnerabilities. Not an attack itself — reconnaissance. Tools: nmap.',
                    example: 'nmap -sV target.com → finds open ports + service versions',
                    defense: 'Firewall to block unused ports. Disable unnecessary services.'
                  },
                  {
                    name: 'Denial of Service (DoS / DDoS)',
                    color: '#ef4444',
                    desc: 'Overwhelm system resources so legitimate users cannot be served. DDoS uses thousands of compromised machines (botnet) to amplify the attack. Hard to defend against at scale.',
                    example: 'SYN flood: send millions of TCP SYN packets, never complete handshake, exhaust connection table.',
                    defense: 'Rate limiting, SYN cookies, CDN/DDoS protection services, Anycast routing.'
                  },
                  {
                    name: 'Man-in-the-Middle (MITM)',
                    color: '#f59e0b',
                    desc: 'Attacker secretly intercepts and possibly alters communications between two parties. ARP poisoning on local network, rogue WiFi hotspot, BGP hijacking on the internet.',
                    example: 'ARP poison: tell Alice "I am the router" + tell router "I am Alice" → intercept all traffic.',
                    defense: 'TLS/HTTPS for encryption and authentication. Certificate pinning. VPNs.'
                  },
                  {
                    name: 'Sniffing (Eavesdropping)',
                    color: '#8b5cf6',
                    desc: 'Capturing network packets to read unencrypted data. Especially dangerous on shared networks (WiFi, old Ethernet hubs). Passive — attacker just listens.',
                    example: 'Wireshark on public WiFi captures unencrypted HTTP passwords and session cookies.',
                    defense: 'Encrypt all traffic (HTTPS, SSH, VPN). Never send sensitive data over HTTP.'
                  },
                  {
                    name: 'Session Hijacking',
                    color: '#10b981',
                    desc: 'Steal session tokens (cookies) to impersonate an authenticated user without knowing their password. Often combined with XSS or sniffing.',
                    example: 'Steal session cookie from XSS or sniffing → replay cookie to server → logged in as victim.',
                    defense: 'Secure + HttpOnly cookie flags. Short session timeouts. HTTPS only.'
                  },
                ].map(function(t) {
                  return (
                    <div key={t.name} style={{ background: 'var(--bg-card)', border: '1px solid ' + t.color + '33', borderLeft: '4px solid ' + t.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: t.color, fontSize: 14, marginBottom: 8 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{t.desc}</div>
                      <div style={{ background: '#0d1117', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'monospace', color: t.color, marginBottom: 8 }}>{t.example}</div>
                      <div style={{ fontSize: 12, color: '#10b981' }}>Defense: {t.defense}</div>
                    </div>
                  )
                })}
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Amplification attacks:</strong> DDoS amplification uses protocols that produce large responses to small requests. DNS amplification: send a small DNS query spoofed as the victim's IP to thousands of DNS servers — each sends a large response to the victim. Amplification factor can be 100x. NTP (monlist command), SSDP, Memcached have also been abused for amplification. The 2018 GitHub DDoS reached 1.35 Tbps using Memcached amplification.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>BGP hijacking:</strong> The Border Gateway Protocol (BGP) routes traffic between autonomous systems on the internet. BGP is based on trust — routers accept route announcements without cryptographic verification. BGP hijacking: announce more specific routes for victim's IP prefixes, causing traffic to be misdirected to the attacker. Used for traffic interception, spam, and Bitcoin theft. RPKI (Resource Public Key Infrastructure) adds cryptographic validation to prevent this.
              </LearnMore>

              <NavButtons prev={function() { setActive('threats') }} prevLabel="← 16.2 Program Threats" next={function() { setActive('crypto') }} nextLabel="16.4 Cryptography →" />
            </div>
          )}

          {active === 'crypto' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.4 Cryptography as a Security Tool</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>The mathematical foundation of modern security.</p>

              <InfoBox color="#8b5cf6">
                Cryptography provides the tools to ensure <strong>confidentiality</strong> (only authorized parties can read data), <strong>integrity</strong> (data has not been modified), and <strong>authentication</strong> (parties are who they claim to be). Modern cryptography is based on computational hardness — problems easy to verify but hard to reverse.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Symmetric Encryption</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 18, marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  Same key for encryption and decryption. Very fast — suitable for bulk data. The key distribution problem: how to securely share the key?
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { alg: 'AES-256', color: '#10b981', note: 'Standard. Very fast with AES-NI hardware.' },
                    { alg: 'ChaCha20', color: '#3b82f6', note: 'Fast in software. Used in TLS 1.3.' },
                    { alg: 'DES/3DES', color: '#6e7681', note: 'Legacy. DES broken (56-bit key). Avoid.' },
                  ].map(function(a) {
                    return <span key={a.alg} style={{ fontSize: 12, background: a.color + '18', color: a.color, border: '1px solid ' + a.color + '44', padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>{a.alg} — {a.note}</span>
                  })}
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Asymmetric (Public-Key) Encryption</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 18, marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                  Two keys: <strong>public key</strong> (share with everyone) and <strong>private key</strong> (keep secret). Encrypted with public key, decrypted with private key. Solves key distribution — no secret sharing needed. Much slower than symmetric — used for key exchange only.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { alg: 'RSA-2048+', color: '#8b5cf6', note: 'Based on factoring large primes.' },
                    { alg: 'ECDH/ECDSA', color: '#f59e0b', note: 'Elliptic curve. Smaller keys, faster.' },
                    { alg: 'X25519', color: '#10b981', note: 'Modern. Used in TLS 1.3, SSH.' },
                  ].map(function(a) {
                    return <span key={a.alg} style={{ fontSize: 12, background: a.color + '18', color: a.color, border: '1px solid ' + a.color + '44', padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>{a.alg} — {a.note}</span>
                  })}
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Cryptographic Hash Functions</h3>
              <InfoBox color="#f59e0b">
                Hash functions map arbitrary input to a fixed-size output (digest). Properties: <strong>deterministic</strong>, <strong>one-way</strong> (cannot reverse), <strong>collision resistant</strong> (hard to find two inputs with same hash), <strong>avalanche effect</strong> (small input change = completely different hash). Used for: password storage, file integrity, digital signatures, blockchain.
              </InfoBox>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { fn: 'SHA-256', color: '#10b981', note: '256-bit. Standard. Used everywhere.' },
                  { fn: 'SHA-3/Keccak', color: '#3b82f6', note: '256-512 bit. NIST standard 2015.' },
                  { fn: 'bcrypt/scrypt', color: '#8b5cf6', note: 'Slow by design — for password hashing.' },
                  { fn: 'MD5/SHA-1', color: '#ef4444', note: 'BROKEN — collisions found. Avoid.' },
                ].map(function(h) {
                  return <div key={h.fn} style={{ fontSize: 12, background: h.color + '18', color: h.color, border: '1px solid ' + h.color + '44', padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>{h.fn} — {h.note}</div>
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Digital Signatures</h3>
              <InfoBox color="#3b82f6">
                Digital signatures provide <strong>authentication</strong> and <strong>non-repudiation</strong>. Sign with PRIVATE key, verify with PUBLIC key. Process: hash the document, encrypt the hash with private key = signature. Verifier: decrypt signature with public key, compare with document hash. If they match — document is unmodified and came from key owner.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Crypto Visualizer</h3>
              <CryptoVisualizer />

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>TLS handshake:</strong> TLS (Transport Layer Security) combines symmetric and asymmetric cryptography. Handshake: (1) Client hello with supported cipher suites. (2) Server sends certificate (contains public key, signed by CA). (3) Key exchange (ECDH): both derive the same shared secret without transmitting it. (4) Session keys derived from shared secret. (5) All further communication encrypted with symmetric AES. TLS 1.3 reduced this to 1 round-trip (vs 2 for TLS 1.2).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Post-quantum cryptography:</strong> Quantum computers can break RSA and ECDH (using Shor's algorithm) and weaken AES (Grover's algorithm). NIST selected post-quantum algorithms in 2022: CRYSTALS-Kyber (key encapsulation), CRYSTALS-Dilithium (signatures), both based on lattice problems which quantum computers cannot efficiently solve. TLS and SSH are already being updated to support these algorithms.
              </LearnMore>

              <NavButtons prev={function() { setActive('system') }} prevLabel="← 16.3 System Threats" next={function() { setActive('auth') }} nextLabel="16.5 Authentication →" />
            </div>
          )}

          {active === 'auth' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.5 Authentication</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Verifying the identity of users and systems.</p>

              <InfoBox color="#10b981">
                Authentication is the process of verifying that an entity is who it claims to be. The three factors of authentication: <strong>something you know</strong> (password, PIN), <strong>something you have</strong> (token, phone, smart card), <strong>something you are</strong> (fingerprint, face, voice).
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Password Authentication</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { issue: 'Storing plain passwords', severity: 'CRITICAL', fix: 'Never store plain passwords. Hash with bcrypt, scrypt, or Argon2. These are slow by design to resist brute force.' },
                  { issue: 'Dictionary attacks', severity: 'HIGH', fix: 'Salting: add random bytes to each password before hashing. Same password → different hash for each user. Prevents rainbow table attacks.' },
                  { issue: 'Brute force attacks', severity: 'HIGH', fix: 'Rate limiting, account lockout, CAPTCHA, slow hash functions (bcrypt with work factor), 2FA.' },
                  { issue: 'Password reuse', severity: 'MEDIUM', fix: 'If one site is breached, credential stuffing attacks try same password elsewhere. Use unique passwords + password manager.' },
                ].map(function(i) {
                  const color = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b' }[i.severity]
                  return (
                    <div key={i.issue} style={{ background: 'var(--bg-card)', border: '1px solid ' + color + '33', borderLeft: '4px solid ' + color, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, color: color, fontSize: 13 }}>{i.issue}</div>
                        <span style={{ fontSize: 11, background: color + '22', color: color, padding: '1px 8px', borderRadius: 8 }}>{i.severity}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{i.fix}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Password Hashing</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 24 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}>/* WRONG — never store plain passwords */</div>
                  <div style={{ color: '#ef4444' }}>db.store("alice", "mysecret123")</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* WRONG — MD5/SHA1 too fast */</div>
                  <div style={{ color: '#ef4444' }}>db.store("alice", md5("mysecret123"))</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}>/* CORRECT — bcrypt with salt */</div>
                  <div style={{ color: '#10b981' }}>salt = random_bytes(16)</div>
                  <div style={{ color: '#10b981' }}>hash = bcrypt("mysecret123", salt, rounds=12)</div>
                  <div style={{ color: '#10b981' }}>db.store("alice", salt + hash)</div>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Multi-Factor Authentication (MFA)</h3>
              <InfoBox color="#3b82f6">
                Combining two or more authentication factors dramatically increases security. Even if a password is stolen, the attacker still needs the second factor. Common MFA methods: TOTP (Time-based One-Time Password — Google Authenticator), SMS codes (less secure — SIM swapping), hardware tokens (YubiKey), push notifications, biometrics.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Biometric Authentication</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Advantages</div>
                  <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 14 }}>
                    <li>Hard to forget (always with you)</li>
                    <li>Hard to transfer/share</li>
                    <li>Convenient — fast authentication</li>
                    <li>Difficult to guess or brute force</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Disadvantages</div>
                  <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 14 }}>
                    <li>Cannot be changed if compromised</li>
                    <li>False accept/reject rates</li>
                    <li>Privacy concerns (biometric databases)</li>
                    <li>Can be spoofed (photos, replicas)</li>
                  </ul>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>FIDO2 / WebAuthn:</strong> The FIDO2 standard eliminates passwords for web authentication. A hardware security key (YubiKey) or device (phone, laptop TPM) stores a private key. During registration, the key pair is generated and the public key stored on the server. During login, the server sends a challenge signed by the private key — proves identity without transmitting any secret. Resistant to phishing (domain is part of the challenge), replay attacks, and server breaches (server never sees private key).
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Kerberos:</strong> Kerberos is a network authentication protocol used in Windows Active Directory and many Unix systems. It uses symmetric cryptography and a trusted third party (Key Distribution Center). Users authenticate once to the KDC and receive "tickets" (encrypted tokens) that prove their identity to other services — no passwords transmitted over the network. Single Sign-On (SSO) across the domain. Named after the three-headed dog guarding the underworld in Greek mythology.
              </LearnMore>

              <NavButtons prev={function() { setActive('crypto') }} prevLabel="← 16.4 Cryptography" next={function() { setActive('defenses') }} nextLabel="16.6 OS Defenses →" />
            </div>
          )}

          {active === 'defenses' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.6 OS Security Defenses</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Kernel and OS mechanisms that protect against attacks.</p>

              <InfoBox color="#8b5cf6">
                Modern operating systems include multiple security mechanisms to make exploitation harder. No single mechanism is sufficient — defense in depth requires combining many layers.
              </InfoBox>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #ef444444', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Non-Executable Stack/Heap (NX/DEP)</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Mark stack and heap memory as non-executable. Even if attacker injects shellcode into a buffer, the CPU refuses to execute it (page fault). Implemented via the NX bit in page table entries. Called DEP (Data Execution Prevention) on Windows. Defeated by ROP attacks.
                  </p>
                  <div style={{ fontSize: 12, color: '#10b981' }}>Prevents: direct shellcode injection attacks</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #3b82f644', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Address Space Layout Randomization (ASLR)</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Randomize the base addresses of stack, heap, and loaded libraries on each execution. Attackers cannot hardcode memory addresses in their exploits. Combined with NX, makes reliable exploitation very difficult. Can be defeated by memory disclosure vulnerabilities or brute force on 32-bit systems.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 8, fontSize: 11, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 8 }}>
                    <div style={{ color: '#8b949e' }}># Check ASLR status on Linux</div>
                    <div>cat /proc/sys/kernel/randomize_va_space</div>
                    <div style={{ color: '#10b981' }}>2  # = full ASLR (stack + heap + libs)</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>Prevents: attacks that rely on known memory addresses</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #10b98144', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Stack Canaries</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Compiler inserts a random "canary" value on the stack between local variables and the return address. Before returning, the function checks if the canary is unchanged. A buffer overflow that overwrites the return address also overwrites the canary — detected! Program terminates safely.
                  </p>
                  <div style={{ background: '#0d1117', borderRadius: 6, padding: 8, fontSize: 11, fontFamily: 'monospace', color: '#e6edf3', lineHeight: 1.8, marginBottom: 8 }}>
                    <div>[local vars][CANARY: 0x3f7a2b19][saved_rbp][return_addr]</div>
                    <div style={{ color: '#8b949e' }}># gcc: -fstack-protector-all enables canaries</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>Prevents: simple stack buffer overflow attacks</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #f59e0b44', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Mandatory Access Control (MAC) — SELinux / AppArmor</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Traditional Unix DAC lets the file owner decide permissions. MAC adds system-wide mandatory policies that even root cannot override. SELinux labels every process, file, port with a security context. Policy defines what contexts can access what. Even if a web server is compromised, SELinux prevents it from reading /etc/shadow or connecting to unrelated ports.
                  </p>
                  <div style={{ fontSize: 12, color: '#10b981' }}>Prevents: privilege escalation, lateral movement after compromise</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid #8b5cf644', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>seccomp — System Call Filtering</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    Restricts which system calls a process can make. A web server typically needs only read, write, send, recv, accept — not mount, ptrace, kexec_load. seccomp-BPF lets you write a filter program that decides for each syscall whether to allow, deny, or kill. Docker, Chrome sandbox, Firefox, OpenSSH all use seccomp.
                  </p>
                  <div style={{ fontSize: 12, color: '#10b981' }}>Prevents: exploit payloads that use unusual syscalls, kernel attack surface reduction</div>
                </div>

              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>Control Flow Integrity (CFI):</strong> ROP attacks work by chaining return instructions. CFI instruments the binary to verify that every indirect call or return goes to a valid target. Forward-edge CFI checks that function pointers only call valid function entry points. Backward-edge CFI (shadow stack — Intel CET, ARM PAC) maintains a separate shadow copy of return addresses. If the return address on the regular stack is modified, it won't match the shadow stack — attack detected.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Linux capabilities:</strong> Traditional Unix has only two privilege levels: root (uid=0) and non-root. Linux capabilities split root privileges into about 40 separate capabilities: CAP_NET_BIND_SERVICE (bind to ports below 1024), CAP_CHOWN (change file ownership), CAP_SYS_PTRACE (debug processes), etc. A web server can be given only CAP_NET_BIND_SERVICE without full root. If compromised, the attacker has very limited ability to cause damage.
              </LearnMore>

              <NavButtons prev={function() { setActive('auth') }} prevLabel="← 16.5 Authentication" next={function() { setActive('firewall') }} nextLabel="16.7 Firewalling →" />
            </div>
          )}

          {active === 'firewall' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>16.7 Firewalling</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Network-level protection — controlling what traffic enters and leaves.</p>

              <InfoBox color="#f97316">
                A <strong>firewall</strong> is a system that enforces an access policy between networks — typically between a trusted internal network and the untrusted internet. All traffic must pass through the firewall, which inspects and allows or blocks it based on rules.
              </InfoBox>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 16px' }}>Types of Firewalls</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  {
                    type: 'Packet Filter (Stateless)',
                    color: '#3b82f6',
                    desc: 'Examines each packet in isolation. Makes decisions based on source/destination IP, port, and protocol. Fast but cannot detect attacks that span multiple packets.',
                    example: 'Block all incoming TCP connections to port 22 from outside. Allow all outbound HTTP/HTTPS.',
                    limitation: 'Cannot track connection state. Easily bypassed by fragmentation.'
                  },
                  {
                    type: 'Stateful Inspection',
                    color: '#10b981',
                    desc: 'Tracks the state of network connections. Knows if a packet is part of an established connection or a new connection attempt. Allows return traffic for outbound connections automatically.',
                    example: 'Allow outbound HTTP requests. Automatically allow return packets for those connections.',
                    limitation: 'More CPU/memory overhead. Connection tracking table can be exhausted.'
                  },
                  {
                    type: 'Application Layer (Deep Packet Inspection)',
                    color: '#8b5cf6',
                    desc: 'Inspects payload content at application layer (Layer 7). Can detect and block SQL injection, XSS, malware signatures in HTTP traffic. Web Application Firewalls (WAF) operate at this level.',
                    example: 'Block HTTP requests containing SQL injection patterns. Allow only valid HTTP methods.',
                    limitation: 'Cannot inspect encrypted HTTPS traffic without SSL inspection (man-in-the-middle). Performance overhead.'
                  },
                  {
                    type: 'Next-Generation Firewall (NGFW)',
                    color: '#f59e0b',
                    desc: 'Combines stateful inspection + DPI + IDS/IPS + application identification. Can identify applications (Zoom, Netflix, BitTorrent) regardless of port. Integrates threat intelligence.',
                    example: 'Block Tor traffic regardless of port. Allow Zoom but block BitTorrent. Alert on known malware C&C destinations.',
                    limitation: 'Expensive. Complex configuration. Performance impact.'
                  },
                ].map(function(fw) {
                  return (
                    <div key={fw.type} style={{ background: 'var(--bg-card)', border: '1px solid ' + fw.color + '33', borderLeft: '4px solid ' + fw.color, borderRadius: 10, padding: 18 }}>
                      <div style={{ fontWeight: 700, color: fw.color, fontSize: 14, marginBottom: 8 }}>{fw.type}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{fw.desc}</div>
                      <div style={{ fontSize: 12, color: fw.color, background: fw.color + '11', padding: '4px 10px', borderRadius: 6, marginBottom: 6 }}>Example: {fw.example}</div>
                      <div style={{ fontSize: 12, color: '#6e7681' }}>Limitation: {fw.limitation}</div>
                    </div>
                  )
                })}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>Linux iptables Rules</h3>
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e6edf3', lineHeight: 1.9 }}>
                  <div style={{ color: '#8b949e' }}># Allow established connections</div>
                  <div>iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Allow SSH from specific IP</div>
                  <div>iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Allow HTTP and HTTPS</div>
                  <div>iptables -A INPUT -p tcp --dport 80 -j ACCEPT</div>
                  <div>iptables -A INPUT -p tcp --dport 443 -j ACCEPT</div>
                  <div></div>
                  <div style={{ color: '#8b949e' }}># Drop everything else (default deny)</div>
                  <div style={{ color: '#ef4444' }}>iptables -A INPUT -j DROP</div>
                </div>
              </div>

              <LearnMore>
                <strong style={{ color: 'var(--text-primary)' }}>DMZ (Demilitarized Zone):</strong> A network segment placed between the internal trusted network and the external untrusted internet. Public-facing servers (web, mail, DNS) are placed in the DMZ — accessible from the internet but isolated from the internal network. Two firewalls: outer firewall between internet and DMZ (allows web traffic), inner firewall between DMZ and internal network (very strict rules). If a DMZ server is compromised, the attacker is isolated from internal systems.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>Zero Trust Architecture:</strong> Traditional "castle and moat" security assumes everything inside the perimeter is trusted. Zero Trust assumes breach — verify every request as if it comes from an untrusted network, regardless of where it originates. Principles: verify explicitly (authenticate every request), use least privilege access, assume breach (minimize blast radius). Implemented via identity-aware proxies, micro-segmentation, continuous monitoring. Adopted by Google (BeyondCorp) and increasingly enterprises post-COVID.
              </LearnMore>

              <NavButtons prev={function() { setActive('defenses') }} prevLabel="← 16.6 OS Defenses" next={function() { setActive('simulator') }} nextLabel="Simulators →" />
            </div>
          )}

          {active === 'simulator' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Security Simulators</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Interactive tools for cryptography and vulnerability analysis.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Cryptography Visualizer</h3>
              <CryptoVisualizer />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32 }}>Vulnerability Pattern Scanner</h3>
              <ThreatScanner />

              <NavButtons prev={function() { setActive('firewall') }} prevLabel="← 16.7 Firewalling" next={function() { setActive('lab') }} nextLabel="Lab →" />
            </div>
          )}

          {active === 'lab' && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lab — Security in Code and Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Explore security concepts through code and Linux commands.</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>Lab 1 — Security in Python</h3>
              <CodeEditor defaultLang="python" height={280} />

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 32, color: '#3b82f6' }}>Lab 2 — Security Commands in Terminal</h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {[
                  ['cat /etc/shadow',              'View hashed passwords (requires root)'],
                  ['openssl rand -hex 32',         'Generate 32 random bytes (256-bit key)'],
                  ['echo -n "hello" | sha256sum',  'SHA-256 hash of "hello"'],
                  ['openssl genrsa -out key.pem 2048', 'Generate RSA private key'],
                  ['cat /proc/sys/kernel/randomize_va_space', 'Check ASLR level (0=off, 2=full)'],
                  ['ss -tlnp',                     'Show listening TCP ports'],
                  ['iptables -L -n',               'List firewall rules'],
                  ['last',                         'Show recent logins'],
                  ['who',                          'Show currently logged in users'],
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>6 questions covering all of Chapter 16.</p>
              {!quiz.done
                ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {quiz.current + 1} of {QUIZ.length}</span>
                      <span style={{ fontSize: 13, color: '#ef4444' }}>Score: {quiz.score}</span>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 24, height: 6 }}>
                      <div style={{ height: '100%', background: '#ef4444', borderRadius: 8, width: (quiz.current / QUIZ.length * 100) + '%', transition: 'width 0.3s' }} />
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
                        <button onClick={nextQuestion} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
                      {quiz.score === 6 ? 'Perfect! You mastered Chapter 16!' : quiz.score >= 4 ? 'Good work! Review sections you missed.' : 'Keep studying!'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={function() { setQuiz({ current: 0, selected: null, answered: false, score: 0, done: false }) }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Retry Quiz</button>
                      <button onClick={function() { window.location.href = '/chapter/17' }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Next: Chapter 17 →</button>
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