<script lang="ts" setup>
const isRunning = ref(false)
const router = useRouter()
const logs = ref([
  '系统初始化...',
  '加载配置文件...',
  '等待操作...',
])

function toggleRunning() {
  isRunning.value = !isRunning.value
  logs.value.push(`系统${isRunning.value ? '启动' : '停止'}于 ${new Date().toLocaleTimeString()}`)
}

function openConfig() {
  // 实现配置编辑功能
  router.push({
    path: '/configuration',
  })
}
</script>

<template>
  <div class="w-full h-full bg-gray-100 p-4">
    <!-- Header with controls -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">
        控制面板
      </h1>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          @click="openConfig"
        >
          配置编辑
        </button>
        <button
          class="px-4 py-2 rounded text-white transition" :class="[
            isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
          ]"
          @click="toggleRunning"
        >
          {{ isRunning ? '停止' : '运行' }}
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="grid grid-cols-2 gap-4 h-[calc(100%-4rem)]">
      <!-- Video Preview -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2">
          视频预览
        </h2>
        <div class="bg-gray-800 h-[calc(100%-2rem)] rounded flex items-center justify-center">
          <span class="text-gray-400">视频预览区域</span>
        </div>
      </div>

      <!-- Log Display -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2">
          日志展示
        </h2>
        <div class="bg-gray-900 text-gray-200 p-4 h-[calc(100%-2rem)] rounded font-mono text-sm overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="mb-1">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
