// 声明所有 .js 模块的类型（避免 TypeScript 报错）
declare module '*.js' {
  const value: any;
  export default value;
}

// 声明 .vue 模块类型，让 TS 识别 .vue 文件
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 泛型参数：Props类型、Emits类型、Slots类型（默认any即可）
  const component: DefineComponent<{}, {}, any>
  export default component
}