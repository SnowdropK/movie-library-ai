<template>
  <div class="movie-gallery-container">
    <!-- 页面标题 -->
    <!-- <el-page-header content="电影海报照片墙" class="page-header">
      <template #content>
        <h1>电影海报照片墙</h1>
        <p class="header-desc">支持多种布局模式切换，点击海报查看详情</p>
      </template>
    </el-page-header> -->

    <!-- 1. 模式控制区 -->
    <el-card shadow="hover" class="control-card">
      <div class="control-header">
        <el-icon class="control-icon"><LayoutFilled /></el-icon>
        <span class="control-title">布局模式切换</span>
      </div>
      
      <!-- 模式切换按钮组 -->
      <div class="mode-buttons">
        <el-button
          v-for="mode in modeList"
          :key="mode.key"
          :class="{ 
            'mode-btn': true, 
            'active': currentMode === mode.key,
            'disabled': isAnimating 
          }"
          @click="switchMode(mode.key)"
          :disabled="isAnimating"
          size="small"
        >
          <span class="mode-name">{{ mode.name }}</span>
          <!-- <span class="mode-desc">{{ mode.description }}</span> -->
        </el-button>
      </div>
      
      <!-- 模式专属配置（如文字模式的文字输入） -->
      <div class="mode-config" v-if="currentMode === 'text'">
        <el-form :model="textConfig" class="text-config-form">
          <el-form-item label="文字内容" prop="text">
            <el-input
              v-model="textConfig.text"
              placeholder="输入要显示的文字（如 MOVIE）"
              maxlength="8"
              @change="updateTextGallery"
            />
          </el-form-item>
          <el-form-item label="文字大小">
            <el-slider
              v-model="textConfig.fontSize"
              :min="20"
              :max="100"
              :step="2"
              @change="updateTextGallery"
            />
            <span class="slider-value">{{ textConfig.fontSize }}px</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 旋转木马控制（仅旋转木马模式显示） -->
      <div class="carousel-controls" v-if="currentMode === 'carousel'">
        <el-button
          icon="ArrowLeftFilled"
          circle
          size="small"
          @click="prevCarouselItem"
          :disabled="isAnimating"
        />
        <el-button
          icon="ArrowRightFilled"
          circle
          size="small"
          @click="nextCarouselItem"
          :disabled="isAnimating"
        />
        <el-checkbox
          v-model="autoRotate"
          label="自动旋转"
          size="small"
          @change="toggleAutoRotate"
        />
      </div>
    </el-card>

    <!-- 2. 照片墙展示区（根容器绑定全局CSS变量） -->
    <div 
      class="gallery-container"
      :style="{
        '--grid-item-width': `${gridItemWidth}px`,
        '--grid-gap': `${gridGap}px`,
        '--sphere-perspective': `${spherePerspective}px`,
        '--sphere-radius': `${sphereRadius}px`,
        '--text-container-width': `${textContainerWidth}px`,
        '--text-container-height': `${textContainerHeight}px`,
        '--text-item-size': `${textItemSize}px`,
        '--text-item-scale': textItemScale,
        '--spiral-perspective': `${spiralPerspective}px`,
        '--spiral-height': `${spiralHeight}px`,
        '--spiral-radius': `${spiralRadius}px`,
        '--spiral-distance': `${spiralDistance}px`,
        '--waterfall-columns': waterfallColumns,
        '--carousel-perspective': `${carouselPerspective}px`,
        '--carousel-height': `${carouselHeight}px`,
        '--carousel-radius': `${carouselRadius}px`
      }"
    >
      <!-- 网格模式 -->
      <div 
        class="gallery-grid" 
        v-if="currentMode === 'grid'"
      >
        <div 
          v-for="(poster, idx) in posters" 
          :key="poster.id"
          class="grid-item"
          @click="showPosterDetail(poster)"
        >
          <el-card :body-style="{ padding: 0 }" class="poster-card">
            <el-image
              :src="poster.url"
              :alt="poster.title"
              class="poster-img"
              fit="cover"
              @error="handleImageError(poster)"
            />
            <div class="poster-info">
              <h4 class="poster-title">{{ poster.title }}</h4>
              <p class="poster-year">{{ poster.year }}</p>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 球形模式（3D） -->
      <div 
        class="gallery-sphere" 
        v-if="currentMode === 'sphere'"
      >
        <div 
          class="sphere-container"
          :style="{ 
            transform: `rotateX(${sphereRotateX}deg) rotateY(${sphereRotateY}deg)`,
            transition: isAnimating ? 'none' : 'transform 1s ease-in-out'
          }"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        >
          <div 
            v-for="(poster, idx) in posters" 
            :key="poster.id"
            class="sphere-item"
            :style="getSphereItemStyle(idx)"
            @click.stop="showPosterDetail(poster)"
          >
            <el-image
              :src="poster.url"
              :alt="poster.title"
              class="poster-img sphere-img"
              fit="cover"
              @error="handleImageError(poster)"
            />
          </div>
        </div>
      </div>

      <!-- 文字模式 -->
      <div 
        class="gallery-text" 
        v-if="currentMode === 'text'"
      >
        <div 
          v-for="(item, idx) in textModeItems" 
          :key="idx"
          class="text-item"
          :style="{ 
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: `scale(var(--text-item-scale))`,
            zIndex: item.zIndex
          }"
          @click="showPosterDetail(item.poster)"
        >
          <el-image
            :src="item.poster.url"
            :alt="item.poster.title"
            class="poster-img text-img"
            fit="cover"
            @error="handleImageError(item.poster)"
          />
        </div>
      </div>

      <!-- 螺旋模式 -->
      <div 
        class="gallery-spiral" 
        v-if="currentMode === 'spiral'"
      >
        <div class="spiral-container">
          <div 
            v-for="(poster, idx) in posters" 
            :key="poster.id"
            class="spiral-item"
            :style="getSpiralItemStyle(idx)"
            @click="showPosterDetail(poster)"
          >
            <el-image
              :src="poster.url"
              :alt="poster.title"
              class="poster-img spiral-img"
              fit="cover"
              @error="handleImageError(poster)"
            />
          </div>
        </div>
      </div>

      <!-- 瀑布流模式 -->
      <div 
        class="gallery-waterfall" 
        v-if="currentMode === 'waterfall'"
      >
        <div 
          v-for="(poster, idx) in posters" 
          :key="poster.id"
          class="waterfall-item"
          @click="showPosterDetail(poster)"
        >
          <el-card :body-style="{ padding: 0 }" class="poster-card">
            <el-image
              :src="poster.url"
              :alt="poster.title"
              class="poster-img waterfall-img"
              fit="cover"
              @error="handleImageError(poster)"
              :style="{ height: `${getWaterfallItemHeight(idx)}px` }"
            />
            <div class="poster-info">
              <h4 class="poster-title">{{ poster.title }}</h4>
              <p class="poster-year">{{ poster.year }}</p>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 旋转木马模式 -->
      <div 
        class="gallery-carousel" 
        v-if="currentMode === 'carousel'"
      >
        <div 
          class="carousel-container"
          :style="{ 
            transform: `translateZ(calc(-1 * var(--carousel-radius)))`,
            transition: isAnimating ? 'none' : 'transform 0.8s ease-in-out'
          }"
        >
          <div 
            v-for="(poster, idx) in posters" 
            :key="poster.id"
            class="carousel-item"
            :style="getCarouselItemStyle(idx)"
            @click="setCurrentCarouselItem(idx)"
          >
            <el-image
              :src="poster.url"
              :alt="poster.title"
              class="poster-img carousel-img"
              fit="cover"
              @error="handleImageError(poster)"
            />
            <div class="carousel-item-info" :style="{ opacity: isCurrentCarouselItem(idx) ? 1 : 0 }">
              <h4 class="poster-title">{{ poster.title }}</h4>
              <p class="poster-year">{{ poster.year }}</p>
            </div>
          </div>
        </div>
        
        <!-- 旋转木马导航点 -->
        <div class="carousel-dots">
          <span 
            v-for="(poster, idx) in posters" 
            :key="poster.id"
            class="dot"
            :class="{ active: currentCarouselIdx === idx }"
            @click="setCurrentCarouselItem(idx)"
          ></span>
        </div>
      </div>

      <!-- 空状态（无海报数据时） -->
      <div class="gallery-empty" v-if="posters.length === 0">
        <el-icon class="empty-icon"><PictureFilled /></el-icon>
        <p class="empty-text">暂无海报数据</p>
      </div>
    </div>

    <!-- 3. 海报详情弹窗 -->
    <el-dialog
      v-model="isDetailShow"
      title="电影海报详情"
      :width="isMobile ? '90%' : '60%'"
      :before-close="closeDetail"
    >
      <div class="detail-content">
        <div class="detail-img-container">
          <el-image
            :src="currentPoster.url"
            :alt="currentPoster.title"
            class="detail-img"
            fit="contain"
          />
        </div>
        <div class="detail-info">
          <h2 class="detail-title">{{ currentPoster.title }}</h2>
          <div class="detail-meta">
            <span class="meta-item">
              <el-icon size="14"><CalendarFilled /></el-icon>
              {{ currentPoster.year }}
            </span>
            <span class="meta-item">
              <el-icon size="14"><StarFilled /></el-icon>
              {{ currentPoster.rating }}
            </span>
            <span class="meta-item">
              <el-icon size="14"><TagFilled /></el-icon>
              {{ currentPoster.genre }}
            </span>
          </div>
          <div class="detail-desc">
            <h3>剧情简介</h3>
            <p>{{ currentPoster.description }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
// import {
//   LayoutFilled,
//   PictureFilled,
//   ArrowLeftFilled,
//   ArrowRightFilled,
//   CalendarFilled,
//   StarFilled,
//   TagFilled,
//   RefreshFilled
// } from "@element-plus/icons-vue";
// import { ElMessage, ElDialog, ElCard, ElImage, ElButton, ElSlider, ElForm, ElFormItem, ElInput, ElCheckbox } from "element-plus";

// ======================== 1. 基础配置与状态 ========================
// 布局模式列表（key需与代码中模式判断一致）
const modeList = ref([
  { key: "grid", name: "网格模式", description: "整齐网格排列" },
  { key: "sphere", name: "球形模式", description: "3D球形环绕" },
  { key: "text", name: "文字模式", description: "按文字形状排列" },
  { key: "spiral", name: "螺旋模式", description: "3D螺旋轨迹" },
  { key: "waterfall", name: "瀑布流模式", description: "不规则高度排列" },
  { key: "carousel", name: "旋转木马模式", description: "3D环绕旋转" }
]);

// 当前模式
const currentMode = ref("grid");
// 动画状态（防止切换模式时重复点击）
const isAnimating = ref(false);
// 移动端判断
const isMobile = computed(() => window.innerWidth < 768);
// 海报详情弹窗状态
const isDetailShow = ref(false);
const currentPoster = ref({});

// ======================== 2. 电影海报模拟数据 ========================
const posters = ref([
  { id: 1, url: "https://picsum.photos/seed/movie1/300/450", title: "银翼杀手2049", year: "2017", rating: "8.4", genre: "科幻/悬疑", description: "故事发生在2049年，复制人K是一名新一代的银翼杀手，在一次执行任务时，他发现了一个足以颠覆世界的秘密。" },
  { id: 2, url: "https://picsum.photos/seed/movie2/300/450", title: "阿甘正传", year: "1994", rating: "9.5", genre: "剧情/爱情", description: "讲述了先天智障的小镇男孩福雷斯·甘自强不息，最终“傻人有傻福”地得到上天眷顾，在多个领域创造奇迹的励志故事。" },
  { id: 3, url: "https://picsum.photos/seed/movie3/300/450", title: "星际穿越", year: "2014", rating: "9.4", genre: "科幻/冒险", description: "讲述了一队探险家利用他们针对虫洞的新发现，超越人类对于太空旅行的极限，从而开始在广袤的宇宙中进行星际航行的故事。" },
  { id: 4, url: "https://picsum.photos/seed/movie4/300/450", title: "霸王别姬", year: "1993", rating: "9.6", genre: "剧情/爱情", description: "讲述了两位京剧演员半个世纪的悲欢离合，展现了对传统文化、人的生存状态及人性的思考与领悟。" },
  { id: 5, url: "https://picsum.photos/seed/movie5/300/450", title: "这个杀手不太冷", year: "1994", rating: "9.4", genre: "动作/犯罪", description: "讲述了一名职业杀手莱昂无意间搭救了一名全家被杀害的小女孩玛蒂尔达，二人逐渐产生了复杂的感情的故事。" },
  { id: 6, url: "https://picsum.photos/seed/movie6/300/450", title: "千与千寻", year: "2001", rating: "9.4", genre: "动画/奇幻", description: "讲述了少女千寻意外来到神灵异世界后，为了救爸爸妈妈，经历了很多磨难的故事。" },
  { id: 7, url: "https://picsum.photos/seed/movie7/300/450", title: "教父", year: "1972", rating: "9.3", genre: "剧情/犯罪", description: "讲述了以维托·唐·科莱昂为首的黑帮家族的发展过程以及科莱昂的小儿子迈克如何接任父亲成为黑帮首领的故事。" },
  { id: 8, url: "https://picsum.photos/seed/movie8/300/450", title: "哈利波特与魔法石", year: "2001", rating: "9.1", genre: "奇幻/冒险", description: "讲述了自幼父母双亡的孤儿哈利·波特收到魔法学校霍格沃茨的邀请，前去学习魔法，之后遭遇的一系列冒险故事。" },
  { id: 9, url: "https://picsum.photos/seed/movie9/300/450", title: "肖申克的救赎", year: "1994", rating: "9.7", genre: "剧情", description: "讲述了银行家安迪因被误判谋杀妻子及其情人而入狱，在狱中他凭借智慧和毅力，最终逃脱并获得自由的故事。" },
  { id: 10, url: "https://picsum.photos/seed/movie10/300/450", title: "泰坦尼克号", year: "1997", rating: "9.4", genre: "爱情/灾难", description: "讲述了处于不同阶层的两个人穷画家杰克和贵族女露丝抛弃世俗的偏见坠入爱河，最终杰克为了救露丝而牺牲自己的故事。" },
  { id: 11, url: "https://picsum.photos/seed/movie11/300/450", title: "复仇者联盟4", year: "2019", rating: "8.5", genre: "动作/科幻", description: "讲述了在《复仇者联盟3》的毁灭性事件过后，复仇者联盟在剩余盟友的帮助下再一次集结，逆转灭霸的所作所为的故事。" },
  { id: 12, url: "https://picsum.photos/seed/movie12/300/450", title: "蝙蝠侠：黑暗骑士", year: "2008", rating: "9.2", genre: "动作/犯罪", description: "讲述了蝙蝠侠、戈登局长和检察官哈维·登特三人联手与小丑展开斗争，却逐渐发现小丑的阴谋远超他们想象的故事。" },
  { id: 13, url: "https://picsum.photos/seed/movie13/300/450", title: "龙猫", year: "1988", rating: "9.2", genre: "动画/奇幻", description: "讲述了一对姐妹在搬到乡下后，遇到了名叫龙猫的神秘生物，并和它成为朋友的故事。" },
  { id: 14, url: "https://picsum.photos/seed/movie14/300/450", title: "当幸福来敲门", year: "2006", rating: "9.2", genre: "剧情/传记", description: "讲述了一位濒临破产、老婆离家的落魄业务员，如何刻苦耐劳的善尽单亲责任，奋发向上成为股市交易员的励志故事。" },
  { id: 15, url: "https://picsum.photos/seed/movie15/300/450", title: "楚门的世界", year: "1998", rating: "9.3", genre: "剧情/科幻", description: "讲述了楚门是一档热门肥皂剧的主人公，他身边的所有人都是演员，但他本人对此一无所知，最终他发现真相并走出这个虚拟世界的故事。" },
  { id: 16, url: "https://picsum.photos/seed/movie16/300/450", title: "疯狂动物城", year: "2016", rating: "9.2", genre: "动画/冒险", description: "讲述了在一个所有动物和平共处的动物城市，兔子朱迪通过自己努力奋斗完成自己儿时的梦想，成为动物警察的故事。" },
  { id: 17, url: "https://picsum.photos/seed/movie17/300/450", title: "寄生虫", year: "2019", rating: "8.8", genre: "剧情/犯罪", description: "讲述了原本生活在地下室的贫困家庭，通过一系列计谋，逐渐渗透到富人家中工作，却引发了一系列意想不到的事件的故事。" },
  { id: 18, url: "https://picsum.photos/seed/movie18/300/450", title: "黑客帝国", year: "1999", rating: "9.1", genre: "动作/科幻", description: "讲述了一名年轻的网络黑客尼奥发现看似正常的现实世界实际上是由一个名为“矩阵”的计算机人工智能系统控制的，他决定联合其他反抗者一起对抗矩阵的故事。" },
  { id: 19, url: "https://picsum.photos/seed/movie19/300/450", title: "指环王：王者无敌", year: "2003", rating: "9.3", genre: "动作/奇幻", description: "讲述了弗罗多和山姆继续前往魔多销毁魔戒，而 Aragorn 带领人类军队与索伦的军队展开最终决战的故事。" },
  { id: 20, url: "https://picsum.photos/seed/movie20/300/450", title: "飞屋环游记", year: "2009", rating: "9.1", genre: "动画/冒险", description: "讲述了一位名叫卡尔的老人，为了实现与妻子共同的梦想，用无数气球将自己的房子飞上天空，与一位年轻的童子军一起展开冒险的故事。" }
]);

// ======================== 3. 各模式配置与逻辑 ========================
// 3.1 网格模式配置
const gridItemWidth = ref(isMobile.value ? 120 : 180);
const gridGap = ref(16);

// 3.2 球形模式配置与逻辑
const spherePerspective = ref(1200); // 3D透视距离
const sphereRadius = ref(400); // 球半径
const sphereRotateX = ref(-30); // X轴旋转角度（倾斜）
const sphereRotateY = ref(0); // Y轴旋转角度
// 拖拽相关
const isDragging = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);

// 计算球形模式下每个海报的样式
const getSphereItemStyle = (idx) => {
  const count = posters.value.length;
  const angleY = (idx * (360 / count)) % 360; // Y轴角度（环绕）
  const angleX = -15 + Math.sin((idx / count) * Math.PI * 2) * 15; // X轴角度（轻微波动）
  const itemWidth = isMobile.value ? 80 : 120;
  const itemHeight = isMobile.value ? 120 : 180;
  
  return {
    position: "absolute",
    width: `${itemWidth}px`,
    height: `${itemHeight}px`,
    transform: `rotateY(${angleY}deg) rotateX(${angleX}deg) translateZ(${sphereRadius.value}px)`,
    transition: "transform 0.5s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    backfaceVisibility: "hidden",
    left: `calc(50% - ${itemWidth / 2}px)`,
    top: `calc(50% - ${itemHeight / 2}px)`,
    "&:hover": {
      transform: `rotateY(${angleY}deg) rotateX(${angleX}deg) translateZ(${sphereRadius.value + 30}px) scale(1.05)`,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
    }
  };
};

// 拖拽开始
const startDrag = (e) => {
  isDragging.value = true;
  lastMouseX.value = e.clientX;
  lastMouseY.value = e.clientY;
  document.body.style.cursor = "grabbing";
};

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return;
  
  const deltaX = e.clientX - lastMouseX.value;
  const deltaY = e.clientY - lastMouseY.value;
  
  // 更新旋转角度（Y轴随X拖拽变化，X轴随Y拖拽变化）
  sphereRotateY.value += deltaX * 0.5;
  sphereRotateX.value = Math.max(-60, Math.min(30, sphereRotateX.value - deltaY * 0.5));
  
  lastMouseX.value = e.clientX;
  lastMouseY.value = e.clientY;
};

// 拖拽结束
const endDrag = () => {
  isDragging.value = false;
  document.body.style.cursor = "default";
};

// 3.3 文字模式配置与逻辑
const textConfig = ref({
  text: "MOVIE", // 默认文字
  fontSize: isMobile.value ? 40 : 60 // 文字大小
});
const textContainerWidth = ref(800);
const textContainerHeight = ref(400);
const textItemSize = ref(isMobile.value ? 40 : 60); // 文字模式海报大小
const textItemScale = ref(0.9);
const textModeItems = ref([]); // 文字模式下的海报位置数据

// 更新文字模式布局
const updateTextGallery = async () => {
  if (!textConfig.value.text.trim()) {
    textConfig.value.text = "MOVIE";
    ElMessage.warning("文字不能为空，已默认设置为 MOVIE");
  }
  
  isAnimating.value = true;
  textModeItems.value = [];
  
  await nextTick();
  
  // 创建隐藏的canvas用于计算文字像素
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = textContainerWidth.value;
  canvas.height = textContainerHeight.value;
  
  // 设置文字样式
  ctx.font = `bold ${textConfig.value.fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  
  // 绘制文字
  ctx.fillText(textConfig.value.text, canvas.width / 2, canvas.height / 2);
  
  // 扫描像素点，记录有文字的位置
  const pixelStep = Math.max(1, Math.floor(textItemSize.value / 2)); // 扫描步长
  const positions = [];
  
  for (let y = 0; y < canvas.height; y += pixelStep) {
    for (let x = 0; x < canvas.width; x += pixelStep) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      // 存在非透明像素（文字区域）
      if (pixel[3] > 100) {
        positions.push({ x, y, zIndex: Math.floor(Math.random() * 10) });
      }
    }
  }
  
  // 分配海报到文字位置（如果位置多于海报，循环分配）
  const validPositions = positions.slice(0, posters.value.length);
  textModeItems.value = validPositions.map((pos, idx) => ({
    ...pos,
    poster: posters.value[idx % posters.value.length]
  }));
  
  isAnimating.value = false;
};

// 3.4 螺旋模式配置与逻辑
const spiralPerspective = ref(1000);
const spiralHeight = ref(isMobile.value ? 400 : 600);
const spiralRadius = ref(isMobile.value ? 150 : 250); // 螺旋半径
const spiralStep = ref(20); // 每步角度增量（度）
const spiralDistance = ref(isMobile.value ? 8 : 12); // 每步距离增量（px）

// 计算螺旋模式下每个海报的样式
const getSpiralItemStyle = (idx) => {
  const angle = (idx * spiralStep.value * Math.PI) / 180; // 弧度
  const distance = idx * spiralDistance.value; // 距离中心的距离
  // 螺旋坐标计算
  const x = Math.cos(angle) * spiralRadius.value;
  const y = Math.sin(angle) * spiralRadius.value;
  const z = spiralHeight.value / 2 - distance; // Z轴位置（从下到上）
  const itemWidth = isMobile.value ? 60 : 100;
  const itemHeight = isMobile.value ? 90 : 150;
  
  return {
    position: "absolute",
    width: `${itemWidth}px`,
    height: `${itemHeight}px`,
    left: `calc(50% - ${itemWidth / 2}px)`,
    top: `calc(50% - ${itemHeight / 2}px)`,
    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${180 - angle * 180 / Math.PI}deg)`,
    transition: "transform 0.8s ease, opacity 0.8s ease",
    cursor: "pointer",
    opacity: 0.8,
    backfaceVisibility: "hidden",
    "&:hover": {
      transform: `translate3d(${x}px, ${y}px, ${z + 30}px) rotateY(${180 - angle * 180 / Math.PI}deg) scale(1.1)`,
      opacity: 1,
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)"
    }
  };
};

// 3.5 瀑布流模式配置与逻辑
const waterfallColumns = ref(isMobile.value ? 2 : 4); // 瀑布流列数
const waterfallHeights = ref([]); // 每列的当前高度

// 初始化瀑布流高度
const initWaterfallHeights = () => {
  waterfallHeights.value = Array(waterfallColumns.value).fill(0);
};

// 计算瀑布流每个海报的高度（随机变化，模拟不规则效果）
const getWaterfallItemHeight = (idx) => {
  // 基础高度 + 随机偏移（100-200px）
  return 300 + Math.floor(Math.random() * 150);
};

// 3.6 旋转木马模式配置与逻辑
const carouselPerspective = ref(1200);
const carouselHeight = ref(isMobile.value ? 350 : 500);
const carouselRadius = ref(isMobile.value ? 250 : 400); // 旋转半径
const currentCarouselIdx = ref(0); // 当前显示的海报索引
const autoRotate = ref(true); // 是否自动旋转
const autoRotateTimer = ref(null); // 自动旋转定时器
const autoRotateInterval = ref(5000); // 自动旋转间隔（ms）

// 计算旋转木马每个海报的样式
const getCarouselItemStyle = (idx) => {
  const count = posters.value.length;
  // 计算当前海报与选中海报的角度差
  const offsetIdx = (idx - currentCarouselIdx.value + count) % count;
  const angle = (offsetIdx * (360 / count)) % 360; // 每个海报的角度
  const radian = angle * Math.PI / 180; // 弧度
  const itemWidth = isMobile.value ? 100 : 160;
  const itemHeight = isMobile.value ? 150 : 240;
  
  // 计算3D位置
  const x = Math.sin(radian) * carouselRadius.value;
  const z = Math.cos(radian) * carouselRadius.value;
  // 透明度：当前海报最亮，两侧逐渐变暗
  const opacity = 0.3 + Math.max(0, 1 - Math.abs(offsetIdx) / (count / 2)) * 0.7;
  // 缩放：当前海报最大，两侧逐渐缩小
  const scale = 0.7 + Math.max(0, 1 - Math.abs(offsetIdx) / (count / 2)) * 0.3;
  
  return {
    position: "absolute",
    width: `${itemWidth}px`,
    height: `${itemHeight}px`,
    left: `calc(50% - ${itemWidth / 2}px)`,
    top: `calc(50% - ${itemHeight / 2}px)`,
    transform: `translate3d(${x}px, 0, ${z}px) scale(${scale})`,
    transition: "transform 0.8s ease, opacity 0.8s ease, z-index 0.8s ease",
    cursor: "pointer",
    opacity,
    zIndex: Math.floor(100 - Math.abs(offsetIdx) * 10), // 当前海报z-index最高
    backfaceVisibility: "hidden",
    "&:hover": {
      opacity: Math.min(1, opacity + 0.2),
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
    }
  };
};

// 判断是否为当前显示的海报
const isCurrentCarouselItem = (idx) => {
  return idx === currentCarouselIdx.value;
};

// 设置当前显示的海报
const setCurrentCarouselItem = (idx) => {
  if (isAnimating.value || idx === currentCarouselIdx.value) return;
  
  isAnimating.value = true;
  currentCarouselIdx.value = idx;
  
  // 动画结束后恢复状态
  setTimeout(() => {
    isAnimating.value = false;
  }, 800);
};

// 上一个海报
const prevCarouselItem = () => {
  const count = posters.value.length;
  setCurrentCarouselItem((currentCarouselIdx.value - 1 + count) % count);
};

// 下一个海报
const nextCarouselItem = () => {
  const count = posters.value.length;
  setCurrentCarouselItem((currentCarouselIdx.value + 1) % count);
};

// 切换自动旋转
const toggleAutoRotate = () => {
  if (autoRotate.value) {
    startAutoRotate();
  } else {
    clearInterval(autoRotateTimer.value);
  }
};

// 开始自动旋转
const startAutoRotate = () => {
  clearInterval(autoRotateTimer.value);
  if (!autoRotate.value) return;
  
  autoRotateTimer.value = setInterval(() => {
    nextCarouselItem();
  }, autoRotateInterval.value);
};

// ======================== 4. 通用功能逻辑 ========================
// 切换布局模式
const switchMode = async (modeKey) => {
  if (currentMode.value === modeKey || isAnimating.value) return;
  
  isAnimating.value = true;
  currentMode.value = modeKey;
  
  // 模式切换时的初始化操作
  switch (modeKey) {
    case "text":
      await updateTextGallery();
      break;
    case "waterfall":
      initWaterfallHeights();
      break;
    case "carousel":
      if (autoRotate.value) {
        startAutoRotate();
      }
      break;
    default:
      break;
  }
  
  // 等待DOM更新和动画结束
  await nextTick();
  setTimeout(() => {
    isAnimating.value = false;
  }, 500);
};

// 显示海报详情
const showPosterDetail = (poster) => {
  currentPoster.value = poster;
  isDetailShow.value = true;
};

// 关闭海报详情
const closeDetail = () => {
  isDetailShow.value = false;
  currentPoster.value = {};
};

// 处理图片加载失败
const handleImageError = (poster) => {
  // 加载失败时使用默认图片
  poster.url = "https://picsum.photos/seed/default/300/450";
  ElMessage.warning(`海报 ${poster.title} 加载失败，已使用默认图片`);
};

// 窗口大小变化时更新配置
const handleResize = () => {
  const mobile = window.innerWidth < 768;
  
  // 更新移动端相关配置
  if (mobile !== isMobile.value) {
    gridItemWidth.value = mobile ? 120 : 180;
    sphereRadius.value = mobile ? 300 : 400;
    textConfig.value.fontSize = mobile ? 40 : 60;
    textItemSize.value = mobile ? 40 : 60;
    spiralRadius.value = mobile ? 150 : 250;
    spiralDistance.value = mobile ? 8 : 12;
    waterfallColumns.value = mobile ? 2 : 4;
    carouselRadius.value = mobile ? 250 : 400;
    carouselHeight.value = mobile ? 350 : 500;
    
    // 重新初始化相关模式
    if (currentMode.value === "text") {
      updateTextGallery();
    } else if (currentMode.value === "waterfall") {
      initWaterfallHeights();
    }
  }
};

// ======================== 5. 生命周期 ========================
onMounted(() => {
  // 初始化模式
  switchMode(currentMode.value);
  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);
  // 启动旋转木马自动旋转
  if (currentMode.value === "carousel" && autoRotate.value) {
    startAutoRotate();
  }
});

onUnmounted(() => {
  // 清除定时器和事件监听
  clearInterval(autoRotateTimer.value);
  window.removeEventListener("resize", handleResize);
});

// 监听海报数据变化，重新初始化模式
// watch(posters, () => {
//   switchMode(currentMode.value);
// }, { deep: true });
</script>

<style scoped>
/* 全局容器 */
.movie-gallery-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.header-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

/* 控制区卡片 */
.control-card {
  margin-bottom: 24px;
  border-radius: 12px !important;
}

.control-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.control-icon {
  color: #409eff;
}

/* 模式切换按钮组 */
.mode-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 8px !important;
  background-color: #fff;
  border: 1px solid #e4e7ed !important;
  color: #606266 !important;
  transition: all 0.3s ease;
  min-width: 120px;
}

.mode-btn.active {
  background-color: #e6f7ff !important;
  border-color: #409eff !important;
  color: #409eff !important;
}

.mode-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
}

/* 模式专属配置 */
.mode-config {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.text-config-form {
  max-width: 500px;
  margin: 0 auto;
}

.slider-value {
  display: inline-block;
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

/* 旋转木马控制按钮 */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

/* 照片墙展示区 */
.gallery-container {
  position: relative;
  width: 100%;
  min-height: 500px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

/* 网格模式 */
.gallery-grid {
  display: grid;
  width: 100%;
  /* 引用CSS变量：网格列宽和间距 */
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-item-width), 1fr));
  gap: var(--grid-gap);
}

.grid-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

/* 球形模式 */
.gallery-sphere {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  /* 引用CSS变量：3D透视 */
  perspective: var(--sphere-perspective);
}

.sphere-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.sphere-item {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-style: preserve-3d;
}

/* 文字模式 */
.gallery-text {
  position: relative;
  margin: 0 auto;
  min-height: 400px;
  /* 引用CSS变量：容器宽高 */
  width: var(--text-container-width);
  height: var(--text-container-height);
}

.text-item {
  position: absolute;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: var(--text-item-size);
  height: calc(var(--text-item-size) * 1.5); /* 海报宽高比 2:3 */
}

.text-item:hover {
  transform: scale(calc(var(--text-item-scale) * 1.1)) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 100 !important;
}

.text-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 螺旋模式 */
.gallery-spiral {
  position: relative;
  width: 100%;
  /* 引用CSS变量：高度和3D透视 */
  height: var(--spiral-height);
  min-height: 400px;
  perspective: var(--spiral-perspective);
}

.spiral-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.spiral-item {
  position: absolute;
  transform-style: preserve-3d;
}

/* 瀑布流模式 */
.gallery-waterfall {
  /* 引用CSS变量：列数 */
  column-count: var(--waterfall-columns);
  column-gap: 16px;
  width: 100%;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.waterfall-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

/* 旋转木马模式 */
.gallery-carousel {
  position: relative;
  width: 100%;
  /* 引用CSS变量：高度和3D透视 */
  height: var(--carousel-height);
  min-height: 350px;
  perspective: var(--carousel-perspective);
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.carousel-item {
  position: absolute;
  transform-style: preserve-3d;
}

.carousel-item-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  transition: opacity 0.8s ease;
  text-align: center;
}

/* 旋转木马导航点 */
.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dcdfe6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background-color: #409eff;
}

/* 海报卡片通用样式 */
.poster-card {
  border-radius: 8px !important;
  overflow: hidden;
  height: 100%;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.poster-card:hover .poster-img {
  transform: scale(1.05);
}

.poster-info {
  padding: 12px;
  background-color: #fff;
}

.poster-title {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-year {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 空状态 */
.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
}

/* 海报详情弹窗 */
.detail-content {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.detail-img-container {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.detail-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.detail-info {
  flex: 2;
  min-width: 300px;
}

.detail-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 16px 0;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-desc h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.detail-desc p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .gallery-text {
    width: 600px;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .movie-gallery-container {
    padding: 10px;
  }
  
  .mode-buttons {
    justify-content: center;
  }
  
  .mode-btn {
    min-width: 100px;
    padding: 8px 12px;
  }
  
  .gallery-container {
    padding: 10px;
    min-height: 400px;
  }
  
  .detail-content {
    flex-direction: column;
    align-items: center;
  }
  
  .detail-img-container {
    max-width: 100%;
  }
  
  .gallery-text {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .mode-buttons {
    gap: 8px;
  }
  
  .mode-btn {
    min-width: 80px;
    padding: 6px 8px;
  }
  
  .mode-name {
    font-size: 12px;
  }
  
  .mode-desc {
    font-size: 10px;
  }
  
  .carousel-dots {
    bottom: 10px;
  }
}
</style>