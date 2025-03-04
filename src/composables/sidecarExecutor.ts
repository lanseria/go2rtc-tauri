import type { Child } from '@tauri-apps/plugin-shell'
// import { join, tempDir } from '@tauri-apps/api/path'
// import { writeTextFile } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'

import { Command } from '@tauri-apps/plugin-shell'

interface ExecutionResult {
  success: boolean
  message?: string
  child?: Child // 添加 child 属性来保存进程引用
}

export interface LogCallback {
  (log: string): void
}

export async function startSidecar(config: any) {
  try {
    const result = await invoke('spawn_sidecar', {
      config: JSON.stringify(config),
    })
    // eslint-disable-next-line no-console
    console.log('Sidecar输出:', result)
  }
  catch (error) {
    console.error('执行失败:', error)
  }
}

export async function executeSidecar(
  config: any,
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
