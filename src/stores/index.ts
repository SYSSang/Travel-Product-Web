import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    uid: Number(localStorage.getItem('uid')) || 0,
  }),
  actions: {
    // setToken(token: string) {
    //   this.token = token
    //   localStorage.setItem('token', token)
    // },
    setUser(token: string, uid: number) {
      this.token = token
      this.uid = uid
      localStorage.setItem('token', token)
      localStorage.setItem('uid', uid.toString())
    },
    logout() {
      this.token = ''
      this.uid = 0
      localStorage.removeItem('token')
      localStorage.removeItem('uid')
    },
  },
})
