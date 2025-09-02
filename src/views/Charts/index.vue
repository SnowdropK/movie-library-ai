<script setup>
// import { ref, onMounted, onUnmounted } from 'vue'
// // 引入 ECharts 核心模块
// import * as echarts from 'echarts'
import SunburstBook from './SunburstBook.vue'
import BarBrush from './BarBrush.vue'
// import TimelineFinance from './TimelineFinance.vue'
// import PieRoseTypeSimple from './PieRoseTypeSimple.vue'
import MovieZhexian from './movieZhexian.vue'
import WordCloud2 from './WordCloud2.vue'


</script>

<template>
  <div style="background-color: #fff3e7;">
    <!-- <WordCloud2 /> -->
    <el-row :gutter="20">
      <el-col :span="12">
        <SunburstBook />
      </el-col>
      <el-col :span="12">
        <BarBrush />
      </el-col>
    </el-row>
    <!-- 图表容器（必须指定宽高） -->
    <div style="margin-top: 20px;">
      <MovieZhexian />
    </div>
  
    <!-- <PieRoseTypeSimple /> -->
  </div>
</template>

<style scoped>
  .box {
    display: grid;
  }
</style>
