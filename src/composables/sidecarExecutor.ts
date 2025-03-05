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
