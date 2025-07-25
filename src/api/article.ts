import { article, PublishArticle } from '@/types/article'
import { post, get } from '@/utils/request/http'

// 发布文章
export const pulishArticleApi = async (data: PublishArticle) => {
  try {
    const res = await post<{ aid: number }>(
      '/api/article/publish',
      {
        ...data,
        permission: data.permission ?? 'public',
      },
      { customAuth: true }
    )
    return res
    // console.log(res)
  } catch (err) {
    console.error('上传文章失败', err)
    throw err
  }
}

// 获取文章信息
export const getArticleDetailApi = (aid: number) => {
  try {
    const res = get<article>(`/api/article/detail/${aid}`)
    return res
  } catch (err) {
    console.error('文章获取失败', err)
    throw err
  }
}

// 存储原始情绪数据
export const storeOriginalEmotionDataApi = (
  aid: number,
  originalEmotionData: string
) => {
  const data = {
    aid: aid,
    originalEmotionData: originalEmotionData,
  }
  try {
    const res = post('/api/article/store/emotion', data, { customAuth: true })
    return res
  } catch (err) {
    console.error('存储原始数据失败', err)
    throw err
  }
}
