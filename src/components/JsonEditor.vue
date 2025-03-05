<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})
</script>

<template>
  <div class="h-full">
    <textarea
      v-model="localValue"
      class="h-full w-full resize-none rounded-lg bg-white p-4 text-sm font-mono shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="在此输入配置..."
    />
  </div>
</template>

<style lang="css" scoped>
textarea {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}
</style>
