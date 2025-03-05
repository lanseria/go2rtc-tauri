<script lang="ts" setup>
// import schema from '~/composables/schema.json'

const props = defineProps<{
  modelValue: Go2RTCConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Go2RTCConfig]
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

const logLevels = ['trace', 'debug', 'info', 'warn', 'error'] as const
function onInputName(oldName: string, e: Event) {
  const target = e.target as HTMLInputElement
  const newName = target.value

  // 创建新对象保持响应式
  const newStreams = { ...formData.value.streams }

  // 交换键名位置
  newStreams[newName] = newStreams[oldName]
  delete newStreams[oldName]

  // 替换整个对象触发响应式更新
  formData.value.streams = newStreams
}

function onInputValue(currentName: string, e: Event) {
  const target = e.target as HTMLInputElement
  // 直接修改值（因为对象本身是响应式的）
  formData.value.streams[currentName] = target.value
}

// 添加流
function addStream() {
  const streamName = `stream_${Date.now()}`
  formData.value.streams = {
    ...formData.value.streams,
    [streamName]: '',
  }
}

// 删除流
function removeStream(name: string) {
  const streams = { ...formData.value.streams }
  delete streams[name]

  formData.value = {
    ...formData.value,
    streams,
  }
}
</script>

<template>
  <div class="config-editor p-4 space-y-4">
    <!-- API 配置 -->
    <SectionCard title="API Configuration">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Listen Address" path="api.listen">
          <input v-model="formData.api.listen" type="text" class="input">
        </FormField>
        <FormField label="Base Path" path="api.base_path">
          <input v-model="formData.api.base_path" type="text" class="input">
        </FormField>
      </div>
    </SectionCard>

    <!-- 日志配置 -->
    <SectionCard title="Log Settings">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <FormField label="Log Format" path="log.format">
          <select v-model="formData.log.format" class="select">
            <option v-for="opt in ['color', 'json', 'text']" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </FormField>
        <FormField label="Log Level" path="log.level">
          <select v-model="formData.log.level" class="select">
            <option v-for="level in logLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </FormField>
      </div>
    </SectionCard>

    <!-- 流配置 -->
    <SectionCard title="Streams Configuration">
      <div v-for="(url, name, index) in formData.streams" :key="index" class="stream-item group">
        <div class="grid grid-cols-[1fr_auto] items-center gap-2">
          <FormField :label="`Stream ${index + 1}`">
            <div class="flex gap-2">
              <input :value="name" type="text" class="input flex-none" placeholder="Stream name" @input="onInputName(name, $event)">
              <input
                :value="url"
                type="text"
                class="input flex-1"
                placeholder="rtsp://..."
                @input="onInputValue(name, $event)"
              >
            </div>
          </FormField>
          <button
            class="h-full w-full bg-red-5 text-white opacity-0 transition-opacity btn hover:bg-red-700 group-hover:opacity-100"
            @click="removeStream(name)"
          >
            <div class="i-carbon-trash-can" />
          </button>
        </div>
      </div>
      <button class="mt-2 btn" @click="addStream">
        <div class="i-carbon-add mr-1" /> Add Stream
      </button>
    </SectionCard>

    <!-- 高级配置 -->
    <SectionCard title="Advanced Settings" collapsible>
      <div class="space-y-4">
        <!-- WebRTC 配置 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="WebRTC Listen" path="webrtc.listen">
            <input v-model="formData.webrtc.listen" type="text" class="input">
          </FormField>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<style scoped>
/* 自定义 UnoCSS 类 */
.input {
  @apply px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all;
}
</style>
