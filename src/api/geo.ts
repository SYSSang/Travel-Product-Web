import { get, post } from '@/utils/request/http'

// 获取单个地点坐标信息
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

// 给地点情绪添加地点信息
export const getEmotionLocationGeoApi = async (
  locationEmotionData: Record<string, Record<string, number>>
) => {
  try {
    const res = await post<{
      status: number
      data: Record<string, Record<string, number>>
      statistics: Record<string, number>
    }>('/geo/emotionmap/add-locations', locationEmotionData, {
      customAuth: true,
      bypassResponseInterceptor: true,
    })

    console.log(res)
    return res
  } catch (err) {
    console.error('情绪地点获取失败', err)
  }
}
