// 定义日志级别类型
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

// 定义API配置
interface ApiConfig {
  listen?: string
  username?: string
  password?: string
  base_path?: string
  static_dir?: string
  origin?: '*'
  tls_listen?: string
  tls_cert?: string
  tls_key?: string
  unix_listen?: string
}

// 定义FFmpeg配置
interface FfmpegConfig {
  bin?: string
  [key: string]: string
}

// 定义HomeKit配件配置
interface HomekitAccessory {
  pin?: string
  name?: string
  device_id?: string
  device_private?: string
  pairings?: string[]
}

// 定义日志配置
interface LogConfig {
  format?: 'color' | 'json' | 'text'
  level?: LogLevel
  output?: '' | 'stdout' | 'stderr'
  time?: string
  api?: LogLevel
  echo?: LogLevel
  exec?: LogLevel
  expr?: LogLevel
  ffmpeg?: LogLevel
  hass?: LogLevel
  hls?: LogLevel
  homekit?: LogLevel
  mp4?: LogLevel
  ngrok?: LogLevel
  onvif?: LogLevel
  rtmp?: LogLevel
  rtsp?: LogLevel
  streams?: LogLevel
  webrtc?: LogLevel
  webtorrent?: LogLevel
}

// 定义WebRTC配置
interface WebrtcConfig {
  listen?: string
  candidates?: string[]
  ice_servers?: {
    urls: string[]
    username?: string
    credential?: string
  }[]
  filters?: {
    candidates?: string[]
    interfaces?: string[]
    ips?: string[]
    networks?: ('tcp4' | 'tcp6' | 'udp4' | 'udp6')[]
    udp_ports?: [number, number]
  }
}

// 定义WebTorrent配置
interface WebtorrentConfig {
  trackers?: string[]
  shares?: Record<string, { pwd?: string, src?: string }>
}

// 主配置类型
interface Go2RTCConfig {
  api: ApiConfig
  ffmpeg?: FfmpegConfig
  hass?: { config?: string }
  homekit?: Record<string, HomekitAccessory>
  log: LogConfig
  ngrok?: { command?: string }
  publish?: Record<string, string | string[]>
  rtmp?: { listen?: string }
  rtsp?: {
    listen?: string
    username?: string
    password?: string
    default_query?: string
    pkt_size?: number
  }
  srtp?: { listen?: string }
  streams: Record<string, string>
  webrtc: WebrtcConfig
  webtorrent?: WebtorrentConfig
}
