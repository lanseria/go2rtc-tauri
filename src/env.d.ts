/// <reference types="vite/client" />

import type { Terminal } from '@xterm/xterm'
import type { FitAddon } from '@xterm/addon-fit'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

/**
 * defines in `vite.config.ts`
 */
declare const OS_PLATFORM: Platform

declare global {
  interface Window {
    term: Terminal
    fitAddon: FitAddon
  }
}
