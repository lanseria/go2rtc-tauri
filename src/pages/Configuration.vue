<script lang="ts" setup>
import { currentConfig, resetConfig } from '~/composables/store'

const router = useRouter()
const isJsonMode = ref(false)

const configText = computed({
  get: () => JSON.stringify(currentConfig.value, null, 2),
  set: (value) => {
    try {
      const jsonData = JSON.parse(value)
      currentConfig.value = jsonData
    }
    catch (e) {
      console.error('配置格式错误，请检查 JSON 格式', e)
    }
  },
})

function goBack() {
  router.back()
}

function saveConfig() {
  if (isJsonMode.value) {
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
  else {
    // 组件化编辑模式下直接保存
    console.warn('配置已保存')
    goBack()
  }
}

function handleReset() {
  resetConfig()
}

function toggleMode() {
  isJsonMode.value = !isJsonMode.value
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
        <!-- Mode toggle button -->
        <button
          class="rounded bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600"
          @click="toggleMode"
        >
          {{ isJsonMode ? '切换到表单模式' : '切换到JSON模式' }}
        </button>
        <!-- Reset button -->
        <button
          class="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          @click="handleReset"
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

    <!-- Config Editor -->
    <div class="h-[calc(100%-4rem)]">
      <Transition
        mode="out-in"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 transform -translate-x-2"
        enter-to-class="opacity-100 transform translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 transform translate-x-0"
        leave-to-class="opacity-0 transform translate-x-2"
      >
        <JsonEditor
          v-if="isJsonMode"
          v-model="configText"
        />
        <ConfigEditor
          v-else
          v-model="currentConfig"
        />
      </Transition>
    </div>
  </div>
</template>
