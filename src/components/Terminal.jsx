import { useEffect, useRef, useState } from 'react'

const FILES = {
  '/': ['home', 'etc', 'bin', 'usr', 'proc', 'dev', 'var', 'tmp'],
  '/home': ['student'],
  '/home/student': ['main.c', 'notes.txt', 'programs', 'examples'],
  '/home/student/programs': ['hello.c', 'fork_demo.c', 'syscall_demo.c', 'memory.c'],
  '/home/student/examples': ['processes.py', 'threads.py', 'ipc_demo.c'],
  '/etc': ['passwd', 'hosts', 'os-release', 'fstab', 'hostname'],
  '/proc': ['cpuinfo', 'meminfo', 'version', 'uptime', 'loadavg', 'filesystems'],
  '/bin': ['ls', 'cat', 'echo', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'grep'],
  '/usr': ['bin', 'lib', 'include', 'share'],
  '/var': ['log', 'tmp', 'cache'],
  '/tmp': ['session.lock', 'tmpfile.txt'],
}

const FILE_CONTENTS = {
  '/home/student/notes.txt': `Operating System Study Notes
=============================
Chapter 1: Introduction
  - OS is intermediary between user and hardware
  - Kernel runs in privileged (kernel) mode
  - System calls are the OS programming interface

Chapter 2: OS Structures
  - Monolithic kernel: all in kernel space (Linux)
  - Microkernel: minimal kernel, rest in user space
  - Hybrid: mix of both (Windows NT, macOS)

Chapter 3: Processes
  - Process = program in execution
  - PCB stores process state
  - fork() creates child process
  - exec() replaces process image`,

  '/home/student/main.c': `#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Hello from C!\\n");
    printf("My PID: %d\\n", getpid());
    return 0;
}`,

  '/home/student/programs/hello.c': `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,

  '/home/student/programs/fork_demo.c': `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) {
        printf("Child:  PID=%d\\n", getpid());
    } else {
        printf("Parent: PID=%d child=%d\\n",
               getpid(), pid);
        wait(NULL);
    }
    return 0;
}`,

  '/home/student/programs/syscall_demo.c': `#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>

int main() {
    // getpid - system call #39
    printf("PID: %d\\n", getpid());
    // getuid - system call #102
    printf("UID: %d\\n", getuid());
    // write  - system call #1
    write(1, "Hello syscall!\\n", 15);
    return 0;
}`,

  '/home/student/programs/memory.c': `#include <stdio.h>
#include <stdlib.h>

int main() {
    // malloc uses brk() or mmap() syscall
    int *arr = malloc(10 * sizeof(int));
    for (int i = 0; i < 10; i++) arr[i] = i * i;
    printf("Squares: ");
    for (int i = 0; i < 10; i++)
        printf("%d ", arr[i]);
    printf("\\n");
    free(arr);
    return 0;
}`,

  '/home/student/examples/processes.py': `import os
import time

print(f"Parent PID: {os.getpid()}")

pid = os.fork()
if pid == 0:
    print(f"Child  PID: {os.getpid()}")
    os._exit(0)
else:
    os.wait()
    print("Child finished")`,

  '/etc/os-release': `NAME="Ubuntu"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
ID=ubuntu
PRETTY_NAME="Ubuntu 22.04.3 LTS"
VERSION_ID="22.04"
HOME_URL="https://www.ubuntu.com/"`,

  '/etc/hostname': `os-lab`,

  '/etc/hosts': `127.0.0.1   localhost
127.0.1.1   os-lab
::1         localhost ip6-localhost`,

  '/proc/version': `Linux version 5.15.0-91-generic (gcc version 11.4.0) #101-Ubuntu SMP`,

  '/proc/cpuinfo': `processor   : 0
model name  : Intel(R) Core(TM) i7-10700K @ 3.80GHz
cpu MHz     : 3800.000
cache size  : 16384 KB
cpu cores   : 8

processor   : 1
model name  : Intel(R) Core(TM) i7-10700K @ 3.80GHz
cpu MHz     : 3800.000
cache size  : 16384 KB
cpu cores   : 8`,

  '/proc/meminfo': `MemTotal:       16384000 kB
MemFree:         8200000 kB
MemAvailable:   10240000 kB
Buffers:          512000 kB
Cached:          2048000 kB
SwapTotal:       4096000 kB
SwapFree:        4096000 kB`,

  '/proc/uptime': `259200.45 1987654.23`,

  '/proc/loadavg': `0.42 0.38 0.35 2/412 1337`,

  '/proc/filesystems': `nodev   sysfs
nodev   tmpfs
nodev   proc
        ext3
        ext4
        vfat
nodev   nfs`,
}

export default function Terminal() {
  const [lines, setLines]     = useState([])
  const [input, setInput]     = useState('')
  const [cwd, setCwd]         = useState('/home/student')
  const [cmdHist, setCmdHist] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    setLines([
      { t: 'sys',  v: '╔══════════════════════════════════════════╗' },
      { t: 'sys',  v: '║   🐧  OS Learning Platform Terminal      ║' },
      { t: 'sys',  v: '║   Ubuntu 22.04 LTS  |  Linux 5.15.0     ║' },
      { t: 'sys',  v: '╚══════════════════════════════════════════╝' },
      { t: 'sys',  v: '' },
      { t: 'info', v: '  Type  help  to see all available commands.' },
      { t: 'info', v: '  Use ↑↓ arrow keys for command history.' },
      { t: 'info', v: '  Press Tab to autocomplete file names.' },
      { t: 'sys',  v: '' },
    ])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const promptDisplay =
    `student@os-lab:${cwd === '/home/student' ? '~' : cwd}$ `

  const resolvePath = (p) => {
    if (!p || p === '~')    return '/home/student'
    if (p.startsWith('/'))  return p.replace(/\/+$/, '') || '/'
    if (p === '..')         {
      const parts = cwd.split('/').filter(Boolean)
      parts.pop()
      return '/' + parts.join('/') || '/'
    }
    if (p === '.')  return cwd
    const base = cwd === '/' ? '' : cwd
    return base + '/' + p
  }

  const push = (...items) =>
    setLines(prev => [
      ...prev,
      ...items.map(v =>
        typeof v === 'string' ? { t: 'out', v } : v
      ),
    ])

  const run = (raw) => {
    const cmd = raw.trim()
    if (!cmd) return

    setCmdHist(h => [cmd, ...h.slice(0, 49)])
    setHistIdx(-1)
    push({ t: 'in', v: promptDisplay + cmd })

    const [base, ...args] = cmd.split(/\s+/)
    const arg  = args[0] || ''
    const rest = args.join(' ')

    switch (base) {

      case 'clear':
        setLines([{ t: 'sys', v: 'Terminal cleared. Type help for commands.' }])
        setInput('')
        return

      case 'help':
        push(
`
┌─ Navigation ────────────────────────────────┐
│  ls [path]     list directory contents      │
│  cd <path>     change directory             │
│  pwd           print working directory      │
│  tree          show directory tree          │
└─────────────────────────────────────────────┘
┌─ Files ─────────────────────────────────────┐
│  cat <file>    display file contents        │
│  head <file>   show first 10 lines          │
│  grep <p> <f>  search pattern in file       │
│  wc <file>     word and line count          │
└─────────────────────────────────────────────┘
┌─ System Info ───────────────────────────────┐
│  uname -a      system information           │
│  whoami        current user                 │
│  date          current date and time        │
│  uptime        system uptime                │
│  arch          CPU architecture             │
│  lscpu         detailed CPU info            │
│  lsmod         loaded kernel modules        │
│  dmesg         kernel boot messages         │
└─────────────────────────────────────────────┘
┌─ Processes ─────────────────────────────────┐
│  ps            your processes               │
│  ps aux        ALL processes                │
│  top           live process monitor         │
│  pstree        process tree view            │
└─────────────────────────────────────────────┘
┌─ Memory & Disk ─────────────────────────────┐
│  free          memory usage                 │
│  df            disk usage                   │
│  du            directory sizes              │
└─────────────────────────────────────────────┘
┌─ Network ───────────────────────────────────┐
│  ifconfig      network interfaces           │
│  netstat       network connections          │
└─────────────────────────────────────────────┘
┌─ Special ───────────────────────────────────┐
│  strace <cmd>  trace system calls           │
│  man <cmd>     manual page                  │
│  history       command history              │
│  echo <text>   print text                   │
│  banner        show OS banner               │
└─────────────────────────────────────────────┘`)
        break

      case 'banner':
        push(
`
  ██████╗ ███████╗
 ██╔═══██╗██╔════╝
 ██║   ██║███████╗
 ██║   ██║╚════██║
 ╚██████╔╝███████║
  ╚═════╝ ╚══════╝  Learning Platform

  Linux 5.15.0 | Ubuntu 22.04 LTS
  Kernel: Monolithic | Arch: x86_64
`)
        break

      case 'pwd':
        push(cwd)
        break

      case 'whoami':
        push('student')
        break

      case 'hostname':
        push('os-lab')
        break

      case 'arch':
        push('x86_64')
        break

      case 'date':
        push(new Date().toString())
        break

      case 'uptime': {
        const d = Math.floor(Date.now() / 86400000) % 30
        push(` 14:32:01 up ${d} days,  2:17,  2 users,  load average: 0.42, 0.38, 0.35`)
        break
      }

      case 'uname':
        push('Linux os-lab 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux')
        break

      case 'echo':
        push(rest || '')
        break

      case 'ls': {
        const target = arg ? resolvePath(arg) : cwd
        const items  = FILES[target]
        if (!items) {
          push({ t: 'err', v: `ls: cannot access '${arg}': No such file or directory` })
          break
        }
        const out = items.map(f => {
          const full  = (target === '/' ? '' : target) + '/' + f
          const isDir = FILES[full] !== undefined
          return isDir ? `\x1b[34m${f}/\x1b[0m` : f
        })
        push(out.join('   ') || '(empty directory)')
        break
      }

      case 'cd': {
        const target = resolvePath(arg || '~')
        if (FILES[target] !== undefined) {
          setCwd(target)
        } else {
          push({ t: 'err', v: `cd: ${arg}: No such file or directory` })
        }
        break
      }

      case 'cat': {
        if (!arg) { push({ t: 'err', v: 'cat: missing file operand' }); break }
        const path    = resolvePath(arg)
        const content = FILE_CONTENTS[path]
        if (content !== undefined)  push(content)
        else if (FILES[path])       push({ t: 'err', v: `cat: ${arg}: Is a directory` })
        else                         push({ t: 'err', v: `cat: ${arg}: No such file or directory` })
        break
      }

      case 'head': {
        const path    = resolvePath(arg)
        const content = FILE_CONTENTS[path]
        if (!content) { push({ t: 'err', v: `head: ${arg}: No such file` }); break }
        push(content.split('\n').slice(0, 10).join('\n'))
        break
      }

      case 'wc': {
        const path    = resolvePath(arg)
        const content = FILE_CONTENTS[path]
        if (!content) { push({ t: 'err', v: `wc: ${arg}: No such file` }); break }
        const l = content.split('\n').length
        const w = content.split(/\s+/).filter(Boolean).length
        const b = content.length
        push(`  ${l}  ${w}  ${b} ${arg}`)
        break
      }

      case 'grep': {
        if (args.length < 2) {
          push({ t: 'err', v: 'Usage: grep <pattern> <file>' })
          break
        }
        const path    = resolvePath(args[1])
        const content = FILE_CONTENTS[path]
        if (!content) {
          push({ t: 'err', v: `grep: ${args[1]}: No such file` })
          break
        }
        const matches = content.split('\n').filter(l => l.includes(args[0]))
        matches.length
          ? push(matches.join('\n'))
          : push({ t: 'err', v: `(no lines matched '${args[0]}')` })
        break
      }

      case 'tree': {
        const printTree = (path, prefix = '') => {
          const items = FILES[path] || []
          return items.flatMap((f, i) => {
            const full   = (path === '/' ? '' : path) + '/' + f
            const isLast = i === items.length - 1
            const conn   = isLast ? '└── ' : '├── '
            const isDir  = FILES[full] !== undefined
            const line   = prefix + conn + (isDir ? f + '/' : f)
            if (isDir && prefix.length < 12) {
              const sub = printTree(full, prefix + (isLast ? '    ' : '│   '))
              return [line, ...sub]
            }
            return [line]
          })
        }
        push(cwd, ...printTree(cwd))
        break
      }

      case 'ps':
        if (args.includes('aux')) {
          push(
`USER       PID  %CPU %MEM    VSZ   RSS STAT COMMAND
root         1   0.0  0.1  22548  4832 Ss   /sbin/init
root         2   0.0  0.0      0     0 S    [kthreadd]
root        10   0.0  0.0      0     0 I<   [rcu_par_gp]
root       200   0.0  0.3  98432 12288 Ssl  /lib/systemd/systemd-journald
student    800   0.0  0.1   8192  4096 Ss   bash
www-data   900   0.2  1.2 428160 49152 Sl   /usr/sbin/apache2
student   1337   0.1  0.2   7312  2048 R+   ps aux`)
        } else {
          push(
`  PID TTY          TIME CMD
  800 pts/0    00:00:01 bash
 1337 pts/0    00:00:00 ps`)
        }
        break

      case 'pstree':
        push(
`systemd(1)─┬─journald(200)
           ├─apache2(900)─┬─apache2(901)
           │              └─apache2(902)
           ├─sshd(500)───bash(800)───pstree(1337)
           └─cron(600)`)
        break

      case 'top':
        push(
`top - ${new Date().toLocaleTimeString()} up 3 days,  2 users,  load: 0.42
Tasks: 187 total,  1 running, 186 sleeping
%Cpu:  2.3 us,  0.8 sy, 96.5 id,  0.3 wa
MiB Mem:  15999 total,  7999 free,  4096 used
MiB Swap:  4096 total,  4096 free

  PID USER     %CPU %MEM  COMMAND
  900 www-data  0.3  1.2  apache2
  800 student   0.1  0.2  bash
    1 root      0.0  0.1  systemd
  200 root      0.0  0.3  journald`)
        break

      case 'free':
        push(
`               total        used        free    buff/cache   available
Mem:        16384000     4096000     8200000      2048000    10240000
Swap:        4096000           0     4096000`)
        break

      case 'df':
        push(
`Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       100G  4.0G   96G   4% /
tmpfs           8.0G     0  8.0G   0% /dev/shm
/dev/sda2        50G  2.0G   48G   4% /home`)
        break

      case 'du':
        push(
`4.0K    ./examples
8.0K    ./programs
4.0K    ./main.c
4.0K    ./notes.txt
24K     .`)
        break

      case 'ifconfig':
        push(
`eth0: flags=4163<UP,BROADCAST,RUNNING>  mtu 1500
      inet 192.168.1.100  netmask 255.255.255.0
      RX packets 12453  bytes 9823421
      TX packets  8234  bytes 1293847

lo:   flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
      inet 127.0.0.1  netmask 255.0.0.0`)
        break

      case 'netstat':
        push(
`Proto  Local Address        Foreign Address      State
tcp    0.0.0.0:22           0.0.0.0:*            LISTEN
tcp    0.0.0.0:80           0.0.0.0:*            LISTEN
tcp    192.168.1.100:22     192.168.1.1:54231    ESTABLISHED`)
        break

      case 'strace': {
        const traced = args[0] || 'echo'
        const tArgs  = args.slice(1).join(' ') || 'hello'
        push(
`execve("/bin/${traced}", ["${traced}", "${tArgs}"], envp) = 0
brk(NULL)                                = 0x55a3b2e000
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY) = 3
read(3, "\\177ELF...", 832)               = 832
close(3)                                 = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE)  = 0x7f8b2c000000
write(1, "${tArgs}\\n", ${tArgs.length + 1})  = ${tArgs.length + 1}
exit_group(0)                            = ?
+++ exited with 0 +++`)
        break
      }

      case 'man': {
        const pages = {
          ls:    'LS(1)\nList directory contents.\nUsage: ls [OPTION] [FILE]\n  -a  all files including hidden\n  -l  long listing format\n  -h  human readable sizes',
          cat:   'CAT(1)\nConcatenate and print files.\nUsage: cat [FILE]',
          ps:    'PS(1)\nReport process status snapshot.\nUsage: ps [options]\n  aux  show all processes with details',
          grep:  'GREP(1)\nSearch for pattern in file.\nUsage: grep <pattern> <file>',
          fork:  'FORK(2) - SYSTEM CALL\nCreate a child process.\npid_t fork(void)\nReturns child PID to parent, 0 to child, -1 on error.',
          exec:  'EXEC(3) - SYSTEM CALL\nExecute a program, replacing current process.\nint execve(const char *path, char *const argv[], char *const envp[])',
          read:  'READ(2) - SYSTEM CALL\nRead from file descriptor.\nssize_t read(int fd, void *buf, size_t count)',
          write: 'WRITE(2) - SYSTEM CALL\nWrite to file descriptor.\nssize_t write(int fd, const void *buf, size_t count)',
          open:  'OPEN(2) - SYSTEM CALL\nOpen a file.\nint open(const char *pathname, int flags)',
          kill:  'KILL(2) - SYSTEM CALL\nSend signal to process.\nint kill(pid_t pid, int sig)',
          pipe:  'PIPE(2) - SYSTEM CALL\nCreate a pipe.\nint pipe(int pipefd[2])\npipefd[0] = read end\npipefd[1] = write end',
          mmap:  'MMAP(2) - SYSTEM CALL\nMap files or devices into memory.\nvoid *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset)',
        }
        push(pages[arg] ||
          `No manual entry for '${arg}'.\nAvailable: ls, cat, ps, grep, fork, exec, read, write, open, kill, pipe, mmap`)
        break
      }

      case 'lscpu':
        push(
`Architecture:        x86_64
CPU(s):              8
Thread(s) per core:  2
Core(s) per socket:  4
Model name:          Intel(R) Core(TM) i7-10700K @ 3.80GHz
CPU MHz:             3800.000
L1d cache:           32K
L2 cache:            256K
L3 cache:            16384K`)
        break

      case 'lsmod':
        push(
`Module                  Size  Used by
ext4                  970752  2
nvidia              35000000  0
usbcore               303104  2
e1000                 155648  0
bluetooth             724992  0`)
        break

      case 'dmesg':
        push(
`[    0.000000] Linux version 5.15.0-91-generic
[    0.000000] BIOS-provided physical RAM map
[    1.234567] PCI: Using configuration type 1
[    2.345678] NET: Registered PF_INET protocol family
[    3.456789] EXT4-fs (sda1): mounted filesystem
[    4.567890] systemd[1]: systemd 249.11 running in system mode`)
        break

      case 'history':
        if (cmdHist.length === 0) {
          push('(no commands in history yet)')
        } else {
          cmdHist.slice(0, 20).forEach((c, i) =>
            push(`  ${String(cmdHist.length - i).padStart(3)}  ${c}`)
          )
        }
        break

      case 'mkdir':
        push(`mkdir: created directory '${arg}'`)
        break

      case 'touch':
        push(`(created empty file '${arg}')`)
        break

      case 'rm':
        push(`rm: removed '${arg}'`)
        break

      case 'cp':
        push(`'${args[0]}' -> '${args[1] || 'destination'}'`)
        break

      case 'mv':
        push(`'${args[0]}' -> '${args[1] || 'destination'}'`)
        break

      case 'which':
        push(`/bin/${arg}`)
        break

      default:
        push(
          { t: 'err', v: `${base}: command not found` },
          { t: 'err', v: `Type 'help' to see available commands.` }
        )
    }

    setInput('')
  }

  const onKey = (e) => {
    if (e.key === 'Enter') {
      run(input)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const i = Math.min(histIdx + 1, cmdHist.length - 1)
      setHistIdx(i)
      setInput(cmdHist[i] || '')
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = Math.max(histIdx - 1, -1)
      setHistIdx(i)
      setInput(i < 0 ? '' : cmdHist[i])
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const last  = input.split(' ').pop()
      const items = FILES[cwd] || []
      const match = items.find(f => f.startsWith(last))
      if (match) {
        setInput(input.slice(0, input.lastIndexOf(last)) + match)
      }
    }
    if (e.ctrlKey && e.key === 'c') {
      push({ t: 'in', v: promptDisplay + input + '^C' })
      setInput('')
    }
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setLines([{ t: 'sys', v: 'Terminal cleared.' }])
    }
  }

  const colorOf = (t) =>
    t === 'err'  ? '#f85149' :
    t === 'in'   ? '#79c0ff' :
    t === 'sys'  ? '#6e7681' :
    t === 'info' ? '#3fb950' : '#e6edf3'

  const stripAnsi = (s) =>
    s.replace(/\x1b\[[0-9;]*m/g, '')

  return (
    <div
      style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div style={{
        background: '#161b22',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid #30363d',
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ color: '#8b949e', fontSize: 13, marginLeft: 8 }}>
          🐧 Linux Terminal — Ubuntu 22.04 LTS
        </span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 11, color: '#3fb950',
          background: '#23863644',
          border: '1px solid #238636',
          padding: '2px 8px', borderRadius: 4, fontWeight: 700,
        }}>
          LIVE
        </span>
      </div>

      {/* Output */}
      <div style={{
        padding: 16,
        minHeight: 280,
        maxHeight: 420,
        overflowY: 'auto',
        cursor: 'text',
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: 13, lineHeight: '1.6',
            color: colorOf(line.t),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: 1,
          }}>
            {stripAnsi(line.v) || '\u00A0'}
          </div>
        ))}

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: 13, color: '#3fb950',
            whiteSpace: 'nowrap', marginRight: 4,
          }}>
            {promptDisplay}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            autoFocus
            spellCheck={false}
            style={{
              background: 'none', border: 'none',
              outline: 'none', flex: 1,
              color: '#e6edf3', caretColor: '#e6edf3',
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              fontSize: 13,
            }}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}