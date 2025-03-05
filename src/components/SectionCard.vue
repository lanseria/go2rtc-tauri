<script lang="ts" setup>
defineProps({
  title: String,
  collapsible: Boolean,
})

const isOpen = ref(true)
</script>

<template>
  <div class="section-card border rounded-lg bg-white shadow-sm">
    <div
      class="header flex cursor-pointer items-center justify-between p-4"
      @click="collapsible ? (isOpen = !isOpen) : null"
    >
      <h3 class="text-gray-800 font-semibold">
        {{ title }}
      </h3>
      <div v-if="collapsible" :class="isOpen ? 'rotate-180' : ''" class="transform transition">
        <div i-ph-caret-down />
      </div>
    </div>
    <div v-show="!collapsible || isOpen" class="content p-4 pt-0">
      <slot />
    </div>
  </div>
</template>
