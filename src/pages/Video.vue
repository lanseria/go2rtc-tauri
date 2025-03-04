<script lang="ts" setup>
const router = useRouter()
function goBack() {
  router.back()
}
</script>

<template>
  <div class="h-500px w-full bg-gray-100 p-4">
    <!-- Header with back button -->
    <div class="mb-4 flex items-center">
      <button
        class="flex items-center gap-2 rounded bg-gray-200 px-3 py-2 transition hover:bg-gray-300"
        @click="goBack"
      >
        <span class="i-carbon-arrow-left" />
        返回
      </button>
      <h1 class="ml-4 text-xl font-bold">
        视频流查看
      </h1>
      <div class="flex-1" />
    </div>
    <iframe src="http://127.0.0.1:1984" />
  </div>
</template>
