<script lang="ts" setup>
import { onMounted, ref } from 'vue'
// import Quill from 'quill'
// import 'quill/dist/quill.snow.css'
import EachPath from './components/EachPath.vue'
import { yFirstPath, connectionStatus } from '@/stores/userYjsStore'
import type { Path } from '@/types/path'
import * as Y from 'yjs'

// ————————创建者初始创建行程
const startPlan = ref(false)
const firstPath = ref<Path[]>([])

// 监听协同数据更新到vue当中
onMounted(() => {
  firstPath.value = yFirstPath.toArray().map(item => item.toJSON()) as Path[]

  yFirstPath.observe(() => {
    firstPath.value = yFirstPath.toArray().map(item => item.toJSON()) as Path[]
  })
})

// 生成唯一ID
let nextId = 1

// 添加新的行程段
// const addNewPath = () => {
//   firstPath.value.push({
//     id: nextId++,
//     from: '',
//     to: '',
//     start: '',
//     end: '',
//   })
// }
const addNewPath = () => {
  const yMap = new Y.Map()
  yMap.set('id', Date.now())
  yMap.set('from', '')
  yMap.set('to', '')
  yMap.set('start', '')
  yMap.set('end', '')
  yMap.set('content', '')
  yMap.set('traffic', new Y.Array())
  yFirstPath.push([yMap] as any)
}

// // 更新行程信息
// const updatePathInfo = (index: number, updatedPath: any) => {
//   firstPath.value[index] = updatedPath
// }

const updatePathInfo = (index: number, updatedPath: Path) => {
  const yMap = yFirstPath.get(index)
  if (yMap) {
    yMap.set('from', updatedPath.from as any)
    yMap.set('to', updatedPath.to as any)
    yMap.set('start', updatedPath.start as any)
    yMap.set('end', updatedPath.end as any)
    yMap.set('content', updatedPath.content as any)

    // 更新交通方式数据
    if (updatedPath.traffic) {
      const yTrafficArray = yMap.get('traffic') as any
      if (yTrafficArray && yTrafficArray instanceof Y.Array) {
        // 清空现有数据
        yTrafficArray.delete(0, yTrafficArray.length)
        // 添加新数据
        updatedPath.traffic.forEach(traffic => {
          const yTrafficMap = new Y.Map()
          yTrafficMap.set('type', traffic.type as any)
          yTrafficMap.set('price', traffic.price as any)
          yTrafficMap.set('time', traffic.time as any)
          yTrafficMap.set('staterDate', traffic.staterDate as any)
          yTrafficMap.set('staterTime', traffic.staterTime as any)
          yTrafficMap.set('overDate', traffic.overDate as any)
          yTrafficMap.set('overTime', traffic.overTime as any)
          yTrafficArray.push([yTrafficMap] as any)
        })
      }
    }
  }
}

// // 删除行程段
// const deletePath = (index: number) => {
//   firstPath.value.splice(index, 1)
// }
const deletePath = (index: number) => {
  yFirstPath.delete(index, 1)
}

// 获取指定索引的交通方式 Yjs 数组
const getYTrafficArray = (index: number) => {
  const yMap = yFirstPath.get(index)
  if (yMap) {
    return yMap.get('traffic') as any
  }
  return undefined
}

// 重连函数
const reconnect = () => {
  // 这里可以重新初始化连接
  window.location.reload()
}
</script>

<template>
  <div class="make-plan-container">
    <h1>制定旅游攻略</h1>

    <!-- 连接状态显示 -->
    <div class="connection-status">
      <div v-if="connectionStatus.connecting" class="status connecting">
        <span class="status-dot connecting"></span>
        正在连接协同服务器...
      </div>
      <div v-else-if="connectionStatus.connected" class="status connected">
        <span class="status-dot connected"></span>
        已连接 - 实时协同编辑已启用
      </div>
      <div v-else-if="connectionStatus.error" class="status error">
        <span class="status-dot error"></span>
        连接失败: {{ connectionStatus.error }}
        <button @click="reconnect" class="reconnect-btn">重连</button>
      </div>
      <div v-else class="status disconnected">
        <span class="status-dot disconnected"></span>
        未连接 - 请检查服务器状态
      </div>
    </div>

    <div v-if="true" class="invite-container">
      <span>邀请用户一起编辑旅游攻略</span>
      <button class="invite-btn">邀请</button>
    </div>
    <!-- <div v-if="!startPlan" class="start-container">
      <div class="start-item">
        <label for="">起始点</label>
        <input
          v-model="fromTmp"
          type="text"
          placeholder="请输入起始点"
          required
        />
      </div>
      <div class="start-item">
        <label for="">终点</label>
        <input v-model="toTmp" type="text" placeholder="请输入终点" required />
      </div>
      <div class="start-item">
        <label for="">出行时间</label>
        <input v-model="startTmp" type="date" />
        <span>至</span>
        <input v-model="endTmp" type="date" />
      </div>
      <div @click="addPath" class="start-btn">开始创建</div>
    </div> -->
    <div class="make-each-path-container">
      <div class="path-header">
        <h2>创建行程</h2>
        <button @click="addNewPath" class="add-path-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          添加行程段
        </button>
      </div>
      <!-- 这里key先用index，后面弄了点击开始创建后，从后端获取id，再更新key -->
      <EachPath
        v-for="(pathInfo, index) in firstPath"
        :key="pathInfo.id"
        :pathInfo="pathInfo"
        :yTrafficArray="getYTrafficArray(index)"
        @update:pathInfo="updatedPath => updatePathInfo(index, updatedPath)"
        @delete="() => deletePath(index)"
      ></EachPath>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.make-plan-container {
  width: 100%;
  border-radius: 12px;
  padding: 32px 40px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 100%;
  overflow: auto;
}

.make-plan-container h1 {
  color: $second-color;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.start-container {
  border-radius: 12px;
  padding: 50px 34px;
  // box-shadow: 0 4px 24px rgba(75, 116, 82, 0.08);
  border: 2px solid $second-color;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.start-item {
  display: flex;
  align-items: center;
  gap: 12px;

  label {
    color: $second-color;
    font-weight: 600;
    font-size: 1rem;
    min-width: 80px;
  }

  input {
    flex: 1;
    height: 45px;
    padding: 12px 16px;
    border: 1px solid #4b7452;
    border-radius: 8px;
    font-size: 1rem;
    // background: #fafbfc;
    background-color: transparent;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border: 2px solid #4b7452;
    }

    &::placeholder {
      color: #919191;
    }
  }

  span {
    color: $second-color;
    font-weight: 500;
    margin: 0 8px;
  }
}

.start-btn {
  background: $second-color;
  color: $second-font-color;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
  margin-top: 8px;

  &:hover {
    background: darken($second-color, 8%);
  }
}

.make-each-path-container {
  .path-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      color: $second-color;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .add-path-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: $second-color;
      color: $second-font-color;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: darken($second-color, 8%);
        transform: translateY(-1px);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
}

#toolbar {
  // margin-bottom: 8px;
  border-radius: 6px 6px 0 0;
  border: 1px solid #e5e6eb;
  padding: 4px 8px;
  background-color: #4b74521e !important;

  border: 3px solid #4b7452 !important;
}

.ql-toolbar {
  border-radius: 6px 6px 0 0 !important;
  background: #f5f6fa !important;
  border: 1px solid #e5e6eb !important;
  border-bottom: none !important;
}

.ql-container {
  border-radius: 0 0 6px 6px !important;
  border: 1px solid #e5e6eb !important;
  border-top: none !important;
  background: #fafbfc !important;
}

#editor {
  min-height: 240px;
  max-height: 400px;
  font-size: 16px;
  padding: 16px;

  background: transparent !important;
  border-radius: 0 0 6px 6px;
  border: 3px solid #4b7452 !important;
}

.make-plan-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.make-plan-actions button {
  background: $second-color;
  color: $second-font-color;
  border: none;
  border-radius: 6px;
  padding: 8px 28px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

// 连接状态样式
.connection-status {
  margin-bottom: 16px;

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.connected {
        background: #4caf50;
      }

      &.connecting {
        background: #ff9800;
        animation: pulse 1.5s infinite;
      }

      &.error {
        background: #f44336;
      }

      &.disconnected {
        background: #9e9e9e;
      }
    }

    &.connected {
      background: rgba(76, 175, 80, 0.1);
      color: #2e7d32;
    }

    &.connecting {
      background: rgba(255, 152, 0, 0.1);
      color: #e65100;
    }

    &.error {
      background: rgba(244, 67, 54, 0.1);
      color: #c62828;
    }

    &.disconnected {
      background: rgba(158, 158, 158, 0.1);
      color: #424242;
    }

    .reconnect-btn {
      margin-left: auto;
      background: $second-color;
      color: $second-font-color;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.8rem;
      cursor: pointer;

      &:hover {
        background: darken($second-color, 8%);
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
