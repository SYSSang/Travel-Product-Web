import { post, get } from '@/utils/request/http'

export const predictEmotionMap = (text: string, image_urls?: string) => {
  const data = {
    text: text,
    ...(image_urls && { image_urls: image_urls }),
  }
  console.log(data)
  return post('/api/emotion/emotionmap/predict', data)
}

// 存储制作完成的情绪数据
export function saveEmotionDataApi(
  articleId: string | number,
  emotionData: Record<string, unknown>
) {
  const requestData = {
    articleID: Number(articleId),
    ...emotionData,
  }

  console.log('发送存储情绪数据:', requestData)
  console.log(
    '文章ID类型:',
    typeof requestData.articleID,
    '值:',
    requestData.articleID
  )

  return post('/api/emotion/store', requestData, {
    customAuth: true,
  })
}

// 获取地点坐标 - 调用后端接口
// export function getLocationCoordinates(
//   locationEmotionData: Record<string, Record<string, number>>
// ) {
//   return fetch('http://127.0.0.1:3001/emotionmap/add-locations', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(locationEmotionData),
//   }).then(response => response.json())
// }

// 获取情绪信息
export const getEmotionData = async (aid: string | number) => {
  console.log('获取情绪数据，文章ID:', aid)

  try {
    return await get(`/api/emotion/${aid}`, {
      customAuth: true,
    })
  } catch (err) {
    console.error('获取情绪数据失败', err)
  }
}
