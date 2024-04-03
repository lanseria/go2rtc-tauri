// @ts-check
import { cwd, env, exit } from 'node:process'
import * as process from 'node:process'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { URL } from 'node:url'
import fs from 'fs-extra'
import AdmZip from 'adm-zip'
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

const TEMP_DIR = join(cwd(), 'node_modules/.go2rtc-tauri')
const { platform, arch } = process

const isWin = platform === 'win32'
const isMac = platform === 'darwin'

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
const SIDECAR_HOST = execSync('rustc -vV')
  .toString()
  .match(/(?<=host: ).+(?=\s*)/g)[0]
//
const NAME = 'go2rtc'
const GO2RTC_MAP = {
  'win32-x64': `${NAME}_win64`,
  'win32-ia32': `${NAME}_win32`,
  'darwin-x64': `${NAME}_mac_amd64`,
  'darwin-arm64': `${NAME}_mac_arm64`,
  'linux-x64': `${NAME}_linux_amd64`,
  'linux-ia32': `${NAME}_linux_i386`,
  'linux-arm64': `${NAME}_linux_arm64`,
  'linux-arm': `${NAME}_linux_armv6`,
}
/* ======= clash meta stable ======= */
const GO2RTC_VERSION_URL
  = 'https://api.github.com/repos/AlexxIT/go2rtc/releases/latest'
const META_URL_PREFIX = `https://github.com/AlexxIT/go2rtc/releases/download`
let GO2RTC_VERSION
/**
 * download file and save to `path`
 */

async function downloadFile(url, path) {
  const options = {}

  const httpProxy
    = env.HTTP_PROXY
    || env.http_proxy
    || env.HTTPS_PROXY
    || env.https_proxy

  if (httpProxy) {
    const url = new URL(httpProxy)
    options.proxy = {
      protocol: url.protocol,
      host: url.hostname,
      port: +url.port,
    }
  }

  const response = await axios.get(url, {
    ...options,
    responseType: 'arraybuffer',
    headers: { 'Content-Type': 'application/octet-stream' },
  })
  const buffer = response.data
  await fs.writeFile(path, new Uint8Array(buffer))

  console.log(`[INFO]: download finished "${url}"`)
}
/**
 * download sidecar and rename
 */
async function resolveSidecar(binInfo) {
  const { name, targetFile, zipFile, exeFile, downloadURL } = binInfo

  const sidecarDir = join(cwd(), 'src-tauri', 'sidecar')
  const sidecarPath = join(sidecarDir, targetFile)

  await fs.mkdirp(sidecarDir)
  if ((await fs.pathExists(sidecarPath)))
    return

  const tempDir = join(TEMP_DIR, name)
  const tempZip = join(tempDir, zipFile)
  const tempExe = join(tempDir, exeFile)

  await fs.mkdirp(tempDir)
  try {
    if (!(await fs.pathExists(tempZip))) {
      console.log(`[INFO]: ${name} download start`)
      await downloadFile(downloadURL, tempZip)
    }

    if (zipFile.endsWith('.zip')) {
      // macos windows
      const zip = new AdmZip(tempZip)
      zip.getEntries().forEach((entry) => {
        console.log(`[DEBUG]: "${name}" entry name`, entry.entryName)
      })
      zip.extractAllTo(tempDir, true)
      await fs.rename(tempExe, sidecarPath)
      if (isMac) {
        // macos need chmod
        execSync(`chmod 755 ${sidecarPath}`)
      }
      console.log(`[INFO]: "${name}" unzip finished`)
    }
    else {
      // binary linux
      await fs.rename(tempZip, sidecarPath)
      // linux need chmod
      execSync(`chmod 755 ${sidecarPath}`)
      console.log(`[INFO]: "${name}" binary rename finished`)
    }
  }
  catch (err) {
    // 需要删除文件
    await fs.remove(sidecarPath)
    throw err
  }
  finally {
    // delete temp dir
    await fs.remove(tempDir)
  }
}

// Fetch the latest release version from the version.txt file
async function getLatestReleaseVersion() {
  const options = {}
  const httpProxy
    = env.HTTP_PROXY
    || env.http_proxy
    || env.HTTPS_PROXY
    || env.https_proxy

  if (httpProxy) {
    console.log('[INFO]: use proxy', httpProxy)
    options.agent = new HttpsProxyAgent(httpProxy)
  }

  try {
    const response = await fetch(GO2RTC_VERSION_URL, {
      ...options,
      method: 'GET',
    })
    const json = await response.json()
    GO2RTC_VERSION = json.tag_name.trim() // Trim to remove extra whitespaces
    console.log(`Latest release version: ${GO2RTC_VERSION}`)
  }
  catch (error) {
    console.error('Error fetching latest release version:', error.message)
    exit(1)
  }
}
function go2rtcRelease() {
  const name = GO2RTC_MAP[`${platform}-${arch}`]
  const urlExt = isWin || isMac ? 'zip' : 'gz'
  const downloadURL = `${META_URL_PREFIX}/${GO2RTC_VERSION}/${name}.${urlExt}`
  const exeFile = `${NAME}${isWin ? '.exe' : ''}`
  const zipFile = `${name}-${GO2RTC_VERSION}.${urlExt}`

  return {
    name: 'go2rtc',
    targetFile: `go2rtc-${SIDECAR_HOST}${isWin ? '.exe' : ''}`,
    exeFile,
    zipFile,
    downloadURL,
  }
}
const tasks = [
  // { name: "clash", func: resolveClash, retry: 5 },
  {
    name: 'go2rtc',
    func: () =>
      getLatestReleaseVersion().then(() => resolveSidecar(go2rtcRelease())),
    retry: 5,
  },
]
async function runTask() {
  const task = tasks.shift()
  if (!task)
    return
  if (task.winOnly && process.platform !== 'win32')
    return runTask()

  for (let i = 0; i < task.retry; i++) {
    try {
      await task.func()
      break
    }
    catch (err) {
      console.error(`[ERROR]: task::${task.name} try ${i} ==`, err.message)
      if (i === task.retry - 1)
        throw err
    }
  }
  return runTask()
}
runTask()
