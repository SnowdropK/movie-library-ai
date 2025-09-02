<template>
  <div class="homepage-container">
    <!-- 视频背景 -->
    <div class="video-background">
      <video 
        autoplay 
        muted 
        loop 
        playsinline
        class="fullscreen-video"
      >
        <!-- 这里替换为你的视频源，建议使用多个格式以兼容不同浏览器 -->
        <source src="@/assets/video/video.mp4" type="video/mp4">
        <!-- 视频加载失败时显示的备用背景 -->
        <div class="fallback-background"></div>
      </video>
      <!-- 视频遮罩层，增强文字可读性 -->
      <div class="video-overlay"></div>
    </div>
    
    <!-- 中央标题 -->
    <div class="center-content">
      <h1 class="main-title" style="font-size: 60px;">影·史—中国与电影的两个甲子</h1>
      <!-- <p class="subtitle">中国与电影的两个甲子</p> -->
      <!-- <p style="color:#fff;margin-bottom: 5px; font-size: 40px;">中国与电影的两个甲子</p> -->
      <p class="subtitle2" style="margin-top: 40px;">第十届上海图书馆开放数据竞赛作品</p>
      <p class="subtitle3">献礼中国电影诞生120周年</p>
      <button class="enter-btn" @click="enterSite">
        探索电影世界
        <i class="fas fa-chevron-right ml-2"></i>
      </button>
    </div>
    
    <!-- 页面底部装饰 -->
    <!-- <div class="page-footer">
      <div class="scroll-indicator">
        <span>向下滚动</span>
        <i class="fas fa-angle-down animate-bounce"></i>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 进入网站的方法
const enterSite = () => {
  // 这里可以替换为你的主页面路由
  router.push('/chat');
};
</script>

<style scoped>
.homepage-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.fullscreen-video {
  object-fit: cover;
  width: 100%;
  height: 100%;
  filter: brightness(0.7);
}

.fallback-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(227, 192, 146, 0.1);
  z-index: 2;
}

.center-content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
}

.main-title {
  font-size: clamp(5rem, 15vw, 10rem);
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1.5s ease forwards 0.5s;
}

.subtitle {
  font-size: clamp(1.2rem, 3.6vw, 1.8rem);
  color: #f0f0f0;
  margin: 20px 0 5px;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1.5s ease forwards 1s;
}
.subtitle2 {
  font-size: clamp(0.8rem, 2.4vw, 1.2rem);
  color: #f0f0f0;
  margin: 5px 0 5px;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1.5s ease forwards 1s;
}
.subtitle3 {
  font-size: clamp(0.8rem, 2.4vw, 1.2rem);
  color: #f0f0f0;
  margin: 5px 0 40px;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1.5s ease forwards 1s;
}

.enter-btn {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 12px 30px;
  font-size: 1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1.5s ease forwards 1.5s;
}

.enter-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.page-footer {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  z-index: 3;
  display: flex;
  justify-content: center;
}

.scroll-indicator {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: fadeIn 1s ease forwards 2s;
}

/* 动画效果 */
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes animate-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-title {
    letter-spacing: 0.05em;
  }
  
  .enter-btn {
    padding: 10px 24px;
  }
}
</style>
    