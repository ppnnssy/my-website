---
slug: Next+TailwindCss+Sui红包网站
title:  Next+TailwindCss+Sui红包网站
authors: [ppnnssy]
tags: [tailwindcss,Next,Sui]
---
之前抄过一个像素风的红包网站，不过那次重点是像素风，也比较简陋。这次的目标是生产级的，能够真正使用的网站。  
主要的技术是Next.js + TailwindCss + Sui。  
页面设计大部分是抄的，现在还没全抄完，先把做完的写写笔记吧。  
红包网站页面不过，主要还是记录一下开发过程中遇到的问题。  

<!-- truncate -->

## Next搭建项目  
官网： https://nextjs.org/  
直接新建项目：  
`npx create-next-app@latest`  

Next项目中，路由的配置变化比较大，不再是使用Router.js这样的单独文件的方式，而是以文件夹结构为路由结构。这个之前学习的时候学到过。  
每个路由页面都有两个文件，page.js和layout.js，前者是页面内容，后者是布局。  
这个规则比较多，但是不难，参考：  
官网文档：https://nextjs.org/docs/app/getting-started/layouts-and-pages  
掘金教程：https://juejin.cn/post/7296330137284788275  

Next是分服务端渲染和客户端渲染的，当跟链上交互的时候，尤其需要注意。下面的Provider会提到。  

## TailwindCss  
前几天刚写了一篇TailwindCss的文章，实际在项目中使用的时候还是觉得不如Vue直接写CSS。  
不用取类名当然很爽，但是要记tailwind的这么多类名也是很痛苦的。而且打包的css文件大小大多数时候我们并不关心，除非很大的项目对性能要求很高。  
其次，没有语义的类名对维护不友好。  
不过现在海外tailwind大势所趋，很多轮子都是用这个，所以还是得学。  

总结一下使用过程中遇到的问题：
设置背景图，图片URL是个变量，使用拼接字符串不起作用。最后只能写内敛样式表。  


