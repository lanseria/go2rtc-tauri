<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { executeSidecar } from '~/composables/sidecarExecutor'

const config = reactive<WrClConfig>({
  replacements: {
    pattern_type: 'plain',
    rules: [{
      old_text: '',
      new_text: '',
      options: {
        case_sensitive: false,
        whole_word: false,
        preserve_format: false,
      },
    }],
  },
  file_settings: {
    input_path: '',
    output_path: '',
  },
  advanced: {
    max_workers: 4,
    timeout: 30,
  },
})

const isProcessing = ref(false)
const consoleOutput = ref<Array<{ type: 'info' | 'error', message: string }>>([])

function addRule() {
  config.replacements.rules.push({
    old_text: '',
    new_text: '',
    options: {
      case_sensitive: false,
      whole_word: false,
      preserve_format: false,
    },
  })
}

function removeRule(index: number) {
  config.replacements.rules.splice(index, 1)
}

function log(message: string, type: 'info' | 'error' = 'info') {
  consoleOutput.value.push({ type, message })
  nextTick(() => {
    const console = document.querySelector('.console-output')
    if (console)
      console.scrollTop = console.scrollHeight
  })
}

async function selectInputPath() {
// Open a dialog
  const file = await open({
    multiple: false,
    directory: true,
  })
  config.file_settings.input_path = file?.toString() || ''
}

async function selectOutputPath() {
// Open a dialog
  const file = await open({
    multiple: false,
    directory: true,
  })
  config.file_settings.output_path = file?.toString() || ''
}

async function executeReplacement() {
  isProcessing.value = true
  consoleOutput.value = []
  log('Starting word replacement...')

  try {
    // 创建一个日志处理函数
    const handleLog = (data: string) => {
      // 这里可以根据需要处理日志
      // 比如更新UI、存储到状态管理中等
      log(data)
    }
    const result = await executeSidecar(config, handleLog)
    if (result.success) {
      log('✅ Process completed successfully')
    }
    else {
      throw new Error(result.message)
    }
  }
  catch (error) {
    log(error instanceof Error ? error.message : 'Unknown error occurred', 'error')
  }
  finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="mx-auto p-4">
    <div class="grid grid-cols-2 gap-4">
      <!-- Left Column (3/5) - Configuration -->
      <div class="col-span-1 space-y-3">
        <!-- Replacements -->
        <section class="card">
          <div class="flex items-center justify-between mb-2">
            <h2 class="card-title">
              Replacements
            </h2>
            <select v-model="config.replacements.pattern_type" class="select-mini">
              <option value="plain">
                Plain
              </option>
              <option value="regex">
                Regex
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <!-- Rules Header -->
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-medium">
                Rules
              </h3>
              <button class="btn-primary" @click="addRule">
                Add Rule
              </button>
            </div>

            <!-- Rules List -->
            <div
              v-for="(rule, index) in config.replacements.rules"
              :key="index"
              class="rule-card"
            >
              <div class="flex justify-end">
                <button class="text-red-400 hover:text-red-600 text-sm" @click="removeRule(index)">
                  ×
                </button>
              </div>
              <div class="space-y-2">
                <div>
                  <input
                    v-model="rule.old_text"
                    class="input-mini"
                    placeholder="Old text"
                  >
                </div>
                <div>
                  <input
                    v-model="rule.new_text"
                    class="input-mini"
                    placeholder="New text"
                  >
                </div>
                <div class="flex gap-3 text-sm">
                  <label class="option">
                    <input v-model="rule.options.case_sensitive" type="checkbox">
                    <span>Case</span>
                  </label>
                  <label class="option">
                    <input v-model="rule.options.whole_word" type="checkbox">
                    <span>Word</span>
                  </label>
                  <label class="option">
                    <input v-model="rule.options.preserve_format" type="checkbox">
                    <span>Format</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- File Settings -->
        <section class="card">
          <h2 class="card-title">
            File Settings (.docx)
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="config.file_settings.input_path"
              class="input-mini"
              placeholder="Input path"
              disabled
            >
            <button class="btn-primary" @click="selectInputPath">
              select input
            </button>
            <input
              v-model="config.file_settings.output_path"
              class="input-mini"
              placeholder="Output path"
              disabled
            >
            <button class="btn-primary" @click="selectOutputPath">
              select output
            </button>
          </div>
        </section>

        <!-- Advanced Settings -->
        <section class="card">
          <h2 class="card-title">
            Advanced
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-2">
              <input
                v-model.number="config.advanced.max_workers"
                type="number"
                class="input-mini"
                min="1"
                placeholder="Max workers"
                disabled
              >
              <input
                v-model.number="config.advanced.timeout"
                type="number"
                class="input-mini"
                min="1"
                placeholder="Timeout (s)"
                disabled
              >
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column (2/5) - Execution and Output -->
      <div class="col-span-1 space-y-3">
        <!-- Execute Button -->
        <section class="card">
          <div class="flex justify-between items-center">
            <h2 class="card-title">
              Execution
            </h2>
            <button
              class="btn-primary"
              :disabled="isProcessing"
              @click="executeReplacement"
            >
              {{ isProcessing ? 'Processing...' : 'Execute' }}
            </button>
          </div>
        </section>

        <!-- Console Output -->
        <section class="card flex-1">
          <h2 class="card-title">
            Console Output
          </h2>
          <div class="console-output h-200px">
            <div
              v-for="(logStr, index) in consoleOutput"
              :key="index"
              :class="{ 'text-red-400': logStr.type === 'error' }"
            >
              {{ logStr.message }}
            </div>
          </div>
        </section>

        <!-- Config Preview -->
        <section class="card">
          <h2 class="card-title">
            Configuration
          </h2>
          <pre class="config-preview">{{ JSON.stringify(config, null, 2) }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>
