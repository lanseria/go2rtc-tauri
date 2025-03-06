<script lang="ts" setup>
import { useLocalStorage } from '@vueuse/core'

const emits = defineEmits(['autoRun'])
const checked = useLocalStorage('auto-run-checked', false)

async function toggle() {
  checked.value = !checked.value
}
onMounted(async () => {
  if (checked.value) {
    emits('autoRun')
  }
})
</script>

<template>
  <Switch :model-value="checked" label="启动自动运行" @update:model-value="toggle" />
</template>
