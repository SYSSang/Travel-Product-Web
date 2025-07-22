import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as {
      username: String
      token: string
    } | null,
  }),
  actions: {
    setUser(userInfo: { username: string; token: string }) {
      this.userInfo = userInfo
    },
  },
})
