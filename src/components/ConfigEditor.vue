<script lang="ts" setup>
import { open } from '@tauri-apps/plugin-dialog'
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

// 安全访问/修改 FFmpeg bin 路径
const ffmpegBin = computed({
  get: () => formData.value.ffmpeg?.bin ?? '',
  set: (val) => {
    const currentFfmpeg = formData.value.ffmpeg || {}
    const newFfmpeg = { ...currentFfmpeg, bin: val }
    formData.value = {
      ...formData.value,
      ffmpeg: newFfmpeg,
    }
  },
})

async function selectFfmpegPath() {
  try {
    const selected = await open({
      multiple: false,
      directory: false,
      // 不设置 filters 以允许选择任何文件（适配 Linux/macOS 无后缀二进制）
    })
    if (selected && typeof selected === 'string') {
      ffmpegBin.value = selected
    }
  }
  catch (err) {
    console.error('Failed to select file', err)
  }
}

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
  <div class="config-editor mx-auto pb-8 max-w-4xl space-y-6">
    <!-- API 配置 -->
    <SectionCard title="API Configuration">
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <FormField label="Listen Address" path="api.listen">
          <input v-model="formData.api.listen" type="text" class="input w-full" placeholder=":1984">
        </FormField>
        <FormField label="Origin" path="api.origin">
          <input v-model="formData.api.origin" type="text" class="input w-full" placeholder="*">
        </FormField>
        <FormField label="Username" path="api.username">
          <input v-model="formData.api.username" type="text" class="input w-full" placeholder="admin">
        </FormField>
        <FormField label="Password" path="api.password">
          <input v-model="formData.api.password" type="password" class="input w-full" placeholder="Leave empty for no auth">
        </FormField>
      </div>
    </SectionCard>

    <!-- 日志配置 -->
    <SectionCard title="Log Settings">
      <div class="gap-6 grid grid-cols-2 md:grid-cols-4">
        <FormField label="Log Format" path="log.format">
          <div class="relative">
            <select v-model="formData.log.format" class="input pr-8 appearance-none w-full">
              <option v-for="opt in ['color', 'json', 'text']" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <div class="text-gray-500 px-2 flex pointer-events-none items-center inset-y-0 right-0 absolute">
              <div class="i-carbon-chevron-down" />
            </div>
          </div>
        </FormField>
        <FormField label="Log Level" path="log.level">
          <div class="relative">
            <select v-model="formData.log.level" class="input pr-8 appearance-none w-full">
              <option v-for="level in logLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
            <div class="text-gray-500 px-2 flex pointer-events-none items-center inset-y-0 right-0 absolute">
              <div class="i-carbon-chevron-down" />
            </div>
          </div>
        </FormField>
      </div>
    </SectionCard>

    <!-- 流配置 -->
    <SectionCard title="Streams Configuration">
      <div class="space-y-3">
        <div v-for="(url, name, index) in formData.streams" :key="index" class="group p-3 border border-gray-100 rounded-lg bg-gray-50/50 transition-colors relative hover:border-gray-200 hover:bg-gray-50">
          <div class="flex flex-col gap-3 items-start md:flex-row md:items-end">
            <div class="flex-none w-full md:w-1/4">
              <label class="text-xs text-gray-500 font-medium mb-1 block">Name</label>
              <input
                :value="name"
                type="text"
                class="input text-xs font-mono w-full"
                placeholder="stream_name"
                @input="onInputName(name, $event)"
              >
            </div>
            <div class="flex-1 w-full">
              <label class="text-xs text-gray-500 font-medium mb-1 block">Source URL</label>
              <input
                :value="url"
                type="text"
                class="input text-xs font-mono w-full"
                placeholder="rtsp://..."
                @input="onInputValue(name, $event)"
              >
            </div>
            <div class="right-2 top-2 absolute md:mb-[1px] md:static">
              <button
                class="btn-danger p-2 rounded-lg opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                title="Remove Stream"
                @click="removeStream(name)"
              >
                <div class="i-carbon-trash-can text-lg" />
              </button>
            </div>
          </div>
        </div>

        <button
          class="text-gray-500 mt-4 p-4 border-2 border-gray-300 rounded-lg border-dashed flex gap-2 w-full transition-colors items-center justify-center hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50"
          @click="addStream"
        >
          <div class="i-carbon-add-filled text-xl" />
          <span class="font-medium">Add New Stream</span>
        </button>
      </div>
    </SectionCard>

    <!-- FFmpeg 配置 -->
    <SectionCard title="FFmpeg Configuration">
      <div class="gap-6 grid grid-cols-1">
        <FormField label="Binary Path" path="ffmpeg.bin" help="Absolute path to ffmpeg executable">
          <div class="flex gap-2">
            <input
              v-model="ffmpegBin"
              type="text"
              class="input text-sm font-mono w-full"
              placeholder="ffmpeg (or /usr/bin/ffmpeg)"
            >
            <button class="btn-secondary whitespace-nowrap" @click="selectFfmpegPath">
              Select File
            </button>
          </div>
        </FormField>
      </div>
    </SectionCard>

    <!-- 高级配置 -->
    <SectionCard title="Advanced Settings" collapsible>
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <FormField label="WebRTC Listen" path="webrtc.listen">
          <input v-model="formData.webrtc.listen" type="text" class="input w-full" placeholder=":8555/tcp">
        </FormField>
      </div>
    </SectionCard>
  </div>
</template>
