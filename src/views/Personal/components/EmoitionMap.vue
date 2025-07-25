<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getEmotionData } from '@/api/emotionMap'
// import { getArticleContent } from '@/api/article'
// const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
// const AMAP_SECURITY = import.meta.env.VITE_AMAP_SECURITY

// 高德地图类型定义
declare global {
  interface Window {
    AMap: any
    _AMapSecurityConfig: {
      securityJsCode: string
    }
  }
}

// 情绪数据接口
interface EmotionData {
  id: number
  location: [number, number]
  emotions: Array<{
    type: string
    intensity: number
    label: string
  }>
  description: string
  timestamp: string
}

// 后端返回的情绪数据结构
// mainCity数据结构
interface MainCityData {
  cityName: string
  lng: number
  lat: number
  formatted_address: string
}

interface BackendEmotionData {
  articleID: number
  textEmotion: {
    mainEmotion: string
    probability: number
    distribution: Record<string, number>
  }
  locationEmotion: Record<string, Record<string, number>>
  imageEmotion: Record<string, number>[]
  fusionEmotion: {
    dominant: string
  }
  mainCity: MainCityData
}

// 定义props
interface Props {
  articleId: string | number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
})

// 定义情绪类型
const emotionTypes = ref([
  { type: 'happy', label: '高兴', color: '#FF6B6B', emoji: '😊' },
  { type: 'sad', label: '伤心', color: '#4ECDC4', emoji: '😭' },
  { type: 'angry', label: '愤怒', color: '#45B7D1', emoji: '😡' },
  { type: 'excited', label: '兴奋', color: '#96CEB4', emoji: '🤯' },
  { type: 'calm', label: '平静', color: '#FFEAA7', emoji: '🧐' },
  { type: 'fear', label: '恐惧', color: '#A8E6CF', emoji: '😱' },
  { type: 'disgust', label: '厌恶', color: '#FFB347', emoji: '🤢' },
])

const selectedEmotion = ref('all')
const map = ref<any>(null)
const markers = ref<any[]>([])
const loading = ref(false)
const mapError = ref(false)
const emotionData = ref<BackendEmotionData | null>(null)
const mainCityData = ref<MainCityData | null>(null)
const isFullscreen = ref(false)
const currentPolygons = ref<any[]>([])
const districtSearch = ref<any>(null)

// 选择情绪类型
const selectEmotion = (emotionType: string) => {
  selectedEmotion.value = emotionType
  updateMarkers()
}

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  // 通知父组件全屏状态变化
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  // 延迟执行地图重新渲染，确保DOM更新完成
  setTimeout(() => {
    if (map.value) {
      map.value.setFitView()
    }
  }, 100)
}

// 聚焦到指定省份
const focusOnProvince = (provinceName: string) => {
  if (!map.value || !districtSearch.value) {
    console.error('地图或DistrictSearch未初始化')
    return
  }

  console.log(`正在聚焦到省份: ${provinceName}`)

  // 清除旧的多边形
  if (currentPolygons.value.length > 0) {
    currentPolygons.value.forEach(polygon => {
      map.value.remove(polygon)
    })
    currentPolygons.value = []
  }

  // DistrictSearch查询省份边界
  districtSearch.value.search(provinceName, (status: string, result: any) => {
    if (status === 'complete') {
      const bounds = result.districtList[0].boundaries
      const center = result.districtList[0].center

      // 绘制省份边界（半透明填充，不影响底图样式）
      bounds.forEach((boundary: any) => {
        const polygon = new window.AMap.Polygon({
          path: boundary,
          strokeColor: '#3366FF', // 边界线颜色
          strokeWeight: 2,
          fillColor: 'rgba(204, 243, 255, 0.3)', // 半透明填充
          fillOpacity: 0.3,
        })
        polygon.setMap(map.value)
        currentPolygons.value.push(polygon)
      })

      // 调整视野并保持自定义样式
      map.value.setFitView()
      map.value.setCenter(center)

      console.log(`已聚焦到 ${provinceName}`)
    } else {
      console.error('DistrictSearch 查询失败:', status)
    }
  })
}

// 清除省份边界
const clearProvinceBoundary = () => {
  if (currentPolygons.value.length > 0) {
    currentPolygons.value.forEach(polygon => {
      map.value?.remove(polygon)
    })
    currentPolygons.value = []
    console.log('已清除省份边界')
  }
}

// // 获取文章内容并提取mainCity ——>已经在emotion_maps里增加了mainCity字段
// const fetchArticleContent = async () => {
//   try {
//     console.log('EmotionMap 开始获取文章内容，文章ID:', props.articleId)
//     const response = await getArticleContent(props.articleId)
//     console.log('获取到的文章内容:', response)

//     // 提取mainCity字段
//     if (response && (response as any).mainCity) {
//       try {
//         const parsedMainCity = JSON.parse((response as any).mainCity)
//         mainCityData.value = parsedMainCity
//         console.log('解析后的mainCity数据:', mainCityData.value)
//       } catch (parseError) {
//         console.error('解析mainCity数据失败:', parseError)
//       }
//     } else {
//       console.log('文章中没有mainCity字段或字段为空')
//     }
//   } catch (error) {
//     console.error('获取文章内容失败:', error)
//   }
// }

// 从地址中提取省份名称
const extractProvinceFromAddress = (address: string): string | null => {
  const provincePatterns = [
    /^(.+?省)/,
    /^(.+?自治区)/,
    /^(.+?特别行政区)/,
    /^(.+?市)/, // 直辖市
  ]

  for (const pattern of provincePatterns) {
    const match = address.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

// ——————————获取存储在数据库中制作完成的情绪数据
const fetchEmotionData = async () => {
  try {
    console.log('EmotionMap 开始获取情绪数据，文章ID:', props.articleId)
    const response = await getEmotionData(props.articleId)
    console.log('获取到的情绪数据:', response)

    emotionData.value = response as BackendEmotionData

    const parsedMainCity = JSON.parse((response as any).mainCity)
    mainCityData.value = parsedMainCity

    // 打印locationEmotion的详细信息
    if (emotionData.value && emotionData.value.locationEmotion) {
      console.log('locationEmotion数据详情:')
      Object.keys(emotionData.value.locationEmotion).forEach(locationName => {
        const locationData = emotionData.value!.locationEmotion[locationName]
        console.log(`${locationName}:`, locationData)
      })
    }

    // 如果地图已经初始化，立即加载数据
    if (map.value) {
      loadEmotionData()
    }
  } catch (error) {
    console.error('获取情绪数据失败:', error)
    mapError.value = true
  }
}

// ————————————生成地图

// 创建情绪SVG图标，这里是根据强度调整透明度，强度越高越不透明
const createEmotionSVG = (color: string, intensity: number, emoji: string) => {
  const size = Math.max(20, Math.min(40, 20 + intensity * 30))
  const opacity = 0.4 + intensity * 0.6

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" opacity="${opacity}" stroke="white" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" font-size="${size * 0.6}" font-family="Arial, sans-serif">${emoji}</text>
    </svg>
  `)}`
}

// 创建情绪图标
const createEmotionIcon = (color: string, intensity: number, emoji: string) => {
  // 根据情绪强度调整图标大小，最小20px，最大40px
  const size = Math.max(20, Math.min(40, 20 + intensity * 30))
  return new window.AMap.Icon({
    size: new window.AMap.Size(size, size),
    image: createEmotionSVG(color, intensity, emoji),
    imageSize: new window.AMap.Size(size, size),
  })
}

// 初始化地图
const initMap = () => {
  // 检查高德地图API是否已加载
  if (typeof window.AMap === 'undefined') {
    console.error('高德地图API未加载')
    loading.value = false
    mapError.value = true
    return
  }

  try {
    // 确定地图中心点
    let centerPoint: [number, number] = [116.397428, 39.90923] // 默认北京中心点
    let zoomLevel = 5 // 默认缩放级别

    if (mainCityData.value) {
      centerPoint = [mainCityData.value.lng, mainCityData.value.lat]
      zoomLevel = 8 // 城市级别缩放
      console.log('使用mainCity坐标作为地图中心:', centerPoint)
    } else {
      console.log('使用默认坐标作为地图中心:', centerPoint)
    }

    // 创建地图实例
    map.value = new window.AMap.Map('emotion-map', {
      zoom: zoomLevel, // 根据是否有mainCity调整缩放级别
      center: centerPoint, // 使用mainCity坐标或默认坐标
      viewMode: '2D',
      mapStyle: 'amap://styles/c6eece96182c0dff4bae73c2fd57d122', // 自定义样式
      showIndoorMap: false, // 关闭室内地图
      expandZoomRange: true, // 扩展缩放范围
    })

    // 初始化DistrictSearch
    districtSearch.value = new window.AMap.DistrictSearch({
      level: 'province',
      showbiz: false,
      extensions: 'all',
    })

    // 地图加载完成事件
    map.value.on('complete', () => {
      loading.value = false
      console.log('地图和自定义样式已加载完成')

      // 如果已经有情绪数据，立即加载
      if (emotionData.value) {
        loadEmotionData()
      }

      // 如果有mainCity数据，自动聚焦到对应区域
      if (mainCityData.value && mainCityData.value.formatted_address) {
        const provinceName = extractProvinceFromAddress(
          mainCityData.value.formatted_address
        )
        if (provinceName) {
          console.log('自动聚焦到省份:', provinceName)
          setTimeout(() => {
            focusOnProvince(provinceName)
          }, 500) // 延迟500ms执行，确保地图完全加载
        }
      }
    })

    // 添加常用控件
    map.value.addControl(new window.AMap.Scale())
    map.value.addControl(
      new window.AMap.ToolBar({
        position: 'RB', // 右下角
      })
    )
    map.value.addControl(
      new window.AMap.MapType({
        defaultType: 0, // 默认显示普通地图
        showRoad: true,
      })
    )

    // 错误处理
    map.value.on('error', (e: unknown) => {
      console.error('地图错误:', e)
      loading.value = false
      mapError.value = true
    })
  } catch (error) {
    console.error('地图初始化失败:', error)
    loading.value = false
    mapError.value = true
  }
}

// 加载情绪数据到地图
const loadEmotionData = async () => {
  if (!emotionData.value || !map.value) {
    console.log('缺少情绪数据或地图未初始化')
    return
  }

  try {
    console.log('开始加载情绪数据到地图:', emotionData.value)

    // 转换后端数据为地图标记数据
    const mapMarkers: EmotionData[] = []

    // 遍历locationEmotion，创建地图标记
    Object.keys(emotionData.value.locationEmotion).forEach(
      (locationName, index) => {
        const locationData = emotionData.value!.locationEmotion[locationName]

        // 检查是否有坐标信息
        if (locationData.lng && locationData.lat) {
          // 收集所有情绪概率>=0.1的情绪
          const emotions: Array<{
            type: string
            intensity: number
            label: string
          }> = []

          Object.keys(locationData).forEach(emotion => {
            if (
              emotion !== 'lng' &&
              emotion !== 'lat' &&
              emotion !== 'formatted_address'
            ) {
              const intensity = locationData[emotion] as number
              if (intensity >= 0.1) {
                // 将中文情绪名称映射到英文
                const emotionMapping: Record<string, string> = {
                  高兴: 'happy',
                  愤怒: 'angry',
                  悲伤: 'sad',
                  伤心: 'sad',
                  中性: 'calm',
                  恐惧: 'fear',
                  惊讶: 'excited',
                  厌恶: 'disgust',
                }

                const mappedEmotion = emotionMapping[emotion] || 'calm'
                const emotionType = emotionTypes.value.find(
                  e => e.type === mappedEmotion
                )

                emotions.push({
                  type: mappedEmotion,
                  intensity: intensity,
                  label: emotionType ? emotionType.emoji : emotion,
                })
              }
            }
          })

          // 按强度排序，强度高的在前
          emotions.sort((a, b) => b.intensity - a.intensity)

          if (emotions.length > 0) {
            // 生成描述信息
            const emotionDescriptions = emotions
              .map(e => `${e.label}(${(e.intensity * 100).toFixed(1)}%)`)
              .join(', ')
            const description = `${locationName}: ${emotionDescriptions}`

            console.log(`地点 ${locationName} 的情绪标签:`, emotions)
            console.log(`地点 ${locationName} 的描述:`, description)

            mapMarkers.push({
              id: index + 1,
              location: [locationData.lng, locationData.lat] as [
                number,
                number,
              ],
              emotions: emotions,
              description: description,
              timestamp: new Date().toLocaleString(),
            })
          }
        }
      }
    )

    console.log('转换后的地图标记数据:', mapMarkers)

    // 添加标记到地图
    addMarkersToMap(mapMarkers)

    // 如果有标记，调整地图视野
    if (mapMarkers.length > 0) {
      map.value.setFitView()
    }
  } catch (error) {
    console.error('加载情绪数据到地图失败:', error)
    mapError.value = true
  }
}

// 添加标记到地图
const addMarkersToMap = (data: EmotionData[]) => {
  // 清除现有标记
  clearMarkers()

  data.forEach(item => {
    // 使用主导情绪（强度最高的）来创建图标
    const dominantEmotion = item.emotions[0]
    const emotionType = emotionTypes.value.find(
      e => e.type === dominantEmotion.type
    )

    if (!emotionType) {
      console.warn('未找到对应的情绪类型:', dominantEmotion.type)
      return
    }

    const marker = new window.AMap.Marker({
      position: item.location,
      icon: createEmotionIcon(
        emotionType.color,
        dominantEmotion.intensity,
        emotionType.emoji
      ),
      title: item.description,
    })

    // 创建多情绪信息窗口内容
    const emotionInfoHtml = item.emotions
      .map(emotion => {
        const emotionType = emotionTypes.value.find(
          e => e.type === emotion.type
        )
        const color = emotionType ? emotionType.color : '#999'
        const emoji = emotionType ? emotionType.emoji : ''
        return `
          <div class="emotion-item">
            <span class="emotion-label" style="color: ${color}">${emoji} ${emotion.label}</span>
            <span class="emotion-intensity">${(emotion.intensity * 100).toFixed(1)}%</span>
            <div class="intensity-bar">
              <div class="intensity-fill" style="width: ${emotion.intensity * 100}%; background-color: ${color}"></div>
            </div>
          </div>
        `
      })
      .join('')

    // 添加信息窗口
    const infoWindow = new window.AMap.InfoWindow({
      content: `
        <div class="emotion-info">
          <h4>${item.description.split(':')[0]}</h4>
          <div class="emotions-list">
            ${emotionInfoHtml}
          </div>
          <p class="time">${item.timestamp}</p>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30),
    })

    marker.on('click', () => {
      infoWindow.open(map.value, marker.getPosition())
    })

    markers.value.push(marker)
    map.value.add(marker)
  })

  // 调整地图视野以包含所有标记
  if (markers.value.length > 0) {
    map.value.setFitView()
  }
}

// 更新标记显示
const updateMarkers = () => {
  markers.value.forEach(marker => {
    if (selectedEmotion.value === 'all') {
      marker.show()
    } else {
      // 根据标记的情绪类型来显示/隐藏
      // 这里需要从标记的title中提取情绪信息来判断
      const title = marker.getTitle()
      const emotionType = emotionTypes.value.find(
        e => e.type === selectedEmotion.value
      )
      if (emotionType && title.includes(emotionType.label)) {
        marker.show()
      } else {
        marker.hide()
      }
    }
  })
}

// 清除标记
const clearMarkers = () => {
  markers.value.forEach(marker => {
    map.value?.remove(marker)
  })
  markers.value = []
}

// 组件挂载时初始化地图
onMounted(async () => {
  loading.value = true

  // 设置高德地图安全配置
  window._AMapSecurityConfig = {
    securityJsCode: 'a373a0c8e8b11a41774cdecc336d59fd',
  }

  // 添加ESC键监听
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isFullscreen.value) {
      toggleFullscreen()
    }
  }
  document.addEventListener('keydown', handleKeydown)

  // 动态加载高德地图API
  const script = document.createElement('script')
  script.src = `https://webapi.amap.com/maps?v=2.0&key=5266d7e614a671e35e5eae861bc56ddd&plugin=AMap.DistrictSearch`
  script.onload = () => {
    // 加载UI组件库
    const uiScript = document.createElement('script')
    uiScript.src = 'https://webapi.amap.com/ui/1.1/main.js'
    uiScript.onload = async () => {
      // UI组件加载完成后，先获取文章内容，再初始化地图
      //   await fetchArticleContent()

      await fetchEmotionData()
      initMap()
      // 获取情绪数据
    }
    uiScript.onerror = async () => {
      console.warn('UI组件库加载失败，使用基础地图功能')
      //   await fetchArticleContent()
      await fetchEmotionData()

      initMap()
      // 获取情绪数据
    }
    document.head.appendChild(uiScript)
  }
  script.onerror = () => {
    console.error('高德地图API加载失败')
    loading.value = false
    mapError.value = true
  }
  document.head.appendChild(script)

  // 备用加载方案 - 10秒超时检测
  setTimeout(() => {
    if (!window.AMap) {
      console.error('高德地图API加载超时')
      loading.value = false
      mapError.value = true
    }
  }, 10000)

  // 组件卸载时清理事件监听
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    if (map.value) {
      map.value.destroy()
    }
    // 确保退出全屏
    if (isFullscreen.value) {
      document.body.style.overflow = ''
    }
  })
})

// 监听文章ID变化
watch(
  () => props.articleId,
  async newArticleId => {
    console.log('EmotionMap 接收到文章ID:', newArticleId)
    console.log('文章ID类型:', typeof newArticleId)

    // 重新获取文章内容和情绪数据
    // await fetchArticleContent()
    await fetchEmotionData()

    // 如果地图已经初始化，重新设置中心点和聚焦
    if (map.value) {
      if (mainCityData.value) {
        const newCenter = [mainCityData.value.lng, mainCityData.value.lat]
        map.value.setCenter(newCenter)
        map.value.setZoom(8) // 设置城市级别缩放
        console.log('地图中心已更新为:', newCenter)

        // 重新聚焦到mainCity所在省份
        if (mainCityData.value.formatted_address) {
          const provinceName = extractProvinceFromAddress(
            mainCityData.value.formatted_address
          )
          if (provinceName) {
            console.log('重新聚焦到省份:', provinceName)
            setTimeout(() => {
              focusOnProvince(provinceName)
            }, 500)
          }
        }
      } else {
        // 如果没有mainCity数据，重置到默认视图
        map.value.setCenter([116.397428, 39.90923])
        map.value.setZoom(5)
        clearProvinceBoundary()
      }
    }
  },
  { immediate: true }
)

// 重新加载地图
const retryLoadMap = async () => {
  mapError.value = false
  loading.value = true

  // 重新获取文章内容和情绪数据
  //   await fetchArticleContent()
  await fetchEmotionData()

  // 如果地图已存在，销毁后重新创建
  if (map.value) {
    map.value.destroy()
    map.value = null
  }

  // 重新初始化地图
  initMap()
}
</script>

<template>
  <div :class="['emotion-map-container', { fullscreen: isFullscreen }]">
    <div class="map-header">
      <h3 class="map-title">情绪地图</h3>
      <p class="map-debug">文章ID: {{ articleId }}</p>
      <div v-if="mainCityData" class="main-city-info">
        <p class="city-summary">
          主要城市: {{ mainCityData.cityName }} | 地址:
          {{ mainCityData.formatted_address }}
        </p>
      </div>
      <div v-if="emotionData" class="emotion-info">
        <p class="emotion-summary">
          主导情绪: {{ emotionData.fusionEmotion.dominant }} | 地点数量:
          {{ Object.keys(emotionData.locationEmotion).length }}个
        </p>
      </div>
      <div class="map-controls">
        <button
          :class="['emotion-btn', { active: selectedEmotion === 'all' }]"
          @click="selectEmotion('all')"
        >
          全部
        </button>
        <button
          v-for="emotion in emotionTypes"
          :key="emotion.type"
          :class="['emotion-btn', { active: selectedEmotion === emotion.type }]"
          @click="selectEmotion(emotion.type)"
        >
          {{ emotion.emoji }} {{ emotion.label }}
        </button>
        <button @click="toggleFullscreen" class="fullscreen-btn">
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>
      </div>
    </div>

    <div id="emotion-map" class="map-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="map-loading">
        <div class="loading-spinner"></div>
        <p>正在加载地图和情绪数据...</p>
      </div>

      <!-- 错误状态 -->
      <div v-if="mapError" class="map-error">
        <p>地图加载失败，请刷新页面重试</p>
        <button @click="retryLoadMap" class="retry-btn">重新加载</button>
      </div>
    </div>

    <div class="map-legend">
      <div
        class="legend-item"
        v-for="emotion in emotionTypes"
        :key="emotion.type"
      >
        <span
          class="legend-color"
          :style="{ backgroundColor: emotion.color }"
        ></span>
        <span class="legend-label"
          >{{ emotion.emoji }} {{ emotion.label }}</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.emotion-map-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.emotion-map-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
  box-shadow: none;
}

.emotion-map-container.fullscreen .map-container {
  height: calc(100vh - 120px) !important;
}

.emotion-map-container.fullscreen .map-header {
  padding: 12px 16px;
}

.emotion-map-container.fullscreen .map-legend {
  padding: 8px 16px;
}

.map-header {
  padding: 16px;
  /* background: linear-gradient(135deg, #4b7452 0%, #34583a 100%); */
  background-color: #4b7452;
  color: white;
}

.map-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
}

.map-debug {
  margin: 0 0 8px 0;
  font-size: 12px;
  opacity: 0.8;
}

.main-city-info {
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.city-summary {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.emotion-info {
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.emotion-summary {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.map-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.emotion-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.emotion-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.emotion-btn.active {
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.map-container {
  width: 100%;
  height: v-bind(height);
  position: relative;
}

.map-legend {
  padding: 12px 16px;
  background: #f8f9fa;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid #e9ecef;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #dee2e6;
}

.legend-label {
  font-weight: 500;
}

/* 信息窗口样式 */
:deep(.emotion-info) {
  padding: 8px;
  min-width: 200px;
}

:deep(.emotion-info h4) {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
}

:deep(.emotions-list) {
  margin: 8px 0;
}

:deep(.emotion-item) {
  margin: 6px 0;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

:deep(.emotion-item:last-child) {
  border-bottom: none;
}

:deep(.emotion-label) {
  font-weight: 500;
  font-size: 12px;
  margin-right: 8px;
}

:deep(.emotion-intensity) {
  font-size: 11px;
  color: #666;
}

:deep(.intensity-bar) {
  width: 100%;
  height: 3px;
  background: #e9ecef;
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

:deep(.intensity-fill) {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

:deep(.emotion-info p) {
  margin: 4px 0;
  color: #666;
  font-size: 12px;
}

:deep(.emotion-info .time) {
  color: #999;
  font-size: 11px;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #4ecdc4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.map-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.retry-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  margin-top: 20px;
}

.retry-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-1px);
}

.fullscreen-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  margin-left: auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.5);
}

.fullscreen-btn:active {
  transform: translateY(0);
}
</style>
