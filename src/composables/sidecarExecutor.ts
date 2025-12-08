import type { Child } from '@tauri-apps/plugin-shell'
// import { join, tempDir } from '@tauri-apps/api/path'
// import { writeTextFile } from '@tauri-apps/plugin-fs'
import { platform } from '@tauri-apps/plugin-os'

import { Command } from '@tauri-apps/plugin-shell'
import { writeToTerminal } from './console'

// 解析 go2rtc 日志格式
// 格式: 20:45:15.173 INF [api] listen addr=127.0.0.1:1984
// 或者: 20:45:15.164 INF go2rtc platform=windows/amd64 ...
function parseGo2rtcLog(line: string): { parsed: boolean, level?: TermLogLevel, source?: string, message: string } {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const regex = /^\d{2}:\d{2}:\d{2}\.\d{3}\s+(INF|WRN|ERR|DBG|TRC)\s+(?:\[(.*?)\]\s+)?(.*)$/
  const match = line.trim().match(regex)

  if (match) {
    const levelMap: Record<string, TermLogLevel> = {
      INF: 'INF',
      WRN: 'WRN',
      ERR: 'ERR',
      DBG: 'DBG',
      TRC: 'DBG',
    }

    return {
      parsed: true,
      level: levelMap[match[1]] || 'INF',
      source: match[2] ? `go2rtc:${match[2]}` : 'go2rtc',
      message: match[3],
    }
  }

  return { parsed: false, message: line }
}

interface ExecutionResult {
  success: boolean
  message?: string
  child?: Child // 添加 child 属性来保存进程引用
}

export interface LogCallback {
  (log: string): void
}

export async function executeSidecar(
  config: Go2RTCConfig,
): Promise<ExecutionResult> {
  try {
    const command = Command.sidecar('sidecar/go2rtc', [
      '--config',
      JSON.stringify(config),
    ])
    command.on('close', (data) => {
      const log = `command finished with code ${data.code} and signal ${data.signal}`
      // eslint-disable-next-line no-console
      console.debug(log)
    })
    command.on('error', (error) => {
      writeToTerminal(error, 'sidecar', 'ERR')
      console.error(`command error: "${error}"`)
    })
    command.stdout.on('data', (data) => {
      const lines = data.split('\n')
      lines.forEach((line) => {
        if (!line.trim())
          return
        const { parsed, level, source, message } = parseGo2rtcLog(line)
        if (parsed) {
          writeToTerminal(message, source, level)
        }
        else {
          writeToTerminal(line, 'sidecar')
        }
      })
      // eslint-disable-next-line no-console
      console.debug(`command stdout: "${data}"`)
    })
    command.stderr.on('data', (data) => {
      const lines = data.split('\n')
      lines.forEach((line) => {
        if (!line.trim())
          return
        const { parsed, level, source, message } = parseGo2rtcLog(line)
        if (parsed) {
          writeToTerminal(message, source, level)
        }
        else {
          writeToTerminal(line, 'sidecar', 'ERR')
        }
      })
      // eslint-disable-next-line no-console
      console.debug(`command stderr: "${data}"`)
    })
    // 获取子进程引用
    const child = await command.spawn()
    // 返回成功状态和子进程引用
    return {
      success: true,
      child, // 返回子进程引用
    }
  }
  catch (error) {
    console.error('Sidecar execution failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred, please check devtools logs.',
    }
  }
}
/**
 * killPortProcess
 */
export async function killPortProcess(port: number): Promise<string> {
  if (port === 0 || port > 65535) {
    throw new Error('Invalid port number')
  }

  const os = await platform()

  try {
    let command: string[]

    switch (os) {
      case 'macos':
      case 'linux':
        command = [
          'sh',
          '-c',
          `lsof -ti:${port} | xargs kill -9 || true`,
        ]
        break

      case 'windows':
        command = [
          'cmd',
          '/C',
          // 修改点 1: 使用英文列名查找
          // 修改点 2: 抑制所有输出
          // 修改点 3: 增加错误处理
          `(for /F "tokens=5" %P in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":${port}"') do taskkill /F /PID %P) >nul 2>nul & exit 0`,
        ]
        break

      default:
        throw new Error('Unsupported operating system')
    }

    await Command.create(command[0], command.slice(1)).execute()
    return `Port ${port} process terminated`
  }
  catch (error: any) {
    throw new Error(`Failed to kill process on port ${port}: ${error}`)
  }
}
