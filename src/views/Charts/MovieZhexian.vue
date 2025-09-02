<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// 引入 ECharts 核心模块
import * as echarts from 'echarts'

// 获取图表容器 DOM
const chartRef = ref(null)
// 存储图表实例
let chartInstance = null

// 组件挂载后初始化图表
onMounted(() => {
  // 初始化图表实例
  chartInstance = echarts.init(chartRef.value)
  
  // 图表配置项（以折线图为例）
  const option = {
    title: {
      text: '电影发展',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    color: ['#BD192E'],
    xAxis: {
      type: 'category',
      data: ['1905', '1906', '1907', '1908', '1909', '1910', '1911', '1912', '1913', '1914', '1915', '1916', '1917', '1918', '1919', '1920', '1921', '1922', '1923'
      ]
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      name: '电影数量'
    },
    series: [
      {
        data: [1, 0, 0, 2, 1, 0, 2, 3,4,2,3,4,5,6,5,7,10,12,15,15,35,48,54,48,97,130,120,53,43,70,68,45,58,85],
        type: 'line',
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { size: 8 }
      }
    ]
  }
  
  // 设置配置项并渲染图表
  chartInstance.setOption(option)
  
  // 监听窗口大小变化，自动调整图表尺寸
  window.addEventListener('resize', handleResize)
})

// 窗口大小变化时调整图表
const handleResize = () => {
  chartInstance?.resize()
}

// 组件卸载时销毁图表（避免内存泄漏）
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <div class="chart-container">
    <!-- 图表容器（必须指定宽高） -->
    <div ref="chartRef" class="chart" />
  </div>
</template>

<style scoped>
.chart-container {
  padding: 20px;
}

/* 必须指定图表容器的宽高，否则图表不显示 */
.chart {
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
