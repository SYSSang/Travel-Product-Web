<script lang="ts" setup>
// import { testConnect } from '@/api/test'
import { loginApi, registerApi } from '@/api/auth'
import { useUserStore } from '@/stores'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref<boolean>(true)
const errorMsg = ref<string>('暂时，从后端获取到的报错信息')

const form = ref({
  username: '',
  password: '',
  email: '',
})

// 切换登录/注册
const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  form.value = { username: '', password: '', email: '' }
}

// 登陆注册
const userStore = useUserStore()
const authHandlerSubmit = async () => {
  try {
    if (!isLogin.value) {
      await registerApi({
        username: form.value.username,
        password: form.value.password,
        email: form.value.email,
      })
      alert('注册成功')
      isLogin.value = true
    } else {
      const res = await loginApi({
        username: form.value.username,
        password: form.value.password,
      })
      userStore.setToken(res.token)
      alert('登陆成功')
      router.push('/personal')
    }
  } catch (err) {
    console.error('失败：', err)
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>登录/注册</h2>
      <form @submit.prevent="authHandlerSubmit">
        <input
          v-model="form.username"
          type="text"
          placeholder="用户名"
          required
        />
        <input
          v-model="form.password"
          type="text"
          placeholder="密码"
          required
        />
        <input
          v-if="!isLogin"
          v-model="form.email"
          type="text"
          placeholder="邮箱(可选)"
          required
        />
        <button>{{ isLogin ? '登录' : '注册' }}</button>
      </form>
      <div class="auth-toggle">
        <span>{{ isLogin ? '还没注册？' : '已有账户?' }}</span>
        <span class="auth-toggle-btn" @click="toggleMode">{{
          isLogin ? '注册' : '登录'
        }}</span>
      </div>
      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-container {
  flex: 1;
  position: relative;
}
.auth-box {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 32px 32px 24px 32px;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    margin-bottom: 24px;
    color: #4b6e4b;
  }

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    input {
      padding: 10px 12px;
      border: 1px solid $second-color;
      border-radius: 4px;
      font-size: 16px;
      outline: none;
      transition: border 0.2s;

      &:focus {
        // border-color: #4b6e4b;
        background-color: #4b6e4b10;
      }
    }

    button {
      padding: 10px 0;
      background-color: #4b6e4b;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:disabled {
        background: #bdbdbd;
        cursor: not-allowed;
      }
    }
  }

  .auth-toggle {
    margin-top: 16px;
    color: #888;
    font-size: 14px;
  }
  .auth-toggle-btn {
    color: #4b6e4b;
    margin-left: 4px;
    cursor: pointer;
    text-decoration: underline;
  }

  .error {
    color: #d32f2f;
    margin-top: 12px;
    font-size: 14px;
  }
}
</style>
