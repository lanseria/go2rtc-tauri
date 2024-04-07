import type { MouseState } from '~/types'

export const sessionSourceBarVisible = useSessionStorage('sessionSourceBarVisible', true)
export function setSourceBarVisible() {
  sessionSourceBarVisible.value = !sessionSourceBarVisible.value
}
/**
 * MouseState
 */
export const sessionMouseState = useSessionStorage<MouseState>('sessionMouseState', 'default')

export const seesionGo2rtcStdout = useSessionStorage<string>('seesionGo2rtcStdout', '')
export const seesionGo2rtcStderr = useSessionStorage<string>('seesionGo2rtcStderr', '')
watch(seesionGo2rtcStdout, (value) => {
  window.term.write(value)
})
