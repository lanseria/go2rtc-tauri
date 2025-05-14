<script lang="ts" setup>
import type { Child } from '@tauri-apps/plugin-shell'
import { openUrl } from '@tauri-apps/plugin-opener'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { executeSidecar, killPortProcess } from '~/composables/sidecarExecutor'
import { currentConfig } from '~/composables/store'
import { extractPorts } from '~/composables/utils'
import '@xterm/xterm/css/xterm.css'

const isRunning = ref(false)
const terminalRef = useTemplateRef('terminalRef')
const router = useRouter()
let child: Child | undefined
let term: Terminal

function handleLogFormat(data: string) {
  if (term) {
    term.writeln(`[Home.vue] ${data}`)
  }
}

function handleLogRemoveEnd(data: string) {
  if (term) {
    term.writeln(data.trimEnd())
  }
}

async function onStartRunning() {
  isRunning.value = true
  handleLogFormat('go2rtc sidecar start')
  const ports = extractPorts(currentConfig.value)
  handleLogFormat(`find config use ports: ${ports}`)
  for await (const port of ports) {
    const result = await killPortProcess(port)
    handleLogFormat(`kill port ${port} result: ${result}`)
  }
  handleLogFormat('go2rtc sidecar start')
  const result = await executeSidecar(currentConfig.value, handleLogRemoveEnd)

  if (result.success) {
    child = result.child
    handleLogFormat('go2rtc sidecar started')
  }
  else {
    handleLogFormat('go2rtc sidecar start fail')
    handleLogFormat(JSON.stringify(result))
  }
}

async function toggleRunning() {
  if (isRunning.value) {
    isRunning.value = false
    handleLogFormat('go2rtc sidecar stop')
    if (child) {
      child.kill()
      child = undefined
    }
  }
  else {
    onStartRunning()
  }
}

function openConfig() {
  router.push({
    path: '/configuration',
  })
}

function extractPort(input: string): number {
  const str = input.toString() // 确保是字符串
  const parts = str.split(':') // 按冒号分割
  const port = parts.pop() // 取最后一部分（端口号）
  return Number.parseInt(port!, 10) // 转换为数字
}

async function openVideo() {
  if (currentConfig.value.api.listen) {
    const port = extractPort(currentConfig.value.api.listen)
    await openUrl(`http://127.0.0.1:${port}`)
  }
}

onMounted(async () => {
  if (terminalRef.value) {
    term = new Terminal()
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.value)
    handleLogFormat('term init finish')
  }
})

onUnmounted(() => {
  if (child) {
    child.kill()
    child = undefined
  }
})
</script>

<template>
  <div class="h-full w-full bg-gray-100 p-4">
    <!-- Header with controls -->
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">
        控制面板
      </h1>
      <div class="flex gap-2">
        <AutoStartSwitch />
        <AutoRunSwitch @auto-run="onStartRunning" />
        <button
          class="bg-sky-6 btn hover:bg-sky-7"
          :disabled="!isRunning"
          @click="openVideo"
        >
          视频流查看
          <div class="i-carbon-arrow-up-right" />
        </button>
        <button
          class="btn"
          :disabled="isRunning"
          @click="openConfig"
        >
          <div class="i-carbon-document-configuration" />
          配置编辑
        </button>
        <button
          class="rounded px-4 py-2 text-white transition" :class="[
            isRunning ? 'bg-red-6 btn hover:bg-red-7' : 'bg-green-6 btn hover:bg-green-7',
          ]"
          @click="toggleRunning"
        >
          <div v-if="isRunning" class="i-carbon-stop-filled-alt" />
          <div v-else class="i-carbon-play-filled-alt" />
          {{ isRunning ? '停止' : '运行' }}
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="gap-4">
      <!-- Log Display -->
      <div class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-2 text-lg font-semibold">
          日志展示
        </h2>
        <div ref="terminalRef" class="w-full overflow-hidden" />
      </div>
    </div>
  </div>
</template>
