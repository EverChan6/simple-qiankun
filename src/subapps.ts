export type SubApp = {
  name: string // app name registered
  entry: string
  container: string
  activeRule: string
}

const subapps: SubApp[] = [
  {
    name: 'react app',
    entry: '//localhost:7100',
    container: '#subapp',
    activeRule: '/react',
  },
  {
    name: 'vue3',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/vue3',
  },
  {
    name: 'vue2',
    entry: 'http://localhost:9528',
    container: '#subapp',
    activeRule: '/vue2',
  },
]

export default subapps
