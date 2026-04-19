import bus from '@/utils/bus.ts'

export type SubApp = {
  name: string // app name registered
  description?: string
  tags?: string[]
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
    description: '在线拼图🧩游戏网站',
    tags: ['Next.js'],
    entry: 'https://puzzle-game-neon-theta.vercel.app/', // 入口地址可带时间戳参数防止缓存
    container: '#subapp',
    activeRule: '/subapp/react',
    props: {
      bus,
    },
  },
  {
    name: 'vue3',
    description: '基于 qiankun 的微前端架构平台，支持多技术栈集成',
    tags: ['Vue', 'qiankun'],
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/subapp/vue3',
    props: {
      bus,
    },
  },
  {
    name: 'vue2',
    entry: 'http://localhost:9528',
    container: '#subapp',
    activeRule: '/subapp/vue2',
    props: {
      bus,
    },
  },
]

export default subapps
