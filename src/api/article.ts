import { PublishArticle } from '@/types/article'
import { post } from '@/utils/request/http'

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
