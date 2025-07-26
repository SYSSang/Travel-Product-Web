<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import TestItem from './components/TestItem.vue'
import * as Y from 'yjs'
import { yFirstPath } from '@/stores/userYjsStore'

const pathFrom = ref('')

onMounted(() => {
  // 初始化 Y.Map
  if (yFirstPath.length === 0) {
    const map = new Y.Map()
    map.set('from', '')
    yFirstPath.push([map])
  }

  const firstMap = yFirstPath.get(0)

  // 1. 先同步一次初始值
  pathFrom.value = firstMap.get('from') || ''

  // 2. Yjs → Vue
  firstMap.observe(event => {
    if (event.keysChanged.has('from')) {
      pathFrom.value = firstMap.get('from') || ''
    }
  })

  // 3. Vue → Yjs
  watch(pathFrom, newVal => {
    firstMap.set('from', newVal)
  })
})
</script>

<template>
  <div class="">
    父组件同步测试
    <input type="text" v-model="pathFrom" />
    <TestItem></TestItem>
  </div>
</template>
<style lang="scss" scoped></style>
