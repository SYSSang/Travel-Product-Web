<script lang="ts" setup>
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/auth')
}
</script>

<template>
  <div class="top-nav">
    <div class="top-logo-box">
      <div class="top-logo-img">
        <img src="../../../public/logo.png" alt="" />
      </div>
      <div class="top-logo-name">旅心绘</div>
    </div>
    <nav class="top-menu">
      <router-link class="top-nav-item" to="/">首页</router-link>
      <span class="top-delimiter"></span>
      <router-link class="top-nav-item" to="/community">社区广场</router-link>
      <span class="top-delimiter"></span>
      <router-link class="top-nav-item" to="/about">关于我们</router-link>
      <span class="top-delimiter"></span>
      <router-link class="top-nav-item" v-if="!userStore.token" to="/auth"
        >登录/注册</router-link
      >
      <div v-else class="">
        <router-link class="top-nav-item" to="/personal">我的</router-link>
        <a class="top-nav-item" @click="logout" style="margin-left: 8px"
          >退出</a
        >
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.top-nav {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 87px;

  .top-logo-box {
    display: flex;
    align-items: center;

    .top-logo-img {
      margin-right: 15px;
    }
  }

  .top-menu > *:not(:last-child) {
    // 你的样式，比如添加分隔符间距
    margin-right: 15px;
  }

  .top-menu {
    display: flex;
    align-items: center;

    .top-nav-item {
      color: #333;
      text-decoration: none;
      font-size: 16px;
      padding: 0 4px;
      transition: color 0.2s;
      &:hover {
        cursor: pointer;
      }
    }
    .top-nav-item.active,
    .top-nav-item:hover {
      color: #4b6e4b;
    }
  }
  .top-delimiter {
    display: inline-block;
    height: 5px;
    width: 10px;
    border-radius: 5px;
    background-color: $second-color;
  }
}
</style>
