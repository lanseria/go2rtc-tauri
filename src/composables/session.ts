import type { MouseState } from '~/types'

export const sessionSourceBarVisible = useSessionStorage('sessionSourceBarVisible', true)
export function setSourceBarVisible() {
  sessionSourceBarVisible.value = !sessionSourceBarVisible.value
  nextTick(() => {
    window.map.resize()
  })
}
/**
 * MouseState
 */
export const sessionMouseState = useSessionStorage<MouseState>('sessionMouseState', 'default')
watch(sessionMouseState, () => {
  console.warn('[watchEffect]', '[sessionMouseState]', sessionMouseState.value)
  if (sessionMouseState.value === 'default')
    window.draw && window.draw.changeMode('simple_select')
  if (sessionMouseState.value === 'line')
    window.draw && window.draw.changeMode('draw_line_string')
  if (sessionMouseState.value === 'polygon')
    window.draw && window.draw.changeMode('draw_polygon')
  if (sessionMouseState.value === 'circle')
    window.draw && window.draw.changeMode('draw_radius')
})

export const sessionDrawActiveId = useSessionStorage('sessionDrawActiveId', '')
