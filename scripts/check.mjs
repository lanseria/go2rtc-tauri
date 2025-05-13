import { execSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import AdmZip from 'adm-zip'
import fetch from 'node-fetch'
import { ProxyAgent } from 'proxy-agent'

// Logging utilities
const log_info = (...args) => console.log('💬', ...args)
const log_success = (...args) => console.log('✅', ...args)
const log_error = (...args) => console.error('❌', ...args)
const log_debug = (...args) => console.log('🐛', ...args)

const cwd = process.cwd()
const TEMP_DIR = path.join(cwd, '.go2rtc-dl')
const FORCE = process.argv.includes('--force')

// 平台映射表更新为go2rtc的命名规则[8,7](@ref)
const PLATFORM_MAP = {
  'x86_64-pc-windows-msvc': 'win64',
  'aarch64-apple-darwin': 'mac_arm64',
  'x86_64-apple-darwin': 'mac_amd64',
  'x86_64-unknown-linux-gnu': 'linux_amd64',
}

// 获取目标平台
const arg1 = process.argv.slice(2)[0]
const arg2 = process.argv.slice(2)[1]
const target = arg1 === '--force' ? arg2 : arg1
const SIDECAR_HOST = target || execSync('rustc -vV')
  .toString()
  // eslint-disable-next-line regexp/no-empty-lookarounds-assertion
  .match(/(?<=host: ).+(?=)/g)[0]

const platformKey = target
  ? PLATFORM_MAP[target]
  : process.platform === 'win32'
    ? 'win64'
    : process.platform === 'darwin'
      ? (process.arch === 'arm64' ? 'mac_arm64' : 'mac_amd64')
      : 'linux_amd64'

log_debug('Detected platform:', platformKey)
const GO2RTC_VERSION = 'v1.9.9'
const REPO_BASE = 'https://github.com/AlexxIT/go2rtc/releases/download'

// 更新为go2rtc的下载配置[6,8](@ref)
function getGo2RTCInfo() {
  const isWindows = platformKey.startsWith('win')
  const isMac = platformKey.startsWith('mac')
  const isLinux = platformKey.startsWith('linux')

  let binaryName
  switch (platformKey) {
    case 'win64':
      binaryName = 'go2rtc_win64.zip'
      break
    case 'mac_arm64':
      binaryName = 'go2rtc_mac_arm64.zip'
      break
    case 'linux_amd64':
      binaryName = 'go2rtc_linux_amd64'
      break
    default:
      throw new Error(`Unsupported platform: ${platformKey}`)
  }

  return {
    name: 'go2rtc',
    downloadFileName: binaryName,
    targetBinaryPath: `go2rtc-${SIDECAR_HOST}${isWindows ? '.exe' : ''}`,
    downloadURL: `${REPO_BASE}/${GO2RTC_VERSION}/${binaryName}`,
    isArchive: binaryName.endsWith('.zip'),
    isWindows,
    isMac,
    isLinux,
  }
}

// 保留原有下载逻辑，新增ZIP解压支持
async function downloadFile(url, path) {
  const options = {}
  const httpProxy = process.env.HTTP_PROXY || process.env.https_proxy

  if (httpProxy) {
    log_debug('Using proxy:', httpProxy)
    const proxyAgent = new ProxyAgent()
    options.agent = proxyAgent
  }

  const response = await fetch(url, {
    ...options,
    method: 'GET',
    headers: { 'Content-Type': 'application/octet-stream' },
  })

  if (!response.ok)
    throw new Error(`Failed to download ${url}: ${response.statusText}`)

  const buffer = await response.arrayBuffer()
  await fsp.writeFile(path, new Uint8Array(buffer))
  log_success(`Download completed: ${url}`)
}

// 新增ZIP解压功能
async function extractZip(filePath, targetDir) {
  const zip = new AdmZip(filePath)
  zip.extractAllTo(targetDir, true)
  log_success(`ZIP extracted to: ${targetDir}`)
}

// 更新文件处理逻辑
async function setupGo2RTC() {
  const info = getGo2RTCInfo()
  const tempDir = TEMP_DIR
  const tempFile = path.join(tempDir, info.downloadFileName)

  // 创建目标目录
  const binDir = path.join(cwd, 'src-tauri/sidecar')
  await fsp.mkdir(binDir, { recursive: true })
  await fsp.mkdir(tempDir, { recursive: true })

  const targetPath = path.join(binDir, info.targetBinaryPath)

  // 跳过已存在文件
  if (!FORCE && fs.existsSync(targetPath)) {
    log_info('Binary already exists, skipping download')
    return
  }

  try {
    // 下载文件
    log_debug(`Downloading from: ${info.downloadURL}`)
    await downloadFile(info.downloadURL, tempFile)

    // 处理压缩文件
    if (info.isArchive) {
      await extractZip(tempFile, tempDir)
      // 查找解压后的可执行文件
      const extractedFiles = await fsp.readdir(tempDir)
      console.log(extractedFiles)
      console.log(info.targetBinaryPath)
      let execFile
      if (process.platform === 'darwin') {
        execFile = extractedFiles.find(f =>
          f === 'go2rtc',
        )
      }
      else {
        execFile = extractedFiles.find(f =>
          f === info.targetBinaryPath || f.endsWith('.exe'),
        )
      }
      if (!execFile)
        throw new Error('No executable found in archive')
      await fsp.rename(path.join(tempDir, execFile), targetPath)
    }
    else {
      // 直接移动非压缩文件
      await fsp.rename(tempFile, targetPath)
    }

    // 设置执行权限
    if (!info.isWindows) {
      await fsp.chmod(targetPath, 0o755)
      log_debug('Executable permissions set')
    }

    log_success(`go2rtc installed to: ${targetPath}`)
  }
  catch (err) {
    log_error('Installation failed:', err.message)
    throw err
  }
  finally {
    // 清理临时目录
    await fsp.rm(tempDir, { recursive: true, force: true })
  }
}

// 执行主程序
setupGo2RTC().catch((err) => {
  log_error('Fatal error:', err)
  process.exit(1)
})
