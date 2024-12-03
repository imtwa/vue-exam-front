## 安装依赖

```bash
pnpm init
```

## 启动项目

```bash
pnpm dev
```

## 打包项目

```bash
pnpm build:(stage|prod)
```

## prettier 修复

```bash
pnpm lint:prettier
```

## 整项目修复

```bash
pnpm lintfix
```

## style 中 deep 使用

- 在 Vue3 版本中针对修改 UI 框架样式采用`>>>`、`/deep/`、`::v-deep`写法已经过时，目前采用`:deep(<inner-selector>)`来处理样式
- 使用 deep 前提是`<style scoped></style>`，使用`scoped`，否则不生效
- 不采用`scoped`的话直接使用类名进行样式处理

## 使用 unocss

- 官网查询地址：[unocss](https://uno.antfu.me/)
- 官网及插件 readme 地址：<https://github.com/unocss/unocss#readme>
- 语法完全兼容 Tailwind CSS 和 Windi CSS

> 使用指南

- 默认是 rem，按照常规浏览器 html 根元素 font-size 默认是 16px，则对应 0.25rem 为 4px，若固定根元素 font-size，可设置 html {font-size: 4px;}，则 mt-1 就是 margin-top: 1px;
- mt-1 指的是 margin-top: 0.25rem；换算成 px 为 margin-top: 4px
- mt-1px 或 mt-[1px] 指的是 margin-top: 1px；固定值

> 使用示例

```html
<!-- bg="xxx" 需使用插件presetAttributify，已集成unocss中 -->
<button
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
<button class="sc-btn mt-10px">unocss shotcuts</button>
```

> **使用自定义 icon**

- _vite.config.ts 中配置_

  ```ts
  Components({
        resolvers: [
          // Auto register icon components
          // 自动注册图标组件
          IconsResolver({
            // prefix: 'i', // 针对所有图标标签前缀,默认是：i
            // enabledCollections: ['ep'],
            customCollections: ['maas'] // 是用于配合自定义图标集合名
          }),
        ]
      }),
      Icons({
        autoInstall: true,
        /**
         * {prefix}-{collection}-{icon}
         * {前缀（默认i）}-{图标集名称（maas）}-{图标名称（iconname）}
         */
        compiler: 'vue3',
        customCollections: {
          // 这里是存放svg图标的文件地址，custom是自定义图标库的名称
          // key as the collection name
          maas: FileSystemIconLoader('./src/assets/svgs', (svg) => {
            return svg.replace(/^<svg /, '<svg fill="currentColor" ')
          })
        },
        iconCustomizer(collection, icon, props) {
          // 对自定义集合中的icon进行默认属性赋值
          // customize all icons in this collection
          if (collection === 'maas') {
            props.width = '1em'
            props.height = '1em'
            props.fill = 'currentColor'
            props['vertical-align'] = 'middle'
          }
        }
      }),

  ```

  - _页面中引入(例如：./src/assets/svgs 文件夹中包含 logo.svg)_

  ```html
  <svg-icon icon-class="logo" />
  ```
