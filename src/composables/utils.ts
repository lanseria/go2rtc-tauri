function getPortFromString(str: string | undefined) {
  if (!str)
    return null

  // 处理纯数字情况（如 "8080"）
  if (/^\d+$/.test(str)) {
    return Number.parseInt(str, 10)
  }

  // 尝试处理 URL 格式（如 "http://example.com:8080"）
  try {
    const url = new URL(str.includes('://') ? str : `http://${str}`)
    if (url.port) {
      return Number.parseInt(url.port, 10)
    }
    // 根据协议设置默认端口
    return url.protocol === 'https:' ? 443 : 80
  }
  catch (error) {
    console.warn(error)
    // 非 URL 格式，尝试拆分 "host:port"
    const parts = str.split(':')
    const lastPart = parts[parts.length - 1]
    const port = Number.parseInt(lastPart, 10)
    if (!Number.isNaN(port)) {
      return port
    }
  }

  return null
}

export function extractPorts(config: Go2RTCConfig) {
  const ports = new Set<number>()

  const addPort = (str: string | undefined) => {
    const port = getPortFromString(str)
    if (port)
      ports.add(port)
  }

  // 处理 API 配置
  addPort(config.api?.listen)
  addPort(config.api?.tls_listen)

  // 处理 RTMP 配置
  addPort(config.rtmp?.listen)

  // 处理 RTSP 配置
  addPort(config.rtsp?.listen)

  // 处理 SRTP 配置
  addPort(config.srtp?.listen)

  // 处理 WebRTC 配置
  addPort(config.webrtc?.listen)

  // 处理 WebTorrent 的 Tracker URLs
  config.webtorrent?.trackers?.forEach(addPort)

  // 处理 Streams 中的每个 URL
  Object.values(config.streams || {}).forEach((url) => {
    if (Array.isArray(url)) {
      url.forEach(u => addPort(u))
    }
    else {
      addPort(url)
    }
  })

  return Array.from(ports).sort((a, b) => a - b)
}
