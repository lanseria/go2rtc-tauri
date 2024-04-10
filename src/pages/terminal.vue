<script lang="ts" setup>
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

const TerminalRef = shallowRef()
onMounted(() => {
  const term = new Terminal({
    disableStdin: true,
  })
  const fitAddon = new FitAddon()
  term.open(TerminalRef.value)
  term.loadAddon(fitAddon)
  window.term = term
  window.fitAddon = fitAddon
})
onBeforeUnmount(() => {
  if (window.term)
    window.term.dispose()
})
useResizeObserver(TerminalRef, () => {
  window.fitAddon.fit()
})
</script>

<template>
  <div ref="TerminalRef" class="h-full w-full flex-1" />
</template>
