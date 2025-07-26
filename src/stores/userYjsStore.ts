import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket' // 让多个客户端通过 WebSocket 同步一个文档
import type { Path } from '@/types/path'

const doc = new Y.Doc()

// 连接状态
export const connectionStatus = {
  connected: false,
  connecting: false,
  error: null as string | null,
}

// 使用 WebSocketProvider 连接到服务器，并加入一个"房间"，在这也就是加入到一个攻略文档
const provider = new WebsocketProvider(
  'ws://localhost:8080', // WebSocket 服务地址（搭建的协同服务器地址）
  'trip-room-001', // 房间名，类似于文档ID / 页面ID
  doc // 当前文档对象
)

// 监听连接状态
provider.on('status', ({ status }: { status: string }) => {
  console.log('Yjs WebSocket 连接状态:', status)

  switch (status) {
    case 'connected':
      connectionStatus.connected = true
      connectionStatus.connecting = false
      connectionStatus.error = null
      break
    case 'connecting':
      connectionStatus.connecting = true
      connectionStatus.connected = false
      break
    case 'disconnected':
      connectionStatus.connected = false
      connectionStatus.connecting = false
      connectionStatus.error = '连接已断开'
      break
  }
})

// 监听连接错误
provider.on('connection-error', (err: any) => {
  console.error('Yjs WebSocket 连接错误:', err)
  connectionStatus.error = err.message || '连接失败'
  connectionStatus.connected = false
  connectionStatus.connecting = false
})

// 共享数据结构
export const yFirstPath = doc.getArray<Y.Map<Path>>('firstPath')

// 导出 provider 用于清理
export { provider }
