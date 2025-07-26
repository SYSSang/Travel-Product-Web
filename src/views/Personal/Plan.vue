<script lang="ts" setup>
import { ref } from 'vue'
// import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import EachPath from './components/EachPath.vue'

// onMounted(() => {
//   // 获取dom需要在mounted后
//   const quill = new Quill('#editor', {
//     theme: 'snow',
//     modules: { toolbar: '#toolbar' },
//   })
// })

// 交通方式
interface Traffic {
  type: string
  price: number
  time: string
  stater?: string // 首发
  over?: string // 末班
}

// 一级路程单段路径数据结构
interface Path {
  id: number
  from: string
  to: string
  // time: string // 出行时间
  start?: string // 出发时间
  end?: string // 到达时间
  distance?: number // 两地距离
  content?: string // 内容
  images?: string[]
  notes?: string[]
  traffic?: Traffic[] // 交通选项
}

// // 二级路程单段路径数据结构
// interface SecondPath {
//   id: string
//   from: string
//   to: string
//   time: string
//   distance: number // 两地距离
// }

// ————————创建者初始创建行程
const startPlan = ref(false)
const firstPath = ref<Path[]>([])
// const fromTmp = ref('')
// const toTmp = ref('')
// const startTmp = ref('')
// const endTmp = ref('')
// // const distanceTmp = ref(0)
// // const contentTmp = ref('')
// // const imagesTmp = ref([])
// // const notesTmp = ref([])
// // const trafficTmp = ref([])
// // 创建行程
// const addPath = () => {
//   if (!startPlan.value) {
//     startPlan.value = true
//   }

//   firstPath.value.push({
//     from: fromTmp.value,
//     to: toTmp.value,
//     start: startTmp.value,
//     end: endTmp.value,
//   })
// }

// 生成唯一ID
let nextId = 1

// 添加新的行程段
const addNewPath = () => {
  firstPath.value.push({
    id: nextId++,
    from: '',
    to: '',
    start: '',
    end: '',
  })
}

// 更新行程信息
const updatePathInfo = (index: number, updatedPath: any) => {
  firstPath.value[index] = updatedPath
}

// 删除行程段
const deletePath = (index: number) => {
  firstPath.value.splice(index, 1)
}
</script>

<template>
  <div class="make-plan-container">
    <h1>制定旅游攻略</h1>
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
    <div v-else class="make-each-path-container">
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
// .make-plan-actions button:hover {
//   // background: darken(#4b7452, 8%);
// }
</style>
