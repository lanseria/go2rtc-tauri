<script lang="ts" setup>
const router = useRouter()

// 默认配置示例
const defaultConfig = {
  videoSource: 'rtsp://example.com/stream',
  resolution: {
    width: 1280,
    height: 720,
  },
  fps: 30,
  logLevel: 'info',
  lastModified: '2025-03-03 08:58:20',
  modifiedBy: 'lanseria',
}

const configText = ref(JSON.stringify(defaultConfig, null, 2))

function goBack() {
  router.push('/')
}

function saveConfig() {
  try {
    // 尝试解析 JSON 以验证格式
    JSON.parse(configText.value)
    // TODO: 实际保存逻辑
    alert('配置已保存')
  }
  catch (e) {
    alert('配置格式错误，请检查 JSON 格式')
  }
}
</script>

<template>
  <div class="h-500px w-full bg-gray-100 p-4">
    <!-- Header with back button -->
    <div class="flex items-center mb-4">
      <button
        class="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
        @click="goBack"
      >
        <span class="i-carbon-arrow-left" />
        返回
      </button>
      <h1 class="text-xl font-bold ml-4">
        配置编辑
      </h1>
      <div class="flex-1" />
      <!-- Save button -->
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        @click="saveConfig"
      >
        保存
      </button>
    </div>

    <!-- Config Text Editor -->
    <div class="h-[calc(100%-4rem)]">
      <textarea
        v-model="configText"
        class="w-full h-full p-4 font-mono text-sm bg-white rounded-lg shadow resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="在此输入配置..."
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
textarea {
  /* 设置等宽字体以更好地显示代码 */
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}
</style>
