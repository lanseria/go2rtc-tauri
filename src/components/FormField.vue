<script lang="ts" setup>
defineProps({
  label: String,
  path: String,
})
</script>

<template>
  <div class="form-field space-x-2">
    <label v-if="label" class="text-sm text-gray-700 font-medium">{{ label }}</label>
    <slot />
    <div v-if="$slots.help" class="text-xs text-gray-500">
      <slot name="help" />
    </div>
  </div>
</template>
