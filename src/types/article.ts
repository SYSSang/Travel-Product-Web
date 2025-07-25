export interface PublishArticle {
  title: string
  content: string
  type?: string
  permission?: string
  cover?: string
  imagesUrl?: string
  mainCity?: string
}

export interface article {
  aid: number
  title: string
  content: string
  publishTime: string
  author: string
  authorID: number
  type?: string
  state?: number
  permission?: string
  cover?: string
  imagesUrl: string
  mainCity: string
  originalEmotionData: string
}
