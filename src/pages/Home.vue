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
// 创建一个日志处理函数
function handleLog(data: string) {
  // 这里可以根据需要处理日志
  // 比如更新UI、存储到状态管理中等
  if (term) {
    term.writeln(data.trimEnd())
  }
}

async function toggleRunning() {
  if (isRunning.value) {
    isRunning.value = false
    term.writeln('sidecar stop')
    if (child) {
      child.kill()
      child = undefined
    }
  }
  else {
    isRunning.value = true
    term.writeln('sidecar start')
    const ports = extractPorts(currentConfig.value)
    term.writeln(`ports: ${ports}`)
    for await (const port of ports) {
      const result = await killPortProcess(port)
      term.writeln(`kill port ${port} result: ${result}`)
    }
    const result = await executeSidecar(currentConfig.value, handleLog)
    if (result.success) {
      child = result.child
      term.writeln('sidecar started')
    }
  }
}

function openConfig() {
  // 实现配置编辑功能
  router.push({
    path: '/configuration',
  })
}

async function openVideo() {
  await openUrl('http://127.0.0.1:1984/')
}

onMounted(() => {
  if (terminalRef.value) {
    term = new Terminal()
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.value)
    term.write('term init')
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
        <button
          class="bg-sky-6 btn hover:bg-sky-7"
          :disabled="!isRunning"
          @click="openVideo"
        >
          视频流查看
        </button>
        <button
          class="btn"
          :disabled="isRunning"
          @click="openConfig"
        >
          配置编辑
        </button>
        <button
          class="rounded px-4 py-2 text-white transition" :class="[
            isRunning ? 'bg-red-6 btn hover:bg-red-7' : 'bg-green-6 btn hover:bg-green-7',
          ]"
          @click="toggleRunning"
        >
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
