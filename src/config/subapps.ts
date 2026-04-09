import bus from '@/utils/bus.ts'

export type SubApp = {
  name: string // app name registered
  entry: string
  container: string
  activeRule: string
  props: {
    bus: typeof bus
  }
}

const subapps: SubApp[] = [
  {
    name: 'react app',
    entry: '//localhost:7100', // 入口地址可带时间戳参数防止缓存
    container: '#subapp',
    activeRule: '/subapp/react',
    props: {
      bus
    }
  },
  {
    name: 'vue3',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/subapp/vue3',
    props: {
      bus
    }
  },
  {
    name: 'vue2',
    entry: 'http://localhost:9528',
    container: '#subapp',
    activeRule: '/subapp/vue2',
    props: {
      bus
    }
  },
]

export default subapps
