<script setup lang="ts">
// import type { Child } from '@tauri-apps/api/shell'
// import { Command } from '@tauri-apps/api/shell'
import { sessionSourceBarVisible } from '~/composables'

// const child = shallowRef<Child>()
// const command = Command.sidecar('sidecar/go2rtc')

// async function startGo2rtcApp() {
//   command.on('close', (data) => {
//     console.warn('[close]', data)
//   })
//   command.on('error', (error) => {
//     console.warn('[error]', error)
//   })
//   command.stdout.on('data', (data) => {
//     // console.warn('[stdout]', data)
//     seesionGo2rtcStdout.value += `${data}\r`
//   })
//   command.stderr.on('data', (data) => {
//     // console.warn('[stderr]', data)
//     seesionGo2rtcStderr.value += `${data}\r`
//   })
//   child.value = await command.spawn()
// }
// onMounted(() => {
//   startGo2rtcApp()
// })
// onBeforeUnmount(() => {
//   child.value?.kill()
//   command.removeAllListeners()
//   seesionGo2rtcStdout.value = ''
// })
</script>

<template>
  <AConfigProvider size="mini">
    <div class="h-full w-full flex flex-col">
      <Titlebar class="flex-none" />
      <div class="flex shrink grow basis-0 overflow-y-hidden">
        <ToolBar class="flex-none" />
        <SourceBar v-show="sessionSourceBarVisible" class="flex-none" />
        <RouterView />
      </div>
    </div>
  </AConfigProvider>
</template>
