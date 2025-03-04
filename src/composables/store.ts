import { useLocalStorage } from '@vueuse/core'
import defaultConfig from './go2rtc.json'

// 默认配置示例
export const currentConfig = useLocalStorage('config', defaultConfig)

export function resetConfig() {
  currentConfig.value = defaultConfig
}
