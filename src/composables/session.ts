export const sessionSourceBarVisible = useSessionStorage('sessionSourceBarVisible', false)
export function setSourceBarVisible() {
  sessionSourceBarVisible.value = !sessionSourceBarVisible.value
  window.fitAddon.fit()
}

export const seesionGo2rtcStdout = useSessionStorage<string>('seesionGo2rtcStdout', '')
export const seesionGo2rtcStderr = useSessionStorage<string>('seesionGo2rtcStderr', '')
watch(seesionGo2rtcStdout, (nData, oData) => {
  const addData = nData.substring(oData.length, nData.length)
  window.term.write(addData)
})
