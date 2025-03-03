---
slug: Vue3自定义指令
title: Vue3自定义指令
authors: [ppnnssy]
tags: [Vue3,自定义指令]
---
官方说：只有当所需功能只能通过直接的 DOM 操作来实现时，才应该使用自定义指令。  
上一个项目中使用了自定义指令控制按钮权限，这里写一下自定义指令的用法。  
<!-- truncate -->
## 创建设置按钮权限的自定义指令
```js
/**
 * v-auth
 * 按钮权限指令
 */

import type { Directive, DirectiveBinding } from "vue";

const auth: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const { value } = binding;
        console.log(value);

        const currentPageRoles = ["add", "delete"]
        if (value instanceof Array && value.length) {
            const hasPermission = value.every(item => currentPageRoles.includes(item));
            if (!hasPermission) el.remove();
        } else {
            if (!currentPageRoles.includes(value)) el.remove();
        }
    }
};

export default auth;
```
上面的代码非常简单，就是创建了一个对象，在里面定义了`mounted`钩子函数。通过钩子函数对el，即使用此指令的元素进行操作。  
函数的参数可以参考官方文档： https://cn.vuejs.org/guide/reusability/custom-directives#introduction  

## 全局挂载 
在main.ts中全局挂载自定义指令  
```js
import auth from '@/directives/index.ts'

const app = createApp(App)
app.directive("auth", auth)
```
## 组件内挂载
组件内挂载只需要引入的时候把对象名命名为v开头的驼峰命名即可。  
```js
import vAuth from '@/directives/index.ts'
```

## 使用
```js
  <button @click="handleClick" v-auth="'add'">点我</button>
  <button @click="cancel" v-auth="'cancel'">取消</button>
```

这样，第一个按钮就能显示，第二个就隐藏了。  

其他的细节操作，都可以在钩子函数中完成

## 多个自定义指令全局挂载
当然可以都导入到main.ts中，然后挨个挂载。但是这样main.ts未免太长。最好封装个函数，挨个挂载。  
```js
import { App, Directive } from "vue";
import auth from "./modules/auth";
import copy from "./modules/copy";
import waterMarker from "./modules/waterMarker";
import draggable from "./modules/draggable";
import debounce from "./modules/debounce";
import throttle from "./modules/throttle";
import longpress from "./modules/longpress";

const directivesList: { [key: string]: Directive } = {
  auth,
  copy,
  waterMarker,
  draggable,
  debounce,
  throttle,
  longpress
};

const directives = {
    // install函数会在app挂载插件的时候执行
  install: function (app: App<Element>) {
    Object.keys(directivesList).forEach(key => {
        // 在app上挨个挂载自定义指令
      app.directive(key, directivesList[key]);
    });
  }
};

export default directives;
```

这里的做法是导入所有指令，然后做成一个插件，在main.ts中全局挂载。  
```js
import directives from "@/directives/index";
// ...
app.use(ElementPlus).use(directives).use(router).use(I18n).use(pinia).mount("#app");
```

或者也可以不使用插件，用比较简单的方法，直接弄个函数：
```js
import type { App } from "vue";
import auth from "./auth";

const serDirectives = (app: App) => {
    app.directive("auth", auth);
    // 有多个自定义指令的话就继续挂载其他指令...
}

export default serDirectives;
```
然后在main.ts中直接调用：  
```js
import serDirectives from "@/directives/index.ts"

const app = createApp(App)
serDirectives(app)
```

这样也可以实现多个自定义指令的挂载。  