<script lang="ts" setup>
import {
  getArticleDetailApi,
  pulishArticleApi,
  storeOriginalEmotionDataApi,
} from '@/api/article'
import { predictEmotionMap } from '@/api/emotionMap'
import { getlocationApi } from '@/api/geo'
import { uploadImage } from '@/api/image'
import { PublishArticle } from '@/types/article'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ————————图片上传功能
// 假定后端传过来的图片列表
interface ImageItem {
  url: string
  uploading: boolean
  loading: boolean
}

const imageList = ref<ImageItem[]>([])

// 点击图片添加按钮
const handleImageUpload = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  // 创建本地url预览
  const localURL = URL.createObjectURL(file)
  console.log(localURL)

  const tmp: ImageItem = { url: localURL, uploading: true, loading: false }
  imageList.value.push(tmp)

  // 下面将文件图片上传到图床
  const index = imageList.value.length - 1
  try {
    const res = await uploadImage(file)
    console.log(res.url)
    // tmp.url = res.url
    // tmp.uploading = false
    // tmp.loading = false //无法触发响应
    imageList.value[index].url = res.url
    imageList.value[index].uploading = false
    imageList.value[index].loading = true
  } catch (error) {
    imageList.value.splice(index, 1)
    console.error('上传失败', error)
  }
}
const handleImgLoad = (index: number) => {
  imageList.value[index].loading = false
}

//——————————添加地点功能
// 添加文章主要城市
const mainCity = ref('')
const isAddSuccess = ref(false)

const mainCityResult = ref<{
  lng: number
  lat: number
  formatted_address: string
} | null>(null)

// 从后端获取主要城市信息
const addLocation = async () => {
  if (!mainCity.value.trim()) {
    alert('请输入城市名称')
    return
  }
  try {
    const res = await getlocationApi({ address: mainCity.value })
    mainCityResult.value = res
    isAddSuccess.value = true
  } catch (err) {
    console.log(err)
  }
}

// ——————————发布文章，存储进数据库

const title = ref<string>('')
const content = ref('')
const publishedAid = ref<number | null>(null)
const showSuccessDialog = ref(false)

const submitArticleHandler = async () => {
  // console.log('提交文章')
  if (!title.value.trim()) {
    alert('请输入文章标题')
    return
  }
  if (!content.value.trim()) {
    alert('请输入文章内容')
    return
  }

  // 数据处理，imageList和mainCity是proxy对象，传给后端应该是json格式数据
  const publishImg = imageList.value
    .filter(img => img.url)
    .map(img => img.url)
    .join(',')

  const publishMaincity = JSON.stringify(mainCityResult.value)

  const publishData = <PublishArticle>{
    content: content.value,
    title: title.value,
    imagesUrl: publishImg,
    mainCity: publishMaincity,
    type: 'vlog',
  }

  try {
    console.log('发布得文章信息：', publishData)
    const res = await pulishArticleApi(publishData)

    title.value = ''
    content.value = ''
    imageList.value = []
    mainCity.value = ''
    mainCityResult.value = null
    isAddSuccess.value = false
    showSuccessDialog.value = true

    publishedAid.value = res.aid
    console.log(publishedAid.value)
  } catch (err) {
    console.error('发布文章失败', err)
  }
}

// ————————————进行情感分析功能
const showAnalysisResult = ref(false)

const closeDialog = () => {
  showSuccessDialog.value = false
}

// 开始分析
const handleEmotionMap = async () => {
  showSuccessDialog.value = false
  showAnalysisResult.value = true

  let res = null
  if (!publishedAid.value) return

  // 获取文章信息
  try {
    res = await getArticleInfo(publishedAid.value)
    console.log(res)
  } catch (err) {
    console.error('获取文章信息失败', err)
    return
  }

  // 情绪分析
  let analysisRes = null
  try {
    if (res) {
      analysisRes = await predictEmotionMap(res.content, res.imagesUrl)
      console.log(analysisRes)
    }
  } catch (err) {
    console.error('情绪分析失败：', err)
    return
  }

  // 情绪分析结果存储
  try {
    await storeOriginalEmotionDataApi(
      publishedAid.value,
      JSON.stringify(analysisRes)
    )
  } catch (err) {
    console.error('原始情绪数据存储失败：', err)
  }
}

const getArticleInfo = async (aid: number) => {
  try {
    const res = await getArticleDetailApi(aid)
    console.log(res)
    return res
  } catch (err) {
    console.error('获取文章信息失败：', err)
  }
}

// 跳转至情绪地图制作
const handleNextStep = () => {
  // 跳转到制作情绪地图并传递aid
  router.push({
    name: 'EmotionMapMake',
    query: {
      articleID: publishedAid.value,
    },
  })
}
</script>

<template>
  <div class="travel-note-container">
    <!-- 发布成功弹窗 -->
    <div v-if="showSuccessDialog" class="success-dialog-mask">
      <div class="success-dialog">
        <div class="dialog-content">发布成功，是否生成你的旅途情绪地图</div>
        <div class="dialog-actions">
          <button class="dialog-btn" @click="handleEmotionMap">确认</button>
          <button class="dialog-btn" @click="closeDialog">取消</button>
        </div>
      </div>
    </div>

    <!-- 分析结果弹窗 -->
    <div v-if="showAnalysisResult" class="result-dialog-mask">
      <div class="result-dialog">
        <div class="result-content">
          <div class="result-icon">🎉</div>
          <div class="result-title">分析完成！</div>
          <div class="result-message">开始制作编辑该旅途的情绪地图</div>
        </div>
        <div class="result-actions">
          <!-- <button class="result-btn cancel" @click="closeAnalysisResult">取消</button> -->
          <button class="result-btn next" @click="handleNextStep">
            下一步
          </button>
        </div>
      </div>
    </div>

    <!-- 左侧编辑区 -->
    <div class="travelnote-editor-panel">
      <div class="back-title">
        <span class="back">&lt;</span>
        <span class="title">记录旅游</span>
      </div>
      <!-- 编辑标题 -->
      <div class="post-title-box">
        <label for="post-travel-title">编辑标题</label>
        <input
          v-model="title"
          type="text"
          id="post-travel-title"
          placeholder="最多不超过20子"
        />
      </div>
      <div class="post-content-box">
        <label for="">编辑文章内容</label>
        <textarea
          v-model="content"
          name=""
          id=""
          cols="30"
          rows="10"
        ></textarea>
      </div>
      <div class="post-btns-box">
        <button @click="submitArticleHandler" class="post-btn">发布</button>
        <button class="post-review-btn">预览</button>
      </div>
    </div>
    <!-- 右侧功能区 -->
    <div class="travelnote-side-panel">
      <!-- 向文本添加表情 -->
      <div class="side-emotion-tools-box tool-row">
        <span class="post-tools-circle">😊</span>
        <span class="post-tools-title">插入表情</span>
      </div>
      <!-- 添加城市地标后续传递给制作情绪地图组件使用为地图渲染中心 -->
      <div class="post-travel-direction-box tool-row">
        <span class="post-tools-circle">📍</span>
        <span class="post-tools-title">添加地点</span>
        <div class="location-input-box">
          <input
            v-model="mainCity"
            class="post-location-input"
            type="text"
            placeholder="输入文章城市省份名称"
          />

          <button @click="addLocation" class="post-location-btn">
            {{ isAddSuccess ? '添加成功' : '添加' }}
          </button>
        </div>
      </div>
      <!-- 上传文章的图片 -->
      <div class="img-edit-title">
        图片编辑
        <span class="img-count">({{ imageList.length }}/18)</span>
        <span class="img-tip">支持拖拽排序</span>
      </div>
      <!-- 图片布局 -->
      <div class="img-grid">
        <!-- 上传图片按钮 -->
        <label @change="handleImageUpload" class="img-box img-upload">
          <input type="file" style="display: none" name="" id="" />
          <div class="img-upload-inner">
            <div class="img-upload-icon">+</div>
            <div class="img-upload-text">添加</div>
          </div>
        </label>
        <!-- 渲染上传图片 -->
        <!-- 这里key的index要改成图片id -->
        <div class="img-box" v-for="(img, index) in imageList" :key="index">
          <img
            v-if="img.url"
            :src="img.url"
            class="img-thumb"
            alt="文章图片"
            @load="handleImgLoad(index)"
            :style="{ filter: img.loading ? 'blur(8px)' : 'none' }"
          />
          <!-- 遮罩和进度条 -->
          <div v-if="img.uploading || img.loading" class="img-mask">
            <div class="loader"></div>
            <span class="img-mask-text">
              {{ img.uploading ? '上传中...' : '加载中...' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.travel-note-container {
  display: flex;
  color: #333333;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.travel-note-container {
  display: flex;
  height: 100%;
  /* height: 100vh; */
  color: #333333;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.success-dialog-mask {
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

  .success-dialog {
    background: #4b6e4b;
    color: #fff;
    border-radius: 8px;
    min-width: 320px;
    min-height: 100px;
    padding: 32px 24px 24px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .dialog-content {
    font-size: 18px;
    margin-bottom: 32px;
    text-align: left;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 32px;
  }
  .dialog-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 16px;
    margin-left: 16px;
    cursor: pointer;
    outline: none;
    padding: 0 8px;
  }
  .dialog-btn:hover {
    text-decoration: underline;
  }
}

.result-dialog-mask {
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
.result-dialog {
  background: #4b6e4b;
  color: #fff;
  border-radius: 8px;
  min-width: 320px;
  min-height: 100px;
  padding: 32px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .result-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .result-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
  .result-message {
    color: #bdbdbd;
    font-size: 13px;
  }
  .result-actions {
    display: flex;
    justify-content: flex-end;
    gap: 32px;
  }
  .result-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 16px;
    margin-left: 16px;
    cursor: pointer;
    outline: none;
    padding: 0 8px;
  }
  .result-btn:hover {
    text-decoration: underline;
  }
}

input {
  height: 32px;
  border-top: 1px solid #4b6e4b;
  border-left: 1px solid #4b6e4b;
  border-bottom: 1px solid #4b6e4b;
  background: transparent;
  border-radius: 2px;
  color: #333333;
  padding: 0 8px;
  font-size: 15px;
  outline: none;
}
.travelnote-editor-panel {
  height: 100%;
  flex: 1.5;

  > * {
    margin: 15px 0;
  }
  .post-title-box {
    display: flex;
    flex-direction: column;
    input {
      padding: 3px 4px;
      margin-top: 5px;
    }
  }
  .post-content-box {
    display: flex;
    flex-direction: column;

    textarea {
      flex: 1;
      min-height: 360px;
      border: 1px solid #4b6e4b;
      background: transparent;
      border-radius: 2px;
      color: #333333;
      padding: 8px;
      font-size: 15px;
      outline: none;
      resize: none;
      margin-top: 5px;
      &:focus {
        border-color: #7bb47b;
      }
    }
  }
}

.post-btns-box {
  .post-btn,
  .post-review-btn {
    background-color: $second-color;
    border: none;
    color: #fff;
    font-size: 16px;
    margin-right: 16px;
    cursor: pointer;
    outline: none;
    padding: 2px 12px;
    border-radius: 8px;
  }
}

.travelnote-side-panel {
  padding: 15px 0 0 40px;
  flex: 1;

  .tool-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .post-tools-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    /* background: #fff; */
    margin-right: 12px;
    border: 1.5px solid #333333;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 18px;
  }
  .post-tools-circle:hover {
    background: #f3faea;
    border-color: #4b6e4b;
    transform: scale(1.1);
  }
  .post-travel-direction-box {
    .location-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 12px;
    }

    .post-location-input {
      width: 160px;
      height: 24px;
      border: 1px solid #4b6e4b;
      border-radius: 4px;
      padding: 0 8px;
      font-size: 12px;
      outline: none;
      background: transparent;
      color: #333333;
    }

    .post-location-input:focus {
      border-color: #7bb47b;
      box-shadow: 0 0 0 2px rgba(75, 110, 75, 0.2);
    }
    .post-location-btn {
      height: 24px;
      padding: 0 12px;
      border: none;
      border-radius: 4px;
      background-color: #4b6e4b;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    // .location-btn:hover:not(:disabled) {
    //   background: #3d5a3d;
    // }

    // .location-btn:disabled {
    //   background: #ccc;
    //   cursor: not-allowed;
    // }
  }

  .img-grid {
    display: grid;
    grid-template-columns: repeat(4, 96px);
    gap: 16px;
    align-items: center;

    .img-box {
      position: relative;
      width: 96px;
      height: 96px;
      background: #f6f6f6;
      border-radius: 6px;
      border: 1.5px dashed #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color 0.2s;

      .img-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
        transition: filter 0.3s;
      }
      .img-mask {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2;
        border-radius: 6px;
        backdrop-filter: blur(2px);
      }
      .img-mask-text {
        color: #4b6e4b;
        font-size: 14px;
        margin-top: 8px;
      }
      .loader {
        border: 4px solid #e0e0e0;
        border-top: 4px solid #4b6e4b;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        animation: spin 1s linear infinite;
      }
    }
    .img-box:not(.img-upload):hover {
      border-color: #4b6e4b;
    }
    .img-upload {
      border: 1.5px dashed #bdbdbd;
      background: #fff;
    }

    .img-upload-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .img-upload-icon {
      font-size: 32px;
      color: #bdbdbd;
      line-height: 1;
    }
    .img-upload-text {
      font-size: 15px;
      color: #bdbdbd;
      margin-top: 4px;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
