<script lang="ts" setup>
type SourceType = 'streams' 
const sourceActive = ref<SourceType>('streams')
</script>

<template>
  <div class="h-full w-238px flex flex-col border-r-1px border-slate-2">
    <div class="flex border-b-1px border-slate-2">
      <div class="tab-btn" :class="{ active: sourceActive === 'streams' }" @click="sourceActive = 'streams'">
        streams
      </div>
    </div>
    <SourceStreamsData v-if="sourceActive === 'streams'" />
  </div>
</template>

<style lang="css" scoped>
.tab-btn {
  @apply px-2 leading-10  font-bold text-slate-4 cursor-default hover:text-slate-8 text-12px;
}
.tab-btn.active {
  @apply border-b-2px border-slate-6 text-slate-8;
}
</style>
