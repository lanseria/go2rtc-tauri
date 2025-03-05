import { useLocalStorage } from '@vueuse/core'
import defaultConfig from './go2rtc.json'

// 默认配置示例
export const currentConfig = useLocalStorage<Go2RTCConfig>('config', defaultConfig as Go2RTCConfig)

export function resetConfig() {
  currentConfig.value = defaultConfig as Go2RTCConfig
}
