<script lang="ts" setup>
const props = defineProps<{
  name: string
  emotions: Record<string, number>
}>()

// 需要触发的事件
const emits = defineEmits(['deleteLocation'])

const handleDelete = () => {
  emits('deleteLocation', props.name)
}

// const localName = ref(props.name)
</script>

<template>
  <div class="location-item-container">
    <div class="location-item">
      <div class="location-header">
        <div class="location-name">
          <h3>{{ name }}</h3>
        </div>
        <div class="location-actions">
          <button @click="handleDelete" class="delete-btn">删除</button>
        </div>
      </div>

      <!-- 情绪数据只读展示（不允许编辑） -->
      <div class="emotion-bars">
        <div
          v-for="(value, emotion) in emotions"
          :key="emotion"
          class="emotion-bar"
        >
          <span class="emotion-label">{{ emotion }}</span>
          <div class="bar-container">
            <div class="bar-fill" :style="{ width: value * 100 + '%' }"></div>
          </div>
          <span class="emotion-value">{{ (value * 100).toFixed(1) }}%</span>
        </div>
      </div>
      <!-- <div
      v-for="(location, name) in processData.locationEmotion"
      :key="name"
      class="location-item"
    >
      <div class="location-header">
        <div class="location-name">
          <h3 v-if="editingLocation !== name">{{ name }}</h3>
          <input
            v-else
            v-model="editingLocationName"
            class="location-name-input"
            placeholder="输入地点名称"
          />
        </div>
        <div class="location-actions">
          <button
            v-if="editingLocation !== name"
            @click="startEditLocation(name)"
            class="edit-btn"
          >
            编辑
          </button>
          <button
            v-if="editingLocation !== name"
            @click="deleteLocation(name)"
            class="delete-btn"
          >
            删除
          </button>
          <button
            v-if="editingLocation === name"
            @click="saveLocationEdit(name)"
            class="save-btn"
          >
            保存
          </button>
        </div>
      </div>

      <div class="emotion-bars">
        <div
          v-for="(value, emotion) in location"
          :key="emotion"
          class="emotion-bar"
        >
          <span class="emotion-label">{{ emotion }}</span>
          <div class="bar-container">
            <div class="bar-fill" :style="{ width: value * 100 + '%' }"></div>
          </div>
          <span class="emotion-value">{{ (value * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.location-item,
.image-emotion-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.location-name {
  flex: 1;
  margin-right: 10px;
}

.location-name-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #4b6e4b;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
}

.location-name-input:focus {
  border-color: #7bb47b;
  box-shadow: 0 0 0 2px rgba(75, 110, 75, 0.2);
}

.location-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn,
.save-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.edit-btn {
  background: #4b6e4b;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.save-btn {
  background: #28a745;
  color: white;
}

.location-item h3,
.image-emotion-item h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
}

.emotion-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emotion-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.emotion-label {
  min-width: 40px;
  font-size: 12px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7bb47b, #4b6e4b);
  transition: width 0.3s ease;
}

.emotion-value {
  min-width: 40px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.emotion-slider {
  width: 80px;
}

.slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4b6e4b;
  cursor: pointer;
}
</style>
