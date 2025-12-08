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
  <div class="config-editor mx-auto max-w-4xl pb-8 space-y-6">
    <!-- API 配置 -->
    <SectionCard title="API Configuration">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="Listen Address" path="api.listen">
          <input v-model="formData.api.listen" type="text" class="w-full input" placeholder=":1984">
        </FormField>
        <FormField label="Origin" path="api.origin">
          <input v-model="formData.api.origin" type="text" class="w-full input" placeholder="*">
        </FormField>
        <FormField label="Username" path="api.username">
          <input v-model="formData.api.username" type="text" class="w-full input" placeholder="admin">
        </FormField>
        <FormField label="Password" path="api.password">
          <input v-model="formData.api.password" type="password" class="w-full input" placeholder="Leave empty for no auth">
        </FormField>
      </div>
    </SectionCard>

    <!-- 日志配置 -->
    <SectionCard title="Log Settings">
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <FormField label="Log Format" path="log.format">
          <div class="relative">
            <select v-model="formData.log.format" class="w-full appearance-none input pr-8">
              <option v-for="opt in ['color', 'json', 'text']" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <div class="i-carbon-chevron-down" />
            </div>
          </div>
        </FormField>
        <FormField label="Log Level" path="log.level">
          <div class="relative">
            <select v-model="formData.log.level" class="w-full appearance-none input pr-8">
              <option v-for="level in logLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <div class="i-carbon-chevron-down" />
            </div>
          </div>
        </FormField>
      </div>
    </SectionCard>

    <!-- 流配置 -->
    <SectionCard title="Streams Configuration">
      <div class="space-y-3">
        <div v-for="(url, name, index) in formData.streams" :key="index" class="group relative border border-gray-100 rounded-lg bg-gray-50/50 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50">
          <div class="flex flex-col items-start gap-3 md:flex-row md:items-end">
            <div class="w-full flex-none md:w-1/4">
              <label class="mb-1 block text-xs text-gray-500 font-medium">Name</label>
              <input
                :value="name"
                type="text"
                class="w-full input text-xs font-mono"
                placeholder="stream_name"
                @input="onInputName(name, $event)"
              >
            </div>
            <div class="w-full flex-1">
              <label class="mb-1 block text-xs text-gray-500 font-medium">Source URL</label>
              <input
                :value="url"
                type="text"
                class="w-full input text-xs font-mono"
                placeholder="rtsp://..."
                @input="onInputValue(name, $event)"
              >
            </div>
            <div class="absolute right-2 top-2 md:static md:mb-[1px]">
              <button
                class="btn-danger rounded-lg p-2 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                title="Remove Stream"
                @click="removeStream(name)"
              >
                <div class="i-carbon-trash-can text-lg" />
              </button>
            </div>
          </div>
        </div>

        <button
          class="mt-4 w-full flex items-center justify-center gap-2 border-2 border-gray-300 rounded-lg border-dashed p-4 text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
          @click="addStream"
        >
          <div class="i-carbon-add-filled text-xl" />
          <span class="font-medium">Add New Stream</span>
        </button>
      </div>
    </SectionCard>

    <!-- 高级配置 -->
    <SectionCard title="Advanced Settings" collapsible>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="WebRTC Listen" path="webrtc.listen">
          <input v-model="formData.webrtc.listen" type="text" class="w-full input" placeholder=":8555/tcp">
        </FormField>
      </div>
    </SectionCard>
  </div>
</template>
