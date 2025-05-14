// --- 辅助常量和类型 ---
const ANSI_COLORS = {
  RESET: '\x1B[0m',
  BLACK: '\x1B[30m',
  RED: '\x1B[31m',
  GREEN: '\x1B[32m',
  YELLOW: '\x1B[33m',
  BLUE: '\x1B[34m',
  MAGENTA: '\x1B[35m',
  CYAN: '\x1B[36m',
  WHITE: '\x1B[37m',
  // Bright versions
  BRIGHT_BLACK: '\x1B[90m', // Often used for grey
  BRIGHT_RED: '\x1B[91m',
  BRIGHT_GREEN: '\x1B[92m',
  BRIGHT_YELLOW: '\x1B[93m',
  BRIGHT_BLUE: '\x1B[94m',
  BRIGHT_MAGENTA: '\x1B[95m',
  BRIGHT_CYAN: '\x1B[96m',
  BRIGHT_WHITE: '\x1B[97m',
}

const LOG_LEVEL_CONFIG: Record<TermLogLevel, { color: string, label: string }> = {
  INF: { color: ANSI_COLORS.GREEN, label: 'INF' },
  WRN: { color: ANSI_COLORS.YELLOW, label: 'WRN' },
  ERR: { color: ANSI_COLORS.RED, label: 'ERR' },
  DBG: { color: ANSI_COLORS.CYAN, label: 'DBG' },
}

// --- 辅助函数 ---
function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

// --- 主函数 ---
export function writeToTerminal(
  message: string, // Renamed from rawData to better reflect its new role
  sourceName: string = 'unknown', // New parameter for the source
  level: TermLogLevel = 'INF',
) {
  const term = window.term // Assuming window.term is globally declared and initialized
  if (!term) {
    console.warn('Terminal not initialized, skipping log.')
    return
  }

  const timestamp = formatTimestamp(new Date())
  const timestampColor = ANSI_COLORS.BRIGHT_BLACK // 灰色时间戳

  // Message is now directly the content, trim it
  const cleanedMessage = message.trimEnd()

  const levelConfig = LOG_LEVEL_CONFIG[level] || { color: ANSI_COLORS.WHITE, label: level } // Fallback

  // 组装日志行
  const parts: string[] = []
  parts.push(`${timestampColor}${timestamp}${ANSI_COLORS.RESET}`)
  parts.push(`${levelConfig.color}${levelConfig.label.padEnd(3)}${ANSI_COLORS.RESET}`) // padEnd 确保对齐
  parts.push(`${ANSI_COLORS.MAGENTA}[${sourceName}]${ANSI_COLORS.RESET}`) // Use the provided sourceName
  parts.push(cleanedMessage) // Message uses terminal default color

  term.writeln(parts.join(' '))
}
