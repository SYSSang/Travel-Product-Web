<script lang="ts" setup>
import {
  defineProps,
  defineEmits,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import TrafficEditor from './TrafficEditor.vue'
import * as Y from 'yjs'

const props = defineProps({
  yjsMap: { type: Object, required: true }, // 直接传 Y.Map<any>
  yTrafficArray: {
    type: Object as () => Y.Array<any> | undefined,
    required: false,
  },
})
const emit = defineEmits(['delete'])

const isExpandDetail = ref(false)
const isEditing = ref(false)

const toggleExpand = () => {
  isExpandDetail.value = !isExpandDetail.value
}

// 强制刷新，确保多端同步
const forceUpdate = ref(0)
let observer: any

// 直接协同字段
const from = computed({
  get: () => {
    forceUpdate.value // 建立依赖关系
    return props.yjsMap ? props.yjsMap.get('from') || '' : ''
  },
  set: v => {
    if (props.yjsMap) props.yjsMap.set('from', v)
  },
})
const to = computed({
  get: () => {
    forceUpdate.value // 建立依赖关系
    return props.yjsMap ? props.yjsMap.get('to') || '' : ''
  },
  set: v => {
    if (props.yjsMap) props.yjsMap.set('to', v)
  },
})
const start = computed({
  get: () => {
    forceUpdate.value // 建立依赖关系
    return props.yjsMap ? props.yjsMap.get('start') || '' : ''
  },
  set: v => {
    if (props.yjsMap) props.yjsMap.set('start', v)
  },
})
const end = computed({
  get: () => {
    forceUpdate.value // 建立依赖关系
    return props.yjsMap ? props.yjsMap.get('end') || '' : ''
  },
  set: v => {
    if (props.yjsMap) props.yjsMap.set('end', v)
  },
})
const content = computed({
  get: () => {
    forceUpdate.value // 建立依赖关系
    return props.yjsMap ? props.yjsMap.get('content') || '' : ''
  },
  set: v => {
    if (props.yjsMap) props.yjsMap.set('content', v)
  },
})

onMounted(() => {
  if (props.yjsMap) {
    observer = () => {
      forceUpdate.value++
    }
    props.yjsMap.observe(observer)
  }
})
onBeforeUnmount(() => {
  if (props.yjsMap && observer) {
    props.yjsMap.unobserve(observer)
  }
})
</script>

<template>
  <div class="each-path-item" :class="{ expanded: isExpandDetail }">
    <div class="path-header">
      <div class="path-title-box" @click="toggleExpand">
        <span class="path-title">行程：</span>
        <input
          class="path-title-input"
          type="text"
          v-model="from"
          placeholder="起始点"
        />
        <span class="path-title-arrow">→</span>
        <input
          class="path-title-input"
          type="text"
          v-model="to"
          placeholder="终点"
        />
      </div>
      <div class="path-time-box">
        <span class="path-title">时间：</span>
        <input v-model="start" class="path-time-input" type="date" />
        <span class="path-time-arrow">→</span>
        <input v-model="end" class="path-time-input" type="date" />
      </div>
      <div class="path-actions">
        <button @click="emit('delete')" class="delete-btn" title="删除行程段">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3,6 5,6 21,6"></polyline>
            <path
              d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"
            ></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
        <div class="expand-icon" @click="toggleExpand">
          <svg
            :class="{ rotated: isExpandDetail }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <div class="path-detail-container" v-show="isExpandDetail">
      <div class="path-detail-item">
        <label for="">行程内容</label>
        <textarea
          v-model="content"
          placeholder="请详细描述这段行程的内容，包括景点、活动等..."
          rows="4"
        ></textarea>
      </div>
      <div class="path-detail-item">
        <TrafficEditor
          :modelValue="props.yjsMap.get('traffic')?.toArray() || []"
          :yTrafficArray="yTrafficArray"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.each-path-item {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 2px solid #4b7452;
  transition: all 0.3s ease;
  overflow: hidden;
  &:hover {
    border-color: $second-color;
    // box-shadow: 0 4px 16px rgba(75, 116, 82, 0.1);
  }

  &.expanded {
    border-color: $second-color;
    // box-shadow: 0 6px 24px rgba(75, 116, 82, 0.15);
  }
}

.path-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
}

.path-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  .path-title {
    color: $second-color;
    font-weight: 600;
    font-size: 1rem;
  }

  .path-title-arrow {
    color: $second-color;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .path-title-input {
    background: $second-color;
    color: $second-font-color;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-weight: 500;
    font-size: 0.9rem;
    width: 80px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }
  }
}

.path-title-from,
.path-title-to,
.path-time-start,
.path-time-end {
  background: $second-color;
  color: $second-font-color;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.path-time-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;

  // .path-time-start,
  // .path-time-end {
  //   background: #f0f2f5;
  //   color: $primary-font-color;
  //   padding: 4px 8px;
  //   border-radius: 4px;
  //   font-size: 0.85rem;
  //   font-weight: 500;
  // }

  .path-time-arrow {
    color: $second-color;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .path-time-input {
    // background: #4b7452;
    color: $primary-font-color;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.85rem;
    font-weight: 600;
    width: 130px;
    border: 2px solid #4b7452;
    // color: white;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(75, 116, 82, 0.2);
    }
  }
}

.path-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  .edit-btn {
    background: transparent;
    border: none;
    color: $second-color;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: rgba(75, 116, 82, 0.1);
    }
  }

  .delete-btn {
    background: transparent;
    border: none;
    color: #f44336;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: rgba(244, 67, 54, 0.1);
    }
  }

  .edit-actions {
    display: flex;
    gap: 4px;

    button {
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;

      &.save-edit-btn {
        background: #4caf50;
        color: white;

        &:hover {
          background: #45a049;
        }
      }

      &.cancel-edit-btn {
        background: #f44336;
        color: white;

        &:hover {
          background: #da190b;
        }
      }
    }
  }
}

.expand-icon {
  margin-left: 16px;
  color: $second-color;
  transition: transform 0.3s ease;

  svg {
    transition: transform 0.3s ease;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.path-detail-container {
  border-top: 1px solid #e5e6eb;
  padding: 24px;
  background: #fafbfc;

  .path-detail-item {
    margin-bottom: 20px;

    label {
      display: block;
      color: $second-color;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e6eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
      background: #fff;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: $second-color;
      }

      &::placeholder {
        color: #919191;
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;

    button {
      padding: 8px 20px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      &.save-btn {
        background: $second-color;
        color: $second-font-color;

        &:hover {
          background: darken($second-color, 8%);
        }
      }

      &.cancel-btn {
        background: #f0f2f5;
        color: $primary-font-color;

        &:hover {
          background: #e5e6eb;
        }
      }
    }
  }
}
</style>
