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
const BINARY_DIR = path.join(cwd, 'src-tauri/sidecar')

// 平台映射表
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

function getPlatformKey(target) {
  if (target) {
    return PLATFORM_MAP[target]
  }

  const platform = process.platform
  const arch = process.arch

  if (platform === 'win32') {
    return 'win64'
  }
  if (platform === 'darwin') {
    return arch === 'arm64' ? 'mac_arm64' : 'mac_amd64'
  }
  return 'linux_amd64'
}

const platformKey = getPlatformKey(target)

log_debug('Detected platform:', platformKey)
const GO2RTC_VERSION = 'v1.9.12'
const REPO_BASE = 'https://github.com/AlexxIT/go2rtc/releases/download'

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

async function downloadFile(url, filePath) {
  const options = {}
  const httpProxy = process.env.HTTP_PROXY || process.env.https_proxy

  if (httpProxy) {
    log_debug('Using proxy:', httpProxy)
    const proxyAgent = new ProxyAgent()
    options.agent = proxyAgent
  }

  try {
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: { 'Content-Type': 'application/octet-stream' },
    })

    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    await fsp.writeFile(filePath, new Uint8Array(buffer))
    log_success(`Download completed: ${url}`)
  }
  catch (error) {
    log_error(`Download failed: ${error.message}`)
    throw error
  }
}

async function extractZip(filePath, targetDir) {
  try {
    const zip = new AdmZip(filePath)
    zip.extractAllTo(targetDir, true)
    log_success(`ZIP extracted to: ${targetDir}`)
  }
  catch (error) {
    log_error(`ZIP extraction failed: ${error.message}`)
    throw error
  }
}

async function setupGo2RTC() {
  const info = getGo2RTCInfo()
  const tempDir = TEMP_DIR
  const tempFile = path.join(tempDir, info.downloadFileName)
  const targetPath = path.join(BINARY_DIR, info.targetBinaryPath)

  // 创建目录
  try {
    await fsp.mkdir(BINARY_DIR, { recursive: true })
    await fsp.mkdir(tempDir, { recursive: true })
  }
  catch (error) {
    log_error('Failed to create directories:', error.message)
    throw error
  }

  // 检查版本文件
  const versionFilePath = path.join(BINARY_DIR, 'version')
  let installedVersion = ''
  try {
    if (fs.existsSync(versionFilePath)) {
      installedVersion = (await fsp.readFile(versionFilePath, 'utf-8')).trim()
    }
  }
  catch { /* ignore */ }

  // 如果未强制，且文件存在，且版本匹配，则跳过
  if (!FORCE && fs.existsSync(targetPath) && installedVersion === GO2RTC_VERSION) {
    log_info(`Binary (${GO2RTC_VERSION}) already exists, skipping download`)
    return
  }

  if (installedVersion && installedVersion !== GO2RTC_VERSION) {
    log_info(`Version mismatch (installed: ${installedVersion || 'unknown'}, target: ${GO2RTC_VERSION}). Updating...`)
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

      // 移动前先删除旧文件（如果存在），确保移动成功
      if (fs.existsSync(targetPath)) {
        await fsp.unlink(targetPath)
      }
      await fsp.rename(path.join(tempDir, execFile), targetPath)
    }
    else {
      // 直接移动非压缩文件
      if (fs.existsSync(targetPath)) {
        await fsp.unlink(targetPath)
      }
      await fsp.rename(tempFile, targetPath)
    }

    // 设置执行权限
    if (!info.isWindows) {
      await fsp.chmod(targetPath, 0o755)
      log_debug('Executable permissions set')
    }

    // 写入版本文件
    await fsp.writeFile(versionFilePath, GO2RTC_VERSION)
    log_success(`go2rtc installed to: ${targetPath} (${GO2RTC_VERSION})`)
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

setupGo2RTC().catch((err) => {
  log_error('Fatal error:', err)
  process.exit(1)
})
