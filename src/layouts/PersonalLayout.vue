<!-- 个人中心布局（左侧菜单 + 顶部导航栏） -->
<script lang="ts" setup>
import TopNavBar from '@/components/layout/TopNavBar.vue'
import SideNavBar from '@/components/layout/SideNavBar.vue'
</script>

<template>
  <div class="personal-layout">
    <TopNavBar></TopNavBar>
    <div class="personal-main-container">
      <div class="side-nav-container">
        <SideNavBar></SideNavBar>
      </div>
      <main class="personal-content-container">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.personal-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.personal-main-container {
  flex: 1;
  display: flex;
  overflow: hidden;

  .side-nav-container {
    flex: 1;
  }

  .personal-content-container {
    flex: 6;
    width: 100%;
  }
}
</style>
