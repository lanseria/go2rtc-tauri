<script lang="ts" setup>
import { currentConfig, resetConfig } from '~/composables/store'

const router = useRouter()

const configText = ref(JSON.stringify(currentConfig.value, null, 2))

function goBack() {
  router.back()
}

function saveConfig() {
  try {
    // 尝试解析 JSON 以验证格式
    const jsonData = JSON.parse(configText.value)
    // TODO: 实际保存逻辑
    console.warn('配置已保存')
    currentConfig.value = jsonData
    goBack()
  }
  catch (e) {
    console.error('配置格式错误，请检查 JSON 格式', e)
  }
}

function handleReset() {
  resetConfig()
  configText.value = JSON.stringify(currentConfig.value, null, 2)
}
</script>

<template>
  <div class="h-500px w-full bg-gray-100 p-4">
    <!-- Header with back button -->
    <div class="mb-4 flex items-center">
      <button
        class="flex items-center gap-2 rounded bg-gray-200 px-3 py-2 transition hover:bg-gray-300"
        @click="goBack"
      >
        <span class="i-carbon-arrow-left" />
        返回
      </button>
      <h1 class="ml-4 text-xl font-bold">
        配置编辑
      </h1>
      <div class="flex-1" />
      <div class="flex gap-2">
        <!-- Reset button -->
        <button
          class="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          @click="handleReset()"
        >
          重置
        </button>
        <!-- Save button -->
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          @click="saveConfig"
        >
          保存
        </button>
      </div>
    </div>

    <!-- Config Text Editor -->
    <div class="h-[calc(100%-4rem)]">
      <textarea
        v-model="configText"
        class="h-full w-full resize-none rounded-lg bg-white p-4 text-sm font-mono shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
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
