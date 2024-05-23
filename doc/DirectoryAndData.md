## 项目目录与数据结构

### 项目目录结构
```
├── assets                        // 静态资源
│   ├── fonts                     // 在linefont文件
│   └── styles                    //  picture
│       ├── antd.scss             // antd默认 picture覆盖
│       ├── font.scss             // 在linefont定义
│       ├── global.scss           // 通用全局 picture
│       ├── mixin.scss            // scss全局混入
│       ├── variable.scss         // scss全局变量
│       └── prosemirror.scss      // ProseMirror 富文本默认 picture
├── components                    // 与业务逻辑无关的通用组件
├── configs                       // 配置文件，如：canvas size、font、animation配置、快捷键配置、预置形状、预置line条等数据。
├── hooks                         // 供多个组件（模块）使用的 hooks 方法
├── mocks                         // mocks 数据
├── plugins                       // customize的 Vue 插件
├── types                         // 类型定义文件
├── store                         // Pinia store，参考：https://pinia.vuejs.org/
├── utils                         // 通用的工具方法
└── views                         // 业务组件目录，分为 `编辑器` 和 `播放器` 两个部分。
    ├── components                // 公用的业务组件
    ├── Editor                    // 编辑器模块
    ├── Screen                    // 播放器模块
    └── Mobile                    // 移动端模块
```


### 数据
slideshow的数据主要由 `slides` 和 `theme` 两部分组成。
> 换句话说，在solid际的生产环境中，一般只需要存储这两项数据即可。

- `slides` 表示slideshowpage数据，包括每一页的ID、元素内容、备注、背景、animation、切页方式等信息
- `theme` 表示slideshowtheme 数据，包括背景色、theme 色、fontcolor、font等信息

具体类型的定义可见：[https://github.com/pipipi-pikachu/PPTist/blob/master/src/types/slides.ts](https://github.com/pipipi-pikachu/PPTist/blob/master/src/types/slides.ts)