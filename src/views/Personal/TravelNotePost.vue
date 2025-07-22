<script lang="ts" setup>
import { uploadImage } from '@/api/image'
import { ref } from 'vue'

// 图片上传功能
// 假定后端传过来的图片列表
interface ImageItem {
  url: string
  uploading: boolean
  loading: boolean
}

const imageList = ref<ImageItem[]>([])

// 点击添加按钮
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

// 添加地点功能
// 添加文章主要城市
const mainCity = ref('')
const locationResult = ref<{
  lng: number
  lat: number
  formatted_address: string
} | null>(null)
const savedLocationInfo = ref<{
  cityName: string
  lng: number
  lat: number
  formatted_address: string
} | null>(null)

// 从后端获取主要城市信息
const getMaincityLocation = async () => {
  // 类似信息
  locationResult.value = {
    lng: 102.709372,
    lat: 25.046432,
    formatted_address: '云南省',
  }

  try {
    // const response =
    return locationResult
  } catch (err) {
    console.log(err)
  }
}

const addLocation = () => {
  if (!mainCity.value.trim()) {
    alert('请输入城市名称')
    return
  }

  // 因为后续渲染地图模块需要
  const res = getMaincityLocation()
  console.log(res)
}
</script>

<template>
  <div class="">
    <div class="travel-note-container">
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
            type="text"
            id="post-travel-title"
            placeholder="最多不超过20子"
          />
        </div>
        <div class="post-content-box">
          <label for="">编辑文章内容</label>
          <textarea name="" id="" cols="30" rows="10"></textarea>
        </div>
        <div class="post-btns-box">
          <button class="post-btn">发布</button>
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
            <button @click="addLocation" class="post-location-btn">添加</button>
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
  </div>
</template>

<style lang="scss" scoped>
.travel-note-container {
  display: flex;
  color: #333333;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
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
