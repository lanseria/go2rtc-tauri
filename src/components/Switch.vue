<script lang="ts" setup>
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  modelValue: boolean
  label: string
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
const checked = useVModel(props, 'modelValue', emits)

function toggle() {
  checked.value = !checked.value
}
</script>

<template>
  <div class="flex items-center">
    {{ label }}：
    <div
      class="switch"
      :class="{ 'switch--checked': checked }"
      @click="toggle"
    >
      <div class="switch__thumb" />
    </div>
  </div>
</template>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  width: 40px;
  height: 20px;
  background-color: #ccc;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s;
}

.switch--checked {
  background-color: #4caf50;
}

.switch__thumb {
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: transform 0.3s;
}

.switch--checked .switch__thumb {
  transform: translateX(20px);
}
</style>
