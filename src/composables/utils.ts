function getPortFromString(str: string | undefined) {
  if (!str)
    return null

  // 正则匹配 ":端口" 格式（可带 "/协议" 后缀）
  const portMatch = str.match(/^:(\d+)(?:\/.*)?$/)
  if (portMatch) {
    const port = Number.parseInt(portMatch[1], 10)
    if (!Number.isNaN(port))
      return port
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
