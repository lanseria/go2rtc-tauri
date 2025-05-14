import type { Terminal } from '@xterm/xterm' // Or 'xterm' depending on your import

declare global {
  interface Window {
    term?: Terminal // Use '?' to indicate it might not be initialized immediately
  }
}
