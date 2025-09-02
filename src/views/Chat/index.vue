<template>
  <div class="chat-room-container">
    <!-- 三栏布局：左-头像选择 / 中-聊天区 / 右-可折叠头像选择 -->
    <el-row :gutter="0" class="chat-row">
      <!-- 左侧面板：我的形象选择 -->
      <el-col :span="8" class="panel left-panel">
        <div class="panel-inner">
          <!-- <h3 class="panel-title">我的形象</h3> -->
          
          <!-- 当前选中的形象（支持GIF） -->
          <div class="avatar-current">
            <!-- <el-avatar :size="120" class="avatar-main">
              <img 
                :src="selectedMyAvatar.url" 
                :alt="selectedMyAvatar.name" 
                class="avatar-img"
              />
            </el-avatar> -->
            <img 
              style="width: 200px;height: 300px;"
              :src="selectedOtherAvatar.url" 
              :alt="selectedOtherAvatar.name" 
              class="avatar-img"
            />
            <p class="avatar-name">{{ selectedOtherAvatar.name }}</p>
          </div>
          
          <!-- 形象选择列表 -->
          <div class="avatar-selector">
            <h4 class="selector-title">选择电影演员、导演，与他们对话</h4>
            <div class="avatar-list">
              <el-avatar 
                :size="60" 
                v-for="(avatar, idx) in otherAvatarList" 
                :key="idx"
                :class="{ 'avatar-selected': selectedMyIdx === idx }"
                @click="selectOtherAvatar(idx)"
              >
                <img :src="avatar.url" :alt="avatar.name" class="avatar-img" />
              </el-avatar>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间面板：核心聊天区 -->
      <el-col :span="16" class="panel middle-panel">
        <!-- 聊天标题栏 -->
        <!-- <div class="chat-header">
          <h2 class="header-title">与电影演员对话</h2>
        </div> -->

        <!-- 聊天内容区（可滚动） -->
        <div class="chat-content" ref="chatContentRef">
          <!-- 无消息时的提示 -->
          <div class="chat-empty" v-if="chatMessages.length === 0">
            <el-icon class="empty-icon"><CommentEmpty /></el-icon>
            <p class="empty-text">开始发送第一条消息吧～</p>
          </div>

          <!-- 聊天消息列表 -->
          <div 
            v-for="(msg, idx) in chatMessages" 
            :key="idx"
            class="message-item"
            :class="{ 'msg-me': msg.sender === 'me', 'msg-other': msg.sender === 'other' }"
          >
            <!-- 消息头像 -->
            <el-avatar :size="40" class="message-avatar">
              <img :src="msg.avatar" :alt="msg.sender" class="avatar-img" />
            </el-avatar>
            
            <!-- 消息气泡 -->
            <div class="message-bubble">
              <!-- 发送者名称 -->
              <div class="bubble-sender">
                <!-- {{ msg.sender === 'me' ? '我' : '对方' }} -->
                {{ msg.name }}
                <span class="bubble-time">{{ formatTime(msg.timestamp) }}</span>
              </div>
              
              <!-- 消息内容 - 文本或语音 -->
              <div v-if="msg.type === 'text'" class="bubble-content">{{ msg.content }}</div>
              
              <!-- 语音消息播放器 -->
              <div v-if="msg.type === 'voice'" class="voice-player">
                <el-button 
                  class="voice-btn" 
                  :class="{ 'playing': isPlaying && playingId === msg.id }"
                  @click="toggleVoicePlay(msg.id, msg.audioUrl)"
                  size="small"
                  circle
                >
                  <el-icon v-if="!(isPlaying && playingId === msg.id)" :size="40" color="#992813">
                    <VideoPlay />
                  </el-icon>
                  <el-icon v-if="isPlaying && playingId === msg.id" :size="40" color="#992813">
                    <VideoPause />
                  </el-icon>
                </el-button>
                
                <div class="voice-progress-container">
                  <div 
                    class="voice-progress-bar"
                    :style="{ width: getVoiceProgress(msg.id) }"
                  ></div>
                </div>
                
                <span class="voice-duration">{{ formatDuration(msg.duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息输入区（带语音功能） -->
        <div class="chat-input-area">
          <!-- 输入框：支持回车发送 -->
          <el-input
            v-model="inputMessage"
            placeholder="输入消息内容..."
            class="input-main"
            :rows="2"
            type="textarea"
            @keyup.enter.prevent="sendMessage"
            clearable
          ></el-input>
          
          <!-- 发送按钮 -->
          <el-button 
            type="primary" 
            class="btn-send"
            color="#BD192E"
            @click="sendMessage"
            :disabled="!canSendMessage"
          >
            <span style="color: #fff;">发送</span>
          </el-button>
        </div>
      </el-col>

      <!-- 右侧面板：对方形象（可折叠） -->
      <!-- <el-col :span="6" class="panel right-panel" :class="{ 'collapsed': isRightCollapsed }">
        <div class="panel-toggle" @click="toggleRightPanel">
          <el-icon v-if="isRightCollapsed">
            <ArrowRight />
          </el-icon>
          <el-icon v-else>
            <ArrowLeft />
          </el-icon>
        </div>

        <div class="panel-inner" v-if="!isRightCollapsed">          
          <div class="avatar-current">
            <img 
              style="width: 200px;height: 300px;"
              :src="selectedOtherAvatar.url" 
              :alt="selectedOtherAvatar.name" 
              class="avatar-img"
            />
            <p class="avatar-name">{{ selectedOtherAvatar.name }}</p>
          </div>
          
          <div class="avatar-selector">
            <h4 class="selector-title">更换电影演员</h4>
            <div class="avatar-list">
              <el-avatar 
                :size="60" 
                v-for="(avatar, idx) in otherAvatarList" 
                :key="idx"
                :class="{ 'avatar-selected': selectedOtherIdx === idx }"
                @click="selectOtherAvatar(idx)"
              >
                <img :src="avatar.url" :alt="avatar.name" class="avatar-img" />
              </el-avatar>
            </div>
          </div>
        </div>
      </el-col> -->
    </el-row>

    <!-- 录音中提示 -->
    <div v-if="isRecording" class="recording-toast">
      <el-icon class="toast-icon"><Microphone /></el-icon>
      <div class="toast-content">
        <p>正在录音...</p>
        <p class="recording-time">{{ formatDuration(recordingDuration) }}</p>
      </div>
      <p class="toast-tip">松开发送，上滑取消</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
// 女士
import ruanlingyu from '@/assets/charactors/ruanlingyu.jpg'
import xulai from '@/assets/charactors/xulai.jpg'
import chenyanyan from '@/assets/charactors/chenyanyan.jpg'
import yeqiuxin from '@/assets/charactors/yeqiuxin.jpg'
import chenyumei from '@/assets/charactors/chenyumei.jpg'

// 男士
import wo from '@/assets/charactors/wo.png'
import zhengxiaoqiu from '@/assets/charactors/zhengxiaoqiu.jpg'
import zhengqiu from '@/assets/charactors/zhengqiu.jpg'
import zhegnjunli from '@/assets/charactors/zhegnjunli.jpg'
import zhouboxun from '@/assets/charactors/zhouboxun.jpg'
import meixi from '@/assets/charactors/meixi.jpg'
import yuanmuzhi from '@/assets/charactors/yuanmuzhi.jpg'

// 导演
import wangping from '@/assets/charactors/wangping.jpg'
import huangshuqing from '@/assets/charactors/huangshuqing.jpg'

// 语音
import ruanlingyuAudio from '@/assets/audio/ruanlingyu1.mp3'
 

// ======================== 1. 头像数据（支持GIF链接） ========================
// 女角色列表
const otherAvatarList = ref([
  { name: '阮玲玉', url: ruanlingyu },
  { name: '徐来', url: xulai },
  { name: '陈燕燕', url: chenyanyan },
  { name: '叶秋心 ', url: yeqiuxin },
  { name: '陈玉梅', url: chenyumei },
  { name: '袁牧之', url: yuanmuzhi },
  { name: '梅熹', url: meixi },
  // { name: '郑君里', url: zhegnjunli },
  { name: '郑正秋', url: zhengqiu},
  // { name: '周伯勋', url: zhouboxun},
  { name: '黄蜀芹', url: huangshuqing},
  { name: '王苹', url: wangping},
])

// 男角色列表
// const otherAvatarList = ref([
//   { name: '袁牧之', url: yuanmuzhi },
//   { name: '梅熹', url: meixi },
//   { name: '郑小秋', url: zhengxiaoqiu},
//   { name: '郑君里', url: zhegnjunli },
//   { name: '周伯勋', url: zhouboxun},
//   { name: '我', url: wo },
// ])

// 选中的头像状态
// const selectedMyIdx = ref(0)
const selectedOtherIdx = ref(0)
// const selectedMyAvatar = ref(myAvatarList.value[0])
const selectedOtherAvatar = ref(otherAvatarList.value[0])

// ======================== 2. 聊天核心数据 ========================
// 输入框内容
const inputMessage = ref('')
// 聊天消息列表
const chatMessages = ref([
  {
    id: 1,
    sender: 'other',
    type: 'text',
    name: '阮玲玉',
    content: '阿拉阮玲玉呀，是粤地生来沪上长的苦囡。听到侬从百年后来寻我...真格像拍影戏一样呀。',
    timestamp: Date.now() - 1000 * 60,
    avatar: selectedOtherAvatar.value.url
  },
  {
    id: 2,
    sender: 'other',
    type: 'voice',
    name: '阮玲玉',
    audioUrl: ruanlingyuAudio,
    duration: 3500,
    timestamp: Date.now() - 1000 * 30,
    avatar: selectedOtherAvatar.value.url,
    progress: 0
  }
])
// 聊天内容区DOM引用
const chatContentRef = ref(null)

// 右侧面板折叠状态
const isRightCollapsed = ref(false)

// ======================== 3. 语音消息相关状态 ========================
// 录音状态
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])
const recordingDuration = ref(0)
const recordingTimer = ref(null)

// 播放状态
const audioElements = ref({}) // 存储所有音频元素
const isPlaying = ref(false)
const playingId = ref(null)
const playTimers = ref({}) // 存储播放进度定时器

// ======================== 4. 头像选择逻辑 ========================
// 选择我的形象
// const selectMyAvatar = (idx) => {
//   selectedMyIdx.value = idx
//   selectedMyAvatar.value = myAvatarList.value[idx]
// }

// 选择对方形象
const selectOtherAvatar = (idx) => {
  selectedOtherIdx.value = idx
  selectedOtherAvatar.value = otherAvatarList.value[idx]
}

// 切换右侧面板折叠/展开
const toggleRightPanel = () => {
  isRightCollapsed.value = !isRightCollapsed.value
}

// ======================== 5. 消息发送与处理 ========================
// 能否发送消息（文本不为空或有录音）
let canSendMessage = ref(true)
// const canSendMessage = computed(() => {
//   return inputMessage.value.trim() !== '' || (isRecording.value && recordingDuration.value > 500)
// })

// 发送文本消息
const sendMessage = () => {
  const content = inputMessage.value.trim()
  if (!content) return

  // 添加「我的消息」到列表
  const myMessage = {
    id: Date.now(),
    sender: 'me',
    type: 'text',
    name: '我', // selectedMyAvatar.value.name,
    content,
    timestamp: Date.now(),
    avatar: wo // selectedMyAvatar.value.url
  }
  chatMessages.value.push(myMessage)

  // 清空输入框
  inputMessage.value = ''

  // 自动滚动到最新消息
  scrollToBottom()

  // 模拟对方回复
  simulateOtherReply(content)
}

// 切换语音播放/暂停
const toggleVoicePlay = (id, url) => {
  // 如果点击的是正在播放的音频，则暂停
  if (isPlaying.value && playingId.value === id) {
    pauseAudio(id)
    return
  }
  
  // 停止其他正在播放的音频
  stopAllAudio()
  
  // 开始播放选中的音频
  startAudioPlay(id, url)
}

// 开始播放音频
const startAudioPlay = (id, url) => {
  // 如果没有音频元素，则创建一个
  if (!audioElements.value[id]) {
    const audio = new Audio(url)
    audioElements.value[id] = audio
  }
  
  const audio = audioElements.value[id]
  
  // 开始播放
  audio.play()
  isPlaying.value = true
  playingId.value = id
  
  // 更新进度
  updateVoiceProgress(id, audio)
  
  // 监听播放结束
  audio.onended = () => {
    stopAudio(id)
    // 重置进度
    updateMessageProgress(id, 0)
  }
}

// 暂停音频播放
const pauseAudio = (id) => {
  if (audioElements.value[id]) {
    audioElements.value[id].pause()
    isPlaying.value = false
    
    // 清除进度定时器
    if (playTimers.value[id]) {
      clearInterval(playTimers.value[id])
    }
  }
}

// 停止音频播放
const stopAudio = (id) => {
  if (audioElements.value[id]) {
    audioElements.value[id].pause()
    audioElements.value[id].currentTime = 0
    isPlaying.value = false
    playingId.value = null
    
    // 清除进度定时器
    if (playTimers.value[id]) {
      clearInterval(playTimers.value[id])
    }
  }
}

// 停止所有音频播放
const stopAllAudio = () => {
  if (isPlaying.value && playingId.value) {
    stopAudio(playingId.value)
  }
}

// 更新语音播放进度
const updateVoiceProgress = (id, audio) => {
  // 清除已有的定时器
  if (playTimers.value[id]) {
    clearInterval(playTimers.value[id])
  }
  
  // 创建新的定时器更新进度
  playTimers.value[id] = setInterval(() => {
    if (audio && !audio.paused) {
      const progress = (audio.currentTime / (audio.duration || 1)) * 100
      updateMessageProgress(id, progress)
    }
  }, 100)
}

// 更新消息进度
const updateMessageProgress = (id, progress) => {
  const msgIndex = chatMessages.value.findIndex(msg => msg.id === id)
  if (msgIndex !== -1) {
    chatMessages.value[msgIndex].progress = progress
  }
}

// 获取语音进度百分比
const getVoiceProgress = (id) => {
  const msg = chatMessages.value.find(msg => msg.id === id)
  return `${msg ? msg.progress : 0}%`
}

// 阮玲玉
const ruan_wo = {
}
// 郑正秋
const zheng_wo = {
}

// 模拟对方回复（可能是文本或语音）
const simulateOtherReply = (content) => {
  // 50%概率是语音消息
  const isVoiceReply = Math.random() > 0.5 && false
  
  if (isVoiceReply) {
    // 模拟语音回复
    const voiceUrls = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    ]
    const randomUrl = voiceUrls[Math.floor(Math.random() * voiceUrls.length)]
    const duration = 3000 + Math.random() * 4000 // 3-7秒
    
    const voiceMessage = {
      id: Date.now() + 1,
      sender: 'other',
      type: 'voice',
      name: selectedOtherAvatar.value.name,
      audioUrl: randomUrl,
      duration: duration,
      timestamp: Date.now(),
      avatar: selectedOtherAvatar.value.url,
      progress: 0
    }
    
    setTimeout(() => {
      chatMessages.value.push(voiceMessage)
    }, 1200)
    
    // 存储音频元素
    const audio = new Audio(randomUrl)
    audioElements.value[voiceMessage.id] = audio
  } else {
    let replies = []
    let randomReply = ''
    // const randomReply = replies[Math.floor(Math.random() * replies.length)]
    // 模拟文本回复 content
    // 阮玲玉
    if (selectedOtherAvatar.value.name === '阮玲玉') {
      randomReply = ruan_wo[content]
    }
    // 郑正秋
    else if (selectedOtherAvatar.value.name === '郑正秋') {
      randomReply = zheng_wo[content]
    } else {
      replies = [
      ]
      randomReply = replies[Math.floor(Math.random() * replies.length)]
    }

    
    const textMessage = {
      id: Date.now() + 1,
      sender: 'other',
      type: 'text',
      name: selectedOtherAvatar.value.name,
      content: randomReply,
      timestamp: Date.now(),
      avatar: selectedOtherAvatar.value.url
    }
    
    setTimeout(() => {
      chatMessages.value.push(textMessage)
      scrollToBottom()
    }, 800)
  }
  
  // 回复后滚动到底部
  scrollToBottom()
}

// 滚动到最新消息
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

// 格式化时间（例：14:30）
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化时长（例：01:23）
const formatDuration = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor(ms / (1000 * 60))
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 组件卸载时清理
const cleanupAudio = () => {
  stopAllAudio()
  
  // 释放所有音频URL对象
  Object.values(audioElements.value).forEach(audio => {
    if (audio.src) {
      URL.revokeObjectURL(audio.src)
    }
  })
}

// ======================== 6. 生命周期与监听 ========================
// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom()
  
  // 为已有的语音消息创建音频元素
  chatMessages.value.forEach(msg => {
    if (msg.type === 'voice' && !audioElements.value[msg.id]) {
      audioElements.value[msg.id] = new Audio(msg.audioUrl)
    }
  })
})

// 监听消息列表变化，自动滚动
watch(chatMessages, () => {
  scrollToBottom()
}, { deep: true })

// 组件卸载时清理
// onUnmounted(() => {
//   cleanupAudio()
// })
</script>

<style scoped>
/* 容器整体样式 */
.chat-room-container {
  width: 100%;
  height: calc(100vh - 48px);
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 行容器：占满高度 */
.chat-row {
  height: 100%;
}

/* 面板通用样式 */
.panel {
  height: 100%;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
}

.panel:last-child {
  border-right: none;
  border-left: 1px solid #e5e7eb;
}

.panel-inner {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #fff3e7;
}

/* 左侧面板样式 */
.left-panel {
  background-color: #fff;
}

/* 右侧面板样式（支持折叠） */
.right-panel {
  background-color: #fff;
  position: relative;
  transition: all 0.3s ease;
}

/* 右侧面板折叠状态 */
.right-panel.collapsed {
  width: 50px !important;
}

.right-panel.collapsed .panel-inner {
  display: none;
}

/* 右侧折叠/展开按钮 */
.panel-toggle {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: #409eff;
  color: #fff;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

/* 面板标题 */
/* .panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
} */

/* 头像样式 */
.avatar-current {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0px;
}

.avatar-main {
  border: 3px solid #409eff;
  margin-bottom: 12px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  /* border-radius: 50%; */
}

.avatar-name {
  font-size: 22px;
  color: #772424;
  margin: 0;
}

/* 头像选择器 */
.avatar-selector {
  flex: 1;
  overflow-y: auto;
}

.selector-title {
  font-size: 14px;
  color: #992813;
  margin-bottom: 16px;
  font-weight: 500;
  text-align: center;
}

.avatar-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

/* 选中的头像高亮 */
.avatar-selected {
  border: 2px solid #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 中间聊天面板样式 */
.middle-panel {
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

/* 聊天标题栏 */
.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #caad9d;
}

.header-icon {
  color: #409eff;
  font-size: 20px;
}

.header-title {
  font-size: 18px;
  color: #fff;
  margin: 0;
}

/* 聊天内容区 */
.chat-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #fff;
  box-sizing: border-box;
}

/* 无消息提示 */
.chat-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
}

/* 消息项样式 */
.message-item {
  display: flex;
  margin-bottom: 20px;
  max-width: 80%;
}

/* 我的消息（右对齐） */
.msg-me {
  margin-left: auto;
  flex-direction: row-reverse;
}

/* 消息头像 */
.message-avatar {
  margin-right: 12px;
}

.msg-me .message-avatar {
  margin-right: 0;
  margin-left: 12px;
}

/* 消息气泡 */
.message-bubble {
  background-color: #992813;
  border-radius: 18px;
  padding: 12px 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  max-width: calc(100% - 172px);
}

/* 我的消息气泡样式 */
.msg-me .message-bubble {
  background-color: #627b75;
  color: #fff;
}

/* 气泡内发送者和时间 */
.bubble-sender {
  font-size: 12px;
  color: #fff;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
}

.msg-me .bubble-sender {
  color: rgba(255, 255, 255, 1);
}

.bubble-time {
  font-size: 11px;
}

/* 气泡内容 */
.bubble-content {
  font-size: 14px;
  line-height: 1.5;
  color: #fff;
}

/* 语音播放器样式 */
.voice-player {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  min-width: 200px;
}

.voice-btn {
  background-color: #f0f2f5 !important;
  color: #409eff !important;
  width: 32px !important;
  height: 32px !important;
}

.voice-btn.playing {
  background-color: #e6f7ff !important;
}

.msg-me .voice-btn {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.msg-me .voice-btn.playing {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

.voice-progress-container {
  flex: 1;
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.msg-me .voice-progress-container {
  background-color: rgba(255, 255, 255, 0.2);
}

.voice-progress-bar {
  height: 100%;
  background-color: #409eff;
  transition: width 0.1s linear;
}

.voice-duration {
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
}

.msg-me .voice-duration {
  color: rgba(255, 255, 255, 0.7);
}

/* 消息输入区（带语音功能） */
.chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  background-color: #fff;
  box-sizing: border-box;
  align-items: flex-end;
}

/* 语音按钮 */
.btn-voice {
  background-color: #f0f2f5 !important;
  color: #666 !important;
  width: 40px !important;
  height: 40px !important;
}

.btn-voice.recording {
  background-color: #fef0f0 !important;
  color: #f56c6c !important;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

/* 输入框 */
.input-main {
  flex: 1;
  border-radius: 8px !important;
  resize: none;
}

/* 发送按钮 */
.btn-send {
  width: 100px;
  height: 100%;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-icon {
  font-size: 14px;
}

/* 录音提示 */
.recording-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.toast-icon {
  font-size: 24px;
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.toast-content {
  text-align: center;
}

.toast-content p {
  margin: 0 0 4px 0;
}

.recording-time {
  font-size: 18px;
  font-weight: bold;
}

.toast-tip {
  font-size: 12px;
  color: #ccc;
  margin: 8px 0 0 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 适配小屏幕 */
@media (max-width: 1200px) {
  .panel.left-panel {
    display: none;
  }
  .el-col:nth-child(2) {
    span: 18 !important;
  }
}

@media (max-width: 768px) {
  .right-panel:not(.collapsed) {
    display: none;
  }
  .el-col:nth-child(2) {
    span: 24 !important;
  }
  .chat-content {
    padding: 16px;
  }
  .chat-input-area {
    padding: 12px 16px;
  }
  .message-item {
    max-width: 90%;
  }
}
</style>

<!-- 引入Element Plus样式 -->
<!-- <style>
@import "https://cdn.jsdelivr.net/npm/element-plus@2.7.0/dist/index.css";
</style> -->
