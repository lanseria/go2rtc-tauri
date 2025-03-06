<script lang="ts" setup>
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'

const checked = ref(false)

async function toggle() {
  const value = !checked.value
  if (value) {
    await enable()
  }
  else {
    await disable()
  }
  checked.value = value
}
onMounted(async () => {
  const autostartIsEnabled = await isEnabled()
  if (autostartIsEnabled) {
    checked.value = true
  }
  else {
    checked.value = false
  }
})
</script>

<template>
  <Switch :model-value="checked" label="开机自启" @update:model-value="toggle" />
</template>
