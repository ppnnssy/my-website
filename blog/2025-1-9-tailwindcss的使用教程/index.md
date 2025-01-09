---
slug: tailwindcss学习笔记
title:  tailwindcss学习笔记
authors: [ppnnssy]
tags: [tailwindcss]
---
使用Next的时候建议配合tailwindcss使用，看文档发现一些比较有意思的用法，记录一下。  

为什么使用tailwindcss 
1. 不用取类名，这个真的很友好，我每天写类名都头疼。  
2. CSS文件比较小。因为都是预设好的类，所以生成的CSS文件比较小。  
3. 方便维护。css是全局的，容易造成污染。

那么为什么不直接使用内敛样式呢？官方文档是这么说的：  
使用约束进行设计：这样UI风格一致更容易实现  
响应式设计： 您无法在内联样式中使用媒体查询，但可以使用 Tailwind 的响应式实用程序轻松构建完全响应的界面。  
悬停、聚焦和其他状态： 内联样式无法针对悬停或聚焦等状态，但 Tailwind 的状态变体可以轻松地使用实用程序类来设置这些状态的样式。
 
总之目前tailwindcss是前端开发的大势所趋了，尤其是海外项目。所以学习一下还是很有必要的，而且也不算难  
当然这篇博文并不打算写`h-2`这样的基础应用，而是写写我之前不了解的一些知识点
<!-- truncate -->

## 1. 安装
参考官网：https://www.tailwindcss.cn/docs/installation   
1. 安装tailwindcss：
```
npm install -D tailwindcss
npx tailwindcss init
```

2. 修改tailwind.config.js：
```
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

3. 在全局样式中导入：
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```


## 2. hover，focus等伪类的应用
Tailwind 几乎涵盖了您需要的一切修饰符，其中包括：  

伪类，如:hover、:focus、:first-child和:required  
伪元素，如::before、::after、::placeholder和::selection  
媒体和功能查询，例如响应断点、主题色和prefers-reduced-motion  
属性选择器，例如[dir="rtl"]和[open]  

这些属性也可以堆叠，比如在暗模式下、在中等断点处、在悬停时更改背景颜色：  
`class="dark:md:hover:bg-fuchsia-600 ..."`  

## 3. 表单状态
可以用跟上面差不多的方法为表单的不同状态添加不同的样式，如disabled状态：`disabled:text-slate-500`  
invalid状态：`invalid:text-red-500`  
当然我还是觉得直接用组件比较好用，手写表单状态写出来真的很臃肿，比如官方示例：  
![alt text](image.png)  
看着真的很无语😑  

## 4.根据父状态进行样式设置(group- \{modifier\})
父元素加group，子元素用`group-hover:stroke-white`这种格式改变状态  
官方示例：  
```
<a href="#" class="group block max-w-xs mx-auto rounded-lg p-6 bg-white ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-sky-500 hover:ring-sky-500">
  <div class="flex items-center space-x-3">
    <svg class="h-6 w-6 stroke-sky-500 group-hover:stroke-white" fill="none" viewBox="0 0 24 24"><!-- ... --></svg>
    <h3 class="text-slate-900 group-hover:text-white text-sm font-semibold">New project</h3>
  </div>
  <p class="text-slate-500 group-hover:text-white text-sm">Create a new project from a variety of starting templates.</p>
</a>
```

如果有多层级，如fa1,fa2嵌套，子元素需要分辨哪个父元素触发的，可以给父元素命名：  
```
<ul role="list">
  {#each people as person}
    <li class="group/item hover:bg-slate-100 ...">
      <img src="{person.imageUrl}" alt="" />
      <div>
        <a href="{person.url}">{person.name}</a>
        <p>{person.title}</p>
      </div>
      <a class="group/edit invisible hover:bg-slate-200 group-hover/item:visible ..." href="tel:{person.phone}">
        <span class="group-hover/edit:text-gray-700 ...">Call</span>
        <svg class="group-hover/edit:translate-x-0.5 group-hover/edit:text-slate-500 ...">
          <!-- ... -->
        </svg>
      </a>
    </li>
  {/each}
</ul>
```
li上命名item，a上命名edit，这样就可以区分是哪个父元素触发了。

