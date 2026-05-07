import { useState, useRef } from 'react'

const LANGUAGES = [
  { id: 'c',          name: 'C',          color: '#3b82f6' },
  { id: 'cpp',        name: 'C++',        color: '#8b5cf6' },
  { id: 'python',     name: 'Python',     color: '#f59e0b' },
  { id: 'javascript', name: 'JavaScript', color: '#eab308' },
  { id: 'java',       name: 'Java',       color: '#ef4444' },
]

const CODE = {
  c: '#include <stdio.h>\n#include <unistd.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    printf("Process ID: %d\\n", getpid());\n    printf("User ID:    %d\\n", getuid());\n    return 0;\n}',
  cpp: '#include <iostream>\n#include <unistd.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    cout << "PID: " << getpid() << endl;\n    return 0;\n}',
  python: 'import os\nimport platform\n\nprint("=== System Info ===")\nprint(f"OS:     {platform.system()} {platform.release()}")\nprint(f"PID:    {os.getpid()}")\nprint(f"UID:    {os.getuid()}")\nprint(f"CWD:    {os.getcwd()}")\nprint(f"Parent: {os.getppid()}")',
  javascript: 'const os = require("os");\n\nconsole.log("=== OS Info ===");\nconsole.log("Platform:", os.platform());\nconsole.log("Arch:    ", os.arch());\nconsole.log("CPUs:    ", os.cpus().length);\nconst total = (os.totalmem()/1024/1024).toFixed(0);\nconst free  = (os.freemem() /1024/1024).toFixed(0);\nconsole.log("RAM Total:", total, "MB");\nconsole.log("RAM Free: ", free,  "MB");',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("=== Java Info ===");\n        System.out.println("OS: " + System.getProperty("os.name"));\n        System.out.println("Arch: " + System.getProperty("os.arch"));\n        Runtime rt = Runtime.getRuntime();\n        long mb = 1024 * 1024;\n        System.out.println("Total RAM: " + rt.totalMemory()/mb + " MB");\n        System.out.println("Free  RAM: " + rt.freeMemory()/mb  + " MB");\n        System.out.println("CPUs: " + rt.availableProcessors());\n    }\n}',
}

const SITES = [
  { name: 'OneCompiler', url: 'https://onecompiler.com',      color: '#f59e0b' },
  { name: 'JDoodle',     url: 'https://www.jdoodle.com',      color: '#10b981' },
  { name: 'Replit',      url: 'https://replit.com',           color: '#8b5cf6' },
  { name: 'Programiz',   url: 'https://www.programiz.com/c-programming/online-compiler', color: '#3b82f6' },
]

const LINUX_SITES = [
  { name: 'JSLinux',   url: 'https://bellard.org/jslinux/',          color: '#8b5cf6' },
  { name: 'copy.sh',   url: 'https://copy.sh/v86/?profile=linux26',  color: '#06b6d4' },
  { name: 'DistroSea', url: 'https://distrosea.com',                  color: '#f59e0b' },
]

const WSL = [
  { n: 1, color: '#3b82f6', title: 'Open PowerShell as Administrator', cmd: null,       desc: 'Press Windows key, type PowerShell, right-click, Run as administrator' },
  { n: 2, color: '#10b981', title: 'Run this one command',             cmd: 'wsl --install', desc: 'Installs WSL2 and Ubuntu. Wait for it to finish.' },
  { n: 3, color: '#f59e0b', title: 'Restart your computer',            cmd: null,       desc: 'Required after installation.' },
  { n: 4, color: '#8b5cf6', title: 'Open Ubuntu',                      cmd: null,       desc: 'Press Windows key, search Ubuntu, open it, set username and password.' },
  { n: 5, color: '#ef4444', title: 'Install GCC and Python',           cmd: 'sudo apt update && sudo apt install gcc python3 -y', desc: 'Now you can compile all code in this course.' },
]

export default function CodeEditor({ defaultLang = 'python', height = 380 }) {
  const [langId, setLangId]       = useState(defaultLang)
  const [code, setCode]           = useState(CODE[defaultLang] || '')
  const [tab, setTab]             = useState('editor')
  const [copied, setCopied]       = useState(false)
  const [copiedCmd, setCopiedCmd] = useState(null)
  const textareaRef               = useRef(null)

  const lang = LANGUAGES.find(function(l) { return l.id === langId })

  function changeLang(id) {
    setLangId(id)
    setCode(CODE[id] || '')
    setTab('editor')
    setCopied(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
  }

  function copyCmd(cmd) {
    navigator.clipboard.writeText(cmd)
    setCopiedCmd(cmd)
    setTimeout(function() { setCopiedCmd(null) }, 2000)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta    = textareaRef.current
      const start = ta.selectionStart
      const end   = ta.selectionEnd
      const next  = code.substring(0, start) + '    ' + code.substring(end)
      setCode(next)
      requestAnimationFrame(function() {
        ta.selectionStart = start + 4
        ta.selectionEnd   = start + 4
      })
    }
  }

  const lineCount = code.split('\n').length

  const sectionStyle = {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  }

  const circleStyle = function(color) {
    return {
      background: color, color: 'white',
      width: 28, height: 28, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 14, flexShrink: 0,
    }
  }

  return (
    <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>

      {/* Top bar */}
      <div style={{ background: '#161b22', padding: '10px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ color: '#8b949e', fontSize: 13, marginLeft: 8 }}>Code Editor</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {LANGUAGES.map(function(l) {
            return (
              <button key={l.id} onClick={function() { changeLang(l.id) }} style={{ background: langId === l.id ? l.color + '33' : '#21262d', color: langId === l.id ? l.color : '#8b949e', border: '1px solid ' + (langId === l.id ? l.color : '#30363d'), padding: '3px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: langId === l.id ? 700 : 400 }}>
                {l.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#161b22', display: 'flex', alignItems: 'center', borderBottom: '1px solid #30363d' }}>
        <button onClick={function() { setTab('editor') }} style={{ background: 'none', border: 'none', padding: '8px 18px', cursor: 'pointer', fontSize: 13, color: tab === 'editor' ? '#e6edf3' : '#8b949e', fontWeight: tab === 'editor' ? 600 : 400, borderBottom: tab === 'editor' ? '2px solid ' + lang.color : '2px solid transparent' }}>
          Editor
        </button>
        <button onClick={function() { setTab('howto') }} style={{ background: 'none', border: 'none', padding: '8px 18px', cursor: 'pointer', fontSize: 13, color: tab === 'howto' ? '#e6edf3' : '#8b949e', fontWeight: tab === 'howto' ? 600 : 400, borderBottom: tab === 'howto' ? '2px solid ' + lang.color : '2px solid transparent' }}>
          How to Run
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={copyCode} style={{ background: copied ? '#238636' : '#21262d', color: copied ? 'white' : '#8b949e', border: '1px solid #30363d', padding: '4px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, margin: '4px 4px' }}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <a href={'https://onecompiler.com/' + langId} target="_blank" rel="noreferrer" style={{ background: '#1f6feb', color: 'white', padding: '4px 14px', margin: '4px 8px 4px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
          Run Online
        </a>
      </div>

      {/* Editor tab */}
      {tab === 'editor' && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: 48, flexShrink: 0, padding: '20px 0', background: '#0d1117', borderRight: '1px solid #21262d', userSelect: 'none' }}>
            {Array.from({ length: lineCount }, function(_, i) {
              return (
                <div key={i} style={{ height: '1.7em', lineHeight: '1.7em', textAlign: 'right', paddingRight: 10, fontSize: 13, color: '#484f58', fontFamily: 'JetBrains Mono, Consolas, monospace' }}>
                  {i + 1}
                </div>
              )
            })}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={function(e) { setCode(e.target.value) }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{ flex: 1, minHeight: height, background: '#0d1117', color: '#e6edf3', border: 'none', outline: 'none', padding: 20, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 13, lineHeight: '1.7em', resize: 'vertical', boxSizing: 'border-box', tabSize: 4 }}
          />
        </div>
      )}

      {/* How to Run tab */}
      {tab === 'howto' && (
        <div style={{ padding: 24 }}>

          {/* Option 1 - Online */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={circleStyle('#1f6feb')}>1</div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#79c0ff' }}>Quickest — Free Online IDE (No install needed)</span>
            </div>
            <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16, lineHeight: 1.7 }}>
              Click Copy Code above, open one of these free sites, paste and click Run:
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SITES.map(function(site) {
                return (
                  <a key={site.name} href={site.url} target="_blank" rel="noreferrer" style={{ background: site.color + '18', border: '1px solid ' + site.color + '44', borderRadius: 8, padding: '10px 16px', textDecoration: 'none', display: 'inline-block', minWidth: 120 }}>
                    <div style={{ color: site.color, fontWeight: 700, fontSize: 13 }}>{site.name}</div>
                    <div style={{ color: '#8b949e', fontSize: 11, marginTop: 4 }}>Click to open</div>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Option 2 - WSL */}
          <div style={{ background: '#161b22', border: '1px solid #23863688', borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={circleStyle('#238636')}>2</div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#3fb950' }}>Best — Install Real Ubuntu on Windows (WSL2) — Free, 5 min</span>
            </div>
            <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16, lineHeight: 1.7 }}>
              WSL2 gives you a real Ubuntu Linux terminal inside Windows. No virtual machine. No dual boot. Completely free.
            </p>
            {WSL.map(function(s) {
              return (
                <div key={s.n} style={{ background: '#0d1117', border: '1px solid ' + s.color + '33', borderRadius: 8, padding: 14, display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div style={circleStyle(s.color)}>{s.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: s.color, marginBottom: 4 }}>{s.title}</div>
                    {s.cmd && (
                      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '6px 12px', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 13, color: '#3fb950', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{s.cmd}</span>
                        <button onClick={function() { copyCmd(s.cmd) }} style={{ background: copiedCmd === s.cmd ? '#238636' : 'none', color: copiedCmd === s.cmd ? 'white' : '#8b949e', border: 'none', cursor: 'pointer', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                          {copiedCmd === s.cmd ? 'Copied!' : 'copy'}
                        </button>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              )
            })}
            <div style={{ background: '#0d1117', border: '1px solid #3fb95044', borderRadius: 8, padding: 14, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950', marginBottom: 10 }}>After WSL is installed:</div>
              <div style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: '1.8', color: '#8b949e' }}># Open Ubuntu terminal then:</div>
              <div style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: '1.8', color: '#3fb950' }}>nano hello.c</div>
              <div style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: '1.8', color: '#3fb950' }}>gcc hello.c -o hello</div>
              <div style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: '1.8', color: '#3fb950' }}>./hello</div>
              <div style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: '1.8', color: '#8b949e', marginTop: 8 }}># For Python:</div>
              <div style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 12, lineHeight: '1.8', color: '#3fb950' }}>python3 script.py</div>
            </div>
          </div>

          {/* Option 3 - Browser Linux */}
          <div style={{ background: '#161b22', border: '1px solid #8b5cf644', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={circleStyle('#8b5cf6')}>3</div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#a78bfa' }}>Alternative — Real Linux in Your Browser</span>
            </div>
            <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16, lineHeight: 1.7 }}>
              These run real Linux in your browser. No install needed:
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {LINUX_SITES.map(function(site) {
                return (
                  <a key={site.name} href={site.url} target="_blank" rel="noreferrer" style={{ background: site.color + '18', border: '1px solid ' + site.color + '44', borderRadius: 8, padding: '12px 16px', textDecoration: 'none', display: 'inline-block', minWidth: 140 }}>
                    <div style={{ color: site.color, fontWeight: 700, fontSize: 13 }}>{site.name}</div>
                    <div style={{ color: '#8b949e', fontSize: 11, marginTop: 4 }}>Click to open</div>
                  </a>
                )
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}