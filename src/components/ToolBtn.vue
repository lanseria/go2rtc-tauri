<script lang="ts" setup>
import { useRoute } from 'vue-router'

const props = defineProps({
  iconName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})
const route = useRoute()

const computedActiveClass = computed(() => {
  // path same as name
  return route.name === props.type ? 'active' : 'inactive'
})
</script>

<template>
  <IconBtn
    :icon-name="iconName"
    class="inactive"
    :class="computedActiveClass"
    :tooltip-name="name"
    @click="$router.push(type)"
  />
</template>

<style lang="css" scoped>
.tool-button:not(.active) {
  @apply hover:bg-gray-1;
}
.inactive {
  @apply bg-white text-gray-7;
}
.active {
  @apply bg-blue-5 text-white;
}
</style>
