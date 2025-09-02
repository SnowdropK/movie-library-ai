<template>
  <!-- 图表容器：设置宽高以确保图表正常显示 -->
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 图表容器引用
const chartRef = ref(null)
// 图表实例
let chartInstance = null;

// 生成随机数据（迁移原示例的逻辑）
const generateData = () => {
  const xAxisData = []
  const data1 = []
  const data2 = []
  const data3 = []
  const data4 = []
  let year = 1900
  
  for (let i = 0; i < 10; i++) {
    year = year + 10
    xAxisData.push(`${year}`)
    data1.push(+(Math.random() * 2).toFixed(2))
    data2.push(+(Math.random() * 5).toFixed(2))
    data3.push(+(Math.random() + 0.3).toFixed(2))
    data4.push(+Math.random().toFixed(2))
  }
  
  return { xAxisData, data1, data2, data3, data4 }
}

// 初始化图表
const initChart = () => {
  // 获取容器并创建实例
  const chartDom = chartRef.value
  if (!chartDom) return
  
  chartInstance = echarts.init(chartDom, null, {
    renderer: 'canvas',
    useDirtyRect: false
  })
  
  // 生成数据
  const { xAxisData, data1, data2, data3, data4 } = generateData()
  
  // 强调样式配置
  const emphasisStyle = {
    itemStyle: {
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.3)'
    }
  }
  
  // 图表配置项（迁移原示例的 option）
  const option = {
    legend: {
      data: ['爱情', '家庭', '喜剧闹剧', '文艺片'],
      left: '10%'
    },
    // 刷子工具配置（核心功能）
    brush: {
      toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
      xAxisIndex: 0
    },
    toolbox: {
      feature: {
        magicType: { type: ['stack'] },
        dataView: {}
      }
    },
    tooltip: {},
    xAxis: {
      data: xAxisData,
      name: 'X Axis',
      axisLine: { onZero: true },
      splitLine: { show: false },
      splitArea: { show: false }
    },
    yAxis: {},
    grid: { bottom: 100 },
    series: [
      {
        name: '爱情',
        type: 'bar',
        stack: 'one',
        emphasis: emphasisStyle,
        data: data1
      },
      {
        name: '家庭',
        type: 'bar',
        stack: 'one',
        emphasis: emphasisStyle,
        data: data2
      },
      {
        name: '喜剧闹剧',
        type: 'bar',
        stack: 'two',
        emphasis: emphasisStyle,
        data: data3
      },
      {
        name: '文艺片',
        type: 'bar',
        stack: 'two',
        emphasis: emphasisStyle,
        data: data4
      }
    ]
  }
  
  // 设置图表配置
  chartInstance.setOption(option)
  
  // 绑定刷子选择事件（迁移原示例的交互逻辑）
  chartInstance.on('brushSelected', (params) => {
    const brushed = []
    const brushComponent = params.batch[0]
    
    for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
      const rawIndices = brushComponent.selected[sIdx].dataIndex
      brushed.push(`[Series ${sIdx}] ${rawIndices.join(', ')}`)
    }
    
    // 更新选中数据的标题显示
    chartInstance.setOption({
      title: {
        backgroundColor: '#333',
        text: `SELECTED DATA INDICES: \n${brushed.join('\n')}`,
        bottom: 0,
        right: '10%',
        width: 100,
        textStyle: {
          fontSize: 12,
          color: '#fff'
        }
      }
    })
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

// 组件挂载时初始化图表
onMounted(() => {
  initChart()
})

// 组件卸载时清理资源
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
/* 确保图表容器有足够的尺寸 */
.chart-container {
  width: 100%;
  height: 560px; /* 可根据需求调整高度 */
  min-height: 560px; /* 最小高度，确保刷子工具正常显示 */
}
</style>
