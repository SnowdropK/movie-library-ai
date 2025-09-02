<template>
  <!-- 图表容器：需指定明确宽高（继承父容器100%高度） -->
  <div class="chart-wrapper">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
// 1. 导入依赖
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts' // 导入已安装的 ECharts

// 2. 获取图表容器 DOM 引用
const chartContainer = ref(null)
// 存储图表实例（用于后续销毁和resize）
let chartInstance = null

// 3. 迁移原代码中的配置项和数据 '#FFAE57' 
const colors = ['#FFAE57', '#FF7853', '#EA5151', '#CC3F57', '#9A2555']
const bgColor = '#fff3e7'
const itemStyle = {
  star5: { color: colors[0] },
  star4: { color: colors[1] },
  star3: { color: colors[2] },
  star2: { color: colors[3] }
}

// 原始数据（直接迁移）
const data = [
  {
    name: '历史',
    itemStyle: { color: colors[1] },
    children: [
      {
        name: '社会',
        children: [
          { name: '5☆', children: [{ name: '林则徐' }, { name: '悲情城市' }] },
          { name: '4☆', children: [{ name: '孤儿救祖记' }, { name: '天女散花' }, { name: '定军山' }] },
          { name: '3☆', children: [{ name: '盲孤女' }] }
        ]
      },
      {
        name: '感情',
        children: [
          { name: '5☆', children: [{ name: '芙蓉镇' }, { name: '霸王别姬' }] },
          { name: '4☆', children: [{ name: '天云山传奇' }] },
          { name: '3☆', children: [{ name: '末代皇帝' }] }
        ]
      }
    ]
  },
  {
    name: '剧情片',
    itemStyle: { color: colors[2] },
    children: [
      {
        name: '文学改编',
        children: [
          { name: '5☆', children: [{ name: '《林家铺子》' }] },
          { name: '4☆', children: [{ name: '《骆驼祥子》' }, { name: '《祝福》' }] },
          { name: '3☆', children: [{ name: '《三毛流浪记》' }] }
        ]
      },
      {
        name: '乡土',
        children: [
          { name: '5☆', children: [{ name: '《活着》' }] },
          { name: '4☆', children: [{ name: '《红高粱》' }, { name: '《黄土地》' }] },
          // { name: '3☆', children: [{ name: '疯癫与文明' }] }
        ]
      },
      {
        name: '爱情',
        children: [
          { name: '5☆', children: [{ name: '《神女》' }] },
          { name: '4☆', children: [{ name: '《马路天使》' }, { name: '《早春二月》' }] },
          { name: '3☆', children: [{ name: '《庐山恋》' }] }
        ]
      },
      // {
      //   name: '居家',
      //   children: [{ name: '4☆', children: [{ name: '把房子住成家' }, { name: '只过必要生活' }, { name: '北欧简约风格' }] }]
      // },
      {
        name: '儿童',
        children: [
          { name: '5☆', children: [{ name: '《大闹天宫》' }] },
          { name: '4☆', children: [{ name: '《哪吒闹海》' }, { name: '《天书奇谭》' }] },
          { name: '3☆', children: [{ name: '《城南旧事》' }] },
          { name: '2☆', children: [{ name: '《三毛流浪记》' }] }
        ]
      },
      // {
      //   name: '哲学',
      //   children: [{ name: '4☆', children: [{ name: '人生的智慧' }] }]
      // },
      {
        name: '武侠',
        children: [
          { name: '5☆', children: [{ name: '《卧虎藏龙》' }] },
          { name: '4☆', children: [{ name: '《侠女》' }] }
        ]
      }
    ]
  }
]

// 4. 迁移原代码的数据处理逻辑（星级样式和数值计算）
const processChartData = () => {
  for (let j = 0; j < data.length; ++j) {
    const level1 = data[j].children
    for (let i = 0; i < level1.length; ++i) {
      const block = level1[i].children
      const bookScore = []
      let bookScoreId

      for (let star = 0; star < block.length; ++star) {
        // 处理星级样式
        const style = (() => {
          switch (block[star].name) {
            case '5☆':
              bookScoreId = 0
              return itemStyle.star5
            case '4☆':
              bookScoreId = 1
              return itemStyle.star4
            case '3☆':
              bookScoreId = 2
              return itemStyle.star3
            case '2☆':
              bookScoreId = 3
              return itemStyle.star2
            default:
              return {}
          }
        })()

        // 设置标签样式
        block[star].label = {
          color: style.color,
          downplay: { opacity: 0.5 }
        }

        // 处理子项（书籍）的数值和样式
        if (block[star].children) {
          const childStyle = { opacity: 1, color: style.color }
          block[star].children.forEach(book => {
            book.value = 1
            book.itemStyle = childStyle
            book.label = { color: childStyle.color }

            // 计算评分权重
            let value = 1
            if (bookScoreId === 0 || bookScoreId === 3) value = 5

            // 累计评分数据
            if (bookScore[bookScoreId]) {
              bookScore[bookScoreId].value += value
            } else {
              bookScore[bookScoreId] = { color: colors[bookScoreId], value }
            }
          })
        }
      }

      // 设置一级分类样式
      level1[i].itemStyle = { color: data[j].itemStyle.color }
    }
  }
}

// 5. 初始化图表（Vue3 生命周期：组件挂载后执行）
const initChart = () => {
  // 先处理数据
  processChartData()

  // 创建图表实例
  chartInstance = echarts.init(chartContainer.value, null, {
    renderer: 'canvas', // 渲染模式：canvas（默认）
    useDirtyRect: false // 禁用脏矩形渲染（兼容旧版本）
  })

  // 图表配置项（直接迁移原option）
  const option = {
    backgroundColor: bgColor,
    color: colors,
    series: [
      {
        type: 'sunburst', // 旭日图类型
        center: ['50%', '48%'], // 图表中心位置
        data: data,
        // 排序规则
        sort: (a, b) => {
          if (a.depth === 1) {
            return b.getValue() - a.getValue()
          } else {
            return a.dataIndex - b.dataIndex
          }
        },
        label: { rotate: 'radial', color: bgColor },
        itemStyle: { borderColor: bgColor, borderWidth: 2 },
        // 层级配置
        levels: [
          {}, // 第0层（默认配置）
          { r0: 0, r: 40, label: { rotate: 0 } }, // 第1层
          { r0: 40, r: 105 }, // 第2层
          {
            r0: 115,
            r: 140,
            itemStyle: { shadowBlur: 2, shadowColor: colors[2], color: 'transparent' },
            label: { rotate: 'tangential', fontSize: 10, color: colors[0] }
          },
          {
            r0: 140,
            r: 145,
            itemStyle: { shadowBlur: 80, shadowColor: colors[0] },
            label: { position: 'outside', textShadowBlur: 5, textShadowColor: '#fff' },
            downplay: { label: { opacity: 0.5 } }
          }
        ]
      }
    ]
  }

  // 渲染图表
  chartInstance.setOption(option)

  // 监听窗口resize：自适应图表尺寸
  window.addEventListener('resize', handleResize)
}

// 6. 窗口resize处理函数
const handleResize = () => {
  chartInstance?.resize() // 安全调用：实例存在时才执行
}

// 7. Vue3 生命周期钩子
onMounted(() => {
  // 确保DOM渲染完成后再初始化图表
  if (chartContainer.value) {
    initChart()
  }
})

onUnmounted(() => {
  // 组件卸载时清理资源（防止内存泄漏）
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose() // 销毁图表实例
    chartInstance = null
  }
})
</script>

<style scoped>
/* 关键：确保图表容器有明确尺寸 */
.chart-wrapper {
  width: 100%;
  height: 560px; /* 占满视口高度，可根据需求调整（如800px） */
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>