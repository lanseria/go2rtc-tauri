import { join, tempDir } from '@tauri-apps/api/path'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import { Command } from '@tauri-apps/plugin-shell'

export interface ExecutionResult {
  success: boolean
  message: string
}

export interface LogCallback {
  (log: string): void
}

export async function executeSidecar(
  config: WrClConfig,
  onLog?: LogCallback,
): Promise<ExecutionResult> {
  try {
    // 创建临时配置文件
    const tempDirPath = await tempDir()
    const configPath = await join(tempDirPath, 'word-replacement-config.json')
    await writeTextFile(configPath, JSON.stringify(config, null, 2))
    // 执行 sidecar
    const command = Command.sidecar('sidecar/wr-cl', [
      '--config',
      configPath,
    ])
    // 设置输出流监听器
    command.stdout.on('data', (line) => {
      if (onLog)
        onLog(line)
      // eslint-disable-next-line no-console
      console.log('[Sidecar stdout]:', line)
    })

    command.stderr.on('data', (line) => {
      if (onLog)
        onLog(line)
      console.error('[Sidecar stderr]:', line)
    })
    // 创建一个 Promise, 等待 close 事件触发后再往下执行
    const closePromise = new Promise<void>((resolve) => {
      command.on('close', (data) => {
        // eslint-disable-next-line no-console
        console.log(`Command finished with code ${data.code} and signal ${data.signal}`)
        resolve()
      })
    })
    await command.spawn()

    // 等待进程关闭
    await closePromise

    return {
      success: true,
      message: 'Word replacement completed successfully',
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
