import { get } from '@/utils/request/http'

export const testConnect = async () => {
  const res = await get('/')
  console.log(res)
  return res
}
