<script setup lang="ts">
import { Terminal } from '@xterm/xterm'

import { Command } from '@tauri-apps/api/shell'
import { sessionSourceBarVisible } from '~/composables'

import '@xterm/xterm/css/xterm.css'

const TerminalRef = shallowRef()
function startGo2rtcApp() {
  const command = Command.sidecar('sidecar/go2rtc')
  console.warn('[ToolBtn] ', command)
  command.on('close', (data) => {
    console.warn('[close]', data)
  })
  command.on('error', (error) => {
    console.warn('[error]', error)
  })
  command.stdout.on('data', (data) => {
    console.warn('[stdout]', data)
    seesionGo2rtcStdout.value = data
  })
  command.stderr.on('data', (data) => {
    console.warn('[stderr]', data)
    seesionGo2rtcStderr.value = data
  })
  command.spawn()
}
onMounted(() => {
  startGo2rtcApp()
  window.term = new Terminal()
  const term = window.term
  term.open(TerminalRef.value)
})
</script>

<template>
  <AConfigProvider size="mini">
    <div class="h-full w-full flex flex-col">
      <Titlebar class="flex-none" />
      <div class="flex shrink grow basis-0 overflow-y-hidden">
        <ToolBar class="flex-none" />
        <SourceBar v-show="sessionSourceBarVisible" class="flex-none" />
        <div ref="TerminalRef" />
      </div>
    </div>
  </AConfigProvider>
</template>

<style lang="css" scoped>
.default-hover:deep(canvas) {
  @apply cursor-default;
}
.point-hover:deep(canvas),
.line-hover:deep(canvas),
.polygon-hover:deep(canvas),
.circle-hover:deep(canvas) {
  @apply cursor-crosshair;
}
</style>
