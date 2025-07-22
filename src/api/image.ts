import type { image } from '@/types/images'
import { post } from '@/utils/request/http'

export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  return post<image>('/api/upload/image', formData, {
    customAuth: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
