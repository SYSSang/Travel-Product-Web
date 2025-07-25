// axios.d.ts or anywhere globally loaded
import 'axios'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    bypassResponseInterceptor?: boolean
    customAuth?: boolean
  }
}
