import { execSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fetch from 'node-fetch'
import { ProxyAgent } from 'proxy-agent'
import { extract } from 'tar'

// Logging utilities
const log_info = (...args) => console.log('💬', ...args)
const log_success = (...args) => console.log('✅', ...args)
const log_error = (...args) => console.error('❌', ...args)
const log_debug = (...args) => console.log('🐛', ...args)

const cwd = process.cwd()
const TEMP_DIR = path.join(cwd, '.wr-cl')
const FORCE = process.argv.includes('--force')

// Platform mapping similar to your reference
const PLATFORM_MAP = {
  'x86_64-pc-windows-msvc': 'windows',
  'i686-pc-windows-msvc': 'windows',
  'aarch64-pc-windows-msvc': 'windows',
  'x86_64-apple-darwin': 'macos',
  'aarch64-apple-darwin': 'macos',
  'x86_64-unknown-linux-gnu': 'linux',
  'i686-unknown-linux-gnu': 'linux',
  'aarch64-unknown-linux-gnu': 'linux',
}

// Get target platform
const arg1 = process.argv.slice(2)[0]
const arg2 = process.argv.slice(2)[1]
const target = arg1 === '--force' ? arg2 : arg1
const SIDECAR_HOST = target || execSync('rustc -vV')
  .toString()
  // eslint-disable-next-line regexp/no-empty-lookarounds-assertion
  .match(/(?<=host: ).+(?=)/g)[0]

const platform = target ? PLATFORM_MAP[target] : process.platform === 'win32' ? 'windows' : process.platform
log_debug('platform:', platform)
const WR_CL_VERSION = 'v1.3.0'
const REPO_BASE = 'https://github.com/lanseria/wr-cl/releases/download'

function getWrClInfo() {
  const isWin = platform === 'windows'
  const isMac = platform === 'darwin'
  const platformSuffix = isWin ? 'windows' : isMac ? 'macos' : 'linux'
  const downloadURL = `${REPO_BASE}/${WR_CL_VERSION}/wr-cl-${platformSuffix}.tar.gz`

  return {
    name: 'wr-cl',
    targetBinaryName: isWin ? 'wr-cl.exe' : 'wr-cl',
    targetBinaryPath: `wr-cl-${SIDECAR_HOST}${isWin ? '.exe' : ''}`,
    baseBinaryPath: `wr-cl${isWin ? '.exe' : ''}`, // New field for the base binary name
    configTemplate: 'config.json.template',
    configTarget: 'config.json',
    downloadURL,
    isWin,
  }
}

async function downloadFile(url, path) {
  const options = {}
  const httpProxy
    = process.env.HTTP_PROXY
      || process.env.http_proxy
      || process.env.HTTPS_PROXY
      || process.env.https_proxy

  if (httpProxy) {
    log_debug('Using proxy:', ProxyAgent)
    const proxyAgent = new ProxyAgent()
    options.agent = proxyAgent
    log_debug('Using proxy:', httpProxy)
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
  log_success(`download finished: ${url}`)
}

async function copyFile(src, dest) {
  try {
    await fsp.copyFile(src, dest)
    if (!getWrClInfo().isWin)
      await fsp.chmod(dest, 0o755) // Set executable permissions on Unix-like systems
    log_success(`File copied and permissions set: ${dest}`)
  }
  catch (err) {
    log_error(`Error copying file from ${src} to ${dest}:`, err)
    throw err
  }
}

async function resolveWrCl() {
  const info = getWrClInfo()
  const tempDir = TEMP_DIR
  const tempTarGz = path.join(tempDir, 'wr-cl.tar.gz')

  // Create directories
  const binariesDir = path.join(cwd, 'src-tauri/sidecar')
  const resourcesDir = path.join(cwd, 'src-tauri/resources')

  await fsp.mkdir(binariesDir, { recursive: true })
  await fsp.mkdir(resourcesDir, { recursive: true })
  await fsp.mkdir(tempDir, { recursive: true })

  const archSpecificBinaryPath = path.join(binariesDir, info.targetBinaryPath)
  const baseBinaryPath = path.join(binariesDir, info.baseBinaryPath)
  const configPath = path.join(resourcesDir, info.configTarget)

  // Skip if files exist and not forced
  if (!FORCE
    && fs.existsSync(archSpecificBinaryPath)
    && fs.existsSync(baseBinaryPath)
    && fs.existsSync(configPath)) {
    log_info('Files already exist, skipping download')
    return
  }

  try {
    // Download the tar.gz file
    log_debug('downloading...')
    await downloadFile(info.downloadURL, tempTarGz)
    log_debug('tempTarGz: ', tempTarGz)

    // Extract the archive
    await extract({
      file: tempTarGz,
      cwd: tempDir,
    })

    // Move files to their destinations
    const extractedBinary = path.join(tempDir, info.targetBinaryName)

    // First, copy the binary to the architecture-specific path
    await copyFile(extractedBinary, archSpecificBinaryPath)

    // Then, copy the same binary to the base path
    // await copyFile(extractedBinary, baseBinaryPath)

    // Handle config file
    const extractedConfig = path.join(tempDir, info.configTemplate)
    await fsp.rename(extractedConfig, configPath)

    log_success('wr-cl setup completed successfully')
  }
  catch (err) {
    log_error('Error during wr-cl setup:', err.message)
    throw err
  }
  finally {
    // Cleanup temp directory
    // Commented out for debugging purposes
    // await fsp.rm(tempDir, { recursive: true, force: true })
  }
}

// Main execution
resolveWrCl().catch((err) => {
  log_error('Fatal error:', err)
  process.exit(1)
})
