<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const route = useRouter()

const showEmotionMap = ref(false)

// ————接收路由查询参数传递过来的数据
// 从文章路由传递过来的模型分析结果
interface EmotionData {
  textEmotion: {
    mainEmotion: string
    probability: number
    distribution: Record<string, number>
  }
  locationEmotion: Record<string, Record<string, number>>
  imageEmotion: Record<string, number>[]
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

const emotionData = ref<EmotionData | null>(null)
// 从文章路由传递过来的articleID
const articleId = ref<number | null>(null)
// 获取路由查询参数
// onMounted(() => {
//   // const emotionDataStr = route.query.emotionData
//   const articleIdStr = route.query.articleId

//   // if (emotionDataStr) {
//   //   try {
//   //   } catch (err) {
//   //     console.log('解析情绪数据失败:', err)
//   //   }
//   // }

//   if (articleIdStr) {
//     articleId.value = articleIdStr
//     console.log('FootPrints 接收到的文章ID:', articleId.value)
//     console.log('文章ID类型:', typeof articleId.value)
//   }
// })

// ————获取各个城市地点坐标
interface LocationData {
  [key: string]:
    | number
    | { lng: number; lat: number; formatted_address: string }
    | undefined
  location?: { lng: number; lat: number; formatted_address: string }
}
const locationResults = ref<Record<string, LocationData>>({})
const failedLocations = ref<string[]>([])

// ————编辑地点情绪
const locationName = ref<string>('')
const startEditLocation = (locationName: string) => {}

// ————计算是否能够开始生成情绪地图
const canStartGenerate = computed(() => {
  const hasLocationResults = Object.keys(locationResults.value).length > 0
  const hasEmotionData =
    emotionData.value &&
    Object.keys(emotionData.value.locationEmotion).length > 0
  const noFailedLocations = failedLocations.value.length === 0

  return hasLocationResults && noFailedLocations && hasEmotionData
})
</script>

<template>
  <div class="footprints-container">
    <!-- 当情绪地图显示时候，只显示地图组件 -->
    <div
      v-if="showEmotionMap && articleId && emotionData"
      class="emotion-map-only"
    ></div>
    <!-- 当不显示地图的时候，显示制作情绪地图组件 -->
    <div v-else>
      <h1>旅途情绪地图</h1>
      <!-- 显示情绪数据 -->
      <div v-if="true" class="emotion-data-display">
        <!-- <div class="data-section">
          <p>文本整体情绪</p>
          <p>主要情绪: {{ emotionData.textEmotion.mainEmotion }}</p>
          <p>
            概率: {{ (emotionData.textEmotion.probability * 100).toFixed(1) }}%
          </p>
        </div> -->

        <!-- <div class="data-section">
          <h2>融合情绪</h2>
          <p>主导情绪: {{ emotionData.fusionEmotion.dominant }}</p>
        </div>

        <div class="data-section">
          <h2>
            地点情绪 ({{
              Object.keys(emotionData.locationEmotion).length
            }}个地点)
          </h2>

          <div class="location-list">
            <div
              v-for="(location, name) in emotionData.locationEmotion"
              :key="name"
              class="location-item"
            >
              <div class="location-header">
                <h3 v-if="editingLocation !== name">{{ name }}</h3>

                <div class="location-name"></div>
              </div>
              <div class="location-bars"></div>
            </div>
          </div>
        </div>
        <div class="data-section"></div>
        <div class="getlocation-section">
          <button>获取各地信息</button>
        </div> -->
      </div>
      <!-- <div v-if="emotionData" class="emotion-data-display"></div> -->
      <!-- 无数据处理 -->
      <div v-else class="no-data"><p>暂无情绪信息</p></div>

      <!-- 等待生成的提示信息 -->
      <div
        v-if="articleId && emotionData && !showEmotionMap"
        class="waiting-info"
      >
        <p>请先获取地点坐标，然后点击“开始生成”按钮显示情绪地图</p>
        <p>当前状态：已接受文章ID（{{ articleId }}），等待生成地图</p>
        <!-- 当前已得到的情绪数据 -->
        <div class="status-details">
          <p>📍 地点总数: {{ emotionData.locationEmotion.length }}</p>
          <p>
            📍 成功获取的坐标数: {{ Object.keys(locationResults.value).length }}
          </p>
          <p>❌ 获取失败: {{ failedLocations.length }}个</p>
          <p>🚀 可以开始生成: {{ canStartGenerate ? '是' : '否' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
