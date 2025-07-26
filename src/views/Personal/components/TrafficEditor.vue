<script lang="ts" setup>
import { ref, watch } from 'vue'

// 交通方式选项
const trafficOptions = [
  { value: 'bus', label: '公交' },
  { value: 'subway', label: '地铁' },
  { value: 'lightrail', label: '轻轨' },
  { value: 'highspeed', label: '高铁' },
  { value: 'train', label: '火车' },
  { value: 'plane', label: '飞机' },
  { value: 'bicycle', label: '自行车' },
  { value: 'car', label: '汽车' },
  { value: 'ebike', label: '电瓶车' },
  { value: 'walk', label: '步行' },
]

interface Traffic {
  type: string
  price: number
  time: string
  staterDate?: string
  staterTime?: string
  overDate?: string
  overTime?: string
}

const props = defineProps<{
  modelValue: Traffic[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Traffic[]]
}>()

// 本地交通方式数据
const localTraffic = ref<Traffic[]>([...props.modelValue])

// 监听外部数据变化
watch(
  () => props.modelValue,
  newValue => {
    localTraffic.value = [...newValue]
  },
  { deep: true }
)

// 添加交通方式
const addTraffic = () => {
  localTraffic.value.push({
    type: '',
    price: 0,
    time: '',
    staterDate: '',
    staterTime: '',
    overDate: '',
    overTime: '',
  })
  updateParent()
}

// 删除交通方式
const removeTraffic = (index: number) => {
  localTraffic.value.splice(index, 1)
  updateParent()
}

// 更新交通方式数据
const updateTraffic = (index: number, field: keyof Traffic, value: any) => {
  ;(localTraffic.value[index] as any)[field] = value
  updateParent()
}

// 更新父组件数据
const updateParent = () => {
  emit('update:modelValue', [...localTraffic.value])
}
</script>

<template>
  <div class="traffic-editor">
    <div class="traffic-header">
      <h3>交通方式</h3>
      <button @click="addTraffic" class="add-traffic-btn">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加交通方式
      </button>
    </div>

    <div class="traffic-list">
      <div
        v-for="(traffic, index) in localTraffic"
        :key="index"
        class="traffic-item"
      >
        <div class="traffic-header-row">
          <select
            v-model="traffic.type"
            @change="updateTraffic(index, 'type', traffic.type)"
            class="traffic-type-select"
          >
            <option value="">请选择交通方式</option>
            <option
              v-for="option in trafficOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <button
            @click="removeTraffic(index)"
            class="remove-traffic-btn"
            title="删除此交通方式"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="traffic-fields" v-if="traffic.type">
          <div class="field-group">
            <label>价格 (元)</label>
            <input
              type="number"
              v-model.number="traffic.price"
              @input="updateTraffic(index, 'price', traffic.price)"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div class="field-group">
            <label>出发时间</label>
            <div class="datetime-input">
              <input
                type="date"
                v-model="traffic.staterDate"
                @input="updateTraffic(index, 'staterDate', traffic.staterDate)"
                class="date-input"
              />
              <input
                type="time"
                v-model="traffic.staterTime"
                @input="updateTraffic(index, 'staterTime', traffic.staterTime)"
                class="time-input"
              />
            </div>
          </div>

          <div class="field-group">
            <label>到达时间</label>
            <div class="datetime-input">
              <input
                type="date"
                v-model="traffic.overDate"
                @input="updateTraffic(index, 'overDate', traffic.overDate)"
                class="date-input"
              />
              <input
                type="time"
                v-model="traffic.overTime"
                @input="updateTraffic(index, 'overTime', traffic.overTime)"
                class="time-input"
              />
            </div>
          </div>

          <div class="field-group">
            <label>所需时间</label>
            <input
              type="text"
              v-model="traffic.time"
              @input="updateTraffic(index, 'time', traffic.time)"
              placeholder="如：2小时30分钟"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.traffic-editor {
  .traffic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      color: $second-color;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .add-traffic-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: $second-color;
      color: $second-font-color;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: darken($second-color, 8%);
      }

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }

  .traffic-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .traffic-item {
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    padding: 12px;
    background: #fafbfc;

    .traffic-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .traffic-type-select {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e5e6eb;
        border-radius: 6px;
        font-size: 0.9rem;
        background: #fff;

        &:focus {
          outline: none;
          border-color: $second-color;
        }
      }

      .remove-traffic-btn {
        background: transparent;
        border: none;
        color: #f44336;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        margin-left: 8px;
        transition: all 0.2s;

        &:hover {
          background: rgba(244, 67, 54, 0.1);
        }
      }
    }

    .traffic-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
          color: $second-color;
          font-size: 0.85rem;
          font-weight: 500;
        }

        input {
          padding: 6px 10px;
          border: 1px solid #e5e6eb;
          border-radius: 4px;
          font-size: 0.85rem;
          background: #fff;

          &:focus {
            outline: none;
            border-color: $second-color;
          }

          &::placeholder {
            color: #919191;
          }
        }

        .datetime-input {
          display: flex;
          gap: 8px;

          .date-input {
            flex: 2;
          }

          .time-input {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
