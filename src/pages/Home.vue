<script lang="ts" setup>
import type { Child } from '@tauri-apps/plugin-shell'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { executeSidecar } from '~/composables/sidecarExecutor'
import { currentConfig } from '~/composables/store'
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
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    if (child) {
      child.kill()
      child = undefined
    }
  }
  else {
    term.clear()
    // await startSidecar(currentConfig.value)
    const result = await executeSidecar(currentConfig.value, handleLog)
    if (result.success) {
      child = result.child
      child?.write('\r\n')
    }
  }
}

function openConfig() {
  // 实现配置编辑功能
  router.push({
    path: '/configuration',
  })
}

onMounted(() => {
  if (terminalRef.value) {
    term = new Terminal({

    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.value)
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
          class="rounded bg-sky-500 px-4 py-2 text-white transition hover:bg-sky-600"
          @click="openConfig"
        >
          视频流查看
        </button>
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          @click="openConfig"
        >
          配置编辑
        </button>
        <button
          class="rounded px-4 py-2 text-white transition" :class="[
            isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
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
