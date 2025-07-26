// 交通方式
export interface Traffic {
  type: string
  price: number
  time: string
  staterDate?: string
  staterTime?: string
  overDate?: string
  overTime?: string
}

// 一级路程单段路径数据结构
export interface Path {
  id: number
  from: string
  to: string
  // time: string // 出行时间
  start?: string // 出发时间
  end?: string // 到达时间
  distance?: number // 两地距离
  content?: string // 内容
  images?: string[]
  notes?: string[]
  traffic?: Traffic[] // 交通选项
}
