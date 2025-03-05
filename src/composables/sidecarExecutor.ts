import type { Child } from '@tauri-apps/plugin-shell'
// import { join, tempDir } from '@tauri-apps/api/path'
// import { writeTextFile } from '@tauri-apps/plugin-fs'
import { platform } from '@tauri-apps/plugin-os'

import { Command } from '@tauri-apps/plugin-shell'

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
  onLog?: LogCallback,
): Promise<ExecutionResult> {
  try {
    const command = Command.sidecar('sidecar/go2rtc', [
      '--config',
      JSON.stringify(config),
    ])
    command.on('close', (data) => {
      const log = `command finished with code ${data.code} and signal ${data.signal}`
      if (onLog)
        onLog(log)
      // eslint-disable-next-line no-console
      console.debug(log)
    })
    command.on('error', (error) => {
      if (onLog)
        onLog(error)
      console.error(`command error: "${error}"`)
    })
    command.stdout.on('data', (line) => {
      if (onLog)
        onLog(line)
      // eslint-disable-next-line no-console
      console.debug(`command stdout: "${line}"`)
    })
    command.stderr.on('data', (line) => {
      if (onLog)
        onLog(line)
      // eslint-disable-next-line no-console
      console.debug(`command stderr: "${line}"`)
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
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Kill process running on specified port
 * @param port Port number to kill process on
 * @returns Promise with success message or error
 */
export async function killPortProcess(port: number): Promise<string> {
  // Port validation
  if (port === 0 || port > 65535) {
    throw new Error('Invalid port number')
  }

  // Get current platform
  const os = await platform()

  try {
    let command: string[]

    switch (os) {
      case 'macos': // macOS
      case 'linux':
        command = [
          'sh',
          '-c',
          `lsof -ti:${port} | xargs kill -9 || true`,
        ]
        break

      case 'windows': // Windows
        command = [
          'cmd',
          '/C',
          `FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :${port}') DO taskkill /F /PID %P`,
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
