<template>
  <div class="word-cloud-container">
    <!-- 词云容器 -->
    <div 
      ref="chartRef" 
      class="word-cloud"
      :style="{ width: `${width}px`, height: `${height}px` }"
    ></div>
    
    <!-- 控制区域 -->
    <div class="controls">
      <button @click="refreshWordCloud" class="refresh-btn">
        刷新词云
      </button>
      <div class="configs">
        <label>
          字体大小范围:
          <input type="number" v-model="minFontSize" min="10" max="30" />-
          <input type="number" v-model="maxFontSize" min="40" max="100" />
        </label>
        
        <label>
          <input type="checkbox" v-model="showRotation" /> 允许旋转
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud'; // 引入词云扩展

// 组件引用
const chartRef = ref(null);

// 词云配置
const minFontSize = ref(12);
const maxFontSize = ref(60);
const showRotation = ref(true);
const width = ref(1200);
const height = ref(500);

// 图表实例
let chartInstance = null;

// 词云数据
const wordData = ref([
  { name: 'Vue3', value: 100 },
  { name: 'JavaScript', value: 80 },
  { name: 'TypeScript', value: 70 },
  { name: '前端开发', value: 65 },
  { name: 'ECharts', value: 60 },
  { name: '词云', value: 55 },
  { name: '组件化', value: 50 },
  { name: 'HTML5', value: 48 },
  { name: 'CSS3', value: 45 },
  { name: 'Vite', value: 42 },
  { name: 'Pinia', value: 40 },
  { name: 'Vue Router', value: 38 },
  { name: '响应式', value: 35 },
  { name: 'Composition API', value: 32 },
  { name: '生命周期', value: 30 },
  { name: '模块化', value: 28 },
  { name: 'Webpack', value: 25 },
  { name: 'ES6+', value: 22 },
  { name: '状态管理', value: 20 },
  { name: '路由', value: 18 },
  { name: '动画', value: 15 },
  { name: '过渡效果', value: 12 },
  { name: '自定义指令', value: 10 },
  { name: '混入', value: 8 },
  { name: '插件', value: 6 },
]);

// 生成随机数据（用于刷新功能）
const generateRandomData = () => {
  return wordData.value.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 80) + 20 // 随机值20-100
  }));
};

// 初始化图表
const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose(); // 销毁已有实例
  }
  
  chartInstance = echarts.init(chartRef.value);
  
  // 设置图表配置
  const option = {
    backgroundColor: '#f9f9f9',
    tooltip: {
      show: true,
      formatter: params => `${params.name}: ${params.value}`
    },
    series: [{
      type: 'wordCloud',
      gridSize: 10, // 词之间的间距
      sizeRange: [minFontSize.value, maxFontSize.value], // 字体大小范围
      rotationRange: showRotation.value ? [-45, 0, 45, 90] : [0], // 旋转角度
      shape: 'circle', // 词云形状
      width: width.value,
      height: height.value,
      drawOutOfBound: false,
      textStyle: {
        color: function() {
          // 随机颜色
          return `rgb(${Math.round(Math.random() * 150)}, ${Math.round(Math.random() * 150)}, ${Math.round(Math.random() * 200)})`;
        },
        emphasis: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: generateRandomData()
    }]
  };
  
  chartInstance.setOption(option);
  
  // 监听窗口大小变化，自动调整图表
  const handleResize = () => {
    chartInstance.resize();
  };
  
  window.addEventListener('resize', handleResize);
  
  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
};

// 刷新词云
const refreshWordCloud = () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{
        data: generateRandomData()
      }]
    });
  }
};

// 监听配置变化，重新初始化图表
watch([minFontSize, maxFontSize, showRotation, width, height], initChart);

// 组件挂载时初始化图表
onMounted(() => {
  // 确保DOM已加载
  setTimeout(initChart, 0);
});

// 组件卸载时销毁图表实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.word-cloud-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.word-cloud {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  padding: 0 10px;
}

.refresh-btn {
  background-color: #4096ff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #6aa8ff;
}

.configs {
  display: flex;
  gap: 20px;
  margin-left: auto;
  align-items: center;
  font-size: 14px;
}

.configs input {
  margin: 0 5px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 60px;
}

.configs input[type="checkbox"] {
  width: auto;
}
</style>
