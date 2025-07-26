<script lang="ts" setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import TrafficEditor from './TrafficEditor.vue'

const props = defineProps({
  pathInfo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:pathInfo', 'delete'])

const isExpandDetail = ref(false)
const isEditing = ref(false)

const toggleExpand = () => {
  isExpandDetail.value = !isExpandDetail.value
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

// 本地编辑数据
const localPathInfo = ref<any>({
  ...props.pathInfo,
  traffic: props.pathInfo.traffic || [],
})

// 更新父组件数据
const updatePathInfo = (field: string, value: any) => {
  localPathInfo.value[field] = value
  emit('update:pathInfo', { ...localPathInfo.value })
}

// 保存编辑
const saveEdit = () => {
  emit('update:pathInfo', { ...localPathInfo.value })
  isEditing.value = false
}

// 取消编辑
const cancelEdit = () => {
  localPathInfo.value = { ...props.pathInfo }
  isEditing.value = false
}
</script>

<template>
  <div class="each-path-item" :class="{ expanded: isExpandDetail }">
    <div class="path-header">
      <div class="path-title-box" @click="toggleExpand">
        <span class="path-title">行程：</span>
        <div v-if="!isEditing" class="path-title-from">
          {{ localPathInfo.from || '未设置' }}
        </div>
        <input
          v-else
          v-model="localPathInfo.from"
          @input="updatePathInfo('from', localPathInfo.from)"
          class="path-title-input"
          placeholder="起始点"
        />
        <span class="path-title-arrow">→</span>
        <div v-if="!isEditing" class="path-title-to">
          {{ localPathInfo.to || '未设置' }}
        </div>
        <input
          v-else
          v-model="localPathInfo.to"
          @input="updatePathInfo('to', localPathInfo.to)"
          class="path-title-input"
          placeholder="终点"
        />
      </div>
      <div class="path-time-box">
        <span class="path-title">时间：</span>
        <div v-if="!isEditing" class="path-time-start">
          {{ localPathInfo.start || '未设置' }}
        </div>
        <input
          v-else
          v-model="localPathInfo.start"
          @input="updatePathInfo('start', localPathInfo.start)"
          class="path-time-input"
          type="date"
        />
        <span class="path-time-arrow">→</span>
        <div v-if="!isEditing" class="path-time-end">
          {{ localPathInfo.end || '未设置' }}
        </div>
        <input
          v-else
          v-model="localPathInfo.end"
          @input="updatePathInfo('end', localPathInfo.end)"
          class="path-time-input"
          type="date"
        />
      </div>
      <div class="path-actions">
        <button
          v-if="!isEditing"
          @click="toggleEdit"
          class="edit-btn"
          title="编辑"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            ></path>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <div v-else class="edit-actions">
          <button @click="saveEdit" class="save-edit-btn">✓</button>
          <button @click="cancelEdit" class="cancel-edit-btn">✗</button>
        </div>
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
          placeholder="请详细描述这段行程的内容，包括景点、活动等..."
          rows="4"
        ></textarea>
      </div>
      <div class="path-detail-item">
        <TrafficEditor
          v-model="localPathInfo.traffic"
          @update:modelValue="traffic => updatePathInfo('traffic', traffic)"
        />
      </div>
      <div class="detail-actions">
        <button class="save-btn">保存</button>
        <button class="cancel-btn">取消</button>
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
    color: #919191;
    font-size: 0.9rem;
  }

  .path-time-input {
    background: #f0f2f5;
    color: $primary-font-color;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.85rem;
    font-weight: 500;
    width: 120px;

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
