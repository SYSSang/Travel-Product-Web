<!-- 个人左侧导航栏 -->
<script lang="ts" setup></script>

<template>
  <div class="personal-side-nav">
    <nav class="personal-side-menu">
      <router-link
        class="side-menu-item"
        exact-active-class="side-menu-item-active"
        to="/personal"
      >
        <span class="icon">📊</span>
        <span class="text">个人首页</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/tarvel-article-post"
      >
        <span class="icon">📝</span>
        <span class="text">旅行笔记</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/article-manage"
      >
        <span class="icon">📄</span>
        <span class="text">文章管理</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/make-plan"
      >
        <span class="icon">💬</span>
        <span class="text">制定攻略</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/emotion-map-make"
      >
        <span class="icon">🗺️</span>
        <span class="text">足迹地图</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/QA"
      >
        <span class="icon">💬</span>
        <span class="text">问答管理</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/setting"
      >
        <span class="icon">⚙️</span>
        <span class="text">个人设置</span>
      </router-link>
      <router-link
        class="side-menu-item"
        active-class="side-menu-item-active"
        to="/personal/test"
      >
        <span class="icon">🔄</span>
        <span class="text">测试同步</span>
      </router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.personal-side-nav {
  width: 260px;
  padding-top: 32px;
  box-sizing: border-box;
}
.personal-side-menu {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 32px;
  // margin-top: 32px;
}
.side-menu-item {
  display: flex;
  align-items: center;
  padding: 0 0 0 5px;
  height: 45px;
  width: 80%;
  border-radius: 28px;
  color: #355c3a;
  font-size: 16px;
  text-decoration: none;
  gap: 18px;
  transition:
      /* background 0.2s, */ color 0.2s;
  position: relative;
  background: transparent;
  &.side-menu-item-active {
    background: #4b6e4b;
    color: #fff;
  }

  .icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #355c3a;
    border: 2px solid transparent;
    margin-right: 5px;
    transition:
      /* background 0.2s, */ border 0.2s;
  }

  .text {
    font-size: 16px;
    font-weight: 500;
  }

  // &:not(.active):hover {
  //   background: #e6f7ee;
  //   color: #4b6e4b;
  // }
}

// .side-menu-item .side-menu-item .side-menu-item:not(.active):hover .icon {
//   border: 2px solid #4b6e4b;
// }
</style>
