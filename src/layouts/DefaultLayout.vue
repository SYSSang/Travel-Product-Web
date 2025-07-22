<!-- 默认布局 -->
<script lang="ts" setup>
import TopNavBar from '@/components/layout/TopNavBar.vue'
</script>

<template>
  <div class="default-layout">
    <TopNavBar></TopNavBar>
    <main class="default-main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.default-main-content {
  flex: 1;
  display: flex;
}
</style>
