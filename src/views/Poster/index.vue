<template>
  <div class="poster-generator-container">
    <!-- 页面标题 -->
    <!-- <el-page-header content="电影海报生成器" class="page-header" /> -->

    <!-- 主体布局：三栏结构（强制保持横向排列） -->
    <div class="main-layout">
      <!-- 左侧：电影海报模板列表 -->
      <div class="left-panel">
        <el-card shadow="hover" class="template-list-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><FilmFilled /></el-icon>
              <span class="header-title">风格模板</span>
            </div>
          </template>

          <!-- 模板列表：纵向滚动 -->
          <div class="template-scroll-container">
            <div
              v-for="movie in movieList"
              :key="movie.id"
              class="template-item"
              :class="{ 'selected': form.selectedMovie === movie.id }"
              @click="chooseStyle(movie)"
            >
              <div class="template-poster">
                <img :src="movie.posterUrl" :alt="movie.title" class="poster-img" />
                <div class="selected-mask" v-if="form.selectedMovie === movie.id">
                  <el-icon class="check-icon"><CheckFilled /></el-icon>
                </div>
              </div>
              <div class="template-info">
                <el-tooltip :content="movie.title" placement="right">
                  <h4 class="template-title">{{ movie.title }}</h4>
                </el-tooltip>
                <p class="template-style">{{ movie.style }}</p>
              </div>
            </div>
          </div>

          <!-- 当前选中提示 -->
          <div class="selected-template-tip" v-if="form.selectedMovie">
            <el-icon size="14"><CheckFilled /></el-icon>
            <!-- <span>已选：{{ getSelectedMovieName() }}</span> -->
          </div>
        </el-card>
      </div>

      <!-- 中间：提示词输入 + 生成按钮 -->
      <div class="middle-panel">
        <el-card shadow="hover" class="input-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><PromptFilled /></el-icon>
              <span class="header-title">生成提示词</span>
            </div>
          </template>

          <el-form :model="form" class="prompt-form" ref="promptFormRef">
            <div class="prompt-tips" style="margin-bottom: 12px;">
              <el-icon size="14"><InfoFilled /></el-icon>
              <span>提示：包含「风格+构图」会让生成效果更精准</span>
            </div>
            <el-form-item
              label="风格描述"
              prop="prompt"
              :rules="[{ required: true, message: '请输入海报风格提示词', trigger: 'blur' }]"
              label-width="80px"
            >
              <el-input
                v-model="form.prompt"
                type="textarea"
                :rows="6"
                placeholder="例如：赛博朋克风格，雨夜城市背景，霓虹灯光效"
                maxlength="600"
                show-word-limit
                class="prompt-input"
              />
            </el-form-item>

            <el-form-item label="参考风格" prop="selectedMovie" label-width="80px">
              <div class="reference-tips">
                <!-- <el-icon size="14"><StarFilled /></el-icon> -->
                <span>左侧选择电影模板，生成将参考其视觉风格</span>
              </div>
              
              <!-- 选中电影预览 -->
              <!-- <div class="selected-movie-preview" v-if="form.selectedMovie">
                <el-card :body-style="{ padding: '8px' }" class="mini-movie-card">
                  <div class="mini-movie-content">
                    <img
                      :src="getSelectedMoviePoster()"
                      class="mini-poster-img"
                    />
                    <div class="mini-movie-info">
                      <h5 class="mini-movie-title">{{ getSelectedMovieName() }}</h5>
                      <p class="mini-movie-year">{{ getSelectedMovieYear() }}</p>
                    </div>
                  </div>
                </el-card>
              </div> -->
            </el-form-item>
          </el-form>

          <!-- 生成按钮 -->
          <div class="generate-btn-container">
            <el-button
              type="primary"
              size="large"
              color="#BD192E"
              class="generate-btn"
              @click="generatePoster"
              :loading="isGenerating"
              :disabled="!form.prompt"
            >
              <!-- <el-icon class="btn-icon" v-if="!isGenerating"><MagicStickFilled /></el-icon>
              <el-icon class="btn-icon" v-else><LoadingFilled /></el-icon> -->
              {{ isGenerating ? "生成中..." : "生成电影海报" }}
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 右侧：海报预览区域 -->
      <div class="right-panel">
        <el-card shadow="hover" class="preview-card" style="padding: 0px;">
          <template #header>
            <div class="card-header" style="display: flex; align-items: center;">
              <el-icon class="header-icon"><PictureFilled /></el-icon>
              <span class="header-title" style="margin-left: 4px;">生成海报预览</span>
              <!-- <div class="preview-actions">
                <el-button
                  type="text"
                  icon="DownloadFilled"
                  class="action-btn download-btn"
                  @click="downloadPoster"
                  v-if="generatedPoster"
                  :disabled="isGenerating"
                >
                  下载海报
                </el-button>
              </div> -->
            </div>
          </template>

          <div class="preview-container">
            <!-- 初始状态 -->
            <div class="empty-preview" v-if="!generatedPoster && !generateError && !isGenerating">
              <div class="empty-illustration">
                <img
                  src="https://picsum.photos/seed/posterEmpty/300/200"
                  alt="海报预览占位"
                  class="empty-img"
                />
              </div>
              <p class="empty-text">完成左侧操作，生成专属电影海报</p>
            </div>

            <!-- 生成中状态 -->
            <div class="loading-preview" v-if="isGenerating">
              <!-- <el-loading-spinner class="loading-spinner" /> -->
              <p class="loading-text">正在智能生成海报...</p>
              <div class="loading-progress">
                <el-progress color="#BD192E" :percentage="generateProgress" />
              </div>
            </div>

            <!-- 生成失败状态 -->
            <div class="error-preview" v-if="generateError && !isGenerating">
              <el-icon class="error-icon"><WarningFilled /></el-icon>
              <p class="error-text">海报生成失败</p>
              <p class="error-subtext">{{ generateError }}</p>
              <el-button type="primary" size="small" class="retry-btn" @click="generatePoster">
                重新生成
              </el-button>
            </div>

            <!-- 生成成功 -->
            <div class="success-preview" v-if="generatedPoster">
              <div class="poster-frame">
                <el-image
                  :src="generatedPoster"
                  alt="生成的电影海报"
                  class="generated-poster"
                  fit="contain"
                  @click="viewOriginalPoster"
                />
                <!-- <div class="view-original-tip">
                  <el-icon size="14"><ZoomInFilled /></el-icon>
                  <span>点击查看原图</span>
                </div> -->
              </div>

              <!-- <div class="poster-info-panel">
                <el-card :body-style="{ padding: '16px' }" class="info-card">
                  <div class="info-row">
                    <span class="info-label">参考模板：</span>
                    <span class="info-value">{{ getSelectedMovieName() }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">风格提示：</span>
                    <span class="info-value">{{ form.prompt }}</span>
                  </div>
                </el-card>
              </div> -->
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 查看原图弹窗 -->
    <el-dialog
      v-model="isOriginalDialogShow"
      title="海报原图预览"
      :width="isMobile ? '95%' : '80%'"
    >
      <div class="original-dialog-content">
        <!-- <el-image
          :src="generatedPoster"
          alt="电影海报原图"
          class="original-poster"
          :fit="cover"
        /> -->
        <el-image style="width: 100%; height: 85vh" :src="generatedPoster" fit="contain" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ruanlingyu from '@/assets/postersAi/ruanlingyu.jpg'
import bopu from '@/assets/posters/波普艺术.jpg'
import guzhang from '@/assets/posters/故障艺术.jpg'
import jianzhi from '@/assets/posters/剪纸风.jpg'
import suanxing from '@/assets/posters/酸性风.jpg'
import weiduoliya from '@/assets/posters/维多利亚风.jpg'
import xiangsu from '@/assets/posters/像素风.jpg'
import data from './data'
import bopuAi2 from '@/assets/postersAi/bopu2.jpg'

// 响应式变量
const form = ref({
  prompt: "",
  selectedMovie: null,
});
const promptFormRef = ref(ElForm);
const isGenerating = ref(false);
const generatedPoster = ref("");
const generateError = ref("");
const generateProgress = ref(0);
const isOriginalDialogShow = ref(false);

// 电影模板列表
const movieList = ref([
  {
    id: 1,
    title: "波普艺术",
    year: "2017",
    posterUrl: bopu,
    style: "融大众文化的鲜艳艺术",
  },
  {
    id: 2,
    title: "故障艺术",
    year: "1994",
    posterUrl: guzhang,
    style: "数字故障的视觉风格",
  },
  {
    id: 3,
    title: "酸性风",
    year: "1993",
    posterUrl: suanxing,
    style: "大胆色彩的复古风潮",
  },
  {
    id: 4,
    title: "像素风",
    year: "2001",
    posterUrl: xiangsu,
    style: "像素块构成的视觉风",
  },
  {
    id: 5,
    title: "剪纸风",
    year: "2014",
    posterUrl: jianzhi,
    style: "剪纸质感的平面艺术",
  },
  {
    id: 6,
    title: "维多利亚风",
    year: "1994",
    posterUrl: weiduoliya,
    style: "复古华丽的宫廷风格",
  },
]);

// 计算属性
const isMobile = computed(() => {
  return window.innerWidth < 768;
});

// const getSelectedMovieName = computed(() => {
//   if (!form.value.selectedMovie) return "未选择";
//   const movie = movieList.value.find(item => item.id === form.value.selectedMovie);
//   return movie ? movie.title : "未知电影";
// });

const getSelectedMoviePoster = computed(() => {
  if (!form.value.selectedMovie) return "";
  const movie = movieList.value.find(item => item.id === form.value.selectedMovie);
  return movie ? movie.posterUrl : "";
});

const getSelectedMovieYear = computed(() => {
  if (!form.value.selectedMovie) return "";
  const movie = movieList.value.find(item => item.id === form.value.selectedMovie);
  return movie ? movie.year : "";
});

const chooseStyle = (movie) => {
  form.value.selectedMovie = movie.id
  generatedPoster.value = ''
}

const getImageUrl = () => {
    let randomUrl = ''
    switch(form.value.selectedMovie) {
      case 1:
        randomUrl = data.bopu[Math.floor(Math.random() * data.bopu.length)]
        break;
      case 2:
        randomUrl = data.guzhang[Math.floor(Math.random() * data.guzhang.length)]
        break;
      case 3:
        randomUrl = data.suanxing[Math.floor(Math.random() * data.suanxing.length)]
        break;
      case 4:
        randomUrl = data.xiangsu[Math.floor(Math.random() * data.xiangsu.length)]
        break;
      case 5:
        randomUrl = data.jianzhi[Math.floor(Math.random() * data.jianzhi.length)]
        break;
      case 6:
        randomUrl = data.weiduoliya[Math.floor(Math.random() * data.weiduoliya.length)]
        break;
      default:
        randomUrl = bopuAi2;
    }
    return randomUrl
}

// 核心功能
const generatePoster = async () => {
  // 表单校验
  if (!promptFormRef.value) return;
  try {
    await promptFormRef.value.validate();
  } catch (error) {
    ElMessage.warning("请完善必填项后再生成");
    return;
  }

  try {
    isGenerating.value = true;
    generateError.value = "";
    generateProgress.value = 0;

    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (generateProgress.value < 95) {
        generateProgress.value += Math.floor(Math.random() * 10);
      }
    }, 300);

    // 模拟API调用
    const mockPosterUrl = await new Promise((resolve) => {
      setTimeout(() => {
        generateProgress.value = 100;
        clearInterval(progressTimer);
        const imageUrl = getImageUrl();
        resolve(imageUrl);
      }, 3000);
    });

    generatedPoster.value = mockPosterUrl;
    ElMessage.success("海报生成成功！");
  } catch (error) {
    generateError.value = error || "生成失败，请稍后重试";
    ElMessage.error(generateError.value);
  } finally {
    isGenerating.value = false;
  }
};

// const downloadPoster = () => {
//   if (!generatedPoster.value) return;
  
//   const link = document.createElement("a");
//   link.href = generatedPoster.value;
//   const promptKey = form.value.prompt.slice(0, 15).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-");
//   const fileName = `${promptKey}-${getSelectedMovieName.value}.jpg`;
//   link.download = fileName;
  
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

const viewOriginalPoster = () => {
  if (generatedPoster.value && !isGenerating.value) {
    isOriginalDialogShow.value = true;
  }
};
</script>

<style scoped>
:deep(.el-card__header) {
  padding: 10px;
}
.poster-generator-container {
  padding: 8px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 154px);
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 24px;
}

/* 核心布局修改：使用flex确保三栏横向排列 */
.main-layout {
  display: flex;
  gap: 8px;
  width: 100%;
  min-width: 900px; /* 设置最小宽度，防止过窄屏幕导致换行 */
  overflow-x: auto; /* 超窄屏幕时允许横向滚动 */
}

/* 左侧面板：固定宽度240px */
.left-panel {
  width: 240px;
  flex-shrink: 0; /* 不允许缩小 */
}

.template-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-scroll-container {
  flex-grow: 1;
  padding: 8px 0;
  overflow-y: auto;
  max-height: 600px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

.template-item:hover {
  background-color: rgba(189, 25, 46, 0.1);
}

.template-item.selected {
  background-color: rgba(189, 25, 46, 0.2);
  border: 1px solid #c72c40;
}

.template-poster {
  position: relative;
  width: 60px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(189, 25, 46, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: white;
  font-size: 20px;
}

.template-info {
  flex-grow: 1;
  overflow: hidden;
}

.template-title {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-style {
  font-size: 12px;
  color: #909399;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.selected-template-tip {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #e6f7ff;
  color: #409eff;
  font-size: 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 中间面板：固定宽度360px */
.middle-panel {
  width: 360px;
  flex-shrink: 0; /* 不允许缩小 */
}

.input-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.prompt-form {
  margin-top: 16px;
  flex-grow: 1;
}

.prompt-input {
  border-radius: 8px !important;
  resize: none;
}

.prompt-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reference-tips {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.selected-movie-preview {
  margin-top: 8px;
}

.mini-movie-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-poster-img {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.mini-movie-title {
  font-size: 13px;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-movie-year {
  font-size: 11px;
  color: #909399;
  margin: 0;
}

.generate-btn-container {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #e4e7ed;
}

.generate-btn {
  width: 100%;
  height: 50px;
  border-radius: 8px !important;
  font-size: 16px;
}

.btn-icon {
  margin-right: 8px;
}

/* 右侧面板：占据剩余宽度 */
.right-panel {
  flex-grow: 1; /* 自动填充剩余空间 */
  min-width: 400px; /* 确保有足够宽度显示海报 */
}

.preview-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-actions {
  margin-left: auto;
}

.action-btn {
  color: #409eff !important;
}

.preview-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding: 30px; */
  /* background-color: #f9fafb; */
  border-radius: 8px;
  /* margin-top: 16px; */
  min-height: 500px;
}

.empty-preview {
  text-align: center;
  color: #909399;
}

.empty-img {
  width: 200px;
  height: auto;
  opacity: 0.6;
  border-radius: 8px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  color: #606266;
}

.loading-preview {
  text-align: center;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
  color: #409eff;
}

.loading-progress {
  width: 80%;
  max-width: 400px;
  margin-top: 20px;
}

.error-preview {
  text-align: center;
  color: #f56c6c;
}

.error-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.success-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.poster-frame {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 600px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generated-poster {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.view-original-tip {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.poster-info-panel {
  width: 100%;
  max-width: 600px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-label {
  color: #909399;
  font-weight: 500;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  flex-grow: 1;
  word-break: break-all;
}

.original-dialog-content {
  padding: 10px;
}

.original-poster {
  width: 100%;
  max-height: 85vh;
}

/* 移动端适配：屏幕宽度小于900px时改为垂直布局 */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
    min-width: auto;
  }
  
  .left-panel,
  .middle-panel,
  .right-panel {
    width: 100% !important;
    min-width: auto;
  }
  
  /* 左侧模板列表改为横向滚动 */
  .template-scroll-container {
    display: flex;
    flex-direction: row;
    gap: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    padding: 12px 0;
  }
  
  .template-item {
    flex-direction: column;
    width: 120px;
    text-align: center;
    margin-bottom: 0;
  }
  
  .template-poster {
    width: 80px;
    height: 120px;
  }
}
</style>
