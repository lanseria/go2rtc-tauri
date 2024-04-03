<script lang="ts" setup>
import { Command } from '@tauri-apps/api/shell'
import type { PropType } from 'vue'
import type { MouseState } from '~/types'

defineProps({
  iconName: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<MouseState>,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})
async function handleClick() {
  const command = Command.sidecar('sidecar/go2rtc')
  const output = await command.execute()
  console.warn(output)
}
</script>

<template>
  <IconBtn
    :icon-name="iconName" class="inactive"
    :tooltip-name="name"
    @click="handleClick"
  />
</template>

<style lang="css" scoped>
.tool-button:not(.active) {
  @apply hover:bg-gray-1;
}
.active {
  @apply bg-blue-5 text-white;
}

.inactive {
  @apply bg-white text-gray-7;
}
</style>
