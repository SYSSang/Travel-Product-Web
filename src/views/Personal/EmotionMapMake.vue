<script lang="ts" setup>
import { getArticleDetailApi } from '@/api/article'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmotionLocationItem from './components/EmotionLocationItem.vue'
import { getEmotionLocationGeoApi } from '@/api/geo'
import { saveEmotionDataApi } from '@/api/emotionMap'
import EmoitionMap from './components/EmoitionMap.vue'

interface ProcessData {
  textEmotion: {
    mainEmotion: string
    probability: number
    distribution: Record<string, number>
  }
  locationEmotion: Record<string, Record<string, number>>
  imageEmotion: Record<string, number>[] | null
  fusionEmotion: {
    distribution: {
      sadness: number
      anger: number
      happiness: number
      neutral: number
    }
    dominant: string
    weightInfo: string
  }
}
interface LocationData {
  [key: string]:
    | number
    | {
        lng: number
        lat: number
        formatted_address: string
      }
    | undefined
  location?: {
    lng: number
    lat: number
    formatted_address: string
  }
}
const route = useRoute()

const showEmotionMap = ref(false)

// ————接收路由查询参数传递过来的数据
// 查询文章的原始情绪数据和主要城市
// 计算是否开始能够编辑
const aid = ref<number | null>(null)
const mainCity = ref<{
  lat: number
  lng: number
  formatted_address: string
} | null>(null)
// const isEditEmotionData = ref(false)
const originEmotionData = ref<Record<string, unknown> | null>(null)
const processData = ref<ProcessData | null>(null)

onMounted(() => {
  aid.value = Number(route.query.articleID)
  console.log(aid.value)

  if (aid) {
    getArticleDetail(Number(aid.value))
  }
})

const getArticleDetail = async (aid: number) => {
  try {
    const res = await getArticleDetailApi(Number(aid))
    console.log(res)
    originEmotionData.value = JSON.parse(res.originalEmotionData)
    mainCity.value = JSON.parse(res.mainCity)

    // 数据分类和清理
    if (originEmotionData.value && mainCity.value) {
      processData.value = processDataHandler(originEmotionData.value)
      console.log(processData.value)
      console.log(mainCity.value)
    }
  } catch (err) {
    console.error('获取文章信息失败：', err)
  }
}

// ——————————结构化原始数据

const processDataHandler = (rawData: Record<string, unknown>) => {
  const textEmotion = {
    mainEmotion: (rawData['文本整体情绪'] as any)['主要情绪'],
    probability: (rawData['文本整体情绪'] as any)['概率'],
    distribution: (rawData['文本整体情绪'] as any)['完整分布'],
  }

  // 获取 mainCity 的 formatted_address（从父组件传入或通过参数传递）
  const formattedAddress = mainCity.value?.formatted_address || ''

  // 处理地点情绪（重点修改部分）
  const locationEmotion: Record<string, Record<string, number>> = {}
  Object.keys(rawData['地点情绪'] as Record<string, unknown>).forEach(
    location => {
      const cleanLocation = location.replace(/\\n/g, '').trim()
      if (cleanLocation && cleanLocation !== '') {
        // 为地点名称添加前缀（如果有 formattedAddress）
        const fullLocationName = formattedAddress
          ? `${formattedAddress}${cleanLocation}`
          : cleanLocation

        locationEmotion[fullLocationName] = (rawData['地点情绪'] as any)[
          location
        ] as Record<string, number>
      }
    }
  )

  const imageEmotion = rawData['图像情绪'] as Record<string, number>[]

  const fusionDistribution = {
    sadness: Number((rawData['融合情绪'] as any)['悲伤']) || 0,
    anger: Number((rawData['融合情绪'] as any)['愤怒']) || 0,
    happiness: Number((rawData['融合情绪'] as any)['高兴']) || 0,
    neutral: Number((rawData['融合情绪'] as any)['中性']) || 0,
    fear: Number((rawData['融合情绪'] as any)['恐惧']) || 0,
    surprise: Number((rawData['融合情绪'] as any)['惊讶']) || 0,
    disgust: Number((rawData['融合情绪'] as any)['厌恶']) || 0,
  }

  // 计算占比最高的情绪
  let dominantEmotion = ''
  let maxValue = -1
  // 遍历分布中的所有情绪，找出最大值对应的情绪
  Object.entries(fusionDistribution).forEach(([emotion, value]) => {
    if (value > maxValue) {
      maxValue = value
      dominantEmotion = emotion
    }
  })

  if (maxValue === 0) {
    dominantEmotion = 'neutral'
  }

  const fusionEmotion = {
    distribution: fusionDistribution,
    dominant: dominantEmotion,
    weightInfo: (rawData as any)['权重说明'] || '',
  }

  return {
    textEmotion,
    locationEmotion,
    imageEmotion,
    fusionEmotion,
  }
}

// ———————编辑地点情绪功能
// 处理地点删除
// const handleDeleteLocation = (locationName: string) => {
//   if (!processData.value) return

//   // 添加确认提示，防止误操作
//   if (confirm(`确定要删除“${locationName}”的情绪数据吗？`)) {
//     // 从对象中删除该地点
//     delete processData.value.locationEmotion[locationName]
//   }
// }
const failedLocations = ref<string[]>([])
const locationResults = ref<Record<string, LocationData>>({})

// 删除地点情绪
const handleDeleteLocation = (locationName: string) => {
  if (processData.value) {
    delete processData.value.locationEmotion[locationName]

    // 如果删除的是失败的地点，从失败列表中移除
    if (failedLocations.value.includes(locationName)) {
      failedLocations.value = failedLocations.value.filter(
        name => name !== locationName
      )
      console.log('从失败列表中移除地点:', locationName)
    }

    // 如果删除的是已获取坐标的地点，从结果中移除
    if (locationResults.value[locationName]) {
      delete locationResults.value[locationName]
      console.log('从坐标结果中移除地点:', locationName)
    }

    console.log('删除地点:', locationName)
    console.log('失败地点数量:', failedLocations.value.length)
    console.log(
      '当前成功获取坐标地点数量:',
      Object.keys(locationResults.value).length
    )
  }
}

// ——————获取地点情绪的地点信息
// const editingLocation = ref<string | null>(null)
// const editingLocationName = ref<string>('')
const isGettingLocations = ref(false)
const isSavingEmotion = ref(false)
const showGenerateMap = ref(false)
const showLocationConfirm = ref(false)
// 获取地点坐标
const fetchLocationCoordinates = async () => {
  if (!processData.value) return

  isGettingLocations.value = true
  failedLocations.value = []

  try {
    const response = await getEmotionLocationGeoApi(
      processData.value.locationEmotion
    )
    console.log('获取地点坐标结果:', response)

    if (response && response.status === 1) {
      locationResults.value = response.data as Record<string, LocationData>

      // 检查失败的地点 - 检查 location 是否为 null 或不存在
      const failedCount = response.statistics.failed

      if (failedCount > 0) {
        console.log(1)
        // 找出失败的地点 - 检查 location 是否为 null 或不存在
        const allLocations = Object.keys(processData.value.locationEmotion)
        failedLocations.value = allLocations.filter(location => {
          const locationData = response.data[location]
          return (
            !locationData ||
            !locationData.location ||
            locationData.location === null
          )
        })
        console.log(failedLocations.value)
      } else {
        console.log('所有地点坐标获取成功，可以开始生成地图')
      }
    }
  } catch (error) {
    console.error('获取地点坐标失败:', error)
    // 如果完全失败，将所有地点标记为失败
    failedLocations.value = Object.keys(processData.value.locationEmotion)
  } finally {
    isGettingLocations.value = false
  }
}

const generateEmotionMap = () => {
  if (!processData.value) return

  showGenerateMap.value = false
  showLocationConfirm.value = true
  console.log('准备生成情绪地图，地点数据:', processData.value.locationEmotion)
}

// 重新获取单个地点坐标
const retryLocationCoordinates = async (locationName: string) => {
  console.log('重新获取中')
  try {
    const locationData = processData.value?.locationEmotion[locationName]
    if (!locationData) return

    // 只传递单个地点的数据
    const singleLocationData = { [locationName]: locationData }
    const response = await getEmotionLocationGeoApi(singleLocationData)
    console.log(response)

    // console.log(response.statistics.failed === 0)
    if (
      response &&
      response.statistics.failed === 0 &&
      response.data[locationName]
    ) {
      // 更新地点结果
      locationResults.value[locationName] = response.data[locationName]
      // 从失败列表中移除=>>这样的话重新获取按钮才就会消失？？
      failedLocations.value = failedLocations.value.filter(
        name => name !== locationName
      )
      console.log(`地点 ${locationName} 重新获取成功`)
    } else {
      console.log(`地点 ${locationName} 重新获取失败`)
    }
  } catch (error) {
    console.error(`重新获取地点 ${locationName} 坐标失败:`, error)
  }
}

// 计算是否可以启用开始生成按钮

// 开始生成地图
const startGenerateMap = async () => {
  console.log('开始生成地图，地点数据:', locationResults.value)

  if (!processData.value || !aid.value) {
    console.error('缺少必要的情绪数据或文章ID')
    return
  }

  isSavingEmotion.value = true

  try {
    // 创建新的情绪数据
    const updatedEmotionData = {
      ...processData.value,
      locationEmotion: {} as Record<string, Record<string, unknown>>,
      fusionEmotion: {
        dominant: processData.value.fusionEmotion.dominant,
      },
    }

    console.log('原始fusionEmotion:', processData.value.fusionEmotion)
    console.log('简化后fusionEmotion:', updatedEmotionData.fusionEmotion)

    // 添加 mainCity 字段
    if (mainCity.value) {
      ;(updatedEmotionData as any).mainCity = mainCity.value
    }

    // 遍历locationResults，将坐标信息合并到情绪数据中
    Object.keys(locationResults.value).forEach(locationName => {
      const locationData = locationResults.value[locationName]
      const originalEmotionData =
        processData.value?.locationEmotion[locationName]

      if (originalEmotionData && locationData.location) {
        // 合并原始情绪数据和坐标信息
        updatedEmotionData.locationEmotion[locationName] = {
          ...originalEmotionData,
          lng: locationData.location.lng,
          lat: locationData.location.lat,
          formatted_address: locationData.location.formatted_address,
        }
      }
    })

    console.log('更新后的情绪数据:', updatedEmotionData)

    // 调用存储情绪接口
    console.log(
      '准备调用存储接口，文章ID:',
      aid.value,
      '类型:',
      typeof aid.value
    )
    const saveResponse = await saveEmotionDataApi(aid.value, updatedEmotionData)
    console.log('存储情绪数据成功:', saveResponse)

    // 更新本地的emotionData
    processData.value = updatedEmotionData as ProcessData

    // 关闭确认框，显示地图
    showLocationConfirm.value = false
    showEmotionMap.value = true
    console.log('EmotionMap已启用，文章ID:', aid.value)
    console.log('地图显示状态:', showEmotionMap.value)
  } catch (error) {
    console.error('存储情绪数据失败:', error)
    alert('存储情绪数据失败，请重试')
  } finally {
    isSavingEmotion.value = false
  }
}

const canStartGenerate = computed(() => {
  const hasLocationResults = Object.keys(locationResults.value).length > 0
  const noFailedLocations = failedLocations.value.length === 0
  const hasEmotionData =
    processData.value &&
    Object.keys(processData.value.locationEmotion).length > 0

  return hasLocationResults && noFailedLocations && hasEmotionData
})

// 确认生成地图
const confirmGenerateMap = () => {
  // TODO: 调用后端接口生成情绪地图
  console.log('确认生成情绪地图')
  showGenerateMap.value = false
}
</script>

<template>
  <div class="emotion-map-make-container">
    <div v-if="showEmotionMap && aid && processData" class="emotion-map-only">
      <div class="map-header-controls">
        <button @click="showEmotionMap = false" class="back-btn">
          ← 返回编辑
        </button>
        <div class="map-info-display">
          <span>文章ID: {{ aid }}</span>
          <span
            >地点数量:
            {{ Object.keys(processData.locationEmotion).length }}个</span
          >
        </div>
      </div>
      <EmoitionMap :article-id="aid" height="600px" />
    </div>

    <!-- 当情绪地图显示时候，只显示地图组件 -->
    <div v-else>
      <h1>旅途情绪地图</h1>
      <div v-if="!aid">请先发布文章，发布文章即可制作旅程的情绪地图~~~</div>
      <!-- 数据准备阶段提示 -->
      <div v-else>
        <div v-if="!processData">
          <p>正在准备数据中...</p>
        </div>

        <div v-else class="emotion-data-display">
          <p>数据准备完毕，可以进行数据编辑</p>
          <div class="data-section">
            <h2>文本整体情绪</h2>
            <p>主要情绪: {{ processData.textEmotion.mainEmotion }}</p>
            <p>
              概率:
              {{ (processData.textEmotion.probability * 100).toFixed(1) }}%
            </p>
          </div>

          <div class="data-section">
            <h2>融合情绪</h2>
            <p>主导情绪: {{ processData.fusionEmotion.dominant }}</p>
            <!-- <p>权重说明: {{ processData.fusionEmotion.weightInfo }}</p> -->
          </div>

          <!-- 地点情绪编辑 -->
          <div class="data-section">
            <h2>
              地点情绪 ({{
                Object.keys(processData.locationEmotion).length
              }}个地点)
            </h2>
            <div class="location-list">
              <!-- <div class="location-item"> -->
              <EmotionLocationItem
                v-for="(emotions, name) in processData.locationEmotion"
                :key="name"
                :name="name"
                :emotions="emotions"
                @deleteLocation="handleDeleteLocation"
              ></EmotionLocationItem>
            </div>
          </div>

          <div class="data-section">
            <div v-if="!processData.imageEmotion" class="">
              该文章未上传任何图片，无图片情绪数据
            </div>
            <div v-else class="">
              <h2>图像情绪 ({{ processData.imageEmotion.length }}张图片)</h2>
              <div class="image-emotions">
                <div
                  v-for="(imageEmotion, index) in processData.imageEmotion"
                  :key="index"
                  class="image-emotion-item"
                >
                  <h3>图片 {{ index + 1 }}</h3>
                  <div class="emotion-bars">
                    <div
                      v-for="(value, emotion) in imageEmotion"
                      :key="emotion"
                      class="emotion-bar"
                    >
                      <span class="emotion-label">{{ emotion }}</span>
                      <div class="bar-container">
                        <div
                          class="bar-fill"
                          :style="{ width: value * 100 + '%' }"
                        ></div>
                      </div>
                      <span class="emotion-value"
                        >{{ (value * 100).toFixed(1) }}%</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 生成情绪地图按钮 -->
          <div class="generate-section">
            <button @click="generateEmotionMap" class="generate-btn">
              生成情绪地图
            </button>
          </div>
        </div>

        <!-- 等待生成提示 -->
        <div v-if="aid && processData && !showEmotionMap" class="waiting-info">
          <p>📋 请先获取地点坐标，然后点击"开始生成"按钮来显示情绪地图</p>
          <p>当前状态: 已接收文章ID ({{ aid }})，等待生成地图</p>
          <div class="status-details">
            <p>
              📍 地点总数:
              {{ Object.keys(processData.locationEmotion).length }}个
            </p>
            <p>✅ 成功获取坐标: {{ Object.keys(locationResults).length }}个</p>
            <p>❌ 获取失败: {{ failedLocations.length }}个</p>
            <p>🚀 可以开始生成: {{ canStartGenerate ? '是' : '否' }}</p>
          </div>
        </div>

        <!-- 生成地图确认弹窗 -->
        <div v-if="showGenerateMap" class="map-dialog-mask">
          <div class="map-dialog">
            <div class="map-dialog-content">
              <h3>确认生成情绪地图</h3>
              <p>将基于当前的地点情绪数据生成高德地图情绪地图</p>
              <p>
                地点数量:
                {{
                  processData
                    ? Object.keys(processData.locationEmotion).length
                    : 0
                }}个
              </p>
            </div>
            <div class="map-dialog-actions">
              <button @click="showGenerateMap = false" class="cancel-btn">
                取消
              </button>
              <button @click="confirmGenerateMap" class="confirm-btn">
                确认生成
              </button>
            </div>
          </div>
        </div>

        <!-- 地点确认框 -->
        <div v-if="showLocationConfirm" class="location-confirm-mask">
          <div class="location-confirm">
            <div class="location-confirm-content">
              <h3>地点坐标确认</h3>
              <p>请确认以下地点信息，系统将获取对应的坐标位置</p>

              <!-- 地点列表 -->
              <div class="location-list-confirm">
                <div
                  v-for="(
                    locationData, locationName
                  ) in processData?.locationEmotion"
                  :key="locationName"
                  class="location-item-confirm"
                >
                  <div class="location-name-confirm">
                    <h4>{{ locationName }}</h4>
                    <p
                      v-if="
                        locationResults[locationName]?.location
                          ?.formatted_address
                      "
                      class="location-address"
                    >
                      {{
                        locationResults[locationName].location.formatted_address
                      }}
                    </p>
                    <p
                      v-if="failedLocations.includes(locationName)"
                      class="location-failed"
                    >
                      获取失败
                    </p>
                  </div>

                  <div
                    v-if="failedLocations.includes(locationName)"
                    class="location-actions-confirm"
                  >
                    <button
                      @click="retryLocationCoordinates(locationName)"
                      class="retry-btn"
                    >
                      重新获取
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="location-confirm-actions">
              <button @click="showLocationConfirm = false" class="cancel-btn">
                取消
              </button>
              <button
                @click="fetchLocationCoordinates"
                :disabled="isGettingLocations"
                class="fetch-btn"
              >
                {{ isGettingLocations ? '获取中...' : '获取地点坐标' }}
              </button>
              <button
                @click="startGenerateMap"
                :disabled="!canStartGenerate || isSavingEmotion"
                class="start-btn"
              >
                {{ isSavingEmotion ? '保存中...' : '开始生成' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.emotion-map-make-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  overflow: auto;
}

.emotion-data-display {
  margin-top: 20px;
}

.data-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #4b6e4b;
  border-radius: 8px;
  background: #f9f9f9;
}

.data-section h2 {
  color: #4b6e4b;
  margin-bottom: 15px;
  font-size: 18px;
}

.location-list,
.image-emotions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.generate-section {
  text-align: center;
  margin-top: 30px;
}

.generate-btn {
  padding: 12px 24px;
  background: #4b6e4b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.generate-btn:hover {
  background: #3d5a3d;
}

.map-dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.map-dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.map-dialog-content h3 {
  color: #4b6e4b;
  margin-bottom: 16px;
}

.map-dialog-content p {
  margin-bottom: 8px;
  color: #666;
}

.map-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.confirm-btn {
  background: #4b6e4b;
  color: white;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

.location-confirm-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.location-confirm {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 500px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.location-confirm-content h3 {
  color: #4b6e4b;
  margin-bottom: 16px;
}

.location-confirm-content p {
  margin-bottom: 8px;
  color: #666;
}

.location-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.location-list-confirm {
  margin: 20px 0;
  max-height: 300px;
  overflow-y: auto;
}

.location-item-confirm {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
}

.location-name-confirm h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 14px;
}

.location-address {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.location-failed {
  margin: 0;
  font-size: 12px;
  color: #dc3545;
}

.location-actions-confirm {
  display: flex;
  gap: 8px;
}

.retry-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: #dc3545;
  color: white;
}

.retry-btn:hover {
  background: #c82333;
}

.fetch-btn,
.start-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #4b6e4b;
  color: white;
  transition: background 0.2s;
}

.fetch-btn:hover:not(:disabled),
.start-btn:hover:not(:disabled) {
  background: #3d5a3d;
}

.fetch-btn:disabled,
.start-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.emotion-map-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #4b6e4b;
  border-radius: 8px;
  background: #f9f9f9;
}

.emotion-map-section h2 {
  color: #4b6e4b;
  margin-bottom: 15px;
  font-size: 18px;
}

.map-info {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.map-status {
  margin-bottom: 15px;
  font-size: 14px;
  color: #28a745;
  font-weight: 500;
}

.map-debug {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.debug-info {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #dc3545;
  border-radius: 8px;
  background: #f9f9f9;
}

.debug-info p {
  margin-bottom: 10px;
  color: #dc3545;
}

.waiting-info {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #4b6e4b;
  border-radius: 8px;
  background: #f9f9f9;
}

.waiting-info p {
  margin-bottom: 10px;
  color: #4b6e4b;
}

.status-details {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
}

.status-details p {
  margin-bottom: 5px;
  color: #666;
}

.emotion-map-only {
  width: 100%;
  height: 100vh;
  padding: 0;
  margin: 0;
  background: #f5f5f5;
}

.emotion-map-only :deep(.emotion-map-container) {
  width: 100%;
  height: 100vh;
  border-radius: 0;
  box-shadow: none;
}

.emotion-map-only :deep(.map-container) {
  height: calc(100vh - 80px) !important;
}

.map-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background-color: #4b6e4b;
  color: white;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #3d5a3d;
}

.map-info-display {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.map-info-display span {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
}
</style>
