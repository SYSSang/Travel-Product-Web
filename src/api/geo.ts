import { get } from '@/utils/request/http'
export const getlocationApi = async (params: { address: string }) => {
  try {
    return await get<{
      lng: number
      lat: number
      formatted_address: string
    }>('/geo/locationinfo', { params, customAuth: true })
  } catch (err) {
    console.error('位置获取失败:', err)
    throw err
  }
}
