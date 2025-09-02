<template>
  <div class="simple-rose-chart-container">
    <!-- 图表容器 -->
    <div ref="chartRef" class="chart-wrapper"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import * as echarts from 'echarts'

// 图表容器引用
const chartRef = ref(null)
// ECharts实例
let chartInstance = null

// 初始化图表
const initChart = () => {
  // 确保容器已挂载
  if (!chartRef.value) return

  // 初始化图表实例
  chartInstance = echarts.init(chartRef.value, null, {
    renderer: 'canvas',
    useDirtyRect: false
  })

  // 图表配置项
  const option = {
    legend: {
      top: 'bottom'
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: 'Nightingale Chart',
        type: 'pie',
        radius: [50, 250],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: [
          { value: 40, name: 'rose 1' },
          { value: 38, name: 'rose 2' },
          { value: 32, name: 'rose 3' },
          { value: 30, name: 'rose 4' },
          { value: 28, name: 'rose 5' },
          { value: 26, name: 'rose 6' },
          { value: 22, name: 'rose 7' },
          { value: 18, name: 'rose 8' }
        ]
      }
    ]
  }

  // 设置图表配置
  chartInstance.setOption(option)
}

// 响应窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 组件挂载时初始化图表
onMounted(() => {
  initChart()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 监听容器尺寸变化，重新调整图表大小
watchEffect(() => {
  if (chartInstance && chartRef.value) {
    // 给DOM更新留出时间
    setTimeout(() => {
      chartInstance.resize()
    }, 0)
  }
})
</script>

<style scoped>
.simple-rose-chart-container {
  width: 100%;
  height: 100%;
  min-height: 500px; /* 确保图表有足够的显示空间 */
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}
</style>
