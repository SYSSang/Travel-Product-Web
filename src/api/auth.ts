import { post } from '@/utils/request/http'

// 注册接口
export const registerApi = (data: {
  username: string
  password: string
  email: string
}) => {
  return post('/api/user/register', data)
}

// 登录接口
export const loginApi = (data: {
  username: string
  password: string
}): Promise<{
  token: string
  user: Record<string, string | number>
}> => {
  return post('/api/user/login', data)
}
