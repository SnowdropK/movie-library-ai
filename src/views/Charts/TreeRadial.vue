<template>
  <!-- 图表容器：需指定宽高，加载状态通过 ECharts 内置方法控制 -->
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
// 1. 导入核心依赖
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts' // 已安装的 ECharts
import axios from 'axios' // 用于发起 HTTP 请求（替换原 jQuery.get）

// 2. 定义变量：图表容器引用、图表实例
const chartRef = ref(null) // 绑定 DOM 容器
let chartInstance = null // 存储 ECharts 实例，用于后续操作

// 3. 原示例核心配置：数据地址、图表配置项
const ROOT_PATH = 'https://echarts.apache.org/examples' // 原示例数据根路径
const DATA_URL = `${ROOT_PATH}/data/asset/data/flare.json` // 树图数据地址

// 4. 初始化图表函数（封装核心逻辑）
const initChart = async () => {
  // 步骤1：获取 DOM 容器，创建 ECharts 实例
  const chartDom = chartRef.value
  if (!chartDom) return // 防止 DOM 未渲染完成

  chartInstance = echarts.init(chartDom, null, {
    renderer: 'canvas', // 保持原示例的 canvas 渲染模式
    useDirtyRect: false // 禁用脏矩形渲染（兼容原配置）
  })

  // 步骤2：显示加载状态（与原示例一致）
  chartInstance.showLoading()

  try {
    // 步骤3：用 axios 请求数据（替换原 jQuery.get）
    const response = await axios.get(DATA_URL)
    const treeData = response.data // 拿到树图的数据源（flare.json）

    // 步骤4：隐藏加载状态，设置图表配置项（完全迁移原示例的 option）
    chartInstance.hideLoading()
    const chartOption = {
      tooltip: {
        trigger: 'item', // 触发方式：鼠标悬浮到节点上
        triggerOn: 'mousemove' // 触发时机：鼠标移动
      },
      series: [
        {
          type: 'tree', // 图表类型：树图
          data: [treeData], // 数据源（原示例需包裹成数组）
          top: '18%', // 图表顶部距离容器的距离
          bottom: '14%', // 图表底部距离容器的距离
          layout: 'radial', // 布局方式：径向（核心配置，实现环形树图）
          symbol: 'emptyCircle', // 节点符号：空心圆
          symbolSize: 7, // 节点大小
          initialTreeDepth: 3, // 初始展开的树深度
          animationDurationUpdate: 750, // 更新动画时长
          emphasis: {
            focus: 'descendant' // 高亮时：聚焦当前节点的所有后代节点
          }
        }
      ]
    }

    // 步骤5：渲染图表
    chartInstance.setOption(chartOption)

    // 步骤6：监听窗口 resize（自适应图表尺寸）
    window.addEventListener('resize', handleResize)

  } catch (error) {
    // 异常处理：加载失败时提示
    chartInstance.hideLoading()
    console.error('获取树图数据失败：', error)
    alert('图表数据加载失败，请刷新重试')
  }
}

// 5. 窗口 resize 处理函数（安全调用，避免实例不存在时报错）
const handleResize = () => {
  chartInstance?.resize()
}

// 6. Vue3 生命周期钩子：组件挂载后初始化图表
onMounted(() => {
  initChart()
})

// 7. Vue3 生命周期钩子：组件卸载时清理资源（防止内存泄漏）
onUnmounted(() => {
  // 移除 resize 事件监听
  window.removeEventListener('resize', handleResize)
  // 销毁 ECharts 实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
/* 关键：确保图表容器有明确的宽高（原示例依赖 body 100% 高度） */
.chart-container {
  width: 100%;
  height: 100vh; /* 占满整个视口高度，可根据需求调整（如 800px） */
  margin: 0; /* 清除默认边距 */
}
</style>