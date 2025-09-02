<script setup lang="ts">
import { computed} from "vue";
import { useRoute } from 'vue-router';
// import HelloWorld from './components/HelloWorld.vue'
import { useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// router.push('/about') // 跳转到 about 页面

const isHome = computed(() => {
  // 匹配根路由（首页），支持带参数的根路由（如"/?id=1"）
  return route.path === '/';
});

const goHome = () => {
  router.push('/');
}
</script>

<template>
  <div id="app">
    <nav v-if="!isHome" class="navbar">
      <!-- 导航内容区：控制宽度 + 水平居中 -->
      <div class="navbar-container">
        <div style="display: flex; align-items: center;color: #fff; cursor: pointer;" @click="goHome">
          <!-- 左侧 Logo -->
          <span style="font-size: 22px;">影·史</span>
          <!-- <a href="@/assets/logo/loading.gif" class="navbar-logo">
            Logo
          </a> -->
          <img src="@/assets/logo/loading.gif" alt="logo" style="margin-left: 6px;width: 32px; height: 32px;">
          <!-- <div style="margin-left: 6px; font-size: 26px;">🎥</div> -->
        </div>

        <!-- 右侧导航菜单 -->
        <ul class="navbar-menu">
          <!-- <li class="navbar-item">
            <a href="/" class="navbar-link">首页</a>
          </li> -->
          <li class="navbar-item">
            <a href="/chat" class="navbar-link">影展</a>
          </li>
          <li class="navbar-item">
            <a href="/chat" class="navbar-link">ai聊天室</a>
          </li>
          <li class="navbar-item">
            <a href="/poster" class="navbar-link">ai电影海报</a>
          </li>
          <li class="navbar-item">
            <a href="/charts" class="navbar-link">电影数据可视化</a>
          </li>
          <li class="navbar-item">
            <a href="/wordCloud" class="navbar-link">词云</a>
          </li>
          <li class="navbar-item">
            <a href="/wordCloud" class="navbar-link">剧照墙</a>
          </li>
          <!-- <li class="navbar-item">
            <a href="/about" class="navbar-link">关于我们</a>
          </li> -->
          <!-- <li class="navbar-item">
            <a href="/contact" class="navbar-link navbar-link--primary">联系我们</a>
          </li> -->
        </ul>
      </div>
    </nav>
    <div :style="isHome ? '' : 'padding-top: 48px;'">
      <!-- 路由内容会在这里渲染 -->
      <router-view />
    </div>
  </div>
</template>

<style scoped>
/* 1. 导航栏核心样式：固定顶部 + 底部阴影 */
.navbar {
  /* 固定在页面顶部，不随滚动消失 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999; /* 确保导航栏在最上层，不被其他内容遮挡 */
  display: flex;
  align-items: center;
  height: 48px;

  /* 导航栏背景（可根据需求修改，如白色/深色） */
  background-color: #772424;

  /* 核心：底部阴影（水平偏移0 + 垂直偏移2px + 模糊6px + 柔和透明度） */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); /* 阴影仅底部显示，柔和不刺眼 */
}

/* 2. 导航内容容器：控制宽度 + 水平居中 */
.navbar-container {
  width: 100%;
  max-width: 1300px; /* 限制最大宽度，避免大屏幕下内容过宽 */
  margin: 0 auto; /* 水平居中 */
  padding: 0 1.5rem; /* 左右内边距，小屏幕不贴边 */

  /* 让 Logo 和 导航菜单 左右分布 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 3. Logo 样式 */
.navbar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a; /* 深色 Logo，对比明显 */
  text-decoration: none; /* 去掉下划线 */
  transition: color 0.3s ease; /* 颜色过渡，提升交互感 */
}

.navbar-logo:hover {
  color: #2563eb; /*  hover 时变色，增强反馈 */
}

/* 4. 导航菜单样式重置与布局 */
.navbar-menu {
  display: flex; /* 横向排列导航项 */
  list-style: none; /* 去掉列表默认圆点 */
  margin: 0;
  padding: 0;
  gap: 2rem; /* 导航项之间的间距 */
}

/* 5. 导航项链接样式 */
.navbar-link {
  font-size: 0.95rem;
  color: #fff; /* 默认文字色，不刺眼 */
  text-decoration: none;
  transition: all 0.3s ease; /* 所有属性过渡，包括颜色和下划线 */
  position: relative; /* 用于 hover 时下划线定位 */
}

/* 导航项 hover 效果：文字变色 + 底部下划线 */
.navbar-link:hover {
  color: #fff; /* 文字变主色 */
}

/* 下划线动画：hover 时从中间向两边展开 */
.navbar-link::after {
  content: "";
  position: absolute;
  bottom: -4px; /* 下划线在文字下方4px */
  left: 50%;
  width: 0;
  height: 2px; /* 下划线高度 */
  background-color: #fff; /* 下划线颜色 */
  transition: all 0.3s ease;
}

.navbar-link:hover::after {
  left: 0;
  width: 100%; /*  hover 时下划线展开为100%宽度 */
}

/* 6. 强调按钮样式（如“联系我们”） */
/* .navbar-link--primary {
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 4px; 
} */

/* .navbar-link--primary:hover {
  background-color: #1d4ed8; 
  color: #ffffff; 
} */

/* 7. 下划线特殊处理：按钮不需要下划线 */
/* .navbar-link--primary::after {
  display: none;
} */

/* 8. 响应式适配：小屏幕（如手机）下导航菜单换行 */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column; /* Logo 在上，菜单在下 */
    gap: 1rem; /* 上下间距 */
  }

  .navbar-menu {
    gap: 1rem; /* 小屏幕下导航项间距缩小 */
    flex-wrap: wrap; /* 超出换行 */
    justify-content: center; /* 换行后居中 */
  }
}
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
