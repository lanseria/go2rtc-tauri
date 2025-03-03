import { createMemoryHistory, createRouter } from 'vue-router'

import ConfigurationPage from '~/pages/Configuration.vue'
import HomePage from '~/pages/Home.vue'
import LogPage from '~/pages/Log.vue'
import VideoPage from '~/pages/Video.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/configuration', component: ConfigurationPage },
  { path: '/video', component: VideoPage },
  { path: '/log', component: LogPage },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export {
  router,
}
